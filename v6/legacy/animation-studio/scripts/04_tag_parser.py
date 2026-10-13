"""
Stage 0 — Pre-step: Tag Parser via Gemini API

Input:  raw script (.md)
Output: tagged script (.md) in output/<slug>/

Usage:
    python 04_tag_parser.py <script-path>
    python 04_tag_parser.py path/to/my-video.md

Produces:
    output/<slug>/raw-script.md      (copy of input)
    output/<slug>/tagged-script.md
    output/<slug>/tag-response.json
"""

import os
import sys
import json
import shutil
from pathlib import Path
from dotenv import load_dotenv

# Load .env from scripts/ directory
load_dotenv(Path(__file__).parent / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-pro-preview-06-05")

# Project paths
STUDIO_ROOT = Path(__file__).parent.parent   # animation-studio/
PROJECT_ROOT = STUDIO_ROOT.parent            # explainer-v3/
OUTPUT_DIR = PROJECT_ROOT / "output"
PROMPTS_DIR = STUDIO_ROOT / "prompts"


def load_tag_parser_prompt() -> str:
    """Load the TAG_PARSER.md master prompt."""
    prompt_path = PROMPTS_DIR / "TAG_PARSER.md"
    if not prompt_path.exists():
        print(f"[ERROR] TAG_PARSER.md not found at: {prompt_path}")
        sys.exit(1)
    return prompt_path.read_text(encoding="utf-8")


def call_gemini(system_prompt: str, user_input: str) -> dict:
    """
    Call Gemini via google-genai SDK.
    Returns parsed JSON response.
    """
    try:
        from google import genai

        client = genai.Client(api_key=GEMINI_API_KEY)

        # Build the full prompt: system prompt with {{RAW_SCRIPT}} replaced
        full_prompt = system_prompt.replace("{{RAW_SCRIPT}}", user_input)

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=full_prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "object",
                    "properties": {
                        "tagged_script": {
                            "type": "string",
                            "description": "Full script with inline tags"
                        },
                        "tag_summary": {
                            "type": "object",
                            "properties": {
                                "SB_count": {"type": "integer"},
                                "EM_count": {"type": "integer"},
                                "E_count": {"type": "integer"},
                                "STAT_count": {"type": "integer"},
                                "LIST_count": {"type": "integer"},
                                "QUOTE_count": {"type": "integer"},
                                "META_count": {"type": "integer"},
                                "META_types_used": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                },
                                "CLOSE_count": {"type": "integer"}
                            }
                        },
                        "parse_notes": {
                            "type": "array",
                            "items": {"type": "string"}
                        }
                    },
                    "required": ["tagged_script", "tag_summary", "parse_notes"]
                }
            }
        )

        return json.loads(response.text)

    except ImportError:
        print("[ERROR] google-genai package not installed.")
        print("Run: pip install google-genai")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Gemini API call failed: {e}")
        return None


def derive_slug(script_path: Path) -> str:
    """Derive slug from script filename."""
    name = script_path.stem
    for suffix in ["-final", "-review", "-draft"]:
        name = name.replace(suffix, "")
    return name


def main():
    if len(sys.argv) < 2:
        print("Usage: python 04_tag_parser.py <script-path>")
        print("Example: python 04_tag_parser.py path/to/my-video.md")
        sys.exit(1)

    script_path = Path(sys.argv[1]).resolve()

    if not script_path.exists():
        # Try relative to project root
        script_path = (PROJECT_ROOT / sys.argv[1]).resolve()

    if not script_path.exists():
        print(f"[ERROR] Script not found: {script_path}")
        sys.exit(1)

    slug = derive_slug(script_path)

    # Output folder: output/<slug>/
    slug_dir = OUTPUT_DIR / slug
    slug_dir.mkdir(parents=True, exist_ok=True)

    # ── Copy raw script to output ──
    raw_copy = slug_dir / "raw-script.md"
    shutil.copy2(script_path, raw_copy)

    output_path = slug_dir / "tagged-script.md"

    # ── Load raw script ──
    print(f"[1/3] Loading raw script: {script_path.name}")
    raw_script = script_path.read_text(encoding="utf-8")
    word_count = len(raw_script.split())
    print(f"   {word_count} words")
    print(f"   Output folder: {slug_dir}")

    # ── Load TAG_PARSER prompt ──
    print(f"[2/3] Loading TAG_PARSER.md system prompt...")
    system_prompt = load_tag_parser_prompt()

    # ── Call Gemini ──
    print(f"[3/3] Calling Gemini ({GEMINI_MODEL})...")
    print(f"   This may take 30-60 seconds for long scripts...")

    result = call_gemini(system_prompt, raw_script)

    if not result:
        print(f"\n[FAILED] Tag parsing failed.")
        sys.exit(1)

    tagged_script = result.get("tagged_script", "")
    tag_summary = result.get("tag_summary", {})
    parse_notes = result.get("parse_notes", [])

    if not tagged_script:
        print(f"[ERROR] Gemini returned empty tagged_script")
        sys.exit(1)

    # ── Save tagged script ──
    output_path.write_text(tagged_script, encoding="utf-8")

    # Also save full response for reference
    response_path = slug_dir / "tag-response.json"
    with open(response_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    # ── Report ──
    print(f"\n   Raw script copied: {raw_copy}")
    print(f"   Tagged script saved: {output_path}")
    print(f"   Full response saved: {response_path}")
    print(f"\n   Tag summary:")
    for key, value in tag_summary.items():
        print(f"     {key}: {value}")
    if parse_notes:
        print(f"\n   Parse notes:")
        for note in parse_notes:
            print(f"     - {note}")

    print(f"\n[DONE] Next steps:")
    print(f"  1. Review tagged script: {output_path}")
    print(f"  2. Generate audio:       python 01_tts_kokoro.py {slug}")
    print(f"  3. Get timestamps:       python 02_asr_whisper.py {slug}")
    print(f"  4. Align to frames:      python 03_aligner.py {slug}")


if __name__ == "__main__":
    main()
