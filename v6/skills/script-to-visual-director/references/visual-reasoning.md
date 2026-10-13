# Visual reasoning and scene card schema

This reference is read when writing a visual direction or storyboard package.

## Visual reasoning ladder

For every important narration passage, answer in order:

1. **Literal information:** what fact or event is actually stated?
2. **Audience change:** what should become clearer, more surprising, or more emotionally present?
3. **Visual thesis:** what single image/action could carry that idea?
4. **Metaphor:** what transformation makes an invisible relationship visible?
5. **World consequence:** what changes in the environment or secondary actions because of it?
6. **Camera argument:** what does the viewer need to see first, next, and last?
7. **Motion argument:** what moves, what stays still, and why?
8. **Transition cause:** what action or sound carries into the next beat?
9. **Truth boundary:** which parts are factual, inferred, or expressive metaphor?

Do not add a decorative prop unless it clarifies scale, causality, setting, character, or mood.

## Scene card

```yaml
id: scene-03
timecode: 00:12.40-00:18.10
narration_range: words 31-52
purpose: "Reveal the hidden cost of the system"
audience_takeaway: "The visible result depends on an invisible chain"
visual_thesis: "A bright surface peels open into a crowded machine underneath"
metaphor:
  type: transformation
  explanation: "The peel reveals dependency, not a literal machine claim"
hero:
  subject: "one red signal object"
  action: "travels from surface to the hidden mechanism"
  identity_constraints: ["same silhouette", "same signal red", "same scale anchor"]
secondary_actions:
  - "small operators route the signal"
  - "background counters change only when the signal arrives"
layers:
  foreground: ["dark edge occluding the lens", "two near particles"]
  midground: ["hero object", "mechanism modules"]
  background: ["large quiet field", "slow gradient drift"]
camera:
  in: "medium wide, subject enters from lower right"
  action: "push through the peeling surface, then orbit 20 degrees"
  out: "match direction into next scene"
lighting_material:
  palette: "cream base, charcoal structure, signal red"
  material: "matte paper with one glossy signal surface"
  light: "left key, soft occlusion, red bounce only near signal"
text:
  on_screen: null
audio:
  narration: "word-level timing drives hero arrival"
  sfx: ["paper tear", "low mechanical click"]
transition:
  in: "carried from scene-02 by the same rightward motion"
  out: "signal exits through lens; sound continues 180ms"
implementation:
  route: "2D cut-paper layers + Three.js depth camera"
  renderer: "Remotion composition"
assets_required: ["signal-object", "mechanism-kit", "paper-texture"]
acceptance:
  - "viewer can name the hidden dependency after one watch"
  - "hero remains readable at 9:16 crop"
  - "no flat slide-like fade"
  - "no unsupported factual detail is implied"
```

## Beat grouping rules

Keep a beat in the same scene when the same world, subject, or action can evolve. Start a new scene when the story needs a new geography, instrument, scale, emotional state, or irreversible reveal.

A long beat may contain several visual actions. A short sentence may share a shot with the following sentence if the image is still developing.

## Visual variation

Across adjacent scenes vary at least two of:

- shot scale;
- camera axis;
- focal position;
- motion direction;
- layer depth;
- light state;
- visual metaphor type;
- transition mechanism.

Do not vary purely for novelty when continuity or emphasis requires repetition.

## Kurzgesagt-inspired quality tests

These are principles, not a style copy:

- Can the beat be understood with the narration muted?
- Does the image reveal a relationship rather than merely name an object?
- Is there one clear focal action?
- Are background details purposeful and readable on inspection?
- Does the scene contain a small secondary discovery?
- Does the camera change the viewer's understanding?
- Does the next scene grow from the current scene's action or idea?
- Can the scene be implemented as bounded geometry/assets/timeline tasks?

## 2D/3D decision guide

Use 2D when silhouette, diagram, typography, cutout layering, or symbolic transformation is the point.

Use 3D when parallax, spatial occlusion, physical scale, object inspection, lighting response, or camera travel is the point.

Use hybrid when a flat graphic idea benefits from a tangible spatial stage. Record which layers are 2D and which are 3D; do not describe a hybrid scene as generic "3D."
