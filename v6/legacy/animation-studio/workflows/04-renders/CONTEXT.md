# Stage 4: Renders — Final Rendered Videos

## What This Folder Is

The output stage. Final rendered `.mp4` files live here, organized by format and pillar.

**Input:** Built and registered Remotion composition
**Output:** `T-[id]-[slug]-v[n].mp4` — video with audio, captions, and synced animations

---

## How to Render

### Step 1 — Verify the build
Confirm the composition is registered and previews correctly in Remotion Studio (`npm run dev`).

### Step 2 — Run render

**Long-form (1920x1080) — default:**
```bash
cd animation-studio
npx remotion render src/index.ts [CompositionId] \
  workflows/04-renders/long-form/P[X]-[pillar]/T-[id]-[slug]-v1.mp4 \
  --codec h264 --crf 10 --jpeg-quality 100 --concurrency 8
```

**Short-form (1080x1920):**
```bash
npx remotion render src/index.ts [CompositionId] \
  workflows/04-renders/short-form/P[X]-[pillar]/T-[id]-[slug]-v1.mp4 \
  --codec h264 --crf 10 --jpeg-quality 100 --concurrency 8
```

**ProRes (for further editing):**
```bash
npx remotion render src/index.ts [CompositionId] \
  workflows/04-renders/short-form/P[X]-[pillar]/T-[id]-[slug]-v1.mov \
  --codec prores --prores-profile 4444 --jpeg-quality 100 --concurrency 8
```

### Step 3 — Quality check
Watch end to end. Verify:
- Audio plays throughout
- Captions highlight correct word at correct time (Whisper sync)
- Animations smooth — no jank, no flicker
- All text readable (minimum sizes from design system)
- Closing: BlurText + glow + 60-frame hold
- No content in unsafe zones (top 15% or bottom 20%)

---

## File Naming Convention

```
T-[topic-id]-[descriptive-slug]-v[version].mp4
```

Examples: `T-01-hello-world-v1.mp4`, `T-08-cpu-clock-cycle-v2.mp4`

---

## Folder Structure

```
04-renders/
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

## Codec Reference

| Use case | Codec | Flag | Approx size / 60s |
|----------|-------|------|-------------------|
| Distribution | H.264 | --crf 10 | ~15-40MB |
| Preview | H.264 | --crf 23 | ~5-15MB |
| Editing | ProRes | --prores-profile 4444 | ~150MB |

---

## After Rendering

Video is the final artifact — audio, captions, and animations are all embedded. No post-production needed. Reference `platform-playbook/` for distribution strategy.
