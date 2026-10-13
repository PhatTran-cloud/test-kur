"""
SFX Downloader -- Fetch sound effects from Freesound.org API
Downloads short SFX clips for video production pipeline.

Usage:
    python sfx_downloader.py                    # Download all default SFX
    python sfx_downloader.py --query "whoosh"   # Search + download specific sound
    python sfx_downloader.py --list             # List available SFX in public/sfx/
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.parse
from pathlib import Path

SCRIPTS_DIR = Path(__file__).parent
STUDIO_ROOT = SCRIPTS_DIR.parent
SFX_DIR = STUDIO_ROOT / "public" / "sfx"

# Load API key from .env
def load_api_key():
    env_path = SCRIPTS_DIR / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("FREESOUND_API_KEY="):
                return line.split("=", 1)[1].strip()
    return os.environ.get("FREESOUND_API_KEY", "")

API_KEY = load_api_key()
BASE_URL = "https://freesound.org/apiv2"

# ── Default SFX library to download ──────────────────
DEFAULT_SFX = [
    # Beat entrance SFX (0.3-0.8s)
    {"name": "whoosh-soft", "query": "whoosh soft short", "max_duration": 1.5, "category": "beat"},
    {"name": "whoosh-fast", "query": "fast whoosh swish", "max_duration": 1.0, "category": "beat"},
    {"name": "pop", "query": "pop bubble short", "max_duration": 0.8, "category": "beat"},
    {"name": "click", "query": "click ui button", "max_duration": 0.5, "category": "beat"},
    {"name": "swoosh", "query": "swoosh air movement", "max_duration": 1.0, "category": "beat"},
    {"name": "ding", "query": "ding notification bell short", "max_duration": 1.0, "category": "beat"},
    {"name": "glitch", "query": "glitch digital error short", "max_duration": 0.8, "category": "beat"},
    {"name": "reveal", "query": "reveal magic shimmer short", "max_duration": 1.5, "category": "beat"},

    # Transition SFX (0.5-1.5s)
    {"name": "sweep", "query": "sweep transition cinematic", "max_duration": 2.0, "category": "transition"},
    {"name": "impact", "query": "impact hit cinematic deep", "max_duration": 2.0, "category": "transition"},
    {"name": "reverse-cymbal", "query": "reverse cymbal rise", "max_duration": 3.0, "category": "transition"},
    {"name": "woosh-transition", "query": "woosh transition pass by", "max_duration": 2.0, "category": "transition"},
    {"name": "bass-drop", "query": "bass drop sub impact", "max_duration": 2.0, "category": "transition"},

    # Ambient/Descriptive SFX (1-5s)
    {"name": "rain", "query": "rain gentle loop", "max_duration": 10.0, "category": "ambient"},
    {"name": "fire-crackle", "query": "fire crackle campfire", "max_duration": 10.0, "category": "ambient"},
    {"name": "ocean-waves", "query": "ocean waves calm", "max_duration": 10.0, "category": "ambient"},
    {"name": "wind", "query": "wind blowing gentle", "max_duration": 10.0, "category": "ambient"},
    {"name": "space-hum", "query": "space ambient drone deep", "max_duration": 10.0, "category": "ambient"},
    {"name": "thunder", "query": "thunder distant rumble", "max_duration": 5.0, "category": "ambient"},
    {"name": "heartbeat", "query": "heartbeat slow", "max_duration": 5.0, "category": "ambient"},
    {"name": "typing", "query": "keyboard typing mechanical", "max_duration": 5.0, "category": "ambient"},
    {"name": "alarm", "query": "alarm warning siren short", "max_duration": 3.0, "category": "ambient"},
    {"name": "crowd", "query": "crowd murmur background", "max_duration": 10.0, "category": "ambient"},
    {"name": "static-noise", "query": "radio static noise", "max_duration": 5.0, "category": "ambient"},
    {"name": "electricity", "query": "electricity buzz zap", "max_duration": 3.0, "category": "ambient"},
    {"name": "water-drip", "query": "water drip cave", "max_duration": 5.0, "category": "ambient"},
    {"name": "explosion", "query": "explosion distant boom", "max_duration": 3.0, "category": "ambient"},
]


def search_sounds(query: str, max_duration: float = 5.0, page_size: int = 5):
    """Search Freesound for sounds matching query."""
    params = urllib.parse.urlencode({
        "query": query,
        "filter": f"duration:[0 TO {max_duration}]",
        "sort": "rating_desc",
        "fields": "id,name,duration,previews,license,tags,avg_rating",
        "page_size": page_size,
        "token": API_KEY,
    })
    url = f"{BASE_URL}/search/text/?{params}"

    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            return data.get("results", [])
    except Exception as e:
        print(f"  [ERROR] Search failed for '{query}': {e}")
        return []


def download_preview(sound: dict, filename: str) -> bool:
    """Download the HQ preview MP3 of a sound (no OAuth needed)."""
    previews = sound.get("previews", {})
    # Prefer HQ mp3, fallback to LQ
    preview_url = previews.get("preview-hq-mp3") or previews.get("preview-lq-mp3")
    if not preview_url:
        print(f"  [WARN] No preview URL for sound {sound.get('id')}")
        return False

    filepath = SFX_DIR / f"{filename}.mp3"
    if filepath.exists():
        print(f"  [SKIP] {filename}.mp3 already exists")
        return True

    try:
        urllib.request.urlretrieve(preview_url, str(filepath))
        size_kb = filepath.stat().st_size / 1024
        print(f"  [OK] {filename}.mp3 ({size_kb:.0f} KB, {sound.get('duration', 0):.1f}s) - '{sound.get('name')}'")
        return True
    except Exception as e:
        print(f"  [ERROR] Download failed for {filename}: {e}")
        return False


def download_all_defaults():
    """Download all default SFX library."""
    SFX_DIR.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"  SFX DOWNLOADER -- Freesound.org")
    print(f"{'='*60}")
    print(f"  Output: {SFX_DIR}")
    print(f"  Sounds to download: {len(DEFAULT_SFX)}")
    print(f"{'='*60}\n")

    success = 0
    failed = 0

    for sfx in DEFAULT_SFX:
        print(f"[{sfx['category'].upper()}] {sfx['name']}:")
        results = search_sounds(sfx["query"], sfx["max_duration"])

        if not results:
            print(f"  [FAIL] No results for '{sfx['query']}'")
            failed += 1
            continue

        # Pick first result (highest rated)
        downloaded = download_preview(results[0], sfx["name"])
        if downloaded:
            success += 1
        else:
            failed += 1

    print(f"\n{'='*60}")
    print(f"  RESULT: {success} downloaded, {failed} failed")
    print(f"  SFX folder: {SFX_DIR}")
    print(f"{'='*60}\n")


def search_and_download(query: str, name: str = None, max_duration: float = 5.0):
    """Search for a specific sound and download it."""
    SFX_DIR.mkdir(parents=True, exist_ok=True)

    if not name:
        name = query.replace(" ", "-").lower()[:30]

    print(f"\nSearching: '{query}' (max {max_duration}s)")
    results = search_sounds(query, max_duration, page_size=10)

    if not results:
        print("[FAIL] No results found")
        return

    print(f"Found {len(results)} results:")
    for i, r in enumerate(results):
        print(f"  [{i+1}] {r.get('name')} ({r.get('duration', 0):.1f}s, rating: {r.get('avg_rating', 0):.1f})")

    # Download best result
    download_preview(results[0], name)


def list_sfx():
    """List all SFX files in public/sfx/."""
    if not SFX_DIR.exists():
        print("No SFX folder found. Run: python sfx_downloader.py")
        return

    files = sorted(SFX_DIR.glob("*.mp3"))
    if not files:
        print("No SFX files found. Run: python sfx_downloader.py")
        return

    print(f"\n{'='*60}")
    print(f"  SFX Library: {SFX_DIR}")
    print(f"{'='*60}")
    total_kb = 0
    for f in files:
        kb = f.stat().st_size / 1024
        total_kb += kb
        print(f"  {f.name:<30} {kb:>6.0f} KB")
    print(f"{'='*60}")
    print(f"  Total: {len(files)} files, {total_kb/1024:.1f} MB")
    print(f"{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(description="SFX Downloader -- Freesound.org")
    parser.add_argument("--query", help="Search for specific sound")
    parser.add_argument("--name", help="Filename for downloaded sound")
    parser.add_argument("--max-duration", type=float, default=5.0, help="Max duration in seconds")
    parser.add_argument("--list", action="store_true", help="List available SFX")
    args = parser.parse_args()
    if args.list:
        list_sfx()
        return
    from v6_session import guard
    guard('media-download', os.environ.get('V6_FILM_SLUG', ''))

    if not API_KEY:
        print("[ERROR] FREESOUND_API_KEY not found in .env")
        sys.exit(1)

    if args.list:
        list_sfx()
    elif args.query:
        search_and_download(args.query, args.name, args.max_duration)
    else:
        download_all_defaults()


if __name__ == "__main__":
    main()
