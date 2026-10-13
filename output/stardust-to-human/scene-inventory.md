# Bản tra cứu beat, tag và shot/scene hiện tại — StardustToHuman

Đối chiếu trực tiếp với code đang chạy. 10 phần (mở đầu + 9 chapter), 56 shot, 188 tag căn theo VO. Khung hình: 1920×1080, 30 fps; 16064 frame = 08:55.47. Audio/container bản xuất: 535.509 giây.

## Cách đọc dữ liệu

Chapter/Section là phần kể chuyện lớn. Shot là khoảng thời gian renderer chọn một kind/world và title. Beat là mốc ý nghĩa trong VO, gắn tag; nhiều beat nằm trong một shot. Một shot không mặc nhiên tương ứng một SB.

Nguồn: `timeline.json` quyết định chapter/shot/words/audio revision; `annotated.json` chứa beat đã căn; `tagged-script.md` chứa annotation thô; `build/components/Worlds.tsx` route kind sang implementation; `SceneShell.tsx` chọn shot và transition; `StardustToHuman.tsx` ghép chapter và audio.

## Tag đang có

| Tag | Số thực tế | Ý nghĩa và mức thực thi |
| --- | ---: | --- |
| META | 53 | Định hướng cách diễn đạt visual: type, subtype và subject/steps/era/context. Đây là annotation; renderer hiện tại không đọc trực tiếp META để tự dựng scene. |
| EM | 54 | Từ/cụm từ được nhấn: tên khái niệm, đối tượng hoặc câu chốt. Có timestamp theo VO; không mặc nhiên tạo chữ nổi riêng trong bản render. |
| STAT | 54 | Số liệu theo cấu trúc value \| unit \| context. Dùng làm mốc nội dung; không phải mọi STAT đều có counter hoặc nhãn riêng trên màn hình. |
| E | 7 | Từ/cụm diễn đạt vấn đề hoặc hậu quả xấu, ví dụ poison/killed. Không phải lệnh tạo VFX hay thông báo lỗi phần mềm. |
| SB | 19 | Scene Break trong script: dấu ngắt ngữ nghĩa, text rỗng. Hiện không tương ứng 1:1 với chapter hoặc shot; bị loại khỏi sections[].beats nhưng còn trong all_beats. |
| CLOSE | 1 | Câu kết. Là beat nội dung trong dữ liệu; final card thực tế được điều khiển bằng shot city. |

LIST và QUOTE không xuất hiện. META types thực tế: anatomy (1), flow (11), metaphor (4), timeline (17), transformation (4), scenario (3), hierarchy (1), map (1), 3d (1), tension (3), icon (1), progress (1), cycle-feedback (1), funnel-analysis (1), comparison (1), scale (2).

## Các chênh lệch cần biết

- all_beats chứa 188 tag thực tế; total_beats=192 là metadata cũ. 169 beat nội dung nằm trong sections[].beats; 19 SB còn trong all_beats.
- tag-response.tag_summary cũng cũ: ví dụ META_count=41 nhưng file hiện tại có 53 META. Không dùng summary này để đếm.
- IDs gốc không duy nhất vì nhiều META bị rút gọn thành cùng ID. B001…B188 và S01…S56 là ID tra cứu do báo cáo thêm, không phải ID mới trong pipeline.
- Renderer dùng timeline.shots và kind; không đọc annotated.json để chạy từng beat/tag. Beat là mốc nội dung, không phải 188 cảnh đã dựng.
- layout/pattern của chapters được giữ trong metadata/comment. Section dùng cùng shell toàn khung; không tự có split-h/split-v/grid theo nhãn.
- Ảnh/VO/shot theo video hiện tại khoảng 8:55, không ép 12 phút kịch bản gốc. Timecode dưới đây tính từ frame/30; trường time và timestamp_seconds có thể lệch vài phần trăm giây vì rounding.
- Shot narration được phân theo thời điểm bắt đầu của từ; câu có thể kéo qua ranh giới shot. Đây không phải bản dịch VO mới.
- Source docs spec.md, production-brief.md và direction docs còn chứa mô tả/approval state cũ. Hành vi code hiện tại và final-verification.json được ưu tiên trong báo cáo.
- SFX cues=0; mix là VO+BGM. Flash, particle burst và camera shake là visual VFX nên vẫn tồn tại.
- Subject 2D SVG thực sự còn hoạt động: extinction và skyline city cuối; labels/rail/progress/chapter icons cũng là SVG/HTML. Các subject SVG cũ khác vẫn còn source nhưng bị early return 3D chặn.
- META chưa được thực hiện thành shot riêng ở một số đoạn: shockwave kích hoạt cloud, comet thêm nước, ozone/blue sky, núi lửa xuyên băng, cá bò lên bờ, người tiến hóa/vẽ hang, tsunami/firestorm.

## Danh mục chapter

| Phần | Timecode | Frame [start,end) | Shot | Beat nội dung | Layout / pattern metadata |
| --- | --- | --- | ---: | ---: | --- |
| Mở đầu — STARDUST TO HUMAN | 00:00.00–00:39.50 | 0–1185 | 5 | 12 | cinematic / Zoom-In |
| Chapter 1 — FROM NOTHING | 00:39.50–01:37.33 | 1185–2920 | 6 | 20 | floating / Scale |
| Chapter 2 — THE SUN CAME FIRST | 01:37.33–02:18.90 | 2920–4167 | 4 | 10 | radial / Hub-Spoke |
| Chapter 3 — HELL AND THE MOON | 02:18.90–03:22.37 | 4167–6071 | 7 | 18 | cinematic / Timeline |
| Chapter 4 — WATER FROM THE SKY | 03:22.37–04:15.70 | 6071–7671 | 6 | 14 | split-h / Comparison |
| Chapter 5 — SLIME REWRITES THE SKY | 04:15.70–05:04.40 | 7671–9132 | 5 | 16 | grid / Zoom-In |
| Chapter 6 — FROZEN THEN ALIVE | 05:04.40–05:49.07 | 9132–10472 | 4 | 17 | split-v / Comparison |
| Chapter 7 — LAND AND THE GREAT DYING | 05:49.07–06:38.70 | 10472–11961 | 6 | 23 | stacked / Timeline |
| Chapter 8 — THE DINOSAURS LAST DAY | 06:38.70–07:34.77 | 11961–13643 | 6 | 24 | cinematic / Scale |
| Chapter 9 — THE FINAL SECOND | 07:34.77–08:55.47 | 13643–16064 | 7 | 15 | floating / Verdict |

## Cấu trúc chung đang chạy

Mỗi section có backdrop, 36 hạt nền và ellipse orbit mờ; World toàn khung; vignette và scanline. World opaque có thể che hạt/ellipse ở dưới. SceneShell thêm chapter header, star icon/title và progress line; calendar có layout chữ/rail riêng. Title dùng spring và dao động Y nhỏ.

Shot khác kind dissolve 20 frame ở đầu incoming; cùng kind liền nhau nối motionAge và chỉ đổi title. Ngoại lệ impact vào trực tiếp. Chapter dùng fade/wipe/slide overlap 20 frame. FilmCanvas chạy theo frame Remotion, không tích lũy thời gian; preview DPR .55, render DPR 1.

Audio: VO+BGM, 0 SFX cue. VO kết thúc khoảng 528.442 s. Full-frame fade bắt đầu 08:52.97, đen hoàn toàn 08:53.47 đến hết.

## Chi tiết toàn bộ 56 shot

### Mở đầu — STARDUST TO HUMAN

#### S01 · hand · YOU ARE STARDUST

**Timecode:** 00:00.00–00:09.00 · **Frame:** [0, 270) · **Thời lượng:** 9.000 s.

**VO hiện tại:** Put your hand on your chest. The iron in your blood, the calcium in your bones, the gold in your ring, none of it was

**Component:** StreetWorld

**Visual / vật thể:** Phố hiện đại: 12 khối nhà có nhịp cửa sổ, mặt lát, bó vỉa, cột đèn; 18 người mặc đồ hiện đại đi ba làn ngược chiều.

**Motion đối tượng:** Người đi khoảng 0.85–1.15 m/s, khác phase chân; gối/cổ chân/tay chuyển động theo rig. Áo đổi màu theo người. Camera kéo lên suốt 270 frame.

**Camera:** Góc thượng đế: (4,18,0) → (3,32,-3), điểm nhìn (0,0.1,-7) → (0,0.1,-9); smoothstep, FOV 47°.

**Ánh sáng / môi trường / VFX:** HDR Lebombo, hemisphere và directional light, contact shadows, sương xa 26–85.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp. Ngoài dissolve chung, World có element overlay nội bộ age 246–270.

**Chi tiết chưa có / giới hạn implementation:** Tên kind cũ hand vẫn được giữ; không còn cảnh người trong phòng ở đường render này. ElementWorld bắt đầu chuẩn bị từ age 228; dissolve nhìn thấy ở age 246–270 (8.2–9.0 s).

**Beat/tag bên trong (4):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B001 | 00:03.03 / 91 | +3.033 s | META | type=anatomy, subtype=labeled, subject=human body elements, context=origin in stars |
| B002 | 00:03.20 / 96 | +3.200 s | EM | iron |
| B003 | 00:04.80 / 144 | +4.800 s | EM | calcium |
| B004 | 00:06.60 / 198 | +6.600 s | EM | gold |

#### S02 · elements · IRON / CALCIUM / GOLD

**Timecode:** 00:09.00–00:18.33 · **Frame:** [270, 550) · **Thời lượng:** 9.333 s.

**VO hiện tại:** born on Earth. It was forged at a hundred million degrees inside the heart of a star that exploded before the sun even existed.

**Component:** ElementWorld

**Visual / vật thể:** Ba mẫu vật: khối sắt bất quy tắc, ba tinh thể màu trắng chứa canxi, nhẫn vàng torus. Nhãn Fe / IRON, Ca / CALCIUM, Au / GOLD.

**Motion đối tượng:** Sắt xoay 0.003 rad/frame, tinh thể 0.002, nhẫn 0.004; phản quang đổi theo góc.

**Camera:** Camera cố định (0,0.4,10), FOV 43°; motion đến từ mẫu vật.

**Ánh sáng / môi trường / VFX:** Nền sao và môi trường studio; kim loại sắt roughness .36, vàng .18; khoáng vật roughness .23.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Không phải minh họa nguyên tử chính xác. Riêng elements ở frame > 2000 được route sang SpaceWorld furnace; chi tiết đó được thay riêng bên dưới.

**Beat/tag bên trong (2):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B005 | 00:10.43 / 313 | +1.433 s | META | type=flow, subtype=linear, steps=Forged in stars→Exploded→Scattered elements |
| B006 | 00:11.63 / 349 | +2.633 s | STAT | a hundred million \| degrees \| inside a star |

#### S03 · dust · ASHES OF A STAR

**Timecode:** 00:18.33–00:21.50 · **Frame:** [550, 645) · **Thời lượng:** 3.167 s.

**VO hiện tại:** Literally, you are the ashes of a stellar explosion, and

**Component:** SpaceWorld

**Visual / vật thể:** Đám vật chất sao ba chiều: mật độ khí raymarch và 2,400 hạt nhỏ, nền sao 1,800 điểm.

**Motion đối tượng:** Trường khí trôi, hạt xoay và giãn nhẹ; ánh sáng nóng/lạnh theo noise.

**Camera:** Camera drift ngang và tiến: x = 1.3−0.14t, z = 9.2−0.15t.

**Ánh sáng / môi trường / VFX:** Khí có mật độ/che khuất, bloom HDR .45 và ACES; nền tối.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Không có sự kiện bàn tay tan thành bụi trong implementation hiện tại; shot độc lập là đám bụi sao.

**Beat/tag bên trong (4):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B007 | 00:18.33 / 550 | +0.000 s | META | type=metaphor, subtype=abstract, subject=human body, context=composed of stardust |
| B008 | 00:19.47 / 584 | +1.133 s | EM | ashes of a stellar explosion |
| B009 | 00:21.37 / 641 | +3.033 s | SB | (ngắt scene trong script) |
| B010 | 00:21.37 / 641 | +3.033 s | META | type=timeline, subtype=era, era=Early Earth inferno, span=4.5B years ago |

#### S04 · lava · 4.5 BILLION YEARS

**Timecode:** 00:21.50–00:32.40 · **Frame:** [645, 972) · **Thời lượng:** 10.900 s.

**VO hiện tại:** the rock beneath your feet? 4 .5 billion years ago it was a boiling inferno at 1200 degrees Celsius. No water, no air, meteorites hammered it every day.

**Component:** PlanetStage

**Visual / vật thể:** Trái Đất nóng với vỏ đá tối và khe magma phát sáng procedural.

**Motion đối tượng:** Cầu xoay, camera orbit/dolly; khe sáng chủ yếu gắn với bề mặt.

**Camera:** Khoảng cách 8.7, FOV 42°, orbit .032 rad/s.

**Ánh sáng / môi trường / VFX:** Ánh sáng một phía, viền cam, magma emission.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Trong shot THE LONG COOLING, kind lava chưa làm cooling tăng theo age; sự nguội rõ hơn chỉ ở shot crust.

**Beat/tag bên trong (2):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B011 | 00:24.30 / 729 | +2.800 s | STAT | four point five billion \| years ago |
| B012 | 00:27.40 / 822 | +5.900 s | STAT | twelve hundred \| degrees Celsius |

#### S05 · earth · FROM FIRE TO HOME

**Timecode:** 00:32.40–00:39.50 · **Frame:** [972, 1185) · **Thời lượng:** 7.100 s.

**VO hiện tại:** So how, did that hell become the place where you are sitting scrolling through your phone? This is the whole story.

**Component:** PlanetStage

**Visual / vật thể:** Trái Đất với NASA Blue Marble, lớp mây riêng và viền khí quyển.

**Motion đối tượng:** Cầu xoay .0025 rad/frame, mây .0029; camera orbit và dolly.

**Camera:** Khoảng cách 8.7, FOV 42°; góc orbit .032 rad/s.

**Ánh sáng / môi trường / VFX:** Daymap có shading theo hướng sáng; rim khí quyển xanh.

**Transition sang shot kế:** Chuyển chapter: fade, overlap 20 frame (0.667 s), bắt đầu tại frame 1185.

**Chi tiết chưa có / giới hạn implementation:** Đây là bản đồ Trái Đất hiện đại, không phải tái dựng lục địa cổ.

**Beat/tag bên trong (2):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B013 | 00:32.40 / 972 | +0.000 s | SB | (ngắt scene trong script) |
| B014 | 00:32.40 / 972 | +0.000 s | META | type=transformation, subtype=evolution-stages, from=Hellish Earth, to=Livable planet |

### Chapter 1 — FROM NOTHING

#### S06 · void · BEFORE EARTH

**Timecode:** 00:39.50–00:49.80 · **Frame:** [1185, 1494) · **Thời lượng:** 10.300 s.

**VO hiện tại:** To tell the story of Earth we have to begin before Earth, before time itself. 13 .8 billion years ago everything was packed into a point smaller than an atom.

**Component:** SpaceWorld

**Visual / vật thể:** Nguồn sáng rất nhỏ trong nền không gian tối; mật độ tập trung ở lõi.

**Motion đối tượng:** Bán kính nguồn tăng nhẹ theo thời gian; camera tiếp cận nguồn.

**Camera:** z = 11.5−0.55t; drift x = sin(0.2t)×0.55.

**Ánh sáng / môi trường / VFX:** Starfield, raymarch nguồn sáng, bloom và ACES.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Tên void không có nghĩa tất cả pixel đen; có lõi sáng và trường sao.

**Beat/tag bên trong (4):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B015 | 00:39.50 / 1185 | +0.000 s | SB | (ngắt scene trong script) |
| B016 | 00:39.50 / 1185 | +0.000 s | META | type=timeline, subtype=milestone, era=Universe origin, span=Before Earth |
| B017 | 00:45.37 / 1361 | +5.867 s | META | type=timeline, subtype=milestone, era=Big Bang, span=13.8B years ago |
| B018 | 00:45.37 / 1361 | +5.867 s | STAT | Thirteen point eight billion \| years ago |

#### S07 · bang · 13.8 BILLION YEARS AGO

**Timecode:** 00:49.80–01:04.33 · **Frame:** [1494, 1930) · **Thời lượng:** 14.533 s.

**VO hiện tại:** Then it expanded. The Big Bang, not an explosion like fireworks but space itself swelling faster than light. Three minutes later the first protons appeared, 380 ,000 years later there was light. 200 million years later

**Component:** SpaceWorld + CosmicBurst

**Visual / vật thể:** Nguồn cô đặc → flash → trường plasma giãn nở, filaments và cavities; 3,600 hạt hướng xuyên tâm.

**Motion đối tượng:** Cú bùng ở age 27 (0.9 s). Bán kính giãn nhanh rồi chậm; màu khí nguội dần từ nóng sang xanh. Flash overlay suy giảm trong vài frame.

**Camera:** Camera lùi từ z 10.8 về khoảng 14.1; impulse rung vị trí và roll bằng burstShake(age,27,.27), envelope decay 23 frame.

**Ánh sáng / môi trường / VFX:** Raymarch 72 bước, hạt additive, bloom HDR, ACES; không vẽ trường sao trong shot bang.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Là visual nghệ thuật cho giãn nở vũ trụ, không phải mô phỏng vật lý. Blast hình ảnh vẫn chạy dù SFX đã bị xóa.

**Event chính:** Big Bang expansion / camera impulse tại frame 1521 (00:50.70), tức +0.900 s trong shot.

**Beat/tag bên trong (7):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B019 | 00:51.20 / 1536 | +1.400 s | EM | Big Bang |
| B020 | 00:56.80 / 1704 | +7.000 s | SB | (ngắt scene trong script) |
| B021 | 00:56.80 / 1704 | +7.000 s | META | type=timeline, subtype=milestone, era=Early Universe milestones, span=First minutes to first stars |
| B022 | 00:56.80 / 1704 | +7.000 s | STAT | Three \| minutes |
| B023 | 00:58.20 / 1746 | +8.400 s | EM | protons |
| B024 | 01:01.00 / 1830 | +11.200 s | STAT | Three hundred and eighty thousand \| years |
| B025 | 01:03.17 / 1895 | +13.367 s | STAT | Two hundred million \| years |

#### S08 · star · THE FIRST STARS

**Timecode:** 01:04.33–01:09.80 · **Frame:** [1930, 2094) · **Thời lượng:** 5.467 s.

**VO hiện tại:** hydrogen gas gathered grew hotter and lit up. The first star switched on.

**Component:** PlanetStage

**Visual / vật thể:** Một cầu sao nóng với bề mặt plasma procedural và viền khí quyển.

**Motion đối tượng:** Cầu tự xoay .0025 rad/frame; noise plasma cập nhật theo age.

**Camera:** Orbit .032 rad/s, dolly vào tối đa 1.1 đơn vị; FOV 42°.

**Ánh sáng / môi trường / VFX:** Shader tự phát sáng màu cam/vàng và viền khí quyển.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Không có một sự kiện bật sáng riêng rõ ràng như CosmicBurst; chủ yếu đã là cầu sao phát sáng khi shot vào.

**Beat/tag bên trong (2):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B026 | 01:04.33 / 1930 | +0.000 s | EM | hydrogen gas |
| B027 | 01:07.77 / 2033 | +3.433 s | EM | first star |

#### S09 · elements · A COSMIC FURNACE

**Timecode:** 01:09.80–01:21.53 · **Frame:** [2094, 2446) · **Thời lượng:** 11.733 s.

**VO hiện tại:** Inside every star is a furnace, burning hydrogen into carbon, oxygen and eventually iron. The very carbon in your skin, the oxygen you are breathing, the bigger a star the sooner it dies,

**Component:** SpaceWorld (mode furnace)

**Visual / vật thể:** Lõi nóng bên trong sao, vỏ plasma nhiều lớp và vùng rỗng.

**Motion đối tượng:** Noise plasma tuần hoàn, mật độ và emission đổi theo age.

**Camera:** Camera drift ngang và tiến vào: z = 11.5−0.16t.

**Ánh sáng / môi trường / VFX:** Raymarch lớp plasma, lõi emission, bloom/ACES.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Shot mang kind elements nhưng không hiển thị ba thẻ Fe/Ca/Au; cũng chưa hiện riêng chuỗi chữ Hydrogen → Carbon → Oxygen → Iron.

**Beat/tag bên trong (7):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B028 | 01:09.80 / 2094 | +0.000 s | SB | (ngắt scene trong script) |
| B029 | 01:09.80 / 2094 | +0.000 s | META | type=flow, subtype=linear, steps=Hydrogen→Carbon→Oxygen→Iron, context=stellar nucleosynthesis |
| B030 | 01:12.10 / 2163 | +2.300 s | EM | hydrogen |
| B031 | 01:13.03 / 2191 | +3.233 s | EM | carbon |
| B032 | 01:13.87 / 2216 | +4.067 s | EM | oxygen |
| B033 | 01:15.07 / 2252 | +5.267 s | EM | iron |
| B034 | 01:19.27 / 2378 | +9.467 s | META | type=flow, subtype=causal, steps=Star collapse→Supernova→Element scattering |

#### S10 · supernova · A STAR DIES

**Timecode:** 01:21.53–01:35.07 · **Frame:** [2446, 2852) · **Thời lượng:** 13.533 s.

**VO hiện tại:** it collapses inward then explodes. A supernova? As bright as an entire galaxy, scattering gold, silver and uranium across the universe. The gold in a wedding ring was not born on Earth, it was born when

**Component:** SupernovaWorld + CosmicBurst

**Visual / vật thể:** Sao co sập rồi breakout; khí phóng ra bất đối xứng, filaments ion hóa, cavities và jets.

**Motion đối tượng:** Co lõi trong khoảng age 12–40; cú bùng ở age 40 (1.33 s); 3,600 hạt với vận tốc khác nhau; vỏ ejecta giãn và dư ảnh khí tồn tại sau flash.

**Camera:** Camera lùi từ z 10.6 về khoảng 12.8; rung vị trí/roll burstShake(age,40,.4), mạnh hơn Big Bang.

**Ánh sáng / môi trường / VFX:** Raymarch 64 bước, nóng cam/ion hóa xanh; bloom/ACES, starfield; flash toàn khung suy giảm.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Cấu trúc và vận tốc ejecta khác Big Bang. Là VFX được tác giả dựng, không phải mô phỏng thủy động lực sao.

**Event chính:** Supernova breakout / camera impulse tại frame 2486 (01:22.87), tức +1.333 s trong shot.

**Beat/tag bên trong (2):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B035 | 01:24.23 / 2527 | +2.700 s | EM | supernova |
| B036 | 01:31.10 / 2733 | +9.567 s | META | type=scenario, subtype=example, context=origin of gold in a wedding ring |

#### S11 · collision-stars · GOLD FROM COLLISION

**Timecode:** 01:35.07–01:37.33 · **Frame:** [2852, 2920) · **Thời lượng:** 2.267 s.

**VO hiện tại:** two stellar corpses collided.

**Component:** CompactStarCollision

**Visual / vật thể:** Hai sao compact nhỏ xoắn vào tâm chung, sau đó khí sáng phóng ra.

**Motion đối tượng:** Bán kính quỹ đạo 1.65×max(0,1−age/48); góc age×.115; raymarch ejecta xuất hiện từ age 44; hai cầu mất sau age 50.

**Camera:** Camera cố định (0,2.7,9), FOV 46°.

**Ánh sáng / môi trường / VFX:** Hai cầu emission HDR, starfield, bloom và ACES.

**Transition sang shot kế:** Chuyển chapter: wipe from-left, overlap 20 frame (0.667 s), bắt đầu tại frame 2920.

**Chi tiết chưa có / giới hạn implementation:** Shot chỉ dài khoảng 2.27 s; vàng/nhẫn không được thể hiện bằng vật thể riêng trong shot này.

**Beat/tag bên trong (1):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B037 | 01:35.47 / 2864 | +0.400 s | EM | stellar corpses |

### Chapter 2 — THE SUN CAME FIRST

#### S12 · cloud · 4.6 BILLION YEARS

**Timecode:** 01:37.33–01:53.40 · **Frame:** [2920, 3402) · **Thời lượng:** 16.067 s.

**VO hiện tại:** Fast forward to 4 .6 billion years ago, a cold cloud of stardust millions of times larger than the solar system was drifting through space. Then a nearby star exploded. Its shock wave arrived like an invisible hand crushing the cloud.

**Component:** SpaceWorld

**Visual / vật thể:** Đám mây khí lạnh có noise mật độ, vùng sáng/tối và độ sâu.

**Motion đối tượng:** Khí trôi chậm theo thời gian; camera tiến vào.

**Camera:** z = 11.5−0.16t và drift ngang.

**Ánh sáng / môi trường / VFX:** Màu nâu/xám tối, raymarch, starfield, bloom/ACES.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** META mô tả nearby explosion/shockwave nhưng shot cloud không có một blast/shockwave riêng; sự sập được gợi bằng cut sang disk.

**Beat/tag bên trong (6):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B038 | 01:37.33 / 2920 | +0.000 s | SB | (ngắt scene trong script) |
| B039 | 01:37.33 / 2920 | +0.000 s | META | type=timeline, subtype=milestone, era=Solar System formation, span=4.6B years ago |
| B040 | 01:39.37 / 2981 | +2.033 s | STAT | four point six billion \| years ago |
| B041 | 01:41.73 / 3052 | +4.400 s | EM | stardust |
| B042 | 01:42.23 / 3067 | +4.900 s | STAT | millions \| of times larger |
| B043 | 01:46.77 / 3203 | +9.433 s | META | type=flow, subtype=causal, steps=Nearby star explodes→Shock wave→Cloud collapses→Spins like whirlpool |

#### S13 · disk · GRAVITY BUILDS A STAR

**Timecode:** 01:53.40–02:00.80 · **Frame:** [3402, 3624) · **Thời lượng:** 7.400 s.

**VO hiện tại:** The cloud collapsed inward, spinning like a whirlpool. At its center the temperature reached 10 million degrees, and it lit up.

**Component:** PlanetStage

**Visual / vật thể:** Sao nóng ở tâm, bốn vòng quỹ đạo torus và 150 mảnh bụi/đá quanh nó.

**Motion đối tượng:** Mảnh chạy quỹ đạo với tốc độ phụ thuộc chỉ số; xoay riêng; cầu tâm tự xoay.

**Camera:** Orbit/dolly PlanetCamera, khoảng cách ban đầu 10.5, FOV 42°.

**Ánh sáng / môi trường / VFX:** Cầu plasma nóng, mảnh roughness .95, vòng mảnh opacity .18.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Vòng quỹ đạo có tính sơ đồ. kind disk không co bán kính như accretion và không có shader hình đĩa khí liên tục.

**Beat/tag bên trong (2):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B044 | 01:56.70 / 3501 | +3.300 s | META | type=timeline, subtype=milestone, era=Sun's birth, span=4.6B years ago |
| B045 | 01:58.67 / 3560 | +5.267 s | STAT | ten million \| degrees |

#### S14 · sun · THE SUN CAME FIRST

**Timecode:** 02:00.80–02:11.00 · **Frame:** [3624, 3930) · **Thời lượng:** 10.200 s.

**VO hiện tại:** The newborn sun. The first light in our solar system. There was no Earth yet, just a young sun in the middle surrounded by an enormous wildly spinning disk of dust.

**Component:** PlanetStage

**Visual / vật thể:** Mặt Trời non phát sáng, bề mặt plasma màu nóng.

**Motion đối tượng:** Tự xoay và biến đổi plasma; camera orbit/dolly.

**Camera:** Khoảng cách 8.7, FOV 42°, orbit .032 rad/s.

**Ánh sáng / môi trường / VFX:** Shader emission và viền khí quyển.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Không có ignition burst riêng ở đầu shot; sự xuất hiện thông qua dissolve.

**Beat/tag bên trong (4):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B046 | 02:00.97 / 3629 | +0.167 s | EM | newborn Sun |
| B047 | 02:04.47 / 3734 | +3.667 s | SB | (ngắt scene trong script) |
| B048 | 02:04.47 / 3734 | +3.667 s | META | type=hierarchy, subtype=stack, root=Sun, base=Disk of dust, context=Solar System formation |
| B049 | 02:09.73 / 3892 | +8.933 s | EM | disk of dust |

#### S15 · disk · THE PLANET FACTORY

**Timecode:** 02:11.00–02:18.90 · **Frame:** [3930, 4167) · **Thời lượng:** 7.900 s.

**VO hiện tại:** That disk was the construction site. Remember this, the sun came first. Earth was the child built from the leftover dust.

**Component:** PlanetStage

**Visual / vật thể:** Sao nóng ở tâm, bốn vòng quỹ đạo torus và 150 mảnh bụi/đá quanh nó.

**Motion đối tượng:** Mảnh chạy quỹ đạo với tốc độ phụ thuộc chỉ số; xoay riêng; cầu tâm tự xoay.

**Camera:** Orbit/dolly PlanetCamera, khoảng cách ban đầu 10.5, FOV 42°.

**Ánh sáng / môi trường / VFX:** Cầu plasma nóng, mảnh roughness .95, vòng mảnh opacity .18.

**Transition sang shot kế:** Chuyển chapter: fade, overlap 20 frame (0.667 s), bắt đầu tại frame 4167.

**Chi tiết chưa có / giới hạn implementation:** Vòng quỹ đạo có tính sơ đồ. kind disk không co bán kính như accretion và không có shader hình đĩa khí liên tục.

**Beat/tag bên trong (0):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| — | — | — | — | Không có tag anchor bên trong khoảng shot; VO vẫn có thể tiếp tục. |

### Chapter 3 — HELL AND THE MOON

#### S16 · accretion · DUST / ROCK / WORLD

**Timecode:** 02:18.90–02:34.90 · **Frame:** [4167, 4647) · **Thời lượng:** 16.000 s.

**VO hiện tại:** Inside that disk dust grains collided and stuck together. Dust became pebbles, pebbles became house -sized rocks, rocks became planetary embryos. Colliding and merging for 50 million years. The result? A glowing ball of hot rock.

**Component:** PlanetStage

**Visual / vật thể:** Cầu tâm nhỏ và 150 mảnh bụi/đá trong đĩa nghiêng.

**Motion đối tượng:** Mảnh quay, tự xoay; bán kính nhân collapse 1 → .72 trong 360 frame.

**Camera:** Orbit/dolly, khoảng cách 10.5, FOV 42°.

**Ánh sáng / môi trường / VFX:** Mảnh đá có shading; vòng quỹ đạo mảnh; cầu tâm mode magma.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Chưa có chuỗi kích thước riêng dust → pebble → house rock → embryo; tất cả dùng cùng nhóm mảnh.

**Beat/tag bên trong (3):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B050 | 02:18.90 / 4167 | +0.000 s | META | type=flow, subtype=linear, steps=Dust grains→Pebbles→Rocks→Planetary embryos, context=planetary accretion |
| B051 | 02:30.97 / 4529 | +12.067 s | STAT | fifty million \| years |
| B052 | 02:32.03 / 4561 | +13.133 s | META | type=timeline, subtype=milestone, era=Earth's birth, span=4.54B years ago |

#### S17 · lava · 4.54 BILLION YEARS

**Timecode:** 02:34.90–02:38.30 · **Frame:** [4647, 4749) · **Thời lượng:** 3.400 s.

**VO hiện tại:** The newborn Earth 4 .54 billion years ago,

**Component:** PlanetStage

**Visual / vật thể:** Trái Đất nóng với vỏ đá tối và khe magma phát sáng procedural.

**Motion đối tượng:** Cầu xoay, camera orbit/dolly; khe sáng chủ yếu gắn với bề mặt.

**Camera:** Khoảng cách 8.7, FOV 42°, orbit .032 rad/s.

**Ánh sáng / môi trường / VFX:** Ánh sáng một phía, viền cam, magma emission.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Trong shot THE LONG COOLING, kind lava chưa làm cooling tăng theo age; sự nguội rõ hơn chỉ ở shot crust.

**Beat/tag bên trong (2):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B053 | 02:35.00 / 4650 | +0.100 s | EM | newborn Earth |
| B054 | 02:37.10 / 4713 | +2.200 s | STAT | four point five four billion \| years ago |

#### S18 · meteors · 1,200 C / NO OCEANS

**Timecode:** 02:38.30–02:52.17 · **Frame:** [4749, 5165) · **Thời lượng:** 13.867 s.

**VO hiện tại:** this was hell. The surface was boiling magma at 1200 degrees Celsius. No water. No soil, a sky full of poisonous gases. Thousands of meteorites rained down every day. Then came the apocalypse.

**Component:** PlanetStage

**Visual / vật thể:** Trái Đất magma bị sáu thiên thạch rơi vào các điểm khác nhau.

**Motion đối tượng:** Mỗi thiên thạch bắt đầu lệch 58 frame; bay tới mặt cầu trong 38 frame, có đuôi bảy hạt; flash và vòng impact tại mặt cầu rồi tắt.

**Camera:** PlanetCamera orbit/dolly, khoảng cách 8.7.

**Ánh sáng / môi trường / VFX:** Thiên thạch emission cam, điểm va chạm và shock ring.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Sáu lần rơi được dựng bằng chu kỳ hữu hạn; khoảng cuối shot có thể chỉ còn hành tinh quay.

**Beat/tag bên trong (6):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B055 | 02:38.30 / 4749 | +0.000 s | SB | (ngắt scene trong script) |
| B056 | 02:38.30 / 4749 | +0.000 s | META | type=map, subtype=heat, region=Earth, subject=early hellish surface |
| B057 | 02:41.63 / 4849 | +3.333 s | STAT | twelve hundred \| degrees Celsius |
| B058 | 02:46.13 / 4984 | +7.833 s | E | poisonous gases |
| B059 | 02:47.10 / 5013 | +8.800 s | STAT | Thousands \| of meteorites |
| B060 | 02:50.23 / 5107 | +11.933 s | META | type=timeline, subtype=milestone, era=Theia impact, span=~4.5B years ago |

#### S19 · theia · THEIA APPROACHES

**Timecode:** 02:52.17–02:59.50 · **Frame:** [5165, 5385) · **Thời lượng:** 7.333 s.

**VO hiện tại:** A Mars -sized planet called Theia hurtled toward Earth at 40 ,000 kilometers per hour and struck it head on.

**Component:** PlanetStage + SVG labels

**Visual / vật thể:** Trái Đất nóng bên trái, Theia nhỏ hơn bên phải; nhãn EARLY EARTH và THEIA.

**Motion đối tượng:** Theia x = 4.1 → 1.78 trong 220 frame, Trái Đất/Theia tự xoay.

**Camera:** Orbit/dolly, khoảng cách 10.5, FOV 42°.

**Ánh sáng / môi trường / VFX:** Magma shader, directional shading, viền cam.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Khoảng cách/kích thước minh họa. Chữ THEIA là SVG overlay; không phải subject SVG.

**Beat/tag bên trong (2):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B061 | 02:53.70 / 5211 | +1.533 s | EM | Theia |
| B062 | 02:56.17 / 5285 | +4.000 s | STAT | forty thousand \| kilometers per hour |

#### S20 · collision · THE GREAT IMPACT

**Timecode:** 02:59.50–03:05.57 · **Frame:** [5385, 5567) · **Thời lượng:** 6.067 s.

**VO hiện tại:** The impact shattered Theia and blasted Earth's outer layers into space. It looked like the end.

**Component:** PlanetStage

**Visual / vật thể:** Theia chạm Trái Đất, cầu Theia thu nhỏ/mất, vỏ Trái Đất biến dạng và 75 mảnh nóng phóng ra.

**Motion đối tượng:** Theia tiến tới tâm trong 26 frame, thu bán kính sau frame 20; mảnh phóng từ frame 18; cầu biến dạng .08 rồi hồi; light flash.

**Camera:** PlanetCamera orbit/dolly; không có burstShake riêng cho Theia trong code hiện tại.

**Ánh sáng / môi trường / VFX:** Flash sphere và flash overlay; mảnh nguội emission 1.3 → .05.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Chưa có rung camera như hai burst Chapter 1. Sự phá vỡ hành tinh là biến dạng/thu cầu và mảnh procedural.

**Beat/tag bên trong (2):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B063 | 02:59.50 / 5385 | +0.000 s | SB | (ngắt scene trong script) |
| B064 | 02:59.50 / 5385 | +0.000 s | META | type=3d, subtype=explode, object=Earth and Theia, context=planetary collision |

#### S21 · debris · GRAVITY HOLDS THE PIECES

**Timecode:** 03:05.57–03:13.30 · **Frame:** [5567, 5799) · **Thời lượng:** 7.733 s.

**VO hiện tại:** But the debris did not escape. Gravity held it nearby. The fragments orbited, collided, stuck together. And in just a hundred years

**Component:** PlanetStage

**Visual / vật thể:** Trái Đất nóng với 120 mảnh đá trên vòng quỹ đạo.

**Motion đối tượng:** Mảnh quay quanh hành tinh và lerp tới một cụm Moon; aggregate 0 → 1 trong 250 frame.

**Camera:** Orbit/dolly, khoảng cách 10.5.

**Ánh sáng / môi trường / VFX:** Mảnh roughness .95, shading và viền hành tinh.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Shot kết thúc sau 232 frame, trước khi aggregate đạt 1; cut/dissolve sang Moon hoàn chỉnh.

**Beat/tag bên trong (3):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B065 | 03:05.57 / 5567 | +0.000 s | SB | (ngắt scene trong script) |
| B066 | 03:05.57 / 5567 | +0.000 s | META | type=flow, subtype=linear, steps=Debris orbits→Collides→Sticks together→Forms Moon, context=Moon's formation |
| B067 | 03:12.40 / 5772 | +6.833 s | STAT | a hundred \| years |

#### S22 · moon · 4.51 BILLION YEARS

**Timecode:** 03:13.30–03:22.37 · **Frame:** [5799, 6071) · **Thời lượng:** 9.067 s.

**VO hiện tại:** became the moon. The moon is a piece of Earth. Every time you gaze at it you are looking at the scar of the most terrifying accident in our planet's history.

**Component:** PlanetStage

**Visual / vật thể:** Trái Đất nóng và Mặt Trăng với texture riêng, bán kính .51 so với Earth 1.85.

**Motion đối tượng:** Moon chạy quỹ đạo với góc age×.008+.25; hai body tự xoay.

**Camera:** Orbit/dolly, khoảng cách 10.5.

**Ánh sáng / môi trường / VFX:** Shading texture Moon, Earth emission và viền cam.

**Transition sang shot kế:** Chuyển chapter: slide from-right, overlap 20 frame (0.667 s), bắt đầu tại frame 6071.

**Chi tiết chưa có / giới hạn implementation:** Moon xuất hiện đã hoàn chỉnh; không có mesh liên tục từ mảnh debris sang Moon.

**Beat/tag bên trong (3):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B068 | 03:14.00 / 5820 | +0.700 s | EM | Moon |
| B069 | 03:14.53 / 5836 | +1.233 s | META | type=metaphor, subtype=iceberg, visible=Moon, hidden=Scar of impact, context=Moon's origin |
| B070 | 03:18.87 / 5966 | +5.567 s | EM | scar |

### Chapter 4 — WATER FROM THE SKY

#### S23 · lava · THE LONG COOLING

**Timecode:** 03:22.37–03:32.43 · **Frame:** [6071, 6373) · **Thời lượng:** 10.067 s.

**VO hiện tại:** After the impact, Earth was a ball of fire. But it had two rescuers, the perfect distance from the sun and just enough size to hold on to water. Earth cooled.

**Component:** PlanetStage

**Visual / vật thể:** Trái Đất nóng với vỏ đá tối và khe magma phát sáng procedural.

**Motion đối tượng:** Cầu xoay, camera orbit/dolly; khe sáng chủ yếu gắn với bề mặt.

**Camera:** Khoảng cách 8.7, FOV 42°, orbit .032 rad/s.

**Ánh sáng / môi trường / VFX:** Ánh sáng một phía, viền cam, magma emission.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Trong shot THE LONG COOLING, kind lava chưa làm cooling tăng theo age; sự nguội rõ hơn chỉ ở shot crust.

**Beat/tag bên trong (3):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B071 | 03:22.37 / 6071 | +0.000 s | SB | (ngắt scene trong script) |
| B072 | 03:22.37 / 6071 | +0.000 s | META | type=tension, subtype=balance-scale, a=Distance from Sun, b=Earth's size, context=conditions for life |
| B073 | 03:31.10 / 6333 | +8.733 s | META | type=flow, subtype=linear, steps=Earth cools→Magma hardens→Volcanoes erupt→First atmosphere |

#### S24 · crust · THE FIRST CRUST

**Timecode:** 03:32.43–03:34.87 · **Frame:** [6373, 6446) · **Thời lượng:** 2.433 s.

**VO hiện tại:** Magma hardened into a rocky crust.

**Component:** PlanetStage

**Visual / vật thể:** Cầu đá/magma đang nguội, khe sáng dần giảm.

**Motion đối tượng:** Cooling .35 → .96 trong 220 frame; cầu và camera vẫn chuyển động.

**Camera:** Orbit/dolly, khoảng cách 8.7.

**Ánh sáng / môi trường / VFX:** Shader khe magma giảm emission theo cooling.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Shot dài 73 frame nên cooling chưa đạt .96 trước khi chuyển sang volcano.

**Beat/tag bên trong (1):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B074 | 03:33.57 / 6407 | +1.133 s | EM | rocky crust |

#### S25 · volcano · VAPOR BECOMES SKY

**Timecode:** 03:34.87–03:41.70 · **Frame:** [6446, 6651) · **Thời lượng:** 6.833 s.

**VO hiện tại:** Volcanoes erupted furiously releasing water vapor and building the first atmosphere. The vapor rose into clouds.

**Component:** VolcanoWorld

**Visual / vật thể:** Địa hình núi lửa basalt có miệng lõm, hồ lava, ba dòng lava theo sườn, fountain và cột khói.

**Motion đối tượng:** Lava shader chảy theo UV/time; 950 hạt fountain đi theo quỹ đạo; mật độ khói advect liên tục.

**Camera:** Camera (16,13,22) → (14,12,20) trong 500 frame, nhìn (0,7,-7); FOV 44°.

**Ánh sáng / môi trường / VFX:** Basalt procedural, lava emission, khói raymarch 40 bước, nền và fog xám.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Hai shot volcano dùng lại cùng component/địa hình; scene Siberia không có setup riêng về quy mô, tuổi hay hướng phun.

**Beat/tag bên trong (2):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B075 | 03:38.57 / 6557 | +3.700 s | EM | first atmosphere |
| B076 | 03:39.90 / 6597 | +5.033 s | META | type=flow, subtype=linear, steps=Vapor→Clouds→Rain→Comets add water, context=formation of oceans |

#### S26 · rain · THOUSANDS OF YEARS OF RAIN

**Timecode:** 03:41.70–03:52.90 · **Frame:** [6651, 6987) · **Thời lượng:** 11.200 s.

**VO hiện tại:** Then came rain, rain that lasted, not a few days but thousands of years. Millions of icy comets crashed down bringing even more water. Water filled every low place.

**Component:** NaturalWorld

**Visual / vật thể:** Mặt nước gợn sóng trước địa hình đá, 650 vệt mưa ba chiều.

**Motion đối tượng:** Mưa rơi age×.32; sóng analytic và glint chuyển động; motes trôi.

**Camera:** Dolly/side move, từ khoảng (3,4.5,11) vào gần, nhìn (0,.7,-5).

**Ánh sáng / môi trường / VFX:** Sương, light một phía và fill, shader nước Fresnel/specular/foam.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Chưa dựng một event sao chổi băng rơi xuống trong shot rain/ocean.

**Beat/tag bên trong (3):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B077 | 03:45.47 / 6764 | +3.767 s | STAT | thousands \| of years |
| B078 | 03:46.80 / 6804 | +5.100 s | STAT | Millions \| of icy comets |
| B079 | 03:50.63 / 6919 | +8.933 s | META | type=transformation, subtype=state-machine, from=Red inferno, to=Blue planet, context=Earth's surface change |

#### S27 · ocean · 4.4 BILLION YEARS / OCEANS

**Timecode:** 03:52.90–03:59.90 · **Frame:** [6987, 7197) · **Thời lượng:** 7.000 s.

**VO hiện tại:** Magma basins became oceans. The Red Inferno became a blue planet. The evidence is in Australia.

**Component:** NaturalWorld

**Visual / vật thể:** Mặt nước lớn với địa hình và đá.

**Motion đối tượng:** Hai thành phần sóng analytic, phản quang/foam và hạt môi trường; camera dolly.

**Camera:** Camera water cùng rain, FOV 42°.

**Ánh sáng / môi trường / VFX:** Shader Fresnel, glint và foam; fog và key/fill light.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Không phải ocean FFT hoặc tái dựng đại dương cổ có dữ liệu địa lý.

**Beat/tag bên trong (1):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B080 | 03:58.00 / 7140 | +5.100 s | META | type=scenario, subtype=case-study, context=zircon crystals as evidence for early water |

#### S28 · zircon · WATER LEAVES EVIDENCE

**Timecode:** 03:59.90–04:15.70 · **Frame:** [7197, 7671) · **Thời lượng:** 15.800 s.

**VO hiện tại:** Zircon crystals 4 .4 billion years old formed in the presence of water. Just 150 million years after its birth, Earth already had seas. This was the first great turning point. With water, everything became possible. 3 .8

**Component:** NaturalWorld

**Visual / vật thể:** Tinh thể dạng octahedron kéo dài đứng trên nền đá.

**Motion đối tượng:** Xoay age×.006; camera tiến nhẹ.

**Camera:** Từ (3,2.2,7) dolly vào, nhìn (0,1.4,0).

**Ánh sáng / môi trường / VFX:** MeshPhysicalMaterial: transmission .45, IOR 1.92, roughness .07, clearcoat.

**Transition sang shot kế:** Chuyển chapter: fade, overlap 20 frame (0.667 s), bắt đầu tại frame 7671.

**Chi tiết chưa có / giới hạn implementation:** Hình tinh thể là đại diện minh họa, không phải dữ liệu quét mẫu zircon.

**Beat/tag bên trong (5):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B081 | 03:59.90 / 7197 | +0.000 s | EM | zircon crystals |
| B082 | 04:02.10 / 7263 | +2.200 s | STAT | four point four billion \| years old |
| B083 | 04:06.17 / 7385 | +6.267 s | STAT | a hundred and fifty million \| years |
| B084 | 04:09.80 / 7494 | +9.900 s | META | type=icon, subtype=single, symbols=[water drop], context=water as catalyst for life |
| B085 | 04:10.57 / 7517 | +10.667 s | EM | first great turning point |

### Chapter 5 — SLIME REWRITES THE SKY

#### S29 · vents · THE OCEAN FLOOR

**Timecode:** 04:15.70–04:22.07 · **Frame:** [7671, 7862) · **Thời lượng:** 6.367 s.

**VO hiện tại:** billion years ago on the ocean floor, underwater volcanoes vented hot water rich in chemicals.

**Component:** NaturalWorld

**Visual / vật thể:** Bốn ống phun thủy nhiệt trên đáy biển, có miệng torus và plume khói đen.

**Motion đối tượng:** Mỗi plume có 22 thể tích sphere giãn/nổi lên; motes và camera trôi.

**Camera:** Dolly/side move NaturalCamera; FOV 42°.

**Ánh sáng / môi trường / VFX:** Sương dưới nước, light teal, light shafts mờ và đá procedural.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Plume vent là cụm sphere trong suốt, không dùng khói volumetric như volcano.

**Beat/tag bên trong (3):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B086 | 04:15.70 / 7671 | +0.000 s | SB | (ngắt scene trong script) |
| B087 | 04:15.70 / 7671 | +0.000 s | META | type=timeline, subtype=milestone, era=First life, span=3.8B years ago |
| B088 | 04:15.70 / 7671 | +0.000 s | STAT | Three point eight billion \| years ago |

#### S30 · cells · LIFE COPIES ITSELF

**Timecode:** 04:22.07–04:33.80 · **Frame:** [7862, 8214) · **Thời lượng:** 11.733 s.

**VO hiện tại:** A tiny fatty membrane folded around itself trapped chemicals inside and learned to copy itself. The first life, just bacteria, for a billion years Earth had nothing but these little things,

**Component:** NaturalWorld

**Visual / vật thể:** Sáu tế bào có màng trong suốt, chuỗi bên trong, 18 hạt nội bào mỗi tế bào và roi.

**Motion đối tượng:** Màng wobble, cả tế bào xoay, roi lắc; division loop 300 frame tách hai nhóm rồi reset.

**Camera:** Dolly/side move micro camera, nhìn (0,1.8,0).

**Ánh sáng / môi trường / VFX:** Màng shader theo Fresnel, light dưới nước, shafts và motes.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Cả shot LIFE COPIES ITSELF và CELLS BECOME COMPLEX dùng cùng kiểu tế bào. Chưa có nhân/eukaryote riêng hay sinh sản hữu tính riêng.

**Beat/tag bên trong (4):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B089 | 04:22.23 / 7867 | +0.167 s | EM | tiny fatty membrane |
| B090 | 04:28.37 / 8051 | +6.300 s | EM | first life |
| B091 | 04:29.47 / 8084 | +7.400 s | EM | bacteria |
| B092 | 04:30.60 / 8118 | +8.533 s | STAT | a billion \| years |

#### S31 · slime · A BILLION YEARS OF MICROBES

**Timecode:** 04:33.80–04:38.60 · **Frame:** [8214, 8358) · **Thời lượng:** 4.800 s.

**VO hiện tại:** blue water, green, slimy rocks. Then one branch learned a magic trick,

**Component:** NaturalWorld

**Visual / vật thể:** 18 tế bào bám thấp gần mặt đá, thành thảm vi sinh.

**Motion đối tượng:** Màng wobble, tế bào xoay và roi lắc; không chạy division trong kind slime.

**Camera:** Micro camera dolly/side move.

**Ánh sáng / môi trường / VFX:** Môi trường dưới nước, sương teal, ánh sáng xuyên nước.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Dùng nhiều cell đặt gần nền; chưa có lớp biofilm liên tục phủ bề mặt đá.

**Beat/tag bên trong (2):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B093 | 04:36.50 / 8295 | +2.700 s | SB | (ngắt scene trong script) |
| B094 | 04:36.50 / 8295 | +2.700 s | META | type=flow, subtype=linear, steps=Carbon dioxide in→Oxygen out, context=photosynthesis |

#### S32 · oxygen · SUNLIGHT BECOMES ENERGY

**Timecode:** 04:38.60–04:44.53 · **Frame:** [8358, 8536) · **Thời lượng:** 5.933 s.

**VO hiện tại:** photosynthesis, taking in carbon dioxide and releasing oxygen. Back then,

**Component:** NaturalWorld

**Visual / vật thể:** Sáu tế bào và 32 bóng oxy nổi lên.

**Motion đối tượng:** Bóng nổi bằng chu kỳ age×.027, màng/roi tiếp tục chuyển động.

**Camera:** Micro camera dolly/side move; tuổi motion được nối qua hai shot oxygen liền nhau.

**Ánh sáng / môi trường / VFX:** Môi trường vẫn dưới nước; bubble vật liệu clearcoat trong suốt.

**Transition sang shot kế:** Giữ world và motionAge liên tục, đổi title/shot marker.

**Chi tiết chưa có / giới hạn implementation:** Không chuyển lên bầu trời xanh hoặc có tầng ozone riêng. Shot thứ hai đổi title nhưng giữ cùng world và motionAge.

**Beat/tag bên trong (2):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B095 | 04:38.60 / 8358 | +0.000 s | EM | photosynthesis |
| B096 | 04:43.67 / 8510 | +5.067 s | META | type=tension, subtype=trade-off, a=Oxygen as poison, b=Oxygen creating ozone, context=Great Oxidation Event |

#### S33 · oxygen · 2.4 BILLION YEARS / OXYGEN

**Timecode:** 04:44.53–05:04.40 · **Frame:** [8536, 9132) · **Thời lượng:** 19.867 s.

**VO hiện tại:** oxygen was poison. It killed almost all the older life. This was the first pollution crisis. The Great Oxidation Event 2 .4 billion years ago. But that same oxygen created the ozone layer, made the sky blue and allowed energy -hungry life to evolve later. The tiniest creatures rewrote the entire sky.

**Component:** NaturalWorld

**Visual / vật thể:** Sáu tế bào và 32 bóng oxy nổi lên.

**Motion đối tượng:** Bóng nổi bằng chu kỳ age×.027, màng/roi tiếp tục chuyển động.

**Camera:** Micro camera dolly/side move; tuổi motion được nối qua hai shot oxygen liền nhau.

**Ánh sáng / môi trường / VFX:** Môi trường vẫn dưới nước; bubble vật liệu clearcoat trong suốt.

**Transition sang shot kế:** Chuyển chapter: wipe from-bottom, overlap 20 frame (0.667 s), bắt đầu tại frame 9132.

**Chi tiết chưa có / giới hạn implementation:** Không chuyển lên bầu trời xanh hoặc có tầng ozone riêng. Shot thứ hai đổi title nhưng giữ cùng world và motionAge.

**Beat/tag bên trong (7):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B097 | 04:45.13 / 8554 | +0.600 s | E | poison |
| B098 | 04:45.93 / 8578 | +1.400 s | E | killed |
| B099 | 04:48.80 / 8664 | +4.267 s | EM | first pollution crisis |
| B100 | 04:50.60 / 8718 | +6.067 s | EM | Great Oxidation Event |
| B101 | 04:53.03 / 8791 | +8.500 s | STAT | two point four billion \| years ago |
| B102 | 04:56.57 / 8897 | +12.033 s | EM | ozone layer |
| B103 | 05:01.63 / 9049 | +17.100 s | META | type=metaphor, subtype=abstract, subject=microbes, context=reshaping Earth's atmosphere |

### Chapter 6 — FROZEN THEN ALIVE

#### S34 · cells · CELLS BECOME COMPLEX

**Timecode:** 05:04.40–05:15.20 · **Frame:** [9132, 9456) · **Thời lượng:** 10.800 s.

**VO hiện tại:** Cells with nuclei appeared, then multicellular organisms, then sexual reproduction. And Earth nearly died a second time. 720 million years ago

**Component:** NaturalWorld

**Visual / vật thể:** Sáu tế bào có màng trong suốt, chuỗi bên trong, 18 hạt nội bào mỗi tế bào và roi.

**Motion đối tượng:** Màng wobble, cả tế bào xoay, roi lắc; division loop 300 frame tách hai nhóm rồi reset.

**Camera:** Dolly/side move micro camera, nhìn (0,1.8,0).

**Ánh sáng / môi trường / VFX:** Màng shader theo Fresnel, light dưới nước, shafts và motes.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Cả shot LIFE COPIES ITSELF và CELLS BECOME COMPLEX dùng cùng kiểu tế bào. Chưa có nhân/eukaryote riêng hay sinh sản hữu tính riêng.

**Beat/tag bên trong (6):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B104 | 05:04.40 / 9132 | +0.000 s | META | type=progress, subtype=steps, steps=[Cells with nuclei,Multicellular organisms,Sexual reproduction], context=evolution of life forms |
| B105 | 05:04.40 / 9132 | +0.000 s | EM | Cells with nuclei |
| B106 | 05:07.20 / 9216 | +2.800 s | EM | multicellular organisms |
| B107 | 05:09.27 / 9278 | +4.867 s | EM | sexual reproduction |
| B108 | 05:11.27 / 9338 | +6.867 s | E | nearly died |
| B109 | 05:14.00 / 9420 | +9.600 s | STAT | Seven hundred and twenty million \| years ago |

#### S35 · snowball · 720 MILLION / SNOWBALL EARTH

**Timecode:** 05:15.20–05:21.97 · **Frame:** [9456, 9659) · **Thời lượng:** 6.767 s.

**VO hiện tại:** it froze into a completely white snowball, ice a kilometer thick. Minus 50 degrees Celsius, but

**Component:** PlanetStage

**Visual / vật thể:** Cầu Trái Đất phủ băng trắng/xanh, cloud shell nhạt.

**Motion đối tượng:** Cầu/mây xoay, camera orbit/dolly.

**Camera:** Khoảng cách 8.7, FOV 42°.

**Ánh sáng / môi trường / VFX:** Ice shader procedural, directional shading và rim khí quyển.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Không có bão tuyết hoặc nhiệt kế −50°C riêng.

**Beat/tag bên trong (5):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B110 | 05:17.10 / 9513 | +1.900 s | EM | snowball |
| B111 | 05:18.40 / 9552 | +3.200 s | STAT | kilometer \| thick |
| B112 | 05:19.73 / 9592 | +4.533 s | STAT | Minus fifty \| degrees Celsius |
| B113 | 05:21.80 / 9654 | +6.600 s | SB | (ngắt scene trong script) |
| B114 | 05:21.80 / 9654 | +6.600 s | META | type=cycle-feedback, subtype=balancing-loop, steps=Volcanoes erupt→CO2 buildup→Greenhouse effect→Ice melts→CO2 absorbed→Cooling, context=ending Snowball Earth |

#### S36 · thaw · VOLCANOES BREAK THE FREEZE

**Timecode:** 05:21.97–05:34.80 · **Frame:** [9659, 10044) · **Thời lượng:** 12.833 s.

**VO hiện tại:** volcanoes under the ice kept erupting. Carbon dioxide built up creating a powerful greenhouse effect that melted the ice. Meltwater carried minerals into the sea, a buffet for life. Then came the

**Component:** PlanetStage

**Visual / vật thể:** Cầu phủ băng chuyển dần về màu biển và đất.

**Motion đối tượng:** Cooling 0 → 1 trong 350 frame làm ice blend sang ancient terrain; cầu/mây xoay.

**Camera:** PlanetCamera orbit/dolly.

**Ánh sáng / môi trường / VFX:** Shader đổi chất liệu băng/đất, shading một phía.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Không còn vệt fracture SVG. Nhưng cũng chưa dựng núi lửa xuyên băng, vết nứt hình học hoặc nước tan riêng; nội dung VOLCANOES BREAK THE FREEZE chủ yếu là blend shader.

**Beat/tag bên trong (4):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B115 | 05:24.60 / 9738 | +2.633 s | EM | Carbon dioxide |
| B116 | 05:27.50 / 9825 | +5.533 s | EM | greenhouse effect |
| B117 | 05:34.23 / 10027 | +12.267 s | SB | (ngắt scene trong script) |
| B118 | 05:34.23 / 10027 | +12.267 s | META | type=timeline, subtype=milestone, era=Cambrian Explosion, span=541M years ago |

#### S37 · cambrian · 541 MILLION / LIFE EXPLODES

**Timecode:** 05:34.80–05:49.07 · **Frame:** [10044, 10472) · **Thời lượng:** 14.267 s.

**VO hiện tại:** Cambrian Explosion 541 million years ago. In 20 million years, eyes appeared. Jointed legs, claws, hard shells, the ocean went from a stagnant pond to an arena of monsters. 470

**Component:** NaturalWorld

**Visual / vật thể:** Ba sinh vật đại diện Cambri, có mắt, nhiều appendage và đôi phần phụ cong.

**Motion đối tượng:** Bơi trôi nhẹ, body roll; 11 appendage mỗi bên đập lệch phase; motes nước chuyển động.

**Camera:** Camera side move/dolly, nhìn (0,2,0), FOV 42°.

**Ánh sáng / môi trường / VFX:** Môi trường dưới nước, fog/shafts và light teal.

**Transition sang shot kế:** Chuyển chapter: fade, overlap 20 frame (0.667 s), bắt đầu tại frame 10472.

**Chi tiết chưa có / giới hạn implementation:** Chỉ ba mẫu sinh vật cùng kiểu loft; không phải hệ sinh thái đa loài hoặc tương tác săn mồi.

**Beat/tag bên trong (4):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B119 | 05:34.80 / 10044 | +0.000 s | EM | Cambrian Explosion |
| B120 | 05:37.47 / 10124 | +2.667 s | STAT | five hundred and forty-one million \| years ago |
| B121 | 05:39.47 / 10184 | +4.667 s | STAT | twenty million \| years |
| B122 | 05:44.10 / 10323 | +9.300 s | META | type=transformation, subtype=state-machine, from=Stagnant pond, to=Arena of monsters, context=Cambrian life |

### Chapter 7 — LAND AND THE GREAT DYING

#### S38 · plants · LIFE REACHES LAND

**Timecode:** 05:49.07–05:57.37 · **Frame:** [10472, 10721) · **Thời lượng:** 8.300 s.

**VO hiện tại:** million years ago the first plants crept onto land, barely as tall as a finger. 390 million years later they had become

**Component:** NaturalWorld

**Visual / vật thể:** Dương xỉ nổi bật giữa nền đá và cây/fern xung quanh.

**Motion đối tượng:** Dương xỉ và cây sway theo sin; camera tiến/đổi góc.

**Camera:** NaturalCamera default dolly/side move, nhìn (0,1.7,0).

**Ánh sáng / môi trường / VFX:** Địa hình, đá, sương, key/fill và shadow.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Hình dương xỉ là đại diện, không phải tái dựng thực vật nhỏ đầu tiên theo hóa thạch.

**Beat/tag bên trong (4):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B123 | 05:49.07 / 10472 | +0.000 s | META | type=timeline, subtype=milestone, era=Colonization of land, span=470M years ago |
| B124 | 05:49.07 / 10472 | +0.000 s | STAT | Four hundred and seventy million \| years ago |
| B125 | 05:50.30 / 10509 | +1.233 s | EM | first plants |
| B126 | 05:55.57 / 10667 | +6.500 s | STAT | Three hundred and ninety million \| years |

#### S39 · forest · THE LAND TURNS GREEN

**Timecode:** 05:57.37–05:59.30 · **Frame:** [10721, 10779) · **Thời lượng:** 1.933 s.

**VO hiện tại:** enormous forests.

**Component:** NaturalWorld

**Visual / vật thể:** Rừng procedural: 22 cây và 24 fern, nền địa hình/đá.

**Motion đối tượng:** Cây và fern sway, hạt môi trường trôi, camera dolly.

**Camera:** NaturalCamera default; FOV 42°.

**Ánh sáng / môi trường / VFX:** Fog, shadow, ánh sáng ban ngày.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Cùng forest được dùng cho rừng cổ và rừng hồi sinh; chưa có mọc lại/growth morph riêng.

**Beat/tag bên trong (0):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| — | — | — | — | Không có tag anchor bên trong khoảng shot; VO vẫn có thể tiếp tục. |

#### S40 · fish · FINS BECOME FEET

**Timecode:** 05:59.30–06:08.03 · **Frame:** [10779, 11041) · **Thời lượng:** 8.733 s.

**VO hiện tại:** Lobe -finned fish crawled ashore and became four -legged animals, your walking ancestors. 300 million years ago the continents joined into the

**Component:** NaturalWorld

**Visual / vật thể:** Sinh vật cá vây thịt trên nền rừng, bốn phần phụ/vây bên, mắt và đuôi.

**Motion đối tượng:** Appendage đập, đuôi lắc, body roll; camera dịch chuyển.

**Camera:** NaturalCamera default dolly/side move.

**Ánh sáng / môi trường / VFX:** Vật liệu skin procedural, địa hình/rừng/shadow.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Không có root translation bò từ biển lên bờ hay morph cá → tetrapod trong code; visual dùng cá đặt trên cạn có vây chuyển động.

**Beat/tag bên trong (5):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B127 | 05:59.83 / 10795 | +0.533 s | META | type=transformation, subtype=evolution-stages, stages=[Lobe-finned fish,Four-legged animals], context=transition to land |
| B128 | 05:59.83 / 10795 | +0.533 s | EM | Lobe-finned fish |
| B129 | 06:02.30 / 10869 | +3.000 s | EM | four-legged animals |
| B130 | 06:05.20 / 10956 | +5.900 s | META | type=timeline, subtype=milestone, era=Pangea formation, span=300M years ago |
| B131 | 06:05.20 / 10956 | +5.900 s | STAT | Three hundred million \| years ago |

#### S41 · pangea · ONE SUPERCONTINENT

**Timecode:** 06:08.03–06:14.73 · **Frame:** [11041, 11242) · **Thời lượng:** 6.700 s.

**VO hiện tại:** supercontinent Pangea. Then came the greatest catastrophe. 252 million years ago

**Component:** PlanetStage

**Visual / vật thể:** Cầu biển xanh với một siêu lục địa procedural, coast và ridges.

**Motion đối tượng:** Hành tinh xoay và camera orbit/dolly.

**Camera:** Khoảng cách 8.7, FOV 42°.

**Ánh sáng / môi trường / VFX:** Shader đất/biển procedural có shading, màu theo vĩ độ và ridge.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Đã bỏ subject SVG. Hình Pangea là công thức hình học minh họa, không dựa trên bản đồ cổ địa lý được xác thực.

**Beat/tag bên trong (5):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B132 | 06:08.03 / 11041 | +0.000 s | EM | supercontinent Pangea |
| B133 | 06:09.67 / 11090 | +1.633 s | SB | (ngắt scene trong script) |
| B134 | 06:09.67 / 11090 | +1.633 s | META | type=timeline, subtype=milestone, era=Permian Extinction event, span=252M years ago |
| B135 | 06:10.57 / 11117 | +2.533 s | E | greatest catastrophe |
| B136 | 06:13.70 / 11211 | +5.667 s | STAT | Two hundred and fifty-two million \| years ago |

#### S42 · volcano · 252 MILLION / THE GREAT DYING

**Timecode:** 06:14.73–06:27.13 · **Frame:** [11242, 11614) · **Thời lượng:** 12.400 s.

**VO hiện tại:** volcanoes in Siberia erupted for a million years. Lava covered 7 million square kilometers, the ocean turned sour as vinegar. Temperatures rose by 10 degrees. 90 %

**Component:** VolcanoWorld

**Visual / vật thể:** Địa hình núi lửa basalt có miệng lõm, hồ lava, ba dòng lava theo sườn, fountain và cột khói.

**Motion đối tượng:** Lava shader chảy theo UV/time; 950 hạt fountain đi theo quỹ đạo; mật độ khói advect liên tục.

**Camera:** Camera (16,13,22) → (14,12,20) trong 500 frame, nhìn (0,7,-7); FOV 44°.

**Ánh sáng / môi trường / VFX:** Basalt procedural, lava emission, khói raymarch 40 bước, nền và fog xám.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Hai shot volcano dùng lại cùng component/địa hình; scene Siberia không có setup riêng về quy mô, tuổi hay hướng phun.

**Beat/tag bên trong (4):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B137 | 06:14.73 / 11242 | +0.000 s | EM | volcanoes in Siberia |
| B138 | 06:17.00 / 11310 | +2.267 s | STAT | a million \| years |
| B139 | 06:19.57 / 11387 | +4.833 s | STAT | seven million \| square kilometers |
| B140 | 06:25.10 / 11553 | +10.367 s | STAT | ten \| degrees |

#### S43 · extinction · 90% OF MARINE SPECIES LOST

**Timecode:** 06:27.13–06:38.70 · **Frame:** [11614, 11961) · **Thời lượng:** 11.567 s.

**VO hiện tại:** of marine species and 70 % of land species vanished. The Permian Mass extinction. It looked like a complete reset, but the 10 % that survived became an opportunity.

**Component:** Worlds SVG active branch

**Visual / vật thể:** Biểu đồ 100 chấm: 90 chấm đỏ và 10 chấm xanh, với đường gạch ngang.

**Motion đối tượng:** 90 chấm lần lượt mờ/thu nhỏ theo i×2.2 frame; nhóm trôi và scale nhẹ; chấm sống pulse.

**Camera:** Không có camera 3D; chuyển động là transform SVG.

**Ánh sáng / môi trường / VFX:** Overlay phẳng; giữ title và shell chapter.

**Transition sang shot kế:** Chuyển chapter: wipe from-right, overlap 20 frame (0.667 s), bắt đầu tại frame 11961.

**Chi tiết chưa có / giới hạn implementation:** Đây là subject 2D SVG còn thực sự chạy. Không phải cảnh sinh vật biển chết trong môi trường 3D.

**Beat/tag bên trong (6):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B141 | 06:27.13 / 11614 | +0.000 s | META | type=funnel-analysis, subtype=elimination, steps=[90% marine species,70% land species], data=Permian extinction survival |
| B142 | 06:27.13 / 11614 | +0.000 s | STAT | Ninety \| percent |
| B143 | 06:29.27 / 11678 | +2.133 s | STAT | seventy \| percent |
| B144 | 06:30.17 / 11705 | +3.033 s | E | vanished |
| B145 | 06:31.33 / 11740 | +4.200 s | EM | Permian mass extinction |
| B146 | 06:35.90 / 11877 | +8.767 s | STAT | ten \| percent |

### Chapter 8 — THE DINOSAURS LAST DAY

#### S44 · dinosaur · 230 MILLION / DINOSAURS

**Timecode:** 06:38.70–06:53.80 · **Frame:** [11961, 12414) · **Thời lượng:** 15.100 s.

**VO hiện tại:** After the extinction, one branch of reptiles rose to power, the dinosaurs. They appeared 230 million years ago, growing into giants like the 9 -ton Tyrannosaurus They ruled for 165 million years.

**Component:** NaturalWorld

**Visual / vật thể:** Theropod procedural có thân loft, đầu/jaw, răng, mắt, chân/tay và đuôi trong rừng.

**Motion đối tượng:** Rig các bộ phận theo age, đầu/jaw và nhịp body chuyển động; camera dolly đổi góc.

**Camera:** Camera từ (6,3.7,11.8) tiến/side move, nhìn (-.15,1.8,0).

**Ánh sáng / môi trường / VFX:** Skin procedural, rừng, shadow/fog.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Sinh vật đại diện nhóm khủng long; không chứng minh T. rex tồn tại 230 triệu năm trước.

**Beat/tag bên trong (6):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B147 | 06:38.70 / 11961 | +0.000 s | SB | (ngắt scene trong script) |
| B148 | 06:38.70 / 11961 | +0.000 s | META | type=timeline, subtype=era, era=Age of Dinosaurs, span=230M years ago to 66M years ago |
| B149 | 06:42.67 / 12080 | +3.967 s | EM | dinosaurs |
| B150 | 06:45.17 / 12155 | +6.467 s | STAT | two hundred and thirty million \| years ago |
| B151 | 06:48.60 / 12258 | +9.900 s | STAT | nine-ton \| Tyrannosaurus rex |
| B152 | 06:52.67 / 12380 | +13.967 s | STAT | a hundred and sixty-five million \| years |

#### S45 · mammal · SMALL CREATURES WAIT

**Timecode:** 06:53.80–06:59.00 · **Frame:** [12414, 12570) · **Thời lượng:** 5.200 s.

**VO hiện tại:** Mammals were just little mouse -like creatures hiding in the night. 66 million years ago

**Component:** NaturalWorld

**Visual / vật thể:** Động vật có vú nhỏ kiểu gặm nhấm: thân loft, tai/mắt/mõm, đuôi, chân và râu trong rừng tối.

**Motion đối tượng:** Đuôi lắc và chân dao động nhỏ; camera tiến nhẹ.

**Camera:** Camera thấp khoảng (3.6,1.7,6.2), nhìn (0,.65,0).

**Ánh sáng / môi trường / VFX:** Môi trường rừng đêm, fur texture procedural, light lạnh.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Hai shot SMALL CREATURES WAIT và THE SURVIVORS dùng cùng model/set; không có animation đào hang/ăn riêng.

**Beat/tag bên trong (4):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B153 | 06:53.80 / 12414 | +0.000 s | META | type=comparison, subtype=split, a=Dinosaurs, b=Mammals, context=post-Permian life |
| B154 | 06:53.80 / 12414 | +0.000 s | EM | Mammals |
| B155 | 06:57.80 / 12534 | +4.000 s | META | type=timeline, subtype=milestone, era=Dinosaur extinction event, span=66M years ago |
| B156 | 06:57.80 / 12534 | +4.000 s | STAT | Sixty-six million \| years ago |

#### S46 · asteroid · 66 MILLION / INCOMING

**Timecode:** 06:59.00–07:06.73 · **Frame:** [12570, 12802) · **Thời lượng:** 7.733 s.

**VO hiện tại:** a rock 10 kilometers wide raced toward Earth at 70 ,000 kilometers per hour. 20 times the speed of a bullet.

**Component:** AsteroidWorld

**Visual / vật thể:** Trái Đất ở dưới-trái; asteroid đá bất quy tắc nhỏ từ xa tới điểm va chạm, có wake phát sáng.

**Motion đối tượng:** Vị trí (9,7,-24) lerp về surface hit với progress=(age/232)^2; rock xoay .002/.003 rad/frame; wake shader flow.

**Camera:** Camera tiến nhẹ theo tổng thời gian: x=t×.025, z=9−t×.07; nhìn (0,0,-4).

**Ánh sáng / môi trường / VFX:** Starfield 500 điểm, Earth daymap, ánh sáng và rock nóng/wake additive.

**Transition sang shot kế:** Cut trực tiếp sang impact; không dissolve 20 frame ở đầu impact.

**Chi tiết chưa có / giới hạn implementation:** Asteroid scale .24; khoảng cách minh họa. Điểm chạm được chuyển sang shot impact kế tiếp, không có rung camera ở asteroid path.

**Beat/tag bên trong (3):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B157 | 06:59.80 / 12594 | +0.800 s | STAT | ten \| kilometers |
| B158 | 07:02.97 / 12689 | +3.967 s | STAT | seventy thousand \| kilometers per hour |
| B159 | 07:04.87 / 12746 | +5.867 s | STAT | Twenty \| times |

#### S47 · impact · THE DINOSAURS LAST DAY

**Timecode:** 07:06.73–07:17.30 · **Frame:** [12802, 13119) · **Thời lượng:** 10.567 s.

**VO hiện tại:** It struck Mexico, the energy of 10 billion atomic bombs. A tsunami a kilometer high, hot rocks fell like a rain of fire burning every forest.

**Component:** AsteroidWorld (impact=true)

**Visual / vật thể:** Flash ở điểm va chạm, cầu sáng giãn, shock ring theo mặt cầu và 80 mảnh đá nóng.

**Motion đối tượng:** Flash frame 0–30/100, shock ring và mảnh giãn theo age; emission mảnh nguội về .05.

**Camera:** Giữ camera continuity bằng offset 232 frame; không có burstShake.

**Ánh sáng / môi trường / VFX:** Point light intensity flash×130, overlay trắng/cam và vật chất emission.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Chưa có sóng thần, mưa lửa/rừng cháy toàn khung như script gốc. Shot impact bỏ dissolve đầu để giữ cú đập; asteroid không còn xuất hiện trong shot này.

**Event chính:** Asteroid impact starts tại frame 12802 (07:06.73), tức +0.000 s trong shot.

**Beat/tag bên trong (5):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B160 | 07:06.73 / 12802 | +0.000 s | META | type=scale, subtype=human-scale, subject=asteroid impact energy, context=compared to atomic bombs |
| B161 | 07:09.13 / 12874 | +2.400 s | STAT | ten billion \| atomic bombs |
| B162 | 07:11.70 / 12951 | +4.967 s | STAT | kilometer \| high |
| B163 | 07:12.83 / 12985 | +6.100 s | META | type=metaphor, subtype=abstract, subject=hot rocks, context=rain of fire |
| B164 | 07:13.97 / 13019 | +7.233 s | EM | rain of fire |

#### S48 · ash · THE SUN DISAPPEARS

**Timecode:** 07:17.30–07:26.83 · **Frame:** [13119, 13405) · **Thời lượng:** 9.533 s.

**VO hiện tại:** Dust hid the earth. So to synthesize, herbivores died, carnivores followed, 75 % of life vanished.

**Component:** NaturalWorld

**Visual / vật thể:** Địa hình tối và hạt tro trong sương, màu xám lạnh.

**Motion đối tượng:** 1,500 hạt dịch xuống/trôi; camera đi ngang/tiến vào địa hình.

**Camera:** Camera từ khoảng (10,6,18) tới gần, nhìn (0,3,-7).

**Ánh sáng / môi trường / VFX:** Fog nền xám và light lạnh.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Không có mô phỏng lớp bụi che cả Mặt Trời hoặc hệ sinh thái suy tàn riêng.

**Beat/tag bên trong (4):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B165 | 07:17.30 / 13119 | +0.000 s | META | type=flow, subtype=causal, steps=Dust hides Sun→No photosynthesis→Herbivores die→Carnivores die→Life vanishes |
| B166 | 07:21.67 / 13250 | +4.367 s | STAT | two \| years |
| B167 | 07:25.47 / 13364 | +8.167 s | STAT | Seventy-five \| percent |
| B168 | 07:25.90 / 13377 | +8.600 s | E | vanished |

#### S49 · mammal · THE SURVIVORS

**Timecode:** 07:26.83–07:34.77 · **Frame:** [13405, 13643) · **Thời lượng:** 7.933 s.

**VO hiện tại:** The weakest creatures survived, tiny mammals that could dig burrows, eat almost anything and keep themselves warm. Our ancestors?

**Component:** NaturalWorld

**Visual / vật thể:** Động vật có vú nhỏ kiểu gặm nhấm: thân loft, tai/mắt/mõm, đuôi, chân và râu trong rừng tối.

**Motion đối tượng:** Đuôi lắc và chân dao động nhỏ; camera tiến nhẹ.

**Camera:** Camera thấp khoảng (3.6,1.7,6.2), nhìn (0,.65,0).

**Ánh sáng / môi trường / VFX:** Môi trường rừng đêm, fur texture procedural, light lạnh.

**Transition sang shot kế:** Chuyển chapter: fade, overlap 20 frame (0.667 s), bắt đầu tại frame 13643.

**Chi tiết chưa có / giới hạn implementation:** Hai shot SMALL CREATURES WAIT và THE SURVIVORS dùng cùng model/set; không có animation đào hang/ăn riêng.

**Beat/tag bên trong (3):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B169 | 07:27.00 / 13410 | +0.167 s | EM | weakest creatures |
| B170 | 07:28.70 / 13461 | +1.867 s | EM | tiny mammals |
| B171 | 07:33.70 / 13611 | +6.867 s | EM | Our ancestors |

### Chapter 9 — THE FINAL SECOND

#### S50 · forest · LIFE RETURNS

**Timecode:** 07:34.77–07:44.40 · **Frame:** [13643, 13932) · **Thời lượng:** 9.633 s.

**VO hiện tại:** The forests returned. With the dinosaurs gone, mammals grew larger, mammoths, 30 -meter whales, primates. Seven million years ago

**Component:** NaturalWorld

**Visual / vật thể:** Rừng procedural: 22 cây và 24 fern, nền địa hình/đá.

**Motion đối tượng:** Cây và fern sway, hạt môi trường trôi, camera dolly.

**Camera:** NaturalCamera default; FOV 42°.

**Ánh sáng / môi trường / VFX:** Fog, shadow, ánh sáng ban ngày.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Cùng forest được dùng cho rừng cổ và rừng hồi sinh; chưa có mọc lại/growth morph riêng.

**Beat/tag bên trong (6):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B172 | 07:34.77 / 13643 | +0.000 s | META | type=flow, subtype=causal, steps=Dinosaurs gone→Mammals grow larger |
| B173 | 07:40.07 / 13802 | +5.300 s | EM | mammoths |
| B174 | 07:41.37 / 13841 | +6.600 s | STAT | thirty-meter \| whales |
| B175 | 07:42.13 / 13864 | +7.367 s | EM | primates |
| B176 | 07:43.00 / 13890 | +8.233 s | META | type=timeline, subtype=milestone, era=Human evolution, span=7M years ago to 300K years ago |
| B177 | 07:43.00 / 13890 | +8.233 s | STAT | Seven million \| years ago |

#### S51 · human · OUR ANCESTORS STAND UP

**Timecode:** 07:44.40–07:54.93 · **Frame:** [13932, 14248) · **Thời lượng:** 10.533 s.

**VO hiện tại:** one branch of apes came down to ground and walked on two legs. Three million years ago they learned to strike stones into knives. 300 ,000 years ago

**Component:** NaturalWorld + HumanAsset

**Visual / vật thể:** Người trưởng thành dạng ancestor với model adult-human.glb, rig MakeHuman và trang phục cổ.

**Motion đối tượng:** Đầu quay/gật nhẹ, breathing scale; chưa bật walking=true.

**Camera:** Camera từ khoảng (2.8,2.5,6.9) tiến/side move, nhìn (0,1.6,0).

**Ánh sáng / môi trường / VFX:** Rừng, địa hình, texture skin, shadow/light.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Không có chuỗi vượn → người morph; người không thực sự đi bằng hai chân trong shot human hiện tại.

**Beat/tag bên trong (2):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B178 | 07:48.87 / 14066 | +4.467 s | STAT | Three million \| years ago |
| B179 | 07:54.17 / 14225 | +9.767 s | STAT | Three hundred thousand \| years ago |

#### S52 · cave · 300,000 YEARS / US

**Timecode:** 07:54.93–07:57.43 · **Frame:** [14248, 14323) · **Thời lượng:** 2.500 s.

**VO hiện tại:** homo sapiens appeared, If we

**Component:** NaturalWorld + HumanAsset

**Visual / vật thể:** Người cổ trước khối đá hình hang, nguồn sáng kiểu lửa trại.

**Motion đối tượng:** Đầu/breathing người, intensity lửa dao động; camera tiến.

**Camera:** Camera cùng human, nhìn (0,1.6,0).

**Ánh sáng / môi trường / VFX:** Point light ấm dao động, đá bump texture và cone phát sáng.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Không có động tác vẽ hang/đập đá riêng, không hiển thị hình vẽ trên vách ở active path. Nhánh cave SVG cũ không chạy.

**Beat/tag bên trong (3):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B180 | 07:54.93 / 14248 | +0.000 s | EM | Homo sapiens |
| B181 | 07:56.97 / 14309 | +2.033 s | SB | (ngắt scene trong script) |
| B182 | 07:56.97 / 14309 | +2.033 s | META | type=scenario, subtype=analogy, context=Earth's history compressed into one year |

#### S53 · calendar · 4.54 BILLION YEARS / ONE CALENDAR YEAR

**Timecode:** 07:57.43–08:18.20 · **Frame:** [14323, 14946) · **Thời lượng:** 20.767 s.

**VO hiện tại:** compress 4 .54 billion years into one year, Earth forms on January 1. Life around 3 .8 billion years ago falls in early March. Dinosaurs arrive around December 13. The asteroid strikes on December 26. Homo sapiens arrives around 11 .25 pm on December 31. 5 ,000

**Component:** CalendarWorld

**Visual / vật thể:** Thước lịch 365 ngày, đoạn tháng 12 mở rộng; 5 icon 3D: Earth, microbe, dinosaur, impact, human bust.

**Motion đối tượng:** Tiến trình/active caption theo từ VO earth/life/dinosaurs/asteroid/homo/history. Icon quay, roi lắc, dinosaur chuyển động, asteroid chạm/flash, bust quay nhẹ. Cùng world nối qua hai shot calendar.

**Camera:** Orthographic camera cố định (0,0,14), zoom 105; motion chủ yếu icon và thước/nhãn.

**Ánh sáng / môi trường / VFX:** Studio light, starfield rất mờ, text/rail overlay SVG/HTML.

**Transition sang shot kế:** Giữ world và motionAge liên tục, đổi title/shot marker.

**Chi tiết chưa có / giới hạn implementation:** Dữ liệu tuổi thật 4.54 tỷ năm được nén thành 1 năm: Jan 1 Earth; ≈Mar 1 life; ≈Dec 13 dinosaurs; Dec 26 impact; Dec 31 ≈23:25 Homo sapiens. 5,000 năm lịch sử ≈35 giây cuối. Lịch không có tuổi riêng “1 năm”.

**Event nội bộ CalendarWorld (tách khỏi tag annotation):**

| Từ VO kích hoạt | Event | Tuổi thật | Vị trí lịch | Timecode / Frame | Offset từ đầu calendar world |
| --- | --- | ---: | --- | --- | ---: |
| earth | Earth forms | 4,540,000,000 năm trước | JAN 01 | 08:01.00 / 14430 | +3.567 s |
| life | Early life | 3,800,000,000 năm trước | ≈ MAR 01 | 08:03.20 / 14496 | +5.767 s |
| dinosaurs | Dinosaurs | 230,000,000 năm trước | ≈ DEC 13 | 08:07.27 / 14618 | +9.833 s |
| asteroid | The impact | 66,000,000 năm trước | DEC 26 | 08:10.17 / 14705 | +12.733 s |
| homo | Homo sapiens | 300,000 năm trước | DEC 31 ≈23:25 | 08:12.73 / 14782 | +15.300 s |
| history | Written history | 5,000 năm trước | Final ≈35 seconds | 08:19.00 / 14970 | +21.567 s |

Các event này được component tìm trực tiếp trong timeline.words; không phải các beat META/EM/STAT mới. Shot S54 nối age từ S53.

**Beat/tag bên trong (1):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B183 | 08:01.00 / 14430 | +3.567 s | META | type=timeline, subtype=era, era=Earth history as one year |

#### S54 · calendar · THE FINAL 35 SECONDS

**Timecode:** 08:18.20–08:30.33 · **Frame:** [14946, 15310) · **Thời lượng:** 12.133 s.

**VO hiện tại:** years of written history including dynasties, wars and phones fit into roughly the final 35 seconds. Earth has been magma, it has frozen solid, it has been smashed apart and still healed,

**Component:** CalendarWorld

**Visual / vật thể:** Thước lịch 365 ngày, đoạn tháng 12 mở rộng; 5 icon 3D: Earth, microbe, dinosaur, impact, human bust.

**Motion đối tượng:** Tiến trình/active caption theo từ VO earth/life/dinosaurs/asteroid/homo/history. Icon quay, roi lắc, dinosaur chuyển động, asteroid chạm/flash, bust quay nhẹ. Cùng world nối qua hai shot calendar.

**Camera:** Orthographic camera cố định (0,0,14), zoom 105; motion chủ yếu icon và thước/nhãn.

**Ánh sáng / môi trường / VFX:** Studio light, starfield rất mờ, text/rail overlay SVG/HTML.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Dữ liệu tuổi thật 4.54 tỷ năm được nén thành 1 năm: Jan 1 Earth; ≈Mar 1 life; ≈Dec 13 dinosaurs; Dec 26 impact; Dec 31 ≈23:25 Homo sapiens. 5,000 năm lịch sử ≈35 giây cuối. Lịch không có tuổi riêng “1 năm”.

**Event nội bộ CalendarWorld (tách khỏi tag annotation):**

| Từ VO kích hoạt | Event | Tuổi thật | Vị trí lịch | Timecode / Frame | Offset từ đầu calendar world |
| --- | --- | ---: | --- | --- | ---: |
| earth | Earth forms | 4,540,000,000 năm trước | JAN 01 | 08:01.00 / 14430 | +3.567 s |
| life | Early life | 3,800,000,000 năm trước | ≈ MAR 01 | 08:03.20 / 14496 | +5.767 s |
| dinosaurs | Dinosaurs | 230,000,000 năm trước | ≈ DEC 13 | 08:07.27 / 14618 | +9.833 s |
| asteroid | The impact | 66,000,000 năm trước | DEC 26 | 08:10.17 / 14705 | +12.733 s |
| homo | Homo sapiens | 300,000 năm trước | DEC 31 ≈23:25 | 08:12.73 / 14782 | +15.300 s |
| history | Written history | 5,000 năm trước | Final ≈35 seconds | 08:19.00 / 14970 | +21.567 s |

Các event này được component tìm trực tiếp trong timeline.words; không phải các beat META/EM/STAT mới. Shot S54 nối age từ S53.

**Beat/tag bên trong (1):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B184 | 08:18.20 / 14946 | +0.000 s | META | type=scale, subtype=zoom, subject=written history, context=final 35 seconds |

#### S55 · earth · WE NEED IT

**Timecode:** 08:30.33–08:44.57 · **Frame:** [15310, 15737) · **Thời lượng:** 14.233 s.

**VO hiện tại:** it does not need us, we need it. Because after 4 .5 billion years of chaos it has finally become peaceful enough for a species that can tell stories. For you, to sit here and hear the story yourself,

**Component:** PlanetStage

**Visual / vật thể:** Trái Đất với NASA Blue Marble, lớp mây riêng và viền khí quyển.

**Motion đối tượng:** Cầu xoay .0025 rad/frame, mây .0029; camera orbit và dolly.

**Camera:** Khoảng cách 8.7, FOV 42°; góc orbit .032 rad/s.

**Ánh sáng / môi trường / VFX:** Daymap có shading theo hướng sáng; rim khí quyển xanh.

**Transition sang shot kế:** Dissolve 20 frame (0.667 s) ở đầu shot kế tiếp.

**Chi tiết chưa có / giới hạn implementation:** Đây là bản đồ Trái Đất hiện đại, không phải tái dựng lục địa cổ.

**Beat/tag bên trong (3):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B185 | 08:31.40 / 15342 | +1.067 s | SB | (ngắt scene trong script) |
| B186 | 08:31.40 / 15342 | +1.067 s | META | type=tension, subtype=trade-off, a=Earth's chaos, b=Earth's peace, context=human existence |
| B187 | 08:34.53 / 15436 | +4.200 s | STAT | four point five billion \| years |

#### S56 · city · 4.5 BILLION YEARS TO MAKE YOU.

**Timecode:** 08:44.57–08:55.47 · **Frame:** [15737, 16064) · **Thời lượng:** 10.900 s.

**VO hiện tại:** you are made of stardust. Do not live like a speck of dust.

**Component:** PlanetStage + Worlds SVG city + SceneShell final card

**Visual / vật thể:** Trái Đất hiện đại có nightmap; bên dưới là skyline 24 tòa nhà SVG; câu kết và dòng credit.

**Motion đối tượng:** Earth/mây xoay, camera orbit .023 rad/s; đèn cửa sổ skyline pulse nhẹ; card hiện bằng spring.

**Camera:** PlanetCamera khoảng cách 8.7, FOV 42°.

**Ánh sáng / môi trường / VFX:** Nightmap sáng ở mặt tối, khí quyển; title “4.5 BILLION YEARS TO MAKE YOU.” và “DON'T WASTE THEM.”.

**Transition sang shot kế:** Fade toàn khung 15 frame trước 2 giây đen cuối.

**Chi tiết chưa có / giới hạn implementation:** Đây không phải cú zoom từ globe vào thành phố 3D. Skyline cuối còn là 2D SVG. Full-frame fade sang đen bắt đầu ở frame 15989; đen hoàn toàn từ frame 16004.

**Beat/tag bên trong (1):**

| Audit ID | Timecode / Frame | Offset trong shot | Tag | Nội dung tag nguyên văn |
| --- | --- | ---: | --- | --- |
| B188 | 08:44.57 / 15737 | +0.000 s | CLOSE | You are made of stardust. Do not live like a speck of dust. |

## Beat gốc và ID tra cứu

B001…B188 được đánh số theo thứ tự all_beats trong file hiện tại. Nội dung tag và ID gốc giữ nguyên trong `scene-inventory.json`, kèm aligned và timestamp_seconds. Báo cáo không sửa source, không render lại video.
