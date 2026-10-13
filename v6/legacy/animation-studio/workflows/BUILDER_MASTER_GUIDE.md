# BUILDER MASTER GUIDE — Mandatory Reading Before Every Build

> **RULE: Builder (Claude Code) MUST read this file + all referenced docs BEFORE writing a single line of code.**
> **Skipping ANY step = monotonous video. Follow 100%.**

---

## PRE-BUILD MANDATORY READING ORDER

Before building ANY video, read these files IN ORDER:

| Step | File | What to Extract | Time |
|------|------|----------------|------|
| 1 | `output/<slug>/annotated.json` | Sections, beats, frame numbers, narration | 2min |
| 2 | `output/<slug>/spec.md` | Layout, composition pattern, hook template per section | 2min |
| 3 | `docs/hook-templates.md` | Choose specific template ID (A1-F3) for Section 1 | 1min |
| 4 | `docs/scene-composition-model.md` | Choose composition pattern per section (6 options) | 1min |
| 5 | `docs/design-system.md` | Domain palette, layout per section (8 options), zone grid | 1min |
| 6 | `docs/component-registry.md` | Available components + props for this build | 1min |
| 7 | `docs/markup-schema.md` | How each META tag type maps to visual component | 1min |
| 8 | `CLAUDE.md` | All 33 rules — verify build plan against each | 1min |

**Total: ~10 min reading. Saves hours of rebuild.**

---

## STEP-BY-STEP BUILD PROCESS

### STEP 1: Analyze Script & Beats

Read `annotated.json`. For EACH section, note:
- Section narration (what's being said)
- Beat types (EM, E, STAT, META, LIST, QUOTE, CLOSE)
- META subtypes (comparison? timeline? tension? chart?)
- Frame ranges and beat density
- Emotional arc (hook → build → peak → resolution → close)

### STEP 2: Choose Hook Template (Section 1 ONLY)

Open `docs/hook-templates.md`. Match script opening to template:

| Script Opens With... | Best Templates |
|---------------------|---------------|
| Surprising stat/number | C1 (Shock Stat), C3 (Chart Build), C4 (Counter Race) |
| Question/mystery | E3 (Question Hold), E4 (Building Suspense), B4 (Focus Pull) |
| Contrast/tension | B5 (Split Screen Slam), D2 (Visual Metaphor Bridge) |
| Analogy/metaphor | D1 (Icon Hero), D2 (Metaphor Bridge), D4 (Ambient Scene) |
| Bold statement | A1 (Text Accumulation), B6 (Title Card), A2 (Word Explosion) |
| Slow atmospheric | F1 (Slow Burn), F2 (Environment Build), F3 (Color Story) |

**Write down:** Template ID + its region layout + beat persistence modes.

### STEP 3: Choose Layout Per Section (MUST VARY)

Open `docs/design-system.md` → Layout System. Assign layout to each section:

```
Section 1 (hook):    cinematic / split-h     ← dramatic opening
Section 2 (build):   split-v / stacked       ← show progression
Section 3 (build):   grid / radial           ← show relationships
Section 4 (peak):    centered / floating     ← focus on key insight
Section 5 (peak):    split-h / cinematic     ← comparison or drama
Section 6 (resolve): stacked / grid          ← show solution
Section 7 (close):   cinematic / centered    ← final impression
```

**Rules:**
- Never same layout 3 sections in a row
- Max 2 "centered" per 5 sections
- Must use at least 5 of 8 layout types per video

### STEP 4: Choose Composition Pattern Per Section

Open `docs/scene-composition-model.md`. Match narration content to pattern:

| Content Type | Best Pattern |
|-------------|-------------|
| Central concept + properties | Hub-Spoke |
| Events in sequence | Timeline |
| A vs B, pro vs con | Comparison |
| Deep dive into topic | Zoom-In |
| Arguments/evidence | Scale/Balance |
| Final statement + evidence | Verdict |

**Write down:** Pattern per section. Must use at least 4 different patterns per video.

### STEP 5: Map META Tags to Visual Components

Open `docs/markup-schema.md`. For each META tag in annotated.json:

| META Type | Visual Component |
|-----------|-----------------|
| `comparison: split` | SplitScreen with left/right panels |
| `comparison: before-after` | BeforeAfterSlider |
| `timeline: milestone` | EventTimeline with milestone dots |
| `chart: bar/line/pie` | Actual chart SVG (NOT just text) |
| `tension: trade-off` | TugOfWar or BalanceScale SVG |
| `progress: steps` | StepProgress with numbered nodes |
| `map: highlight` | World/region map SVG with highlights |
| `icon: group` | IconGrid with labeled icons |
| `hierarchy: pyramid` | PyramidChart SVG |
| `flow: cycle` | CycleDiagram with arrows |
| `reveal: spotlight` | SpotlightScan animation |
| `transformation: morph` | MorphShape SVG sequence |
| `metaphor: iceberg` | IcebergDiagram SVG |

**CRITICAL:** META tags are NOT decorative. Each META tag MUST produce a UNIQUE visual component. If you see `META: type=comparison, subtype=split` — you MUST build a SplitScreen, not just another centered text.

### STEP 6: Choose Domain Palette

Open `docs/design-system.md` → Domain Palettes. Match script topic:

| Topic | Domain | BG | Primary | Secondary |
|-------|--------|-----|---------|-----------|
| Technology/AI/Code | tech | #080B14 | #60A5FA | #A78BFA |
| Money/Economy/Markets | finance | #0A0D14 | #FBBF24 | #34D399 |
| War/Civilization/Events | history | #0C0A14 | #E8B931 | #C4A6F0 |
| Earth/Countries/Climate | geography | #081210 | #34D399 | #67E8F9 |
| Life/Nature/Medicine | biology | #080F10 | #2DD4BF | #67E8F9 |
| Space/Quantum/Energy | physics | #0A0810 | #A78BFA | #60A5FA |
| Culture/Society/People | social | #100810 | #F472B6 | #C084FC |
| Crime/Mystery/Thriller | crime | #0A0E1A | #E8B931 | #60A5FA |

### STEP 7: Build Constants File

Create `constants.ts` with:
- COLORS from domain palette
- SECTIONS from annotated.json (start/end/natural frames)
- TRANSITIONS (varied: 15-25 frames each, mix fade/slide/wipe)
- DURATIONS (natural + outgoing transition, last = natural only)
- BEATS per section (relative to section start)
- ZONES (9-zone grid coordinates)
- SPRING_CONFIGS (smooth, snappy, bouncy, heavy)
- FPS = 30

**Verify:** `SUM(durations) - SUM(transitions) == total_audio_frames`

### STEP 8: Build Components (100% New)

Create domain-specific components:
- ParticleField (domain colors, shapes matching topic)
- AmbientShapes (geometric shapes matching domain)
- Vignette (custom breathing rate)
- All SVG icons (NEW designs, not copied from other videos)

### STEP 9: Build Each Scene

For EACH section, follow this checklist:

```
□ Layout matches plan from Step 3? (not default centered)
□ Composition pattern matches Step 4? (not default hub-spoke)
□ META tags produce correct visual from Step 5? (not just text)
□ Hook template followed from Step 2? (Section 1 only)
□ 4-layer stacking? (BG + Ambient + Content + Overlay)
□ All elements have zone comments? (// Z5: hero element)
□ No zone overlaps? (max 1 element per zone)
□ Hero SVG >= 300px?
□ Active element >= 35% canvas width?
□ Every text has icon companion?
□ Micro-motion on all settled elements? (Math.sin/cos)
□ Relocate pattern correct? (old moves AT new's frame, not before)
□ No visibility gates? (no return null based on frame)
□ BG opacity separated from content opacity?
```

### STEP 10: Build Main Composition

- TransitionSeries (NOT plain Sequence)
- calculateMetadata from audio
- Audio component
- premountFor={60} on every Sequence
- Varied transition types between sections

### STEP 11: Validate

```bash
python scripts/validate_build.py <slug>
```

Fix ALL FAILs before render. 0 FAIL required.

### STEP 12: Render

```bash
npx remotion render src/index.ts <CompositionId> output/<slug>/render/final.mp4
```

---

## ANTI-PATTERNS — What Makes Videos "1 mau" (Monotonous)

| Anti-Pattern | Why It Happens | Fix |
|-------------|---------------|-----|
| Every scene = centered SVG + text | Didn't choose varied layouts (Step 3) | Use 5+ of 8 layouts per video |
| Every hook = scale-burst spring | Didn't read hook-templates.md (Step 2) | Choose specific template A1-F3 |
| META tags ignored | Didn't map tags to visuals (Step 5) | Each META = unique visual component |
| Same dark BG + particles | Didn't match domain palette (Step 6) | Use domain-specific colors |
| All text is ShinyText | Component registry has 7 text types | Mix: ShinyText, BlurText, GlitchText, GradientText, AnimatedText |
| Same transition everywhere | Default fade | Mix: fade, slide, wipe, flip |
| Same spring config | Default smooth | Mix: smooth, snappy, bouncy, heavy per beat role |
| No charts/diagrams | STAT/META tags not translated | META type=chart → actual chart SVG |
| Same entrance animation | Default spring from 0 to 1 | Vary: slideUp, slideLeft, scaleIn, blurFocus, typewriter |

---

## QUALITY CHECKLIST — Final Gate

Before declaring build complete:

1. [ ] Read ALL 8 files from Pre-Build Reading Order?
2. [ ] Hook uses specific template from hook-templates.md?
3. [ ] At least 5 different layouts used across sections?
4. [ ] At least 4 different composition patterns used?
5. [ ] ALL META tags produce unique visual components?
6. [ ] Domain palette matches script topic?
7. [ ] Validator passes with 0 FAIL?
8. [ ] No 3 consecutive scenes look similar?
9. [ ] At least 3 different entrance animations used?
10. [ ] At least 3 different text component types used?
