"""
Stage 0 — Step 1: Text-to-Speech + Word-Level Timestamps via Kokoro Captioned Speech

Uses Kokoro's /dev/captioned_speech endpoint which returns BOTH audio AND
word-level timestamps in a single API call. No separate ASR step needed.

Input:  tagged script (.md) — tags are stripped to produce clean narration text
Output: audio file (.mp3) + timestamps (.json) in output/<slug>/

Usage:
    python 01_tts_kokoro.py <slug>
    python 01_tts_kokoro.py my-video-slug

Expects:  output/<slug>/tagged-script.md
Produces: output/<slug>/audio.mp3
          output/<slug>/timestamps.json
Copies:   animation-studio/public/audio/<slug>.mp3 (for Remotion)
          animation-studio/public/timestamps/<slug>-timestamps.json (for Remotion)
"""

import os
import re
import sys
import json
import base64
import shutil
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load .env from scripts/ directory
load_dotenv(Path(__file__).parent / ".env")

# ─── Config ───────────────────────────────────────────────
KOKORO_URL = os.getenv("KOKORO_API_URL", "http://localhost:8881/v1/audio/speech")
KOKORO_VOICE = os.getenv("KOKORO_VOICE", "af_heart")
KOKORO_SPEED = float(os.getenv("KOKORO_SPEED", "1"))
KOKORO_LANG_CODE = os.getenv("KOKORO_LANG_CODE", "a")

# Project paths
STUDIO_ROOT = Path(__file__).parent.parent   # animation-studio/
PROJECT_ROOT = STUDIO_ROOT.parent            # explainer-v3/
OUTPUT_DIR = PROJECT_ROOT / "output"


def strip_tags(tagged_text: str) -> str:
    """
    Strip all markup tags from tagged script to produce clean narration text.
    Rules:
      [EM: text]              -> text
      [E: text]               -> text
      [STAT: value|unit|ctx]  -> "value unit" (drop context)
      [META: ...]             -> (remove entirely — visual-only)
      [QUOTE: text]           -> text
      [CLOSE: text]           -> text
      [SB]                    -> (remove entirely)
      [LIST] / [/LIST]        -> (remove tag, keep items)
      - item                  -> item (remove bullet dash)
    """
    result = tagged_text

    # Remove [META: ...] entirely (visual-only tags)
    # Handle nested brackets like symbols=[globe-growth] inside META tags
    def remove_meta_tags(text):
        out = []
        i = 0
        while i < len(text):
            if text[i:i+6] == '[META:':
                depth = 1
                j = i + 1
                while j < len(text) and depth > 0:
                    if text[j] == '[':
                        depth += 1
                    elif text[j] == ']':
                        depth -= 1
                    j += 1
                i = j  # skip past the entire META tag
            else:
                out.append(text[i])
                i += 1
        return ''.join(out)
    result = remove_meta_tags(result)

    # Remove structural tags
    result = re.sub(r'\[SB\]', '', result)
    result = re.sub(r'\[LIST\]', '', result)
    result = re.sub(r'\[/LIST\]', '', result)

    # Unwrap content tags: [TAG: text] -> text
    result = re.sub(r'\[(?:EM|E|CLOSE):\s*([^\]]*)\]', r'\1', result)

    # STAT format: [STAT: value | unit | context] -> value unit
    def unwrap_stat(match):
        content = match.group(1).strip()
        parts = [p.strip() for p in content.split('|')]
        if len(parts) >= 2:
            return f"{parts[0]} {parts[1]}"
        return parts[0]
    result = re.sub(r'\[STAT:\s*([^\]]*)\]', unwrap_stat, result)

    # QUOTE
    result = re.sub(r'\[QUOTE:\s*([^\]]*)\]', r'\1', result)

    # Remove list item dashes
    result = re.sub(r'^-\s+', '', result, flags=re.MULTILINE)

    # Clean up whitespace
    result = re.sub(r'\n{3,}', '\n\n', result)
    result = result.strip()

    return result


def generate_audio(text: str, audio_path: Path) -> bool:
    """
    Send text to Kokoro /v1/audio/speech and save audio.
    Uses OpenAI-compatible endpoint — returns raw audio binary.
    Timestamps are handled separately by Whisper ASR.
    """
    # Use the full URL from env (e.g. http://localhost:8881/v1/audio/speech)
    speech_url = KOKORO_URL.rstrip('/')

    payload = {
        "model": "kokoro",
        "input": text,
        "voice": KOKORO_VOICE,
        "response_format": "mp3",
        "speed": KOKORO_SPEED,
    }

    try:
        print(f"   Endpoint: {speech_url}")
        response = requests.post(speech_url, json=payload, timeout=1800)

        if response.status_code != 200:
            print(f"   [ERROR] Kokoro API returned {response.status_code}")
            try:
                print(f"   Response: {response.text[:500]}")
            except Exception:
                pass
            return False

        # Save raw audio binary
        audio_bytes = response.content
        audio_path.parent.mkdir(parents=True, exist_ok=True)
        with open(audio_path, "wb") as f:
            f.write(audio_bytes)

        audio_size_mb = len(audio_bytes) / (1024 * 1024)
        print(f"   Audio saved: {audio_path} ({audio_size_mb:.1f} MB)")

        if audio_size_mb < 0.01:
            print(f"   [WARNING] Audio file is very small — check Kokoro output")

        return True

    except requests.exceptions.ConnectionError:
        print(f"   [ERROR] Cannot connect to Kokoro at {speech_url}")
        print(f"   Make sure Kokoro TTS is running:")
        print(f"   docker run -p 8881:8880 ghcr.io/remsky/kokoro-fastapi-cpu:v0.2.2")
        return False
    except Exception as e:
        print(f"   [ERROR] TTS generation failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def normalize_timestamps(raw_timestamps) -> list:
    """
    Normalize Kokoro captioned_speech timestamps to pipeline format.
    Handles multiple possible response formats from the API.

    Target format: [{ "word": "...", "start": 0.0, "end": 0.5 }]
    """
    words = []

    if isinstance(raw_timestamps, list):
        for entry in raw_timestamps:
            if isinstance(entry, dict):
                # Kokoro returns: { "word": "...", "start_time": ..., "end_time": ... }
                word = entry.get("word") or entry.get("text") or ""
                start = entry.get("start_time") if "start_time" in entry else entry.get("start", 0)
                end = entry.get("end_time") if "end_time" in entry else entry.get("end", 0)

                word = word.strip()
                if word:
                    words.append({
                        "word": word,
                        "start": round(float(start), 3),
                        "end": round(float(end), 3)
                    })

            elif isinstance(entry, (list, tuple)) and len(entry) >= 3:
                # Format B: ["word", start, end]
                words.append({
                    "word": str(entry[0]).strip(),
                    "start": round(float(entry[1]), 3),
                    "end": round(float(entry[2]), 3)
                })

    elif isinstance(raw_timestamps, dict):
        # Format C: { "words": [...] } wrapper
        inner = raw_timestamps.get("words") or raw_timestamps.get("tokens") or []
        return normalize_timestamps(inner)

    return words


def quality_check(words: list):
    """Spot-check timestamp quality."""
    if not words:
        print("   [WARNING] No words found!")
        return

    # Check for monotonically increasing timestamps
    issues = 0
    for i in range(1, len(words)):
        if words[i]["start"] < words[i-1]["start"]:
            issues += 1

    if issues > 0:
        print(f"   [WARNING] {issues} non-monotonic timestamps found")

    first = words[0]
    last = words[-1]
    print(f"   First word: \"{first['word']}\" at {first['start']}s")
    print(f"   Last word:  \"{last['word']}\" at {last['end']}s")
    print(f"   Total duration: {last['end']:.1f}s ({last['end']/60:.1f} min)")
    print(f"   Total words: {len(words)}")

    # Check for gaps > 3 seconds
    long_gaps = 0
    for i in range(1, len(words)):
        gap = words[i]["start"] - words[i-1]["end"]
        if gap > 3.0:
            long_gaps += 1

    if long_gaps > 0:
        print(f"   [INFO] {long_gaps} gaps > 3 seconds (pauses or silence)")


def main():
    if len(sys.argv) < 2:
        print("Usage: python 01_tts_kokoro.py <slug>")
        print("Example: python 01_tts_kokoro.py global-economy-last-decade")
        sys.exit(1)

    slug = sys.argv[1]
    from v6_session import guard
    guard('legacy-tts', slug, legacy=True)
    slug_dir = OUTPUT_DIR / slug
    slug_dir.mkdir(parents=True, exist_ok=True)

    tagged_path = slug_dir / "tagged-script.md"
    audio_path = slug_dir / "audio.mp3"
    timestamps_path = slug_dir / "timestamps.json"
    public_audio = STUDIO_ROOT / "public" / "audio" / f"{slug}.mp3"
    public_timestamps = STUDIO_ROOT / "public" / "timestamps" / f"{slug}-timestamps.json"

    # ── Read tagged script ──
    if not tagged_path.exists():
        print(f"[ERROR] Tagged script not found: {tagged_path}")
        print(f"Run the Tag Parser first: python 04_tag_parser.py <script-path>")
        sys.exit(1)

    print(f"[1/3] Reading tagged script: {tagged_path.name}")
    tagged_text = tagged_path.read_text(encoding="utf-8")

    # ── Strip tags ──
    print(f"[2/3] Stripping tags for clean narration...")
    clean_text = strip_tags(tagged_text)
    word_count = len(clean_text.split())
    print(f"   Clean text: {word_count} words")

    if word_count < 10:
        print(f"[WARNING] Very short text ({word_count} words). Check tag stripping.")

    # ── Generate audio ──
    print(f"[3/3] Generating audio via Kokoro TTS...")
    print(f"   Voice: {KOKORO_VOICE} | Speed: {KOKORO_SPEED} | Lang: {KOKORO_LANG_CODE}")

    if generate_audio(clean_text, audio_path):
        # Copy audio to public/ for Remotion
        public_audio.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(audio_path, public_audio)
        print(f"   Copied audio to: {public_audio}")

        print(f"\n[DONE] Audio ready. Next: python 02_asr_whisper.py {slug}")
    else:
        print(f"\n[FAILED] TTS generation failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
