# Scene Composition Model

Every scene = 1 COMPOSITION that accumulates, NOT a slideshow of independent beats.

---

## Core Principle

At the LAST FRAME of every scene, ALL beats are visible at their positions. The accumulated visual IS the argument of the scene.

## Beat Roles

| Role | Size | Position | Opacity | Visual Companion | Behavior |
|------|------|----------|---------|-----------------|----------|
| **ANCHOR** | 120-200px | Center/dominant | >= 0.6 always | Icon IS the beat (120px+) | Persistent. NEVER dims below 0.6. Stays ENTIRE scene |
| **PRIMARY** | 60-96px | Near anchor, prominent | 1.0 (stays full) | Icon >= 60px + text | Main beat content. Non-overlapping = NO dimming |
| **SUPPORT** | 32-48px | Near its PRIMARY | 1.0 after entrance | Icon >= 40px + text | Evidence, context, detail for a PRIMARY |
| **CONNECTOR** | 1-2px lines/arrows | Between beats | 0.2-0.4 | SVG line IS the visual | SVG lines/arrows linking related beats. Draws on enter |
| **SYNTHESIS** | 72-120px | Bottom or emphasis position | 1.0 | Icon >= 80px + text | Final beat. Appears LAST. MUST have visual — never text-only |

## Beat Accumulation Rule

1. Beat **enters** → spring to its (x,y) position → **stays forever at full opacity**
2. Non-overlapping beats (different x,y) → **NO dimming**. Each beat stays at full entered opacity
3. Only dim when beats **explicitly share the same visual region** (rare — by design each beat has its own coordinates)
4. At scene **end** → ALL beats visible at their positions = one cohesive visual
5. Max simultaneous visible: anchor + 8 beats. If exceeding, oldest SUPPORT dims to 0.3 (still visible)

## FORBIDDEN Patterns

- `usePhaseLifecycle` — BANNED. Causes slideshow
- `inset: 0` on all beats — BANNED. Each beat has its own (x,y)
- `opacity → 0` during scene — BANNED. Min dim is 0.3
- All beats same size/position — BANNED. No hierarchy = slideshow
- Beat enters then fades out — BANNED. Beats STAY
- Text without icon companion — BANNED. Every `WordByWord`/`ShinyText` MUST have SVG icon in same flex container
- SYNTHESIS as text-only — BANNED. Synthesis beats MUST have icon >= 80px (they are the scene's climax)

## Composition Patterns

| Pattern | Anchor Position | Beat Positions | Best For |
|---------|----------------|---------------|----------|
| **Hub-Spoke** | Center (960, 400) | Radiate outward in all directions | Properties, attributes, benefits |
| **Timeline** | Right side (persistent icon) | Along horizontal axis left→right | Chronological, sequence, process |
| **Comparison** | Center divider (x=960) | Left column vs Right column | A vs B, pros/cons |
| **Zoom-In** | Large left (200-500px) | Stack on right side | Deep dive, analysis, metaphor |
| **Scale/Balance** | Center scale | Left pan vs Right pan | Weighing arguments |
| **Verdict** | Left chart | Right text stack | Conclusion, allocation |

## Visual Connections Between Beats

| Relationship | Visual | When to Use |
|---|---|---|
| **BUILDS_ON** | Arrow A→B, same color family | B adds detail to A's claim |
| **EVIDENCE_FOR** | Small label near A, same color tint | B proves A's claim |
| **CONTRASTS** | Different color, opposite side of anchor | B opposes A |
| **ELIMINATES** | Strikethrough/X mark on A | B negates or disproves A |
| **SYNTHESIZES** | Glow pulse on ALL previous beats + connector lines | B combines multiple previous into conclusion |

## Implementation Pattern

```typescript
// SIMPLE per-beat opacity — replaces usePhaseLifecycle
// Non-overlapping beats (each at its own x,y) stay at FULL opacity.
// Only dim beats that explicitly share a visual region (rare).
const getBeatsOpacity = (frame: number, beatEnter: number, fps: number,
  _currentFocusIndex: number, _myIndex: number, role: string) => {
  if (frame < beatEnter) return 0;
  const entered = spring({ frame: frame - beatEnter, fps,
    config: { damping: 15, stiffness: 120 } });

  if (role === 'ANCHOR') return entered * Math.max(0.6, entered); // never below 0.6
  // All other roles: full opacity after spring entrance.
  // Non-overlapping beats do NOT dim each other.
  return entered;
};

// Positioned beats — each at its own (x,y)
{BEATS.map((beat, idx) => (
  <div key={beat.id} style={{
    position: 'absolute',
    left: beat.x, top: beat.y,
    opacity: getBeatsOpacity(frame, beat.enter, fps, focusIndex, idx, beat.role),
    transform: `scale(${spring(...)})`,
  }}>
    <BeatContent />
  </div>
))}

// Connectors — arrows between related beats
{CONNECTORS.map(conn => (
  <svg><line x1={...} y1={...} x2={...} y2={...}
    opacity={entered * 0.3}
    stroke={COLORS.primary} strokeWidth={1}
    strokeDasharray="6,4"
  /></svg>
))}
```

---

## Pattern-Specific Anti-Patterns

### COMPARISON Pattern — Balance Rule

A comparison scene MUST have BOTH sides populated from the start.

**WRONG:**
```
LEFT:  [empty for 660 frames]   Gold enters at f660
RIGHT: Bitcoin enters at f10    5 beats by f300
```
This looks like a one-sided presentation, not a comparison.

**CORRECT:**
```
LEFT:  Gold title at f10, 3 support beats by f300
RIGHT: Bitcoin title at f10, 3 support beats by f300
```

**Rules:**
1. BOTH sides MUST have content from frame <= 30
2. If RIGHT has N support beats, LEFT needs >= N-1 (symmetric)
3. Titles appear on BOTH sides within 30 frames of each other
4. Comparison pairs enter SIMULTANEOUSLY (max 30 frame gap)
5. Center divider/VS element is the ANCHOR (always visible)

### TIMELINE Pattern — Axis First

1. Axis line draws FIRST (frame 0-30)
2. Dots/milestones accumulate left→right
3. Each milestone stays — NEVER disappears
4. Labels appear with their dots (not delayed)

### HUB-SPOKE Pattern — Center Anchor

1. Anchor icon at center (960, 400) — enters first
2. Spokes radiate outward with CONNECTOR arrows
3. Each spoke enters with arrow drawing FROM anchor TO spoke
4. Minimum 3 spokes, maximum 8

### VERDICT Pattern — Chart + Evidence

1. Donut/pie chart on one side (ANCHOR)
2. Text evidence stacks on other side
3. Chart segments animate as evidence enters
4. Final SYNTHESIS beat highlights conclusion

---

## Text Content Rules

- NEVER use `\uXXXX` escape sequences in text content
- Always use actual characters: `—` not `\u2014`, `•` not `\u2022`
- Exception: `{'\u20BF'}` in JSX expressions for Bitcoin symbol is OK
- Grep check: `grep '\\u[0-9A-Fa-f]' scenes/*.tsx` should find NOTHING except JSX expressions

---

## TransitionSeries Timing (for Video.tsx)

Every scene's `durationInFrames` in TransitionSeries MUST include the OUTGOING transition:

```
Scene 1 duration = natural + T(1→2)
Scene 2 duration = natural + T(2→3)
...
Scene N-1 duration = natural + T((N-1)→N)
Scene N (last) = natural only
```

**Verification:** `SUM(all scene durations) - SUM(all transitions) = audio total frames`

**WRONG:** Adding all transitions to last scene only → causes 2-5s audio-visual desync
