"""Guarded v6 review evidence renders; never grants delivery approval."""
import argparse
import json
import re
import subprocess
from validate_v6 import ROOT, validate

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('slug')
    parser.add_argument('--purpose',choices=('styleframes','animatic','pilot','qa'),required=True)
    parser.add_argument('--frame',type=int)
    parser.add_argument('--name',required=True)
    parser.add_argument('--scale',type=float,default=1)
    parser.add_argument('--dry-run',action='store_true')
    args=parser.parse_args()
    from v6_session import guard
    guard('preview',args.slug,record=not args.dry_run)
    if not re.fullmatch(r'[a-z][a-z0-9-]{0,79}',args.slug): parser.error('Invalid slug')
    if not re.fullmatch(r'[a-zA-Z0-9_-]+',args.name): parser.error('Invalid evidence name')
    if not 0 < args.scale <= 1: parser.error('Preview scale must be in (0,1]')
    packet=ROOT/'output'/args.slug/'v6'
    report=validate(packet,'plan')
    if not report['passed']:
        for issue in report['issues']: print(f"[{issue['severity']}] {issue['code']}: {issue['message']}")
        return 1
    prod=json.loads((packet/'production.json').read_text(encoding='utf-8'))
    if not prod['delivery']['entry']: parser.error('Evidence needs a bound entry')
    entry=(ROOT/'animation-studio'/prod['delivery']['entry']).resolve()
    composition=prod['delivery']['composition_id']
    if not entry.is_relative_to(ROOT) or not entry.is_file() or not composition:
        parser.error('Evidence needs exact existing entry/composition')
    if args.frame is not None and not 0 <= args.frame < prod['timing']['total_frames']:
        parser.error('Evidence frame outside authored timeline')
    target=packet/args.purpose/(args.name+('.png' if args.frame is not None else '.mp4'))
    if target.exists(): parser.error('Evidence exists; preserve it and use a new name')
    cmd=['npx.cmd' if __import__('os').name=='nt' else 'npx','--no-install','remotion',
         'still' if args.frame is not None else 'render',str(entry),composition,str(target),'--scale='+str(args.scale),'--public-dir='+str(packet)]
    if args.frame is not None: cmd.append('--frame='+str(args.frame))
    else: cmd.extend(['--concurrency=2','--crf=19'])
    print('Evidence only; reviews pending: '+subprocess.list2cmdline(cmd))
    if args.dry_run: return 0
    target.parent.mkdir(parents=True,exist_ok=True)
    return subprocess.run(cmd,cwd=ROOT/'animation-studio').returncode

if __name__=='__main__': raise SystemExit(main())
