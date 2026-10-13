# Design System

> **Core Principle**: Every animation should be both **entertaining** AND help the viewer **understand the concept**.

---

## Formats

| Format | Resolution | Aspect | Use |
|--------|-----------|--------|-----|
| **Long-form (default)** | 1920x1080 | 16:9 | YouTube |
| **Short-form** | 1080x1920 | 9:16 | TikTok, Reels, Shorts |

Both run at **30fps**. All specs and compositions must declare which format they target.

---

## Typography

### Size Minimums by Format

| Element | Long (1920x1080) | Short (1080x1920) | Notes |
|---------|-------------------|---------------------|-------|
| **Hero/Title** | 72–108px | 64–96px | Main scene titles |
| **Section Header** | 56–72px | 48–64px | Scene sections |
| **Body Text** | 48–56px | 40–52px | Must read at playback speed |
| **Subtext/Captions** | 36–44px | 32–40px | Supporting text |
| **Code Text** | 32–40px | 28–36px | Monospace only |
| **Labels** | 28–32px | 24–28px | Annotations |
| **Badges/Tags** | 18–24px | 16–20px | Type badges, timestamps |

- **Fill the frame** — if there's empty space, increase element sizes
- **Mobile-first for shorts** — assume 100% watch on phones
- **Long-form mobile** — assume 50% watch on phones, text must read at 480p

### Element Size Ratio Rules (1920×1080)

Every element must pass a **visibility ratio check** before being placed:

| Element Type | Minimum Size | Active/Focused Size | After Relocate (min) |
|-------------|-------------|---------------------|---------------------|
| **Hero Text** | 84px | ≥ 96px | 56px (scale ≥ 0.55) |
| **Primary Label** | 56px | ≥ 64px | 40px (scale ≥ 0.55) |
| **Secondary Label** | 40px | ≥ 48px | 32px (scale ≥ 0.55) |
| **Hero Icon/SVG** | 160px | ≥ 180px | 88px (scale ≥ 0.55) |
| **Primary Icon** | 100px | ≥ 120px | 55px (scale ≥ 0.55) |
| **Support Icon** | 60px | ≥ 70px | 50px (NEVER below 50px) |
| **Chart/Graph** | 1000×500px | 1400×700px | 600×300px |

**Rules:**
1. **Active element** (currently being narrated) MUST occupy ≥ 35% canvas width OR ≥ 30% canvas height — it's the HERO, must dominate the screen
2. **Relocated elements**: minimum scale = 0.55. Below 0.55 → fade out instead of keeping tiny
3. **Visibility check**: `elementWidth / 1920 < 0.08` OR `elementHeight / 1080 < 0.08` → TOO SMALL, scale up
4. **CountUp/STAT numbers**: minimum 72px when active, 48px when relocated
5. **When 4+ elements on screen**: use grid/stacked layout, NOT floating with tiny elements scattered

### Zone Grid System (Anti-Overlap)

Canvas 1920×1080 is divided into **9 fixed zones**. Each element MUST be assigned to exactly 1 zone. Two elements NEVER share a zone (except text+icon companions as a single group).

```
┌────────────────────────────────────────────────────────────────────────────┐
│  60px padding                                                              │
│  ┌──────────────┐  50px  ┌──────────────────────┐  50px  ┌──────────────┐ │
│  │     Z1       │  gap   │        Z2            │  gap   │     Z3       │ │
│  │  60-560      │        │     610-1310         │        │  1360-1860   │ │
│  │  y: 60-340   │        │     y: 60-340        │        │  y: 60-340   │ │
│  │  RELOCATED   │        │  RELOCATED / TITLE   │        │  RELOCATED   │ │
│  └──────────────┘        └──────────────────────┘        └──────────────┘ │
│                                50px gap                                    │
│  ┌──────────────┐        ┌──────────────────────┐        ┌──────────────┐ │
│  │     Z4       │        │     ★ Z5 ★           │        │     Z6       │ │
│  │  60-560      │        │     610-1310         │        │  1360-1860   │ │
│  │  y: 390-690  │        │     y: 390-690       │        │  y: 390-690  │ │
│  │  SPLIT-LEFT  │        │  HERO / ACTIVE BEAT  │        │  SPLIT-RIGHT │ │
│  └──────────────┘        └──────────────────────┘        └──────────────┘ │
│                                50px gap                                    │
│  ┌──────────────┐        ┌──────────────────────┐        ┌──────────────┐ │
│  │     Z7       │        │        Z8            │        │     Z9       │ │
│  │  60-560      │        │     610-1310         │        │  1360-1860   │ │
│  │  y: 740-1020 │        │     y: 740-1020      │        │  y: 740-1020 │ │
│  │  SUPPORT     │        │  SUB-LABELS / STATS  │        │  SUPPORT     │ │
│  └──────────────┘        └──────────────────────┘        └──────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Zone dimensions:**
- Corner zones (Z1, Z3, Z7, Z9): 500×280px each
- Center column (Z2, Z5, Z8): 700×280px each (wider for hero content)
- Side columns (Z4, Z6): 500×300px each
- **50px gap between all zones** — guaranteed no-overlap buffer

**Zone assignment rules:**
1. **Active beat → Z5** (center) or spanning Z4+Z5+Z6 for full-width elements
2. **Relocated elements → Z1, Z2, Z3 ONLY** (top row) — never relocate downward
3. **Split-h layouts**: left panel → Z4, right panel → Z6, shared title → Z2
4. **Grid layouts**: use Z1+Z3+Z7+Z9 (corners) with Z5 for central element
5. **Each element position MUST comment its zone**: `// Z5: active hero text`
6. **OVERLAP = BUG**: if two element bounding boxes intersect → must fix by reassigning zones

**Flow patterns mapped to zones:**
- **Top-Down**: Z2 → Z5 → Z8 (relocated go to Z1 or Z3)
- **Left-to-Right**: Z4 → Z5 → Z6 (relocated go to Z1, Z2, Z3)
- **Center-Expand**: Z5 → Z4+Z6 → Z1+Z2+Z3 (new active always Z5)
- **Quadrant**: Z1 → Z3 → Z7 → Z9 → Z5 (5th beat takes center)
- **Z-Pattern**: Z1 → Z3 → Z5 → Z7 → Z9

### Spatial Flow Patterns

Beats MUST follow a predictable spatial order. Choose ONE flow per scene:

```
┌─── TOP-DOWN FLOW ───────────────────────────────────────────────┐
│                                                                  │
│  Beat 1 ─────────────────── [CENTER-TOP, large]                  │
│                                                                  │
│  Beat 2 enters → beat 1 stays, beat 2 below ──────────────────  │
│                                                                  │
│  Beat 3 enters → beat 1 relocates TOP-LEFT (small),             │
│                   beat 2 stays, beat 3 below beat 2              │
│                                                                  │
│  Direction: ↓ down, relocated elements go ↑↰ top-left           │
└──────────────────────────────────────────────────────────────────┘

┌─── CENTER-EXPAND FLOW ──────────────────────────────────────────┐
│                                                                  │
│  Beat 1 ─────────────────── [DEAD CENTER, hero size]             │
│                                                                  │
│  Beat 2 enters → beat 1 slides LEFT, beat 2 takes RIGHT         │
│        ┌──────────┐  ┌──────────┐                                │
│        │  Beat 1   │  │  Beat 2   │                               │
│        └──────────┘  └──────────┘                                │
│                                                                  │
│  Beat 3 enters → beat 1+2 relocate UP (smaller),                │
│                   beat 3 takes CENTER-BOTTOM (large)             │
│                                                                  │
│  Direction: center → split → row above, new takes center         │
└──────────────────────────────────────────────────────────────────┘

┌─── QUADRANT FLOW ───────────────────────────────────────────────┐
│                                                                  │
│   ┌─────────┐              ┌─────────┐                           │
│   │ Beat 1  │              │ Beat 2  │                           │
│   │   TL    │              │   TR    │                           │
│   └─────────┘              └─────────┘                           │
│                                                                  │
│   ┌─────────┐              ┌─────────┐                           │
│   │ Beat 3  │              │ Beat 4  │                           │
│   │   BL    │              │   BR    │                           │
│   └─────────┘              └─────────┘                           │
│                                                                  │
│  Beat 5+ → all 4 shrink to corners, new beat takes CENTER       │
└──────────────────────────────────────────────────────────────────┘
```

**Rules:**
- Declare flow at top of each scene: `// Flow: center-expand`
- Relocated elements move in SAME direction (all go UP to Z1/Z2/Z3 row) — NOT scattered
- Max 4 visible elements at once — 5th element triggers oldest to fade out
- **Zone-based positioning**: every element MUST be in a zone (see Zone Grid System above) — 50px guaranteed gap between zones
- Active beat (being narrated) is ALWAYS the largest element on screen, ALWAYS in Z5 (or spanning Z4-Z6)
- Comment zone assignment in code: `// Z5: hero element` / `// Z1: relocated beat 1`

### Font Stack

```typescript
const TYPOGRAPHY = {
  code: { fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace' },
  display: { fontFamily: 'Inter, -apple-system, system-ui, sans-serif' },
  body: { fontFamily: 'Inter, -apple-system, system-ui, sans-serif' },
  quote: { fontFamily: 'Playfair Display, Georgia, serif' },
};
```

Use `@remotion/google-fonts` for loading. Call `loadFont()` at module level, specify only needed weights/subsets.

---

## Colors & Contrast

### Base Palette

```typescript
const COLORS = {
  background: '#0A0A0F',
  surface: '#141420',
  surfaceAlt: '#1C1C2E',

  text: '#E8EAF0',          // Primary — high contrast on dark bg
  textBright: '#FFFDF0',    // Maximum contrast — titles, hero text
  textMuted: '#B0B8C8',     // Secondary info — must still be readable
  textDim: '#8890A4',       // Badges/timestamps only — still visible

  primary: '#60A5FA',        // Vivid blue — links, emphasis
  accent: '#34D399',         // Vivid green — success, code
  warning: '#FBBF24',        // Bright amber — caution
  danger: '#F43F5E',         // Rose-crimson — errors
};
```

### Contrast Rules — MANDATORY

- Dark backgrounds (#0A–#1A) → body text minimum `#D1D5DB`, recommended `#E5E7EB+`
- **textDim** (`#8890A4`) is the absolute floor — nothing darker on dark backgrounds
- **Never** use gray `#6B7280` or darker as ANY text on dark backgrounds
- **Never** use low-opacity text for important information
- **Accent colors** (primary, warning, danger) must be vivid saturated variants — avoid washed-out mid-tones
- **Components** (panels, cards, nodes, dots) must use `surface` (#141420) or brighter as background — never same shade as scene background
- **Borders** on dark panels: minimum 2px, color at least `#3A3F55` (visible against surface)
- **SVG elements** (dots, lines, icons): stroke/fill minimum opacity 0.7 against scene background

### Color Psychology

| Color | Use For | Minimum lightness on dark bg |
|-------|---------|-----|
| `#60A5FA` (vivid blue) | Code, technical concepts | Already vivid |
| `#A78BFA` (vivid purple) | AI, abstract concepts | Not `#8B5CF6` — too dim |
| `#FBBF24` (bright amber) | Key insights, warnings | Not `#F59E0B` — too orange-dim |
| `#34D399` (vivid green) | Solutions, positive outcomes | Not `#10B981` — too dark |
| `#F43F5E` (rose-crimson) | Bugs, security, errors | Not `#EF4444` — use brighter |
| `#E8B931` (vivid gold) | Historical references, quotes | Not `#C9A227` — too muddy |

### Domain Palettes

Each content domain has a **full palette** with pre-validated contrast. The spec generator selects the appropriate palette based on script content.

```typescript
// Technology / CS
const TECH_PALETTE = {
  bg: '#080B14', surface: '#111827', surfaceAlt: '#1E293B',
  text: '#E2E8F0', textBright: '#F8FAFC', textMuted: '#94A3B8', textDim: '#7C8BA0',
  primary: '#60A5FA', secondary: '#A78BFA', danger: '#F43F5E', warning: '#FBBF24',
};

// Economics / Finance
const ECON_PALETTE = {
  bg: '#0A0D14', surface: '#141A28', surfaceAlt: '#1E2636',
  text: '#E8EAF0', textBright: '#FFFDF0', textMuted: '#A8B2C4', textDim: '#8890A4',
  primary: '#FBBF24', secondary: '#34D399', danger: '#F43F5E', warning: '#FB923C',
};

// History / Culture
const HISTORY_PALETTE = {
  bg: '#0C0A14', surface: '#1A1628', surfaceAlt: '#241E36',
  text: '#EDE8F0', textBright: '#FFFCF0', textMuted: '#B0A8C0', textDim: '#8E86A0',
  primary: '#E8B931', secondary: '#C4A6F0', danger: '#F43F5E', warning: '#FBBF24',
};

// Geography / Earth
const GEO_PALETTE = {
  bg: '#081210', surface: '#0F1E1A', surfaceAlt: '#1A2E28',
  text: '#E0F0EC', textBright: '#F0FFF8', textMuted: '#A0C4B8', textDim: '#80A498',
  primary: '#34D399', secondary: '#67E8F9', danger: '#F43F5E', warning: '#FBBF24',
};

// Biology / Medicine
const BIO_PALETTE = {
  bg: '#080F10', surface: '#101C1E', surfaceAlt: '#182A2E',
  text: '#E0F0F2', textBright: '#F0FFFE', textMuted: '#98C8CE', textDim: '#80AAB0',
  primary: '#2DD4BF', secondary: '#67E8F9', danger: '#F43F5E', warning: '#FBBF24',
};

// Physics / Math
const PHYSICS_PALETTE = {
  bg: '#0A0810', surface: '#14101E', surfaceAlt: '#1E1830',
  text: '#E8E4F2', textBright: '#FAF8FF', textMuted: '#B0A8C8', textDim: '#8E86A4',
  primary: '#A78BFA', secondary: '#60A5FA', danger: '#F43F5E', warning: '#FBBF24',
};

// Social / Policy
const SOCIAL_PALETTE = {
  bg: '#100810', surface: '#1E101E', surfaceAlt: '#2E1830',
  text: '#F0E4F0', textBright: '#FFF8FF', textMuted: '#C8A8C8', textDim: '#A488A4',
  primary: '#F472B6', secondary: '#C084FC', danger: '#F43F5E', warning: '#FBBF24',
};

// True Crime / Investigation
const CRIME_PALETTE = {
  bg: '#0A0E1A', surface: '#151A2E', surfaceAlt: '#1E2440',
  text: '#E8EAF0', textBright: '#FFFDF0', textMuted: '#A0A7BE', textDim: '#7E8598',
  primary: '#E8B931', secondary: '#60A5FA', danger: '#F43F5E', warning: '#FBBF24',
};

// Mixed / General
const GENERAL_PALETTE = {
  bg: '#0A0A14', surface: '#141420', surfaceAlt: '#1C1C2E',
  text: '#E8EAF0', textBright: '#FFFDF0', textMuted: '#B0B8C8', textDim: '#8890A4',
  primary: '#FBBF24', secondary: '#60A5FA', danger: '#F43F5E', warning: '#FB923C',
};
```

**Rules for all palettes:**
- `bg` → `surface` contrast: surface must be visibly lighter (min +10 lightness in HSL)
- `text` on `bg`: contrast ratio >= 10:1
- `textMuted` on `bg`: contrast ratio >= 5:1
- `textDim` on `bg`: contrast ratio >= 3.5:1 (only for badges/timestamps)
- `primary` on `bg`: saturated, vivid — never washed out
- All accent colors must be the **vivid** variant, not the default Tailwind mid-tone

---

## Layout & Spacing

### Safe Margins by Format

| | Long (1920x1080) | Short (1080x1920) |
|---|---|---|
| **Minimum margin** | 5% (96px horiz, 54px vert) | 5% (54px horiz, 96px vert) |
| **Recommended margin** | 8% (154px horiz, 86px vert) | 8% (86px horiz, 154px vert) |
| **Platform safe zone** | N/A | Top 15% and bottom 20% — avoid text/CTAs (UI overlays) |

**Shorts-specific:** TikTok/Reels/Shorts overlay usernames, like buttons, captions, and descriptions on the bottom ~20% and top ~15% of the screen. Keep critical content in the center 65%.

### Visual Hierarchy

- **One focal point** per scene at any given moment
- Dim/blur non-active elements
- Use glow/highlight to draw attention
- Avoid distracting motion in periphery
- Don't leave large empty areas — fill the space or increase element sizes

---

## Animation — Remotion Rules

### Fundamentals

1. **All animations MUST use `useCurrentFrame()` + `interpolate()` or `spring()`** — CSS transitions and Tailwind animation classes are FORBIDDEN (they don't render correctly)
2. Write timing in seconds, multiply by `fps` from `useVideoConfig()`
3. Always clamp interpolations: `{ extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }`

### Spring Configurations

```typescript
const SPRING_CONFIGS = {
  smooth: { damping: 200 },                          // No bounce — subtle reveals
  snappy: { damping: 20, stiffness: 200 },            // Quick, minimal bounce — UI elements
  bouncy: { damping: 8 },                             // Playful entrances
  heavy: { damping: 15, stiffness: 80, mass: 2 },     // Dramatic, slow
};
```

Usage: `spring({ frame, fps, config: SPRING_CONFIGS.smooth })`

Use `delay` param to offset: `spring({ frame, fps, delay: 20 })`

Use `durationInFrames` to force specific duration: `spring({ frame, fps, durationInFrames: 40 })`

Combine with interpolate to map 0→1 to custom ranges:
```typescript
const s = spring({ frame, fps });
const rotation = interpolate(s, [0, 1], [0, 360]);
```

### Sequencing

- Use `<Sequence from={...} durationInFrames={...}>` to delay elements
- **Always set `premountFor={1 * fps}`** on every Sequence
- Use `layout="none"` when items shouldn't be wrapped in absolute fill
- Use `<Series>` for back-to-back scenes without overlap
- Inside a Sequence, `useCurrentFrame()` returns local frame (starts at 0)

### Transitions (between scenes)

Use `<TransitionSeries>` from `@remotion/transitions`:

```typescript
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}><SceneA /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
  <TransitionSeries.Sequence durationInFrames={60}><SceneB /></TransitionSeries.Sequence>
</TransitionSeries>
```

Available: `fade`, `slide` (with direction), `wipe`, `flip`, `clockWipe`. Transitions **shorten** total duration (scenes overlap).

### Timing Reference (at 30fps)

| Timing | Frames | Duration |
|--------|--------|----------|
| Quick fade | 15 | 0.5s |
| Normal fade | 30 | 1s |
| Slow fade | 60 | 2s |
| Stagger delay | 3–5 | Between list items |
| Scene buffer | 30 | Between sections |

---

## Effect Categories

### Ambient (Background/Mood)

| Effect | Use When |
|--------|----------|
| `AmbientBackground` (particles) | Code/tech discussions |
| `Vignette` | Almost always — draws eyes to center |
| `ShiftingGradient` | Topic transitions, section intros |
| Aurora (react-bits) | AI/ML topics, "wow" moments |

Backgrounds must be **subtle** — never compete with content. Match particle color to topic.

**AmbientBackground HARD MINIMUMS:**
- `particleRadius` >= 6px (HARD MINIMUM), recommended 8-12px for long-form
- `particleCount` >= 20 for low energy, 30 for medium, 45 for high
- `glowRadius` = particleRadius × 3 (boxShadow glow — MANDATORY on every particle)
- `opacity` range [0.15, 0.4] — NEVER below 0.15

**Vignette:** Always present (Layer 3), opacity 0.5-0.7, breathing via `Math.sin(frame * 0.03) * 0.1`

**Background Presets by Domain** — 1 background per video, matched to script topic:

| Domain | Particle Style | Ambient Shapes | Overlay | Color Temp |
|--------|---------------|---------------|---------|------------|
| **Space/Astronomy** | Slow drift, gold/blue glow, count 30-40 | Large rings (160-200px), arcs | Deep vignette (30% inner) | Cool blue (#080B14 bg) |
| **Finance/Economics** | Sharp small dots (6-8px), green/white, count 25 | Grid lines, diamonds (rotate 45°) | Standard + scanline emphasis | Neutral (#0A0A14 bg) |
| **Technology/AI** | Matrix-style downward drift, cyan, count 35+ | Hexagons, circuit-path lines | Scanline emphasis (0.08 opacity) | Cool cyan (#080F10 bg) |
| **Nature/Biology** | Organic float, green/warm, slow speed (0.3), count 25 | Soft circles (no border, filled 0.05), curves | Warm vignette (amber tint) | Warm green (#081210 bg) |
| **History/Culture** | Warm drift, amber/sepia, count 20-25 | Arcs (120° SVG paths), classic ring shapes | Film grain feel (noise overlay 0.03) | Warm amber (#0A0810 bg) |
| **Health/Medicine** | Clean gentle float, blue/white, count 20 | Soft rings (thin 1px border), pulses | Light vignette (40% inner, low opacity) | Cool white (#0A0E1A bg) |
| **Philosophy/Abstract** | Ethereal slow (speed 0.2), purple/deep, count 30 | Large faint circles (200px+, 0.05 opacity) | Deep vignette + subtle pulse | Purple/deep (#0C0A14 bg) |

1 background style xuyên suốt video là OK — đa dạng **giữa các video khác nhau**, không cần per-scene.

---

### Visual Companion Rules (MANDATORY)

**EVERY text beat MUST have an inline SVG icon companion.** Text without icon = FORBIDDEN.

**Minimum icon sizes by role:**

| Beat Role | Min Icon Size | Placement | Color |
|-----------|-------------|-----------|-------|
| **SUPPORT** | 40px | Left of text, `flex` + `gap: 12px` | Same color family as text |
| **PRIMARY** | 60px | Left of text or above text | Primary/accent color |
| **SYNTHESIS** | 80px | Left of text or above text | Emphasis color with glow |
| **ANCHOR** | 120px+ | Standalone or with minimal label | Domain color |

**Text type → Icon mapping:**

| Text Pattern | Icon Type | Example |
|-------------|-----------|---------|
| Question ("What...?", "Why...?") | Eye, question mark, magnifying glass | `<EyeIcon size={40} />` |
| Statement/Fact | Concept icon matching the noun | "Nuclear furnace" → fire icon |
| Comparison | Balance scale, split arrows | A vs B → `<ScaleIcon />` |
| Sequence/Process | Arrow, numbered circle, clock | "First..." → `<ArrowIcon />` |
| Emotional/Philosophical | Brain, heart, prism, infinity | "Perspective" → `<PrismIcon />` |
| Synthesis/Conclusion | Combined glow icon, star burst | "This means..." → `<StarBurstIcon />` |
| Farewell/Close | Wave, compass, orbit path | "Look up" → `<CompassIcon />` |

**Implementation pattern:**
```tsx
// CORRECT — text + icon in flex container
<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
  <svg width={60} height={60} viewBox="0 0 60 60">
    <circle cx={30} cy={30} r={20} fill={COLORS.primary} opacity={0.3} />
    <path d="..." fill={COLORS.primary} />
  </svg>
  <WordByWord text="Key concept" ... />
</div>

// FORBIDDEN — text alone
<div>
  <WordByWord text="Key concept" ... />
</div>
```

### Text Effects (Emphasis/Reveal)

| Effect | Use When |
|--------|----------|
| `AnimatedLine` (word-by-word) | Voiceover sync, key statements |
| `TypedText` | Commands, technical terms (use string slicing, not per-char opacity) |
| `GlitchText` | Bugs, security, system failures |
| `ShinyText` | Key terms, first introduction |
| `GradientText` | Titles, section headers |
| `BlurText` | Dramatic reveals |

Emphasize **1–3 key terms per sentence max**. If everything is special, nothing is.

### Data Effects

| Effect | Use When |
|--------|----------|
| `CountUp` | Stats, measurements, comparisons |
| `StatGrid` | Multiple related numbers |

Reserve CountUp for impressive stats. Pause after big numbers land.

### Transitions (Scene Changes)

| Pattern | Use When |
|---------|----------|
| Fade to black | Major topic shifts |
| Crossfade | Related concept transitions |
| `FocusBlur` | Moving attention to new element |
| PixelTransition | Tech topic transitions |

Most transitions should be cuts or fades. Save fancy ones for section boundaries.

### Diagrams

Build diagrams **piece by piece** with narration — never show all at once.

---

## Visual Density

| Density | When |
|---------|------|
| Sparse (1–2 elements) | Opening statements, powerful quotes |
| Medium (3–4 elements) | Most explanations, labeled diagrams |
| Dense (5+ elements) | Timelines, system diagrams, recaps |

**Rule**: Complex ideas = simpler visuals. Simple ideas can have richer visuals.

---

## System Panel Design Language

Our signature aesthetic for technical content.

| Element | Purpose | Sizing |
|---------|---------|--------|
| **Corner Brackets** | Frame content, tech aesthetic | 20x20px, L-shaped borders, 2px stroke |
| **Scan Lines** | "Processing" feel | Animated gradient line |
| **Type Badges** | Categorize: AI/CODE/DATA | Colored label, top-right, 18px minimum |
| **Pulsing Glow** | "Alive" feel | `Math.sin(frame * 0.08) * 0.15 + 0.85` |
| **Gradient Arrows** | Show flow between elements | 3px stroke minimum |

Panel sizing: title 40px+, description 28px+, padding 40px 56px, border 2px minimum, radius 16px. Minimum panel width 440px for long-form.

- **Full treatment** (brackets + badge + scan line): Key concept boxes, data flows
- **Minimal** (brackets + badge): Timeline eras
- **Skip**: Captions, labels, background elements

---

## Quick Decision Tree

```
KEY TERM introduced first time?   → ShinyText or emphasis color + weight
Showing GROWTH or SCALE?          → CountUp animation
DRAMATIC moment or REVEAL?        → BlurText entrance, slow spring
ERROR or PROBLEM?                 → GlitchText, red emphasis
HIERARCHY or LAYERS?              → Build diagram piece by piece
TRANSITION between topics?        → Fade to black or crossfade
BACKGROUND while talking?         → Subtle particles, vignette
```

---

## Visual Engagement & Retention

### Core Principle: Every 15-20 seconds must have a visual moment that surprises or delights.

### Depth Layering (always active)
Every frame should have at least 2 visual layers:
```
Layer 0 (far):    AmbientBackground — particles, gradient (opacity 0.06-0.1)
Layer 1 (mid):    Context elements — persistent diagram, dimmed reference (opacity 0.1-0.2)
Layer 2 (focus):  Active content — current component at full opacity
Layer 3 (overlay): Emphasis — glow, highlight, vignette
```
**Never show content on a flat empty background.** At minimum, AmbientBackground + Vignette must be present.

### Cinematic Micro-Techniques
- **Rack Focus**: Blur background when foreground enters (filter: blur 4px → 0)
- **Parallax**: Bg moves at 0.3× speed during transitions
- **Light Sweep**: Subtle gradient sweeps screen on major beats (opacity 0.05)
- **Vignette Breathing**: `opacity: 0.5 + Math.sin(frame * 0.03) * 0.1`
- **Color Temperature Shift**: Background hue subtly shifts across section

### Pattern Interrupt (break predictability)
- Screen flash to contrasting color (3-5f) on twist/reveal
- Static element suddenly transforms
- Particle system reacts: speed spike or color burst on key moment
- Background color shifts to match emotional turn

### Visual-First Ratio Rule (NON-NEGOTIABLE)
Every section must maintain this beat ratio:
```
Max 20% text beats (always with icon/SVG companion)
Min 70% SVG/icon/3D/chart/diagram beats
10% mixed (text + visual equally weighted)
```
**ZERO text-only beats.** If text exists, it MUST have an icon/shape/3D element beside it.
Every keyword/concept → 1 inline SVG icon describing it.

### Visual Variety Rule
Within any 90-second window, must have:
- At least 3 different component types (not all AnimatedText)
- At least 1 data visualization (chart, diagram, map, icon grid)
- At least 1 moment with physical motion (scale, translate, rotate — not just opacity)
- Background treatment change at least once
- Scene layout must vary — never same layout 3 sections in a row

### Domain Visual Anchors
Each domain has a signature visual thread that persists across the video:

| Domain | Anchor | Implementation |
|--------|--------|----------------|
| Technology | Terminal aesthetic | Monospace, scan lines, cursor blink |
| Economics | Chart fragments | Mini chart pieces as background texture |
| History | Timeline thread | Persistent horizontal line across sections |
| Crime | Evidence board | String connections, pinned document aesthetic |
| Biology | Organic shapes | Circular membranes, cell-like borders |
| Physics | Grid system | Subtle coordinate grid in background |
| Geography | Map silhouette | Faded map outline persists |

---

## Anti-Patterns

1. **Motion sickness** — too many things moving at once
2. **Christmas tree** — too many colors competing
3. **Effect soup** — effects because you can, not because they help
4. **Dead air** — static screens with voiceover (always have SOMETHING moving)
5. **Distraction** — effect draws attention away from the key point
6. **CSS animations** — using CSS transitions/Tailwind animate instead of Remotion spring/interpolate
7. **Flat empty backgrounds** — never show content on plain bg without AmbientBackground + Vignette
8. **Predictable rhythm** — same transition, same timing, same layout every section
9. **Text-only beats** — FORBIDDEN. Every beat MUST have icon/3D/SVG visual companion
10. **Text-heavy sections** — max 20% text beats per section, text always with icon
11. **Same layout 3x in a row** — vary scene layouts (centered, split-h, split-v, grid, radial, stacked, floating, cinematic)
12. **Missing icon companion** — every [EM], [STAT], keyword must have inline SVG icon

---

## Minimum Display Durations (at 30fps)

Elements that appear and vanish too fast are unreadable and jarring. Every element must remain **fully visible** (post-enter, pre-exit) for at least the minimum hold time below.

| Element Type | Min Visible (frames) | Min Visible (seconds) | Notes |
|-------------|---------------------|----------------------|-------|
| **Hero/Title text** | 45f | 1.5s | Must register as focal point |
| **Body text (sentence)** | 36f | 1.2s | Reader needs time at playback speed |
| **Label/Badge** | 24f | 0.8s | Even small elements need a beat |
| **CountUp / Stat** | 45f | 1.5s | Number must land + breathe |
| **Diagram (complete)** | 60f | 2.0s | Viewer processes spatial layout |
| **Chart (complete)** | 60f | 2.0s | Data needs reading time |
| **Timeline event (each)** | 24f | 0.8s | Before next event appears |
| **List item (each)** | 18f | 0.6s | Between stagger, + 30f hold after all |
| **Complete list** | 36f | 1.2s | After last item enters |
| **Quote** | 60f | 2.0s | Long text needs reading |
| **Code block** | 45f | 1.5s | Technical content = slow read |
| **Icon (single)** | 30f | 1.0s | Must register meaning |
| **Icon group (complete)** | 36f | 1.2s | After last icon lands |
| **Comparison panels** | 30f | 1.0s | Each side visible before exit |
| **Flow diagram node** | 20f | 0.67s | Before next node appears |
| **Map highlight** | 36f | 1.2s | Geographic context needs time |
| **Person/Quote card** | 60f | 2.0s | Face + text = slow processing |
| **Retention beat** | 15f | 0.5s | Even quick beats need a moment |
| **Screen flash** | 3-8f | 0.1-0.27s | Intentionally brief — exception |

### Duration Rules — MANDATORY

1. **No element exits before its minimum hold completes** — exit animation starts AFTER hold ends
2. **Enter animation duration is NOT counted as visible time** — hold starts when enter completes
3. **Overlap rule**: if element B enters while A is still holding, A's hold is NOT shortened — B enters alongside or waits
4. **Complex elements get longer holds**: diagrams with 5+ nodes = 60f+, charts with 8+ data points = 75f+
5. **Stagger ≠ hold**: list items stagger at 18f, but the complete list then holds for 36f minimum on top of that
6. **Exit must be gradual**: minimum 10f for fade-out / slide-out — no instant disappear (except screen flash)
7. **Section boundary hold**: last visible element holds minimum 20f before section transition begins

---

## Minimum Element Sizes (Long-form 1920x1080)

| Element | Minimum | Recommended |
|---------|---------|-------------|
| **SVG icon/diagram** | 120x120px | 160x160px+ |
| **Diagram (FlowDiagram, Timeline, etc.)** | 800x500px | 1000x600px+ |
| **Card (PersonCard, CaseStudyCard)** | 440px wide | 540px wide |
| **Checklist/Panel** | 500px wide | 600px wide |
| **Dot/Node (timeline, graph)** | r=10px | r=12-16px |
| **Connection lines (edges, arrows)** | 2px stroke | 3px stroke |
| **Labels on diagrams** | 20px | 24px+ |
| **Flow indicator nodes** | 16px | 18-20px |
| **Chart axes text** | 18px | 22px+ |
| **Progress bars** | 40px height | 48px height |
| **Borders on panels** | 2px | 2-3px |
| **AmbientBackground particle** | radius 6px | 8-12px recommended |
| **Ambient geometric shapes** | 80px | 120-200px |

**Rule**: If an element occupies less than 15% of the frame, it's probably too small. Scale up or reposition.

---

## Scene Layout System

Every section MUST declare one of 8 layout strategies:

| Layout | Description | Best for |
|--------|-------------|----------|
| `centered` | Single focal point center screen | icon, stat, equation, reveal |
| `split-h` | Horizontal split (left/right panels) | comparison, code side-by-side |
| `split-v` | Vertical split (top/bottom) | chart + annotation, person + quote |
| `grid` | 2×2 or 3×2 grid | dashboard, icon group, feature matrix |
| `radial` | Elements arranged in circle | relationship, hub-spoke, cycle |
| `stacked` | Vertical stack of layers | hierarchy, list, timeline, progress |
| `floating` | Elements at various positions | 3d, abstract, metaphor |
| `cinematic` | Full-bleed with text overlay | map, infographic, poster |

**Never use the same layout 3 sections in a row.** Centered layout: max 2 per 5 consecutive sections — centered is NOT the default.

---

## Element Relocate Pattern (MANDATORY)

When new elements enter, **existing elements MUST move to new positions** rather than staying put and getting overlapped. This is the core layout principle — elements are alive and responsive to their neighbors.

### How It Works

Each element group tracks its position as **keyframed coordinates** that change at phase boundaries:

```tsx
// Element starts CENTER, moves TOP-LEFT ONLY when phase 2 enters at f100, moves CORNER when phase 3 enters at f315
// KEY: relocate range starts AT the new beat's enter frame, never before
//   f0-99: stays at 660 (phase 2 hasn't appeared yet)
//   f100-120: moves to 100 (phase 2 just appeared — relocate starts NOW)
//   f120-314: stays at 100
//   f315-335: moves to 60 (phase 3 just appeared — relocate starts NOW)
const phase2Enter = 100;
const phase3Enter = 315;
const groupX = interpolate(frame, [phase2Enter, phase2Enter + 20, phase3Enter, phase3Enter + 20], [660, 100, 100, 60], EC);
const groupY = interpolate(frame, [phase2Enter, phase2Enter + 20, phase3Enter, phase3Enter + 20], [340, 80, 80, 50], EC);
const groupScale = interpolate(frame, [phase2Enter, phase2Enter + 20, phase3Enter, phase3Enter + 20], [1, 0.65, 0.65, 0.5], EC);
```

### Rules

1. **Position keyframes per group** — every element group needs `interpolate()` on `left`, `top`, and optionally `scale` with breakpoints at each phase transition
2. **Relocate starts AT the new beat's enter frame — NOT before** — old elements MUST stay at their current position until the exact frame the new element appears. The relocate interpolation range starts FROM the new beat's enter frame: `interpolate(frame, [newBeatEnter, newBeatEnter+20], [oldPos, newPos])`. NEVER anticipate — if beat B enters at f200, group A must not start moving before f200
3. **Smooth 20-frame transition** — position changes happen over ~20 frames (not instant snaps), but the 20 frames start AT the new beat's entry, not before
4. **Scale down on relocate** — elements that move aside shrink to 0.5-0.7× to signal they're secondary now
5. **Opacity dims slightly** — relocated elements dim to 0.5-0.85 (NOT 0, they stay visible)
6. **Utilize full canvas** — after all phases enter, elements should spread across the 1920×1080 frame (corners, edges, center) with no dead zones
7. **No overlap by default** — each group occupies its own region. Overlap ONLY for intentional effects (glitch, emphasis)
8. **Newest element gets prime position** — center or the most prominent area. Older elements yield to edges/corners

### Relocate Positions (1920×1080 reference)

| Position | Coordinates (x, y) | When to use |
|----------|-------------------|-------------|
| Center | (660-860, 340-440) | Current focus element |
| Top-left | (60-150, 50-120) | First relocated group |
| Top-right | (1350-1500, 50-120) | Second relocated group |
| Bottom-left | (60-200, 650-750) | Third relocated group |
| Bottom-right | (1350-1500, 650-750) | Fourth relocated group |
| Left-center | (60-200, 350-450) | Split layout, left half |
| Right-center | (1300-1500, 350-450) | Split layout, right half |

### Anti-Patterns (FORBIDDEN)

- **Pile-up center** — all elements enter at center, stacking on top of each other
- **Fixed positions** — elements enter at (x,y) and never move regardless of new entries
- **Instant teleport** — elements jump to new positions without smooth interpolation
- **Full opacity on relocated elements** — must dim slightly to show visual hierarchy shift
- **Early relocate** — old elements start moving BEFORE the new element actually appears. If new beat enters at f200, old element must NOT start moving at f180. Relocate range = `[f200, f200+20]`, never `[f180, f200]`

---

## Layer Stacking Model (MANDATORY)

Every scene renders exactly 4 layers in this z-order:

| Layer | Content | Opacity | Notes |
|-------|---------|---------|-------|
| 0 - Background | Solid color or gradient | **ALWAYS 1.0** | Never animated opacity. Use `AbsoluteFill` with `backgroundColor` |
| 1 - Ambient | Particles + geometric shapes + glow orbs | 0.08-0.4 | Particles >= 6px radius with boxShadow glow. Shapes 80-200px |
| 2 - Content | Text, icons, charts, diagrams | Animated | All visual beats live here. Scene fade in/out applies to this layer |
| 3 - Overlay | Vignette + scan lines | 0.04-0.7 | Darkens edges, adds depth and cinematic feel |

**NEVER skip Layer 1 (ambient) or Layer 3 (overlay).** A scene with only Layer 0 + Layer 2 looks flat and empty.

**Implementation template:**
```tsx
<AbsoluteFill>
  {/* Layer 0: Background — ALWAYS opaque */}
  <AbsoluteFill style={{ backgroundColor: COLORS.bg }} />

  {/* Layer 1: Ambient — particles + shapes */}
  <AbsoluteFill>
    {particles.map((p, i) => <Particle key={i} {...p} />)}
    {ambientShapes.map((s, i) => <AmbientShape key={i} {...s} />)}
  </AbsoluteFill>

  {/* Layer 2: Content — animated opacity */}
  <AbsoluteFill style={{ opacity: sceneOpacity }}>
    {/* All visual beats here */}
  </AbsoluteFill>

  {/* Layer 3: Overlay — vignette + scan line */}
  <AbsoluteFill style={{
    background: `radial-gradient(ellipse at center, transparent 40%, ${COLORS.bg} 100%)`,
    opacity: 0.6 + Math.sin(frame * 0.03) * 0.1,
  }} />
  <div style={{
    position: 'absolute', left: 0, right: 0,
    top: (frame * 0.5) % 1080, height: 1,
    backgroundColor: COLORS.textDim, opacity: 0.05,
  }} />
</AbsoluteFill>
```

---

## @remotion/shapes — SVG Shape Primitives

Use `@remotion/shapes` for geometric elements instead of raw SVG paths.

```typescript
import { Circle, Rect, Triangle, Star, Pie, Heart, Polygon, Ellipse } from '@remotion/shapes';
import { makeCircle, makeRect, makeStar, makeTriangle, makePie, makeHeart, makePolygon } from '@remotion/shapes';
```

### Component Usage
```tsx
<Circle radius={80} fill="#60A5FA" stroke="#A78BFA" strokeWidth={3} />
<Star points={5} innerRadius={30} outerRadius={60} fill="#FBBF24" cornerRadius={4} />
<Pie radius={100} progress={0.75} fill="#34D399" closePath rotation={-90} />
<Triangle length={120} direction="up" fill="#F43F5E" />
<Rect width={200} height={100} cornerRadius={12} fill="#A78BFA" />
<Heart width={100} fill="#F472B6" />
<Polygon points={6} radius={60} fill="#67E8F9" cornerRadius={8} />
```

### Make Functions (for path data)
```typescript
const circlePath = makeCircle({ radius: 80 });     // returns { path, width, height, ... }
const starPath = makeStar({ points: 5, innerRadius: 30, outerRadius: 60 });
const piePath = makePie({ radius: 100, progress: 0.75 });
// Use path data with <svg><path d={circlePath.path} /></svg>
```

**When to use shapes:**
- Background decorative elements
- Data visualization (pie progress, bar fills)
- Icon building blocks (combine shapes)
- Loading/progress indicators
- Transition effects

---

## @remotion/paths — Path Animation & Morphing

Use `@remotion/paths` for shape morphing and path drawing animations.

```typescript
import { interpolatePath, evolvePath, getPointAtLength, getLength, scalePath, translatePath } from '@remotion/paths';
```

### Path Morphing (shape A → shape B)
```typescript
const fromPath = makeCircle({ radius: 50 }).path;
const toPath = makeRect({ width: 100, height: 100 }).path;
const morphed = interpolatePath(progress, fromPath, toPath);
// Render: <path d={morphed} />
```

### Path Drawing (stroke animation)
```typescript
const evolved = evolvePath(progress, path);
// Returns strokeDasharray + strokeDashoffset for draw animation
// Render: <path d={path} strokeDasharray={evolved.strokeDasharray} strokeDashoffset={evolved.strokeDashoffset} />
```

### Path Utilities
```typescript
const length = getLength(path);
const point = getPointAtLength(path, 0.5 * length);  // {x, y} at midpoint
const scaled = scalePath(path, 2, 2);                  // scale 2x
const moved = translatePath(path, 100, 50);             // translate
```

**When to use paths:**
- Shape morphing transitions (circle→square, old→new)
- SVG stroke draw animations (diagram edges, flow arrows)
- Path-following animations (element follows curve)
- Complex shape transformations

---

## Scene Checklist

- [ ] All text meets minimum size requirements **for the target format**
- [ ] Primary text uses high-contrast colors (`#E5E7EB+`, never `#6B7280` or darker)
- [ ] Domain palette applied — colors match script topic
- [ ] `textMuted` is `#B0B8C8` or brighter (not `#9CA3AF`)
- [ ] `textDim` is `#8890A4` or brighter (not `#6B7280`)
- [ ] Accent colors use **vivid** variants (see Color Psychology table)
- [ ] Component backgrounds use `surface` color, not scene `bg`
- [ ] Borders minimum 2px on dark panels
- [ ] SVG elements (dots, lines) visible — opacity >= 0.7
- [ ] All elements meet minimum sizing (see Minimum Element Sizes table)
- [ ] No element smaller than 15% of frame area unless it's a label/badge
- [ ] Safe margins respected (5%+ all edges, platform safe zones for shorts)
- [ ] No critical content in shorts top 15% or bottom 20%
- [ ] No large empty unused areas
- [ ] One clear focal point at a time
- [ ] All elements meet minimum display duration (see Minimum Display Durations table)
- [ ] No element exits before its hold time completes
- [ ] Enter animation not counted as visible time
- [ ] Exit transitions minimum 10f (no instant disappear)
- [ ] Last element holds 20f before section transition
- [ ] All animations use `spring()` / `interpolate()`, not CSS
- [ ] All `<Sequence>` elements have `premountFor` set
- [ ] No distracting peripheral motion during important content
- [ ] ZERO text-only beats — every text has icon/3D/SVG companion
- [ ] Beat ratio: max 20% text (with icon), min 70% SVG/icon/3D/chart
- [ ] Scene layout declared and varies (no same layout 3x in a row)
- [ ] Every [EM] and [STAT] has icon companion
- [ ] @remotion/shapes used for geometric elements (not raw inline SVG paths)
