# Sources and Design Provenance

This private skill is an original synthesis. It does not copy external skill text or shot sequences. The following public resources informed the design principles:

- LottieFiles Motion Design Skill — philosophy-first motion direction, timing, easing, choreography, and motion principles: https://github.com/LottieFiles/motion-design-skill
- soilmass Motion Design Agent — broad decomposition of motion domains including physics, camera, depth, sequencing, particles, reflection, character, and implementation: https://github.com/soilmass/motion-design-agent
- Runway video prompting documentation — emphasizes explicit subject, environmental, camera, timing, direction, and speed descriptions; simple iterative prompts; and continuous-shot language for unwanted cuts: https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide
- Runway image-to-video prompting guide — motion-focused prompting and end-to-end shot continuity considerations: https://help.runwayml.com/hc/en-us/articles/48324313115155-Image-to-Video-Prompting-Guide
- Runway camera terms guide — cinematic camera vocabulary and combining camera motions: https://help.runwayml.com/hc/en-us/articles/47313504791059-Camera-Terms-Prompts-Examples

The skill extends these ideas with a stricter object-by-object Motion Ledger, physics/trajectory rules, motion coverage taxonomy, end-frame contracts, transition continuity channels, and anti-jank gates tailored to cinematic multi-object scenes.
