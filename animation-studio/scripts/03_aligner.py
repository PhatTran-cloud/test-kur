"""
Stage 0 — Step 3: Align Tags to Frame Numbers

Input:  tagged script (.md) + Whisper timestamps (.json)
Output: annotated.json with BEAT frames aligned to Whisper timestamps

Usage:
    python 03_aligner.py <slug>
    python 03_aligner.py my-video-slug

Expects:
    output/<slug>/tagged-script.md
    output/<slug>/timestamps.json
Produces:
    output/<slug>/annotated.json

Algorithm: For each tag, find the first word's Whisper timestamp,
compute frame = floor(timestamp * FPS). Segment into sections at [SB] boundaries.
"""

import os
import re
import sys
import json
from difflib import SequenceMatcher
from pathlib import Path
from dotenv import load_dotenv

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Load .env from scripts/ directory
load_dotenv(Path(__file__).parent / ".env")

FPS = int(os.getenv("FPS", "30"))

# Project paths
STUDIO_ROOT = Path(__file__).parent.parent  # animation-studio/
PROJECT_ROOT = STUDIO_ROOT.parent           # explainer-v3/
OUTPUT_DIR = PROJECT_ROOT / "output"


def normalize_word(word: str) -> str:
    """Normalize a word for matching: lowercase, strip punctuation and symbols."""
    return re.sub(r'[.,!?;:\"\'()\[\]{}\-—–…$%#@^&*+=/<>~`]', '', word.lower()).strip()


def extract_stat_match_word(stat_text: str) -> str:
    """
    Extract the best matching word for a STAT tag value.
    Whisper splits decimals: "$110.98" -> "$110" + ".98", "3.3%" -> "3" + ".3"
    So we extract just the integer/leading part.
    """
    parts = [p.strip() for p in stat_text.split('|')]
    value = parts[0].strip() if parts else ""
    if not value:
        return ""
    # Strip currency/percent symbols
    cleaned = re.sub(r'[$%,]', '', value).strip()
    # If it's a decimal like "110.98" or "3.3", take the integer part
    if '.' in cleaned:
        integer_part = cleaned.split('.')[0]
        return integer_part.lower() if integer_part else cleaned.lower()
    return cleaned.lower()


# Number-to-word mapping for TTS that speaks digits as words
# Normalized forms (hyphens stripped): "twenty-one" → "twentyone"
NUMBERS_TO_WORDS = {
    "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four",
    "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine",
    "10": "ten", "11": "eleven", "12": "twelve", "13": "thirteen",
    "14": "fourteen", "15": "fifteen", "16": "sixteen", "17": "seventeen",
    "18": "eighteen", "19": "nineteen", "20": "twenty", "21": "twentyone",
    "22": "twentytwo", "25": "twentyfive", "30": "thirty", "40": "forty",
    "50": "fifty", "60": "sixty", "70": "seventy", "80": "eighty",
    "90": "ninety", "100": "hundred", "1000": "thousand",
}


def number_to_word(num_str: str) -> str | None:
    """Convert a numeric string to its spoken word form (normalized)."""
    return NUMBERS_TO_WORDS.get(num_str, None)


def build_word_index(words: list) -> dict:
    """
    Build word -> list of {index, start, end} lookup from Whisper timestamps.
    Groups by normalized word form, preserving order.
    """
    word_index = {}
    for i, w in enumerate(words):
        clean = normalize_word(w["word"])
        if not clean:
            continue
        if clean not in word_index:
            word_index[clean] = []
        word_index[clean].append({
            "index": i,
            "start": w["start"],
            "end": w["end"]
        })
    return word_index


def extract_first_word(text: str) -> str:
    """Extract the first meaningful word from text, ignoring tags."""
    cleaned = re.sub(r'\[.*?\]', '', text).strip()
    if not cleaned:
        return ""
    parts = cleaned.split()
    return normalize_word(parts[0]) if parts else ""


def parse_tags(tagged_text: str) -> list:
    """
    Parse all tags from tagged script text.
    Returns list of {tag, text, position, end_position, raw}
    """
    tags = []

    # Pattern for content tags: [TAG: content]
    content_pattern = re.compile(
        r'\[(EM|E|STAT|META|QUOTE|CLOSE):\s*([^\]]*)\]'
    )

    # Pattern for structural tags: [SB], [LIST], [/LIST]
    structural_pattern = re.compile(
        r'\[(SB|LIST|/LIST)\]'
    )

    for match in re.finditer(r'\[(EM|E|STAT|META|QUOTE|CLOSE):', tagged_text):
        depth = 1
        end = match.end()
        while end < len(tagged_text) and depth:
            depth += (tagged_text[end] == '[') - (tagged_text[end] == ']')
            end += 1
        tags.append({
            "tag": match.group(1),
            "text": tagged_text[match.end():end - 1].strip(),
            "position": match.start(),
            "end_position": end,
            "raw": tagged_text[match.start():end]
        })

    for match in structural_pattern.finditer(tagged_text):
        tags.append({
            "tag": match.group(1),
            "text": "",
            "position": match.start(),
            "end_position": match.end(),
            "raw": match.group(0)
        })

    tags.sort(key=lambda t: t["position"])
    return tags


def find_next_word_after(tagged_text: str, position: int) -> str:
    """Find the first real word in tagged_text after given position."""
    text_after = tagged_text[position:]
    cleaned = re.sub(r'\[.*?\]', '', text_after).strip()
    if not cleaned:
        return ""
    parts = cleaned.split()
    return normalize_word(parts[0]) if parts else ""


def try_match_after(word_index: dict, target: str, min_idx: int) -> dict | None:
    """Find first occurrence of target word at word index >= min_idx."""
    candidates = word_index.get(target, [])
    for c in candidates:
        if c["index"] >= min_idx:
            return c
    return None


def align_tags_to_frames(
    tagged_text: str,
    words: list,
    fps: int = 30
) -> list:
    """
    Align each tag to a frame number via Whisper timestamps.

    Match the entire narration to the ASR sequence, allowing adjacent tags
    to share an anchor and preventing repeated words from jumping sentences.
    """
    parsed_tags = parse_tags(tagged_text)
    # Align the complete spoken sequence first. Matching isolated common words
    # can jump to a later sentence and poison every subsequent cursor match.
    spoken = ""
    offsets = {}
    previous = 0
    for tag_info in parsed_tags:
        spoken += tagged_text[previous:tag_info["position"]]
        offsets[tag_info["position"]] = len(spoken.split())
        if tag_info["tag"] not in {"META", "SB", "LIST", "/LIST"}:
            spoken += strip_tags_for_narration(tag_info["raw"])
        previous = tag_info["end_position"]
    spoken += tagged_text[previous:]
    source = [normalize_word(w) for w in spoken.split()]
    target = [normalize_word(w["word"]) for w in words]
    mapping = {}
    for block in SequenceMatcher(None, source, target, autojunk=False).get_matching_blocks():
        for offset in range(block.size):
            mapping[block.a + offset] = block.b + offset
    beats = []

    for tag_info in parsed_tags:
        tag = tag_info["tag"]
        text = tag_info["text"]

        # Skip /LIST
        if tag == "/LIST":
            continue

        source_index = offsets[tag_info["position"]]
        match_index = mapping.get(source_index)
        if match_index is None:
            # ASR may normalize a number or omit a short word. Anchor only to
            # a nearby actual Whisper word, never a guessed timestamp.
            for distance in range(1, 9):
                match_index = mapping.get(source_index + distance)
                if match_index is not None:
                    break
        match_entry = words[match_index] if match_index is not None else None

        # Compute frame
        frame = int(match_entry["start"] * fps) if match_entry else None
        timestamp = match_entry["start"] if match_entry else None

        # Build beat ID
        if text:
            id_text = text[:30].upper().replace(' ', '_').replace('-', '_')
            id_text = re.sub(r'[^A-Z0-9_]', '', id_text)
            beat_id = f"{tag}_{id_text}"
        else:
            beat_id = f"{tag}_{len(beats)}"

        beats.append({
            "id": beat_id,
            "tag": tag,
            "text": text,
            "frame": frame,
            "timestamp_seconds": timestamp,
            "aligned": match_entry is not None
        })

    return beats


def segment_into_sections(
    beats: list,
    tagged_text: str,
    words: list,
    fps: int = 30
) -> list:
    """
    Segment beats into sections at [SB] boundaries.
    """
    sb_indices = [i for i, b in enumerate(beats) if b["tag"] == "SB"]

    total_duration_seconds = words[-1]["end"] if words else 0
    total_frames = int(total_duration_seconds * fps) + fps

    sections = []

    # If no SB tags, one section
    if not sb_indices:
        section_beats = [b for b in beats if b["tag"] != "SB"]
        sections.append({
            "section_id": 1,
            "start_frame": 0,
            "end_frame": total_frames,
            "start_time_seconds": 0.0,
            "end_time_seconds": total_duration_seconds,
            "narration": strip_tags_for_narration(tagged_text),
            "tagged_narration": tagged_text.strip(),
            "beats": section_beats
        })
        return sections

    # Split tagged text at [SB] markers
    sb_pattern = re.compile(r'\[SB\]')
    sb_matches = list(sb_pattern.finditer(tagged_text))
    text_segments = []

    if sb_matches:
        first_chunk = tagged_text[:sb_matches[0].start()].strip()
        if first_chunk:
            text_segments.append(first_chunk)

        for i in range(len(sb_matches)):
            start = sb_matches[i].end()
            end = sb_matches[i + 1].start() if i + 1 < len(sb_matches) else len(tagged_text)
            chunk = tagged_text[start:end].strip()
            if chunk:
                text_segments.append(chunk)

    # Build section boundaries from SB frames
    boundary_frames = [0]
    for idx in sb_indices:
        if beats[idx]["frame"] is not None:
            boundary_frames.append(beats[idx]["frame"])
    boundary_frames.append(total_frames)

    # Remove duplicate boundaries and sort
    boundary_frames = sorted(set(boundary_frames))

    # All non-SB beats
    non_sb_beats = [b for b in beats if b["tag"] != "SB"]

    section_id = 0
    for i in range(len(boundary_frames) - 1):
        start_frame = boundary_frames[i]
        end_frame = boundary_frames[i + 1]
        start_time = start_frame / fps
        end_time = end_frame / fps

        # Collect beats in this frame range (aligned ones)
        section_beats = [
            b for b in non_sb_beats
            if b["frame"] is not None and start_frame <= b["frame"] < end_frame
        ]

        section_id += 1

        tagged_narration = text_segments[i] if i < len(text_segments) else ""
        narration = strip_tags_for_narration(tagged_narration)

        sections.append({
            "section_id": section_id,
            "start_frame": start_frame,
            "end_frame": end_frame,
            "start_time_seconds": round(start_time, 3),
            "end_time_seconds": round(end_time, 3),
            "narration": narration,
            "tagged_narration": tagged_narration,
            "beats": section_beats
        })

    return sections


def strip_tags_for_narration(text: str) -> str:
    """Strip all tags from text to get clean narration."""
    result = text
    result = re.sub(r'\[META:[^\]]*\]', '', result)
    result = re.sub(r'\[SB\]', '', result)
    result = re.sub(r'\[LIST\]', '', result)
    result = re.sub(r'\[/LIST\]', '', result)
    result = re.sub(r'\[(?:EM|E|CLOSE):\s*([^\]]*)\]', r'\1', result)
    def unwrap_stat(match):
        parts = [p.strip() for p in match.group(1).split('|')]
        return f"{parts[0]} {parts[1]}" if len(parts) >= 2 else parts[0]
    result = re.sub(r'\[STAT:\s*([^\]]*)\]', unwrap_stat, result)
    result = re.sub(r'\[QUOTE:\s*([^\]]*)\]', r'\1', result)
    result = re.sub(r'\n{3,}', '\n\n', result)
    result = re.sub(r'^-\s+', '', result, flags=re.MULTILINE)
    return result.strip()


def main():
    if len(sys.argv) < 2:
        print("Usage: python 03_aligner.py <slug>")
        print("Example: python 03_aligner.py global-economy-last-decade")
        sys.exit(1)

    slug = sys.argv[1]
    from v6_session import guard
    guard('legacy-align', slug, legacy=True)
    slug_output_dir = OUTPUT_DIR / slug

    tagged_path = slug_output_dir / "tagged-script.md"
    timestamps_path = slug_output_dir / "timestamps.json"
    output_path = slug_output_dir / "annotated.json"

    if not tagged_path.exists():
        print(f"[ERROR] Tagged script not found: {tagged_path}")
        sys.exit(1)

    if not timestamps_path.exists():
        print(f"[ERROR] Timestamps not found: {timestamps_path}")
        sys.exit(1)

    print(f"[1/3] Loading tagged script: {tagged_path.name}")
    tagged_text = tagged_path.read_text(encoding="utf-8")

    print(f"[2/3] Loading Whisper timestamps: {timestamps_path.name}")
    with open(timestamps_path, "r", encoding="utf-8") as f:
        words = json.load(f)

    print(f"   {len(words)} words in transcript")

    print(f"[3/3] Aligning tags to frames (FPS={FPS})...")
    beats = align_tags_to_frames(tagged_text, words, FPS)

    aligned_count = sum(1 for b in beats if b["aligned"])
    unaligned_count = sum(1 for b in beats if not b["aligned"])
    print(f"   Total beats: {len(beats)}")
    print(f"   Aligned: {aligned_count}")
    print(f"   Unaligned: {unaligned_count}")

    if unaligned_count > 0:
        print(f"\n   [WARNING] Unaligned beats:")
        for b in beats:
            if not b["aligned"]:
                safe_text = b['text'][:40].encode('ascii', 'replace').decode()
                print(f"     - {b['id']}: [{b['tag']}] \"{safe_text}\"")

    sections = segment_into_sections(beats, tagged_text, words, FPS)
    print(f"\n   Sections: {len(sections)}")
    for s in sections:
        duration = s["end_time_seconds"] - s["start_time_seconds"]
        beat_count = len(s["beats"])
        print(f"     Section {s['section_id']}: "
              f"{s['start_time_seconds']:.1f}s-{s['end_time_seconds']:.1f}s "
              f"({duration:.1f}s, {beat_count} beats)")

    total_duration_seconds = words[-1]["end"] if words else 0
    total_frames = int(total_duration_seconds * FPS) + FPS

    result = {
        "slug": slug,
        "audio_duration_frames": total_frames,
        "audio_duration_seconds": round(total_duration_seconds, 3),
        "fps": FPS,
        "sections": sections,
        "total_beats": len(beats),
        "unaligned_count": unaligned_count
    }

    slug_output_dir.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"\n   Annotated JSON saved: {output_path}")
    print(f"\n[DONE] Next step: python 05_spec_generator.py {slug}")


if __name__ == "__main__":
    main()
