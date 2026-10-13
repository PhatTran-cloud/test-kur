# Verified reusable component catalogue

Read root rules/v6 contracts and actual source before choosing a component. This is infrastructure, not creative direction or proof of quality.

| Component | Verified source | Scope |
|---|---|---|
| AnimatedText | src/components/core/AnimatedText.tsx | labels/text; not a whole scene |
| SceneContainer / SafeAreaGuide | src/components/core/SceneContainer.tsx | container/safe area; inspect legacy defaults |
| BlurText | src/components/core/effects/BlurText.tsx | optional text effect |
| CountUp | src/components/core/effects/CountUp.tsx | optional numeric readout, only when appropriate |
| GlitchText | src/components/core/effects/GlitchText.tsx | optional justified disturbance |
| ShinyText | src/components/core/effects/ShinyText.tsx | optional highlight |
| v6 runtime | src/v6/runtime.ts | absolute frame/state/track/binding infrastructure |

Historic named diagram/animation entries are blueprints, not implemented modules: v6/legacy/animation-studio/docs/component-registry.md. Verify source/props/behavior before reuse. None replaces metaphor, mechanism, background information, secondary acting, camera reveal or causal handoff. Authored topic assets and rigs remain packet-owned. Do not copy completed scene components from historic films.
