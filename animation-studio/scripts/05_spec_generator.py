"""Compile typed v6 direction offline; no external model and no inferred shots."""
import argparse
import json
import subprocess
import sys
from pathlib import Path
from validate_v6 import FILES, packet_path, validate, digest

def compile_v6(slug,stage='plan'):
    packet=packet_path(slug)
    from v6_session import guard
    guard('spec', packet.parent.name)
    report=validate(packet,stage,strict=stage!='plan')
    if not report['passed']:
        for item in report['issues']: print(f"[{item['severity']}] {item['code']}: {item['message']}")
        return 1
    data={name:json.loads((packet/(name+'.json')).read_text(encoding='utf-8')) for name in FILES}
    manifest=data['scene-manifest']; prod=data['production']; art=data['art-system']
    handoff={'version':1,'validated_stage':stage,'warnings':report['summary']['warn'],'film_id':prod['film_id'],'visual_system_id':art['visual_system_id'],'format':prod['format'],'timing':prod['timing'],'claims':data['claim-ledger']['claims'],'art_system':art,'assets':data['asset-bible']['assets'],'beats':manifest['beats'],'scenes':manifest['scenes'],'shots':manifest['shots'],'transitions':data['transition-graph']['edges'],'contract_hashes':{name+'.json':digest(packet/(name+'.json')) for name in FILES}}
    text=['# v6 implementation handoff',art['visual_thesis'],'No chapter hierarchy; preserve IDs, states and directed meaning.']
    for shot in manifest['shots']:
        text.extend(['\n## '+shot['shot_id'],str(shot['time']),'Camera reveal: '+shot['camera']['reveal'],'Hero: '+shot['attention']['hero']])
        for bid in shot['beat_ids']:
            beat=next(b for b in manifest['beats'] if b['beat_id']==bid)
            text.extend(['Beat: '+bid,'Metaphor: '+beat['metaphor']['description'],'Beyond VO: '+beat['visual_expansion'],'Action: '+beat['hero']['action'],'Consequence: '+beat['hero']['consequence']])
        text.extend('Read: '+m['perception_test'] for m in shot['landmarks'])
    (packet/'direction-handoff.json').write_text(json.dumps(handoff,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    (packet/'spec.md').write_text('\n\n'.join(text)+'\n',encoding='utf-8')
    print('Compiled complete v6 handoff: '+str(packet))
    return 0

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('slug')
    parser.add_argument('--stage',choices=('plan','build','render'),default='plan')
    parser.add_argument('--legacy-v5',action='store_true')
    parser.add_argument('--format',choices=('short-form','long-form'),default='long-form',help='Legacy only; v6 format comes from production.json')
    args=parser.parse_args()
    if args.legacy_v5:
        from v6_session import guard
        guard('legacy-spec', args.slug)
        return subprocess.run([sys.executable,str(Path(__file__).with_name('_legacy_05_spec_generator.py')),args.slug,'--format',args.format,'--legacy-v5']).returncode
    return compile_v6(args.slug,args.stage)

if __name__=='__main__': raise SystemExit(main())
