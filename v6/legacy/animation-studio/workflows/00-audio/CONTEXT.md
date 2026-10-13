# Stage 0: Audio — TTS + Timestamps + Aligner

## What This Stage Does

Transforms a tagged script into the timing foundation for the entire video.

**Input:** `[slug]-tagged.md` (tagged script from Gemini Tag Parser)
**Outputs:**
- `[slug].mp3` — narration audio
- `[slug]-timestamps.json` — word-level timestamps (from Kokoro captioned speech)
- `[slug]-annotated.json` — BEAT frames aligned to timestamps (primary output for Stage 2)

This stage answers the question: **"At exactly what frame does each key moment happen?"**

---

## Step 1 — Strip Tags, Generate Audio (Kokoro TTS)

**Script:** `scripts/01_tts_kokoro.py`

```bash
python scripts/01_tts_kokoro.py <slug>
```

Trước khi gửi TTS, script tự động strip tất cả tags. Rules:
```
[EM: text]              → text
[E: text]               → text
[STAT: value|unit|ctx]  → "value unit"  (bỏ context)
[META: ...]             → (xóa hoàn toàn — visual-only, không đọc)
[QUOTE: text]           → text
[CLOSE: text]           → text
[SB]                    → (xóa hoàn toàn)
[LIST] / [/LIST]        → (xóa tag, giữ items)
- item                  → item  (bỏ dash đầu dòng)
```

### Kokoro TTS — local (audio only)

Dùng Kokoro `/v1/audio/speech` endpoint (OpenAI-compatible) chạy local qua Docker.
Endpoint trả về **raw MP3 audio binary** trực tiếp.
**Word-level timestamps do Whisper ASR xử lý riêng ở Step 2.**

```bash
# Start Kokoro trước khi chạy script
docker run -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu:latest
```

Config trong `scripts/.env`:
```
KOKORO_API_URL=http://localhost:8880
KOKORO_VOICE=bm_george
KOKORO_SPEED=1.0
KOKORO_LANG_CODE=a
```

### Request payload
```json
{
  "model": "kokoro",
  "input": "<clean text>",
  "voice": "bm_george",
  "response_format": "mp3",
  "speed": 1.0
}
```

### Response
API trả về raw MP3 audio bytes trực tiếp (Content-Type: audio/mpeg).

### Output
```
output/<slug>/audio.mp3                            ← audio file
public/audio/<slug>.mp3                            ← copy cho Remotion
```

## Step 1.5 — Whisper ASR (Word-Level Timestamps)

**Script:** `scripts/02_asr_whisper.py`

```bash
python scripts/02_asr_whisper.py <slug>
```

Gửi `audio.mp3` sang Whisper ASR Docker để lấy word-level timestamps.

```bash
# Start Whisper trước khi chạy script
docker run -p 9000:9000 onerahmet/openai-whisper-asr-webservice:latest-gpu
```

### Output
```
output/<slug>/timestamps.json                      ← word-level timestamps
output/<slug>/whisper-raw.json                     ← raw Whisper response (debug)
public/timestamps/<slug>-timestamps.json           ← copy cho Remotion build (audio sync)
```

### Quality check (tự động)
Script tự kiểm tra: first/last word timing, non-monotonic timestamps, gaps > 3 giây.

---

## Step 2 — Align Tags to Frame Numbers (Aligner)

**Script:** `scripts/03_aligner.py`

```bash
python scripts/03_aligner.py <slug>
```

### Algorithm

```python
import json
import re

def align(tagged_script_path, timestamps_path, output_path, fps=30):
    with open(tagged_script_path) as f:
        tagged = f.read()
    with open(timestamps_path) as f:
        words = json.load(f)

    # Build word → timestamp lookup (normalize to lowercase, strip punctuation)
    word_index = {}
    for i, w in enumerate(words):
        clean = w["word"].lower().strip(".,!?;:\"'")
        if clean not in word_index:
            word_index[clean] = []
        word_index[clean].append({"index": i, "start": w["start"], "end": w["end"]})

    # Find all tags in tagged script
    tag_pattern = re.compile(
        r'\[(?P<tag>EM|E|STAT|META|QUOTE|CLOSE|LIST|SB):?\s*(?P<text>[^\]]*)\]|'
        r'\[(?P<tag2>SB|/LIST)\]'
    )

    beats = []
    used_word_indices = set()

    for match in tag_pattern.finditer(tagged):
        tag = match.group("tag") or match.group("tag2")
        text = (match.group("text") or "").strip()

        if tag in ("SB", "/LIST"):
            # Find the next word after this position in the script
            text_after = tagged[match.end():match.end()+50]
            first_word = re.split(r'\s+', text_after.strip())[0]
            first_word = re.sub(r'\[.*?\]', '', first_word).strip(".,!?;:[]-").lower()
        else:
            # First word of the tagged text
            first_word = text.split()[0].lower().strip(".,!?;:\"'") if text else ""

        # Lookup in timestamps
        candidates = word_index.get(first_word, [])
        # Pick first unused occurrence
        match_entry = None
        for c in candidates:
            if c["index"] not in used_word_indices:
                match_entry = c
                used_word_indices.add(c["index"])
                break

        if match_entry:
            frame = int(match_entry["start"] * fps)
        else:
            frame = None  # Will be flagged in output

        beat_id = f"{tag}_{text[:20].upper().replace(' ', '_').replace('-', '_')}" if text else f"{tag}_{len(beats)}"

        beats.append({
            "id": beat_id,
            "tag": tag,
            "text": text,
            "frame": frame,
            "timestamp_seconds": match_entry["start"] if match_entry else None,
            "aligned": match_entry is not None
        })

    # Save annotated output
    result = {
        "slug": tagged_script_path.stem,
        "audio_duration_frames": int(words[-1]["end"] * fps) + fps,
        "audio_duration_seconds": words[-1]["end"],
        "beats": beats,
        "unaligned_count": sum(1 for b in beats if not b["aligned"])
    }

    with open(output_path, "w") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Aligned {len(beats)} beats. Unaligned: {result['unaligned_count']}")
```

### Save aligned output
```
output/<slug>/annotated.json
```

### Handle unaligned beats
If `unaligned_count > 0`, review the flagged beats. Options:
- **Word not found:** Tag text may have a different word form in the audio. Check transcript vs tagged script for spelling differences.
- **Word appears multiple times:** Aligner picks first unused occurrence. If this is wrong, manually set the correct frame in the JSON.
- **[SB] or structural tags:** These match the next word after the tag, which may not always align perfectly. Review and adjust.

---

## Gemini API — Tag Parser và Spec Generator

**Scripts:** `scripts/04_tag_parser.py`, `scripts/05_spec_generator.py`

```bash
# Tag Parser
python scripts/04_tag_parser.py ../workflows/01-scripts/long-form/P1/my-video.md

# Spec Generator
python scripts/05_spec_generator.py <slug> --format long-form --pillar P1
```

Dùng `google-genai` SDK (không phải `google-generativeai`), `response_mime_type: application/json` để đảm bảo output structured.

Config trong `scripts/.env`:
```
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-pro-preview-06-05
```

Spec Generator output 2 files:
- `output/<slug>/spec.md` — spec markdown
- `output/<slug>/visual-blocks.json` — structured JSON cho scene builder

Retry tự động khi 503: 15s → 30s → 45s.

---

After alignment, segment the `beats` array into sections. Each section corresponds to one Gemini Spec Generator API call.

### Segmentation rules
- One `[SB]` beat = one section boundary
- Section starts at the frame of the first beat after a `[SB]`, ends at the frame of the next `[SB]`
- Target: 30–90 seconds per section for optimal Gemini context size

### Final annotated.json structure
```json
{
  "slug": "my-video-slug",
  "audio_duration_frames": 25419,
  "audio_duration_seconds": 847.3,
  "fps": 30,
  "sections": [
    {
      "section_id": 1,
      "section_title": "The Problem",
      "start_frame": 0,
      "end_frame": 540,
      "start_time_seconds": 0.0,
      "end_time_seconds": 18.0,
      "narration": "Clean narration text for this section (no tags)",
      "tagged_narration": "Tagged version: Most people dump [EM: everything]...",
      "beats": [
        {
          "id": "EM_EVERYTHING",
          "tag": "EM",
          "text": "everything",
          "frame": 268,
          "timestamp_seconds": 8.93,
          "aligned": true
        }
      ]
    },
    {
      "section_id": 2,
      ...
    }
  ]
}
```

---

## Folder Contents

```
output/<slug>/
├── tagged-script.md              ← Tagged script (from Tag Parser)
├── audio.mp3                     ← Audio file (from Kokoro)
├── timestamps.json               ← Word-level timestamps (from Kokoro)
├── kokoro-captioned-raw.json     ← Raw Kokoro response (debug)
└── annotated.json                ← Aligner output → feeds Stage 2
```

---

## Quality Checklist

- [ ] Tag stripping produces natural-sounding clean text
- [ ] Audio sounds correct — no artifacts from tag removal
- [ ] Kokoro timestamps spot-checked against audio
- [ ] `unaligned_count` is 0 or manually resolved
- [ ] Sections are segmented at `[SB]` boundaries
- [ ] Each section is 30–90 seconds
- [ ] `audio_duration_frames` matches actual audio length × 30
- [ ] `annotated.json` passes to Stage 2 (Spec Generator)
