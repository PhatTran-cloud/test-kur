# Stage 1: Scripts — Raw Input

## What This Folder Is

This is the **input stage**. Raw voiceover scripts land here after they are finalized in `script-lab/`. This folder is read-only for the pipeline — editing happens in script-lab, then the final version is copied here.

---

## Script Format

Scripts here are plain voiceover text. No special format required. Write naturally as you would speak.

**Recommended structure (not mandatory):**
```markdown
# [Title]

**Metadata:**
- Pillar: P[X]
- Topic ID: T-[XX]
- Format: short-form | long-form
- Word count: ~[N]
- Status: final

---

[Voiceover text, written as spoken narration]
```

Scripts are **spoken word** — write for the ear, not the eye. Short sentences. Punchy endings. Natural rhythm.

---

## What Happens to Scripts

1. Script copied from `script-lab/` to here at `final` status
2. Gemini Tag Parser reads the raw text → adds linguistic markup tags
3. Tagged version goes to `00-audio/` for TTS + Whisper processing

The script itself is **never modified here**. All tagging, timing, and visual decisions happen downstream.

---

## Folder Structure

```
01-scripts/
├── CONTEXT.md (you are here)
├── short-form/
│   ├── P1-layers-beneath/
│   ├── P2-right-tool/
│   ├── P3-methods-not-tools/
│   ├── P4-builders-architecture/
│   └── P5-honest-take/
└── long-form/
    └── [same pillar structure]
```

**File naming:** `[descriptive-slug].md` — human-readable, no prefix.

---

## How to Run Tag Parser

When a script is ready, open `../../prompts/TAG_PARSER.md`. This is the Gemini system prompt. Send it with the raw script text as the user message.

Gemini returns:
```json
{
  "tagged_script": "...full script with [EM], [E], [STAT], [SB], [LIST], [QUOTE], [CLOSE] tags...",
  "tag_summary": { "SB_count": 8, "EM_count": 14, ... },
  "parse_notes": ["...any ambiguous decisions..."]
}
```

Save `tagged_script` output to `../00-audio/[slug]-tagged.md`.

---

## What NOT to Do

- **Don't edit scripts here** — changes happen in script-lab, then re-copy
- **Don't add markup tags manually** — the Tag Parser does this
- **Don't store incomplete scripts** — only `final` status scripts belong here
- **Don't store audio, specs, or any pipeline artifacts here** — those go in their respective stage folders
