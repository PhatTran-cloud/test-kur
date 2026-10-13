# Component Registry

All components in this system are **blueprints**. Only components in `src/components/core/` are pre-built. Everything else is built on-demand by Claude Code when a spec requires it.

---

## Core Components — `src/components/core/`

### AnimatedText
**Import:** `import { AnimatedText } from '../../components/core'`

Spring-animated text with enforced style-guide minimums. Clamps font sizes to design system floors.

```tsx
<AnimatedText
  variant="hero"       // hero | title | body | code | label
  size={84}            // clamped to variant minimum
  color="bright"       // light | bright | muted | dark | custom hex
  entrance="slideUp"   // fade | slideUp | slideDown | scale | none
  startFrame={0}
  springPreset="gentle" // gentle | bouncy | snappy | slow
  align="center"
>
  Your Text Here
</AnimatedText>
```

**Variant defaults (long-form 1920x1080):**
| Variant | Min | Default | Font |
|---------|-----|---------|------|
| hero | 80px | 96px | Inter 700 |
| title | 56px | 64px | Inter 600 |
| body | 44px | 52px | Inter 400 |
| code | 32px | 36px | JetBrains Mono 400 |
| label | 28px | 32px | Inter 500 |

---

### SceneContainer
**Import:** `import { SceneContainer } from '../../components/core'`

Base scene wrapper with safe margins, background presets, and fade in/out.

```tsx
<SceneContainer
  background="dark"       // dark | surface | warm | cosmic | light | custom hex
  safeMargin="recommended" // minimum (5%) | recommended (8%) | none | number
  fadeIn={true}
  fadeInDuration={30}
  fadeOut={true}
  fadeOutStart={240}
  fadeOutDuration={30}
>
  {/* Scene content */}
</SceneContainer>
```

---

### SafeAreaGuide (dev only)
**Import:** `import { SafeAreaGuide } from '../../components/core'`

Red overlay showing safe margins. For development/debugging only.

```tsx
<SafeAreaGuide margin={8} />
```

---

## Effects — `src/components/core/effects/`

**Barrel import:** `import { GlitchText, ShinyText, BlurText, CountUp } from '../../components/core/effects'`

### GlitchText
Chromatic aberration glitch with red/cyan layers. Use for errors, bugs, dramatic moments.

```tsx
<GlitchText
  startFrame={0}
  intensity={1}        // 0-1
  speed={3}            // lower = faster
  enableShadows={true}
  color="#ffffff"
  fontSize={84}
>
  ERROR
</GlitchText>
```

### GlitchBurst
Periodic glitch that activates in bursts. Subtler than constant GlitchText.

```tsx
<GlitchBurst
  startFrame={0}
  burstInterval={90}   // frames between bursts
  burstDuration={15}   // frames per burst
  fontSize={84}
>
  UNSTABLE
</GlitchBurst>
```

---

### ShinyText
Animated shine sweep across text. Use for first mention of key terms.

```tsx
<ShinyText
  startFrame={0}
  color="#E8EAF0"
  shineColor="#ffffff"
  duration={60}        // frames per sweep
  pauseDuration={30}   // frames between sweeps
  direction="left"
  fontSize={56}
>
  memory
</ShinyText>
```

### GradientText
Animated gradient color shift. Use for AI concepts, abstract ideas.

```tsx
<GradientText
  startFrame={0}
  colors={['#A78BFA', '#F472B6', '#C4A6F0']}
  duration={120}
  direction="horizontal"  // horizontal | vertical | diagonal
  yoyo={true}
  fontSize={56}
>
  artificial intelligence
</GradientText>
```

---

### BlurText
Word-by-word or letter-by-letter blur reveal. Use for dramatic entrances.

```tsx
<BlurText
  startFrame={0}
  animateBy="words"    // words | letters
  direction="bottom"   // top | bottom | left | right
  staggerDelay={4}     // frames between each element
  blurAmount={10}
  distance={30}
  fontSize={56}
>
  This reveals word by word
</BlurText>
```

### FocusBlur
Blur in, sharp, blur out. Use to focus attention temporarily.

```tsx
<FocusBlur
  startFrame={0}
  focusFrame={30}
  blurOutFrame={120}
  blurAmount={8}
>
  <div>Focus on this content</div>
</FocusBlur>
```

---

### CountUp
Animated number counting. Use for stats, metrics, growth.

```tsx
<CountUp
  to={1000000}
  from={0}
  startFrame={0}
  duration={60}
  prefix="$"
  suffix="+"
  separator=","
  decimals={0}
  useSpring={true}
  color="#FBBF24"
  fontSize={72}
/>
```

### CountUpWithLabel
CountUp with an animated label underneath.

```tsx
<CountUpWithLabel
  to={99.9}
  suffix="%"
  decimals={1}
  label="ACCURACY"
  labelPosition="bottom"
  startFrame={0}
  fontSize={72}
/>
```

### StatGrid
Grid of multiple CountUp stats. Use for data comparison scenes.

```tsx
<StatGrid
  stats={[
    { value: 1000000, label: 'Users', suffix: '+' },
    { value: 99.9, label: 'Uptime', suffix: '%', decimals: 1 },
    { value: 50, label: 'Countries' },
  ]}
  startFrame={0}
  staggerDelay={15}
  columns={3}
  accentColor="#60A5FA"
  fontSize={72}
/>
```

---

## Ambient & Background Components *(build-on-demand)*

These components form the mandatory Layer 1 (Ambient) and Layer 3 (Overlay) of every scene. NEVER skip these — a scene without them looks flat and empty.

### AmbientBackground
Floating particles that fill the background with life. **MANDATORY in every scene as Layer 1.**

Choose preset based on script domain (see `design-system.md` Background Presets by Domain).

```tsx
<AmbientBackground
  particleCount={30}      // Min 20 (low energy), 30 (medium), 45 (high)
  particleRadius={10}     // **MINIMUM 6px**. Recommended: 8-12px for long-form
  speed={0.6}             // 0.3 (low), 0.6 (medium), 1.0 (high)
  color={COLORS.primary}  // Primary color from domain palette
  opacity={[0.15, 0.4]}  // Range [min, max]. NEVER below 0.15
  glowRadius={30}         // boxShadow glow in px. Recommended: particleRadius × 3
/>
```

**Domain-specific presets:**

| Domain | particleCount | particleRadius | speed | Color |
|--------|-------------|---------------|-------|-------|
| Space/Astronomy | 30-40 | 8-12 | 0.3-0.5 | Gold/blue glow |
| Finance/Economics | 25 | 6-8 | 0.6 | Green/white |
| Technology/AI | 35+ | 8-10 | 0.8 | Cyan |
| Nature/Biology | 25 | 10-14 | 0.3 | Green/warm |
| History/Culture | 20-25 | 8-10 | 0.4 | Amber/sepia |
| Health/Medicine | 20 | 8-10 | 0.4 | Blue/white |
| Philosophy/Abstract | 30 | 10-14 | 0.2 | Purple/deep |
```

**Implementation pattern:**
```tsx
// Each particle: div with borderRadius, animated position + opacity
const Particle = ({ x, y, radius, delay, color }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin((frame + delay) * 0.02) * 15;
  const vDrift = Math.cos((frame + delay) * 0.015) * 10;
  const pulse = 0.2 + Math.sin((frame + delay) * 0.04) * 0.15;
  return (
    <div style={{
      position: 'absolute', left: x + drift, top: y + vDrift,
      width: radius * 2, height: radius * 2, borderRadius: '50%',
      backgroundColor: color, opacity: pulse,
      boxShadow: `0 0 ${radius * 3}px ${color}`,
    }} />
  );
};
```

### AmbientShapes
Large decorative geometric shapes drifting slowly. Fills empty space. Choose shape types per domain.

```tsx
<AmbientShapes
  count={4}                    // 3-5 shapes recommended
  sizeRange={[80, 200]}        // Size range in px
  types={['circle', 'arc', 'ring']}  // Shape types (see below)
  color={COLORS.primary}
  opacity={0.1}                // 0.08-0.15
  driftSpeed={0.01}            // Slow drift multiplier
/>
```

**Available shape types:**

| Type | Rendering | Best For |
|------|-----------|----------|
| `ring` | Circle with border-only (2px stroke, no fill) | Default, universal |
| `diamond` | Rotated 45° square (`transform: rotate(45deg)`, border-only) | Finance, tech, angular topics |
| `arc` | SVG `<path>` drawing 90-180° partial circle, animated strokeDashoffset | Flow, orbital, journey topics |
| `cross` | Two thin 2px rectangles crossing at center (+) | Interconnection, medical, grid topics |
| `hexagon` | SVG 6-sided polygon, border-only | Tech, chemistry, structure topics |

**Domain → shape type mapping:**

| Domain | Shape Types |
|--------|------------|
| Space/Astronomy | ring, arc |
| Finance/Economics | diamond, cross |
| Technology/AI | hexagon, diamond |
| Nature/Biology | ring (soft, thin 1px) |
| History/Culture | arc, ring |
| Health/Medicine | ring, cross |
| Philosophy/Abstract | ring (large, very faint) |
```

**Implementation pattern:**
```tsx
// Large circle/ring with slow drift
<div style={{
  position: 'absolute', left: x + Math.sin(frame * 0.01) * 20, top: y,
  width: 160, height: 160, borderRadius: '50%',
  border: `2px solid ${COLORS.primary}`,
  opacity: 0.1,
}} />
```

### Vignette
Radial gradient overlay darkening edges. **MANDATORY in every scene as Layer 3.**

```tsx
<Vignette
  opacity={0.6}               // 0.5-0.7 recommended
  breathing={true}             // oscillates: opacity + Math.sin(frame * 0.03) * 0.1
  innerRadius="40%"
  color={COLORS.bg}
/>
```

**Implementation pattern:**
```tsx
<AbsoluteFill style={{
  background: `radial-gradient(ellipse at center, transparent 40%, ${COLORS.bg} 100%)`,
  opacity: 0.6 + Math.sin(frame * 0.03) * 0.1,
}} />
```

### ScanLineOverlay
Horizontal scan line moving vertically. Adds cinematic/tech feel.

```tsx
<ScanLineOverlay
  speed={0.5}         // pixels per frame
  opacity={0.05}      // 0.04-0.08
  color={COLORS.textDim}
  thickness={1}       // px
/>
```

**Implementation pattern:**
```tsx
<div style={{
  position: 'absolute', left: 0, right: 0,
  top: (frame * 0.5) % HEIGHT,
  height: 1, backgroundColor: COLORS.textDim,
  opacity: 0.05,
}} />
```

### ShiftingGradient
Slow-moving gradient for topic transitions and mood shifts.

```tsx
<ShiftingGradient
  fromColor={COLORS.primary + '15'}
  toColor={COLORS.secondary + '15'}
  duration={120}       // frames for one full cycle
  angle={45}
/>
```

---

## Scene Layout Components *(build-on-demand)*

Layout primitives for composing scenes. Used as wrappers around content components.

### Layout Selection Guide

| Content Type | Recommended Layout | Rationale |
|-------------|-------------------|-----------|
| Hook / Opening | cinematic, floating | Wide visual impact, draws attention |
| Comparison (A vs B) | split-h, split-v | Natural two-side structure |
| Timeline / Process | stacked, grid | Sequential progression |
| Data / Stats | grid, radial | Multiple data points |
| Metaphor / Concept | floating, cinematic | Abstract, non-linear |
| Balance / Scale | centered (with side elements) | Focal point needed |
| Verdict / Close | split-h, cinematic | Final summary needs space |

> **Anti-pattern:** CenteredLayout is NOT the default. Max 2 centered per 5 sections. When in doubt, use `floating` or `split-h`.

### CenteredLayout
Centers content horizontally and vertically within safe area.

> **WARNING:** Do not use for more than 2 out of every 5 consecutive sections. Centered is overused by default — use other layouts.

```tsx
<CenteredLayout gap={24} direction="column">
  <AnimatedText variant="hero">Title</AnimatedText>
  <BarChart data={chartData} />
</CenteredLayout>
```

### SplitLayoutH
Horizontal two-panel split. Left/right content areas.

```tsx
<SplitLayoutH
  ratio={0.5}            // 0-1, left panel width ratio
  gap={32}
  dividerColor="#3A3F55"
  dividerWidth={2}
>
  <LeftContent />
  <RightContent />
</SplitLayoutH>
```

### SplitLayoutV
Vertical two-panel split. Top/bottom content areas.

```tsx
<SplitLayoutV
  ratio={0.4}
  gap={24}
>
  <TopContent />
  <BottomContent />
</SplitLayoutV>
```

### GridLayout
CSS grid wrapper with animated cell entrances.

```tsx
<GridLayout
  columns={3}
  rows={2}
  gap={20}
  cellStagger={8}       // frames between cell entrance
  startFrame={0}
>
  {cells.map(cell => <Cell key={cell.id} />)}
</GridLayout>
```

### RadialLayout
Positions children in a circle around a center point.

```tsx
<RadialLayout
  radius={300}
  startAngle={0}
  items={items}
  stagger={12}
  startFrame={0}
/>
```

### StackedLayout
Z-stacked layers with offset for depth illusion.

```tsx
<StackedLayout
  offsetX={8}
  offsetY={8}
  layers={3}
  startFrame={0}
>
  <Card />
</StackedLayout>
```

### FloatingLayout
Positions children at absolute coordinates with spring entrances.

```tsx
<FloatingLayout
  positions={[
    { x: 200, y: 150 },
    { x: 800, y: 400 },
    { x: 500, y: 600 },
  ]}
  stagger={10}
  startFrame={0}
>
  <IconDisplay icon="gear" />
  <IconDisplay icon="lock" />
  <IconDisplay icon="cloud" />
</FloatingLayout>
```

### CinematicLayout
Full-bleed layout with letterbox bars for cinematic feel.

```tsx
<CinematicLayout
  barHeight={80}
  barColor="#000000"
  fadeInDuration={20}
  startFrame={0}
>
  <SceneContent />
</CinematicLayout>
```

---

## Hook Composition Patterns *(build-on-demand)*

Reusable sub-components for building hook scenes from `hook-templates.md`. Use these to implement region-based, persistent-beat hook compositions.

### RegionLayout
Positions content in declared pixel regions on the 1920x1080 frame. Each region is an absolute-positioned container.

```tsx
<RegionLayout
  regions={[
    { id: 'hero-text', x: 160, y: 200, width: 960, height: 500 },
    { id: 'visual', x: 1100, y: 150, width: 660, height: 600 },
    { id: 'accent', x: 160, y: 720, width: 1600, height: 200 },
  ]}
  activeRegion="hero-text"   // Which region has focus (opacity boost)
>
  <RegionContent id="hero-text">{/* text beats */}</RegionContent>
  <RegionContent id="visual">{/* icon/chart */}</RegionContent>
  <RegionContent id="accent">{/* bottom bar */}</RegionContent>
</RegionLayout>
```

**Implementation pattern:**
```tsx
// Each region = AbsoluteFill with clip + position
const RegionContent = ({ id, x, y, width, height, children }) => (
  <div style={{
    position: 'absolute', left: x, top: y, width, height,
    overflow: 'hidden',
  }}>
    {children}
  </div>
);
```

### PersistentBeatStack
Manages multiple beats that accumulate without disappearing. Oldest beats dim/shrink when exceeding maxVisible.

```tsx
<PersistentBeatStack
  maxVisible={5}          // Max before oldest starts dimming
  dimOpacity={0.5}        // Opacity for non-focus beats
  shrinkScale={0.8}       // Scale for non-focus beats
  transitionFrames={15}   // Frames for dim/shrink animation
>
  <Beat startFrame={0} persist="PERSIST">{/* beat 1 */}</Beat>
  <Beat startFrame={30} persist="PERSIST">{/* beat 2 */}</Beat>
  <Beat startFrame={60} persist="TRANSFORM">{/* beat 3 */}</Beat>
</PersistentBeatStack>
```

**Implementation pattern:**
```tsx
// Each beat's opacity = function of how many newer beats exist
const beatOpacity = interpolate(
  newerBeatCount,
  [0, 1, 2, 3],
  [1.0, 0.7, 0.5, 0.4],
  { extrapolateRight: 'clamp' }
);
```

### AccumulatingText
Text lines that build up progressively — old lines stay visible, new lines push stack up.

```tsx
<AccumulatingText
  lines={[
    { text: 'Wake up.', startFrame: 15, size: 96, color: '#E8EAF0' },
    { text: 'Look at your portfolio.', startFrame: 45, size: 52, color: '#E8EAF0' },
    { text: 'Really look at it.', startFrame: 75, size: 72, color: '#F43F5E' },
  ]}
  lineGap={24}            // Vertical gap between lines (px)
  compressAfter={3}       // After N lines, older lines compress
  compressScale={0.7}     // Scale for compressed lines
  compressOpacity={0.4}   // Opacity for compressed lines
/>
```

**Implementation pattern:**
```tsx
// Each line: spring entrance, then stays. When compressAfter exceeded:
// oldest lines: scale(0.7), opacity(0.4), translateY toward top
// Compression is animated over 20 frames via interpolate
```

### FrameFlash
Full-screen color flash for emphasis moments (stat slams, reveals, transitions).

```tsx
<FrameFlash
  frame={30}              // Frame to trigger flash
  color="#ffffff"          // Flash color
  duration={5}            // Flash duration in frames
  intensity={0.3}         // Max opacity of flash
/>
```

**Implementation pattern:**
```tsx
const flashOpacity = interpolate(
  currentFrame,
  [frame, frame + 2, frame + duration],
  [0, intensity, 0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);
// AbsoluteFill with backgroundColor and flashOpacity
```

### MaskReveal
Progressive reveal via expanding mask shape. Content behind mask becomes visible as mask grows.

```tsx
<MaskReveal
  shape="circle"          // 'circle' | 'rect' | 'horizontal'
  startFrame={20}
  duration={60}           // Frames to fully reveal
  origin={{ x: 960, y: 540 }}  // Center of mask expansion
>
  {/* Content to reveal */}
</MaskReveal>
```

**Implementation pattern:**
```tsx
// circle: clip-path: circle(R% at Xpx Ypx) where R animates 0→100
// rect: clip-path: inset(T% R% B% L%) where all animate 50→0
// horizontal: clip-path: inset(0 R% 0 L%) where R,L animate 50→0
const radius = interpolate(frame, [startFrame, startFrame + duration], [0, 100]);
style={{ clipPath: `circle(${radius}% at ${origin.x}px ${origin.y}px)` }}
```

---

## Data Visualization — Charts *(all build-on-demand)*

### LineChart
Animated line chart. Line draws progressively with narration.

```tsx
<LineChart
  data={[{x: 1970, y: 2}, {x: 1975, y: 6}, {x: 1982, y: 14}]}
  xLabel="Year"
  yLabel="Inflation %"
  accentColor="#FBBF24"
  drawStartFrame={100}
  drawDuration={60}
  showDots={true}
  showLabels={true}
  width={1100}
  height={620}
/>
```

### BarChart
Vertical bar chart. Bars grow from baseline.

```tsx
<BarChart
  data={[{label: "USA", value: 27, color: "#60A5FA"}, {label: "China", value: 18, color: "#F43F5E"}]}
  orientation="vertical"
  startFrame={100}
  staggerDelay={12}
  showValues={true}
  accentColor="#60A5FA"
  width={1100}
  height={620}
/>
```

### HorizontalBar
Horizontal bar chart. Bars grow left-to-right.

```tsx
<HorizontalBar
  data={[{label: "React", value: 68}, {label: "Vue", value: 42}]}
  startFrame={100}
  staggerDelay={8}
  showValues={true}
  barHeight={48}
  accentColor="#60A5FA"
/>
```

### StackedBar
Stacked bar chart. Bottom segment fills first, each stacks on top.

```tsx
<StackedBar
  categories={["Q1", "Q2", "Q3", "Q4"]}
  series={[
    {name: "Product A", color: "#60A5FA", values: [20, 30, 25, 40]},
    {name: "Product B", color: "#34D399", values: [15, 20, 30, 25]},
  ]}
  startFrame={100}
  staggerDelay={12}
/>
```

### GroupedBar
Grouped bar chart. Groups appear staggered, within each group bars grow.

```tsx
<GroupedBar
  categories={["2022", "2023", "2024"]}
  series={[
    {name: "Revenue", color: "#60A5FA", values: [100, 150, 200]},
    {name: "Costs", color: "#F43F5E", values: [80, 100, 120]},
  ]}
  startFrame={100}
  groupStagger={20}
/>
```

### LollipopChart
Stem draws from axis, circle pops at the data point.

```tsx
<LollipopChart
  data={[{label: "A", value: 85}, {label: "B", value: 62}, {label: "C", value: 93}]}
  startFrame={100}
  staggerDelay={10}
  dotRadius={8}
  stemColor="#3A3F55"
  dotColor="#60A5FA"
/>
```

### PieChart
Segments appear clockwise, one by one. Max 6 segments recommended.

```tsx
<PieChart
  data={[
    {label: "Desktop", value: 58, color: "#60A5FA"},
    {label: "Mobile", value: 35, color: "#34D399"},
    {label: "Tablet", value: 7, color: "#FBBF24"},
  ]}
  startFrame={100}
  segmentStagger={15}
  radius={240}
  showLabels={true}
/>
```

### DonutChart
Arc draws around, center stat CountUp animates.

```tsx
<DonutChart
  data={[{label: "Used", value: 72, color: "#60A5FA"}, {label: "Free", value: 28, color: "#3A3F55"}]}
  startFrame={100}
  innerRadius={140}
  outerRadius={220}
  centerLabel="72%"
  centerFontSize={64}
/>
```

### HalfDonut
Semicircle draws, percentage label appears below.

```tsx
<HalfDonut
  value={68}
  max={100}
  color="#34D399"
  label="Completion"
  startFrame={100}
  radius={200}
/>
```

### ScatterPlot
Dots appear sequentially, each lands with micro-pulse.

```tsx
<ScatterPlot
  data={[{x: 10, y: 50, label: "A"}, {x: 30, y: 80, label: "B"}]}
  xLabel="Price"
  yLabel="Quality"
  startFrame={100}
  dotStagger={6}
  dotRadius={8}
  accentColor="#A78BFA"
/>
```

### BubbleChart
Bubbles grow from 0 scale, staggered. Size encodes third dimension.

```tsx
<BubbleChart
  data={[{x: 10, y: 50, size: 100, label: "USA", color: "#60A5FA"}]}
  xLabel="GDP"
  yLabel="Life Expectancy"
  startFrame={100}
  bubbleStagger={8}
  maxRadius={60}
/>
```

### AreaChart
Line draws first, then area fills below with gradient.

```tsx
<AreaChart
  data={[{x: 0, y: 10}, {x: 1, y: 30}, {x: 2, y: 25}, {x: 3, y: 45}]}
  fillColor="#60A5FA"
  fillOpacity={0.3}
  lineColor="#60A5FA"
  startFrame={100}
  drawDuration={60}
/>
```

### StackedArea
Bottom area fills first, each area stacks on top.

```tsx
<StackedArea
  series={[
    {name: "Web", color: "#60A5FA", data: [10, 20, 30, 40]},
    {name: "Mobile", color: "#34D399", data: [5, 15, 25, 30]},
  ]}
  xLabels={["Q1", "Q2", "Q3", "Q4"]}
  startFrame={100}
  drawDuration={60}
/>
```

### WaterfallChart
Bars appear left-to-right. Green bars for additions, red for subtractions.

```tsx
<WaterfallChart
  data={[
    {label: "Revenue", value: 500, type: "positive"},
    {label: "COGS", value: -200, type: "negative"},
    {label: "Gross Profit", value: 300, type: "total"},
  ]}
  startFrame={100}
  barStagger={15}
  positiveColor="#34D399"
  negativeColor="#F43F5E"
  totalColor="#60A5FA"
/>
```

### FunnelChart
Widest stage at top, narrows downward. Each stage = one BEAT.

```tsx
<FunnelChart
  stages={[
    {label: "Visitors", value: 10000, color: "#60A5FA"},
    {label: "Leads", value: 3000, color: "#A78BFA"},
    {label: "Customers", value: 500, color: "#34D399"},
  ]}
  startFrame={100}
  stageStagger={20}
  showPercentage={true}
/>
```

### CandlestickChart
Candles appear left-to-right. Green for up, red for down.

```tsx
<CandlestickChart
  data={[{open: 100, high: 110, low: 95, close: 108, label: "Mon"}]}
  startFrame={100}
  candleStagger={8}
  upColor="#34D399"
  downColor="#F43F5E"
/>
```

### HeatmapChart
Cells fill row by row, color intensity builds gradually.

```tsx
<HeatmapChart
  data={[[1, 5, 3], [7, 2, 8], [4, 9, 1]]}
  rowLabels={["Mon", "Tue", "Wed"]}
  colLabels={["AM", "PM", "Night"]}
  colorRange={["#141420", "#60A5FA"]}
  startFrame={100}
  cellStagger={4}
/>
```

### RadarChart
Axes draw first, then polygon fills inward from center.

```tsx
<RadarChart
  axes={["Speed", "Power", "Range", "Defense", "Accuracy"]}
  data={[80, 65, 90, 45, 72]}
  accentColor="#A78BFA"
  fillOpacity={0.3}
  startFrame={100}
  drawDuration={45}
/>
```

### TreemapChart
Largest cell appears first, smaller cells fill in progressively.

```tsx
<TreemapChart
  data={[
    {label: "USA", value: 27, color: "#60A5FA"},
    {label: "China", value: 18, color: "#F43F5E"},
    {label: "Japan", value: 5, color: "#FBBF24"},
  ]}
  startFrame={100}
  cellStagger={12}
  showValues={true}
/>
```

### GanttChart
Rows appear top-down, bars extend to their duration.

```tsx
<GanttChart
  tasks={[
    {name: "Design", start: 0, end: 3, color: "#A78BFA"},
    {name: "Build", start: 2, end: 7, color: "#60A5FA"},
    {name: "Test", start: 6, end: 9, color: "#34D399"},
  ]}
  startFrame={100}
  rowStagger={15}
  timeUnit="weeks"
/>
```

### SankeyDiagram
Source nodes appear, flows draw across, target nodes appear.

```tsx
<SankeyDiagram
  nodes={[
    {id: "coal", label: "Coal", color: "#8890A4"},
    {id: "solar", label: "Solar", color: "#FBBF24"},
    {id: "electricity", label: "Electricity", color: "#60A5FA"},
  ]}
  links={[
    {source: "coal", target: "electricity", value: 60},
    {source: "solar", target: "electricity", value: 40},
  ]}
  startFrame={100}
  flowDuration={45}
/>
```

---

## Data Visualization — Info *(all build-on-demand)*

### StatBar
Single percentage bar. Fills left-to-right.

```tsx
<StatBar
  value={68}
  max={100}
  label="Market share"
  color="#34D399"
  startFrame={100}
  fillDuration={45}
  height={56}
  width={960}
/>
```

### WaffleChart
Grid of cells that fill cell by cell, row by row. Highlighted cells represent the selected group.

```tsx
<WaffleChart
  total={100}
  filled={72}
  filledColor="#60A5FA"
  emptyColor="#1C1C2E"
  columns={10}
  startFrame={100}
  cellStagger={2}
  label="72% of users"
/>
```

### PictogramChart
Icons appear one by one. Highlighted icons represent the selected group.

```tsx
<PictogramChart
  icon="person"
  total={20}
  highlighted={14}
  highlightColor="#60A5FA"
  dimColor="#3A3F55"
  startFrame={100}
  iconStagger={3}
  label="14 out of 20"
/>
```

### DataTable
Rows and columns comparison grid. Headers appear first, rows stagger in.

```tsx
<DataTable
  headers={["Metric", "2023", "2024"]}
  rows={[
    ["Revenue", "$1.2M", "$1.8M"],
    ["Users", "50K", "120K"],
  ]}
  startFrame={100}
  rowStagger={12}
  accentColor="#60A5FA"
  highlightRow={1}
/>
```

### FeatureMatrix
Headers appear, then checkmarks/X marks appear staggered.

```tsx
<FeatureMatrix
  features={["SSO", "API", "Analytics"]}
  products={["Free", "Pro", "Enterprise"]}
  matrix={[
    [false, true, true],
    [false, true, true],
    [false, false, true],
  ]}
  startFrame={100}
  cellStagger={6}
  checkColor="#34D399"
  crossColor="#F43F5E"
/>
```

### PricingTable
Tier cards appear staggered. Recommended tier glows.

```tsx
<PricingTable
  tiers={[
    {name: "Free", price: "$0", features: ["1 project", "Basic support"]},
    {name: "Pro", price: "$29", features: ["Unlimited", "Priority support"], recommended: true},
  ]}
  startFrame={100}
  tierStagger={15}
  accentColor="#60A5FA"
/>
```

### RankingTable
Rows appear top-down with rank numbers counting up.

```tsx
<RankingTable
  items={[
    {rank: 1, label: "React", value: "68%", color: "#60A5FA"},
    {rank: 2, label: "Vue", value: "42%", color: "#34D399"},
  ]}
  startFrame={100}
  rowStagger={10}
  showBars={true}
/>
```

### Scorecard
Dimensions reveal one by one, scores fill left-to-right.

```tsx
<Scorecard
  dimensions={[
    {label: "Performance", score: 92, maxScore: 100, color: "#34D399"},
    {label: "Security", score: 78, maxScore: 100, color: "#FBBF24"},
  ]}
  startFrame={100}
  dimensionStagger={15}
/>
```

### StepIndicator
Steps appear left-to-right, current step highlighted with accent.

```tsx
<StepIndicator
  steps={["Setup", "Configure", "Deploy", "Monitor"]}
  currentStep={2}
  startFrame={100}
  stepStagger={12}
  accentColor="#60A5FA"
  completedColor="#34D399"
/>
```

### PhaseBar
Horizontal bar divided into phases, each section fills progressively.

```tsx
<PhaseBar
  phases={[
    {label: "Research", width: 0.3, color: "#A78BFA"},
    {label: "Build", width: 0.5, color: "#60A5FA"},
    {label: "Launch", width: 0.2, color: "#34D399"},
  ]}
  startFrame={100}
  fillDuration={60}
  height={48}
/>
```

### Checklist
Items appear one by one with animated checkmark on each.

```tsx
<Checklist
  items={[
    {text: "Database migrated", checked: true},
    {text: "Tests passing", checked: true},
    {text: "Deploy to prod", checked: false},
  ]}
  startFrame={100}
  itemStagger={18}
  checkColor="#34D399"
/>
```

### FunnelProgress
Vertical funnel segments fill top to bottom, showing conversion.

```tsx
<FunnelProgress
  stages={["Awareness", "Interest", "Decision", "Action"]}
  values={[100, 60, 30, 12]}
  startFrame={100}
  stageStagger={20}
  accentColor="#60A5FA"
/>
```

### RoadmapTimeline
Future milestones appear on a horizontal axis.

```tsx
<RoadmapTimeline
  milestones={[
    {label: "Beta", date: "Q1 2025", status: "complete", color: "#34D399"},
    {label: "Launch", date: "Q2 2025", status: "current", color: "#60A5FA"},
    {label: "Scale", date: "Q4 2025", status: "future", color: "#8890A4"},
  ]}
  startFrame={100}
  milestoneStagger={20}
/>
```

---

## Diagrams — Flow & Structure *(all build-on-demand)*

### FlowDiagram
Linear A to B to C flow with animated arrows.

```tsx
<FlowDiagram
  nodes={[
    {id: "a", label: "Input", color: "#FBBF24"},
    {id: "b", label: "Process", color: "#60A5FA"},
    {id: "c", label: "Output", color: "#34D399"},
  ]}
  direction="horizontal"  // horizontal | vertical
  startFrame={100}
  nodeStagger={20}
  arrowDuration={15}
  nodeWidth={320}
  nodeHeight={88}
/>
```

### CycleDiagram
Circular flow diagram. Nodes appear then arrows sweep clockwise.

```tsx
<CycleDiagram
  steps={["Photosynthesis", "Carbon store", "Decomposition", "CO2 release"]}
  accentColor="#06D6A0"
  startFrame={100}
  radius={280}
  stepRevealStagger={25}
/>
```

### CausationChain
Vertical domino-effect causal chain. Each node causes the next.

```tsx
<CausationChain
  causes={["Drought", "Food shortage", "Price spike", "Social unrest"]}
  startFrame={100}
  causeStagger={30}
  arrowColor="#F43F5E"
  boxColor="#141420"
/>
```

### DecisionTree
Root node branches into child nodes. Reveals top-down.

```tsx
<DecisionTree
  root={{label: "Start", children: [
    {label: "Option A", children: [{label: "Result 1"}]},
    {label: "Option B", children: [{label: "Result 2"}]},
  ]}}
  startFrame={100}
  levelStagger={25}
  nodeColor="#141420"
  edgeColor="#3A3F55"
  accentColor="#60A5FA"
/>
```

### AsyncPipeline
Parallel tracks with progress bars filling simultaneously.

```tsx
<AsyncPipeline
  tracks={[
    {label: "API Call", duration: 45, color: "#60A5FA"},
    {label: "DB Query", duration: 30, color: "#34D399"},
    {label: "Cache", duration: 15, color: "#FBBF24"},
  ]}
  startFrame={100}
  showLabels={true}
/>
```

### LayerStack
Stacked layers building bottom-up. Each layer lights up as narration reaches it.

```tsx
<LayerStack
  layers={[
    {label: "Hardware", color: "#8890A4"},
    {label: "OS", color: "#60A5FA"},
    {label: "Runtime", color: "#A78BFA"},
    {label: "Application", color: "#34D399"},
  ]}
  startFrame={100}
  layerStagger={15}
  direction="bottom-up"
/>
```

### PyramidChart
Triangular hierarchy. Base layer first, narrows to top.

```tsx
<PyramidChart
  levels={[
    {label: "Self-actualization", color: "#A78BFA", width: 0.3},
    {label: "Esteem", color: "#60A5FA", width: 0.5},
    {label: "Social", color: "#34D399", width: 0.7},
    {label: "Safety", color: "#FBBF24", width: 0.85},
    {label: "Physiological", color: "#F43F5E", width: 1.0},
  ]}
  startFrame={100}
  levelStagger={18}
  direction="bottom-up"
/>
```

### TreeDiagram
Hierarchical tree, reveals top-down from root to leaves.

```tsx
<TreeDiagram
  root={{label: "CEO", children: [
    {label: "CTO", children: [{label: "Engineering"}, {label: "DevOps"}]},
    {label: "CFO", children: [{label: "Finance"}, {label: "Legal"}]},
  ]}}
  startFrame={100}
  levelStagger={20}
  nodeColor="#141420"
  edgeColor="#3A3F55"
/>
```

### NestedBoxes
Outside-in reveal. Largest box first, nested boxes appear inside.

```tsx
<NestedBoxes
  levels={[
    {label: "Internet", color: "#3A3F55"},
    {label: "Network", color: "#60A5FA"},
    {label: "Transport", color: "#A78BFA"},
    {label: "Application", color: "#34D399"},
  ]}
  startFrame={100}
  levelStagger={15}
/>
```

### HubSpoke
Center hub appears first, spokes radiate outward to satellite nodes.

```tsx
<HubSpoke
  hub={{label: "Core API", color: "#60A5FA"}}
  spokes={[
    {label: "Auth", color: "#A78BFA"},
    {label: "Storage", color: "#34D399"},
    {label: "Analytics", color: "#FBBF24"},
  ]}
  startFrame={100}
  spokeStagger={12}
  radius={300}
/>
```

### NetworkGraph
Force-directed graph. Nodes float in, edges draw between connected nodes.

```tsx
<NetworkGraph
  nodes={[
    {id: "a", label: "Server A", x: 300, y: 300},
    {id: "b", label: "Server B", x: 700, y: 200},
    {id: "c", label: "Server C", x: 500, y: 600},
  ]}
  edges={[
    {from: "a", to: "b", label: "HTTP"},
    {from: "b", to: "c", label: "gRPC"},
  ]}
  startFrame={100}
  nodeStagger={12}
  edgeStagger={8}
/>
```

### DependencyGraph
Chain diagram showing A requires B requires C.

```tsx
<DependencyGraph
  nodes={[
    {id: "react", label: "React"},
    {id: "babel", label: "Babel"},
    {id: "webpack", label: "Webpack"},
  ]}
  dependencies={[
    {from: "react", to: "babel"},
    {from: "babel", to: "webpack"},
  ]}
  startFrame={100}
  nodeStagger={15}
  accentColor="#60A5FA"
/>
```

### PowerMap
Nodes sized by influence. Arrows indicate direction of control.

```tsx
<PowerMap
  entities={[
    {id: "gov", label: "Government", influence: 90, x: 500, y: 200},
    {id: "corp", label: "Corporation", influence: 70, x: 300, y: 500},
    {id: "citizen", label: "Citizens", influence: 40, x: 700, y: 500},
  ]}
  connections={[
    {from: "gov", to: "corp", label: "regulates"},
    {from: "corp", to: "citizen", label: "employs"},
  ]}
  startFrame={100}
/>
```

### VennDiagram
Circle A draws, Circle B draws, overlap region highlights.

```tsx
<VennDiagram
  sets={[
    {label: "Frontend", color: "#60A5FA"},
    {label: "Backend", color: "#34D399"},
  ]}
  overlapLabel="Full Stack"
  overlapColor="#A78BFA"
  startFrame={100}
  setStagger={20}
  radius={220}
/>
```

### RelationshipDiagram
Nodes with labeled edges. Builds progressively.

```tsx
<RelationshipDiagram
  nodes={[
    {id: "fed", label: "Fed", x: 540, y: 300},
    {id: "banks", label: "Banks", x: 240, y: 600},
    {id: "markets", label: "Markets", x: 840, y: 600},
  ]}
  edges={[
    {from: "fed", to: "banks", label: "sets rates", color: "#60A5FA"},
    {from: "banks", to: "markets", label: "credit flow", color: "#34D399"},
  ]}
  startFrame={100}
  nodeStagger={15}
  edgeStagger={20}
/>
```

### EquationReveal
Equation with term-by-term progressive reveal and annotations.

```tsx
<EquationReveal
  terms={[
    {symbol: "GDP", color: "#FBBF24", annotation: "Gross Domestic Product"},
    {symbol: "=", color: "#8890A4"},
    {symbol: "C", color: "#60A5FA", annotation: "Consumption"},
    {symbol: "+", color: "#8890A4"},
    {symbol: "I", color: "#34D399", annotation: "Investment"},
  ]}
  startFrame={100}
  termRevealStagger={25}
  fontSize={84}
  annotationFontSize={32}
/>
```

### EquationDerivation
Steps shown one by one, each derives from the previous.

```tsx
<EquationDerivation
  steps={[
    {equation: "F = ma", annotation: "Newton's second law"},
    {equation: "a = F/m", annotation: "Solve for acceleration"},
    {equation: "a = 10/2 = 5 m/s^2", annotation: "Substitute values"},
  ]}
  startFrame={100}
  stepStagger={30}
  accentColor="#60A5FA"
/>
```

---

## Diagrams — Anatomy & Scale *(all build-on-demand)*

### ExplodedView
Parts fly out from center to reveal internal structure. Labels follow each part.

```tsx
<ExplodedView
  parts={[
    {label: "Shell", color: "#8890A4", offset: {x: -100, y: -80}},
    {label: "Core", color: "#60A5FA", offset: {x: 0, y: 0}},
    {label: "Base", color: "#34D399", offset: {x: 100, y: 80}},
  ]}
  startFrame={100}
  explodeDuration={30}
  labelStagger={10}
/>
```

### AnatomyDiagram
Whole object appears, then arrows draw to labeled parts.

```tsx
<AnatomyDiagram
  subject="Cell"
  parts={[
    {label: "Nucleus", x: 500, y: 400, arrowFrom: {x: 700, y: 200}},
    {label: "Membrane", x: 300, y: 500, arrowFrom: {x: 100, y: 300}},
  ]}
  startFrame={100}
  partStagger={18}
  accentColor="#60A5FA"
/>
```

### CrossSection
Slice plane animates through the object, revealing interior.

```tsx
<CrossSection
  layers={[
    {label: "Crust", thickness: 0.1, color: "#8B6914"},
    {label: "Mantle", thickness: 0.4, color: "#F43F5E"},
    {label: "Core", thickness: 0.5, color: "#FBBF24"},
  ]}
  sliceDirection="left"  // left | right | top
  startFrame={100}
  sliceDuration={30}
/>
```

### SystemDiagram
Named boxes with labeled connections. Architecture-style layout.

```tsx
<SystemDiagram
  components={[
    {id: "client", label: "Client", x: 100, y: 300, color: "#60A5FA"},
    {id: "api", label: "API Gateway", x: 500, y: 300, color: "#A78BFA"},
    {id: "db", label: "Database", x: 900, y: 300, color: "#34D399"},
  ]}
  connections={[
    {from: "client", to: "api", label: "HTTPS"},
    {from: "api", to: "db", label: "SQL"},
  ]}
  startFrame={100}
  componentStagger={15}
/>
```

### ScaleComparison
Objects at relative sizes to show magnitude difference.

```tsx
<ScaleComparison
  reference={{label: "Human cell", size: 1, color: "#60A5FA"}}
  subject={{label: "Virus", size: 0.05, color: "#F43F5E"}}
  startFrame={100}
  showRatio={true}
/>
```

### ZoomSequence
Camera pushes in from overview to detail across multiple zoom levels.

```tsx
<ZoomSequence
  levels={[
    {label: "Galaxy", scale: 1},
    {label: "Solar System", scale: 10},
    {label: "Earth", scale: 100},
    {label: "City", scale: 10000},
  ]}
  startFrame={100}
  zoomStagger={30}
  transitionDuration={20}
/>
```

### LogScaleViz
Nested circles or ruler with logarithmic ticks.

```tsx
<LogScaleViz
  points={[
    {label: "Ant", value: 0.001, color: "#34D399"},
    {label: "Human", value: 1.8, color: "#60A5FA"},
    {label: "Building", value: 300, color: "#FBBF24"},
  ]}
  startFrame={100}
  style="nested-circles"  // nested-circles | ruler
  accentColor="#60A5FA"
/>
```

### HumanScale
Abstract number converted to a human silhouette reference for intuition.

```tsx
<HumanScale
  value={1000000}
  unit="tons"
  humanEquivalent="weight of 12,500 people"
  startFrame={100}
  showSilhouettes={true}
  silhouetteCount={8}
/>
```

---

## Diagrams — Timeline & Comparison *(all build-on-demand)*

### EventTimeline
Horizontal timeline with dots and labels. Dots stagger left-to-right.

```tsx
<EventTimeline
  events={[
    {year: 1970, label: "Nixon shock", color: "#E8B931"},
    {year: 1973, label: "Oil crisis", color: "#F43F5E"},
    {year: 1982, label: "Inflation breaks", color: "#34D399"},
  ]}
  startFrame={100}
  staggerDelay={20}
  showYears={true}
  width={1100}
/>
```

### MilestoneTimeline
Large nodes with wide gaps and bold labels for major events.

```tsx
<MilestoneTimeline
  milestones={[
    {label: "Founded", year: 2010, icon: "rocket", color: "#60A5FA"},
    {label: "IPO", year: 2015, icon: "chart", color: "#34D399"},
    {label: "1B Users", year: 2020, icon: "users", color: "#FBBF24"},
  ]}
  startFrame={100}
  milestoneStagger={25}
/>
```

### EraTimeline
Color-coded blocks with width proportional to era duration.

```tsx
<EraTimeline
  eras={[
    {label: "Ancient", start: -3000, end: 476, color: "#E8B931"},
    {label: "Medieval", start: 476, end: 1453, color: "#A78BFA"},
    {label: "Modern", start: 1453, end: 2024, color: "#60A5FA"},
  ]}
  startFrame={100}
  eraStagger={20}
/>
```

### ParallelTimeline
Two rows of events aligned by time for comparison.

```tsx
<ParallelTimeline
  topTrack={{label: "Company A", events: [{year: 2010, label: "Launch"}]}}
  bottomTrack={{label: "Company B", events: [{year: 2012, label: "Launch"}]}}
  startFrame={100}
  eventStagger={15}
/>
```

### SplitScreen
Two-panel comparison. Each panel has independent content.

```tsx
<SplitScreen
  leftLabel="SQL"
  rightLabel="NoSQL"
  leftColor="#3B82F6"
  rightColor="#8B5CF6"
  startFrame={100}
  dividerAnimates={true}
>
  {/* left children */}
  {/* right children */}
</SplitScreen>
```

### SideBySideStats
Two stat groups side by side for direct comparison.

```tsx
<SideBySideStats
  left={{label: "Before", stats: [{value: 200, unit: "ms", label: "Latency"}]}}
  right={{label: "After", stats: [{value: 15, unit: "ms", label: "Latency"}]}}
  startFrame={100}
  accentColor="#60A5FA"
/>
```

### ComparisonTable
Rows and columns comparison grid. Builds row by row.

```tsx
<ComparisonTable
  headers={["", "SQL", "NoSQL"]}
  rows={[
    ["Schema", "Fixed", "Flexible"],
    ["Scale", "Vertical", "Horizontal"],
  ]}
  accentColor="#3B82F6"
  startFrame={100}
  rowStagger={20}
/>
```

### BeforeAfterSlider
Center wipe line reveals before/after. Drag-reveal animation.

```tsx
<BeforeAfterSlider
  beforeLabel="Legacy"
  afterLabel="Modern"
  beforeColor="#F43F5E"
  afterColor="#34D399"
  startFrame={100}
  wipeDuration={45}
  wipeDirection="left-to-right"
/>
```

### ProsConsPanel
Left panel green (pros), right panel red (cons). Items stagger in.

```tsx
<ProsConsPanel
  pros={["Fast deployment", "Low cost", "Easy to learn"]}
  cons={["Limited scale", "Vendor lock-in"]}
  startFrame={100}
  itemStagger={12}
  prosColor="#34D399"
  consColor="#F43F5E"
/>
```

### SpectrumSlider
Horizontal axis with labeled endpoints. Indicator animates to position.

```tsx
<SpectrumSlider
  leftLabel="Centralized"
  rightLabel="Decentralized"
  position={0.7}         // 0-1
  markerLabel="Blockchain"
  accentColor="#A78BFA"
  startFrame={100}
  slideDuration={30}
/>
```

---

## Geographic *(all build-on-demand)*

### MapHighlight
Base map with highlighted regions. Regions fill with accent color.

```tsx
<MapHighlight
  baseMap="world"       // world | asia | europe | southeast-asia | usa
  highlight={["VN", "TH", "MY"]}
  highlightColor="#60A5FA"
  highlightOpacity={0.7}
  startFrame={100}
  labelCountries={true}
/>
```

### ChoroplethMap
Map base, then colors fill region by region based on data values.

```tsx
<ChoroplethMap
  baseMap="world"
  data={[{region: "US", value: 27}, {region: "CN", value: 18}]}
  colorRange={["#1C1C2E", "#60A5FA"]}
  startFrame={100}
  fillStagger={8}
/>
```

### FlowMap
Animated arrows on map showing movement routes.

```tsx
<FlowMap
  baseMap="world"
  flows={[
    {from: [116, 40], to: [2, 48], label: "Silk Road", color: "#E8B931"},
  ]}
  startFrame={100}
  flowDuration={60}
  animated={true}
/>
```

### DotMap
Map base, dots appear staggered at data locations.

```tsx
<DotMap
  baseMap="world"
  dots={[
    {lat: 40.7, lng: -74, label: "NYC", color: "#60A5FA"},
    {lat: 51.5, lng: -0.1, label: "London", color: "#34D399"},
  ]}
  startFrame={100}
  dotStagger={8}
  dotRadius={6}
/>
```

### BubbleMap
Map base, bubbles grow from 0 scale at data locations. Size encodes value.

```tsx
<BubbleMap
  baseMap="world"
  data={[
    {lat: 40.7, lng: -74, value: 8400000, label: "NYC", color: "#60A5FA"},
  ]}
  startFrame={100}
  bubbleStagger={10}
  maxRadius={40}
/>
```

### HeatMap
Map base, heat gradient radiates outward from hotspots.

```tsx
<HeatMap
  baseMap="world"
  hotspots={[
    {lat: 35.6, lng: 139.7, intensity: 0.9},
    {lat: 40.7, lng: -74, intensity: 0.7},
  ]}
  startFrame={100}
  radiateSpeed={2}
  colorRange={["transparent", "#F43F5E"]}
/>
```

### IsochroneMap
Center point appears, then concentric rings expand outward.

```tsx
<IsochroneMap
  center={{lat: 48.85, lng: 2.35, label: "Paris"}}
  rings={[
    {distance: "1hr", color: "#34D399"},
    {distance: "3hr", color: "#FBBF24"},
    {distance: "6hr", color: "#F43F5E"},
  ]}
  startFrame={100}
  ringStagger={20}
/>
```

---

## Technical *(all build-on-demand)*

### CodeBlock
Syntax-highlighted code display. Lines appear one by one.

```tsx
<CodeBlock
  code={`function hello() {\n  return "world";\n}`}
  language="typescript"
  startFrame={100}
  lineStagger={4}
  highlightLines={[2]}
  highlightColor="#60A5FA"
  fontSize={32}
/>
```

### TerminalWindow
Dark terminal with green prompt. Typing animation.

```tsx
<TerminalWindow
  lines={[
    {prompt: "$ ", text: "npm install", typingSpeed: 3},
    {prompt: "", text: "added 1423 packages", delay: 20},
    {prompt: "$ ", text: "npm start", typingSpeed: 3},
  ]}
  startFrame={100}
  lineStagger={30}
  promptColor="#34D399"
/>
```

### CodeDiff
Side-by-side diff view. Left panel red highlights, right panel green.

```tsx
<CodeDiff
  before={`const x = 1;\nconst y = 2;`}
  after={`const x = 1;\nconst y = 3;\nconst z = 4;`}
  language="typescript"
  startFrame={100}
  removedColor="#F43F5E"
  addedColor="#34D399"
/>
```

### CodeComparison
Wrong code vs right code side by side.

```tsx
<CodeComparison
  leftLabel="Wrong"
  rightLabel="Right"
  leftCode={`if (x = 5) {`}
  rightCode={`if (x === 5) {`}
  leftColor="#F43F5E"
  rightColor="#34D399"
  startFrame={100}
/>
```

### AnnotatedCode
Code block with callout arrows pointing to key lines.

```tsx
<AnnotatedCode
  code={`async function fetchData() {\n  const res = await fetch(url);\n  return res.json();\n}`}
  language="typescript"
  annotations={[
    {line: 1, text: "async keyword", color: "#60A5FA"},
    {line: 2, text: "await pauses here", color: "#FBBF24"},
  ]}
  startFrame={100}
  annotationStagger={20}
/>
```

### InternetDiagram
Layered diagram: Client, ISP, CDN, Origin Server.

```tsx
<InternetDiagram
  layers={["Client", "ISP", "CDN", "Origin"]}
  flows={[{from: 0, to: 3, label: "HTTP Request", color: "#60A5FA"}]}
  startFrame={100}
  layerStagger={15}
/>
```

### RingTopology
Circular node arrangement with connections around the ring.

```tsx
<RingTopology
  nodes={["Node A", "Node B", "Node C", "Node D"]}
  startFrame={100}
  nodeStagger={10}
  radius={250}
  edgeColor="#3A3F55"
  nodeColor="#60A5FA"
/>
```

### PhoneMockup
Phone device frame with content fading in inside.

```tsx
<PhoneMockup
  screenContent={<AppScreen />}
  startFrame={100}
  frameColor="#1C1C2E"
  showStatusBar={true}
  scale={0.8}
/>
```

### BrowserMockup
Browser window frame with URL bar and content.

```tsx
<BrowserMockup
  url="https://example.com"
  screenContent={<WebPage />}
  startFrame={100}
  frameColor="#1C1C2E"
  showControls={true}
/>
```

### DashboardMockup
Dashboard frame with widgets appearing one by one.

```tsx
<DashboardMockup
  widgets={[
    {type: "stat", label: "Users", value: "12.4K"},
    {type: "chart", label: "Revenue", data: [10, 20, 30]},
    {type: "list", label: "Recent", items: ["Order #1", "Order #2"]},
  ]}
  startFrame={100}
  widgetStagger={15}
/>
```

### FormMockup
Form fields appear, auto-fill animates, submit button pulses.

```tsx
<FormMockup
  fields={[
    {label: "Email", value: "user@example.com", type: "text"},
    {label: "Password", value: "********", type: "password"},
  ]}
  submitLabel="Sign In"
  startFrame={100}
  fieldStagger={12}
  fillDelay={20}
/>
```

### NotificationCard
Slides in from top (mobile) or corner (desktop).

```tsx
<NotificationCard
  title="New Message"
  body="You have 3 unread messages"
  icon="bell"
  position="top-right"
  startFrame={100}
  holdDuration={45}
  accentColor="#60A5FA"
/>
```

### OnboardingFlow
Screens stagger in left-to-right like carousel cards.

```tsx
<OnboardingFlow
  screens={[
    {title: "Welcome", description: "Get started in minutes"},
    {title: "Connect", description: "Link your accounts"},
    {title: "Go", description: "You are all set"},
  ]}
  startFrame={100}
  screenStagger={25}
  accentColor="#60A5FA"
/>
```

---

## Visual Assets *(all build-on-demand)*

### IconDisplay
Single icon with spring entrance and glow pulse.

```tsx
<IconDisplay
  icon="shield"          // icon name or SVG path
  size={120}
  color="#60A5FA"
  startFrame={100}
  springPreset="bouncy"
  glowAfterLand={true}
/>
```

### IconGroup
Multiple icons stagger in, spaced evenly.

```tsx
<IconGroup
  icons={["shield", "lock", "key"]}
  colors={["#60A5FA", "#A78BFA", "#34D399"]}
  size={80}
  startFrame={100}
  stagger={12}
  layout="horizontal"   // horizontal | vertical | grid
/>
```

### IconGrid
Grid of icons with labels fading below each.

```tsx
<IconGrid
  items={[
    {icon: "cloud", label: "Storage", color: "#60A5FA"},
    {icon: "cpu", label: "Compute", color: "#A78BFA"},
    {icon: "database", label: "Data", color: "#34D399"},
  ]}
  columns={3}
  startFrame={100}
  cellStagger={8}
  iconSize={64}
/>
```

### AnimatedIcon
Lottie or CSS animated icon. Spinning gear, pulsing heart, etc.

```tsx
<AnimatedIcon
  icon="gear"
  animation="spin"       // spin | pulse | bounce | shake
  size={100}
  color="#FBBF24"
  speed={1}              // animation speed multiplier
  startFrame={100}
/>
```

### LogoGrid
Logos fade in staggered, arranged in a grid.

```tsx
<LogoGrid
  logos={[
    {brand: "React", color: "#61DAFB"},
    {brand: "Vue", color: "#42B883"},
    {brand: "Angular", color: "#DD0031"},
  ]}
  columns={3}
  startFrame={100}
  logoStagger={12}
  showLabels={true}
/>
```

### LogoVS
Logo A on left, VS text center, Logo B on right.

```tsx
<LogoVS
  leftBrand="React"
  rightBrand="Vue"
  leftColor="#61DAFB"
  rightColor="#42B883"
  startFrame={100}
  vsColor="#F43F5E"
/>
```

### LogoTimeline
Logos positioned on a time axis showing evolution.

```tsx
<LogoTimeline
  logos={[
    {brand: "jQuery", year: 2006},
    {brand: "Angular", year: 2010},
    {brand: "React", year: 2013},
  ]}
  startFrame={100}
  logoStagger={20}
/>
```

### LogoEcosystem
Logos grouped by category with group labels.

```tsx
<LogoEcosystem
  groups={[
    {label: "Frontend", logos: ["React", "Vue", "Svelte"]},
    {label: "Backend", logos: ["Node", "Django", "Rails"]},
  ]}
  startFrame={100}
  groupStagger={20}
  logoStagger={8}
/>
```

### LogoStack
Logos stacked vertically with connection lines between them.

```tsx
<LogoStack
  logos={["Vercel", "Next.js", "React", "Node.js"]}
  startFrame={100}
  stackStagger={12}
  lineColor="#3A3F55"
/>
```

### PersonCard
Circular photo placeholder with name and role.

```tsx
<PersonCard
  name="Ada Lovelace"
  role="Pioneer of Computing"
  accentColor="#A78BFA"
  startFrame={100}
  style="modern"         // modern | historical
/>
```

### QuoteCard
Styled quote with attribution. BlurText reveals words.

```tsx
<QuoteCard
  quote="Move fast and break things."
  attribution="Mark Zuckerberg"
  style="modern"         // modern | historical
  accentColor="#A78BFA"
  startFrame={100}
  wordStagger={3}
/>
```

### LowerThird
TV-style name/role overlay at bottom of screen.

```tsx
<LowerThird
  name="Elon Musk"
  title="CEO, Tesla"
  accentColor="#60A5FA"
  startFrame={100}
  holdDuration={90}
  position="bottom-left"
/>
```

### ThreeDObject
3D object with continuous slow rotation.

```tsx
<ThreeDObject
  shape="cube"           // cube | sphere | torus | cylinder | custom
  color="#60A5FA"
  rotationSpeed={0.5}
  startFrame={100}
  size={200}
  lighting="dramatic"
/>
```

### ThreeDExplode
3D parts separate outward to reveal internals, labels appear.

```tsx
<ThreeDExplode
  parts={["Shell", "Core", "Base"]}
  colors={["#8890A4", "#60A5FA", "#34D399"]}
  startFrame={100}
  explodeDuration={30}
/>
```

### ThreeDZoom
Camera pushes in toward 3D subject, focal length compresses.

```tsx
<ThreeDZoom
  subject="sphere"
  startScale={0.5}
  endScale={3}
  startFrame={100}
  zoomDuration={45}
/>
```

### ThreeDCutaway
Slice plane animates through 3D object revealing cross-section.

```tsx
<ThreeDCutaway
  shape="cylinder"
  sliceAxis="y"
  startFrame={100}
  sliceDuration={30}
  innerColor="#F43F5E"
  outerColor="#8890A4"
/>
```

### ThreeDAbstract
Geometric/conceptual shape with shader-like effects.

```tsx
<ThreeDAbstract
  preset="wave"          // wave | noise | crystal | fluid
  colors={["#60A5FA", "#A78BFA"]}
  startFrame={100}
  animationSpeed={0.5}
  size={400}
/>
```

---

## Narrative Components *(all build-on-demand)*

### CaseStudyCard
Logo/icon plus outcome stat plus verdict label.

```tsx
<CaseStudyCard
  brand="Netflix"
  outcome={{value: "150M", label: "Subscribers"}}
  verdict="Success"
  verdictColor="#34D399"
  startFrame={100}
  accentColor="#F43F5E"
/>
```

### ThoughtBubble
Dotted border container that fills as narration builds. Question mark icon.

```tsx
<ThoughtBubble
  question="What if money grew on trees?"
  startFrame={100}
  fillDuration={45}
  borderColor="#A78BFA"
  iconColor="#FBBF24"
/>
```

### ExampleCard
Concrete instance card with accent "EXAMPLE" label.

```tsx
<ExampleCard
  title="Compound Interest"
  description="$1000 at 7% for 30 years = $7,612"
  startFrame={100}
  accentColor="#60A5FA"
/>
```

### ConceptBreakdown
Multi-section card that reveals sub-concepts one by one.

```tsx
<ConceptBreakdown
  title="REST API"
  parts={[
    {label: "Resource", description: "Any data entity"},
    {label: "Endpoint", description: "URL path to resource"},
    {label: "Method", description: "GET, POST, PUT, DELETE"},
  ]}
  startFrame={100}
  partStagger={20}
  accentColor="#60A5FA"
/>
```

### MythBustCard
Myth statement with dramatic cross-out, truth revealed below.

```tsx
<MythBustCard
  myth="You only use 10% of your brain"
  truth="All brain regions are active throughout the day"
  startFrame={100}
  mythColor="#F43F5E"
  truthColor="#34D399"
  crossOutFrame={130}
/>
```

---

## Group G — Analytical *(all build-on-demand)*

### QuadrantMatrix
2x2 grid with labeled axes. Items placed one by one into quadrants.

```tsx
<QuadrantMatrix
  xAxis={{low: "Low Effort", high: "High Effort"}}
  yAxis={{low: "Low Impact", high: "High Impact"}}
  items={[
    {label: "Quick wins", quadrant: "top-left", color: "#34D399"},
    {label: "Big bets", quadrant: "top-right", color: "#60A5FA"},
    {label: "Fill-ins", quadrant: "bottom-left", color: "#8890A4"},
    {label: "Money pits", quadrant: "bottom-right", color: "#F43F5E"},
  ]}
  startFrame={100}
  itemStagger={15}
/>
```

### SWOTDiagram
Four boxes: Strengths, Weaknesses, Opportunities, Threats. Items stagger in each box.

```tsx
<SWOTDiagram
  strengths={["Brand recognition", "Strong team"]}
  weaknesses={["High costs", "Slow iteration"]}
  opportunities={["New market", "AI adoption"]}
  threats={["Competition", "Regulation"]}
  startFrame={100}
  boxStagger={20}
  itemStagger={8}
/>
```

### BCGMatrix
Axes draw, then quadrant icons (star, cow, dog, question mark), then items placed.

```tsx
<BCGMatrix
  items={[
    {label: "Product A", growth: 0.8, share: 0.7, quadrant: "star"},
    {label: "Product B", growth: 0.2, share: 0.8, quadrant: "cash-cow"},
    {label: "Product C", growth: 0.8, share: 0.2, quadrant: "question-mark"},
    {label: "Product D", growth: 0.2, share: 0.2, quadrant: "dog"},
  ]}
  startFrame={100}
  itemStagger={12}
/>
```

### RiskMatrix
Grid draws, items drop into their risk/impact position.

```tsx
<RiskMatrix
  axes={{x: "Probability", y: "Impact"}}
  items={[
    {label: "Data breach", risk: 0.3, impact: 0.9, color: "#F43F5E"},
    {label: "Downtime", risk: 0.6, impact: 0.5, color: "#FBBF24"},
  ]}
  startFrame={100}
  gridSize={5}
  itemStagger={15}
/>
```

### PriorityGrid
Axes draw, grid fills, urgent items highlighted.

```tsx
<PriorityGrid
  axes={{x: "Urgency", y: "Importance"}}
  items={[
    {label: "Fix bug", urgency: 0.9, importance: 0.8, color: "#F43F5E"},
    {label: "Plan Q2", urgency: 0.3, importance: 0.9, color: "#60A5FA"},
  ]}
  startFrame={100}
  itemStagger={12}
  highlightUrgent={true}
/>
```

### ConversionFunnel
Widest stage at top, narrows. Dropout percentage labels stagger in.

```tsx
<ConversionFunnel
  stages={[
    {label: "Visitors", value: 100000, color: "#60A5FA"},
    {label: "Signups", value: 15000, color: "#A78BFA"},
    {label: "Paid", value: 2000, color: "#34D399"},
  ]}
  showDropoff={true}
  startFrame={100}
  stageStagger={20}
/>
```

### EliminationFunnel
All items shown, elimination animation removes items each round.

```tsx
<EliminationFunnel
  rounds={[
    {label: "Round 1", remaining: 100, eliminated: 40},
    {label: "Round 2", remaining: 60, eliminated: 30},
    {label: "Final", remaining: 30, eliminated: 0},
  ]}
  startFrame={100}
  roundStagger={25}
  eliminateColor="#F43F5E"
/>
```

### FilteringFunnel
Criteria labels appear, items pass/fail each filter.

```tsx
<FilteringFunnel
  filters={["Revenue > $1M", "Growth > 20%", "Profitable"]}
  inputCount={50}
  passRates={[0.6, 0.4, 0.25]}
  startFrame={100}
  filterStagger={25}
  passColor="#34D399"
  failColor="#F43F5E"
/>
```

### NarrowingFunnel
Wide to narrow with item count shrinking at each level.

```tsx
<NarrowingFunnel
  stages={["1000 applicants", "200 screened", "50 interviewed", "5 hired"]}
  startFrame={100}
  stageStagger={20}
  accentColor="#60A5FA"
/>
```

### CompoundGrowthChart
Flat line that curves upward exponentially with annotation at inflection.

```tsx
<CompoundGrowthChart
  data={[100, 107, 114, 122, 131, 140, 150, 161]}
  xLabels={["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7", "Y8"]}
  annotationFrame={140}
  annotationText="Compound effect kicks in"
  accentColor="#34D399"
  startFrame={100}
/>
```

### SnowballDiagram
Small circle rolls and grows each pass, labels at each size milestone.

```tsx
<SnowballDiagram
  stages={[
    {label: "$100", size: 20},
    {label: "$1,000", size: 40},
    {label: "$10,000", size: 80},
    {label: "$100,000", size: 160},
  ]}
  startFrame={100}
  rollDuration={30}
  accentColor="#34D399"
/>
```

### StackingBlocks
Blocks stack on top of each other, each labeled.

```tsx
<StackingBlocks
  blocks={[
    {label: "Foundation", color: "#8890A4"},
    {label: "Framework", color: "#60A5FA"},
    {label: "Features", color: "#A78BFA"},
    {label: "Polish", color: "#34D399"},
  ]}
  startFrame={100}
  blockStagger={15}
  blockHeight={80}
/>
```

### WaterfallGain
Bars grow left-to-right, green for cumulative additions.

```tsx
<WaterfallGain
  gains={[
    {label: "Base", value: 100, color: "#8890A4"},
    {label: "Growth", value: 50, color: "#34D399"},
    {label: "Upsell", value: 30, color: "#60A5FA"},
    {label: "Total", value: 180, color: "#FBBF24", isTotal: true},
  ]}
  startFrame={100}
  barStagger={15}
/>
```

### Leaderboard
Items appear sorted, bars grow right showing relative value.

```tsx
<Leaderboard
  items={[
    {label: "Alice", value: 950, color: "#FBBF24"},
    {label: "Bob", value: 820, color: "#60A5FA"},
    {label: "Carol", value: 780, color: "#A78BFA"},
  ]}
  startFrame={100}
  itemStagger={10}
  showRank={true}
/>
```

### PodiumChart
Third place appears, then second, then first rises highest.

```tsx
<PodiumChart
  first={{label: "Gold", value: 95, color: "#FBBF24"}}
  second={{label: "Silver", value: 82, color: "#B0B8C8"}}
  third={{label: "Bronze", value: 71, color: "#CD7F32"}}
  startFrame={100}
  revealOrder="3-2-1"
/>
```

### SortedBarRace
Bars animate from unsorted to sorted positions.

```tsx
<SortedBarRace
  items={[
    {label: "React", value: 68},
    {label: "Vue", value: 42},
    {label: "Angular", value: 35},
    {label: "Svelte", value: 18},
  ]}
  startFrame={100}
  sortDuration={30}
  accentColor="#60A5FA"
/>
```

### MedalTier
Gold, silver, bronze groups form with items sorted into tiers.

```tsx
<MedalTier
  tiers={[
    {tier: "gold", items: ["React"], color: "#FBBF24"},
    {tier: "silver", items: ["Vue", "Angular"], color: "#B0B8C8"},
    {tier: "bronze", items: ["Svelte", "Solid"], color: "#CD7F32"},
  ]}
  startFrame={100}
  tierStagger={20}
/>
```

### KPIGrid
Cards appear staggered, each containing a CountUp value.

```tsx
<KPIGrid
  kpis={[
    {label: "Revenue", value: 2400000, prefix: "$", color: "#34D399"},
    {label: "Users", value: 145000, suffix: "+", color: "#60A5FA"},
    {label: "NPS", value: 72, color: "#FBBF24"},
  ]}
  columns={3}
  startFrame={100}
  cardStagger={12}
/>
```

### MetricWall
Tiles flood in like a grid, values animate inside each tile.

```tsx
<MetricWall
  metrics={[
    {label: "CPU", value: "78%", status: "warning"},
    {label: "RAM", value: "4.2GB", status: "ok"},
    {label: "Disk", value: "92%", status: "danger"},
  ]}
  columns={4}
  startFrame={100}
  tileStagger={4}
/>
```

### StatusBoard
Rows appear with status indicator dots that color in.

```tsx
<StatusBoard
  items={[
    {label: "API", status: "operational", color: "#34D399"},
    {label: "Database", status: "degraded", color: "#FBBF24"},
    {label: "CDN", status: "down", color: "#F43F5E"},
  ]}
  startFrame={100}
  rowStagger={10}
/>
```

### ControlPanel
Gauges appear, needles animate to their target values.

```tsx
<ControlPanel
  gauges={[
    {label: "Temperature", value: 72, max: 100, unit: "C", color: "#F43F5E"},
    {label: "Pressure", value: 45, max: 100, unit: "PSI", color: "#60A5FA"},
  ]}
  startFrame={100}
  gaugeStagger={15}
  style="circular"       // circular | linear | semicircle
/>
```

---

## Group H — Narrative & Cinematic *(all build-on-demand)*

### TugOfWar
Rope visual with forces pulling left and right. Tension builds visually.

```tsx
<TugOfWar
  leftForce={{label: "Supply", strength: 0.6, color: "#60A5FA"}}
  rightForce={{label: "Demand", strength: 0.8, color: "#F43F5E"}}
  startFrame={100}
  tensionBuildDuration={45}
  ropeColor="#8890A4"
/>
```

### BalanceScale
Scale tips based on weight of arguments added to each side.

```tsx
<BalanceScale
  leftItems={["Cost savings", "Speed"]}
  rightItems={["Quality", "Reliability", "Security"]}
  leftLabel="Pros"
  rightLabel="Cons"
  startFrame={100}
  itemStagger={15}
  accentColor="#FBBF24"
/>
```

### PushPullDiagram
Opposing arrows with labels showing forces in both directions.

```tsx
<PushPullDiagram
  pushForces={[{label: "Innovation", strength: 0.7}]}
  pullForces={[{label: "Regulation", strength: 0.5}]}
  startFrame={100}
  pushColor="#34D399"
  pullColor="#F43F5E"
/>
```

### TradeOffSlider
Slider between two desirable endpoints showing the trade-off.

```tsx
<TradeOffSlider
  leftLabel="Performance"
  rightLabel="Readability"
  position={0.6}
  markerLabel="Sweet spot"
  startFrame={100}
  leftColor="#60A5FA"
  rightColor="#A78BFA"
/>
```

### EquilibriumDot
Forces converge visually to a single equilibrium point.

```tsx
<EquilibriumDot
  forces={[
    {label: "Supply", direction: "left", color: "#60A5FA"},
    {label: "Demand", direction: "right", color: "#F43F5E"},
  ]}
  equilibriumLabel="Market Price"
  startFrame={100}
  convergeDuration={45}
/>
```

### CurtainReveal
Curtain pulls left-right to reveal content behind.

```tsx
<CurtainReveal
  curtainColor="#141420"
  revealStartFrame={120}
  revealDuration={30}
  direction="center-out"  // center-out | left | right
>
  <HiddenContent />
</CurtainReveal>
```

### MaskReveal
Mask erases to show truth underneath.

```tsx
<MaskReveal
  maskColor="#141420"
  revealShape="circle"   // circle | rectangle | custom
  revealStartFrame={120}
  revealDuration={30}
  revealOrigin={{x: 540, y: 960}}
>
  <TruthContent />
</MaskReveal>
```

### PuzzleAssemble
Puzzle pieces fly in from edges and assemble into complete picture.

```tsx
<PuzzleAssemble
  pieces={4}             // 4 | 6 | 9
  startFrame={100}
  pieceStagger={10}
  completePause={30}
  borderColor="#3A3F55"
>
  <CompletePicture />
</PuzzleAssemble>
```

### DecryptAnimation
Characters scramble through random values then resolve to final text.

```tsx
<DecryptAnimation
  text="CLASSIFIED"
  startFrame={100}
  scrambleDuration={45}
  scrambleSpeed={3}
  color="#34D399"
  fontSize={72}
/>
```

### SpotlightScan
Circle light sweeps across dark scene, illuminating content.

```tsx
<SpotlightScan
  spotlightRadius={150}
  scanPath="left-to-right"  // left-to-right | top-to-bottom | circular
  startFrame={100}
  scanDuration={60}
  backgroundColor="rgba(0,0,0,0.85)"
>
  <HiddenScene />
</SpotlightScan>
```

### MorphShape
Uses `@remotion/paths` `interpolatePath` to morph between SVG shapes.

```tsx
<MorphShape
  fromPath="M 100 100 L 200 100 L 200 200 L 100 200 Z"
  toPath="M 150 50 L 250 150 L 150 250 L 50 150 Z"
  startFrame={100}
  morphDuration={30}
  color="#A78BFA"
  strokeWidth={3}
/>
```

### EvolutionStages
Stages displayed left-to-right with morphing transitions between them.

```tsx
<EvolutionStages
  stages={[
    {label: "Mainframe", icon: "server", color: "#8890A4"},
    {label: "PC", icon: "monitor", color: "#60A5FA"},
    {label: "Mobile", icon: "phone", color: "#A78BFA"},
    {label: "AI", icon: "brain", color: "#34D399"},
  ]}
  startFrame={100}
  stageStagger={25}
  morphBetween={true}
/>
```

### StateMachineDiagram
States as nodes, transitions as labeled arrows between them.

```tsx
<StateMachineDiagram
  states={[
    {id: "idle", label: "Idle", x: 200, y: 400},
    {id: "loading", label: "Loading", x: 540, y: 200},
    {id: "done", label: "Done", x: 880, y: 400},
  ]}
  transitions={[
    {from: "idle", to: "loading", label: "fetch()"},
    {from: "loading", to: "done", label: "onSuccess"},
    {from: "loading", to: "idle", label: "onError"},
  ]}
  startFrame={100}
  stateStagger={15}
  transitionStagger={12}
/>
```

### Metamorphosis
Dramatic visual morph from shape A to shape B.

```tsx
<Metamorphosis
  fromShape="caterpillar"
  toShape="butterfly"
  startFrame={100}
  morphDuration={45}
  fromColor="#8890A4"
  toColor="#A78BFA"
/>
```

### BridgeGap
Two platforms with a bridge that draws across connecting them.

```tsx
<BridgeGap
  leftLabel="Problem"
  rightLabel="Solution"
  bridgeLabel="Innovation"
  leftColor="#F43F5E"
  rightColor="#34D399"
  bridgeColor="#60A5FA"
  startFrame={100}
  bridgeDrawDuration={30}
/>
```

### IcebergDiagram
Waterline divides visible (10%) from hidden (90%) content.

```tsx
<IcebergDiagram
  visibleItems={["Revenue", "Brand"]}
  hiddenItems={["R&D", "Infrastructure", "Team", "Culture", "Processes"]}
  waterlineY={0.3}
  startFrame={100}
  itemStagger={10}
  waterColor="#1E3A5F"
/>
```

### MagnifyingGlass
Glass moves over content, zooming into and revealing detail.

```tsx
<MagnifyingGlass
  magnification={2.5}
  glassRadius={120}
  scanPath={[{x: 200, y: 300}, {x: 600, y: 400}, {x: 400, y: 600}]}
  startFrame={100}
  scanDuration={60}
>
  <DetailedContent />
</MagnifyingGlass>
```

### PuzzlePieces
Individual pieces fit together one by one to form a complete picture.

```tsx
<PuzzlePieces
  pieces={[
    {label: "Strategy", position: "top-left"},
    {label: "Execution", position: "top-right"},
    {label: "Culture", position: "bottom-left"},
    {label: "Talent", position: "bottom-right"},
  ]}
  startFrame={100}
  pieceStagger={15}
  accentColor="#60A5FA"
/>
```

### KnowledgeTree
Trunk appears, branches grow outward, leaves with concepts bloom.

```tsx
<KnowledgeTree
  trunk="Computer Science"
  branches={[
    {label: "Algorithms", leaves: ["Sorting", "Search", "Graph"]},
    {label: "Systems", leaves: ["OS", "Networks", "Databases"]},
  ]}
  startFrame={100}
  branchStagger={20}
  leafStagger={8}
  trunkColor="#8B6914"
  leafColor="#34D399"
/>
```

### InfographicPage
Dense single visual filling the frame with multiple data zones.

```tsx
<InfographicPage
  title="State of AI 2024"
  zones={[
    {type: "stat", content: {value: 1.8, suffix: "T", label: "Market Size"}},
    {type: "chart", content: {data: [20, 40, 60, 90], label: "Growth"}},
    {type: "icons", content: {items: ["healthcare", "finance", "education"]}},
  ]}
  startFrame={100}
  zoneStagger={15}
  accentColor="#60A5FA"
/>
```

### SectionedInfoGraphic
Multiple labeled zones with icons and stats.

```tsx
<SectionedInfoGraphic
  sections={[
    {title: "Users", icon: "users", stat: "10M+", color: "#60A5FA"},
    {title: "Revenue", icon: "dollar", stat: "$2.4B", color: "#34D399"},
  ]}
  layout="horizontal"   // horizontal | vertical | grid
  startFrame={100}
  sectionStagger={18}
/>
```

### PosterLayout
Hero visual at top with supporting data below.

```tsx
<PosterLayout
  heroContent={<ThreeDObject shape="globe" />}
  supportingStats={[
    {label: "Countries", value: 195},
    {label: "Languages", value: 7000},
  ]}
  title="Global Reach"
  startFrame={100}
/>
```

### InfoStrip
Horizontal sequential info-bites that scroll or appear one by one.

```tsx
<InfoStrip
  items={[
    {icon: "clock", text: "24/7 uptime"},
    {icon: "shield", text: "SOC2 compliant"},
    {icon: "globe", text: "Global CDN"},
  ]}
  startFrame={100}
  itemStagger={12}
  accentColor="#60A5FA"
/>
```

---

## Group I — Process & Feedback *(all build-on-demand)*

### ReinforcingLoop
Nodes in a circle with arrows animating clockwise. Each cycle: nodes pulse brighter.

```tsx
<ReinforcingLoop
  nodes={["More users", "More data", "Better AI", "Better product"]}
  startFrame={100}
  nodeStagger={12}
  cycleSpeed={60}
  accentColor="#34D399"
/>
```

### BalancingLoop
Nodes with arrows that show oscillation dampening visually over time.

```tsx
<BalancingLoop
  nodes={["Price up", "Demand down", "Price down", "Demand up"]}
  startFrame={100}
  nodeStagger={12}
  dampingCycles={3}
  accentColor="#60A5FA"
/>
```

### SpiralDiagram
Spiral draws from center outward with labels at each revolution.

```tsx
<SpiralDiagram
  revolutions={[
    {label: "Idea", color: "#8890A4"},
    {label: "Prototype", color: "#60A5FA"},
    {label: "MVP", color: "#A78BFA"},
    {label: "Scale", color: "#34D399"},
  ]}
  startFrame={100}
  drawDuration={60}
  direction="outward"
/>
```

### DoomLoop
Reinforcing loop styled with danger colors. Each cycle intensifies.

```tsx
<DoomLoop
  nodes={["Debt", "Interest", "More debt", "Default risk"]}
  startFrame={100}
  nodeStagger={12}
  cycleSpeed={45}
  intensityGrowth={1.3}
  accentColor="#F43F5E"
/>
```

### NumberedSteps
Numbered circles appear with content revealing per step.

```tsx
<NumberedSteps
  steps={[
    {number: 1, title: "Plan", description: "Define scope"},
    {number: 2, title: "Build", description: "Write code"},
    {number: 3, title: "Ship", description: "Deploy to prod"},
  ]}
  startFrame={100}
  stepStagger={25}
  accentColor="#60A5FA"
/>
```

### AssemblyLine
Conveyor belt moves items left-to-right through labeled stations.

```tsx
<AssemblyLine
  stations={["Raw", "Process", "QA", "Package"]}
  itemCount={3}
  startFrame={100}
  beltSpeed={2}
  stationColor="#141420"
  beltColor="#3A3F55"
/>
```

### RecipeSteps
Ingredients list appears, then recipe steps reveal one by one.

```tsx
<RecipeSteps
  ingredients={["Data", "Model", "Training", "Evaluation"]}
  steps={[
    "Collect and clean data",
    "Choose model architecture",
    "Train for 100 epochs",
    "Evaluate on test set",
  ]}
  startFrame={100}
  ingredientStagger={8}
  stepStagger={20}
/>
```

### KanbanBoard
Columns appear (Todo, In Progress, Done), cards animate between columns.

```tsx
<KanbanBoard
  columns={["Backlog", "In Progress", "Review", "Done"]}
  cards={[
    {title: "Feature A", column: "Done", color: "#34D399"},
    {title: "Feature B", column: "In Progress", color: "#60A5FA"},
    {title: "Feature C", column: "Backlog", color: "#8890A4"},
  ]}
  startFrame={100}
  columnStagger={12}
  cardStagger={8}
/>
```

---

## Engagement & Cinematic *(all build-on-demand)*

### RevealWall
Grid of items flood in, then one item highlights while others dim.

```tsx
<RevealWall
  items={[
    {icon: "bank", label: "Banks"},
    {icon: "chart", label: "Markets"},
    {icon: "dollar", label: "Currency"},
  ]}
  highlightIndex={1}
  floodStartFrame={100}
  floodStagger={3}
  dimFrame={140}
  highlightFrame={155}
  highlightScale={3}
  accentColor="#FBBF24"
  columns={4}
/>
```

### CountdownTimer
Ticking clock for urgency. Stops dramatically with optional flash.

```tsx
<CountdownTimer
  from={120}
  to={0}
  startFrame={100}
  stopFrame={160}
  format="mm:ss"
  color="#F43F5E"
  flashOnStop={true}
  fontSize={96}
/>
```

### ParallaxLayers
Multi-depth parallax background for cinematic depth.

```tsx
<ParallaxLayers
  layers={[
    {content: <Background />, speed: 0.1, opacity: 0.06},
    {content: <GridPattern />, speed: 0.3, opacity: 0.08},
    {content: <MainContent />, speed: 1.0, opacity: 1.0},
  ]}
  direction="horizontal"
  scrollRange={100}
/>
```

### ScreenFlash
Brief color flash for dramatic moments.

```tsx
<ScreenFlash
  triggerFrame={200}
  flashColor="#FFFFFF"
  duration={5}
  peakOpacity={0.6}
/>
```

### ProgressThread
Persistent visual thread across sections showing narrative progress.

```tsx
<ProgressThread
  totalSections={12}
  currentSection={3}
  style="timeline"       // timeline | dots | bar | breadcrumb
  position="top"
  accentColor="#E8B931"
  height={4}
/>
```

### MorphTransition
One shape smoothly morphs into another between concepts.

```tsx
<MorphTransition
  fromElement="circle"
  toElement="hexagon"
  startFrame={100}
  duration={30}
  color="#A78BFA"
  size={200}
/>
```

### IconWave
Wave of icons that flood across screen for impact.

```tsx
<IconWave
  icons={["lightbulb", "bolt", "fire", "dollar"]}
  startFrame={100}
  direction="left"
  count={30}
  duration={45}
  fadeAfter={30}
  opacity={0.3}
/>
```

---

## @remotion/shapes API

Built-in SVG shape primitives from `@remotion/shapes`. Use for backgrounds, decorative elements, and animated shapes.

### Available Shapes

```tsx
import { Circle, Rect, Triangle, Star, Pie, Heart, Polygon, Ellipse } from '@remotion/shapes';
```

**Circle** — SVG circle element.
```tsx
<Circle radius={100} fill="#60A5FA" stroke="#3A3F55" strokeWidth={2} />
```

**Ellipse** — SVG ellipse element.
```tsx
<Ellipse rx={120} ry={80} fill="#A78BFA" />
```

**Rect** — SVG rectangle with optional corner radius.
```tsx
<Rect width={200} height={100} cornerRadius={12} fill="#34D399" />
```

**Triangle** — Equilateral or custom triangle.
```tsx
<Triangle length={150} direction="up" fill="#FBBF24" />
```

**Star** — N-pointed star shape.
```tsx
<Star points={5} innerRadius={40} outerRadius={100} fill="#FBBF24" cornerRadius={4} />
```

**Pie** — Pie/arc segment. Useful for progress indicators.
```tsx
<Pie radius={100} progress={0.75} fill="#60A5FA" closePath={true} />
```

**Heart** — Heart shape.
```tsx
<Heart width={120} fill="#F43F5E" />
```

**Polygon** — Regular polygon with N sides.
```tsx
<Polygon points={6} radius={80} fill="#A78BFA" />
```

### Make Functions

Generate SVG path strings for use with `<path d={...}>` and `@remotion/paths` utilities.

```tsx
import { makeCircle, makeRect, makeStar, makeTriangle, makePie, makeHeart, makePolygon } from '@remotion/shapes';

const circlePath = makeCircle({radius: 100});          // returns {path, width, height, ...}
const rectPath = makeRect({width: 200, height: 100});
const starPath = makeStar({points: 5, innerRadius: 40, outerRadius: 100});
const triPath = makeTriangle({length: 150, direction: 'up'});
const piePath = makePie({radius: 100, progress: 0.75});
const heartPath = makeHeart({width: 120});
const hexPath = makePolygon({points: 6, radius: 80});
```

**Usage pattern — animating a shape with spring:**
```tsx
const frame = useCurrentFrame();
const progress = spring({frame, fps: 30, config: {damping: 20}});
const {path} = makePie({radius: 100, progress});
return <svg><path d={path} fill="#60A5FA" /></svg>;
```

---

## @remotion/paths API

Path manipulation utilities for morphing, drawing, and transforming SVG paths.

### interpolatePath — Path Morphing

Smoothly morph between two SVG path strings.

```tsx
import { interpolatePath } from '@remotion/paths';

const frame = useCurrentFrame();
const progress = spring({frame, fps: 30, config: {damping: 20}});
const morphed = interpolatePath(progress, [0, 1], [squarePath, circlePath]);
return <svg><path d={morphed} fill="#A78BFA" /></svg>;
```

### evolvePath — Path Drawing

Animate a path being drawn progressively.

```tsx
import { evolvePath } from '@remotion/paths';

const frame = useCurrentFrame();
const progress = interpolate(frame, [0, 60], [0, 1], {extrapolateRight: 'clamp'});
const {strokeDasharray, strokeDashoffset} = evolvePath(progress, svgPath);
return <svg><path d={svgPath} strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} stroke="#60A5FA" fill="none" /></svg>;
```

### scalePath — Scale a Path

```tsx
import { scalePath } from '@remotion/paths';
const scaled = scalePath(originalPath, 2, 2);  // scale 2x in both axes
```

### translatePath — Move a Path

```tsx
import { translatePath } from '@remotion/paths';
const moved = translatePath(originalPath, 100, 50);  // move 100px right, 50px down
```

### getPointAtLength — Point Along Path

Get coordinates at a specific distance along a path. Useful for positioning labels or elements that follow a path.

```tsx
import { getPointAtLength, getLength } from '@remotion/paths';
const totalLen = getLength(svgPath);
const point = getPointAtLength(svgPath, totalLen * progress);
// point.x, point.y — coordinates at that position
```

**Usage pattern — element following a path:**
```tsx
const frame = useCurrentFrame();
const progress = interpolate(frame, [0, 90], [0, 1], {extrapolateRight: 'clamp'});
const point = getPointAtLength(curvePath, getLength(curvePath) * progress);
return <div style={{transform: `translate(${point.x}px, ${point.y}px)`}}>
  <Circle radius={8} fill="#FBBF24" />
</div>;
```

---

## Remotion API Patterns

These patterns should be used throughout all compositions.

### interpolateColors() — Color Animation
```tsx
import { interpolateColors } from 'remotion';
const bgColor = interpolateColors(frame, [0, 60, 120], ['#0A0A0F', '#EF4444', '#0A0A0F']);
```

### @remotion/noise — Organic Motion
```tsx
import { noise2D } from '@remotion/noise';
const wobbleX = noise2D('seed-x', frame * 0.02, 0) * 10;
const wobbleY = noise2D('seed-y', 0, frame * 0.02) * 10;
```

### random(seed) — Deterministic Randomness
```tsx
import { random } from 'remotion';
const x = random(`particle-${i}-x`) * width;
const y = random(`particle-${i}-y`) * height;
```

### visualizeAudio() — Audio Waveform
```tsx
import { visualizeAudio } from '@remotion/media-utils';
const visualization = visualizeAudio({fps, src: audioSrc, frame, numberOfSamples: 64});
```

### measureSpring() — Exact Spring Duration
```tsx
import { measureSpring } from 'remotion';
const duration = measureSpring({config: {damping: 20, stiffness: 200}, fps: 30});
```

### Easing in interpolate()
```tsx
import { interpolate, Easing } from 'remotion';
const y = interpolate(frame, [0, 30], [100, 0], {
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  extrapolateRight: 'clamp',
});
```

---

## Sizing & Contrast Guidelines

**Long-form (1920x1080):**
- Charts/Diagrams: minimum 800x500, recommended 1000-1200 width
- Cards/Panels: minimum 440px wide, recommended 540px
- Node dots (timeline, graph): minimum r=10, recommended r=12-16
- Connection lines: minimum 2px stroke, recommended 3px
- Labels on SVG: minimum 20px, recommended 24px
- Borders on dark panels: minimum 2px
- Use `surface` color for component backgrounds, never scene `bg`
- All accent colors use vivid variants from domain palette

**Short-form (1080x1920):**
- Charts/Diagrams: minimum 900x600, full width minus margins
- Cards/Panels: minimum 800px wide (fills width)
- Scale everything proportionally to fill vertical space

---

## Utility Library — `src/utils/`

Shared utilities cherry-picked from remotion-bits + V5 custom enhancements. All pure functions, zero side effects, Remotion-compatible.

### Particle Physics — `src/utils/particles/`

Deterministic replay simulation. No stored state — re-simulates from birth each frame. Seeded via `Remotion.random()`.

```tsx
import { simulateParticles } from '../../utils/particles/simulator';
import { createGravity, createDrag, createWiggle, createOpacityOverLife, createGlowOverLife } from '../../utils/particles/behaviors';

const particles = simulateParticles({
  frame,
  fps: 30,
  spawners: [{
    id: 'ambient',
    burst: 25,
    position: { x: 960, y: 540 },
    area: { width: 1920, height: 1080 },
    velocity: { y: -0.3, varianceX: 0.5, varianceY: 0.2 },
    lifespan: 180,
    lifespanVariance: 60,
  }],
  behaviors: [
    createGravity({ y: -0.01 }),
    createDrag(0.02),
    createWiggle(0.3, 0.5),
    createOpacityOverLife(0.4, 0.15),
    createGlowOverLife(18, 6, 0.8, 0.3),
  ],
  minRadius: 6,    // Rule #14
  minOpacity: 0.15, // Rule #14
});
```

**Behaviors:** `createGravity()`, `createDrag()`, `createWiggle()`, `createOpacityOverLife()`, `createScaleOverLife()`, `createRotationOverLife()`, `createGlowOverLife()`

### OKLCH Color — `src/utils/color.ts`

Perceptually uniform color interpolation. No muddy midpoints.

```tsx
import { interpolateColor, interpolateColorKeyframes } from '../../utils/color';

const color = interpolateColor('#FBBF24', '#60A5FA', progress); // amber -> blue
const multi = interpolateColorKeyframes(['#F43F5E', '#FBBF24', '#60A5FA'], progress);
```

### Gradient Interpolation — `src/utils/gradient.ts`

Parse, interpolate, emit CSS gradients. OKLCH colors, shortest-angle rotation.

```tsx
import { interpolateGradientKeyframes } from '../../utils/gradient';

const bg = interpolateGradientKeyframes([
  'linear-gradient(180deg, #0A0A14, #141420)',
  'linear-gradient(220deg, #141420, #1C1C2E)',
], progress);
```

### Spring Factory — `src/utils/spring.ts`

Physics-based springs + full easing library.

```tsx
import { createSpring, SPRING_PRESETS, Easing, hold } from '../../utils/spring';

const mySpring = createSpring({ mass: 1.5, stiffness: 150, damping: 12 });
const preset = SPRING_PRESETS.bouncy; // gentle | snappy | bouncy | heavy
const discrete = Easing.steps(5);
```

### Stagger — `src/utils/stagger.ts`

Calculate timing offsets for element sequences.

```tsx
import { getStaggerDelays } from '../../utils/stagger';

const delays = getStaggerDelays(5, 'center', 8, 'my-seed');
// center: [16, 8, 0, 8, 16] — center first, edges last
```

**Directions:** `forward`, `reverse`, `center`, `random`

### Geometry + Zone Grid — `src/utils/geometry.ts`

Layout helpers, 9-zone system, overlap detection.

```tsx
import { ZONES, getZoneCenter, getFlowZones, checkOverlap, meetsMinSizeRatio } from '../../utils/geometry';

const hero = getZoneCenter('Z5');  // { x: 960, y: 540 }
const flow = getFlowZones('center-expand');  // ['Z5', 'Z4', 'Z6', 'Z1', 'Z2', 'Z3']
const ok = meetsMinSizeRatio(672, 300, 'active');  // true if >= 35% width
```
