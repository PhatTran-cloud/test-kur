"""
Stage 0 — Step 2: Automatic Speech Recognition via Whisper (localhost:9000)

Input:  audio file (.mp3) from TTS step
Output: word-level timestamps (.json) in output/<slug>/

Usage:
    python 02_asr_whisper.py <slug>
    python 02_asr_whisper.py my-video-slug

Expects:  output/<slug>/audio.mp3
Produces: output/<slug>/timestamps.json
          output/<slug>/whisper-raw.json (debug)
Copies:   animation-studio/public/timestamps/<slug>-timestamps.json (for Remotion)
"""

import os
import sys
import json
import shutil
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load .env from scripts/ directory
load_dotenv(Path(__file__).parent / ".env")

# ─── Config ───────────────────────────────────────────────
WHISPER_URL = os.getenv("WHISPER_API_URL", "http://localhost:9000/asr")

# Project paths
STUDIO_ROOT = Path(__file__).parent.parent   # animation-studio/
PROJECT_ROOT = STUDIO_ROOT.parent            # explainer-v3/
OUTPUT_DIR = PROJECT_ROOT / "output"


def transcribe(audio_path: Path) -> dict:
    """
    Send audio to local Whisper ASR and get word-level timestamps.
    """
    params = {
        "encode": "true",
        "task": "transcribe",
        "language": "en",
        "word_timestamps": "true",
        "output": "json",
        "vad_filter": "false"
    }

    try:
        with open(audio_path, "rb") as f:
            files = {"audio_file": (audio_path.name, f, "audio/mpeg")}
            response = requests.post(
                WHISPER_URL,
                params=params,
                files=files,
                timeout=1800  # 30 min — long audios on CPU can take a while
            )

        if response.status_code == 200:
            return response.json()
        else:
            print(f"   [ERROR] Whisper API returned {response.status_code}: {response.text[:300]}")
            return None

    except requests.exceptions.ConnectionError:
        print(f"   [ERROR] Cannot connect to Whisper at {WHISPER_URL}")
        print(f"   Make sure Whisper ASR is running:")
        print(f"   docker run -p 9000:9000 onerahmet/openai-whisper-asr-webservice:latest")
        return None
    except Exception as e:
        print(f"   [ERROR] ASR failed: {e}")
        return None


def flatten_word_timestamps(whisper_response: dict) -> list:
    """
    Flatten Whisper segments[].words[] into pipeline format:
    [{ "word": "...", "start": 0.0, "end": 0.5 }, ...]
    """
    flat_words = []

    segments = whisper_response.get("segments", [])
    for segment in segments:
        words = segment.get("words", [])
        for w in words:
            flat_words.append({
                "word": w["word"].strip(),
                "start": round(w["start"], 3),
                "end": round(w["end"], 3)
            })

    return flat_words


def quality_check(words: list):
    """Spot-check timestamp quality."""
    if not words:
        print("   [WARNING] No words found in transcription!")
        return False

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

    return True


def main():
    if len(sys.argv) < 2:
        print("Usage: python 02_asr_whisper.py <slug>")
        print("Example: python 02_asr_whisper.py global-economy-last-decade")
        sys.exit(1)

    slug = sys.argv[1]
    from v6_session import guard
    guard('legacy-asr', slug, legacy=True)
    slug_dir = OUTPUT_DIR / slug
    slug_dir.mkdir(parents=True, exist_ok=True)

    audio_path = slug_dir / "audio.mp3"
    output_path = slug_dir / "timestamps.json"
    public_timestamps = STUDIO_ROOT / "public" / "timestamps" / f"{slug}-timestamps.json"

    # ── Check audio file ──
    if not audio_path.exists():
        print(f"[ERROR] Audio file not found: {audio_path}")
        print(f"Run TTS first: python 01_tts_kokoro.py {slug}")
        sys.exit(1)

    audio_size_mb = audio_path.stat().st_size / (1024 * 1024)
    print(f"[1/3] Audio file: {audio_path.name} ({audio_size_mb:.1f} MB)")

    # ── Transcribe ──
    print(f"[2/3] Transcribing via Whisper ASR...")
    print(f"   Endpoint: {WHISPER_URL}")
    whisper_response = transcribe(audio_path)

    if not whisper_response:
        print(f"\n[FAILED] Whisper transcription failed.")
        sys.exit(1)

    # ── Extract and flatten ──
    print(f"[3/3] Extracting word-level timestamps...")

    detected_language = whisper_response.get("language", "unknown")
    print(f"   Language detected: {detected_language}")

    words = flatten_word_timestamps(whisper_response)

    if not words:
        print(f"[ERROR] No word timestamps extracted!")
        sys.exit(1)

    quality_check(words)

    # ── Save flattened timestamps ──
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(words, f, indent=2, ensure_ascii=False)

    print(f"\n   Timestamps saved: {output_path}")

    # Copy to public/ for Remotion
    public_timestamps.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(output_path, public_timestamps)
    print(f"   Copied to: {public_timestamps}")

    # Save raw Whisper response for debugging
    raw_path = slug_dir / "whisper-raw.json"
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump(whisper_response, f, indent=2, ensure_ascii=False)
    print(f"   Raw Whisper output: {raw_path}")

    print(f"\n[DONE] Next step: python 03_aligner.py {slug}")


if __name__ == "__main__":
    main()
