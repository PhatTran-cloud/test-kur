# Stardust To Human

Current status: full export completed and verified on 2026-10-10 after explicit user approval. Narration audited and truncated atempo tails repaired. `--approved-final` is an explicit final-export switch; the default command is locked.

Run from the repository root. Requires the project's installed Node dependencies, Python dependencies, FFmpeg, and the local Kokoro/Whisper services if regenerating narration.

```powershell
python output/stardust-to-human/prepare.py
python output/stardust-to-human/build_project.py
cd animation-studio
npx tsc --project tsconfig.stardust.json --noEmit
python scripts/validate_build.py stardust-to-human --strict
node scripts/stardust-render.cjs --qa
node scripts/stardust-render.cjs --motion
node scripts/stardust-render.cjs --probe
cd ..
python output/stardust-to-human/verify_e2e.py --preview-only
```

`--probe` renders the continuous lava-to-Earth transition. Fresh stills alone cannot detect retained R3F state between shots; the planetary canvas is keyed by shot kind to reset that state. Final verification compares encoded frames against fresh snapshots.

Narration source: `animation-studio/input/stardust-to-human.md`. Visual and audio direction: `production-brief.md`. Actual timing: `timeline.json`. Credits and model scope: `asset-credits.md`. Mix verification: `mix-report.json`. E2E evidence: `e2e-report.json`.

Preview:

```powershell
cd animation-studio
npx remotion studio src/stardust-entry.tsx --no-open --port=3100
```

Open http://localhost:3100/StardustToHuman . Duration follows the generated voice, with authored pauses and the closing hold. All SFX have been removed by the user's latest revision. Mix is VO + BGM, with 14 dB speech ducking. The modern street and audio start immediately; the ending retains its two-second silent black hold.

Additional focused captures: `--human-audit` renders five anatomy views; `--revisions-qa` covers the modern opening, supernova, thaw, Pangea, asteroid approach and impact; `--revisions-probe` renders asteroid approach and impact continuously.

Current review commands: `--street-qa` checks the overhead camera at eight times; `--street-probe` creates the nine-second street plus transition preview. `--opening-qa` captures the opening and Chapter 1. `--motion-audit` samples the middle and late hold of all 56 shots; `python output/stardust-to-human/check_motion.py` reports subject motion excluding titles/progress. `--continuity-probe` checks repeated oxygen scenes. These are review artifacts, not approval or a final export.

Preview performance: all Three.js canvases advance once per Remotion frame and 0.55 DPR in Studio; captures use native DPR. Geometry is memoized by shape content rather than recreated for identical per-frame arrays. Adjacent same-kind shots retain their motion age, and chapter overlaps keep outgoing shot ownership.

Calendar review: `--timeline-qa` captures ten frames; `--timeline-probe` creates a review clip. `python output/stardust-to-human/check-calendar.py` checks the revised calendar dates and source/mix consistency. Scientific sources and design decisions are in `calendar-direction.md`. Original calendar narration is saved as `original-audio.mp3`, `original-timestamps.json`, and `original-raw-script.md`.

Explosion review: `--events-qa` captures before/flash/ejecta frames; `--chapter1-probe` creates a continuous VO+BGM review clip. Big Bang is illustrated as coherent field expansion, supernova as core collapse and uneven stellar ejecta. Camera impulses are cinematic and deterministic.

Approved full export: `node scripts/stardust-render.cjs --approved-final`. Renders to `final-rendering.mp4`, preserves an existing final and publishes `final.mp4` only after encoding succeeds. Final decode/stream verification follows.

Final output: `render/final.mp4` — 1920×1080, 30 fps, 16064 frames, 535.509 s including AAC padding. Verified all 56 shot samples, frame-zero visibility, closing black/silence, complete final narration and both continuous cosmic effects. Audio waveform correlation with corrected mix is 0.99994 after 42.7 ms AAC encoder delay. Evidence: `final-verification.json`; contact sheet: `render/final-qa/contact-sheet.jpg`.
