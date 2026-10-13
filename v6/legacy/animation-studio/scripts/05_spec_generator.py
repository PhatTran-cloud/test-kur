"""
Stage 2 — Spec Generation via Gemini API (per section)

Input:  annotated.json from Aligner
Output: spec.md + visual-blocks.json in output/<slug>/

Usage:
    python 05_spec_generator.py <slug> [--format short-form|long-form]
    python 05_spec_generator.py my-video-slug --format long-form

Expects:  output/<slug>/annotated.json
Produces: output/<slug>/spec.md
          output/<slug>/visual-blocks.json
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Load .env from scripts/ directory
load_dotenv(Path(__file__).parent / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-pro-preview-06-05")

# Project paths
STUDIO_ROOT = Path(__file__).parent.parent   # animation-studio/
PROJECT_ROOT = STUDIO_ROOT.parent            # explainer-v3/
OUTPUT_DIR = PROJECT_ROOT / "output"
PROMPTS_DIR = STUDIO_ROOT / "prompts"
DOCS_DIR = STUDIO_ROOT / "docs"

# ── Domain Palettes ──
# Pre-validated full palettes for each content domain.
# Each palette provides high-contrast colors matched to the domain's tone.
DOMAIN_PALETTES = {
    "technology": {
        "bg": "#080B14", "surface": "#111827",
        "text": "#E2E8F0", "textBright": "#F8FAFC", "textMuted": "#94A3B8", "textDim": "#7C8BA0",
        "primary": "#60A5FA", "secondary": "#A78BFA", "danger": "#F43F5E", "warning": "#FBBF24",
    },
    "economics": {
        "bg": "#0A0D14", "surface": "#141A28",
        "text": "#E8EAF0", "textBright": "#FFFDF0", "textMuted": "#A8B2C4", "textDim": "#8890A4",
        "primary": "#FBBF24", "secondary": "#34D399", "danger": "#F43F5E", "warning": "#FB923C",
    },
    "history": {
        "bg": "#0C0A14", "surface": "#1A1628",
        "text": "#EDE8F0", "textBright": "#FFFCF0", "textMuted": "#B0A8C0", "textDim": "#8E86A0",
        "primary": "#E8B931", "secondary": "#C4A6F0", "danger": "#F43F5E", "warning": "#FBBF24",
    },
    "geography": {
        "bg": "#081210", "surface": "#0F1E1A",
        "text": "#E0F0EC", "textBright": "#F0FFF8", "textMuted": "#A0C4B8", "textDim": "#80A498",
        "primary": "#34D399", "secondary": "#67E8F9", "danger": "#F43F5E", "warning": "#FBBF24",
    },
    "biology": {
        "bg": "#080F10", "surface": "#101C1E",
        "text": "#E0F0F2", "textBright": "#F0FFFE", "textMuted": "#98C8CE", "textDim": "#80AAB0",
        "primary": "#2DD4BF", "secondary": "#67E8F9", "danger": "#F43F5E", "warning": "#FBBF24",
    },
    "physics": {
        "bg": "#0A0810", "surface": "#14101E",
        "text": "#E8E4F2", "textBright": "#FAF8FF", "textMuted": "#B0A8C8", "textDim": "#8E86A4",
        "primary": "#A78BFA", "secondary": "#60A5FA", "danger": "#F43F5E", "warning": "#FBBF24",
    },
    "social": {
        "bg": "#100810", "surface": "#1E101E",
        "text": "#F0E4F0", "textBright": "#FFF8FF", "textMuted": "#C8A8C8", "textDim": "#A488A4",
        "primary": "#F472B6", "secondary": "#C084FC", "danger": "#F43F5E", "warning": "#FBBF24",
    },
    "crime": {
        "bg": "#0A0E1A", "surface": "#151A2E",
        "text": "#E8EAF0", "textBright": "#FFFDF0", "textMuted": "#A0A7BE", "textDim": "#7E8598",
        "primary": "#E8B931", "secondary": "#60A5FA", "danger": "#F43F5E", "warning": "#FBBF24",
    },
    "general": {
        "bg": "#0A0A14", "surface": "#141420",
        "text": "#E8EAF0", "textBright": "#FFFDF0", "textMuted": "#B0B8C8", "textDim": "#8890A4",
        "primary": "#FBBF24", "secondary": "#60A5FA", "danger": "#F43F5E", "warning": "#FB923C",
    },
}

# Keywords for domain detection
DOMAIN_KEYWORDS = {
    "technology": [
        "code", "software", "algorithm", "api", "database", "server", "cloud", "programming",
        "docker", "kubernetes", "devops", "frontend", "backend", "javascript", "python", "react",
        "machine learning", "neural", "deep learning", "gpu", "cpu", "compiler", "runtime",
        "microservice", "monolith", "deploy", "CI/CD", "git", "framework", "library",
        "AI", "artificial intelligence", "LLM", "GPT", "token", "model", "training",
        "công nghệ", "lập trình", "phần mềm", "thuật toán", "trí tuệ nhân tạo",
    ],
    "economics": [
        "economy", "inflation", "GDP", "market", "trade", "fiscal", "monetary", "interest rate",
        "stock", "bond", "currency", "recession", "growth", "supply", "demand", "price",
        "tax", "tariff", "deficit", "surplus", "unemployment", "wage",
        "kinh tế", "lạm phát", "thị trường", "thương mại", "tài chính", "ngân hàng",
        "lãi suất", "thuế", "GDP", "tỷ giá", "đầu tư", "chứng khoán",
    ],
    "history": [
        "century", "ancient", "empire", "dynasty", "war", "revolution", "colonial",
        "civilization", "medieval", "renaissance", "kingdom", "archaeological",
        "thế kỷ", "cổ đại", "đế chế", "triều đại", "chiến tranh", "cách mạng",
        "lịch sử", "văn minh", "thời trung cổ", "phong kiến",
    ],
    "geography": [
        "continent", "ocean", "climate", "terrain", "mountain", "river", "desert",
        "island", "earthquake", "volcano", "glacier", "biome", "latitude", "longitude",
        "địa lý", "lục địa", "đại dương", "khí hậu", "núi", "sông", "sa mạc",
    ],
    "biology": [
        "cell", "DNA", "gene", "protein", "organism", "species", "evolution",
        "bacteria", "virus", "enzyme", "metabolism", "photosynthesis", "ecosystem",
        "neuron", "brain", "heart", "immune", "vaccine", "medicine", "disease",
        "tế bào", "gen", "sinh vật", "tiến hóa", "vi khuẩn", "virus", "y học",
    ],
    "physics": [
        "quantum", "relativity", "gravity", "particle", "wave", "energy", "force",
        "velocity", "acceleration", "thermodynamics", "entropy", "photon", "electron",
        "equation", "formula", "theorem", "calculus", "algebra", "geometry",
        "vật lý", "lượng tử", "hấp dẫn", "năng lượng", "toán học", "phương trình",
    ],
    "social": [
        "society", "politics", "policy", "government", "democracy", "rights",
        "inequality", "justice", "welfare", "education", "poverty", "immigration",
        "xã hội", "chính trị", "chính sách", "dân chủ", "quyền", "bất bình đẳng",
    ],
    "crime": [
        "crime", "murder", "investigation", "detective", "suspect", "evidence",
        "forensic", "witness", "alibi", "motive", "arrest", "trial", "verdict",
        "police", "FBI", "case", "victim", "scene", "confession",
        "tội phạm", "điều tra", "nghi phạm", "bằng chứng", "pháp y", "nhân chứng",
        "vụ án", "thám tử", "hình sự",
    ],
}


def detect_domain(sections: list) -> str:
    """
    Detect the content domain from all sections' narration text.
    Returns the domain with highest keyword match score.
    """
    # Combine all narration text
    all_text = " ".join(
        s.get("narration", "") + " " + s.get("tagged_narration", "") + " " + s.get("title", "")
        for s in sections
    ).lower()

    scores = {}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw.lower() in all_text)
        scores[domain] = score

    best_domain = max(scores, key=scores.get)
    best_score = scores[best_domain]

    # Need at least 3 keyword matches to assign a domain
    if best_score < 3:
        return "general"

    return best_domain


def load_spec_generator_prompt() -> str:
    """Load the SPEC_GENERATOR.md master prompt."""
    prompt_path = PROMPTS_DIR / "SPEC_GENERATOR.md"
    if not prompt_path.exists():
        print(f"[ERROR] SPEC_GENERATOR.md not found at: {prompt_path}")
        sys.exit(1)
    return prompt_path.read_text(encoding="utf-8")


def load_context_docs() -> str:
    """Load component-registry.md and design-system.md for Gemini context."""
    context_parts = []

    registry_path = DOCS_DIR / "component-registry.md"
    if registry_path.exists():
        context_parts.append(f"## COMPONENT REGISTRY\n\n{registry_path.read_text(encoding='utf-8')}")

    design_path = DOCS_DIR / "design-system.md"
    if design_path.exists():
        context_parts.append(f"## DESIGN SYSTEM\n\n{design_path.read_text(encoding='utf-8')}")

    return "\n\n---\n\n".join(context_parts)


def call_gemini_for_section(
    system_prompt: str,
    section_json: dict,
    previous_section_summary: str,
    video_metadata: dict,
    context_docs: str,
    max_retries: int = 3
) -> dict:
    """
    Call Gemini for one section of the annotated.json.
    Returns parsed response with spec markdown.
    Retries on 503 with exponential backoff.
    """
    try:
        from google import genai
    except ImportError:
        print("[ERROR] google-genai package not installed.")
        print("Run: pip install google-genai")
        sys.exit(1)

    client = genai.Client(api_key=GEMINI_API_KEY)

    # Build input JSON for this section
    section_input = {
        "section": section_json,
        "previous_section_summary": previous_section_summary,
        "video_metadata": video_metadata
    }

    # Replace the placeholder in system prompt with actual section data
    full_prompt = system_prompt.replace(
        "{{ANNOTATED_SECTION_JSON}}",
        json.dumps(section_input, indent=2, ensure_ascii=False)
    )

    # Append context docs
    full_prompt += f"\n\n---\n\n## REFERENCE DOCUMENTS (component registry + design system)\n\n{context_docs}"

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=full_prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": {
                        "type": "object",
                        "properties": {
                            "spec": {
                                "type": "string",
                                "description": "Full spec section as markdown"
                            },
                            "spec_notes": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Decisions without full 4-reference basis"
                            },
                            "visual_blocks_json": {
                                "type": "string",
                                "description": "JSON string of visual_blocks array for scene builder"
                            }
                        },
                        "required": ["spec", "spec_notes", "visual_blocks_json"]
                    }
                }
            )

            return json.loads(response.text)

        except Exception as e:
            error_str = str(e)
            if "503" in error_str and attempt < max_retries - 1:
                wait_time = (attempt + 1) * 15  # 15s, 30s, 45s
                print(f"   [RETRY] 503 overloaded — waiting {wait_time}s (attempt {attempt + 1}/{max_retries})...")
                time.sleep(wait_time)
            else:
                print(f"   [ERROR] Gemini API call failed: {e}")
                return None


def build_spec_header(annotated: dict, format_type: str, domain: str = "general", palette: dict = None) -> str:
    """Build the spec header with domain palette."""
    slug = annotated["slug"]
    resolution = "1080x1920 (9:16)" if format_type == "short-form" else "1920x1080 (16:9)"
    palette = palette or DOMAIN_PALETTES["general"]

    header = f"""# {slug.replace('-', ' ').title()}

## Overview
- **Slug**: {slug}
- **Format**: {format_type}
- **Audio file**: output/{slug}/audio.mp3
- **Timestamps file**: output/{slug}/timestamps.json
- **Total frames**: {annotated['audio_duration_frames']} (from annotated.json)
- **Audio duration**: {annotated['audio_duration_seconds']}s ({annotated['audio_duration_seconds']/60:.1f} min)
- **Resolution**: {resolution} @ {annotated['fps']}fps
- **Frame number convention**: Global
- **Content domain**: {domain}

## Domain Palette — {domain.title()}
```typescript
export const COLORS = {{
  bg: '{palette["bg"]}',
  bgNoir: '{palette["bg"]}',
  surface: '{palette["surface"]}',
  text: '{palette["text"]}',
  textBright: '{palette["textBright"]}',
  textMuted: '{palette["textMuted"]}',
  textDim: '{palette["textDim"]}',
  primary: '{palette["primary"]}',
  secondary: '{palette["secondary"]}',
  danger: '{palette["danger"]}',
  warning: '{palette["warning"]}',
}} as const;
```
**Use these exact colors in all components. Never fall back to base palette defaults.**

## calculateMetadata
```typescript
export const calculateMetadata: CalculateMetadataFunction<Props> = async ({{ props }}) => {{
  const durationInSeconds = await getAudioDurationInSeconds(props.audioSrc);
  return {{
    durationInFrames: Math.ceil(durationInSeconds * {annotated['fps']}),
    fps: {annotated['fps']},
    width: {'1080' if format_type == 'short-form' else '1920'},
    height: {'1920' if format_type == 'short-form' else '1080'},
  }};
}};
```

## Audio Integration
```typescript
<Audio src={{staticFile("audio/{slug}.mp3")}} />
```

## Visual-First Rule
No captions/subtitles. Visual storytelling only:
- Max 20% text beats (always with icon companion), min 70% SVG/icon/3D/chart beats
- Every keyword/concept → inline SVG icon
- Scene layout must vary (8 layouts: centered, split-h, split-v, grid, radial, stacked, floating, cinematic)

---

"""
    return header


def main():
    parser = argparse.ArgumentParser(description="Generate animation spec via Gemini")
    parser.add_argument("slug", help="Video slug (matches output/<slug>/ folder)")
    parser.add_argument("--format", choices=["short-form", "long-form"], default="long-form",
                        help="Video format (default: long-form)")
    args = parser.parse_args()

    slug = args.slug
    format_type = args.format

    # Paths — all in output/<slug>/
    slug_dir = OUTPUT_DIR / slug
    annotated_path = slug_dir / "annotated.json"
    spec_output_path = slug_dir / "spec.md"
    vb_output_path = slug_dir / "visual-blocks.json"

    # ── Check input ──
    if not annotated_path.exists():
        print(f"[ERROR] Annotated JSON not found: {annotated_path}")
        print(f"Run the aligner first: python 03_aligner.py {slug}")
        sys.exit(1)

    # ── Load inputs ──
    print(f"[1/4] Loading annotated.json: {annotated_path.name}")
    with open(annotated_path, "r", encoding="utf-8") as f:
        annotated = json.load(f)

    sections = annotated.get("sections", [])
    print(f"   {len(sections)} sections to process")
    print(f"   Audio: {annotated['audio_duration_seconds']:.1f}s ({annotated['audio_duration_frames']} frames)")

    # ── Load system prompt and docs ──
    print(f"[2/4] Loading SPEC_GENERATOR prompt and reference docs...")
    system_prompt = load_spec_generator_prompt()
    context_docs = load_context_docs()

    # ── Video metadata ──
    video_metadata = {
        "format": format_type,
        "resolution": "1080x1920" if format_type == "short-form" else "1920x1080",
        "fps": annotated["fps"],
        "audio_file": "audio.mp3"
    }

    # ── Build all_sections_summary for arc detection ──
    all_sections_summary = " | ".join(
        f"S{s['section_id']}: {s.get('title', s.get('narration', '')[:60])}"
        for s in sections
    )

    # ── Detect content domain and select palette ──
    detected_domain = detect_domain(sections)
    domain_palette = DOMAIN_PALETTES[detected_domain]
    print(f"   Domain detected: {detected_domain}")
    print(f"   Palette: bg={domain_palette['bg']} primary={domain_palette['primary']} secondary={domain_palette['secondary']}")

    # ── Infer section roles and energy levels ──
    total = len(sections)
    for i, s in enumerate(sections):
        # section_role: hook / build / peak / resolution / close
        if i == 0:
            s["_role"] = "hook"
        elif i == total - 1:
            s["_role"] = "close"
        elif i == total - 2:
            s["_role"] = "resolution"
        elif i >= total * 0.5 and i <= total * 0.7:
            s["_role"] = "peak"
        else:
            s["_role"] = "build"

        # energy_level: low / medium / high / peak
        beat_count = len(s.get("beats", []))
        duration = s["end_time_seconds"] - s["start_time_seconds"]
        density = beat_count / max(duration, 1) * 3  # beats per 3s
        if density >= 6:
            s["_energy"] = "peak"
        elif density >= 4:
            s["_energy"] = "high"
        elif density >= 2:
            s["_energy"] = "medium"
        else:
            s["_energy"] = "low"

    # ── Build spec header ──
    spec_content = build_spec_header(annotated, format_type, detected_domain, domain_palette)

    # ── Process each section ──
    print(f"[3/4] Generating spec for each section via Gemini ({GEMINI_MODEL})...")
    all_notes = []
    all_visual_blocks = {}
    previous_summary = "Video starts. Clean screen, dark background."

    for i, section in enumerate(sections):
        section_num = section["section_id"]
        duration = section["end_time_seconds"] - section["start_time_seconds"]
        beat_count = len(section.get("beats", []))

        print(f"\n   Section {section_num}/{len(sections)}: "
              f"{section['start_time_seconds']:.1f}s-{section['end_time_seconds']:.1f}s "
              f"({duration:.1f}s, {beat_count} beats) "
              f"[{section.get('_role', '?')}/{section.get('_energy', '?')}]")
        print(f"   Calling Gemini...")

        # Enrich section with new fields for SPEC_GENERATOR
        section["all_sections_summary"] = all_sections_summary
        section["section_role"] = section.pop("_role", "build")
        section["energy_level"] = section.pop("_energy", "medium")
        section["domain"] = detected_domain
        section["domain_palette"] = domain_palette

        # Infer arc_type from content patterns
        narration = section.get("narration", "").lower()
        if any(w in narration for w in ["thực ra", "but actually", "không phải", "myth"]):
            section["arc_type"] = "myth-bust"
        elif any(w in narration for w in ["so sánh", "vs", "compared", "contrast"]):
            section["arc_type"] = "contrast"
        elif any(w in narration for w in ["%", "tỷ", "trillion", "billion", "số liệu"]):
            section["arc_type"] = "data-driven"
        elif any(w in narration for w in ["câu chuyện", "story", "journey", "hành trình"]):
            section["arc_type"] = "story"
        elif any(w in narration for w in ["tăng", "escalat", "worse", "crisis"]):
            section["arc_type"] = "escalation"
        else:
            section["arc_type"] = "revelation"

        result = call_gemini_for_section(
            system_prompt=system_prompt,
            section_json=section,
            previous_section_summary=previous_summary,
            video_metadata=video_metadata,
            context_docs=context_docs
        )

        if result:
            section_spec = result.get("spec", "")
            notes = result.get("spec_notes", [])

            # Parse visual_blocks
            vb_json_str = result.get("visual_blocks_json", "[]")
            try:
                visual_blocks = json.loads(vb_json_str) if isinstance(vb_json_str, str) else vb_json_str
                if not isinstance(visual_blocks, list):
                    visual_blocks = []
                for vb in visual_blocks:
                    if 'elements' in vb:
                        vb['elements'] = [e for e in vb['elements'] if e and len(e) > 0]
            except (json.JSONDecodeError, TypeError) as e:
                print(f"   [WARNING] Failed to parse visual_blocks_json: {e}")
                visual_blocks = []

            if section_spec:
                spec_content += section_spec + "\n\n---\n\n"
                print(f"   [OK] Section {section_num} spec generated ({len(section_spec)} chars)")
            else:
                print(f"   [WARNING] Empty spec for section {section_num}")
                spec_content += f"### Section {section_num}: [GENERATION FAILED]\n\n---\n\n"

            if visual_blocks:
                all_visual_blocks[section_num] = visual_blocks
                phase_labels = [vb.get("phase", "?") for vb in visual_blocks]
                print(f"   [OK] Visual blocks: {len(visual_blocks)} phases ({', '.join(phase_labels)})")

            if notes:
                all_notes.extend([f"Section {section_num}: {n}" for n in notes])
                for note in notes:
                    print(f"     Note: {note}")

            # Update summary for continuity
            spec_lines = section_spec.strip().split('\n')
            previous_summary = ' '.join(spec_lines[-5:]) if len(spec_lines) >= 5 else section_spec[-300:]
        else:
            print(f"   [FAILED] Section {section_num} generation failed!")
            spec_content += f"### Section {section_num}: [GENERATION FAILED — retry manually]\n\n---\n\n"
            previous_summary = f"Section {section_num} failed to generate."

    # ── Append notes ──
    if all_notes:
        spec_content += "\n## Spec Generation Notes\n\n"
        for note in all_notes:
            spec_content += f"- {note}\n"

    # ── Save spec markdown ──
    print(f"\n[4/4] Saving outputs...")
    spec_output_path.write_text(spec_content, encoding="utf-8")

    print(f"\n   Spec saved: {spec_output_path}")
    print(f"   Total length: {len(spec_content)} chars")
    print(f"   Sections: {len(sections)}")

    # ── Save visual_blocks JSON ──
    if all_visual_blocks:
        vb_output = {
            "slug": slug,
            "format": format_type,
            "fps": annotated["fps"],
            "resolution": video_metadata["resolution"],
            "audio_file": "audio.mp3",
            "total_frames": annotated["audio_duration_frames"],
            "total_duration_seconds": annotated["audio_duration_seconds"],
            "domain": detected_domain,
            "domain_palette": domain_palette,
            "sections": []
        }
        for section in sections:
            sid = section["section_id"]
            if sid in all_visual_blocks:
                vb_output["sections"].append({
                    "section_id": sid,
                    "start_frame": section["start_frame"],
                    "end_frame": section["end_frame"],
                    "start_time_seconds": section["start_time_seconds"],
                    "end_time_seconds": section["end_time_seconds"],
                    "narration": section.get("narration", ""),
                    "beats": section.get("beats", []),
                    "visual_blocks": all_visual_blocks[sid]
                })

        with open(vb_output_path, "w", encoding="utf-8") as f:
            json.dump(vb_output, f, indent=2, ensure_ascii=False)
        print(f"   Visual blocks saved: {vb_output_path}")

    print(f"\n[DONE] Next step: Build Remotion composition from spec")
    print(f"  Spec: {spec_output_path}")
    if all_visual_blocks:
        print(f"  Visual blocks: {vb_output_path}")


if __name__ == "__main__":
    main()
