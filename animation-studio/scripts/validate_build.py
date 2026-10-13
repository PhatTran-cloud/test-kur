"""v6 build contract gate; historic visual-card heuristics are opt-in only."""
import argparse
import json
import subprocess
import sys
from pathlib import Path
from validate_v6 import validate, packet_path

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('slug')
    parser.add_argument('--legacy-v5',action='store_true')
    parser.add_argument('--strict',action='store_true')
    parser.add_argument('--json',action='store_true')
    args=parser.parse_args()
    if args.legacy_v5:
        cmd=[sys.executable,str(Path(__file__).with_name('_legacy_validate_build.py')),args.slug]
        if args.strict:cmd.append('--strict')
        if args.json:cmd.append('--json')
        return subprocess.run(cmd).returncode
    report=validate(packet_path(args.slug),'build',args.strict)
    if args.json:print(json.dumps(report,indent=2))
    else:
        print('v6 build '+('PASS' if report['passed'] else 'FAIL'))
        for issue in report['issues']:print(f"[{issue['severity']}] {issue['code']}: {issue['message']}")
        print(report['limitation'])
    return 0 if report['passed'] else 1

if __name__=='__main__':raise SystemExit(main())
