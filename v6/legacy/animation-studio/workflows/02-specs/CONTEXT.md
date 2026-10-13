# Stage 2: Specs — Animation Blueprints

## What This Folder Is

This is the **blueprint stage**. Specs here are implementation-ready documents — not prose descriptions, but **code blueprints** detailed enough that a build agent can translate them directly into Remotion compositions without interpretation.

**Input:** `../00-audio/[slug]-annotated.json` (from Aligner — contains BEAT frames from real Whisper timestamps)
**Output:** `[slug]-spec.md` — production spec with BEATS object, frame-range visual blocks, and exact component props

---

## The Key Difference in This System

In a traditional spec workflow, timing is estimated by the spec writer. In this system, **timing comes from Whisper ASR**. The Gemini Spec Generator does not decide when things happen — it receives pre-computed BEAT frames from the Aligner and writes them into the spec.

```
BEATS frame = Math.floor(Whisper_timestamp_seconds × 30)
```

This means visual events in the spec are frame-accurate to the spoken word — drift is impossible.

---

## How to Generate a Spec

1. Open `../../prompts/SPEC_GENERATOR.md` — this is the Gemini system prompt
2. For each section in `annotated.json`, make one Gemini API call
3. Pass the section JSON as input
4. Gemini returns a spec section in markdown
5. Assemble all sections into `[slug]-spec.md`

**One API call per section.** Don't send the entire annotated.json in one call — sections are the right granularity for context and quality control.

Also load these as context for each call:
- `../../docs/component-registry.md`
- `../../docs/design-system.md`

---

## Spec Quality Standards

### BEATS density
Minimum **12 BEATS per 90 frames** (3 seconds of screen time).

Formula: `min_beats = Math.floor((end_frame - start_frame) / 90) × 12`

Every tagged item generates a primary BEAT + lifecycle BEATs:
| Tag | Primary BEAT | Lifecycle BEATs |
|-----|-------------|-----------------|
| `[EM]` | `_IN` | `_SHINE_START` (+3f), `_HOLD_END` (+45f) |
| `[E]` | `_IN` | `_GLITCH_PEAK` (+5f), `_SETTLE` (+20f) |
| `[STAT]` | `_COUNTUP_START` | `_LAND` (+30f), `_HOLD` (+15f) |
| `[LIST]` | `_LIST_IN` | `_ITEM_[N]` (+18×N f each), `_COMPLETE` |
| `[META]` | `_VISUAL_IN` | `_LABEL_IN` (+10f), `_HOLD` (+60f), `_FADE` (+30f) |
| `[SB]` | `_TRANSITION_START` | `_TRANSITION_END` (+15f) |
| `[QUOTE]` | `_CARD_IN` | `_TEXT_REVEAL` (+10f), `_HOLD` (+60f) |
| `[CLOSE]` | `_BLUR_START` | `_LINE_[N]` staggered, `_GLOW_IN` (+40f), `_HOLD_START` (+60f) |

Every section also includes: `AMBIENT_IN`, `VIGNETTE_IN`, `SCENE_END`.

### Frame-range micro-blocks
Maximum **20 frames per visual description bullet**. Never describe a 40-frame or 80-frame block as one bullet — break it down.

### Element lifecycle
Every significant visual element must have all 4 phases:
1. **ENTER** — how it arrives (spring preset, direction, duration)
2. **IDLE** — what it does while on screen (pulse formula, glow, or explicit "holds static")
3. **REACT** — how it responds when next BEAT hits (dim%, scale, border flash)
4. **EXIT** — how it leaves (fade, shrink, slide, blur)

### Inline component props
Never say "use AnimatedText". Say:
```
AnimatedText variant="title" size={56} color="#F59E0B" entrance="scale" springPreset="bouncy" startFrame={268}
```

### Exact values
Never say "large text", "blue", "fast animation". Always say "52px", "#3B82F6", "spring: snappy".

---

## Spec File Format

Every spec follows this structure:

```markdown
# [Video Title]

## Overview
- **ID**: T-[XX]
- **Slug**: [slug]
- **Pillar**: P[X]
- **Format**: short-form | long-form
- **Audio file**: ../00-audio/[slug].mp3
- **Timestamps file**: ../00-audio/[slug]-timestamps.json
- **Total frames**: [N] (from annotated.json audio_duration_frames)
- **Resolution**: 1920×1080 (16:9) | 1080×1920 (9:16) @ 30fps
- **Accent colors**: [primary] (#hex), [secondary] (#hex)
- **Core metaphor**: [One sentence — the central analogy]
- **Key visual**: [One sentence — most memorable single moment]
- **Frame number convention**: Global

## calculateMetadata
```typescript
// In composition index.tsx:
export const calculateMetadata: CalculateMetadataFunction = async ({ props }) => {
  const durationInSeconds = await getAudioDurationInSeconds(props.audioSrc);
  return { durationInFrames: Math.ceil(durationInSeconds * 30) };
};
```

## Color Flow
| Section | Dominant Color | Mood |
|---------|----------------|------|
| ...     | ...            | ...  |

## Audio Integration
```typescript
// In each composition:
<Audio src={staticFile("audio/[slug].mp3")} />
```

## Visual-First Rule
No captions/subtitles. All storytelling through visual elements:
- Max 20% text beats (always with icon companion)
- Min 70% SVG/icon/3D/chart beats
- Every keyword → inline SVG icon
- Scene layout must vary (8 layouts available)

---

### Section [N]: [Title] ([start]s-[end]s, frames [A]-[B])

**Narration:** > "[exact narration text]"

**Visuals:**
- **Frames [A]-[A+20]**: [description]
- **Frames [A+20]-[A+40]**: [description]
...

**BEATS:**
```typescript
const BEATS = {
  AMBIENT_IN: [A],        // structural
  VIGNETTE_IN: [A],       // structural
  EM_TERM: [frame],       // [EM] "term" — Whisper [X]s × 30
  EM_TERM_SHINE: [frame+3],
  ...
  SCENE_END: [B],
};
```

**Components:** [list]
**Background:** dark (#0A0A0F)
```

---

## Standard Visual Arc (Short-Form 35–38 seconds)

| Beat | Time | Frames | Visual Density |
|------|------|--------|----------------|
| Hook | 0–3s | 0–90 | Medium — fast entrance |
| Context | 3–10s | 90–300 | Dense — diagrams, data |
| Core | 10–22s | 300–660 | Maximum density |
| Resolution | 22–30s | 660–900 | Dense → focused |
| Closing | 30–38s | 900–1140 | BlurText + glow + 60f hold |

### Closing Section Pattern (MANDATORY)
Every video ends identically — this is the signature:
1. All elements fade → 20 frames breathing room
2. `BlurText` line 1: `animateBy="words" direction="bottom" staggerDelay={4} blurAmount={8} color="#E5E7EB"`
3. `BlurText` line 2 (key reframe): same, `color="#F59E0B"` (insightOrange), fontSize +4px
4. Radial glow: insightOrange at 4% opacity, 400px radius, behind line 2
5. Hold 60+ frames — zero animation during hold

---

## Folder Structure

```
02-specs/
├── CONTEXT.md (you are here)
├── short-form/
│   ├── P1-layers-beneath/
│   ├── P2-right-tool/
│   ├── P3-methods-not-tools/
│   ├── P4-builders-architecture/
│   └── P5-honest-take/
└── long-form/
    └── [same pillar structure]
```

---

## What NOT to Do

- **Don't estimate BEAT frame numbers** — all frames come from Whisper × 30
- **Don't write prose descriptions** — use frame-range micro-blocks with exact values
- **Don't use 40+ frame blocks** — maximum 20 frames per bullet
- **Don't give elements one-shot lifecycles** — every element needs ENTER + IDLE + REACT + EXIT
- **Don't leave colors vague** — always hex values
- **Don't list components separately from visuals** — inline props where they're used
- **Don't hardcode composition duration** — always `calculateMetadata` from audio
- **Don't store code here** — code goes in `../../src/compositions/`
