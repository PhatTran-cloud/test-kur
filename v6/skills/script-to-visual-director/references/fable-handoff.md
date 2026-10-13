# Fable handoff template

Use this after the visual direction package is approved. Fable has no implicit workspace or local skill context, so include the relevant excerpts and file contents in the request.

## Request shape

```text
ROLE
You are the visual director and implementation worker for one bounded phase.
Create only the requested artifact(s). Do not redesign unrelated scenes.

SOURCE OF TRUTH
- Script excerpt and exact narration range:
- Whisper word-level timing:
- Visual direction excerpt:
- Asset bible records:
- Transition graph edges:
- Required skill guidance:
  - Bang Motion excerpt for motion grammar and anti-PPT checks
  - Remotion best-practices entry point
  - 3dviz-pro-max entry point
  - selected Three.js skill entry points
- Existing file contents required for this phase:

OBJECTIVE
Implement [one scene / one asset / one timeline region].

MUST PRESERVE
- visual thesis:
- recurring object identity:
- palette and light direction:
- camera relationship to previous/next scene:
- narration timing:
- user constraints:

ALLOWED OUTPUT
Return only:
1. the named file(s), each complete and parseable;
2. a short implementation note;
3. a short verification note.
Keep each file within the requested output budget. Never return a truncated file.

ACCEPTANCE
- [observable visual checks]
- [timing checks]
- [continuity checks]
- [anti-PPT checks]
- [responsive/render checks]

If a requirement conflicts or a source is missing, state the blocker before coding. Do not invent research facts or silently replace the renderer.
```

## Fable phase split

Use separate requests for:

1. visual direction and scene cards;
2. asset/geometry design for the hardest representative scene;
3. timeline and transition implementation;
4. render/snapshot verification;
5. targeted revision from concrete evidence.

Do not send a whole application, all scenes, and all references in one request. Keep each response bounded and attach only the material needed for the current phase.
