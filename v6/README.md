# Explainer v6
Every new/resumed session or other AI starts with [execution-protocol.md](execution-protocol.md). Read-only inspection comes first; acknowledge actual reads/decisions for the exact film and intended operation before using production commands below. No receipt grants review/render approval.
Shared production system for science, history, nature, technology, business, society, mystery and human stories. No new film or approved topic-specific art is included.

Read root CLAUDE.md/AGENTS.md, CONTRACT.md, then relevant guide: visual-storytelling-script-guide.md, art-direction.md, asset-bible-guide.md, manifest-guide.md, skill-routing.md, quality-gates.md. schemas/ contains executable contracts; templates/ explicitly incomplete starters; skills/ complete snapshots; legacy/ inactive old docs/scripts.

```powershell
python animation-studio/scripts/v6_packet.py init my-topic
python animation-studio/scripts/validate_v6.py output/my-topic/v6 --stage plan
python animation-studio/scripts/05_spec_generator.py my-topic
python animation-studio/scripts/validate_build.py my-topic
python animation-studio/scripts/render_v6.py my-topic --entry src/index.ts --composition MyTopic
```

Initialization creates no film/approval. Fresh packets fail until editorial decisions are made. Spec generation is offline compilation, not an API call. Old output/backup remains unchanged. Legacy audio tools are source utilities; linguistic sections do not choose scenes. Direct Remotion CLI can bypass the wrapper, so repo instructions also mandate the guarded path.
