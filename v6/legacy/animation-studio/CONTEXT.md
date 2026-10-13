# Animation Studio

## What This Is

The full video production workspace. A raw voiceover script enters. A rendered `.mp4` with frame-accurate audio sync exits. Every step in between is handled here.

This workspace is **downstream** from script-lab and brand-vault:
```
brand-vault → script-lab → animation-studio → platform-playbook
```

---

## Pipeline Overview

```
Stage 0 — Audio      workflows/00-audio/     TTS + Whisper + Aligner
Stage 1 — Scripts    workflows/01-scripts/   Raw scripts (input stage)
Stage 2 — Specs      workflows/02-specs/     Animation blueprints with real BEATS
Stage 3 — Builds     workflows/03-builds/    Remotion composition code
Stage 4 — Renders    workflows/04-renders/   Final .mp4 files
```

Each stage has a `CONTEXT.md` with full instructions. Read the stage you're working in, not all of them.

---

## Navigation

| You want to... | Go here |
|----------------|---------|
| Run the full pipeline end-to-end | `workflows/CONTEXT.md` |
| Run TTS + Whisper (Stage 0) | `workflows/00-audio/CONTEXT.md` |
| Tag a raw script (Gemini) | `prompts/TAG_PARSER.md` |
| Generate a spec (Gemini) | `prompts/SPEC_GENERATOR.md` |
| Build a composition (Claude Code) | `workflows/03-builds/CONTEXT.md` |
| Render a video | `workflows/04-renders/CONTEXT.md` |
| Look up components | `docs/component-registry.md` |
| Look up design rules | `docs/design-system.md` |
| Look up markup tags | `docs/markup-schema.md` |

---

## Folder Map

```
animation-studio/
│
├── CONTEXT.md                      ← You are here
│
├── docs/
│   ├── component-registry.md       ← All components + exact props (load at spec/build time)
│   ├── design-system.md            ← Colors, typography, springs, layout rules
│   └── markup-schema.md            ← Tag reference: what each tag means + visual mapping
│
├── prompts/
│   ├── TAG_PARSER.md               ← Gemini system prompt: raw script → tagged script
│   └── SPEC_GENERATOR.md          ← Gemini system prompt: annotated section → production spec
│
├── workflows/
│   ├── CONTEXT.md                  ← Stage routing + end-to-end pipeline
│   ├── 00-audio/                   ← TTS, Whisper, Aligner artifacts
│   ├── 01-scripts/                 ← Raw scripts by format + pillar
│   ├── 02-specs/                   ← Animation specs by format + pillar
│   ├── 03-builds/                  ← Build status tracking
│   └── 04-renders/                 ← Rendered video files
│
└── src/                            ← Remotion source code
    ├── index.ts                    ← Composition registration
    ├── components/core/            ← Shared reusable components
    └── compositions/EdubaShorts/   ← All clips, by pillar
        ├── constants/              ← Shared colors, timing, typography
        ├── index.tsx               ← Composition registry
        └── clips/
            ├── P1-layers-beneath/
            ├── P2-right-tool/
            ├── P3-methods-not-tools/
            ├── P4-builders-architecture/
            └── P5-honest-take/
```

---

## Hard Rules (Non-Negotiable)

**Animation:**
- All animations MUST use `spring()` + `interpolate()` via `useCurrentFrame()` — CSS transitions are FORBIDDEN and will produce incorrect renders
- Always clamp: `{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }`
- Always set `premountFor={fps}` on every `<Sequence>`

**Timing:**
- All BEATS frame numbers derive from Whisper timestamps × 30 — never estimated
- Video duration set by `calculateMetadata` reading audio file duration — never hardcoded

**Spec quality:**
- BEATS density: minimum 12 per 90-frame block (3 seconds of screen time)
- Every significant element needs 4 lifecycle phases: ENTER → IDLE → REACT → EXIT
- Frame-range blocks: maximum 20 frames per bullet — never coarser
- 33 META types (Groups A-I) with mandatory subtype — see `docs/markup-schema.md`

**Visual-First (NON-NEGOTIABLE):**
- ZERO text-only beats — every text MUST have icon/3D/SVG shape companion
- Beat ratio: max 20% text (always with icon), min 70% SVG/icon/3D/chart, 10% mixed
- Every keyword/concept → 1 inline SVG icon describing it
- Text effects (BlurText, ShinyText, GlitchText, AnimatedText) are overlays — not primary scene content
- Prefer visual components (diagrams, charts, icons, split screens, maps, 3D) as the main content
- Every element must stay on screen long enough to register (minimum hold times in SPEC_GENERATOR.md STEP 7.5)
- Named components from spec must be properly built — not approximated with inline CSS
- No captions/subtitles — visual storytelling only
- All builds MUST use `@remotion/shapes` for geometric elements
- Every scene MUST declare a layout strategy from 8 options (centered, split-h, split-v, grid, radial, stacked, floating, cinematic)
- Never same layout 3 sections in a row
- Centered layout: max 2 per 5 consecutive sections — centered is NOT the default

**Transitions & Layers (NON-NEGOTIABLE):**
- Section-to-section: MUST use `TransitionSeries` from `@remotion/transitions` — NEVER plain `<Sequence>` assembly
- Transition type follows spec's `**Transition out:**` field — `fade()`, `slide()`, `wipe()`, `flip()`, `clockWipe()`
- Default timing: `linearTiming({ durationInFrames: 20 })` — adjust per spec
- 4-layer stacking (EVERY scene):
  - Layer 0: Background (`AbsoluteFill`, ALWAYS opaque, `backgroundColor: COLORS.bg`)
  - Layer 1: Ambient (`AbsoluteFill`) — particles (radius >= 6px, count >= 20), geometric shapes (80-200px circles/arcs/lines, opacity 0.08-0.15), glow orbs
  - Layer 2: Content (`AbsoluteFill`, animated opacity) — all visual beats, text, icons, charts
  - Layer 3: Overlay (`AbsoluteFill`) — vignette (radial gradient, opacity 0.5-0.7), scan line (1px horizontal, moves 0.5px/frame, opacity 0.04-0.08)
- Particle minimum: radius >= 6px, opacity >= 0.15, every particle MUST have `boxShadow` glow
- Phase bridge: when gap between phases > 20 frames, add bridge visual (ambient glow pulse, icon morph, geometric transition)

**Component location:**
- Script-specific components → `output/<slug>/build/components/`
- Only truly universal, reusable components → `src/components/core/`
- Check registry before creating anything new

---

## Formats

| Format | Resolution | Aspect | Platform |
|--------|-----------|--------|----------|
| Long-form (default) | 1920 × 1080 | 16:9 | YouTube |
| Short-form | 1080 × 1920 | 9:16 | TikTok, Reels, Shorts |

Both at **30fps**.
