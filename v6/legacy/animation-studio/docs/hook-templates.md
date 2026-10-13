# Hook Scene Templates — 36 Professional Templates

Reference for SPEC_GENERATOR and builders. Every hook section must use one of these templates.

---

## 3 Core Principles

### 1. Region-Based Composition
Every template declares pixel-coordinate regions on the 1920x1080 frame. Content is placed in specific regions, not just "center".

### 2. Beat Persistence Model
Beats NEVER disappear during a hook. Three modes:

| Mode | Behavior | Visual |
|------|----------|--------|
| **PERSIST** | Stays visible. Dims to 0.5-0.7 opacity, shrinks to 80% scale | Old text/stat stays, new content takes focus |
| **TRANSFORM** | Morphs into different form in <= 15 frames | Text → icon, stat → chart element, word → symbol |
| **BRIDGE** | Becomes background texture/decoration | Content fades to 0.1-0.2, blurs, becomes ambient layer |

**Rules:**
- NEVER use EXIT/DISAPPEAR for hook beats
- Max 5 simultaneous persistent elements (dim oldest to 0.3 if exceeding)
- TRANSFORM animations complete within 15 frames

### 3. Frame Occupation
By the hook's last frame, visible content must fill >= 60% of the 1920x1080 area (>= 1152px wide x 648px tall of non-bg content).

---

## Category A: Kinetic Typography

### A1 — Text Accumulation
**Best for:** Questions, imperatives, command openings, short punchy lines
**Layout:** cinematic
**Duration range:** 150-300 frames

**Composition regions:**
- Region A: x=160, y=180, w=960, h=550 — Text accumulation zone (left 55%)
- Region B: x=1160, y=150, w=600, h=600 — Supporting visual zone (right 35%)
- Region C: x=160, y=750, w=1600, h=180 — Bottom accent/subtitle bar

**Beat flow:**
```
Beat 1 (f0-f30):  Line 1 appears in Region A — large (80-96px), BlurText word-by-word
                   Region B: hint visual fades in at 0.2 opacity
                   → PERSIST

Beat 2 (f30-f60): Line 2 appears below Line 1 in Region A — medium (48-56px)
                   Region B: visual strengthens to 0.5
                   Line 1 dims to 0.7
                   → PERSIST both

Beat 3 (f60-f90): Line 3 appears below — different style (color/italic/size)
                   Region B: visual at full 1.0
                   Lines 1-2 dim to 0.5
                   → PERSIST all 3

Beat 4+ (f90+):   Text block compresses upward (all 3 lines shrink to 60%, slide to top)
                   New hero content fills main frame
                   Compressed text stays at 0.4 opacity
                   → TRANSFORM text block → persistent header
```

**Animation specs:**
- Entrance: spring({damping: 15, stiffness: 120}), slideUp, 12-15f per line
- Persistence: interpolate(frame, [beatStart, beatStart+15], [1, 0.7]) for dimming
- Micro-motion: translateY(Math.sin(frame * 0.02) * 2) breathing on all elements

**Components:** BlurText, AnimatedText, ShinyText, domain-specific SVG icons
**Ambient:** Particles slow (speed 0.3), count 20-25, tinted to domain primary

---

### A2 — Word Explosion
**Best for:** Single powerful statement or title reveal
**Layout:** floating
**Duration range:** 120-200 frames

**Composition regions:**
- Region A: x=0, y=0, w=1920, h=1080 — Full frame (words scatter everywhere)
- Region B: x=360, y=400, w=1200, h=280 — Final reading position (center 62%)

**Beat flow:**
```
Beat 1 (f0-f20):  Words appear scattered across full frame — each word at random position
                   Font sizes vary: 40-120px. Opacity 0.3-0.8
                   → PERSIST

Beat 2 (f20-f50): Words begin gravitating toward Region B reading positions
                   Spring physics: each word has target (x,y) in Region B
                   Sizes normalize, opacity rises to 1.0
                   → TRANSFORM scattered → ordered

Beat 3 (f50-f80): Statement fully readable in Region B
                   Background words echo at 0.1 opacity (decoration)
                   Accent underline draws beneath statement
                   → PERSIST readable + decorative echoes

Beat 4 (f80+):    Statement holds. Subtle glow pulse on key word
                   Supporting visual/icon enters below
                   → PERSIST all
```

**Components:** AnimatedText (per-word positioning), spring() for gravity physics
**Ambient:** Particles react — scatter when words scatter, calm when words settle

---

### A3 — Typewriter Stack
**Best for:** Scene-setting narration, establishing context
**Layout:** split-v
**Duration range:** 150-250 frames

**Composition regions:**
- Region A: x=160, y=100, w=1600, h=380 — Hero text zone (top 38%)
- Region B: x=160, y=520, w=1600, h=460 — Context build zone (bottom 45%)
- Divider: y=490, horizontal line with glow

**Beat flow:**
```
Beat 1 (f0-f30):  Hero text types character-by-character in Region A — 72-96px
                   Cursor blink visible. Monospace or serif for personality
                   → PERSIST

Beat 2 (f30-f60): Hero text complete. Cursor disappears.
                   Region B: first context line appears — 44px, muted color
                   → PERSIST hero + context

Beat 3 (f60-f90): Second context line below first in Region B
                   Divider line glows briefly
                   → PERSIST all

Beat 4 (f90+):    Third context line or supporting visual in Region B
                   All content visible. Hero text gets subtle shine sweep
                   → PERSIST everything
```

**Components:** AnimatedText (letter-by-letter), ShinyText, horizontal divider component
**Ambient:** ScanLineOverlay emphasis (opacity bump to 0.1 during typing), particles slow

---

### A4 — Scale Ladder
**Best for:** Escalating urgency, building intensity, list of growing importance
**Layout:** stacked
**Duration range:** 150-300 frames

**Composition regions:**
- Region A: x=160, y=100, w=1600, h=880 — Full content zone (stacked vertically)
- Accent: left edge vertical bar that fills as beats add

**Beat flow:**
```
Beat 1 (f0-f25):  Smallest text appears — 32px, muted color, top of Region A
                   Left accent bar: 20% filled
                   → PERSIST

Beat 2 (f25-f50): Medium text appears below — 48px, brighter color
                   Beat 1 stays, no dim
                   Left accent bar: 40%
                   → PERSIST both

Beat 3 (f50-f80): Large text appears — 72px, primary color
                   All previous stay. Visual weight clearly escalates
                   Left accent bar: 60%
                   → PERSIST all

Beat 4 (f80-f120): HERO text — 120px, accent color, ShinyText
                    Previous lines shrink to labels (TRANSFORM to 60% scale, 0.6 opacity)
                    Left accent bar: 100% + glow
                    → TRANSFORM earlier → labels, PERSIST hero
```

**Components:** AnimatedText (multiple sizes), ShinyText (hero), vertical progress bar
**Ambient:** Particles accelerate with each beat (speed 0.3 → 0.5 → 0.7 → 1.0)

---

### A5 — Margin Notes
**Best for:** Scripts with qualifiers, asides, parenthetical context
**Layout:** cinematic
**Duration range:** 150-250 frames

**Composition regions:**
- Region A: x=360, y=200, w=1200, h=500 — Main text center (62%)
- Region L: x=40, y=200, w=280, h=500 — Left margin annotations
- Region R: x=1600, y=200, w=280, h=500 — Right margin annotations
- Region C: x=360, y=720, w=1200, h=200 — Bottom context

**Beat flow:**
```
Beat 1 (f0-f30):  Main statement in Region A — 64-80px, centered
                   → PERSIST

Beat 2 (f30-f55): Annotation appears in Region L — 28px, muted, italicized
                   Thin line connects Region L annotation to relevant word in Region A
                   → PERSIST main + annotation

Beat 3 (f55-f80): Another annotation in Region R — different perspective or data point
                   → PERSIST all

Beat 4 (f80+):    Bottom context in Region C — summary or implication
                   All margin notes pulse subtly on their connection lines
                   → PERSIST everything
```

**Components:** AnimatedText, thin SVG connector lines, label components
**Ambient:** Subtle grid lines in background (0.03 opacity) giving "notebook" feel

---

### A6 — Split Narration
**Best for:** Dialogue, dual perspectives, two voices or viewpoints
**Layout:** split-h
**Duration range:** 180-300 frames

**Composition regions:**
- Region L: x=40, y=100, w=900, h=800 — Left speaker/perspective
- Region R: x=980, y=100, w=900, h=800 — Right speaker/perspective
- Divider: x=940, vertical line with pulse animation

**Beat flow:**
```
Beat 1 (f0-f25):  Left text appears in Region L — aligned right (toward center)
                   Divider pulses left-side color
                   → PERSIST

Beat 2 (f25-f50): Right text appears in Region R — aligned left (toward center)
                   Divider pulses right-side color
                   → PERSIST both

Beat 3 (f50-f80): Additional left text below first — dialog continues
                   → PERSIST all

Beat 4 (f80+):    Right response. Both sides accumulate independently
                   Visual tension between two sides
                   → PERSIST everything
```

**Components:** AnimatedText, vertical divider with gradient, side-specific color tinting
**Ambient:** Particles split — left-tinted particles in Region L, right-tinted in Region R

---

## Category B: Cinematic

### B1 — Letterbox Reveal
**Best for:** Epic/dramatic openings, film-quality hooks, brand intros
**Layout:** cinematic
**Duration range:** 150-250 frames

**Composition regions:**
- Region A: x=0, y=0, w=1920, h=1080 — Full frame (behind bars)
- Bars: top bar y=0→h=200→h=80, bottom bar y=880→y=1000 (bars narrow over time)
- Region B: x=200, y=250, w=1520, h=580 — Visible content area (expands as bars narrow)

**Beat flow:**
```
Beat 1 (f0-f20):  Heavy letterbox bars (200px each). Tiny sliver of content visible
                   Ambient particles visible through gap. Tension builds
                   → BRIDGE bars are part of composition

Beat 2 (f20-f50): Bars narrow to 120px. More content revealed
                   Title text appears in visible area — 80px, confident
                   → PERSIST title

Beat 3 (f50-f80): Bars narrow to 80px. Nearly full frame visible
                   Subtitle + visual element enter
                   → PERSIST all + BRIDGE bars stay as frame

Beat 4 (f80+):    Bars at final 60px height (stay permanently as cinematic frame)
                   Full content visible with elegant framing
                   → PERSIST everything within cinematic frame
```

**Components:** CinematicLayout (animated barHeight), BlurText, AnimatedText
**Ambient:** Particles compressed between bars initially, expand as bars narrow

---

### B2 — Camera Pan
**Best for:** Scene-setting, wide environments, journey/timeline openings
**Layout:** floating
**Duration range:** 200-350 frames

**Composition regions:**
- Virtual canvas: w=3200, h=1080 (wider than screen)
- Viewport: 1920x1080 window panning across virtual canvas
- Content placed at absolute positions on virtual canvas

**Beat flow:**
```
Beat 1 (f0-f40):  Camera starts at left edge (translateX=0)
                   Left-side content visible — setting text, atmosphere
                   → PERSIST (stays on canvas, pans off-screen)

Beat 2 (f40-f80): Camera pans right (translateX interpolates to -640)
                   New content enters from right as camera moves
                   Old content pans left but STAYS on canvas
                   → PERSIST all content on canvas

Beat 3 (f80-f130): Camera continues panning (translateX to -1280)
                    More content revealed. Timeline/journey progression visible
                    → PERSIST entire canvas

Beat 4 (f130+):   Camera settles or slightly reverses. Key content centered
                   All canvas content exists, viewport shows most important section
                   → PERSIST everything
```

**Components:** AbsoluteFill with translateX animation, content at fixed canvas positions
**Ambient:** Parallax — particles move at 0.3x camera speed, shapes at 0.5x

---

### B3 — Depth Stack
**Best for:** Layered concepts, building complexity, multi-faceted ideas
**Layout:** stacked
**Duration range:** 150-250 frames

**Composition regions:**
- Layer BG: x=0, y=0, w=1920, h=1080 — Background plane (0.15 opacity, scale 0.9)
- Layer MID: x=100, y=80, w=1720, h=920 — Middle plane (0.4 opacity, scale 0.95)
- Layer FG: x=200, y=160, w=1520, h=760 — Foreground plane (1.0 opacity, scale 1.0)

**Beat flow:**
```
Beat 1 (f0-f25):  Background plane content appears — large, dim, atmospheric (0.15)
                   Parallax drift: translateX(Math.sin(frame*0.008)*30)
                   → PERSIST at background depth

Beat 2 (f25-f50): Middle plane content appears — medium detail (0.4)
                   Parallax: translateX(Math.sin(frame*0.008)*15)
                   → PERSIST both layers

Beat 3 (f50-f80): Foreground content appears — sharp, detailed (1.0)
                   No parallax (stable reference point)
                   → PERSIST all 3 layers

Beat 4 (f80+):    All layers visible simultaneously creating depth illusion
                   Focus can shift between layers (opacity changes)
                   → PERSIST everything with depth
```

**Components:** AbsoluteFill per layer, scale/opacity/parallax per depth
**Ambient:** Particles in BG layer only, shapes in MID layer

---

### B4 — Focus Pull
**Best for:** Zooming into a detail, overview→specific, map→region
**Layout:** floating
**Duration range:** 180-300 frames

**Composition regions:**
- Region A: x=0, y=0, w=1920, h=1080 — Full overview (scale varies 1.0→2.5→1.5)
- Region B: x=600, y=300, w=720, h=480 — Focus area (highlighted when zoomed)
- Region C: x=100, y=800, w=800, h=200 — Label/annotation zone

**Beat flow:**
```
Beat 1 (f0-f20):  Full overview appears at scale 1.0, opacity 0.3 → 0.6
                   Map, diagram, or system visible in entirety
                   → PERSIST overview

Beat 2 (f20-f50): Camera zooms: scale 1.0→2.5, translate to center Region B
                   Region B detail becomes sharp, rest blurs (filter: blur 3px)
                   → TRANSFORM overview → context backdrop

Beat 3 (f50-f80): Detail highlighted — glow border, accent color, label appears
                   Stat or key info about the detail in Region C
                   → PERSIST detail + label

Beat 4 (f80+):    Camera pulls back to scale 1.5 — detail still glowing within context
                   Overview dimmed but visible, detail marked
                   → PERSIST all at intermediate zoom
```

**Components:** scale + translate interpolation, FocusBlur, CountUp, AnimatedText
**Ambient:** Particles zoom with camera (scale their positions too)

---

### B5 — Split Screen Slam
**Best for:** vs/contrast, A vs B, before/after, opposing ideas
**Layout:** split-h
**Duration range:** 150-250 frames

**Composition regions:**
- Region L: x=0, y=0, w=940, h=1080 — Left panel (slams in from left)
- Region R: x=980, y=0, w=940, h=1080 — Right panel (slams in from right)
- Divider: x=940, y=0, w=40, h=1080 — VS divider zone

**Beat flow:**
```
Beat 1 (f0-f12):  Left panel SLAMS in — translateX(-940→0) in 12f, heavy spring
                   Left content visible: icon + label + color tint
                   → PERSIST

Beat 2 (f12-f25): Pause. Left panel holds. Tension.
                   Divider hint appears (thin line, 0.3 opacity)
                   → PERSIST left + hint

Beat 3 (f25-f40): Right panel SLAMS in — translateX(940→0) in 12f
                   Right content visible: contrasting icon + label + color
                   → PERSIST both sides

Beat 4 (f40-f60): VS divider draws fully — strokeDasharray animation
                   "VS" text or comparison label appears on divider
                   → PERSIST everything

Beat 5 (f60+):    Both sides complete with details building
                   Subtle comparison arrows or annotations
                   → PERSIST all
```

**Components:** SplitLayoutH with spring entrance, SVG divider, AnimatedText per side
**Ambient:** Left particles tinted color A, right particles tinted color B

---

### B6 — Title Card
**Best for:** Series intro, brand hook, topic announcement, episode opening
**Layout:** cinematic
**Duration range:** 120-200 frames

**Composition regions:**
- Region A: x=200, y=200, w=1520, h=400 — Hero title zone (center upper)
- Region B: x=300, y=620, w=1320, h=200 — Subtitle/tagline zone
- Accents: decorative lines at x=100 and x=1820, full height

**Beat flow:**
```
Beat 1 (f0-f20):  Background texture/gradient shifts to domain mood
                   Side accent lines begin drawing (top→bottom, 0.15 opacity)
                   → BRIDGE ambient establishes mood

Beat 2 (f20-f50): TITLE enters massive in Region A — 120-160px, ShinyText
                   Heavy spring with slight overshoot
                   → PERSIST

Beat 3 (f50-f80): Subtitle appears in Region B — 44-56px, muted color
                   Underline draws beneath title
                   → PERSIST both

Beat 4 (f80+):    Additional context or visual element
                   Title shimmers periodically. Everything holds
                   → PERSIST all
```

**Components:** ShinyText (title), AnimatedText (subtitle), SVG accent lines, ShiftingGradient
**Ambient:** Rich particle field (count 35+), shapes 4-5 large decorative circles

---

## Category C: Data-Driven

### C1 — Shock Stat
**Best for:** Opening with a surprising number that demands attention
**Layout:** cinematic
**Duration range:** 120-200 frames

**Composition regions:**
- Region A: x=200, y=150, w=1520, h=500 — Hero stat zone (massive number)
- Region B: x=300, y=680, w=1320, h=300 — Context/explanation zone

**Beat flow:**
```
Beat 1 (f0-f8):   Black. Silence. Tension.
                   → BRIDGE ambient only

Beat 2 (f8-f30):  Number SLAMS in — CountUp 0→target in 20f, 140-180px
                   Color: domain accent (danger for alarming, primary for impressive)
                   Screen shake: translateX(Math.random()*4-2) for 5f after slam
                   → PERSIST

Beat 3 (f30-f50): Unit label fades in below number — 44px, muted
                   (e.g., "trillion dollars", "per second", "since 2020")
                   → PERSIST both

Beat 4 (f50-f75): Context line appears in Region B — 48px, explains the significance
                   Number dims to 0.8 but stays massive
                   → PERSIST all

Beat 5 (f75+):    Hook question or implication — ShinyText or GlitchText
                   All previous content visible. Number as persistent anchor
                   → PERSIST everything
```

**Components:** CountUp (massive), AnimatedText, ShinyText/GlitchText, FrameFlash
**Ambient:** Particles react — burst outward when stat slams, settle after

---

### C2 — Data Cascade
**Best for:** Multiple stats building a picture, accumulating evidence
**Layout:** grid
**Duration range:** 180-300 frames

**Composition regions:**
- Grid: 2x2 or 3x2 layout within safe margins
  - Cell 1: x=160, y=120, w=520, h=420
  - Cell 2: x=700, y=120, w=520, h=420
  - Cell 3: x=1240, y=120, w=520, h=420
  - Cell 4: x=160, y=560, w=520, h=420
  - Cell 5: x=700, y=560, w=520, h=420
  - Cell 6: x=1240, y=560, w=520, h=420

**Beat flow:**
```
Beat 1 (f0-f30):  Cell 1 fills — CountUp + label, accent border
                   Other cells: empty with dim border outline (0.1)
                   → PERSIST

Beat 2 (f30-f60): Cell 2 fills — different stat
                   Cell 1 stays at 0.8 opacity
                   Connection line draws between Cell 1→2 if related
                   → PERSIST both

Beat 3-N:         Each cell fills progressively, stagger 25-30f
                   Previous cells dim slightly but ALL stay visible
                   → PERSIST all

Final:             All cells filled. Pattern or trend becomes visually obvious
                   Highlight color on the surprising/key stat
                   → PERSIST entire grid
```

**Components:** StatGrid, CountUp, GridLayout, SVG connector lines
**Ambient:** Particles count increases with each stat (20→25→30→35)

---

### C3 — Chart Build
**Best for:** Opening with a trend, time series, growth/decline data
**Layout:** split-v
**Duration range:** 200-350 frames

**Composition regions:**
- Region A: x=160, y=80, w=1600, h=550 — Chart zone (top 55%)
- Region B: x=160, y=660, w=1600, h=340 — Annotation zone (bottom 35%)

**Beat flow:**
```
Beat 1 (f0-f25):  Chart axes draw in Region A — thin lines, labels at endpoints
                   → PERSIST axes

Beat 2 (f25-f60): Data points appear one-by-one — each lands with micro-pulse glow
                   Stagger 8-10f per point
                   → PERSIST axes + points

Beat 3 (f60-f90): Trend line draws connecting points — SVG path strokeDashoffset
                   Key annotation appears in Region B below chart
                   → PERSIST all

Beat 4 (f90+):    Highlight the surprising point — glow, callout arrow, label
                   Additional context in Region B
                   Chart stays as persistent reference
                   → PERSIST everything
```

**Components:** Custom chart (axes + data points + trend line), AnimatedText, callout arrows
**Ambient:** Subtle grid lines in chart area (0.03 opacity), particles minimal (15-20)

---

### C4 — Counter Race
**Best for:** Urgency, competition, comparison between growing numbers
**Layout:** split-h
**Duration range:** 150-250 frames

**Composition regions:**
- Region L: x=80, y=200, w=860, h=600 — Counter A zone
- Region R: x=980, y=200, w=860, h=600 — Counter B zone
- Header: x=160, y=60, w=1600, h=120 — Title/context

**Beat flow:**
```
Beat 1 (f0-f15):  Header text appears — sets up the race/comparison
                   Both counter zones outlined with dim borders
                   → PERSIST

Beat 2 (f15-f50): Both counters START simultaneously — CountUp racing
                   Counter A in Region L, Counter B in Region R
                   Labels below each counter
                   → PERSIST header + counters

Beat 3 (f50-f80): Counters reach meaningful milestones — pause or slow
                   Comparison annotation appears between them
                   → PERSIST all

Beat 4 (f80+):    Winner/key insight highlighted — glow on winning counter
                   Context text explains significance
                   Both counters stay visible
                   → PERSIST everything
```

**Components:** CountUp (x2), SplitLayoutH, AnimatedText, comparison connectors
**Ambient:** Particles race in same direction as counters (left→right energy)

---

### C5 — Stat → Context Zoom
**Best for:** Single stat that needs deeper explanation, "behind the number"
**Layout:** floating
**Duration range:** 180-300 frames

**Composition regions:**
- Phase 1: Region A: x=400, y=250, w=1120, h=580 — Hero stat centered
- Phase 2: Region A shrinks to: x=1400, y=40, w=460, h=200 — Corner label
- Phase 2: Region B: x=100, y=100, w=1280, h=880 — Context fills frame

**Beat flow:**
```
Beat 1 (f0-f30):  Huge stat in center — 160px, CountUp, primary color
                   Fills most of Region A
                   → PERSIST

Beat 2 (f30-f60): Stat begins shrinking + moving to top-right corner
                   Scale: 1.0→0.4, translate to corner position
                   → TRANSFORM stat → corner label

Beat 3 (f60-f100): Context content fills frame in Region B
                    Explanation, supporting data, visual diagram
                    Corner stat stays as persistent reference
                    → PERSIST corner label + context

Beat 4 (f100+):   Additional context layers
                   Corner stat pulses when referenced
                   → PERSIST everything
```

**Components:** CountUp, AnimatedText, spring() for shrink/move, diagrams
**Ambient:** Particles expand as "camera zooms out" (spread further apart)

---

### C6 — Data Wall
**Best for:** Many examples, then focusing on the key one
**Layout:** grid
**Duration range:** 180-280 frames

**Composition regions:**
- Grid: 3x4 or 4x3 mini-cards covering 80% of frame
- Hero zone: x=500, y=250, w=920, h=580 (center, overlays grid when active)

**Beat flow:**
```
Beat 1 (f0-f25):  Grid of 8-12 mini-cards flood in — stagger 2f each
                   Each card: icon + short label, 0.6 opacity
                   → PERSIST grid

Beat 2 (f25-f45): All cards visible. Brief hold for viewer to scan
                   → PERSIST hold

Beat 3 (f45-f70): All cards dim to 0.15 opacity simultaneously
                   ONE card enlarges to hero zone — scale 1→3, full opacity, glow
                   → TRANSFORM grid → background, one card → hero

Beat 4 (f70+):    Hero card fully detailed — label, stat, explanation
                   Dimmed grid stays visible as context ("one of many")
                   → PERSIST hero + dim grid
```

**Components:** GridLayout, IconDisplay, spring() for enlarge, AnimatedText
**Ambient:** Particles cluster around hero card after selection

---

## Category D: Metaphor/Visual

### D1 — Icon Hero
**Best for:** Analogy/metaphor opening, concept introduction
**Layout:** cinematic
**Duration range:** 150-250 frames

**Composition regions:**
- Region A: x=600, y=100, w=720, h=500 — Hero icon zone (center)
- Region B: x=100, y=620, w=800, h=350 — Label/text zone (bottom-left)
- Region C: x=1100, y=620, w=720, h=350 — Context zone (bottom-right)

**Beat flow:**
```
Beat 1 (f0-f20):  Hero icon enters Region A — 180-240px, spring scale 0→1.2→1.0
                   Radial glow behind icon (400px, domain primary, 0.15 opacity)
                   → PERSIST

Beat 2 (f20-f50): Label appears in Region B — 64px, names the concept
                   Icon gets subtle floating animation
                   → PERSIST both

Beat 3 (f50-f80): Context text in Region C — 44px, explains relevance
                   Connection line or arrow from icon to context
                   → PERSIST all

Beat 4 (f80+):    Additional visual detail on icon (decorative elements)
                   All content stays. Icon remains visual anchor
                   → PERSIST everything
```

**Components:** SVG icon (200px+), AnimatedText, radial glow div, connector lines
**Ambient:** Shapes orbit around icon (3 circles, 100-160px, 0.08 opacity)

---

### D2 — Visual Metaphor Bridge
**Best for:** Abstract concept → concrete application, analogy explanation
**Layout:** split-v
**Duration range:** 180-300 frames

**Composition regions:**
- Region A: x=200, y=60, w=1520, h=420 — Metaphor zone (top 42%)
- Bridge: y=480, arrow/line drawing downward
- Region B: x=200, y=560, w=1520, h=420 — Reality zone (bottom 42%)

**Beat flow:**
```
Beat 1 (f0-f30):  Metaphor visual appears in Region A — icon + label
                   (e.g., "Shield" icon, "sword" icon, fortress, river)
                   → PERSIST

Beat 2 (f30-f60): Bridge element draws from Region A → Region B
                   Arrow, line, or transforming shape connects them
                   → PERSIST metaphor + BRIDGE drawing

Beat 3 (f60-f90): Reality concept appears in Region B — real-world label
                   (e.g., "Gold", "Bitcoin", "Defense Strategy")
                   → PERSIST both zones

Beat 4 (f90+):    Annotations build on both sides showing parallel
                   Bridge pulses to reinforce connection
                   → PERSIST everything
```

**Components:** SVG icons, arrow/bridge SVG path, AnimatedText, parallel labels
**Ambient:** Particles flow from top to bottom following bridge direction

---

### D3 — Symbol Morph
**Best for:** Transformation, evolution, change over time
**Layout:** floating
**Duration range:** 150-250 frames

**Composition regions:**
- Region A: x=600, y=200, w=720, h=500 — Central morph zone
- Region L: x=80, y=400, w=400, h=200 — Label for state 1
- Region R: x=1440, y=400, w=400, h=200 — Label for state 2

**Beat flow:**
```
Beat 1 (f0-f25):  Symbol 1 appears in center — 200px, full detail
                   Label in Region L identifies it
                   → PERSIST

Beat 2 (f25-f55): Symbol 1 begins morphing — intermediate shapes
                   Cross-fade or path morph animation (30f)
                   Region L label dims to 0.4
                   → TRANSFORM symbol 1 → intermediate

Beat 3 (f55-f80): Symbol 2 emerges from morph — new form
                   Label in Region R identifies it
                   → TRANSFORM intermediate → symbol 2, PERSIST labels

Beat 4 (f80+):    Both labels visible. Before/After implied
                   Faint ghost of Symbol 1 (0.15) beside Symbol 2
                   → PERSIST final state + memory of original
```

**Components:** SVG path morphing (d attribute interpolation), AnimatedText
**Ambient:** Color shifts from symbol 1's palette to symbol 2's palette

---

### D4 — Ambient Scene
**Best for:** Mood-setting, atmospheric, documentary-style opening
**Layout:** cinematic
**Duration range:** 200-400 frames

**Composition regions:**
- Region A: x=0, y=0, w=1920, h=1080 — Full frame atmosphere
- Region B: x=300, y=350, w=1320, h=380 — Text zone (center)

**Beat flow:**
```
Beat 1 (f0-f40):  AMBIENT ONLY — particles build slowly (count 0→30)
                   Color temperature shifts. Domain mood establishes
                   ShiftingGradient very slow cycle
                   → BRIDGE atmosphere building

Beat 2 (f40-f70): Title fades in Region B — BlurText letter-by-letter, 80-96px
                   Very slow reveal (stagger 6f per letter)
                   → PERSIST title

Beat 3 (f70-f110): Subtitle appears below title — 44px, muted
                    Environmental detail: decorative shape or icon at 0.3 opacity
                    → PERSIST both

Beat 4 (f110+):   Additional visual element hints at content to come
                   All atmospheric layers + text visible
                   Temperature settled on domain color
                   → PERSIST everything
```

**Components:** BlurText (slow), AnimatedText, ShiftingGradient, AmbientBackground (animated count)
**Ambient:** Particle count GROWS over time (unique to this template)

---

### D5 — Map/Diagram Entry
**Best for:** Geographic, spatial, system overview, network concept
**Layout:** floating
**Duration range:** 200-350 frames

**Composition regions:**
- Region A: x=100, y=50, w=1300, h=900 — Map/diagram zone (70%)
- Region B: x=1420, y=100, w=440, h=800 — Legend/annotation panel (right 25%)

**Beat flow:**
```
Beat 1 (f0-f30):  Map/diagram outline draws in Region A — SVG path strokeDashoffset
                   Dim (0.3 opacity), establishes spatial context
                   → PERSIST

Beat 2 (f30-f60): First callout appears — highlighted region + connector line + label
                   Region B: first annotation entry
                   → PERSIST map + callout

Beat 3 (f60-f90): Second callout at different location
                   Region B: second annotation
                   Previous callout dims to 0.5
                   → PERSIST all

Beat 4 (f90+):    Overview relationship visible — all callouts showing pattern
                   Map at 0.5, callouts at varied opacity showing hierarchy
                   → PERSIST entire composition
```

**Components:** SVG paths (map/diagram), callout connectors, AnimatedText, legend list
**Ambient:** Minimal particles (15-20, small), emphasis on diagram clarity

---

### D6 — Scale Comparison
**Best for:** Size comparison, magnitude, relative scale
**Layout:** split-h
**Duration range:** 150-250 frames

**Composition regions:**
- Region L: x=80, y=150, w=860, h=700 — Object A zone
- Region R: x=980, y=150, w=860, h=700 — Object B zone
- Region C: x=200, y=880, w=1520, h=140 — Scale annotation bar

**Beat flow:**
```
Beat 1 (f0-f25):  Object A appears in Region L — icon/visual at reference size
                   Label below: name + size/value
                   → PERSIST

Beat 2 (f25-f55): Object B appears in Region R — proportionally sized
                   Dramatic size difference immediately visible
                   → PERSIST both

Beat 3 (f55-f80): Scale bar appears in Region C — connecting both objects
                   Ratio annotation (e.g., "10x", "1/100th")
                   → PERSIST all

Beat 4 (f80+):    Additional context — what the scale means
                   Objects pulse with micro-motion
                   → PERSIST everything
```

**Components:** SVG icons at proportional sizes, AnimatedText, scale bar component
**Ambient:** Particles sized proportionally to objects in each region

---

## Category E: Tension/Reveal

### E1 — Glitch Reveal
**Best for:** Challenging assumptions, myth-busting, correction
**Layout:** cinematic
**Duration range:** 120-200 frames

**Composition regions:**
- Region A: x=200, y=300, w=1520, h=300 — Statement zone (center)
- Region B: x=300, y=650, w=1320, h=250 — Supporting evidence zone

**Beat flow:**
```
Beat 1 (f0-f20):  FALSE statement appears — AnimatedText, confident, clean
                   Presented as fact. No hint of doubt
                   → PERSIST (temporarily)

Beat 2 (f20-f35): GlitchText activates on statement — intensity 0.8, 15f
                   Screen shake, chromatic aberration
                   FrameFlash white (3f, 0.3 intensity)
                   → TRANSFORM glitching

Beat 3 (f35-f55): Statement reforms as TRUTH — different color (primary/accent)
                   ShinyText sweep on corrected version
                   Ghost of false version at 0.1 opacity behind (strikethrough)
                   → TRANSFORM false → true, PERSIST ghost

Beat 4 (f55+):    Supporting evidence in Region B
                   True statement shimmers. Ghost stays as reminder of myth
                   → PERSIST all
```

**Components:** AnimatedText, GlitchText, ShinyText, FrameFlash, strikethrough styling
**Ambient:** Particles scatter during glitch, resettle after

---

### E2 — Countdown
**Best for:** Urgency, deadlines, time-sensitive events, ticking clock
**Layout:** cinematic
**Duration range:** 120-200 frames

**Composition regions:**
- Region A: x=500, y=100, w=920, h=500 — Timer/clock zone (center upper)
- Region B: x=200, y=620, w=1520, h=350 — Reveal text zone

**Beat flow:**
```
Beat 1 (f0-f10):  Timer icon appears in Region A — 160px, spring:heavy
                   Radial glow behind (warning color)
                   → PERSIST

Beat 2 (f10-f30): CountUp running fast in Region A — monospace, 120px
                   Warning color. Tension builds with speed
                   → PERSIST timer + counter

Beat 3 (f30-f40): Counter STOPS — freeze at specific number
                   FrameFlash (white, 5f)
                   Screen shake 3f
                   → TRANSFORM counter → frozen display

Beat 4 (f40-f65): "The moment" text appears in Region B — BlurText, danger color, 72px
                   Frozen timer stays as decoration (0.6 opacity)
                   → PERSIST timer + moment text

Beat 5 (f65+):    Context/implication text below
                   All elements visible. Timer frozen permanently
                   → PERSIST everything
```

**Components:** CountUp (fast), FrameFlash, BlurText, SVG clock/timer icon
**Ambient:** Particles accelerate during countdown, freeze when timer stops

---

### E3 — Question Hold
**Best for:** Opening with a question that drives entire video
**Layout:** cinematic
**Duration range:** 150-250 frames

**Composition regions:**
- Region A: x=160, y=250, w=1600, h=300 — Question zone (center)
- Region B: x=300, y=580, w=1320, h=350 — Answer/tease zone (below)

**Beat flow:**
```
Beat 1 (f0-f10):  Ambient builds. Tension. Empty frame with particles
                   → BRIDGE atmosphere

Beat 2 (f10-f40): Question appears word-by-word — BlurText, 72-96px
                   Stagger 5-6f per word. Takes 30f to fully appear
                   Question mark punctuates last with slight bounce
                   → PERSIST question

Beat 3 (f40-f75): HOLD. Question stays. No new content for 35f
                   Viewer reads, absorbs, wonders
                   Subtle glow pulse on question mark
                   → PERSIST (intentional pause)

Beat 4 (f75-f100): Answer TEASED in Region B — 48px, 0.4 opacity
                    Not fully readable. Curiosity maintained
                    → PERSIST question + hint

Beat 5 (f100+):   Answer strengthens to 0.7. Still not full reveal
                   Or supporting visual enters
                   → PERSIST all
```

**Components:** BlurText (word-by-word), AnimatedText, opacity-controlled tease
**Ambient:** Slow particles, minimal activity during hold (respect the pause)

---

### E4 — Mask Reveal
**Best for:** Hidden information, unveiling, discovery
**Layout:** floating
**Duration range:** 150-250 frames

**Composition regions:**
- Region A: x=0, y=0, w=1920, h=1080 — Full frame (content behind mask)
- Mask: expanding circle or rectangle from center/corner

**Beat flow:**
```
Beat 1 (f0-f20):  Abstract texture covers full frame — geometric shapes, patterns
                   Content exists behind but is masked
                   → BRIDGE texture is temporary

Beat 2 (f20-f50): Mask begins expanding from origin point
                   Circle/rect grows, revealing content underneath
                   Revealed content: text, icon, visual
                   → BRIDGE mask edges become frame decoration

Beat 3 (f50-f80): Mask 70% open. Most content revealed
                   Revealed content enters normal (persist, accumulate)
                   Mask edges dim to decorative frame (0.1)
                   → PERSIST revealed content

Beat 4 (f80+):    Fully revealed. Mask residue as subtle frame decoration
                   All content visible and accumulating
                   → PERSIST everything
```

**Components:** CSS clip-path animation, MaskReveal component, geometric textures
**Ambient:** Particles emerge from behind mask as it opens

---

### E5 — Before/After
**Best for:** Transformation, improvement, change, progress
**Layout:** split-h
**Duration range:** 150-250 frames

**Composition regions:**
- Region L: x=0, y=0, w=960, h=1080 — "Before" state
- Region R: x=960, y=0, w=960, h=1080 — "After" state
- Wipe line: x=960, moving divider
- Region C: x=400, y=850, w=1120, h=180 — Delta annotation

**Beat flow:**
```
Beat 1 (f0-f20):  "Before" fills Region L — muted colors, dim, older aesthetic
                   Label: "Before" or time indicator
                   → PERSIST

Beat 2 (f20-f30): Screen wipe: divider moves L→R revealing "After"
                   or GlitchText transition between states (10f)
                   → BRIDGE wipe animation

Beat 3 (f30-f55): "After" fills Region R — vivid, bright, modern
                   Label: "After" or current time
                   "Before" dims to 0.5 but stays visible
                   → PERSIST both states

Beat 4 (f55-f80): Delta stat in Region C — "+45%", "3x faster", etc.
                   CountUp animation for the change metric
                   → PERSIST all

Beat 5 (f80+):    Both states + delta visible. Hook question appears
                   "How?" — sets up rest of video
                   → PERSIST everything
```

**Components:** SplitLayoutH, wipe animation, CountUp (delta), AnimatedText, BlurText
**Ambient:** Left side: slow muted particles. Right side: energetic bright particles

---

### E6 — Building Suspense
**Best for:** Mystery, unknown, investigation, puzzle
**Layout:** stacked
**Duration range:** 200-350 frames

**Composition regions:**
- Stack zone: x=160, y=100, w=1600, h=880 — Clues accumulate vertically or scattered

**Beat flow:**
```
Beat 1 (f0-f35):  First clue appears — partial info, "?" symbol, dim border
                   Slow entrance. Long pause after
                   → PERSIST

Beat 2 (f35-f70): Second clue appears — different position, different visual style
                   First clue stays. Connection unclear
                   → PERSIST both

Beat 3 (f70-f110): Third clue. Pattern emerging
                    All clues visible. Viewer starts connecting
                    → PERSIST all

Beat 4 (f110+):   Optional: connection lines draw between clues
                   Or hint text: "What connects them?"
                   All clues visible. Tension at peak
                   → PERSIST everything
```

**Components:** AnimatedText, icon cards with borders, connector lines, "?" placeholders
**Ambient:** Very slow particles, dark atmosphere, suspenseful

---

## Category F: Immersive/Atmospheric

### F1 — Slow Burn
**Best for:** Long-form mood setter, documentary opening, prestige feel
**Layout:** cinematic
**Duration range:** 250-400 frames

**Composition regions:**
- Region A: x=300, y=300, w=1320, h=300 — Title zone (center)
- Region B: x=300, y=620, w=1320, h=200 — Subtitle zone
- Full frame ambient layers

**Beat flow:**
```
Beat 1 (f0-f40):  AMBIENT ONLY. 40 frames of atmosphere building
                   Particles from 0→25. Gradient shifts. Mood establishes
                   Viewer settles into the visual world
                   → BRIDGE pure atmosphere

Beat 2 (f40-f70): Title VERY slow reveal — BlurText letter-by-letter, stagger 8f
                   72-96px, appears to emerge from the atmosphere
                   → PERSIST title

Beat 3 (f70-f100): Title fully visible. Holds 30f
                    Subtle shine sweep across title
                    → PERSIST (intentional breathing room)

Beat 4 (f100-f140): Subtitle appears below — 44px, muted
                     Environmental visual hint (0.3 opacity) in background
                     → PERSIST all

Beat 5 (f140+):   Gradual content build. Never rushed
                   → PERSIST everything with slow layering
```

**Components:** BlurText (very slow), AnimatedText, ShiftingGradient, AmbientBackground (animated)
**Ambient:** Particle count animates from 0 to 30+. Color temperature shifts slowly

---

### F2 — Environment Build
**Best for:** World-building, scenario setup, immersive storytelling
**Layout:** floating
**Duration range:** 200-350 frames

**Composition regions:**
- Full frame layered environment
- Region A: x=200, y=300, w=1520, h=300 — Setting text (center)
- Region B: x=100, y=650, w=800, h=300 — Detail zone left
- Region C: x=1020, y=650, w=800, h=300 — Detail zone right

**Beat flow:**
```
Beat 1 (f0-f30):  Background gradient shift — warm→cool or cool→warm
                   Particles activate with domain-specific behavior
                   ShiftingGradient establishes world
                   → BRIDGE atmosphere

Beat 2 (f30-f60): Setting text in Region A — "2:17 a.m." or location
                   BlurText, 80px, slow reveal
                   → PERSIST setting

Beat 3 (f60-f100): Detail elements — Region B and C get context elements
                    Icons, small text, atmospheric shapes
                    → PERSIST all

Beat 4 (f100+):   First content beat enters — the story begins
                   All environmental layers persist as world
                   → PERSIST everything
```

**Components:** ShiftingGradient, BlurText, AnimatedText, domain-specific icons
**Ambient:** Heavy atmosphere — particles 35+, shapes 5+, rich vignette

---

### F3 — Color Story
**Best for:** Emotional opening, palette-driven narrative, mood piece
**Layout:** cinematic
**Duration range:** 200-300 frames

**Composition regions:**
- Region A: x=0, y=0, w=1920, h=1080 — Full frame color canvas
- Region B: x=300, y=350, w=1320, h=380 — Content zone (center)

**Beat flow:**
```
Beat 1 (f0-f30):  Frame in unexpected color — warm amber or cool blue
                   ShiftingGradient begins slow cycle
                   → BRIDGE color establishes mood

Beat 2 (f30-f60): First text appears in Region B — color-coordinated
                   Background begins shifting toward next mood
                   → PERSIST text, BRIDGE color shift

Beat 3 (f60-f100): More text/visual content builds
                    Color reaches domain palette
                    Each beat's text color matches the moment's background
                    → PERSIST all content

Beat 4 (f100+):   Color landed on final domain palette
                   All content visible against final mood
                   → PERSIST everything
```

**Components:** ShiftingGradient (multi-stage), interpolateColors, AnimatedText
**Ambient:** Particles shift color WITH the gradient — unified mood

---

### F4 — Texture Layer
**Best for:** Abstract opening, art-style, geometric aesthetic
**Layout:** stacked
**Duration range:** 150-250 frames

**Composition regions:**
- Texture layer: x=0, y=0, w=1920, h=1080 — Geometric patterns (BEHIND content)
- Content layer: x=200, y=200, w=1520, h=680 — Main content (OVER texture)

**Beat flow:**
```
Beat 1 (f0-f30):  Geometric texture builds — circles draw, lines extend, grid appears
                   Abstract, decorative, 0.08-0.12 opacity
                   → BRIDGE texture is permanent background

Beat 2 (f30-f60): First content appears OVER texture — text or icon
                   Texture continues building slowly behind
                   → PERSIST content, BRIDGE texture

Beat 3 (f60-f90): More content layers on top
                   Texture at final complexity, settled at 0.08 opacity
                   → PERSIST all

Beat 4 (f90+):    Rich composition: detailed texture BG + layered content FG
                   Depth from texture gives professional quality
                   → PERSIST everything
```

**Components:** SVG geometric shapes (circles, lines, triangles), AnimatedText, ShinyText
**Ambient:** Texture IS the ambient layer — replaces standard particles

---

### F5 — Particle Narrative
**Best for:** Energy concepts, motion, transformation, emergence
**Layout:** floating
**Duration range:** 200-300 frames

**Composition regions:**
- Region A: x=0, y=0, w=1920, h=1080 — Full frame particle field
- Region B: x=400, y=400, w=1120, h=280 — Text zone (center, appears late)

**Beat flow:**
```
Beat 1 (f0-f40):  Particles start slow and sparse (10 particles, speed 0.2)
                   Random positions, gentle drift
                   → BRIDGE particles are the content

Beat 2 (f40-f80): Particles accelerate and multiply (10→40, speed 0.2→0.8)
                   Energy visibly increasing
                   → BRIDGE energy builds

Beat 3 (f80-f120): Particles form a shape or constellation — converge to positions
                    Shape recognizable: icon, symbol, letter, object
                    → TRANSFORM particles → meaningful shape

Beat 4 (f120+):   Text labels the shape in Region B
                   Particle shape holds with subtle breathing
                   → PERSIST shape + text
```

**Components:** AmbientBackground (animated props), AnimatedText
**Ambient:** Particles ARE the primary visual — no traditional ambient separation

---

### F6 — Soundscape Visual
**Best for:** Audio-driven, music-related, rhythm concepts
**Layout:** cinematic
**Duration range:** 150-250 frames

**Composition regions:**
- Region A: x=100, y=200, w=1720, h=400 — Waveform/frequency zone
- Region B: x=300, y=620, w=1320, h=300 — Text zone (below bars)

**Beat flow:**
```
Beat 1 (f0-f25):  Frequency bars appear across Region A — 30-50 bars
                   Heights oscillate with Math.sin patterns at different frequencies
                   → BRIDGE bars establish rhythm

Beat 2 (f25-f55): Bars settle into a pattern — heights normalize
                   Space between bars becomes readable
                   → BRIDGE bars become frame

Beat 3 (f55-f85): Text emerges in gaps between bars in Region B
                   Bars dim to 0.3 and become decorative frame
                   → TRANSFORM bars → decoration, PERSIST text

Beat 4 (f85+):    Full composition: decorative bars + text content
                   Bars still subtly oscillate (breathing)
                   → PERSIST everything
```

**Components:** Custom frequency bars (div heights via interpolate), AnimatedText
**Ambient:** Minimal extra particles — bars provide the ambient energy

---

## Template Selection Quick Reference

### By Script Opening Type

| Opening Type | Best Templates | Why |
|---|---|---|
| Question | E3, A1, E6 | Hold the question, build curiosity |
| Stat/number | C1, C2, C5 | Number impact first |
| Command/imperative | A1, A5, B6 | Authoritative, text-forward |
| Contrast/vs | B5, E5, D6 | Side-by-side comparison |
| Story/scene | F1, F2, D4 | Mood first, content second |
| Metaphor/analogy | D1, D2, D3 | Visual representation first |
| Data/evidence | C2, C3, C6 | Accumulate proof |
| Mystery/puzzle | E6, E4, E3 | Slow reveal, suspense |
| Urgency/time | E2, C4, A4 | Energy, speed, countdown |
| Brand/title | B6, B1, F3 | Professional establishment |

### By Energy Level

| Energy | Templates | Characteristics |
|---|---|---|
| Low | F1, D4, F2, F3 | Slow builds, long pauses, atmosphere-first |
| Medium | A1, A3, D1, D2, E3, B6 | Balanced pace, clear accumulation |
| High | C1, E1, B5, A2, C4 | Slams, fast reveals, impact moments |
| Peak | E2, A4, C6, E5 | Urgency, racing, dramatic transforms |
