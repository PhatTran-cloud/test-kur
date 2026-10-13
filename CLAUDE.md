# Explainer v6 — repository entry point
Read before any task. This repo produces original visual-first explainers for arbitrary topics/genres using the existing Remotion/Three.js stack. v6 upgrades the repo, not one film.

## Authority and reading
The repository owns the workflow. Identify the latest user-authorized task and execute only necessary work within that scope under current repo contracts. Do not invent/skip/reorder stages, weaken requirements, migrate/install tools or start unrelated production. Updating rules does not authorize generating or rendering a film. Report missing prerequisites; never manufacture approval. Prior explicit user authorization persists.
Mandatory for every new/resumed session and other AI: follow v6/execution-protocol.md before production commands. A current session receipt must bind actual reads, decisions, exact film and declared operation. No auto-acknowledgement, borrowed receipts, direct CLI/custom-script bypass or invented approval. Read-only inspection/validation is allowed.
User instructions prevail. Read AGENTS.md, CONTEXT.md, v6/CONTRACT.md, nearest stage context, affected prompt/schema/runtime and relevant skill references before writing. Record actual reads/decisions in production.json. Resolve contradictions explicitly. Complete local skill snapshots are in v6/skills/. Pre-v6 rules/scripts in v6/legacy/ are inactive reproduction material.

## Pipeline
brief/research -> visual-first script/tags -> recorded VO/inspected anchors -> original thesis/art/behavioral asset bible -> meaning beats/scenes/shots/causal transitions -> styleframes/animatic/demanding pilot -> deterministic implementation -> deliberate sound/encoded QA -> authorized render.

For explicitly unnarrated scenes, timing.mode=authored_audio replaces the VO/word-anchor step with a measured authored soundtrack and frame-authored action timing. Word anchors remain empty; original art, motion, listening review and render gates still apply.

No chapter hierarchy. Semantic tags are evidence, ASR paragraphs linguistic boundaries, meaning beats changes in understanding/state, shots camera intervals. Do not force one sentence/tag into one shot.

## Mandatory rules
- Each idea has metaphor/analogy, useful expansion beyond VO, supported behavior/relation and readable change.
- Each shot has FG/MG/BG information, secondary acting, per-instance behavior, camera information gain, attention hierarchy and motivated handoff.
- One original art system governs palette roles, shape/silhouette, type, materials/light/depth, camera/motion/VFX/transitions. Learn reference principles; do not copy code/art.
- Distinguish fact, hypothesis, illustrative model, metaphor and inference. Causality cannot exceed evidence.
- Motivated stillness is valid. Micro-motion alone is not state change. No fixed density/layout/particle/icon/bloom/brightness quota.
- Choose 2D/2.5D/3D by meaning; no SVG-first shortcut, forced 3D everywhere or primitives as finished fidelity-sensitive assets.
- Absolute frame/time and deterministic seed own all state. No wall-clock or play-history-dependent rendering; scrubbing must reconstruct identically.
- Configured FPS and inspected word anchors own narrative timing. Authored offsets are separate. Measured audio plus explicit lead/tail owns duration.
- No unrequested captions. Short labels/equations/data serve action and remain readable at target viewing size.
- VO intelligibility first. Sound may be off. Cues require provenance/event ownership and actual mix review; no compulsory synthetic pops.
- Reuse tested infrastructure/canonical assets within contracts; do not regenerate everything or copy a prior film's finished scenes.
- New files: output/<slug>/v6/. Preserve historic output and backup.
- Structural/build passes do not establish art quality. Report implemented, checked, observed and approved separately. No fabricated gates or automatic full render.

## Read map
Any build: animation-studio/workflows/BUILDER_MASTER_GUIDE.md.
Scripts/hooks: v6/visual-storytelling-script-guide.md.
Art/assets: v6/art-direction.md and v6/asset-bible-guide.md.
Spec/timing: v6/manifest-guide.md, v6/schemas/, animation-studio/prompts/SPEC_GENERATOR.md.
Skills: v6/skill-routing.md. QA: v6/quality-gates.md. Runtime: animation-studio/src/v6/.

```powershell
python animation-studio/scripts/v6_packet.py init <slug>
python animation-studio/scripts/validate_v6.py output/<slug>/v6 --stage plan
python animation-studio/scripts/05_spec_generator.py <slug>
python animation-studio/scripts/validate_build.py <slug>
python animation-studio/scripts/render_v6.py <slug> --entry src/index.ts --composition <CompositionId>
```

Fresh packets are incomplete deliberately. No command invents artwork or approval. Legacy tools require --legacy-v5 and never certify v6. Direct CLI can bypass a wrapper; repo rules require guarded rendering for new work.
