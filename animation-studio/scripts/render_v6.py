"""Render only a validated/authorized v6 packet; never manufacture approvals."""
import argparse
import subprocess
from pathlib import Path
from validate_v6 import ROOT, validate

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('slug')
    parser.add_argument('--entry',required=True,help='Existing entry relative to animation-studio')
    parser.add_argument('--composition',required=True)
    parser.add_argument('--dry-run',action='store_true',help='Check authorization/gates and print command; no render')
    args=parser.parse_args()
    from v6_session import guard
    guard('render', args.slug, record=not args.dry_run)
    import re
    if not re.fullmatch(r'[a-z][a-z0-9-]{0,79}',args.slug): parser.error('Invalid slug')
    packet=ROOT/'output'/args.slug/'v6'
    report=validate(packet,'render',strict=True)
    if not report['passed']:
        for issue in report['issues']: print(f"[{issue['severity']}] {issue['code']}: {issue['message']}")
        return 1
    entry=(ROOT/'animation-studio'/args.entry).resolve()
    if not entry.is_relative_to(ROOT) or not entry.is_file(): parser.error('Entry must be an existing workspace file')
    target=packet/'render'/'final.mp4'
    if target.exists(): parser.error('Delivery file exists; preserve it and choose a new packet revision')
    # Exact delivery binding, not a film ID appearing in a source comment.
    prod=__import__('json').loads((packet/'production.json').read_text(encoding='utf-8'))
    delivery=prod['delivery']
    if entry!=(ROOT/'animation-studio'/delivery['entry']).resolve() or args.composition!=delivery['composition_id']:
        parser.error('CLI entry/composition must exactly match reviewed production delivery binding')
    cmd=['npx.cmd' if __import__('os').name=='nt' else 'npx','--no-install','remotion','render',str(entry),args.composition,str(target),'--public-dir='+str(packet)]
    print('Validated render command: '+subprocess.list2cmdline(cmd))
    if args.dry_run: return 0
    target.parent.mkdir(parents=True,exist_ok=True)
    return subprocess.run(cmd,cwd=ROOT/'animation-studio').returncode

if __name__=='__main__': raise SystemExit(main())
