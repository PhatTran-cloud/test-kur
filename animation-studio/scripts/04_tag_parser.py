"""v6 linguistic tags are authored in-session; external parsing is opt-in legacy."""
import sys
import subprocess
from pathlib import Path
if __name__=='__main__':
    if '--legacy-v5' not in sys.argv:
        raise SystemExit('v6: read prompts/TAG_PARSER.md and author semantic tags in-session; no API call. External legacy requires --legacy-v5.')
    args=[a for a in sys.argv[1:] if a!='--legacy-v5']
    from v6_session import guard
    slug=Path(args[0]).stem if args else ''
    for suffix in ('-final','-review','-draft'): slug=slug.replace(suffix,'')
    guard('legacy-tag', slug)
    raise SystemExit(subprocess.run([sys.executable,str(Path(__file__).with_name('_legacy_04_tag_parser.py')),*args,'--legacy-v5']).returncode)
