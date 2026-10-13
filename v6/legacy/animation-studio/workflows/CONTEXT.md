# Animation Studio — Workflow Pipeline

## Overview

Five stages. Each stage has one job. Each stage's output is the next stage's input.

```
00-audio  →  01-scripts  →  02-specs  →  03-builds  →  04-renders
```

Read the CONTEXT.md of the stage you're working in. You don't need all five.

---

## Stage Map

| Stage | Folder | Job | Input | Output |
|-------|--------|-----|-------|--------|
| **00** | `00-audio/` | TTS + Whisper + Aligner | Tagged script | `annotated.json` with BEAT frames |
| **01** | `01-scripts/` | Script storage | Raw script | — (read-only input) |
| **02** | `02-specs/` | Spec generation | `annotated.json` + Gemini | `[slug]-spec.md` |
| **03** | `03-builds/` | Composition build | `spec.md` + Claude Code | Remotion source code |
| **04** | `04-renders/` | Render + distribute | Built composition | `T-[id]-[slug]-v[n].mp4` |

---

## Full Pipeline Walkthrough

### Step 1 — Write the script
Write your voiceover script in `script-lab/`. No special format required — write naturally.
- Short-form: ~100–200 words (~35–60 seconds)
- Long-form: ~1500–4000 words (~6–15 minutes)

Copy the final script to `01-scripts/[short|long]/P[X]-[pillar]/[slug].md`.

### Step 2 — Tag the script (Gemini API)
Load `../prompts/TAG_PARSER.md`. Send the raw script as input.
Gemini returns `tagged_script` with linguistic tags (`[EM]`, `[E]`, `[STAT]`, `[SB]`, etc.) placed at key moments based on observable language rules — not subjective judgment.

Save tagged script to `00-audio/[slug]-tagged.md`.

### Step 3 — Generate audio (TTS API)
Strip all tags from the tagged script → clean narration text.
Send to TTS API (ElevenLabs, OpenAI TTS, or any provider).
Save audio to `00-audio/[slug].mp3`.

### Step 4 — Get timestamps (Whisper ASR)
Send `[slug].mp3` to Whisper API with `word_timestamps=True`.
Save output to `00-audio/[slug]-timestamps.json`.

Whisper output format:
```json
[
  { "word": "infrastructure", "start": 1.24, "end": 1.89 },
  { "word": "is", "start": 1.90, "end": 2.05 },
  ...
]
```

### Step 5 — Align tags to frames (Aligner script)
Run the Aligner script: reads `[slug]-tagged.md` + `[slug]-timestamps.json`.

For each tag in the tagged script, the Aligner:
1. Identifies the first word of the tagged text
2. Looks up that word's `start` timestamp in Whisper output
3. Computes frame: `Math.floor(start_seconds × 30)`
4. Records this as the BEAT frame for that tag

Output: `00-audio/[slug]-annotated.json`

```json
{
  "audio_file": "slug.mp3",
  "audio_duration_seconds": 847.3,
  "audio_duration_frames": 25419,
  "sections": [
    {
      "section_id": 1,
      "section_title": "The Problem",
      "start_frame": 0,
      "end_frame": 312,
      "narration": "Raw narration text for this section...",
      "tagged_narration": "Tagged version with [EM: key terms] etc.",
      "beats": [
        {
          "id": "EM_INFRASTRUCTURE",
          "tag": "EM",
          "text": "infrastructure",
          "frame": 37,
          "timestamp_seconds": 1.24
        }
      ]
    }
  ]
}
```

### Step 6 — Generate spec per section (Gemini API, with Claude Code fallback)
Load `../prompts/SPEC_GENERATOR.md`.
For each section in `annotated.json`, make one Gemini API call.
Pass: section data + `docs/component-registry.md` + `docs/design-system.md`.

Gemini outputs a spec section with:
- Frame-range visual descriptions (max 20 frames per block)
- BEATS object with frame numbers from Whisper (not estimated)
- Full element lifecycle per significant visual (ENTER → IDLE → REACT → EXIT)
- Inline component props with exact values

Assemble all sections into `02-specs/[short|long]/P[X]-[pillar]/[slug]-spec.md`.

**Gemini API fallback — Claude Code thay thế hoàn toàn:**
Nếu Gemini API fail vì BẤT KỲ lý do nào (quota 429, rate limit, lỗi mạng, timeout, API key invalid...) → Claude Code PHẢI tự động thay thế, KHÔNG dừng pipeline, KHÔNG hỏi user. Quy trình:
1. Đọc TOÀN BỘ prompt tương ứng (`SPEC_GENERATOR.md` hoặc `TAG_PARSER.md`) — hiểu hết rules, format, examples
2. Đọc tất cả docs liên quan (`component-registry.md`, `design-system.md`, `markup-schema.md`, reference specs)
3. Thực hiện task với chất lượng **NGANG BẰNG hoặc TỐT HƠN** Gemini
4. Output đúng 100% format mà pipeline expect — cùng cấu trúc, cùng field names
Tương tự cho Step 2 (Tag Parser) — nếu Gemini fail, đọc `TAG_PARSER.md` và tự tag.
**Pipeline KHÔNG BAO GIỜ được dừng vì Gemini fail.**

### Step 7 — Build composition (Claude Code)
Load `03-builds/CONTEXT.md`.
Claude Code reads the spec and translates it into Remotion React components.

Key additions over legacy builds:
- `calculateMetadata` reads `audio_duration_seconds` from annotated.json to set composition duration
- `<Audio src={...}>` component loads the .mp3 file
- Visual-first storytelling (no captions) — 70%+ visual beats with icons/3D/SVG

### Step 8 — Render
Load `04-renders/CONTEXT.md`.
Run Remotion render CLI. Output to `04-renders/[short|long]/P[X]-[pillar]/T-[id]-[slug]-v1.mp4`.

---

## Quick Decision: Which stage am I in?

```
Have a raw script?             → Start at Step 2 (Tag Parser)
Have a tagged script?          → Start at Step 3 (TTS)
Have audio + timestamps?       → Start at Step 5 (Aligner)
Have annotated.json?           → Start at Step 6 (Spec Generator)
Have a spec?                   → Start at Step 7 (Build)
Have a built composition?      → Start at Step 8 (Render)
```

---

## Artifact Naming Convention

```
[slug]-tagged.md          Tagged script (Stage 0 output)
[slug].mp3                Audio file (Stage 0 output)
[slug]-timestamps.json    Whisper output (Stage 0 output)
[slug]-annotated.json     Aligner output (Stage 0 output → Stage 2 input)
[slug]-spec.md            Spec (Stage 2 output → Stage 3 input)
T-[id]-[slug]-v[n].mp4   Final render (Stage 4 output)
```
