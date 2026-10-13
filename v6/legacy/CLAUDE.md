# Explainer V3 — Video Production Pipeline

**Read this first.** This file maps the entire workspace so you know exactly where to go for any task.

For deep context on any workspace, read its `CONTEXT.md`. This file is the map, not the manual.

---

## What This System Does

Takes a **raw voiceover script** and produces a **fully rendered video** with frame-accurate audio sync, visual-first storytelling, and production-quality Remotion visuals.

```
Raw script (any length, any format)
    ↓ [Gemini API] TAG_PARSER prompt (33 types × 165+ subtypes)
Tagged script (.md)
    ↓ [TTS API] strip tags → clean text → audio.mp3
    ↓ [Whisper ASR] audio.mp3 → word-level timestamps.json
    ↓ [Aligner script] match tags → frame numbers
Annotated script (annotated.json) — BEATS from real timestamps, not estimates
    ↓ [Gemini API] SPEC_GENERATOR prompt (per section, with arc/energy/rhythm)
Production spec (.md) — frame-accurate BEATS, component props, lifecycle
    ↓ [Claude Code] translate spec → React/Remotion components
    ↓ [Remotion render] calculateMetadata from audio
Final video (.mp4) — visual + audio, perfectly synced (no captions)
```

---

## Folder Structure

```
explainer-v3/
├── CLAUDE.md                               ← You are here
├── CONTEXT.md                              ← Full system overview + routing table
├── .gitignore
│
├── animation-studio/                       ← The full video production pipeline
│   ├── CONTEXT.md                          ← Studio entry point + hard rules
│   ├── package.json                        ← Remotion + React deps
│   ├── tsconfig.json                       ← TypeScript config
│   ├── remotion.config.ts                  ← Render quality settings
│   │
│   ├── input/                              ← Raw voiceover scripts go here
│   │   └── <script-name>.md
│   │
│   ├── docs/
│   │   ├── component-registry.md           ← All Remotion components + props
│   │   ├── design-system.md                ← Colors, typography, springs, layout
│   │   ├── markup-schema.md                ← Tag reference (EM, E, STAT, SB, etc.)
│   │   └── rendering-guide.md              ← Render CLI commands + codec reference
│   │
│   ├── prompts/
│   │   ├── TAG_PARSER.md                   ← Gemini: raw → tagged (33 types)
│   │   └── SPEC_GENERATOR.md               ← Gemini: annotated → spec (arc+energy+rhythm)
│   │
│   ├── scripts/                            ← Python pipeline automation
│   │   ├── .env.example
│   │   ├── requirements.txt
│   │   ├── pipeline.py                     ← Master orchestrator (steps 2-6)
│   │   ├── 01_tts_kokoro.py                ← Step 3: TTS via Kokoro Docker
│   │   ├── 02_asr_whisper.py               ← Step 4: ASR via Whisper Docker
│   │   ├── 03_aligner.py                   ← Step 5: Align tags to frames
│   │   ├── 04_tag_parser.py                ← Step 2: Tag raw script via Gemini
│   │   └── 05_spec_generator.py            ← Step 6: Generate spec via Gemini
│   │
│   ├── workflows/
│   │   ├── CONTEXT.md                      ← Pipeline overview + stage routing
│   │   ├── 00-audio/CONTEXT.md             ← Stage 0: TTS + Whisper + Aligner docs
│   │   ├── 01-scripts/CONTEXT.md           ← Stage 1: Raw scripts (input) docs
│   │   ├── 02-specs/CONTEXT.md             ← Stage 2: Spec format + quality rules
│   │   ├── 03-builds/CONTEXT.md            ← Stage 3: Remotion build patterns
│   │   └── 04-renders/CONTEXT.md           ← Stage 4: Render CLI reference
│   │
│   ├── public/                             ← Remotion static files (auto-populated by pipeline)
│   │   ├── audio/.gitkeep                  ← .mp3 copies (pipeline auto-copies here)
│   │   └── timestamps/.gitkeep             ← .json copies (pipeline auto-copies here)
│   │
│   └── src/
│       ├── index.ts                        ← Remotion entry point
│       ├── Root.tsx                         ← Composition registration
│       ├── components/core/                ← Shared reusable components
│       └── compositions/EdubaShorts/       ← Composition registry
│           ├── index.tsx                   ← Register built compositions here
│           └── constants/                  ← FPS, WIDTH, HEIGHT, colors, typography
│
└── output/                                 ← ALL generated files per script (gitignored)
    ├── CONTEXT.md                          ← Output structure documentation
    └── <script-slug>/                      ← One folder per script processed
        ├── raw-script.md                   ← Copy of input
        ├── tagged-script.md                ← Tagged script
        ├── audio.mp3                       ← TTS audio
        ├── timestamps.json                 ← Whisper timestamps
        ├── annotated.json                  ← Aligned beats + sections
        ├── spec.md                         ← Animation spec
        ├── visual-blocks.json              ← Visual blocks
        ├── build/                          ← Remotion composition source
        └── render/                         ← Final .mp4
```

---

## Quick Navigation

| You want to... | Go here |
|----------------|---------|
| Run the full video pipeline | `animation-studio/workflows/CONTEXT.md` |
| Run TTS + Whisper + Aligner | `animation-studio/workflows/00-audio/CONTEXT.md` |
| Understand markup tags | `animation-studio/docs/markup-schema.md` |
| Tag a raw script (Gemini) | `animation-studio/prompts/TAG_PARSER.md` |
| Generate spec (Gemini) | `animation-studio/prompts/SPEC_GENERATOR.md` |
| **BUILD A VIDEO (START HERE)** | **`animation-studio/workflows/BUILDER_MASTER_GUIDE.md`** |
| Build Remotion composition | `animation-studio/workflows/03-builds/CONTEXT.md` |
| Look up components | `animation-studio/docs/component-registry.md` |
| Render final video | `animation-studio/workflows/04-renders/CONTEXT.md` |
| See generated output | `output/CONTEXT.md` |

---

## Portability

This source is designed to be portable:

1. **Copy `animation-studio/`** (+ root configs) to a new machine
2. **`npm install`** inside animation-studio/
3. **Set up `.env`** in `animation-studio/scripts/` (copy from `.env.example`)
4. **Start Docker services** (Kokoro TTS + Whisper ASR)
5. **Run pipeline**: `python scripts/pipeline.py input/my-script.md --all`
6. **Build composition** (Claude Code reads spec.md)
7. **Register** in `src/compositions/EdubaShorts/index.tsx`
8. **Render**: `npx remotion render <CompositionId> output/<slug>/render/final.mp4`

The `output/` folder is gitignored — it contains generated artifacts only.

---

## Non-Negotiable Rules

**RULE ZERO — BEFORE EVERY BUILD: Read `animation-studio/workflows/BUILDER_MASTER_GUIDE.md` and follow ALL 12 steps. This is the SINGLE SOURCE OF TRUTH for the build process. It references every doc, every rule, every decision point. Skipping it = monotonous video. This applies to EVERY session, EVERY machine, EVERY build — no exceptions. The guide is checked into the repo so it's always available.**

1. **All animations via `spring()` + `interpolate()` + `useCurrentFrame()`** — CSS transitions FORBIDDEN
2. **All BEATS frame numbers = `Math.floor(Whisper_timestamp × 30)`** — never estimated
3. **Video duration = `calculateMetadata` from audio file** — never hardcoded
4. **No captions/subtitles** — visual storytelling only, no `@remotion/captions`
5. **Spec is a code blueprint** — builder translates, never interprets
6. **Minimum BEATS density: 12 per 3-second block** (12 per 90 frames)
7. **All generated files for a script → `output/<slug>/`** — never scattered
8. **NEVER use visibility gate with Sequence** — `if (frame < SCENE_START) return null` causes BLACK SCREEN (useCurrentFrame returns local frame inside Sequence)
9. **NEVER put opacity on background element** — separate bg (always opaque) from content (animated opacity)
10. **NEVER leave content gaps between phases** — first content MUST appear within 15 frames of phase start; every timing.ts beat MUST have a visual
11. **ALL elements need continuous micro-motion** — no element should look identical at frame N and frame N+90 (glow pulse, scale breathing, shimmer)
12. **Beat diversity: max 20% text, min 70% SVG/icon/3D/chart** — EVERY text beat MUST have inline SVG icon companion (>= 40px SUPPORT, >= 60px PRIMARY, >= 80px SYNTHESIS) in same flex container. Text without icon = FORBIDDEN. SYNTHESIS beats especially — never text-only
13. **Scene-to-scene transitions via `<TransitionSeries>`** — NEVER use plain `<Sequence>` for section assembly. Use `TransitionSeries` from `@remotion/transitions` with `fade()`, `slide()`, `wipe()`, or `flip()` between every section pair
14. **Particle minimum: radius >= 6px, opacity >= 0.15** — AmbientBackground particles must be visible at export resolution. Count minimum: 20 for medium energy, 35 for high. Every particle MUST have `boxShadow` glow
15. **4-layer stacking order** — Every scene MUST have: Layer 0 (BG, always opaque) → Layer 1 (Ambient: particles + geometric shapes 80-200px) → Layer 2 (Content with animated opacity) → Layer 3 (Overlay: vignette + scan lines). NEVER skip Layer 1 or Layer 3
16. **Centered layout cap: max 2 out of every 5 sections** — `centered` is NOT the default. Every spec MUST explicitly declare layout from: centered, split-h, split-v, grid, radial, stacked, floating, cinematic
17. **ZERO text-only beats** — every text MUST have icon/3D/SVG shape companion beside it
18. **Every META tag must have subtype declared** — 33 types (Groups A-I) in `docs/markup-schema.md`
19. **Scene layout must vary** — never same layout 3 sections in a row (8 layouts: centered, split-h, split-v, grid, radial, stacked, floating, cinematic)
20. **Every keyword/concept → 1 inline SVG icon** describing it (use `@remotion/shapes` for primitives)
21. **Background preset MUST match script domain** — 1 background style per video is OK, but it must fit the topic (Space→StarField+slow particles, Finance→grid+sharp dots, Tech→matrix+hex, Nature→organic+soft circles, etc.). See `docs/design-system.md` Background Presets by Domain
22. **Element Relocate Pattern (MANDATORY)** — When a new element/group enters, existing elements MUST smoothly animate to new positions using `interpolate()` on their `left`/`top` coordinates. Elements stay visible but **move aside** to make room. **Relocate timing: old elements start moving AT the exact frame the new element appears — NOT before.** Use `interpolate(frame, [newBeatEnter, newBeatEnter+20], [oldPos, newPos])`. If new beat enters at f200, old element MUST stay at original position until f200, then smoothly move over 20 frames. NEVER anticipate/move early. **SMART OVERLAP PREVENTION (MANDATORY):** Khi beat mới vào, kiểm tra bounding box: (1) Nếu beat cũ bị OVERLAP với beat mới tại vị trí mới → beat cũ FADE OUT hoàn toàn (opacity → 0 over 15 frames), KHÔNG giữ lại (2) Nếu beat cũ KHÔNG overlap (relocate sang góc/top row thành công) → giữ lại nhưng MỜ (opacity 0.25, scale 0.6) để không tranh spotlight với beat mới (3) Max 3 visible elements cùng lúc — element thứ 4+ thì element cũ nhất PHẢI fade out (4) Relocated element mà scale < 0.55 → fade out thay vì giữ lại quá nhỏ. **Pattern code:**
    ```
    // Smart overlap check: if new beat overlaps old beat's relocated position → fade old out
    const oldBeatRelocatedOverlaps = newBeatZone === oldBeatRelocatedZone;
    const oldBeatOpacity = oldBeatRelocatedOverlaps
      ? interpolate(frame, [newBeatEnter, newBeatEnter+15], [1, 0], EC)  // GONE
      : interpolate(frame, [newBeatEnter, newBeatEnter+20], [1, 0.25], EC); // DIM
    ```
23. **Spatial Flow Order (MANDATORY)** — Beats PHẢI xuất hiện và relocate theo trật tự không gian có logic, KHÔNG ĐƯỢC loạn. Mỗi scene PHẢI chọn 1 trong các flow patterns sau và follow NGHIÊM NGẶT:
    - **Top-Down Flow**: Beat 1 → top-center, beat 2 → dưới beat 1, beat 3 → dưới beat 2. Khi hết chiều dọc, beat cũ nhất relocate lên top-left (nhỏ lại), beat mới tiếp tục flow xuống.
    - **Left-to-Right Flow**: Beat 1 → left-center, beat 2 → right of beat 1, beat 3 → tiếp tục sang phải. Khi hết chiều ngang, hàng trên relocate lên (nhỏ lại), beat mới bắt đầu hàng dưới.
    - **Center-Expand Flow**: Beat 1 → dead center (lớn). Beat 2 vào → beat 1 relocate sang trái, beat 2 lấy phải. Beat 3 vào → beat 1+2 relocate lên trên (nhỏ lại), beat 3 lấy center. Pattern: center → split → row.
    - **Quadrant Flow**: Chia canvas thành 4 góc (TL, TR, BL, BR). Beat 1 → TL, beat 2 → TR, beat 3 → BL, beat 4 → BR. Beat 5+ → tất cả 4 relocate nhỏ lại sát góc, beat mới lấy center.
    - **Z-Pattern Flow**: Beat 1 → top-left, beat 2 → top-right, beat 3 → center (chéo), beat 4 → bottom-left, beat 5 → bottom-right. Theo hình chữ Z tự nhiên cho mắt đọc.
    **Quy tắc chung:** (1) PHẢI declare flow pattern ở đầu mỗi scene component dưới dạng comment: `// Flow: top-down` (2) Mỗi beat position phải TÍNH TRƯỚC dựa trên **Zone Grid System** (9 zones, xem Rule #25), KHÔNG random — comment zone cho mỗi element: `// Z5: hero` (3) Relocated elements di chuyển LUÔN LÊN top row (Z1, Z2, Z3) — KHÔNG MỘT element relocate xuống dưới hoặc sang ngang lung tung (4) Max 4 visible elements cùng lúc — element thứ 5+ thì element cũ nhất PHẢI fade out (5) KHÔNG BAO GIỜ overlap — Zone Grid đảm bảo 50px gap tự động giữa mọi zone. Nếu 2 element cùng 1 zone → BUG, phải fix
24. **Element Size Ratio (MANDATORY)** — Trên canvas 1920×1080, mọi element phải đảm bảo tỷ lệ hiển thị RÕ RÀNG VÀ LỚN. **Text**: hero/title ≥ 84px, primary label ≥ 56px, secondary label ≥ 40px, smallest caption ≥ 28px. **Icon/SVG**: hero icon ≥ 160px, primary icon ≥ 100px, support icon ≥ 60px — NEVER below 50px. **Relocated elements**: khi element bị relocate sang vị trí mới và scale down, minimum scale = 0.55 (tức hero 160px → min 88px). Nếu scale xuống dưới 0.55 thì PHẢI fade out thay vì giữ lại quá nhỏ. **Active/focused element** (beat đang được narrate) phải chiếm ≥ 35% chiều rộng HOẶC ≥ 30% chiều cao của canvas — đây là element CHÍNH trên màn hình, phải nổi bật rõ ràng. **Chart/Graph**: minimum width 1000px, height 500px khi là element chính. **Tính toán BẮT BUỘC**: Trước khi đặt position, tính `elementWidth / 1920` và `elementHeight / 1080` — nếu < 0.08 (154px wide hoặc 86px tall) thì element quá nhỏ, phải scale up.
25. **Zone Grid System (MANDATORY — CHỐNG OVERLAP)** — Canvas 1920×1080 được chia thành 9 ZONE cố định. Mỗi element PHẢI được assign vào 1 zone. KHÔNG BAO GIỜ 2 element cùng zone trừ khi chúng là 1 group (text + icon companion). **9 Zones:**
    - **Z1** (top-left): x=60-560, y=60-340 — cho relocated elements
    - **Z2** (top-center): x=610-1310, y=60-340 — cho relocated elements hoặc titles
    - **Z3** (top-right): x=1360-1860, y=60-340 — cho relocated elements
    - **Z4** (mid-left): x=60-560, y=390-690 — cho split-h left panel
    - **Z5** (mid-center): x=610-1310, y=390-690 — HERO ZONE, active beat luôn ở đây khi centered
    - **Z6** (mid-right): x=1360-1860, y=390-690 — cho split-h right panel
    - **Z7** (bot-left): x=60-560, y=740-1020 — cho support elements
    - **Z8** (bot-center): x=610-1310, y=740-1020 — cho sub-labels, stats
    - **Z9** (bot-right): x=1360-1860, y=740-1020 — cho support elements
    **Quy tắc Zone:** (1) Active beat PHẢI ở Z5 (center) hoặc span Z4+Z5+Z6 (full-width) — KHÔNG BAO GIỜ active beat ở góc (2) Relocated elements chỉ được di chuyển đến Z1, Z2, Z3 (top row) — KHÔNG relocate xuống dưới (3) Mỗi zone có padding 50px — element KHÔNG ĐƯỢC chạm mép zone = tự động 50px gap giữa các zone (4) Khi declare positions trong code, PHẢI comment zone: `// Z5: hero position` (5) Flow patterns map vào zones: top-down = Z2→Z5→Z8, left-to-right = Z4→Z5→Z6, center-expand = Z5→Z4+Z6→Z1+Z2+Z3, quadrant = Z1→Z3→Z7→Z9→Z5 (6) **OVERLAP CHECK**: nếu 2 elements có bounding boxes giao nhau (tính cả padding) → BUG, phải fix ngay bằng cách chuyển 1 element sang zone khác (7) **OFF-SCREEN PREVENTION (MANDATORY)**: MỌI element PHẢI nằm hoàn toàn trong canvas 1920×1080. Tính: `left >= 0`, `top >= 0`, `left + elementWidth <= 1920`, `top + elementHeight <= 1080`. Element bị cắt 1 phần = BUG. Khi relocate: tính vị trí mới + kích thước sau scale — nếu vượt canvas thì giảm position hoặc fade out. **Cụ thể**: left minimum = 20px, top minimum = 20px, right maximum = left + width <= 1900px, bottom maximum = top + height <= 1060px. Khi dùng `transform: scale()`, tính bounding box SAU scale. Khi dùng `transformOrigin: center`, element expand ĐỀU 2 phía — tính left - (width * scale - width) / 2. **KHÔNG BAO GIỜ** đặt element ở position âm hoặc vượt quá 1920/1080
26. **Components mỗi video là MỚI HOÀN TOÀN** — KHÔNG ĐƯỢC copy components từ video khác. Mỗi video có bộ components riêng (ParticleField, AmbientShapes, Vignette, SVG icons, scene files) được tạo mới 100% dựa trên spec đã generate. Components phải phản ánh đúng domain, palette, và visual style của video đó. KHÔNG có component nào "shared" giữa các video — mỗi `output/<slug>/build/components/` là independent. Builder đọc spec.md và tạo mọi thứ từ đầu.
28. **SVG-first, 3D chỉ khi cần (MANDATORY)** — Mọi visual elements (icons, charts, illustrations, shapes, backgrounds) PHẢI vẽ bằng SVG trước. SVG sáng hơn, colorful hơn, render nhanh hơn, file nhỏ hơn. **Chỉ dùng 3D (ThreeCanvas)** khi SVG KHÔNG THỂ biểu diễn concept (true 3D rotation, abstract volumetric shapes, camera flythrough, depth-dependent lighting). **Mix chiến lược:** SVG cho hầu hết beats + 3D cho 1-2 hero moments đặc biệt mỗi video = đỉnh cao visual. Khi dùng 3D: đảm bảo lighting đủ sáng (không tối), bloom postprocessing, bright colors, `width={width} height={height}` từ useVideoConfig(), `linear` prop, `--gl=angle` cho Windows render
    **3D BẮT BUỘC cho các concept trừu tượng sau (SVG KHÔNG ĐỦ):**
    - **Hành tinh/thiên thể quay**: Earth rotation, planet spinning, moon orbit — cần true 3D sphere + rotation
    - **Black hole / Wormhole**: event horizon, accretion disk, gravitational lensing — cần depth + distortion
    - **Lõi Trái Đất / Cross-section 3D**: magma core, tectonic layers — cần 3D cutaway với depth
    - **DNA / Phân tử / Cấu trúc vi mô**: helix rotation, molecular bonds — cần 3D wireframe + rotation
    - **Vũ trụ mở rộng**: expanding universe, space-time fabric bending — cần 3D grid deformation
    - **Não bộ / Neural network**: 3D neuron connections, signal propagation — cần depth + particle trails
    - **Topology / Hình học cao cấp**: Möbius strip, Klein bottle, tesseract — cần true 3D transform
    - **Camera flythrough**: đi xuyên qua một cấu trúc (galaxy, cell, city) — cần 3D camera path
    - **Abstract energy / Consciousness**: concepts không có hình dạng vật lý cụ thể — cần volumetric 3D với glow + particles
    **3D Setup Checklist:**
    ```tsx
    import { ThreeCanvas } from '@remotion/three';
    const { width, height } = useVideoConfig();
    <ThreeCanvas width={width} height={height} linear>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#FFD700" />
      <EffectComposer>
        <Bloom intensity={1.0} luminanceThreshold={0.3} />
      </EffectComposer>
      {/* Scene content */}
    </ThreeCanvas>
    ```
    **3D Rules:** (1) useCurrentFrame() cho timing — KHÔNG useFrame() (2) Bright colors + lighting intensity ≥ 0.6 (3) Bloom postprocessing bắt buộc (4) `--gl=angle --timeout=120000 --concurrency=1` khi render (5) Render timeout 120s cho frames có 3D (6) Max 1-2 ThreeCanvas per video — quá nhiều = chậm render
29. **Hook scene PHẢI gây ấn tượng mạnh (MANDATORY)** — Hook (Section 1) là scene QUAN TRỌNG NHẤT — viewer quyết định ở lại hay rời đi trong 3 giây đầu. **Yêu cầu bắt buộc:** (1) 90 frames đầu (3 giây) PHẢI có visual impact ngay lập tức — KHÔNG slow fade-in (2) Hero element phải là thứ striking nhất toàn video (3) Dùng kỹ thuật dramatic: large hero SVG animation, energy burst, particle explosion, cinematic scale, bold colors, split-screen reveal (4) Beat density ở hook PHẢI cao nhất trong tất cả sections (5) Tham khảo 36 hook templates trong `docs/hook-templates.md` (6) KHÔNG BAO GIỜ hook scene chỉ có text fade-in — phải có visual element xuất hiện NGAY frame 1
31. **Visual Subject Dominance (MANDATORY)** — Chủ thể visual (SVG icon, chart, illustration) PHẢI là element LỚN NHẤT và SÁNG NHẤT trên canvas. Text chỉ là nhãn phụ trợ. **Quy tắc bắt buộc:** (1) Hero SVG subject ≥ 300px (chiếm ≥ 25% canvas area), opacity ≥ 0.85 — KHÔNG BAO GIỜ mờ nhạt (2) Text là SUPPORT — fontSize nhỏ hơn subject, positioned xung quanh subject, KHÔNG chiếm center stage (3) Content layer (Layer 2) opacity cho main subject: 0.85-1.0 — NEVER below 0.7 (4) Ambient/particle layer (Layer 1) opacity: 0.05-0.2 — background PHẢI mờ hơn content (5) Visual hierarchy nghiêm ngặt: Subject SVG (sáng nhất, lớn nhất) > Text labels (trung bình) > Ambient/particles (mờ nhất) (6) Mỗi scene hero moment = 1 SVG lớn, colorful, sắc nét — KHÔNG PHẢI text animation (7) **Anti-pattern**: scene chỉ có text + particles = VI PHẠM. Phải có SVG subject chiếm spotlight
    **OPACITY ENFORCEMENT (CRITICAL — RECURRING BUG):**
    - **Vignette (Layer 3):** opacity `0.15 + Math.sin(frame * 0.03) * 0.05` = range 0.1-0.2. **NEVER** above 0.3. Vignette 0.5+ = content invisible = BUG
    - **Particles (Layer 1):** individual particle opacity 0.08-0.15. **NEVER** above 0.2. Particle opacity 0.3+ = competing with content
    - **Content (Layer 2):** hero SVG opacity = single variable, **KHÔNG NHÂN nhiều biến**. `opacity: heroOpacity` (0.85-1.0), KHÔNG `opacity: heroOpacity * fadeOut * dim` (= 0.3 thực tế)
    - **Background (Layer 0):** opacity 1.0 always, không animate
    **SCENE BEAT STRUCTURE (MANDATORY — MỌI SCENE PHẢI CÓ):**
    - **1 HERO beat ở trung tâm (Z5)** — SVG/3D/chart lớn nhất (≥ 400px), sáng nhất (opacity 0.9-1.0), chiếm spotlight
    - **2-4 SUPPORT beats xung quanh hero** — mỗi beat phải KHÁC LOẠI để đa dạng visual:
      * Text label + icon companion (fontSize 44-56px)
      * CountUp stat (số liệu animated)
      * Secondary SVG icon (100-200px)
      * Mini chart/diagram
      * Icon strip (3-4 icons in row)
      * Connector lines/arrows between beats
    - **TẤT CẢ beats (hero + support) PHẢI SÁNG HƠN BACKGROUND** — opacity content ≥ 0.85, opacity bg ≤ 0.15. Nếu beat nào mờ hơn bg particles = BUG nghiêm trọng
    - **KHÔNG BAO GIỜ scene chỉ có 1 hero + 0 support** — minimum 1 hero + 2 support beats
    - **Visual diversity bắt buộc**: mỗi scene PHẢI dùng ít nhất 2 LOẠI beat khác nhau (text + SVG, hoặc stat + chart, hoặc icon + diagram). Scene nào chỉ toàn text = VI PHẠM Rule #12
32. **Anti-Overlap Enforcement (MANDATORY)** — Ngoài Zone Grid (Rule #25), thêm layer chống overlap: (1) Mỗi element PHẢI có `position: absolute` với `left` và `top` tính toán từ zone coordinates — KHÔNG dùng flexbox cho layout chính giữa các beats (2) Khi 2+ elements cùng visible, tính bounding box (left, top, width, height) — nếu overlap > 20% area → BUG (3) Text labels PHẢI có `maxWidth` explicit để không tràn ra ngoài zone (4) Relocated elements khi scale down PHẢI recalculate position để không chồng lên elements mới (5) **Validator check**: mỗi element trong scene phải có zone comment VÀ explicit position — thiếu = WARN
33. **Claude Code là SPEC GENERATOR DUY NHẤT** — KHÔNG dùng Gemini API cho bất kỳ bước nào. Claude Code tự generate spec trực tiếp từ annotated.json. **Quy trình BẮT BUỘC (PHẢI THEO THỨ TỰ):**
    **BƯỚC 0 — ĐỌC TOÀN BỘ RULES TRƯỚC KHI LÀM BẤT CỨ THỨ GÌ (MANDATORY):**
    Đọc TẤT CẢ các file sau TRƯỚC KHI viết 1 dòng spec hay code nào. Đây là bước bắt buộc, không skip:
    (a) `CLAUDE.md` — Tất cả 36 rules (đặc biệt: #22 relocate+overlap, #24 sizes, #25 zones, #28 SVG vs 3D, #29 hook, #31 visual dominance+opacity, #34 SFX, #35 motion size)
    (b) `animation-studio/workflows/BUILDER_MASTER_GUIDE.md` — 12-step build process
    (c) `animation-studio/docs/hook-templates.md` — 36 hook templates (chọn 1 cho Section 1)
    (d) `animation-studio/docs/scene-composition-model.md` — 5 beat roles, 6 composition patterns
    (e) `animation-studio/docs/design-system.md` — Zone grid, element sizes, background presets by domain
    (f) `animation-studio/docs/component-registry.md` — Tất cả components available
    (g) `animation-studio/docs/markup-schema.md` — 33 tag types để translate META tags thành visuals
    (h) `animation-studio/prompts/SPEC_GENERATOR.md` — Spec format, arc types, energy levels, section roles
    **SAU KHI ĐỌC XONG tất cả 8 files trên**, mới được bắt đầu:
    **BƯỚC 1** — Đọc annotated.json — extract sections, beats, timestamps
    **BƯỚC 2** — Xác định: domain, palette, arc type, section roles, energy levels
    **BƯỚC 3** — Chọn hook template (từ hook-templates.md) cho Section 1
    **BƯỚC 4** — Assign layout cho TỪNG section (8 layouts, không 3 liên tiếp giống nhau)
    **BƯỚC 5** — Assign composition pattern cho từng section (hub-spoke, timeline, comparison, zoom-in, scale, verdict)
    **BƯỚC 6** — Xác định đâu cần 3D (Rule #28: hành tinh, black hole, DNA, brain, abstract energy...)
    **BƯỚC 7** — Generate spec/build cho từng section với đầy đủ: beat positions, relocate pattern, SFX, transitions
    **KHÔNG BAO GIỜ** skip Bước 0. **KHÔNG BAO GIỜ** gọi Gemini API
34. **SFX System (MANDATORY — mọi video PHẢI có SFX)** — Sound effects làm video sinh động và chuyên nghiệp hơn. **3 loại SFX:**
    - **Beat SFX**: Khi beat mới xuất hiện → sfx ngắn (0.3-0.8s). Ví dụ: whoosh cho hero entrance, pop cho support appear, click cho stat counter, swoosh cho relocate. Dùng `<Audio src={staticFile('sfx/whoosh.mp3')} startFrom={beatFrame} volume={0.3} />`
    - **Transition SFX**: Giữa các scene → sfx chuyển cảnh (0.5-1.5s). Ví dụ: sweep, woosh, impact, reverse-cymbal. Timing: bắt đầu 10 frames TRƯỚC transition, kết thúc 10 frames SAU transition start
    - **Ambient/Descriptive SFX**: Mô tả nội dung kịch bản (1-5s, loop nếu cần). Ví dụ: mưa → rain.mp3, lửa → fire-crackle.mp3, không gian → space-hum.mp3, đại dương → ocean-waves.mp3, gió → wind.mp3. Volume thấp (0.1-0.2) để không che voiceover
    **SFX Timing Rules:**
    - Beat SFX: duration 0.3-0.8s, KHÔNG dài hơn 1s. Volume 0.2-0.4
    - Transition SFX: duration 0.5-1.5s. Volume 0.15-0.3
    - Ambient SFX: duration flexible (loop nếu cần), volume 0.08-0.15 — PHẢI thấp hơn voiceover
    - **KHÔNG BAO GIỜ** SFX che lấp voiceover — tổng volume SFX tại bất kỳ frame nào ≤ 0.4
    - SFX files đặt trong `public/sfx/` — tạo folder nếu chưa có
    - Mỗi video cần tối thiểu: 3-5 beat SFX + 2-3 transition SFX + 1-2 ambient SFX
    **SFX Source**: Download free SFX từ freesound.org hoặc dùng synthetic (tone generator). Nếu không có file SFX sẵn → skip SFX cho beat đó (KHÔNG block pipeline vì thiếu SFX)
35. **Motion Size & Brightness (MANDATORY — RECURRING BUG FIX)** — Mọi animated elements PHẢI to và sáng rõ ràng. **Quy tắc:**
    - Hero SVG: minimum 400px (LÝ TƯỞNG 500-600px), chiếm ≥ 30% canvas area
    - Support SVG icons: minimum 100px (LÝ TƯỞNG 120-160px)
    - Text icon companions: minimum 60px (LÝ TƯỞNG 80-100px)
    - **Brightness enforcement**: Mọi content element phải có `filter: drop-shadow(0 0 15px ${color}50)` hoặc `boxShadow` để tạo glow effect — elements không glow = elements bị chìm vào background
    - **Spring scale entrance**: Mọi hero phải entrance từ scale 0.3 → 1.0 (overshoot spring), KHÔNG scale 0.8 → 1.0 (quá subtle, viewer không thấy)
    - **Color saturation**: Dùng saturated colors cho content (primary, secondary, accent), KHÔNG dùng muted/dim colors cho elements chính
36. **Unicode Characters — KHÔNG dùng escape sequences** — Khi cần ký tự đặc biệt (°, ³, ², ×, →, ←, ≥, ≤, π, ∞, ±, µ, Ω, ñ, é), viết TRỰC TIẾP ký tự Unicode thật, KHÔNG viết dạng escape `\u00B0` hoặc `\u00B3`. Escape sequences hiển thị raw text trong JSX render. **Ví dụ:** `5000°C` ✓, `5000\u00B0C` ✗. `600 km³` ✓, `600 km\u00B3` ✗
