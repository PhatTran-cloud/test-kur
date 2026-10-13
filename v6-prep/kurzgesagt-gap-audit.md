# v5 versus Kurzgesagt: production gap audit

This is a production comparison, not a request to copy Kurzgesagt's artwork, characters, exact layouts, palette or signature moments. The useful target is the discipline behind a clear, playful, scientifically grounded explainer.

## What Kurzgesagt publicly says it does

Kurzgesagt describes a pipeline with five linked phases: research, script, illustration, voiceover/animation, and music/sound effects. It says research begins with books and primary papers, includes field experts, and ends with a sourcesheet. It describes multiple script drafts, visual metaphors developed during sketching, a mix of vector and pixel illustration plus infographics, animation timed to narration, and a soundtrack composed for each video. [Kurzgesagt's process](https://kurzgesagt.org/what-we-do?visit=videos)

The standard is therefore not simply “more detail” or “more 3D”. It is a coherent editorial system in which every fact, visual choice, motion decision and sound cue supports the same explanation. Kurzgesagt also states that its videos are based on scientific papers, checked by experts and supported by a sources list. [Kurzgesagt sponsors and research standards](https://kurzgesagt.org/sponsors)

## Current v5 evidence

The active composition is assembled by [StardustToHuman.tsx](/D:/output/v5/v5/output/stardust-to-human/build/StardustToHuman.tsx), which contains ten section components, nine generic `TransitionSeries` transitions and one audio track. [SceneShell.tsx](/D:/output/v5/v5/output/stardust-to-human/build/components/SceneShell.tsx) selects the current shot by `timeline.shots`; [Worlds.tsx](/D:/output/v5/v5/output/stardust-to-human/build/components/Worlds.tsx) routes the `kind` to a world implementation.

The project has a strong timing foundation: [timeline.json](/D:/output/v5/v5/output/stardust-to-human/timeline.json) has 30 fps, 1,320 word timestamps and 56 shot markers. The final render passed the recorded opening, ending and encoded shot checks in [final-verification.json](/D:/output/v5/v5/output/stardust-to-human/final-verification.json). The build contains substantial custom Three.js work for planets, space raymarching, supernova, asteroid impact, volcano terrain, natural environments and a rigged human.

The project also contains a useful semantic layer. [annotated.json](/D:/output/v5/v5/output/stardust-to-human/annotated.json) contains 188 aligned tags and ten sections. However, the active renderer does not consume individual `META`, `EM` or `STAT` records to create per-beat visual actions; it consumes `timeline.shots` and their `kind` values. The semantic layer is therefore mostly documentation, not a live editorial control system.

## Gap 1: research and trust

**Kurzgesagt practice:** claim research, primary sources, expert checking, sourcesheet.

**v5:** the production brief explicitly says the supplied scientific claims were preserved and “not fact-checked.” The repository has asset credits and a few calendar references, but no claim-by-claim ledger connecting a statement to a primary source, confidence, simplification, or expert review.

**Consequence:** the script can sound authoritative while mixing established evidence, approximate dates, compressed metaphors and unsupported causal visuals. For a science explainer, this is the largest credibility gap.

**v6 requirement:** every factual claim gets `claim_id`, exact narration, source URL/DOI, source passage, confidence, date precision, visual simplification, and review status. Metaphors must be marked as metaphors. No visual may add a causal relationship that the claim ledger does not support.

## Gap 2: editorial thesis and script discipline

**Kurzgesagt practice:** many script drafts, a deliberate balance of facts and story, and a perspective that leaves a new insight.

**v5:** the source follows a complete chronology from stardust to humans, but the active scene plan is primarily a sequence of 56 timeline markers. The tags describe meaning, yet the renderer does not use them to orchestrate a visual argument. The current title system labels shots (`A STAR DIES`, `ONE SUPERCONTINENT`) without making a persistent thesis visible through the whole piece.

**Consequence:** the result can feel like a catalogue of events. Chronology is present, but the viewer's changing question, emotional turn and final reframe are not designed as one chain of cause and consequence.

**v6 requirement:** freeze one sentence of visual thesis, one viewer question, one emotional arc and one takeaway before drawing assets. Reduce the script to meaning beats; a beat changes understanding, scale, state or emotion, not merely the noun on screen. The script needs a review pass for fact density, repeated phrasing and unsupported certainty before animation.

## Gap 3: visual language and art direction

**Kurzgesagt practice:** illustration is designed as a system, with visual metaphors, distinctive characters, consistent vector/pixel/infographic treatment and reusable visual identity.

**v5:** the build mixes high-fidelity procedural Three.js, flat SVG overlays, HTML labels, texture-backed planets and generic geometric creatures. `extinction` is a 2D dot chart; the city skyline is still SVG; some early-world logic is an overlay or shader blend while nearby shots are spatial 3D. There is no single asset bible defining silhouette, line/edge treatment, palette roles, scale, material response, light direction and permitted state changes.

**Consequence:** individual frames can be technically elaborate while the film reads as a collection of unrelated render techniques. The user's “2D SVG lởm” reaction is a symptom of a missing art-direction contract, not merely a missing polygon count.

**v6 requirement:** choose a house visual system first. Use authored 2D/vector for explanatory diagrams and symbolic transitions; use 3D only when depth, scale, material or physical interaction adds information. Both mediums must share silhouette rules, palette tokens, edge treatment, lighting logic and motion grammar.

## Gap 4: character and object identity

**Kurzgesagt practice:** relatable, quirky characters and objects become memorable actors in the explanation.

**v5:** the human is a rigged asset with procedural posing, but the actor has limited acting beats and the ancestor/cave scenes do not form a clear evolution of posture, intention or action. Creatures are often representative meshes placed in an environment. The street crowd has walking cycles, but most later subjects do not have a character goal or reaction.

**Consequence:** the viewer sees objects move, but does not always feel that a character or system is doing something consequential.

**v6 requirement:** every recurring subject gets a silhouette sheet, proportions, expression/pose range, material palette, scale, contact rules and action vocabulary. Each hero scene gets an observable action with a beginning, change and consequence.

## Gap 5: motion and transitions

**Kurzgesagt practice:** animation is meticulous and narration-driven; transitions carry ideas, objects and motion.

**v5:** there is valid continuous frame motion in many worlds, including planet rotation, particles, camera drift, walking cycles, raymarched plasma and asteroid travel. But chapter assembly still uses a fixed set of fade, wipe and slide transitions in [StardustToHuman.tsx](/D:/output/v5/v5/output/stardust-to-human/build/StardustToHuman.tsx). Many shot changes are generic dissolves. The repository's own `scene-composition-model.md` and `layoutPlanner.ts` define beat persistence and spatial relocation, but the active Stardust build does not use them.

**Consequence:** motion exists, yet it is not consistently motivated by the narration. A transition can feel like a new card arriving rather than a cause continuing into a new state. Some scenes are technically animated but perceptually static because the dominant subject does not change state.

**v6 requirement:** every scene card defines camera-in, hero action, secondary motion, reaction, camera-out and transition cause. Replace generic transition defaults with push-through, occlusion, match-motion, object transformation, light bridge, sound bridge or motivated cut. Each 2–4 second interval must contain a readable state change, not only ambient noise.

## Gap 6: sound and emotional timing

**Kurzgesagt practice:** a custom soundtrack and sound effects are part of the explanation's emotional impact; their process page explicitly warns that the difference is substantial when music and SFX are removed. [Kurzgesagt production process](https://kurzgesagt.org/what-we-do?visit=videos)

**v5:** all SFX were disabled after the previous generated effects were judged poor. The final mix is VO+BGM, with BGM ducking at -14 dB documented in [mix-report.json](/D:/output/v5/v5/output/stardust-to-human/mix-report.json). Voice timing and final silence are strong, but the film has no event-specific sound language for impact, scale, material or transition.

**Consequence:** visual events such as Big Bang, supernova, Theia impact and asteroid impact do not receive reliable acoustic punctuation. Removing bad SFX fixed clutter, but did not solve sound design.

**v6 requirement:** sound is a separate authored pass. Start with VO+BGM for animatic approval; add only named, edited, mixed cues after the picture is approved. Build a small coherent library by material and event, record source/rights, duck under VO, and validate timing and loudness. SFX remain off until they pass a scene-level review.

## Gap 7: production structure and approval gates

**Kurzgesagt practice:** research, script, illustration, voice/animation and sound are sequential creative gates with deliberate iteration.

**v5:** the repository has a good automation pipeline, but the build is effectively a generated monolith. `spec.md` and `visual-blocks.json` exist, while the active composition imports `timeline.json` and custom components directly. There is no enforced approval gate for claim ledger, thesis, styleframes, animatic, hero-scene pilot or sound pass.

**Consequence:** implementation can advance before the user has approved the visual language. Large corrections then become expensive and produce partial fixes, stale metadata and repeated renders.

**v6 requirement:** introduce hard gates: research lock, script lock, styleframe lock, animatic lock, hero-scene lock, sound lock, final QA. Each gate stores a review artifact and an explicit status. No full render before the animatic, six representative styleframes and one difficult hero scene are approved.

## Gap 8: information design

**Kurzgesagt practice:** visual metaphor and infographic choices make difficult relationships understandable, not merely attractive.

**v5:** tags classify `flow`, `timeline`, `tension`, `transformation`, `anatomy` and other patterns, but most do not become dedicated diagrams. The calendar is the strongest information-design scene. Other claims often become a planet, a particle field or a title, even when the narration describes a relationship or sequence.

**Consequence:** the audience can see a subject without seeing the mechanism. A polished object is not automatically an explanation.

**v6 requirement:** every META tag maps to an explicit visual grammar: flow becomes nodes/arrows or a physical causal chain; timeline becomes an axis with dates; anatomy becomes exploded/sectioned parts; tension becomes opposing forces; transformation becomes a visible state morph. The mapping is reviewed before component implementation.

## Gap 9: technical quality versus perceived quality

v5 has real technical strengths: deterministic frame-driven motion, 30 fps word timestamps, custom shaders, asset reuse, render QA, opening/end checks and a reproducible full render. These should be retained.

The weak point is not simply “more realism.” Procedural detail cannot repair an unclear silhouette, a generic transition, a mismatched visual metaphor or an unreviewed factual claim. v6 should spend effort in this order: meaning and design lock, hero silhouette/action, transition continuity, sound timing, then material and shader polish.

## Priority matrix for v6

| Priority | Change | Why it matters | Gate |
| --- | --- | --- | --- |
| P0 | Claim ledger + expert/source review | Establishes trust and prevents invented causality | Research lock |
| P0 | Visual thesis + asset bible | Stops the mixed-style drift | Styleframe lock |
| P0 | Beat-to-action mapping | Makes tags control actual visuals | Animatic lock |
| P0 | Hero-scene pilot | Proves the hardest visual language before scaling | Hero-scene lock |
| P1 | Motivated transition graph | Replaces card-like chapter changes | Animatic lock |
| P1 | Character/object action library | Makes motion readable and memorable | Styleframe/hero lock |
| P1 | Authored sound pass | Restores impact without repeating bad SFX | Sound lock |
| P1 | Visual QA for silhouette, overlap, state change and continuity | Catches “moving but static” scenes | Every review render |
| P2 | Performance and render caching | Makes iteration affordable | Before full render |
| P2 | Thumbnail/title/source sheet | Completes publication quality and transparency | Delivery lock |

## What v6 should not do

- Do not copy Kurzgesagt's characters, exact palette, signature shapes or layouts.
- Do not force every beat into 3D; that would preserve the current mismatch under a more expensive renderer.
- Do not restore the old SFX automatically. Sound must pass an authored cue review.
- Do not render the 9-minute final while the thesis, styleframes or hero scene are still unsettled.
- Do not treat a passing render or a high polygon count as artistic approval.

## Definition of “ready for v6 implementation”

The project is ready to build only when the repo contains: a reviewed claim ledger; locked English script and VO timings; one visual thesis; palette/shape/material/type tokens; an asset bible; 12–20 meaning beats with action verbs; scene cards and a transition graph; six approved styleframes; one approved hero-scene pilot; a temporary VO+BGM animatic; and a test plan covering encoded frame motion, VO sync, readability and continuity.
