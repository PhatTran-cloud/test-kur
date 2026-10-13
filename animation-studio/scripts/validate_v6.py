"""Validate v6 structure/evidence; never certify artistic quality from prose."""
import argparse
import hashlib
import json
import math
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCHEMAS = ROOT / 'v6' / 'schemas'
FILES = ('production', 'claim-ledger', 'art-system', 'asset-bible', 'scene-manifest', 'transition-graph')
BUILD_GATES = ('research_lock', 'script_lock', 'art_lock', 'animatic_lock', 'hero_lock')
RENDER_GATES = BUILD_GATES + ('sound_lock', 'final_qa')

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def review_hashes(packet):
    hashes={name+'.json':digest(packet/(name+'.json')) for name in FILES[1:]}
    prod=json.loads((packet/'production.json').read_text(encoding='utf-8-sig'))
    # Review/auth metadata cannot hash itself. All editorial/timing/sound/delivery
    # decisions are separately bound so changed VO cannot inherit stale art gates.
    core={key:value for key,value in prod.items() if key not in ('reviews','render_authorization','rule_reads')}
    hashes['production-core']=hashlib.sha256(json.dumps(core,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode('utf-8')).hexdigest()
    for field in ('audio_file','timestamps_file'):
        value=prod['timing'][field]
        if value:
            path=local_path(packet,value)
            if path.is_file(): hashes['media:'+field]=digest(path)
    evidence_refs=set()
    scenes=json.loads((packet/'scene-manifest.json').read_text(encoding='utf-8-sig'))
    for shot in scenes['shots']:
        evidence_refs.update(shot['implementation']['source_files'])
    art=json.loads((packet/'art-system.json').read_text(encoding='utf-8-sig'))
    evidence_refs.update(frame['artifact'] for frame in art['styleframe_coverage'] if frame['artifact'])
    assets=json.loads((packet/'asset-bible.json').read_text(encoding='utf-8-sig'))
    for asset in assets['assets']:
        evidence_refs.update(view['artifact'] for view in asset['inspection'] if view['artifact'])
    for value in sorted(evidence_refs):
        path=local_path(packet,value)
        if path.is_file(): hashes['artifact:'+value]=digest(path)
    entry=prod.get('delivery',{}).get('entry')
    if entry:
        path=(ROOT/'animation-studio'/entry).resolve()
        if path.is_relative_to(ROOT) and path.is_file(): hashes['delivery-entry']=digest(path)
    return hashes

def packet_path(value):
    path = Path(value)
    if path.exists():
        return path.resolve()
    return ROOT / 'output' / value / 'v6'

def local_path(packet, value):
    """Media/evidence/source refs stay in workspace; allow ../ from film packet."""
    path = Path(value)
    target = (path if path.is_absolute() else packet / path).resolve()
    if not target.is_relative_to(ROOT):
        raise ValueError('Reference leaves workspace: ' + value)
    return target

def recursive_keys(value, banned):
    if isinstance(value, dict):
        for key, child in value.items():
            if key in banned:
                yield key
            yield from recursive_keys(child, banned)
    elif isinstance(value, list):
        for child in value:
            yield from recursive_keys(child, banned)

def validate(packet, stage='plan', strict=False):
    from jsonschema import Draft202012Validator
    packet = packet.resolve()
    issues = []
    data = {}
    def issue(code, message, severity='FAIL'):
        issues.append({'code':code, 'severity':severity, 'message':message})
    if not packet.is_relative_to(ROOT):
        issue('PATH','Production packets must remain in the workspace')
        return result(packet,stage,issues,strict)
    def exists(value, label):
        try:
            target = local_path(packet, value)
            if not value or not target.is_file():
                issue('EVIDENCE', label + ': missing file ' + str(value))
                return None
            return target
        except ValueError as error:
            issue('PATH', str(error))
            return None
    for name in FILES:
        path = packet / (name + '.json')
        try:
            value = json.loads(path.read_text(encoding='utf-8-sig'))
            schema = json.loads((SCHEMAS / (name + '.schema.json')).read_text(encoding='utf-8'))
            errors = sorted(Draft202012Validator(schema).iter_errors(value), key=lambda e:str(list(e.path)))
            for error in errors:
                issue('SCHEMA', name + '.' + '.'.join(map(str,error.path)) + ': ' + error.message)
            data[name] = value
            if list(recursive_keys(value, {'chapter', 'chapters', 'chapter_id', 'chapter_index'})):
                issue('CHAPTER', name + ': chapter hierarchy forbidden')
        except (OSError, ValueError) as error:
            issue('INPUT', name + ': ' + str(error))
    # Avoid type/key errors on malformed input, but report all schema issues above.
    if any(i['code'] in ('INPUT','SCHEMA') for i in issues):
        return result(packet, stage, issues, strict)
    prod, claims, art, assets, scenes, graph = (data[name] for name in FILES)
    def index(records, key):
        found = {}
        for record in records:
            ident = record[key]
            if ident in found:
                issue('DUPLICATE', key + ': ' + ident)
            found[ident] = record
        return found
    claim_map=index(claims['claims'],'claim_id')
    asset_map=index(assets['assets'],'asset_id')
    beat_map=index(scenes['beats'],'beat_id')
    scene_map=index(scenes['scenes'],'scene_id')
    shot_map=index(scenes['shots'],'shot_id')
    edge_map=index(graph['edges'],'transition_id')
    all_ids=[]
    for mapping in (claim_map, asset_map, beat_map, scene_map, shot_map, edge_map):
        all_ids.extend(mapping)
    if len(set(all_ids)) != len(all_ids):
        issue('ID_NAMESPACE','Canonical IDs must be globally unique across record types')
    system=art['visual_system_id']
    if assets['visual_system_id'] != system or scenes['visual_system_id'] != system:
        issue('ART_SYSTEM','Art/asset/scene visual system IDs disagree')
    if scenes['film_id'] != prod['film_id'] or scenes['fps'] != prod['format']['fps']:
        issue('FILM','Film identity/FPS mismatch')
    fps=prod['format']['fps']
    total=prod['timing']['total_frames']
    def interval(time, label, parent=None):
        start,end=time['start_frame'],time['end_frame']
        if not 0 <= start < end <= total:
            issue('INTERVAL',label+': invalid global half-open interval')
        if parent and not parent['start_frame'] <= start < end <= parent['end_frame']:
            issue('INTERVAL',label+': interval leaves parent shot/beat')
    for claim in claim_map.values():
        factual=claim['kind'] in ('fact','approximation','hypothesis')
        if factual and not claim['evidence']:
            issue('CLAIM',claim['claim_id']+': factual claim needs source evidence')
        if claim['kind'] in ('approximation','hypothesis') and not claim['uncertainty'].strip():
            issue('CLAIM',claim['claim_id']+': uncertainty must be explicit')
        if stage != 'plan' and claim['review_status'] != 'reviewed':
            issue('CLAIM',claim['claim_id']+': claim not reviewed')
    states={}
    for asset in asset_map.values():
        states[asset['asset_id']]=set(index(asset['states'],'state_id'))
        parts=set(index(asset['parts'],'part_id'))
        index(asset['anchors'],'anchor_id')
        for anchor in asset['anchors']:
            if anchor['part_id'] not in parts:
                issue('ASSET',asset['asset_id']+': unknown anchor part')
        for trans in asset['state_transitions']:
            if trans['from'] not in states[asset['asset_id']] or trans['to'] not in states[asset['asset_id']]:
                issue('ASSET',asset['asset_id']+': unknown state transition')
        for token in asset['palette_roles']:
            if token not in art['tokens']['palette']:
                issue('ART_TOKEN',asset['asset_id']+': unknown palette token '+token)
    relations={}
    for beat in beat_map.values():
        bid=beat['beat_id']
        interval(beat['time'],bid)
        if beat['state_before']==beat['state_after'] or beat['state_before']['observable']==beat['state_after']['observable']:
            issue('STATE_CHANGE',bid+': before/after observable state identical')
        for cid in beat['claim_ids']:
            if cid not in claim_map: issue('REFERENCE',bid+': unknown claim '+cid)
        for rel in beat['relations']:
            if rel['relation_id'] in relations: issue('DUPLICATE','relation_id: '+rel['relation_id'])
            relations[rel['relation_id']]=rel
            for cid in rel['claim_ids']:
                if cid not in claim_map:
                    issue('REFERENCE',rel['relation_id']+': unknown claim '+cid)
            if rel['kind']=='physical' and not any(
                rel['relation_id'] in claim_map.get(cid,{}).get('causal_visuals_allowed',[]) for cid in rel['claim_ids']
            ):
                issue('CAUSALITY',rel['relation_id']+': physical causality has no declared supported visual relation')
    ordered=sorted(shot_map.values(),key=lambda s:s['time']['start_frame'])
    cursor=0
    instances={}
    action_ids=set()
    used_beats=set()
    used_assets=set()
    for shot in ordered:
        sid=shot['shot_id']; time=shot['time']; interval(time,sid)
        if time['start_frame']!=cursor: issue('COVERAGE',sid+': picture timeline gap/overlap')
        cursor=time['end_frame']
        if shot['scene_id'] not in scene_map: issue('REFERENCE',sid+': unknown scene')
        elif sid not in scene_map[shot['scene_id']]['shot_ids']: issue('REFERENCE',sid+': scene membership inconsistent')
        if shot['visual_system_id']!=system: issue('ART_SYSTEM',sid+': wrong system')
        token_map={'palette':'palette','shape':'shapes','material':'materials','type':'type_roles','lighting':'lighting','motion':'motion'}
        for field,token_set in token_map.items():
            values=shot['style_tokens'][field]
            for token in values if isinstance(values,list) else [values]:
                if token not in art['tokens'][token_set]: issue('ART_TOKEN',sid+': unknown '+field+' token '+token)
        own=index(shot['instances'],'instance_id')
        for instance in own.values():
            iid=instance['instance_id']; aid=instance['asset_id']; used_assets.add(aid)
            if aid not in asset_map: issue('REFERENCE',iid+': unknown asset '+aid)
            else:
                for state in (instance['state_in'],instance['state_out']):
                    if state not in states[aid]: issue('STATE',iid+': unknown asset state '+state)
            if iid in instances:
                prev=instances[iid]
                if prev['asset_id']!=aid or prev['state_out']!=instance['state_in']:
                    issue('CONTINUITY',iid+': identity/state reset across shots')
            instances[iid]=instance
        for role in ('foreground','midground','background'):
            for layer in shot[role]:
                if layer['instance_id'] not in own: issue('REFERENCE',sid+': layer instance unknown')
        hero=shot['attention']['hero']
        if hero not in own or own.get(hero,{}).get('role')!='hero': issue('ATTENTION',sid+': missing canonical hero')
        for iid in [shot['camera']['attention_target'],*shot['attention']['secondary'],*shot['attention']['suppressed']]:
            if iid not in own: issue('REFERENCE',sid+': camera/attention instance unknown '+iid)
        for secondary in shot['secondary_actions']:
            if secondary['instance_id'] not in own: issue('REFERENCE',sid+': secondary instance unknown')
            elif secondary['instance_id']==hero or own[secondary['instance_id']]['role'] not in ('secondary','ambient'):
                issue('SECONDARY',sid+': parallel behavior must belong to a secondary/ambient actor')
        for bid in shot['beat_ids']:
            used_beats.add(bid)
            if bid not in beat_map: issue('REFERENCE',sid+': unknown beat '+bid)
            else:
                bt=beat_map[bid]['time']
                if time['end_frame']<=bt['start_frame'] or time['start_frame']>=bt['end_frame']:
                    issue('INTERVAL',sid+': beat interval does not overlap shot')
                if beat_map[bid]['hero']['instance_id'] not in own:
                    issue('REFERENCE',sid+': beat hero missing from shot')
        acts=index(shot['actions'],'action_id')
        for action in acts.values():
            aid=action['action_id']
            if aid in action_ids: issue('DUPLICATE','action_id: '+aid)
            action_ids.add(aid); interval(action['time'],aid,time)
            iid=action['instance_id']
            if iid not in own: issue('REFERENCE',aid+': unknown actor')
            elif own[iid]['asset_id'] in states:
                for state in (action['from_state'],action['to_state']):
                    if state not in states[own[iid]['asset_id']]: issue('STATE',aid+': unknown action state')
            if action['relation_id'] not in relations: issue('REFERENCE',aid+': unknown relation')
            for track in action['tracks']:
                frames=[k['frame'] for k in track['keyframes']]
                if frames!=sorted(set(frames)) or frames[0]<action['time']['start_frame'] or frames[-1]>=action['time']['end_frame']:
                    issue('TRACK',aid+': keyframes must be unique, increasing and inside action')
                dimensions={len(k['value']) if isinstance(k['value'],list) else 1 for k in track['keyframes']}
                expected=3 if track['channel'] in ('position','rotation','scale') else 1
                if dimensions!={expected}: issue('TRACK',aid+': inconsistent channel dimensions')
        lmarks=index(shot['landmarks'],'landmark_id')
        for mark in lmarks.values():
            interval(mark['time'],mark['landmark_id'],time)
            if mark['beat_id'] not in shot['beat_ids']: issue('REFERENCE',sid+': landmark not mapped to shot beat')
            if mark['state_before']['observable']==mark['state_after']['observable']:
                issue('STATE_CHANGE',mark['landmark_id']+': identical reading states')
            if mark['read_frames']>mark['time']['end_frame']-mark['time']['start_frame']:
                issue('READ_TIME',mark['landmark_id']+': read duration exceeds landmark window')
        for bid in shot['beat_ids']:
            if not any(m['beat_id']==bid for m in lmarks.values()): issue('LANDMARK',sid+': beat has no readable landmark '+bid)
        windows=[(m['time']['start_frame'],m['time']['end_frame']) for m in lmarks.values()]
        for hold in shot['holds']:
            interval(hold['time'],sid+' hold',time)
            if hold['attention_target'] not in own: issue('REFERENCE',sid+': hold target unknown')
            windows.append((hold['time']['start_frame'],hold['time']['end_frame']))
        last=time['start_frame']
        for start,end in sorted(windows):
            if start-last>4*fps: issue('READ_GAP',sid+': >4 seconds without change or motivated hold','WARN')
            last=max(last,end)
        if time['end_frame']-last>4*fps: issue('READ_GAP',sid+': trailing unreadable-change gap','WARN')
        for event in shot['vfx_events']:
            interval(event['time'],event['event_id'],time)
            if event['trigger_action_id'] not in acts or event['source_instance_id'] not in own:
                issue('VFX',event['event_id']+': unbound source/action')
        if stage!='plan':
            impl=shot['implementation']
            if set(impl['action_ids'])!=set(acts) or set(impl['landmark_ids'])!=set(lmarks):
                issue('BINDING',sid+': executed actions/landmarks incomplete')
            required_edges={i for i in (shot['transition_in'],shot['transition_out']) if i}
            if set(impl['transition_ids'])!=required_edges: issue('BINDING',sid+': handoff binding incomplete')
            if not impl['source_files'] or not impl['entry_export'] or not impl['state_evaluator']:
                issue('BINDING',sid+': implementation source/evaluator missing')
            for value in impl['source_files']: exists(value,sid+' implementation')
    if cursor!=total: issue('COVERAGE','Shot coverage does not reach total frames')
    for bid in set(beat_map)-used_beats: issue('REFERENCE','Unassigned beat '+bid)
    for scene in scene_map.values():
        for sid in scene['shot_ids']:
            if sid not in shot_map or shot_map[sid]['scene_id']!=scene['scene_id']:
                issue('REFERENCE',scene['scene_id']+': shot membership inconsistent')
    used_edges=set()
    for i,shot in enumerate(ordered):
        if i==0 and shot['transition_in'] is not None: issue('TRANSITION','Opening transition must be null')
        if i==len(ordered)-1 and shot['transition_out'] is not None: issue('TRANSITION','Closing transition must be null')
        if i==len(ordered)-1: continue
        nxt=ordered[i+1]; eid=shot['transition_out']; edge=edge_map.get(eid)
        if not edge or nxt['transition_in']!=eid:
            issue('TRANSITION',shot['shot_id']+': missing/mismatched next handoff'); continue
        used_edges.add(eid); interval(edge['time'],eid)
        if edge['from_shot']!=shot['shot_id'] or edge['to_shot']!=nxt['shot_id']:
            issue('TRANSITION',eid+': endpoints inconsistent')
        boundary=shot['time']['end_frame']
        if not edge['time']['start_frame']<=boundary<=edge['time']['end_frame']:
            issue('TRANSITION',eid+': window misses cut boundary')
        if edge['type']=='fade_exception' and not edge['exception_reason'].strip():
            issue('TRANSITION',eid+': generic fade has no reason')
    if used_edges!=set(edge_map): issue('TRANSITION','Unused or extra handoff edges')
    words=None
    timing=prod['timing']
    narrated=timing.get('mode', 'narrated')=='narrated'
    if not narrated and (timing['timestamps_file'] or timing['vo_start_frame']):
        issue('TIMING','Unnarrated authored audio must not invent word timestamps or a VO lead')
    if timing['status']=='verified':
        expected=math.ceil(timing['audio_duration_seconds']*fps)+timing['vo_start_frame']+timing['tail_frames']
        if expected!=total: issue('DURATION','Measured audio + declared lead/tail != total frames')
        ts=exists(timing['timestamps_file'],'word timestamps') if narrated else None
        audio=exists(timing['audio_file'],'VO audio' if narrated else 'authored soundtrack')
        if ts:
            try:
                words=json.loads(ts.read_text(encoding='utf-8-sig'))
                if not isinstance(words,list) or not words: raise ValueError('Expected nonempty word array')
                previous=-1
                for word in words:
                    if not isinstance(word.get('word'),str) or not 0<=word['start']<=word['end']<=timing['audio_duration_seconds']+0.05 or word['start']<previous:
                        raise ValueError('Invalid/nonmonotonic word timestamps')
                    previous=word['start']
            except (ValueError,KeyError,TypeError) as error: issue('TIMING',str(error)); words=None
        if audio and audio.suffix.lower()=='.wav':
            try:
                with wave.open(str(audio),'rb') as stream: measured=stream.getnframes()/stream.getframerate()
                if abs(measured-timing['audio_duration_seconds'])>1/fps: issue('DURATION','Declared duration differs from WAV')
            except wave.Error as error: issue('AUDIO',str(error))
        elif audio and stage!='plan':
            # Compressed media needs ffprobe to verify actual file duration.
            import subprocess
            try:
                run=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(audio)],capture_output=True,text=True,check=True)
                measured=float(json.loads(run.stdout)['format']['duration'])
                if abs(measured-timing['audio_duration_seconds'])>1/fps: issue('DURATION','Declared duration differs from probed audio')
            except (OSError,subprocess.SubprocessError,ValueError,KeyError) as error: issue('AUDIO','Cannot verify actual media duration: '+str(error))
    elif stage!='plan': issue('TIMING','Provisional timing cannot build/render')
    else: issue('TIMING','Planning timing provisional; no synced claim','WARN')
    for beat in beat_map.values():
        if narrated and timing['status']=='verified' and not beat['anchors']: issue('ANCHOR',beat['beat_id']+': no narration anchor')
        if not narrated and beat['anchors']: issue('ANCHOR',beat['beat_id']+': unnarrated film cannot claim word anchors')
        for anchor in beat['anchors']:
            expected=math.floor(anchor['timestamp_seconds']*fps)+timing['vo_start_frame']+anchor['offset_frames']
            if anchor['frame']!=expected: issue('ANCHOR',beat['beat_id']+': frame/offset mismatch')
            if not beat['time']['start_frame']<=anchor['frame']<beat['time']['end_frame']:
                issue('ANCHOR',beat['beat_id']+': anchor outside meaning beat')
            if stage!='plan' and anchor['alignment']!='verified': issue('ANCHOR',beat['beat_id']+': unresolved alignment')
            if words is not None:
                wi=anchor['word_index']
                if wi>=len(words) or abs(words[wi]['start']-anchor['timestamp_seconds'])>0.0001:
                    issue('ANCHOR',beat['beat_id']+': word provenance mismatch')
    # Review is evidence-dependent, hash-bound and never inferred by this checker.
    if stage!='plan':
        delivery=prod['delivery']
        if not delivery['entry'] or not delivery['composition_id']:
            issue('DELIVERY','Reviewed entry/composition binding missing')
        else:
            delivery_entry=(ROOT/'animation-studio'/delivery['entry']).resolve()
            if not delivery_entry.is_relative_to(ROOT) or not delivery_entry.is_file():
                issue('DELIVERY','Bound entry is not an existing workspace source file')
        for asset in asset_map.values():
            for check in asset['inspection']:
                if check['status'] not in ('observed','approved'): issue('ASSET_REVIEW',asset['asset_id']+': missing observation')
                exists(check['artifact'],asset['asset_id']+' inspection')
        for check in art['styleframe_coverage']:
            if check['review_status']!='approved': issue('ART_REVIEW','Styleframe coverage unapproved')
            exists(check['artifact'],'styleframe')
        if prod['platform_review']['status']!='reviewed' or not prod['platform_review']['reviewer'] or not prod['platform_review']['reviewed_at']:
            issue('PLATFORM','Contextual language/picture/platform review missing')
        required_reads={'CLAUDE.md','AGENTS.md','v6/CONTRACT.md','animation-studio/workflows/BUILDER_MASTER_GUIDE.md'}
        logged={p for record in prod['rule_reads'] for p in record['paths']}
        if not required_reads<=logged: issue('RULE_READS','Core reading log incomplete')
        for record in prod['rule_reads']:
            for p in record['paths']:
                if not (ROOT/p).is_file(): issue('RULE_READS','Logged rule file unavailable: '+p)
        expected_hashes=review_hashes(packet)
        def check_hashes(hashes,label):
            for filename,value in expected_hashes.items():
                if hashes.get(filename)!=value: issue('STALE_REVIEW',label+': missing/stale '+filename)
        for gate in RENDER_GATES if stage=='render' else BUILD_GATES:
            review=prod['reviews'][gate]
            if review['status']!='approved' or not review['reviewer'] or not review['timestamp'] or not review['evidence'] or not review['observations'] or review['blocking_issues']:
                issue('GATE',gate+': not approved with observations and clear issues')
            for p in review['evidence']: exists(p,gate)
            check_hashes(review['contract_hashes'],gate)
        if stage=='render':
            auth=prod['render_authorization']
            if not auth['authorized'] or not auth['scope'] or not auth['reviewer']:
                issue('AUTHORIZATION','No recorded authorization for this film')
            exists(auth['evidence'],'render authorization')
            check_hashes(auth['contract_hashes'],'authorization')
            exists(prod['sound']['mix_report'],'audio/listening report')
    return result(packet,stage,issues,strict)

def result(packet,stage,issues,strict):
    fail=sum(i['severity']=='FAIL' for i in issues)
    warn=sum(i['severity']=='WARN' for i in issues)
    return {'packet':str(packet),'stage':stage,'passed':fail==0 and (not strict or warn==0),'summary':{'fail':fail,'warn':warn},'issues':issues,'limitation':'Checks declared contracts/provenance/evidence, not aesthetic quality or truth of claimed review observations.'}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('packet',help='Packet directory or slug')
    parser.add_argument('--stage',choices=('plan','build','render'),default='plan')
    parser.add_argument('--strict',action='store_true')
    parser.add_argument('--json',action='store_true')
    args=parser.parse_args()
    try: report=validate(packet_path(args.packet),args.stage,args.strict)
    except ImportError:
        parser.exit(2,'Missing jsonschema; install animation-studio/scripts/requirements.txt\n')
    if args.json: print(json.dumps(report,indent=2,ensure_ascii=False))
    else:
        print(f"v6 {report['stage']}: {'PASS' if report['passed'] else 'FAIL'} ({report['summary']['fail']} failures, {report['summary']['warn']} warnings)")
        for entry in report['issues']: print(f"[{entry['severity']}] {entry['code']}: {entry['message']}")
        print(report['limitation'])
    return 0 if report['passed'] else 1

if __name__=='__main__':
    raise SystemExit(main())
