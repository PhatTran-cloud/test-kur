# Calendar scene revision

Review only. Final export remains locked until the user approves.

The headline states the true age before the scale metaphor: 4.54 billion years, compressed into one calendar year. The main ruler is a 365-day non-leap year. December has an explicitly expanded linear ruler so its crowded milestones remain legible. Icon positions follow their actual day-of-year within each ruler. Labels are illustrative dates calculated from approximate geological ages, not independently dated events.

Small 3D specimens: textured Earth with a separate moving cloud shell; transparent microbe membrane with internal structures and flagellum; articulated representative theropod; irregular rocky impactor and contact illumination; a cropped section of the authored UV-textured MakeHuman head/shoulder mesh. The dinosaur represents its broad group; it is not a claim that T. rex lived 230 million years ago. The early-life icon is illustrative and does not establish the identity of the first organism. Icons stay subtle against an editorial hierarchy of headline, calendar scale, date labels and active-event caption. All animation derives from Remotion frames. No SFX.

Motion inventory: Earth rotates and clouds drift; cell rotates/wobbles and its flagellum oscillates; theropod breathes with articulated jaw/head; asteroid rotates, approaches and briefly lights the receiving surface; bust slowly turns; calendar progress follows spoken event anchors. Geometry is reused rather than reconstructed each frame.

Factual sources:
- USGS: Earth age 4.54 billion years, uncertainty under 1%: https://pubs.usgs.gov/gip/geotime/age.html
- NASA: early life around 3.8 billion years is approximate/uncertain: https://science.nasa.gov/universe/search-for-life/beginnings-life-on-our-world-and-others/
- Smithsonian: earliest dinosaurs around 230 million years: https://qrius.si.edu/taxonomy/term/12017
- NASA: Chicxulub extinction 66 million years: https://astrobiology.nasa.gov/news/timeline-of-a-mass-extinction/
- Smithsonian: Homo sapiens around 300,000 years: https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens
- British Museum: writing before 3200 BC; approximately 5,000 years is a rounded explanatory interval: https://www.britishmuseum.org/blog/how-write-cuneiform

Formula: seconds before next January 1 = yearsAgo / 4,540,000,000 * 365 * 86,400. At the chosen approximate ages: early life March 1; dinosaurs December 13; impact December 26; Homo sapiens December 31 23:25; 5,000 years of written history about the final 35 seconds. 14 seconds was inconsistent with the former script. Raw script, tagged script, input script and spoken calendar span were updated together. Source audio span 469.14..494.04 is replaced with the same voice, fitted to the same duration. The rest of the film is not retimed. Original source audio/script/timestamps remain saved as original-*.

Verification: check-calendar.py verifies date calculations, matching narration sources, monotonic shot order, unchanged duration, no audio clipping, zero SFX and opening/closing silence. --timeline-qa captures ten review frames; --timeline-probe checks consecutive encoded motion. These checks do not constitute artistic approval.
