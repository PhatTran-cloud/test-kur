# v6 production plan

## Phase 0 — Lock the brief

1. Freeze the target: a rigorous cosmic history explainer with an original, tactile vector-plus-3D language.
2. Decide the audience, final duration, aspect ratio and voice before designing scenes.
3. Preserve v5 as the rollback reference. New code belongs in an isolated v6 build or branch.

## Phase 1 — Editorial and research

- Build `research/claim-ledger.json` with one record per factual claim.
- Use primary sources first: USGS/NASA/peer-reviewed papers/museum or university sources where appropriate.
- Record uncertainty for dates such as early life and the exact Theia scenario.
- Mark each line as fact, approximation, metaphor or rhetorical framing.
- Create a sourcesheet suitable for publication.
- Rewrite the narration after the ledger, not before.

## Phase 2 — Visual direction

- Write one visual thesis and three candidate systems.
- Choose one system with palette roles, silhouette rules, edge/line rules, depth layers, light direction, camera language, motion language and sound relationship.
- Create an asset bible for Earth, Moon, Theia, asteroid, star, human, ancestor, microbes, dinosaur and city.
- Create six styleframes before production: modern street, Big Bang, supernova, Theia impact, Cambrian life and final calendar.

## Phase 3 — Beat and scene design

- Replace the current shot-first plan with 12–20 meaning beats. A beat is an understanding/state/action change.
- For each beat, write: narration range, factual claim, purpose, hero action, supporting action, camera-in/action/camera-out, transition cause, sound cue and acceptance test.
- Map each tag to a visual grammar. `META` must become an actual action or diagram; `STAT` must have a readable visual scale; `EM` must change focus, not merely add a title.
- Build a transition graph. Every edge carries a subject, motion vector, light, color, sound or semantic idea.

## Phase 4 — Animatic and pilot

- Render VO+BGM only with rough silhouettes and final timing.
- Review pacing and comprehension before detail.
- Build one 45–90 second hero pilot containing one character action, one spatial transition and one scientific mechanism.
- Reject the approach if the pilot still reads as cards, generic planets or unrelated render modes.

## Phase 5 — Production

- Build reusable assets once and animate authoritative state, not arbitrary transforms.
- Use 2D/vector for diagrams and conceptual metaphors; use 3D for spatial scale, material, physical interaction and camera travel.
- Keep the active beat manifest separate from the renderer. The renderer must consume explicit beat actions, not infer everything from a `kind` string.
- Add sound only after picture approval. Each cue gets a source, edit, gain, pan, ducking and acceptance check.

## Phase 6 — QA and delivery

- Check every beat at encoded frames, not only the Remotion preview.
- Check silhouette readability at 25%, 50% and 100% scale.
- Check a motion difference over 30 and 90 frames for every shot.
- Check transition cause, object continuity, camera direction, palette role and VO anchor.
- Check voice intelligibility, BGM ducking, cue clipping, stereo movement and final black/silence.
- Publish source links and the final sourcesheet with the video.

## Proposed v6 repository shape

```text
v6/
  research/
    claim-ledger.json
    sourcesheet.md
    expert-review.md
  direction/
    visual-thesis.md
    design-system.md
    asset-bible.md
    scene-cards.md
    transition-graph.md
    styleframes/
  timing/
    voice.json
    beat-manifest.json
  animatic/
  build/
    components/
    scenes/
  audio/
    music-ledger.json
    sfx-ledger.json
  qa/
    motion-report.json
    continuity-report.md
    audio-report.json
```

The current `output/stardust-to-human` artifacts remain the v5 record. v6 should not overwrite them.
