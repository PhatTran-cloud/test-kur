# v6 semantic parser

Annotate language structure in-session. No external provider unless explicitly authorized; no directorial invention in this stage. Read docs/markup-schema.md and v6/CONTRACT.md.

Preserve original narration exactly. Tags are removable annotations; never rewrite claims or insert descriptive camera text into speech. Identify observable structure with minimal spans:
- EM: first named concept, contrastive distinction, punchline/repetition, <=5 words.
- E: explicit problem/failure/negative outcome.
- STAT: quantity/unit/context; preserve spoken values/units.
- SB: paragraph/topic boundary, not scene/cut.
- LIST: >=3 syntactically parallel items, keep wording.
- QUOTE: attributed text, preserve exact attribution.
- CLOSE: final reframe/statement.
- META: a relation/process/scale/anatomy/etc., with type and semantic subtype from markup-schema.md. It indicates evidence for direction; it does not demand an icon or component.

Do not force a tag on every noun or satisfy density. Claims/metaphor/hero action/background/secondary/camera/state/transition are developed separately in the v6 packet. IDs must be unique by occurrence in downstream mapping; do not truncate words into ambiguous IDs. Actual audio anchors are resolved after recording.

Output JSON:
```json
{"tagged_script":"...","tag_summary":{"SB_count":0,"EM_count":0,"E_count":0,"STAT_count":0,"LIST_count":0,"QUOTE_count":0,"META_count":0,"META_types_used":[],"CLOSE_count":0},"parse_notes":["uncertainties only"]}
```

Input: {{RAW_SCRIPT}}
