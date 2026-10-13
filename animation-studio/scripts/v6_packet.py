"""Initialize incomplete topic-independent packets without touching historic films."""
import argparse
import json
import re
import shutil
from pathlib import Path
from validate_v6 import ROOT, FILES, review_hashes

def init(slug, destination=None):
    if not re.fullmatch(r'[a-z][a-z0-9-]{0,79}',slug):
        raise ValueError('Slug must be lowercase letters/numbers/hyphens and start with a letter')
    dest=Path(destination) if destination else ROOT/'output'/slug/'v6'
    dest=dest.resolve()
    if not dest.is_relative_to(ROOT): raise ValueError('Packet must stay in workspace')
    if dest.exists() and (not (dest/'sessions').is_dir() or any(p.name != 'sessions' for p in dest.iterdir())):
        raise ValueError('Packet already exists; inspect/update it without resetting: '+str(dest))
    dest.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        shutil.copy2(ROOT/'v6/templates'/(name+'.json'),dest/(name+'.json'))
    for name in ('research','direction','styleframes','animatic','pilot','build','audio','qa'):
        (dest/name).mkdir()
    prod=json.loads((dest/'production.json').read_text(encoding='utf-8'))
    prod['film_id']=slug.replace('-','_')+'_v6'
    (dest/'production.json').write_text(json.dumps(prod,indent=2)+'\n',encoding='utf-8')
    manifest=json.loads((dest/'scene-manifest.json').read_text(encoding='utf-8'))
    manifest['film_id']=prod['film_id']
    (dest/'scene-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    (dest/'README.md').write_text('# '+slug+' v6 packet\n\nExplicitly incomplete: no approved scenes/assets/reviews. Follow repository v6/README.md and master guide.\n',encoding='utf-8')
    return dest

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    sub=parser.add_subparsers(dest='command',required=True)
    sub.add_parser('init').add_argument('slug')
    hashes=sub.add_parser('hashes',help='Print current hashes for a real review; does not approve')
    hashes.add_argument('slug')
    args=parser.parse_args()
    try:
        if args.command=='init':
            from v6_session import guard
            guard('init', args.slug, record=False)
            print(init(args.slug))
            guard('init', args.slug)
        else:
            dest=ROOT/'output'/args.slug/'v6'
            print(json.dumps(review_hashes(dest),indent=2))
    except (ValueError,OSError) as error: parser.exit(1,str(error)+'\n')

if __name__=='__main__': main()
