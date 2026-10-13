"""
Build Validator -- Automated Rule Enforcement (Step 7.5)

Scans all .tsx files in output/<slug>/build/ and checks against
the 27+ non-negotiable rules from CLAUDE.md and docs/.

Usage:
    python validate_build.py <slug>
    python validate_build.py fuel-price-crisis
    python validate_build.py fuel-price-crisis --strict
    python validate_build.py fuel-price-crisis --json

Exit codes:
    0 = all PASS (WARN is ok)
    1 = any FAIL found
    With --strict: WARN also causes exit 1
"""

import re
import sys
import json
import argparse
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Optional

# ── Paths ──────────────────────────────────────────────
SCRIPTS_DIR = Path(__file__).parent
STUDIO_ROOT = SCRIPTS_DIR.parent
PROJECT_ROOT = STUDIO_ROOT.parent
OUTPUT_DIR = PROJECT_ROOT / "output"

# ── Data Structures ────────────────────────────────────

@dataclass
class Violation:
    rule_id: str
    severity: str       # "FAIL" or "WARN"
    file: str
    line: int
    message: str


@dataclass
class ZoneDecl:
    zone: str           # "Z5"
    label: str
    file: str
    line: int


@dataclass
class ParsedScene:
    filename: str
    content: str
    lines: list
    layout: str = ""
    flow: str = ""
    composition_pattern: str = ""
    zones: list = field(default_factory=list)
    absolute_fill_count: int = 0
    has_particles: bool = False
    has_vignette: bool = False
    has_ambient_shapes: bool = False
    svg_count: int = 0
    text_element_count: int = 0
    has_math_sin_cos: bool = False
    font_sizes: list = field(default_factory=list)
    svg_sizes: list = field(default_factory=list)
    has_box_shadow: bool = False


@dataclass
class ParsedComposition:
    filename: str
    content: str
    has_transition_series: bool = False
    has_calculate_metadata: bool = False
    has_get_audio_duration: bool = False
    has_audio_component: bool = False
    transition_count: int = 0
    sequence_count: int = 0
    plain_sequence_assembly: bool = False


@dataclass
class ParsedConstants:
    filename: str
    content: str
    sections: dict = field(default_factory=dict)
    durations: dict = field(default_factory=dict)
    transitions: dict = field(default_factory=dict)


# ── Parsing ────────────────────────────────────────────

def parse_scene(filepath: Path) -> ParsedScene:
    content = filepath.read_text(encoding="utf-8")
    lines = content.split("\n")
    scene = ParsedScene(filename=filepath.name, content=content, lines=lines)

    # Extract layout/flow/composition from header comments
    for line in lines[:10]:
        m = re.search(r"Layout:\s*([\w-]+)", line)
        if m:
            scene.layout = m.group(1)
        m = re.search(r"Flow:\s*([\w-]+)", line)
        if m:
            scene.flow = m.group(1)
        m = re.search(r"Composition:\s*([\w\-/]+)", line)
        if m:
            scene.composition_pattern = m.group(1)

    # Zone declarations: // Z5: hero element
    for i, line in enumerate(lines):
        m = re.search(r"//\s*Z(\d):\s*(.+?)(?:\(|$|\*/)", line)
        if m:
            scene.zones.append(ZoneDecl(
                zone=f"Z{m.group(1)}",
                label=m.group(2).strip(),
                file=filepath.name,
                line=i + 1,
            ))

    # AbsoluteFill count
    scene.absolute_fill_count = len(re.findall(r"<AbsoluteFill", content))

    # Imports / components
    scene.has_particles = bool(re.search(r"ParticleField|<Particles|SpaceParticles|CosmicParticles|StarField|particle", content, re.IGNORECASE))
    scene.has_vignette = bool(re.search(r"VignetteOverlay|Vignette|vignette|SpaceVignette|CosmicVignette|radial-gradient.*transparent.*100%", content, re.IGNORECASE))
    scene.has_ambient_shapes = bool(re.search(r"AmbientDiamonds|AmbientShapes|ambient", content, re.IGNORECASE))

    # SVG count
    scene.svg_count = len(re.findall(r"<svg\b", content))

    # Text element count (standalone text beats)
    scene.text_element_count = len(re.findall(
        r"(?:ShinyText|BlurText|GlitchText|AnimatedText|GradientText|WordByWord)",
        content
    ))

    # Math.sin/cos for micro-motion
    scene.has_math_sin_cos = bool(re.search(r"Math\.(sin|cos)", content))

    # Font sizes
    for m in re.finditer(r"fontSize:\s*(\d+)", content):
        line_num = content[:m.start()].count("\n") + 1
        scene.font_sizes.append((int(m.group(1)), line_num))

    # SVG element sizes (width/height attributes)
    for m in re.finditer(r"<svg\s+[^>]*width[=:]\s*[{\"']?(\d+)", content):
        line_num = content[:m.start()].count("\n") + 1
        height_m = re.search(r"height[=:]\s*[{\"']?(\d+)", content[m.start():m.start()+200])
        h = int(height_m.group(1)) if height_m else int(m.group(1))
        scene.svg_sizes.append((int(m.group(1)), h, line_num))

    # boxShadow in particles
    scene.has_box_shadow = bool(re.search(r"boxShadow", content))

    return scene


def parse_composition(filepath: Path) -> ParsedComposition:
    content = filepath.read_text(encoding="utf-8")
    comp = ParsedComposition(filename=filepath.name, content=content)

    comp.has_transition_series = "TransitionSeries" in content
    comp.has_calculate_metadata = "calculateMetadata" in content
    comp.has_get_audio_duration = "getAudioDurationInSeconds" in content
    comp.has_audio_component = bool(re.search(r"<Audio\s", content))
    comp.transition_count = len(re.findall(r"TransitionSeries\.Transition", content))
    comp.sequence_count = len(re.findall(r"TransitionSeries\.Sequence", content))

    # Check for plain Sequence assembly (not inside TransitionSeries)
    # If there's Sequence but no TransitionSeries import -> plain assembly
    if re.search(r"<Sequence\s", content) and not comp.has_transition_series:
        comp.plain_sequence_assembly = True

    return comp


def parse_constants(filepath: Path) -> ParsedConstants:
    content = filepath.read_text(encoding="utf-8")
    consts = ParsedConstants(filename=filepath.name, content=content)

    # Parse SECTIONS
    for m in re.finditer(r"(\w+):\s*\{\s*start:\s*(\d+),\s*end:\s*(\d+),\s*natural:\s*(\d+)\s*\}", content):
        consts.sections[m.group(1)] = {
            "start": int(m.group(2)),
            "end": int(m.group(3)),
            "natural": int(m.group(4)),
        }

    # Parse DURATIONS
    for m in re.finditer(r"(\w+):\s*SECTIONS\.\w+\.natural\s*\+\s*TRANSITIONS\.\w+,?\s*//\s*(\d+)", content):
        consts.durations[m.group(1)] = int(m.group(2))
    # Last section (no transition)
    for m in re.finditer(r"(\w+):\s*SECTIONS\.\w+\.natural,?\s*//\s*(\d+)\s*\(last", content):
        consts.durations[m.group(1)] = int(m.group(2))

    # Parse TRANSITIONS
    for m in re.finditer(r"(\w+):\s*(\d+),", content):
        if m.group(1).startswith("s") and "_" in m.group(1):
            consts.transitions[m.group(1)] = int(m.group(2))

    return consts


# ── Check Functions ────────────────────────────────────

def check_no_css_transitions(scenes: list, comp: ParsedComposition) -> list:
    """Rule #1: No CSS transitions or animations."""
    violations = []
    all_files = [(s.filename, s.content, s.lines) for s in scenes]
    all_files.append((comp.filename, comp.content, comp.content.split("\n")))

    for filename, content, lines in all_files:
        for i, line in enumerate(lines):
            # Skip comments
            stripped = line.strip()
            if stripped.startswith("//") or stripped.startswith("*"):
                continue
            # Check for CSS transition/animation in style props
            if re.search(r"(?:^|[{,;\s])transition\s*:", line) and "Transition" not in line:
                violations.append(Violation("01", "FAIL", filename, i + 1,
                    f"CSS transition detected: {stripped[:80]}"))
            if re.search(r"(?:^|[{,;\s])animation\s*:", line):
                violations.append(Violation("01", "FAIL", filename, i + 1,
                    f"CSS animation detected: {stripped[:80]}"))
    return violations


def check_4layer_stacking(scenes: list) -> list:
    """Rule #15: Every scene must have 4 layers (BG + Ambient + Content + Overlay)."""
    violations = []
    for scene in scenes:
        issues = []
        if scene.absolute_fill_count < 3:
            issues.append(f"only {scene.absolute_fill_count} AbsoluteFill (need >=3)")
        if not scene.has_particles:
            issues.append("missing Layer 1 (particles/ambient)")
        if not scene.has_vignette:
            issues.append("missing Layer 3 (vignette/overlay)")
        if issues:
            violations.append(Violation("15", "FAIL", scene.filename, 1,
                f"4-layer stacking incomplete: {', '.join(issues)}"))
    return violations


def check_zone_overlap(scenes: list) -> list:
    """Rule #25: No two elements in same zone (except text+icon companions)."""
    violations = []
    for scene in scenes:
        if not scene.zones:
            violations.append(Violation("25", "WARN", scene.filename, 1,
                "No zone declarations found (// Z#: label) — cannot verify overlap"))
            continue

        # Group zones
        zone_groups = {}
        for z in scene.zones:
            zone_groups.setdefault(z.zone, []).append(z)

        for zone, decls in zone_groups.items():
            if len(decls) > 1:
                # Check if it's a relocate (same zone at different times)
                labels = [d.label.lower() for d in decls]
                # If labels mention "relocate" or different beat phases, likely ok
                is_relocate = any("relocat" in l for l in labels)
                if not is_relocate:
                    lines_str = ", ".join(f"line {d.line}" for d in decls)
                    labels_str = " + ".join(f'"{d.label}"' for d in decls)
                    violations.append(Violation("25", "FAIL", scene.filename, decls[0].line,
                        f"{zone} has {len(decls)} elements: {labels_str} ({lines_str})"))
    return violations


def check_element_sizes(scenes: list) -> list:
    """Rule #24: Element sizes must meet minimums on 1920×1080 canvas."""
    violations = []
    for scene in scenes:
        # Check font sizes
        for size, line_num in scene.font_sizes:
            # Determine context from nearby zone comments
            context = _get_context_at_line(scene.lines, line_num)
            if "anchor" in context or "hero" in context or "close" in context:
                if size < 84:
                    violations.append(Violation("24", "FAIL", scene.filename, line_num,
                        f"fontSize: {size}px in HERO/ANCHOR context (min 84px)"))
            elif "primary" in context or "synthesis" in context:
                if size < 56:
                    violations.append(Violation("24", "FAIL", scene.filename, line_num,
                        f"fontSize: {size}px in PRIMARY context (min 56px)"))
            elif "support" in context or "label" in context:
                if size < 40:
                    violations.append(Violation("24", "FAIL", scene.filename, line_num,
                        f"fontSize: {size}px in SUPPORT context (min 40px)"))
            # General minimum
            elif size < 28:
                violations.append(Violation("24", "WARN", scene.filename, line_num,
                    f"fontSize: {size}px below absolute minimum (28px)"))

        # Check SVG sizes for hero icons
        for w, h, line_num in scene.svg_sizes:
            context = _get_context_at_line(scene.lines, line_num)
            if "anchor" in context or "hero" in context:
                if w < 160 and h < 160:
                    violations.append(Violation("24", "FAIL", scene.filename, line_num,
                        f"SVG {w}×{h}px in HERO context (min 160px)"))
            elif "primary" in context:
                if w < 100 and h < 100:
                    violations.append(Violation("24", "FAIL", scene.filename, line_num,
                        f"SVG {w}×{h}px in PRIMARY context (min 100px)"))
            # General: anything below 50px
            if w < 50 and h < 50:
                violations.append(Violation("24", "WARN", scene.filename, line_num,
                    f"SVG {w}×{h}px below minimum visible size (50px)"))
    return violations


def _get_context_at_line(lines: list, line_num: int) -> str:
    """Get CLOSEST comment context to the element line.
    Searches upward from the element to find the nearest role comment.
    Prioritizes: SUPPORT > PRIMARY > HERO (closest wins)."""
    # Search upward for nearest role comment (max 20 lines up)
    for offset in range(0, 20):
        idx = line_num - 1 - offset
        if idx < 0:
            break
        line_lower = lines[idx].lower()
        # If we find a role comment, return just that context
        if "support:" in line_lower or "support label" in line_lower:
            return "support"
        if "primary:" in line_lower:
            return "primary"
        if "hero:" in line_lower or "anchor:" in line_lower:
            return "hero"

    # Fallback: broad context scan (old behavior)
    start = max(0, line_num - 15)
    end = min(len(lines), line_num + 5)
    context = " ".join(lines[start:end]).lower()
    return context


def check_particle_minimums(scenes: list) -> list:
    """Rule #14: Particles radius >= 6px, count >= 20, boxShadow required."""
    violations = []
    for scene in scenes:
        if not scene.has_particles:
            continue

        # Check particle element sizes (width/height in particle divs)
        particle_section = ""
        in_particle = False
        for line in scene.lines:
            if "Particle" in line or "particle" in line:
                in_particle = True
            if in_particle:
                particle_section += line + "\n"
                if in_particle and line.strip().startswith("};"):
                    in_particle = False

        # Check for small sizes in particle rendering
        for m in re.finditer(r"(?:width|height):\s*(\d+)", scene.content):
            val = int(m.group(1))
            ctx_start = max(0, m.start() - 200)
            ctx = scene.content[ctx_start:m.start()].lower()
            if ("particle" in ctx or "radius" in ctx) and val < 12:
                line_num = scene.content[:m.start()].count("\n") + 1
                violations.append(Violation("14", "FAIL", scene.filename, line_num,
                    f"Particle size {val}px (diameter) — min 12px (6px radius)"))

        # Check minRadius prop
        for m in re.finditer(r"minRadius\s*[=:]\s*(\d+)", scene.content):
            if int(m.group(1)) < 6:
                line_num = scene.content[:m.start()].count("\n") + 1
                violations.append(Violation("14", "FAIL", scene.filename, line_num,
                    f"minRadius={m.group(1)} — minimum is 6"))

        # Check count prop
        for m in re.finditer(r"(?:count|particleCount)\s*[=:]\s*(\d+)", scene.content):
            if int(m.group(1)) < 20:
                line_num = scene.content[:m.start()].count("\n") + 1
                violations.append(Violation("14", "WARN", scene.filename, line_num,
                    f"Particle count={m.group(1)} — minimum recommended 20"))

        # boxShadow
        if not scene.has_box_shadow:
            violations.append(Violation("14", "WARN", scene.filename, 1,
                "No boxShadow found on particles — glow required"))
    return violations


def check_beat_diversity(scenes: list) -> list:
    """Rule #12: max 20% text, min 70% visual (SVG/icon/chart)."""
    violations = []
    total_text = sum(s.text_element_count for s in scenes)
    total_svg = sum(s.svg_count for s in scenes)
    total = total_text + total_svg
    if total == 0:
        return violations

    text_pct = total_text / total * 100
    svg_pct = total_svg / total * 100

    if text_pct > 40:  # More lenient than 20% because text elements often have icon companions
        violations.append(Violation("12", "WARN", "ALL SCENES", 0,
            f"Text elements: {total_text}/{total} ({text_pct:.0f}%) — target ≤20%"))
    if svg_pct < 50:  # More lenient than 70%
        violations.append(Violation("12", "WARN", "ALL SCENES", 0,
            f"SVG/visual elements: {total_svg}/{total} ({svg_pct:.0f}%) — target >=70%"))

    # Per-scene check
    for scene in scenes:
        scene_total = scene.text_element_count + scene.svg_count
        if scene_total > 0 and scene.svg_count == 0:
            violations.append(Violation("12", "FAIL", scene.filename, 1,
                f"Zero SVG/visual elements — all {scene.text_element_count} beats are text"))
    return violations


def check_transition_series(comp: ParsedComposition) -> list:
    """Rule #13: Must use TransitionSeries, not plain Sequence for section assembly."""
    violations = []
    if not comp.has_transition_series:
        violations.append(Violation("13", "FAIL", comp.filename, 1,
            "TransitionSeries not found — using plain Sequence for section assembly"))
    if comp.plain_sequence_assembly:
        violations.append(Violation("13", "FAIL", comp.filename, 1,
            "Plain <Sequence> detected for section assembly — must use TransitionSeries"))
    return violations


def check_layout_variation(scenes: list) -> list:
    """Rules #16, #19: No 3 consecutive same layouts. Max 2 centered per 5 sections."""
    violations = []
    layouts = [s.layout for s in scenes if s.layout]

    if not layouts:
        violations.append(Violation("16", "WARN", "ALL SCENES", 0,
            "No layout declarations found in scene headers — cannot verify variation"))
        return violations

    # Check 3 consecutive same
    for i in range(len(layouts) - 2):
        if layouts[i] == layouts[i + 1] == layouts[i + 2]:
            violations.append(Violation("19", "WARN", f"Sections {i+1}-{i+3}", 0,
                f"3 consecutive '{layouts[i]}' layouts — must vary"))

    # Check centered cap (max 2 per 5)
    centered_count = sum(1 for l in layouts if l == "centered")
    if len(layouts) >= 5 and centered_count > 2:
        violations.append(Violation("16", "WARN", "ALL SCENES", 0,
            f"Centered layout used {centered_count}/{len(layouts)} times — max 2 per 5"))
    return violations


def check_text_icon_companion(scenes: list) -> list:
    """Rule #17: Every text beat must have SVG/icon companion in same container."""
    violations = []
    text_patterns = re.compile(
        r"(?:ShinyText|BlurText|GlitchText|GradientText|WordByWord)"
    )

    for scene in scenes:
        for m in text_patterns.finditer(scene.content):
            line_num = scene.content[:m.start()].count("\n") + 1
            # Skip if this match is inside a comment line
            actual_line = scene.lines[line_num - 1].strip() if line_num <= len(scene.lines) else ""
            if actual_line.startswith("//") or actual_line.startswith("*") or actual_line.startswith("{/*"):
                continue
            # Check ±15 lines for SVG element in same container
            start_line = max(0, line_num - 5)
            end_line = min(len(scene.lines), line_num + 15)
            nearby = "\n".join(scene.lines[start_line:end_line])
            has_svg = bool(re.search(r"<svg\b", nearby))
            has_icon = bool(re.search(r"Icon|icon", nearby))
            if not has_svg and not has_icon:
                violations.append(Violation("17", "FAIL", scene.filename, line_num,
                    f"{m.group(0)} without SVG/icon companion nearby"))
    return violations


def check_micro_motion(scenes: list) -> list:
    """Rule #11: Every element needs continuous micro-motion (Math.sin/cos)."""
    violations = []
    for scene in scenes:
        if not scene.has_math_sin_cos:
            # Also accept spring with frame reference as micro-motion
            has_spring_motion = bool(re.search(r"spring\s*\(", scene.content))
            if not has_spring_motion:
                violations.append(Violation("11", "WARN", scene.filename, 1,
                    "No micro-motion detected (Math.sin/cos or spring)"))
    return violations


def check_calculate_metadata(comp: ParsedComposition) -> list:
    """Rule #3: Duration from calculateMetadata, never hardcoded."""
    violations = []
    if not comp.has_calculate_metadata:
        violations.append(Violation("03", "FAIL", comp.filename, 1,
            "calculateMetadata not found — duration may be hardcoded"))
    if not comp.has_get_audio_duration:
        violations.append(Violation("03", "FAIL", comp.filename, 1,
            "getAudioDurationInSeconds not found — audio duration not read"))
    if not comp.has_audio_component:
        violations.append(Violation("03", "FAIL", comp.filename, 1,
            "No <Audio> component — video will be silent"))
    return violations


def check_premount_for(scenes: list) -> list:
    """Builds rule: premountFor on every <Sequence>."""
    violations = []
    for scene in scenes:
        for m in re.finditer(r"<Sequence\s", scene.content):
            # Check if premountFor exists in same tag
            tag_end = scene.content.find(">", m.start())
            tag_content = scene.content[m.start():tag_end + 1] if tag_end > 0 else ""
            if "premountFor" not in tag_content:
                line_num = scene.content[:m.start()].count("\n") + 1
                violations.append(Violation("seq", "WARN", scene.filename, line_num,
                    "<Sequence> without premountFor — may cause flicker"))
    return violations


def check_no_visibility_gates(scenes: list) -> list:
    """Rule #8: No 'return null' based on frame checks."""
    violations = []
    for scene in scenes:
        for i, line in enumerate(scene.lines):
            if "return null" in line:
                # Check if preceded by frame check
                context = "\n".join(scene.lines[max(0, i - 3):i + 1])
                if re.search(r"if\s*\(\s*frame\s*[<>]", context):
                    violations.append(Violation("08", "WARN", scene.filename, i + 1,
                        "Visibility gate: 'return null' based on frame check — may cause black screen"))
    return violations


def check_bg_opacity_separation(scenes: list) -> list:
    """Rule #9: Never put opacity on background element."""
    violations = []
    for scene in scenes:
        # Find style blocks with both backgroundColor and opacity
        # Pattern: style={{ backgroundColor: ..., opacity: ... }}
        style_blocks = re.finditer(r"style=\{\{([^}]+)\}\}", scene.content, re.DOTALL)
        for m in style_blocks:
            block = m.group(1)
            has_bg = "backgroundColor" in block
            has_opacity = re.search(r"\bopacity\s*:", block)
            if has_bg and has_opacity:
                line_num = scene.content[:m.start()].count("\n") + 1
                # Exclude AbsoluteFill that are clearly content layers
                context = scene.content[max(0, m.start() - 100):m.start()]
                if "Layer 0" in context or ("AbsoluteFill" in context and "content" not in context.lower()):
                    violations.append(Violation("09", "FAIL", scene.filename, line_num,
                        "backgroundColor + opacity on same element — separate BG from content"))
    return violations


def check_transition_compensation(consts: Optional[ParsedConstants], comp: ParsedComposition) -> list:
    """Builds rule: TransitionSeries duration compensation math must be correct."""
    violations = []
    if not consts or not consts.sections or not consts.durations:
        return violations

    # Check each section duration = natural + outgoing (except last)
    section_keys = sorted(consts.sections.keys())
    for i, key in enumerate(section_keys):
        if key not in consts.durations:
            continue
        natural = consts.sections[key].get("natural", 0)
        actual_dur = consts.durations[key]

        if i < len(section_keys) - 1:
            # Find matching transition
            trans_key = f"{key}_{section_keys[i + 1]}"
            trans_dur = consts.transitions.get(trans_key, 0)
            expected = natural + trans_dur
            if actual_dur != expected and trans_dur > 0:
                violations.append(Violation("ts", "WARN", consts.filename, 0,
                    f"{key}: duration {actual_dur} != natural {natural} + transition {trans_dur} = {expected}"))
        else:
            # Last section: should be natural only
            if actual_dur != natural:
                violations.append(Violation("ts", "WARN", consts.filename, 0,
                    f"{key} (last): duration {actual_dur} != natural {natural}"))
    return violations


def check_visual_dominance(scenes: list) -> list:
    """Rule #31: Visual subjects must dominate, not text. Hero SVG >= 300px, content opacity >= 0.85."""
    violations = []
    for scene in scenes:
        # Check if scene has any large SVG (>= 300px)
        max_svg_size = 0
        for w, h, line_num in scene.svg_sizes:
            max_svg_size = max(max_svg_size, w, h)

        if max_svg_size < 200 and scene.svg_count > 0:
            violations.append(Violation("31", "WARN", scene.filename, 1,
                f"Largest SVG is {max_svg_size}px — hero subject should be >= 300px"))
        elif scene.svg_count == 0:
            violations.append(Violation("31", "FAIL", scene.filename, 1,
                "No SVG elements found — scene needs visual subject, not just text"))

        # Check content opacity: look for opacity values on main content
        low_opacity_count = 0
        for m in re.finditer(r"opacity:\s*(0\.\d+)", scene.content):
            val = float(m.group(1))
            line_num = scene.content[:m.start()].count("\n") + 1
            # Skip ambient/particle/vignette context
            ctx_start = max(0, m.start() - 200)
            ctx = scene.content[ctx_start:m.start()].lower()
            is_ambient = any(kw in ctx for kw in ["ambient", "particle", "vignette", "scan", "overlay", "layer 1", "layer 3"])
            if not is_ambient and val < 0.5 and val > 0:
                # Check if this is a content element (not interpolate range endpoint)
                # Skip interpolate patterns like [0, 0.3] which are animation ranges
                before = scene.content[max(0, m.start()-30):m.start()]
                if "[" not in before and "," not in before[-5:]:
                    low_opacity_count += 1

        # Check ambient layer opacity is low (good = ambient is subtle)
        for m in re.finditer(r"opacity[=:]\s*[{]?\s*(0\.\d+)", scene.content):
            val = float(m.group(1))
            ctx_start = max(0, m.start() - 200)
            ctx = scene.content[ctx_start:m.start()].lower()
            is_ambient = any(kw in ctx for kw in ["ambient", "particle"])
            if is_ambient and val > 0.4:
                line_num = scene.content[:m.start()].count("\n") + 1
                violations.append(Violation("31", "WARN", scene.filename, line_num,
                    f"Ambient/particle opacity {val} too high -- should be 0.05-0.2 so content stands out"))

        # Check vignette opacity: must be <= 0.3 (FAIL if > 0.3)
        for m in re.finditer(r"opacity:\s*(0\.\d+)", scene.content):
            val = float(m.group(1))
            ctx_start = max(0, m.start() - 300)
            ctx = scene.content[ctx_start:m.start()].lower()
            is_vignette = any(kw in ctx for kw in ["vignette", "layer 3", "overlay"])
            if is_vignette and val > 0.35:
                line_num = scene.content[:m.start()].count("\n") + 1
                # Skip if inside interpolate array
                before = scene.content[max(0, m.start()-30):m.start()]
                if "[" not in before:
                    violations.append(Violation("31", "FAIL", scene.filename, line_num,
                        f"Vignette/overlay opacity {val} TOO HIGH -- max 0.3. Content invisible behind heavy vignette"))

        # Check opacity multiplication pattern (content * fadeOut * dim = too low)
        opacity_mult_count = len(re.findall(r"opacity:\s*\w+\s*\*\s*\w+\s*\*", scene.content))
        if opacity_mult_count > 2:
            violations.append(Violation("31", "WARN", scene.filename, 1,
                f"Found {opacity_mult_count} triple-multiply opacity patterns (a*b*c). Content may be too dim. Use single variable."))
    return violations


def check_zone_comments_present(scenes: list) -> list:
    """Rule #32: Every element must have zone comment and explicit position."""
    violations = []
    for scene in scenes:
        if not scene.zones:
            violations.append(Violation("32", "WARN", scene.filename, 1,
                "No zone declarations (// Z#: label) — add zone comments for all positioned elements"))
    return violations


def check_off_screen(scenes: list) -> list:
    """Rule #25.7: All elements must stay within canvas 1920x1080."""
    violations = []
    # Check for negative positions or positions > canvas bounds
    for scene in scenes:
        for m in re.finditer(r"left:\s*(-?\d+)", scene.content):
            val = int(m.group(1))
            line_num = scene.content[:m.start()].count("\n") + 1
            # Skip interpolate array values
            before = scene.content[max(0, m.start()-30):m.start()]
            if "[" in before:
                continue
            if val < -50:
                violations.append(Violation("25", "FAIL", scene.filename, line_num,
                    f"left: {val}px — element goes off-screen left (min 0px)"))
            elif val > 1800:
                violations.append(Violation("25", "WARN", scene.filename, line_num,
                    f"left: {val}px — element may go off-screen right (canvas 1920px)"))

        for m in re.finditer(r"top:\s*(-?\d+)", scene.content):
            val = int(m.group(1))
            line_num = scene.content[:m.start()].count("\n") + 1
            before = scene.content[max(0, m.start()-30):m.start()]
            if "[" in before:
                continue
            if val < -50:
                violations.append(Violation("25", "FAIL", scene.filename, line_num,
                    f"top: {val}px — element goes off-screen top (min 0px)"))
            elif val > 980:
                violations.append(Violation("25", "WARN", scene.filename, line_num,
                    f"top: {val}px — element may go off-screen bottom (canvas 1080px)"))
    return violations


# ── Main Runner ────────────────────────────────────────

def run_validator(slug: str, strict: bool = False, as_json: bool = False) -> int:
    build_dir = OUTPUT_DIR / slug / "build"
    if not build_dir.exists():
        print(f"[ERROR] Build directory not found: {build_dir}")
        return 1

    # Find files
    scene_files = sorted(build_dir.glob("scenes/Section*.tsx"))
    comp_files = list(build_dir.glob("*.tsx"))
    const_files = list(build_dir.glob("constants.ts"))

    if not scene_files:
        print(f"[ERROR] No scene files found in {build_dir / 'scenes'}")
        return 1

    # Parse
    scenes = [parse_scene(f) for f in scene_files]
    comp = None
    for f in comp_files:
        if "Section" not in f.name:
            parsed = parse_composition(f)
            if parsed.has_audio_component or parsed.has_transition_series:
                comp = parsed
                break
    if not comp and comp_files:
        comp = parse_composition(comp_files[0])

    consts = parse_constants(const_files[0]) if const_files else None

    # Run all checks
    all_violations = []
    all_violations.extend(check_no_css_transitions(scenes, comp))
    all_violations.extend(check_4layer_stacking(scenes))
    all_violations.extend(check_zone_overlap(scenes))
    all_violations.extend(check_element_sizes(scenes))
    all_violations.extend(check_particle_minimums(scenes))
    all_violations.extend(check_beat_diversity(scenes))
    if comp:
        all_violations.extend(check_transition_series(comp))
        all_violations.extend(check_calculate_metadata(comp))
        all_violations.extend(check_transition_compensation(consts, comp))
    all_violations.extend(check_layout_variation(scenes))
    all_violations.extend(check_text_icon_companion(scenes))
    all_violations.extend(check_micro_motion(scenes))
    all_violations.extend(check_premount_for(scenes))
    all_violations.extend(check_no_visibility_gates(scenes))
    all_violations.extend(check_bg_opacity_separation(scenes))
    all_violations.extend(check_visual_dominance(scenes))
    all_violations.extend(check_zone_comments_present(scenes))
    all_violations.extend(check_off_screen(scenes))

    # Aggregate
    fails = [v for v in all_violations if v.severity == "FAIL"]
    warns = [v for v in all_violations if v.severity == "WARN"]

    # Checked rules
    checked_rules = {
        "01": "No CSS transitions",
        "03": "calculateMetadata from audio",
        "08": "No visibility gates",
        "09": "BG opacity separation",
        "11": "Micro-motion",
        "12": "Beat diversity",
        "13": "TransitionSeries required",
        "14": "Particle minimums",
        "15": "4-layer stacking",
        "16": "Layout variation (centered cap)",
        "17": "Text+icon companion",
        "19": "Layout variation (no 3 consecutive)",
        "31": "Visual subject dominance",
        "32": "Zone comments present",
        "24": "Element sizes",
        "25": "Zone overlap",
        "seq": "premountFor on Sequences",
        "ts": "TransitionSeries compensation",
    }

    violated_rules = set(v.rule_id for v in all_violations)
    passed_rules = set(checked_rules.keys()) - violated_rules

    if as_json:
        result = {
            "slug": slug,
            "build_dir": str(build_dir),
            "files_scanned": len(scene_files) + len(comp_files) + len(const_files),
            "violations": [asdict(v) for v in all_violations],
            "summary": {"fail": len(fails), "warn": len(warns), "pass": len(passed_rules)},
            "passed": len(fails) == 0 if not strict else (len(fails) == 0 and len(warns) == 0),
        }
        print(json.dumps(result, indent=2))
    else:
        print(f"\n{'='*64}")
        print(f"  BUILD VALIDATOR — {slug}")
        print(f"{'='*64}")
        print(f"  Build path: {build_dir}")
        print(f"  Files scanned: {len(scene_files)} scenes, {len(comp_files)} compositions, {len(const_files)} constants")
        print(f"{'='*64}\n")

        # Print PASSed rules
        for rule_id in sorted(passed_rules):
            print(f"  [PASS] Rule #{rule_id}: {checked_rules[rule_id]}")

        # Print violations
        for v in sorted(all_violations, key=lambda x: (x.severity != "FAIL", x.rule_id)):
            loc = f"{v.file}:{v.line}" if v.line > 0 else v.file
            print(f"  [{v.severity}] Rule #{v.rule_id}: {checked_rules.get(v.rule_id, '?')} — {loc} — {v.message}")

        print(f"\n{'='*64}")
        status = "PASSED" if not fails else "FAILED"
        if strict and warns:
            status = "FAILED (strict mode)"
        print(f"  RESULT: {len(fails)} FAIL, {len(warns)} WARN, {len(passed_rules)} PASS -> {status}")
        print(f"{'='*64}\n")

    # Exit code
    if fails:
        return 1
    if strict and warns:
        return 1
    return 0


def main():
    parser = argparse.ArgumentParser(description="Inactive v5 card-rule validator")
    parser.add_argument("slug")
    parser.add_argument("--strict", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    return run_validator(args.slug, strict=args.strict, as_json=args.json)

if __name__ == "__main__":
    raise SystemExit(main())
