# v6 scope

The reference below is historic vocabulary/catalogue/codec information, NOT active production prescriptions. v6 contracts override old quotas/SVG-first/icon mapping/transition recipes/glow/output paths. Verify implementation source for catalogue blueprints. Read root rules first.

---

# Rendering Guide

> How Remotion renders video, what each quality setting does, and the commands to use.

---

## How the Pipeline Works

Remotion renders in three stages. Quality can degrade at each one.

```
React Component → Chrome Headless (screenshots) → FFmpeg (encode to video)
```

1. **React → Chrome**: Your component renders in a headless Chrome browser. Chrome takes a screenshot of every frame as either JPEG or PNG.
2. **Screenshots → FFmpeg**: FFmpeg encodes those images into a video file using your chosen codec, CRF, preset, and bitrate settings.
3. **Output**: The final `.mp4`, `.mov`, or `.webm` file.

The key insight: **every stage has its own quality knob**. Maxing one but not the others still leaves quality on the table.

---

## GPU vs CPU — What Actually Matters

### GPU for Chrome (frame screenshots)

- GPU accelerates **WebGL, CSS shadows, blur, gradients, Canvas 2D, Three.js, P5.js**
- In headless mode Chrome **disables GPU by default** — slower rendering, but same pixel output
- Re-enable with `--gl=angle` (Windows) or `--gl=egl` (Linux)
- **Integrated or discrete GPU both work** — this only affects speed, not output quality

### GPU for Encoding (FFmpeg)

- Hardware-accelerated encoding = **macOS only** (VideoToolbox), not available on Windows
- Hardware encoding produces **larger files at equal quality** vs software encoding
- **CRF is not compatible** with hardware encoders — must use `--video-bitrate` instead
- **Software (CPU) encoding with slow presets always wins on quality**

### Bottom Line

GPU does not affect output quality. CPU software encoding with the slowest preset produces the best results.

---

## Quality Settings Reference

### Stage 1 — Frame Capture (Chrome screenshots)

| Setting            | Flag               | Values         | Max Quality Setting                       |
| ------------------ | ------------------ | -------------- | ----------------------------------------- |
| **Image format**   | `--image-format`   | `jpeg`, `png`  | `png` — lossless, no compression artifact |
| **JPEG quality**   | `--jpeg-quality`   | 0–100          | `100` — only applies when using jpeg      |
| **Scale**          | `--scale`          | 0–16           | `2` — doubles resolution, sharper vectors |

**Scale notes:**
- Scale 2 doubles resolution: 1920x1080 becomes 3840x2160, 1080x1920 becomes 2160x3840
- Benefits **vector elements** only (text, HTML markup, SVGs) — re-rendered with extra detail
- Does NOT upscale: `<Video>`, `<OffthreadVideo>`, Canvas pixel ops, or raster images (use high-res source assets for those)

### Stage 2 — Video Codec

| Codec       | Container   | Quality Method   | Browser Support | Notes                          |
| ----------- | ----------- | ---------------- | --------------- | ------------------------------ |
| **H.264**   | .mp4, .mov  | CRF 1–51         | Excellent       | Universal default              |
| **H.265**   | .mp4        | CRF 0–51         | Poor            | Better compression, limited    |
| **VP8**     | .webm       | CRF 4–63         | Moderate        | Open format                    |
| **VP9**     | .webm       | CRF 0–63         | Moderate        | Best compression ratio         |
| **ProRes**  | .mov        | Profile-based     | None            | Editing-grade, largest files   |

### Stage 3 — Encoding Quality

**For H.264 / H.265 / VP8 / VP9 — use CRF:**

| Setting        | Flag              | What It Does                                       |
| -------------- | ----------------- | -------------------------------------------------- |
| **CRF**        | `--crf`           | Lower = better quality. See defaults below          |
| **Preset**     | `--x264-preset`   | Slower = better quality per byte of file size       |
| **Color space** | `--color-space`  | `bt709` for accurate color reproduction             |
| **Bitrate**    | `--video-bitrate` | Alternative to CRF. Mutually exclusive — pick one   |

CRF defaults and ranges:

| Codec   | Range | Default | Near-Lossless |
| ------- | ----- | ------- | ------------- |
| H.264   | 1–51  | 18      | 1             |
| H.265   | 0–51  | 23      | 0             |
| VP8     | 4–63  | 9       | 4             |
| VP9     | 0–63  | 28      | 0             |

x264 presets (slowest to fastest):

`veryslow` > `slower` > `slow` > `medium` > `fast` > `faster` > `veryfast` > `superfast`

Slower presets = FFmpeg spends more CPU time optimizing. Same CRF value produces better quality-per-byte.

**For ProRes — use profile:**

| Profile        | Flag Value   | Bitrate    | Alpha Support |
| -------------- | ------------ | ---------- | ------------- |
| **Proxy**      | `proxy`      | ~45 Mbps   | No            |
| **Light**      | `light`      | ~102 Mbps  | No            |
| **Standard**   | `standard`   | ~147 Mbps  | No            |
| **HQ**         | `hq`         | ~220 Mbps  | No            |
| **4444**       | `4444`       | ~330 Mbps  | Yes           |
| **4444 XQ**    | `4444-xq`    | ~500 Mbps  | Yes           |

ProRes has no CRF — quality is determined entirely by the profile.

### Stage 4 — Concurrency

| Setting          | Flag              | What It Does                                        |
| ---------------- | ----------------- | --------------------------------------------------- |
| **Concurrency**  | `--concurrency`   | Parallel frame renders. Default = half your CPU cores |

Higher concurrency = faster renders but more RAM usage. With max quality settings (PNG + scale 2), each frame uses more memory. If renders crash, lower this.

---

## Render Commands

### Max Quality H.264 (universal playback)

```bash
npx remotion render src/index.ts CompositionId out/video.mp4 \
  --codec=h264 \
  --crf=1 \
  --image-format=png \
  --scale=2 \
  --x264-preset=veryslow \
  --color-space=bt709
```

### Lossless ProRes (editing-grade master)

```bash
npx remotion render src/index.ts CompositionId out/video.mov \
  --codec=prores \
  --prores-profile=4444-xq \
  --image-format=png \
  --scale=2 \
  --color-space=bt709
```

### Quick Preview (fast, lower quality)

```bash
npx remotion render src/index.ts CompositionId out/preview.mp4 \
  --codec=h264 \
  --crf=23 \
  --image-format=jpeg \
  --jpeg-quality=80 \
  --x264-preset=fast
```

---

## Quality Tiers

| Tier           | Codec  | CRF / Profile | Frames | Scale | Preset     | File Size |
| -------------- | ------ | ------------- | ------ | ----- | ---------- | --------- |
| **Preview**    | h264   | 23            | jpeg   | 1     | fast       | Small     |
| **Default**    | h264   | 18            | jpeg   | 1     | medium     | Small     |
| **High**       | h264   | 8             | jpeg   | 1     | slower     | Medium    |
| **Maximum**    | h264   | 1             | png    | 2     | veryslow   | Large     |
| **Lossless**   | prores | 4444-xq       | png    | 2     | N/A        | Massive   |

---

## Current Config Defaults

Set in `remotion.config.ts` — applies to every render unless overridden by CLI flags:

| Setting            | Config Value                       | What It Does                          |
| ------------------ | ---------------------------------- | ------------------------------------- |
| CRF                | `Config.setCrf(1)`                 | Near-lossless H.264 quality           |
| Video frame format | `Config.setVideoImageFormat('png')` | Lossless frame capture               |
| Still frame format | `Config.setStillImageFormat('png')` | Lossless still capture               |
| Scale              | `Config.setScale(2)`               | 2x resolution output                  |
| x264 preset        | `Config.setX264Preset('veryslow')` | Max compression efficiency            |
| Color space        | `Config.setColorSpace('bt709')`    | Accurate color reproduction           |

**CLI flags always override config values.** Quick preview override:

```bash
npx remotion render ... --crf=23 --image-format=jpeg --scale=1 --x264-preset=fast
```

---

## Format-Specific Output

| Format         | Base Resolution | At Scale 2     | Use Case                    |
| -------------- | --------------- | -------------- | --------------------------- |
| **Long-form (default)**  | 1920x1080       | 3840x2160 (4K) | YouTube                     |
| **Short-form** | 1080x1920       | 2160x3840 (4K) | TikTok, Reels, Shorts       |

- Platforms downscale 4K to fit devices but retain sharpness from the higher source
- File sizes are roughly 4x larger at scale 2 vs scale 1
- Text and vector graphics gain the most from scale 2

---

## Troubleshooting

| Problem                  | Cause                              | Fix                                          |
| ------------------------ | ---------------------------------- | -------------------------------------------- |
| Blurry text              | Scale 1 on high-density displays   | `--scale=2`                                  |
| Color shift              | Wrong color space                  | `--color-space=bt709`                        |
| Banding in gradients     | JPEG compression artifacts         | `--image-format=png`                         |
| Huge file, low quality   | Hardware encoding enabled          | Disable hardware accel, use CRF instead      |
| Render crashes / OOM     | Too many concurrent PNG+scale frames | Lower `--concurrency`                      |
| Slow renders             | Max quality settings               | Expected — use preview tier for drafts       |
