# Stage 3: Builds — Composition Development

## What This Folder Is

Build tracking stage. Metadata files here track status. The actual code lives in `../../src/compositions/`.

**Input:** `../02-specs/[format]/[pillar]/[slug]-spec.md`
**Output:** Remotion composition in `../../src/compositions/EdubaShorts/clips/P[X]-[pillar]/[ClipName]/`

**Your job is translation, not interpretation.** The spec made all creative decisions. You turn frame-range blocks into React components and BEATS constants into timing code.

---

## What to Load Before Building

| Priority | File | Why |
|----------|------|-----|
| **1 — Always** | The spec | Your blueprint — every color, position, prop, frame number |
| **2 — Always** | One existing clip | Learn conventions: import paths, file structure, Sequence patterns |
| **3 — Always** | `../../src/compositions/EdubaShorts/index.tsx` | Where to register your composition |
| **4 — On demand** | `../../docs/component-registry.md` | Only if spec references unfamiliar component |
| **5 — On demand** | Remotion documentation | Only for API questions |

**Don't load:** Design system (spec already has exact values), other specs, scripts.

---

## Composition Folder Structure

```
src/compositions/EdubaShorts/clips/P[X]-[pillar]/[ClipName]/
├── index.tsx           ← Main composition entry point
├── timing.ts           ← TOTAL_DURATION + section frame ranges
├── audio.ts            ← Audio file path + calculateMetadata
├── scenes/             ← One file per section from spec
│   ├── Section1.tsx
│   ├── Section2.tsx
│   └── ...
└── components/         ← Project-specific custom components
    ├── [CustomComponent].tsx
    └── index.ts
```

---

## Audio Integration (Required in Every Build)

### calculateMetadata
Never hardcode `durationInFrames`. Always derive from audio:

```typescript
// index.tsx
import { Composition, CalculateMetadataFunction, getAudioDurationInSeconds } from 'remotion';

type Props = { audioSrc: string; timestampsSrc: string };

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const durationInSeconds = await getAudioDurationInSeconds(props.audioSrc);
  return {
    durationInFrames: Math.ceil(durationInSeconds * 30),
    fps: 30,
    width: 1920,
    height: 1080,
  };
};

export const MyComposition: React.FC<Props> = ({ audioSrc }) => {
  return (
    <>
      <Audio src={audioSrc} />
      {/* scenes */}
    </>
  );
};
```

### Static file setup
Place audio in `public/audio/[slug].mp3`.
Place timestamps in `public/timestamps/[slug]-timestamps.json`.

Reference:
```typescript
import { staticFile } from 'remotion';
const audioSrc = staticFile('audio/[slug].mp3');
const timestampsSrc = staticFile('timestamps/[slug]-timestamps.json');
```

---

## Build Workflow

### 1. Create active build file
`active/[slug].md` with metadata and progress checklist.

### 2. Set up composition folder
Create `src/compositions/EdubaShorts/clips/P[X]-[pillar]/[ClipName]/` with the files above.

Place audio and timestamps in `public/`:
```
public/audio/[slug].mp3
public/timestamps/[slug]-timestamps.json
```

### 3. Create timing.ts
```typescript
// timing.ts
export const SECTIONS = {
  section1: { start: 0, end: 312 },
  section2: { start: 313, end: 661 },
  // ... from spec section frame ranges
};

// TOTAL_DURATION comes from calculateMetadata, but export for registration fallback:
export const ESTIMATED_DURATION = 1140; // update after first render
```

### 4. Translate spec section by section
For each section in the spec:
1. Create `scenes/Section[N].tsx`
2. Copy BEATS constant from spec directly (these are global frames — convert to local by subtracting section start frame inside `<Sequence from={section.start}>`)
3. Translate each frame-range micro-block to JSX + Remotion springs
4. Use inline component props exactly as written in spec
5. Build custom components described in spec's "Project-Specific Components"

### 5. Assemble in index.tsx
**MUST use `<TransitionSeries>`** — NEVER plain `<Sequence>` for section assembly. Match transition type to spec's `**Transition out:**` field.

```tsx
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { flip } from '@remotion/transitions/flip';
import { clockWipe } from '@remotion/transitions/clock-wipe';

export const MyComposition: React.FC<Props> = ({ audioSrc, timestampsSrc }) => (
  <>
    <Audio src={audioSrc} />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={312}>
        <Section1 />
      </TransitionSeries.Sequence>
      {/* Transition type from spec — fade(), slide(), wipe(), flip(), clockWipe() */}
      <TransitionSeries.Transition
        presentation={fade()}  // or slide({ direction: 'from-left' }), wipe(), etc.
        timing={linearTiming({ durationInFrames: 20 })}
      />
      <TransitionSeries.Sequence durationInFrames={349}>
        <Section2 />
      </TransitionSeries.Sequence>
      {/* ... fade between ALL sections */}
    </TransitionSeries>
  </>
);
```

**CRITICAL: TransitionSeries Audio-Visual Sync Rule**

TransitionSeries transitions OVERLAP adjacent scenes. A 20-frame fade means
the next scene starts 20 frames BEFORE the current scene ends visually.
If not compensated, visuals progressively desync from audio (2-5s by end).

**CORRECT pattern — each scene duration includes OUTGOING transition:**

```
S1 duration = natural + T(S1→S2)
S2 duration = natural + T(S2→S3)
...
S(N-1) duration = natural + T(S(N-1)→SN)
SN (last) duration = natural only (no outgoing)
```

Example with 7 scenes, transitions [20,20,15,20,20,25]:
```
S1: 241+20=261, S2: 393+20=413, S3: 809+15=824,
S4: 529+20=549, S5: 1306+20=1326, S6: 1394+25=1419, S7: 791
Verify: 261+413+824+549+1326+1419+791 - 120 = 5463 ✓
```

**Scene exit timing must extend to new duration:**
```tsx
// sceneExit fades at the END of extended duration (not natural end)
const sceneExit = interpolate(frame, [natural_end, natural_end + outgoing_T], [1, 0]);
// NOT at natural_end — that causes double-fade with TransitionSeries
```

**WRONG patterns (cause desync or black screen):**
- ❌ Adding SUM(all transitions) to LAST scene only → audio desync 2-5s for all other scenes
- ❌ Scene exit at natural end while duration extended → double-fade, premature black
- ❌ No compensation at all → black screen at end + desync
- ❌ Using --props with fake audio URL for full render → render crash

**Available transitions:**
- `fade()` — default, works for most transitions
- `slide({ direction: 'from-left' })` — directional slide
- `wipe({ direction: 'from-left' })` — edge wipe
- `flip({ direction: 'from-left' })` — 3D flip
- `clockWipe()` — clock sweep

### 6. Register composition
Add to `src/compositions/EdubaShorts/index.tsx`:
```tsx
<Composition
  id="MyComposition"
  component={MyComposition}
  calculateMetadata={calculateMetadata}
  defaultProps={{
    audioSrc: staticFile('audio/[slug].mp3'),
    timestampsSrc: staticFile('timestamps/[slug]-timestamps.json'),
  }}
  width={1920}
  height={1080}
  fps={30}
/>
```

### 7. Test in Remotion Studio
```bash
npm run dev
```
Preview the composition. Verify animations are smooth, audio plays, visuals are icon/3D-heavy.

### 8. Move to complete
Move build file from `active/` to `complete/[format]/[pillar]/[slug].md`.

---

## Remotion Coding Rules

```typescript
// CORRECT — spring + interpolate
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const opacity = interpolate(
  spring({ frame, fps, config: { damping: 200 } }),
  [0, 1], [0, 1],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);

// FORBIDDEN — CSS transitions
style={{ transition: 'opacity 0.5s ease' }}  // ❌ Won't render correctly

// CORRECT — Sequence with premountFor
<Sequence from={90} durationInFrames={210} premountFor={fps}>
  <MyScene />
</Sequence>

// FORBIDDEN — Sequence without premountFor
<Sequence from={90} durationInFrames={210}>  // ❌ May flicker
  <MyScene />
</Sequence>
```

---

## Spring Config Reference

```typescript
const SPRING_CONFIGS = {
  gentle: { damping: 200 },                          // subtle reveals, text
  snappy: { damping: 20, stiffness: 200 },            // UI elements, quick
  bouncy: { damping: 8 },                             // playful entrances
  heavy:  { damping: 15, stiffness: 80, mass: 2 },    // dramatic, slow
};
```

---

## Build Quality Checklist

- [ ] `calculateMetadata` reads from audio file — duration not hardcoded
- [ ] `<Audio>` component included in composition
- [ ] Every BEATS frame matches spec (which came from Whisper)
- [ ] All component props match spec's inline descriptions exactly
- [ ] `premountFor={fps}` on every `<Sequence>`
- [ ] All animations use `spring()` + `interpolate()` — zero CSS transitions
- [ ] Custom components from spec built and in `components/`
- [ ] ZERO text-only beats — every text has icon/3D/SVG companion
- [ ] Beat ratio: max 20% text (with icon), min 70% SVG/icon/3D/chart
- [ ] No scene is exclusively text effects on AmbientBackground — must have visual content
- [ ] Named components from spec are actually built — not approximated with inline CSS
- [ ] Every element stays visible for at least its minimum hold time (SPEC_GENERATOR.md STEP 7.5)
- [ ] Text overlays are short (≤10 words per line) and positioned on top of visual content
- [ ] Scene layout declared and varies — never same layout 3 sections in a row
- [ ] @remotion/shapes used for geometric elements
- [ ] Closing section follows BlurText + hero icon + glow + 60f hold pattern
- [ ] Composition registered in `src/compositions/EdubaShorts/index.tsx`
- [ ] Tested in Remotion Studio — audio plays, visuals rich, animations smooth
- [ ] No captions/subtitles in composition — visual storytelling only

---

## What NOT to Do

- **Don't hardcode `durationInFrames`** — use `calculateMetadata`
- **Don't add captions/subtitles** — visual storytelling only
- **Don't reinterpret the script** — the spec already made all decisions
- **Don't use CSS transitions** — always `spring()` + `interpolate()`
- **Don't skip `premountFor`** — it prevents flicker on Sequence elements
- **Don't store code in `03-builds/`** — code goes in `src/compositions/`
- **Don't make text the whole scene** — text MUST have icon/3D/SVG companion
- **Don't approximate named components with div soup** — if spec says FlowDiagram, build FlowDiagram in output/<slug>/build/components/
- **Don't let elements flash and vanish** — every element needs minimum hold time per STEP 7.5 in SPEC_GENERATOR
- **Don't put script-specific components in src/components/core/** — they belong in output/<slug>/build/components/
- **Don't create text-only beats** — ZERO text-only beats, always icon companion
- **Don't use fade() for ALL transitions** — read spec's `Transition out:` field, use matching type
- **Don't leave AmbientBackground at default particle size** — always specify >= 6px radius
- **Don't skip Layer 1 (ambient) or Layer 3 (overlay)** — scene will look flat and empty
- **Don't use CenteredLayout for > 2 of 5 consecutive sections** — vary layouts

---

## HARD RULES — Lessons from Production Bugs

These rules are NON-NEGOTIABLE. Violations cause black screens, static video, or viewer thinking video is broken.

### 1. NEVER use visibility gate with Sequence
```typescript
// FORBIDDEN — causes permanent black screen
if (frame < SCENE_START || frame >= SCENE_END) return null;
```
`useCurrentFrame()` inside `<Sequence from={N}>` returns LOCAL frame (starts at 0). Checking `frame < SCENE_START` where SCENE_START > 0 is ALWAYS true → return null → BLACK SCREEN. Sequence handles mount/unmount automatically.

### 2. NEVER put opacity on background element
```tsx
// FORBIDDEN — background becomes transparent
<AbsoluteFill style={{ backgroundColor: COLORS.bg, opacity: fadeValue }}>

// CORRECT — separate background from content
<AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
  <AbsoluteFill style={{ opacity: fadeValue }}>
    {/* content */}
  </AbsoluteFill>
</AbsoluteFill>
```

### 3. NEVER leave content gaps between phases
When Phase N fades out and Phase N+1 mounts, first content in Phase N+1 MUST appear within 15 frames. Every Whisper beat in timing.ts MUST have a visual — no orphan beats. Add bridge content (cards, icons) to fill gaps.

### 4. EVERY element needs continuous micro-motion after appearing
After spring entrance settles, add: glow pulse (`Math.sin(frame * 0.04 + i)`), scale breathing (`* 0.003`), shimmer, or border pulse. **NO element should look identical at frame N and frame N+90.**

### 5. Beat diversity — VISUAL-FIRST (NON-NEGOTIABLE)
- **TEXT beats: max 20%** — always with icon/3D/SVG companion, NEVER text alone
- **GRAPHIC beats: min 70%** — SVG icons, charts, diagrams, 3D shapes, @remotion/shapes
- MOTION + COLOR + PARTICLE: min 10% combined
- **ZERO text-only beats** — every text MUST have icon/shape beside it
- **Every keyword/concept → 1 inline SVG icon** describing it
- Use generously: @remotion/shapes (Circle, Star, Pie, Triangle), custom SVG icons, charts (bar/line/pie/donut), flow diagrams, hub-spoke, pyramids, 3D objects, @remotion/paths for morphing
- Scene layout MUST vary — never same layout 3x in a row (8 layouts available)

### 7. Particle quality — radius >= 6px, count >= 20
Every AmbientBackground/Particle component: `particleRadius` >= 6px, `particleCount` >= 20. Every particle MUST have `boxShadow: '0 0 ${radius*3}px ${color}'` glow effect. Grep for particle `size:`, `width:`, `r:` — if any value < 12 (diameter), increase to 12+.

### 8. 4-layer stacking — EVERY scene
Every scene file MUST render 4 layers:
- **Layer 0 (BG):** `AbsoluteFill` with `backgroundColor`, ALWAYS opaque
- **Layer 1 (Ambient):** `AbsoluteFill` with particles (>= 6px radius) + geometric shapes (80-200px circles/arcs/lines, opacity 0.08-0.15)
- **Layer 2 (Content):** `AbsoluteFill` with animated opacity — all visual beats
- **Layer 3 (Overlay):** Vignette (radial gradient, opacity 0.5-0.7) + scan line (1px, 0.5px/frame, opacity 0.04-0.08)

Grep each scene for `AbsoluteFill` — must have at least 3-4 instances.

### 9. Pre-render checklist (MUST DO)
1. `grep "return null"` — remove frame-based visibility gates
2. `grep "backgroundColor.*opacity"` same element — separate bg/content
3. Phase transitions: first content within 15f of phase start
4. Beat coverage: every timing.ts beat has a visual
5. Micro-motion: every settled element has glow/breathe/shimmer
6. Beat diversity: max 20% text beats (with icon), min 70% visual beats
7. `interpolate()` arrays strictly monotonically increasing
8. All imports resolve (no missing modules)
9. **AmbientBackground particleRadius >= 6px in every scene**
10. **Vignette overlay present in every scene (Layer 3)**
11. **Section layouts vary — no 3 consecutive same layout**
12. **TransitionSeries used (not plain Sequence) for section assembly**
13. **No phase gaps > 20 frames without bridge content**
14. **Ambient geometric shapes present (3-5 per scene, 80-200px)**
15. **TransitionSeries per-scene compensation** — EACH scene (except last) has `durationInFrames = natural + outgoing_transition`. Last scene = natural only. Verify: `SUM(all_durations) - SUM(all_transitions) = audio_total_frames`. Render LAST FRAME to confirm content (not black). Render MIDPOINT frame and compare visual vs audio timing — should be within 0.5s.
16. **Comparison scenes balanced** — if scene uses COMPARISON pattern, render frame at 25% and verify BOTH sides have content
17. **No unicode escapes in text** — `grep '\\u[0-9A-Fa-f]' scenes/*.tsx` should find nothing except JSX expressions
18. **Render command** — full render uses NO --props (defaultProps with staticFile). Debug stills CAN use fake --props URLs.
19. **Visual companion check** — `grep -n 'WordByWord\|ShinyText' scenes/*.tsx` → every match MUST have SVG/icon element in the same parent flex container. Text without icon = VIOLATION.
20. **SYNTHESIS beats visual check** — every SYNTHESIS beat MUST have icon >= 60px alongside text. Text-only synthesis = FORBIDDEN.
21. **Background matches domain** — particle style, shape types, and color temp must match script topic (see `../../docs/design-system.md` Background Presets by Domain).

### 10. Scene Composition Rules (ALL scenes — replaces usePhaseLifecycle)

**`usePhaseLifecycle` is BANNED.** This hook causes slideshow effect where beats take turns at center, each entering → dimming → shrinking → fading to 0. It is DELETED from all scene files.

**Every scene MUST follow the Scene Composition Model** (see `../../docs/scene-composition-model.md`):

1. **ANCHOR element required** — persistent visual (120-200px) staying entire scene at opacity >= 0.6. Can be an icon, chart, diagram, or symbolic element. NEVER dims below 0.6.

2. **Beats have ROLES** — not all beats are the same size/position/importance:
   - **ANCHOR**: 120-200px, center/dominant, opacity >= 0.6 always, stays ENTIRE scene
   - **PRIMARY**: 60-96px, prominent position, stays full opacity (non-overlapping = NO dimming)
   - **SUPPORT**: 32-48px, near its PRIMARY, enters with/after primary, full opacity after entrance
   - **CONNECTOR**: SVG arrows/lines/brackets linking beats, opacity 0.2-0.4
   - **SYNTHESIS**: 72-120px, appears LAST, highlights entire composition

3. **Beats ACCUMULATE with RELOCATE positions** — each beat stays visible after spring entrance, but existing beats **smoothly relocate** to new (x,y) positions when new beats enter. Use `interpolate(frame, [...phaseBreakpoints], [...positions])` to keyframe each beat's `left`/`top`/`scale` across phases. Older beats move to corners/edges and scale down (0.5-0.7×), dimming to 0.5-0.85 opacity. The newest beat takes the prime position (center/prominent). This prevents pile-up overlap and utilizes the full 1920×1080 canvas. Non-overlapping beats do NOT dim each other. At scene END, ALL beats visible at their final positions. **NEVER opacity → 0 during scene.**

4. **Visual connections required** — at least 2 CONNECTOR elements per scene (arrows, lines, dashed paths, brackets) linking related beats.

5. **Final frame = full composition** — at scene's last frame, ALL beats visible at their positions. This single frame should summarize the scene's entire argument visually.

6. **Each beat has RELOCATABLE position** — NO `inset: 0` on all beats. Each beat renders at its own `left: Xpx, top: Ypx` coordinates, and those coordinates CHANGE via `interpolate()` when new phases/beats enter. See `../../docs/design-system.md` Element Relocate Pattern.

7. **Composition patterns** — choose per scene: Hub-Spoke, Timeline, Comparison, Zoom-In, Scale/Balance, Verdict (see `../../docs/scene-composition-model.md`)

**Pattern-specific rules:**
- **COMPARISON pattern**: BOTH sides MUST have content from scene start. If RIGHT has N support beats, LEFT needs >= N-1. Titles must appear on BOTH sides. Comparison pairs enter within 30 frames of each other.
- **TIMELINE pattern**: Axis line must draw first. Dots accumulate left-to-right.
- **HUB-SPOKE pattern**: Anchor at center, spokes radiate outward with arrows.
- **VERDICT pattern**: Donut/chart on one side, text accumulates on the other.

**Text content rules:**
- NEVER use `\uXXXX` escape sequences in text content — always use actual characters: `—` not `\u2014`, `•` not `\u2022`
- Exception: `{'\u20BF'}` in JSX expressions for Bitcoin symbol is OK

**FORBIDDEN patterns:**
- `usePhaseLifecycle` — DELETED, never use
- `inset: 0` on all beats — each beat needs own (x,y)
- `opacity → 0` during scene — minimum dim is 0.3
- All beats same size/position — no hierarchy = slideshow
- Beat enters then fades out — beats STAY
- **Fixed (x,y) that never changes** — beats MUST relocate when new beats enter
- **Pile-up center** — all elements entering at same position, overlapping
- Comparison scene with only ONE side populated — MUST have both sides from start

**Implementation pattern (with RELOCATE):**
```typescript
const EC = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

// Anchor starts center, moves left when primary enters, moves top-left when synthesis enters
const anchorX = interpolate(frame, [0, 190, 210, 490, 510], [960, 960, 300, 300, 120], EC);
const anchorY = interpolate(frame, [0, 190, 210, 490, 510], [400, 400, 200, 200, 100], EC);
const anchorScale = interpolate(frame, [0, 190, 210, 490, 510], [1, 1, 0.7, 0.7, 0.55], EC);
const anchorOpacity = interpolate(frame, [190, 210, 490, 510], [1, 0.75, 0.75, 0.6], EC);

// Primary enters at center when anchor moves aside
const primaryEntry = spring({ frame: Math.max(0, frame - 200), fps, config: SNAPPY });
const primaryX = interpolate(frame, [200, 490, 510], [960, 960, 1400], EC);
const primaryY = interpolate(frame, [200, 490, 510], [400, 400, 120], EC);
const primaryScale = interpolate(frame, [490, 510], [1, 0.65], EC);

// Synthesis takes center when both relocate
const synthEntry = spring({ frame: Math.max(0, frame - 500), fps, config: SNAPPY });
// synthX/synthY = center (960, 500) — prime position
```

### 11. Hook Build Checklist (MANDATORY for section_role = "hook")

In addition to the general pre-render checklist, every hook scene MUST pass these checks:

1. **Template match**: Scene follows a template from `../../docs/hook-templates.md`. Comment at top of file: `// Hook template: [ID] — [Name]`
2. **Frame occupation**: By the hook's last frame, non-bg/non-ambient content spans >= 1152px wide × 648px tall (60% of 1920×1080)
3. **Beat persistence**: NO beat reaches opacity 0 before end of hook section. Grep for opacity assignments — if any beat fades to 0, fix it. Use PERSIST (dim to 0.5), TRANSFORM (morph), or BRIDGE (0.1-0.2 background)
4. **Region declaration**: Every content element has explicit x, y pixel coordinates. No "center everything" — content uses declared regions across the frame
5. **Accumulation count**: At hook's last frame, count of visible content elements >= number of content beats. Everything the viewer saw is still present in some form
6. **Professional signals**:
   - At least 1 non-text visual (icon, chart, shape) visible by frame 30
   - Typography uses >= 2 different font sizes for visual hierarchy
   - Side margins (< 8% from edges) are NOT empty — ambient shapes, decorative lines, or dim accents fill them
   - Content fills the wide 1920px frame — no "tiny centered cluster" effect
7. **No beat swapping**: Beats do NOT take turns at the same position. Each beat has its OWN spatial position (via regions) or the stack visibly grows/compresses

**Anti-patterns for hooks (FORBIDDEN):**
- All beats at same center position, fading in/out = viewer sees "flashing" content
- Beat visible for < 30 frames then opacity→0 = too fast, disappears
- Content using < 30% of 1920px width = wasted screen space
- `usePhaseLifecycle` pattern (enter→hero→recede→linger→fade) = REPLACED by persistence model
- Only text effects (BlurText, ShinyText) with no supporting visual = not a professional hook

---

## Build Validator (Step 7.5 — Automated Rule Enforcement)

Run after build, before render. Catches rule violations automatically.

### Usage

```bash
# Standalone
python scripts/validate_build.py <slug>
python scripts/validate_build.py fuel-price-crisis

# With pipeline
python scripts/pipeline.py input/script.md --validate

# Strict mode (WARN = FAIL)
python scripts/validate_build.py fuel-price-crisis --strict

# JSON output
python scripts/validate_build.py fuel-price-crisis --json
```

### What It Checks (15 rules)

| Check | Rule | Severity | What |
|-------|------|----------|------|
| No CSS transitions | #1 | FAIL | grep transition:/animation: in styles |
| 4-layer stacking | #15 | FAIL | AbsoluteFill count, particles, vignette imports |
| Zone overlap | #25 | FAIL | Parse // Z#: comments, flag duplicates |
| Element sizes | #24 | FAIL | fontSize/SVG size vs minimums (84px hero, 100px primary) |
| Particle minimums | #14 | FAIL/WARN | radius >=6, count >=20, boxShadow |
| Beat diversity | #12 | WARN | text vs SVG element ratio |
| TransitionSeries | #13 | FAIL | Must use TransitionSeries, not plain Sequence |
| Layout variation | #16,#19 | WARN | No 3 consecutive same, max 2 centered/5 |
| Text+icon companion | #17 | FAIL | Text elements need SVG within ~20 lines |
| Micro-motion | #11 | WARN | Math.sin/cos or spring per scene |
| calculateMetadata | #3 | FAIL | Must read audio duration, not hardcode |
| premountFor | seq | WARN | Every Sequence needs premountFor |
| No visibility gates | #8 | WARN | No return null based on frame checks |
| BG opacity separation | #9 | FAIL | No backgroundColor+opacity on same element |
| Transition compensation | ts | WARN | Duration math correctness |

### Exit Codes

- `0` = all PASS (WARN ok)
- `1` = any FAIL
- With `--strict`: WARN also causes exit 1

### Fixing Violations

The validator tells you exactly what to fix: file, line number, rule, and description. Fix all FAIL items before render. WARN items are quality improvements.
