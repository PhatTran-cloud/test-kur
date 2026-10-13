# Attachment and body-related props

Every body-related prop declares:

- owner object;
- attachment socket or contact surface;
- local position/rotation/scale;
- clearance requirements;
- collision expectations;
- motion inheritance;
- secondary motion if flexible;
- release/grab state if interactive.

Examples:

- helmet -> head/neck relation, visor clearance;
- glasses -> bridge + ears;
- backpack -> upper torso with strap contact;
- handheld tool -> palm/finger grip transform;
- rifle-shaped fictional prop or instrument -> hand sockets + shoulder contact where appropriate;
- oxygen hose -> two anchors + flexible intermediate curve;
- saddle -> animal spine/ribcage clearance + rider pelvis relation;
- reins/leash -> dual anchors + slack/tension state;
- bicycle -> pelvis/feet/hands to seat/pedals/handlebars.

A prop is not correct merely because it follows a bone. Contact geometry must also look plausible.
