# Explainer V3 — Pipeline System

## What This Is

A deterministic video production pipeline. Input is a raw voiceover script. Output is a production-quality rendered video with frame-accurate audio sync and animated captions — generated through Gemini API, Whisper ASR, and Remotion.

**CLAUDE.md** has the folder map and placement rules. This file has the routing logic.

---

## The Pipeline (End to End)

```
Raw voiceover script
    │
    ├─ [Gemini: TAG_PARSER] ──────────────────── tagged script (21 types × 117 subtypes)
    │
    ├─ [TTS API] ─────────────────────────────── audio.mp3
    │
    ├─ [Whisper ASR] ─────────────────────────── timestamps.json
    │
    ├─ [Aligner script] ──────────────────────── annotated.json
    │        └── each tag matched to exact frame number (timestamp × 30)
    │
    ├─ [Gemini: SPEC_GENERATOR, per section] ─── spec.md
    │        └── arc detection, hook variety, energy curve, rhythm patterns
    │        └── BEATS object with frame numbers from timestamps, not estimates
    │
    ├─ [Claude Code] ─────────────────────────── Remotion composition
    │        └── calculateMetadata reads audio duration
    │        └── Visual-first: 70%+ icon/3D/SVG beats, no captions
    │
    └─ [Remotion render] ─────────────────────── final.mp4
```

All generated artifacts land in `output/<script-slug>/`.

---

## Task Routing Table

| Your Task | Go Here | You'll Also Need |
|-----------|---------|-----------------|
| Tag a raw script | `animation-studio/prompts/TAG_PARSER.md` | Raw script text |
| Run TTS + Whisper + Aligner | `animation-studio/workflows/00-audio/CONTEXT.md` | Tagged script |
| Generate spec (Gemini) | `animation-studio/prompts/SPEC_GENERATOR.md` | `docs/component-registry.md` + `docs/design-system.md` + annotated.json |
| Build Remotion composition | `animation-studio/workflows/03-builds/CONTEXT.md` | spec.md |
| Render final video | `animation-studio/workflows/04-renders/CONTEXT.md` | Built composition name |

---

## V3 Changes from V2

1. **Unified output**: All generated files per script in `output/<slug>/` instead of scattered across `workflows/00-audio/`, `workflows/02-specs/`, `src/compositions/`
2. **Pipeline-only**: Removed brand-vault, script-lab, topic-engine, products-and-offers, platform-playbook, production-rhythm (content workspaces not needed for pipeline execution)
3. **Clean compositions**: No pre-built clips — only the system infrastructure for building new ones
4. **Simplified routing**: Direct pipeline focus without content-creation workspaces
5. **Portable source**: `animation-studio/` is self-contained — copy to new machine, `npm install`, run

---

## Why BEATS Come from Whisper, Not AI

BEATS are the frame numbers that trigger every animation event in a Remotion composition. With a raw script, there is no ground truth for timing — AI must estimate, and estimation accumulates error. Over a 10-minute video, estimated timing can drift 30–60 seconds from the actual voiceover.

The correct source of truth is Whisper ASR: word-level timestamps accurate to ~50ms. Converting to frames: `frame = Math.floor(timestamp_seconds × 30)`. This gives every BEAT a deterministic, exact frame number derived directly from when the narrator actually says that word.

---

## Key Numbers

| Parameter | Value |
|-----------|-------|
| FPS | 30 |
| Short-form resolution | 1080 × 1920 (9:16) |
| Long-form resolution | 1920 × 1080 (16:9) |
| Min BEATS density | 12 per 90 frames (3 seconds) |
| Min body text (short-form) | 40px |
| Min title text (short-form) | 48px |
| Safe zone (short-form) | Y: 288–1536px |
| Closing hold | 60+ frames (2+ seconds) |
