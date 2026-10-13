# test-kur

Remotion/Three.js animation workspace containing the source of **Stardust To Human**, the Earth-history video ending with “4.5 BILLION YEARS TO MAKE YOU.”

The verified historical film uses the pre-v6 implementation. The repository also contains the current v6 contracts, tools, schemas and local skill snapshots for new work. Start with [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md), [CONTEXT.md](CONTEXT.md) and [v6/execution-protocol.md](v6/execution-protocol.md). A historical export approval does not authorize a new render.

## Earth film

- Source and direction: `output/stardust-to-human/`.
- Remotion entry: `animation-studio/src/stardust-entry.tsx`.
- Composition: `StardustToHuman`, 1920 × 1080, 30 fps, 16,064 frames.
- Runtime inputs: `animation-studio/public/stardust-to-human/` and `animation-studio/public/models/human/`.
- Evidence and limitations: `output/stardust-to-human/final-verification.json` and `asset-credits.md`.

To open the existing film on a new checkout, use Node.js/npm and Python as appropriate for the tools:

```powershell
cd animation-studio
npm ci
npm exec -- tsc --project tsconfig.stardust.json --noEmit
npm exec -- remotion studio src/stardust-entry.tsx
```

The final encoded `output/stardust-to-human/render/final.mp4`, render captures, caches, large intake archives and unrelated generated film outputs are kept locally and are not stored in Git. The existing compressed mix, models, HDR environment and planetary textures are included for playback of this film; regenerating narration or asset intake requires the dependencies/services described in [RUN.md](output/stardust-to-human/RUN.md). That document is a historical record; current execution rules still apply.

Third-party assets and vendored components retain their own attribution and licenses. See the film's asset credits and the relevant component directories.

`remotion-bits/` and `research/prompt-to-motion/` are optional reference submodules pinned to their upstream commits. They are not required to open the Earth film. Retrieve them with `git submodule update --init` if needed. Local experimental changes in those separate checkouts are not part of the pinned upstream commits.
