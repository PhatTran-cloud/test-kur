"""
Explainer V3 — Unified Pipeline Runner

Runs steps 2-6 of the pipeline automatically:
  Step 2: Tag Parser (Gemini API)
  Step 3: TTS (Kokoro — audio only)
  Step 4: ASR (Whisper — accurate word-level timestamps from actual audio)
  Step 5: Aligner (local — match tags to Whisper frames)

After this, Claude Code takes over for:
  Step 6: Spec Generator (Gemini API)   <- optional auto
  Step 7: Build Composition (manual)
  Step 8: Render (Remotion CLI)

Usage:
    python pipeline.py <script-path> [options]
    python pipeline.py path/to/my-video.md
    python pipeline.py path/to/my-video.md --format short-form
    python pipeline.py path/to/my-video.md --all              # include spec generation
    python pipeline.py path/to/my-video.md --from tts         # resume from TTS step
    python pipeline.py path/to/my-video.md --from whisper     # resume from Whisper ASR step
    python pipeline.py path/to/my-video.md --from aligner     # resume from Aligner step
    python pipeline.py path/to/my-video.md --from spec        # resume from Spec step

All output goes to: output/<slug>/
"""

import os
import sys
import subprocess
import shutil
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Load .env from scripts/ directory
SCRIPTS_DIR = Path(__file__).parent
load_dotenv(SCRIPTS_DIR / ".env")

# Project paths
STUDIO_ROOT = SCRIPTS_DIR.parent       # animation-studio/
PROJECT_ROOT = STUDIO_ROOT.parent      # explainer-v3/
OUTPUT_DIR = PROJECT_ROOT / "output"


def derive_slug(script_path: Path) -> str:
    """Derive slug from script filename."""
    name = script_path.stem
    for suffix in ["-final", "-review", "-draft"]:
        name = name.replace(suffix, "")
    return name


def run_step(step_name: str, script_name: str, args: list, required_output: Path = None) -> bool:
    """Run a pipeline step and check result."""
    print(f"\n{'='*60}")
    print(f"  {step_name}")
    print(f"{'='*60}\n")

    cmd = [sys.executable, str(SCRIPTS_DIR / script_name)] + args

    result = subprocess.run(cmd, cwd=str(SCRIPTS_DIR))

    if result.returncode != 0:
        print(f"\n[PIPELINE FAILED] {step_name} exited with code {result.returncode}")
        return False

    if required_output and not required_output.exists():
        print(f"\n[PIPELINE FAILED] Expected output not found: {required_output}")
        return False

    return True


def check_services(need_kokoro=True, need_whisper=True):
    """Check if required Docker services are running."""
    import requests

    all_ok = True

    # Check Kokoro
    if need_kokoro:
        kokoro_url = os.getenv("KOKORO_API_URL", "http://localhost:8881/v1/audio/speech")
        # Derive base URL: strip path components to get http://host:port
        base_url = kokoro_url.rstrip('/')
        if "/dev/" in base_url:
            base_url = base_url.split("/dev/")[0]
        elif "/v1/" in base_url:
            base_url = base_url.split("/v1/")[0]
        try:
            requests.get(f"{base_url}/health", timeout=10)
            print(f"   [OK] Kokoro TTS: {base_url}")
        except Exception:
            print(f"   [MISSING] Kokoro TTS not running at {base_url}")
            print(f"            docker run -p 8881:8880 ghcr.io/remsky/kokoro-fastapi-cpu:latest")
            all_ok = False

    # Check Whisper (use /docs endpoint — base / hangs on this image)
    if need_whisper:
        whisper_url = os.getenv("WHISPER_API_URL", "http://localhost:9000/asr")
        whisper_base = whisper_url.rsplit('/', 1)[0] if '/' in whisper_url else whisper_url
        try:
            requests.get(f"{whisper_base}/docs", timeout=5)
            print(f"   [OK] Whisper ASR: {whisper_url}")
        except Exception:
            print(f"   [MISSING] Whisper ASR not running at {whisper_url}")
            print(f"            docker run -p 9000:9000 onerahmet/openai-whisper-asr-webservice:latest")
            all_ok = False

    return all_ok


def main():
    parser = argparse.ArgumentParser(
        description="Explainer V3 — Unified Pipeline Runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python pipeline.py path/to/script.md                    # Run steps 2-4
  python pipeline.py path/to/script.md --all              # Run steps 2-5 (include spec)
  python pipeline.py path/to/script.md --from tts         # Resume from TTS
  python pipeline.py path/to/script.md --from aligner     # Resume from Aligner
  python pipeline.py path/to/script.md --format short-form
        """
    )
    parser.add_argument("script", help="Path to raw script (.md)")
    parser.add_argument("--format", choices=["short-form", "long-form"], default="long-form",
                        help="Video format (default: long-form)")
    parser.add_argument("--all", action="store_true",
                        help="Also run spec generation (Step 5)")
    parser.add_argument("--validate", action="store_true",
                        help="Run build validator (Step 7.5) after build")
    parser.add_argument("--from", dest="from_step",
                        choices=["tag", "tts", "whisper", "aligner", "spec"],
                        default="tag",
                        help="Resume from a specific step (default: tag)")
    args = parser.parse_args()

    script_path = Path(args.script).resolve()

    if not script_path.exists():
        script_path = (PROJECT_ROOT / args.script).resolve()

    if not script_path.exists():
        print(f"[ERROR] Script not found: {script_path}")
        sys.exit(1)

    slug = derive_slug(script_path)
    slug_dir = OUTPUT_DIR / slug

    # Step ordering: TTS (audio only) → Whisper ASR (accurate timestamps) → Aligner
    steps = ["tag", "tts", "whisper", "aligner", "spec"]
    start_index = steps.index(args.from_step)

    print(f"""
==========================================================
  EXPLAINER V3 -- PIPELINE RUNNER
==========================================================
  Script:  {script_path.name}
  Slug:    {slug}
  Format:  {args.format}
  Output:  output/{slug}/
  Start:   Step {start_index + 2} ({args.from_step})
==========================================================
    """)

    # ── Pre-flight checks ──
    print("[Pre-flight] Checking Docker services...")
    need_kokoro = start_index <= 1  # Need Kokoro for TTS
    need_whisper = start_index <= 2  # Need Whisper for ASR
    if need_kokoro or need_whisper:
        services_ok = check_services(need_kokoro=need_kokoro, need_whisper=need_whisper)
        if not services_ok:
            print(f"\n[ERROR] Required services not running. Start them first.")
            sys.exit(1)
    print()

    # ── Step 2: Tag Parser ──
    if start_index <= 0:
        success = run_step(
            "STEP 2 — Tag Parser (Gemini API)",
            "04_tag_parser.py",
            [str(script_path)],
            required_output=slug_dir / "tagged-script.md"
        )
        if not success:
            sys.exit(1)

    # ── Step 3: TTS + Timestamps (Kokoro Captioned Speech) ──
    if start_index <= 1:
        success = run_step(
            "STEP 3 — TTS + Timestamps (Kokoro Captioned Speech)",
            "01_tts_kokoro.py",
            [slug],
            required_output=slug_dir / "audio.mp3"
        )
        if not success:
            sys.exit(1)

    # ── Step 4: Whisper ASR (accurate word-level timestamps) ──
    if start_index <= 2:
        success = run_step(
            "STEP 4 — Whisper ASR (Word-Level Timestamps)",
            "02_asr_whisper.py",
            [slug],
            required_output=slug_dir / "timestamps.json"
        )
        if not success:
            sys.exit(1)

    # ── Copy runtime assets to Remotion public/ ──
    if start_index <= 2:
        audio_src = slug_dir / "audio.mp3"
        ts_src = slug_dir / "timestamps.json"
        audio_dst = STUDIO_ROOT / "public" / "audio" / f"{slug}.mp3"
        ts_dst = STUDIO_ROOT / "public" / "timestamps" / f"{slug}-timestamps.json"

        if audio_src.exists():
            audio_dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(audio_src, audio_dst)
            print(f"   [COPY] {audio_src.name} -> public/audio/{slug}.mp3")
        if ts_src.exists():
            ts_dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ts_src, ts_dst)
            print(f"   [COPY] {ts_src.name} -> public/timestamps/{slug}-timestamps.json")

    # ── Step 5: Aligner ──
    if start_index <= 3:
        success = run_step(
            "STEP 5 — Align Tags to Frames",
            "03_aligner.py",
            [slug],
            required_output=slug_dir / "annotated.json"
        )
        if not success:
            sys.exit(1)

    # ── Step 6: Spec Generator (optional) ──
    if args.all or start_index == 4:
        success = run_step(
            "STEP 6 — Spec Generator (Gemini API)",
            "05_spec_generator.py",
            [slug, "--format", args.format],
            required_output=slug_dir / "spec.md"
        )
        if not success:
            sys.exit(1)

    # ── Step 7.5: Build Validation (optional) ──
    if args.validate:
        build_dir = slug_dir / "build"
        if build_dir.exists():
            success = run_step(
                "STEP 7.5 — Build Validation (Rule Enforcement)",
                "validate_build.py",
                [slug],
            )
            if not success:
                print(f"\n[PIPELINE] Build validation FAILED. Fix violations before render.")
                sys.exit(1)
        else:
            print(f"\n[SKIP] No build directory found at {build_dir} — skipping validation")

    # ── Summary ──
    print(f"\n{'='*60}")
    print(f"  PIPELINE COMPLETE")
    print(f"{'='*60}")
    print(f"\n  Output folder: {slug_dir}")
    print(f"\n  Generated files:")

    generated_files = [
        ("raw-script.md", "Raw script (copy)"),
        ("tagged-script.md", "Tagged script"),
        ("tag-response.json", "Tag parser response"),
        ("audio.mp3", "TTS audio (Kokoro)"),
        ("timestamps.json", "Word-level timestamps (Whisper ASR)"),
        ("whisper-raw.json", "Whisper raw response (debug)"),
        ("kokoro-captioned-raw.json", "Kokoro raw response (debug)"),
        ("annotated.json", "Aligned beats + sections"),
        ("spec.md", "Animation spec"),
        ("visual-blocks.json", "Visual blocks for builder"),
    ]

    for filename, desc in generated_files:
        filepath = slug_dir / filename
        if filepath.exists():
            size = filepath.stat().st_size
            if size > 1024 * 1024:
                size_str = f"{size / (1024*1024):.1f} MB"
            elif size > 1024:
                size_str = f"{size / 1024:.1f} KB"
            else:
                size_str = f"{size} B"
            print(f"    [OK] {filename:<30s} {size_str:>10s}  — {desc}")

    print(f"\n  Next steps:")
    if not (slug_dir / "spec.md").exists():
        print(f"    1. Generate spec:  python 05_spec_generator.py {slug} --format {args.format}")
        print(f"    2. Build composition (Claude Code reads spec)")
        print(f"    3. Render: npx remotion render src/index.ts [CompositionId] output/{slug}/render/final.mp4")
    else:
        print(f"    1. Build composition (Claude Code reads spec)")
        print(f"    2. Render: npx remotion render src/index.ts [CompositionId] output/{slug}/render/final.mp4")


if __name__ == "__main__":
    main()
