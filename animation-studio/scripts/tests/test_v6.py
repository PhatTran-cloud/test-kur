"""Contract enforcement tests with synthetic packets; no film approvals are created."""
import copy
import importlib.util
import json
import math
import sys
import tempfile
import unittest
import wave
from unittest.mock import patch
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from validate_v6 import validate, FILES, digest, ROOT, review_hashes
from v6_packet import init

def state(value): return {'description':value,'observable':[value]}

def fixture():
    art=json.loads((ROOT/'v6/templates/art-system.json').read_text())
    art.update(visual_system_id='style_fixture',visual_thesis='A closed system becomes connected',audience_question='What connects it?',emotional_arc='discovery',selection_reason='Readable mechanisms')
    art['candidates']=[{'name':str(i),'concept':'test concept','tradeoff':'test tradeoff'} for i in range(3)]
    art['grammar']={key:'test-specific grammar' for key in art['grammar']}
    art['tokens']={key:[key+'_one'] for key in art['tokens']}
    art['motifs']=[{'id':'motif_connection','meaning':'a connection persists','transformations':['closed -> open']}]
    art['styleframe_coverage']=[{'requirement':'identity and mechanism','artifact':'','review_status':'unstarted'}]
    prod=json.loads((ROOT/'v6/templates/production.json').read_text())
    prod.update(film_id='fixture_film',title='Synthetic contract fixture',genre='fiction')
    prod['editorial'].update(viewer_question='What connects it?',promise='Show connection',payoff='Connection changes flow',final_reframe='One joint carries the story',hook_candidates=[{'family':f,'visual_event':'joint opens','question':'What moves?','payoff':'flow appears'} for f in ['mystery','contrast','scale']],chosen_hook='mystery',hook_reason='Reveals a mechanism')
    prod['timing'].update(total_frames=180,opening_intent='visible closed joint',ending_intent='visible open flow')
    claims={'version':1,'claims':[{'claim_id':'claim_connection','narration':'This fictional joint opens','kind':'fiction','evidence':[],'confidence':'fictional','uncertainty':'','visual_limits':'Not a scientific model','causal_visuals_allowed':[],'review_status':'unreviewed'}]}
    asset={'asset_id':'asset_joint','referent':'fictional joint','narrative_role':'illustrate a connection','recognition_traits':['hinged opening'],'forbidden_confusions':['real anatomy'],'silhouette':'two joined forms','proportions':'test ratio','palette_roles':['palette_one'],'materials':['matte'],'light_response':'shows edge','parts':[{'part_id':'part_body','construction':'editable mesh','surface':'matte'}],'anchors':[{'anchor_id':'anchor_hinge','part_id':'part_body','purpose':'rotation'}],'dimensions':{'units':'m','extent':[1,1,1]},'states':[{'state_id':s,'appearance':s,'behavior':s} for s in ['closed','open']],'state_transitions':[{'from':'closed','to':'open','trigger':'editorial reveal','visible_change':'gap appears'}],'contact_constraints':'hinge holds','closest_camera_use':'1m','reuse_rules':'fixture only','representation':'3d','technical_budget':{'triangles':100,'texture_mb':0,'measurement_plan':'inspect'},'provenance':{'source':'synthetic test','license':'test','created_by':'test harness'},'inspection':[{'view':'hinge','artifact':'','status':'unstarted'}]}
    beats=[]; shots=[]
    for index in range(2):
        start=index*90; end=start+90; bid=f'beat_{index}'; sid=f'shot_{index}'
        rel={'relation_id':f'relation_{index}','kind':'illustrative','cause':'hinge opens','effect':'space connects','claim_ids':['claim_connection'],'limits':'fiction'}
        beats.append({'beat_id':bid,'time':{'start_frame':start,'end_frame':end},'claim_ids':['claim_connection'],'purpose':'discover connection','metaphor':{'type':'threshold','description':'Opening joins a world','correspondence':'gap -> access','limits':'fiction','mode':'explanatory'},'hero':{'instance_id':'instance_hero','trigger':'joint opens','action':'opens further','consequence':'flow changes'},'state_before':state(f'gap {index}'),'state_after':state(f'gap {index+1}'),'visual_expansion':'background path is revealed','relations':[rel],'anchors':[],'acceptance_tests':['gap is visibly different']})
        instance={'instance_id':'instance_hero','asset_id':'asset_joint','role':'hero','state_in':'closed' if index==0 else 'open','state_out':'open','behavior':{'mode':'active','trigger':'reveal','response':'open','secondary_response':'edge moves','settle':'open','reason':'shows connection'}}
        secondary={'instance_id':f'instance_secondary_{index}','asset_id':'asset_joint','role':'secondary','state_in':'closed','state_out':'closed','behavior':{'mode':'camera_induced','trigger':'camera travels','response':'parallax','secondary_response':'reveals behind','settle':'framed','reason':'depth'}}
        cam={'intent':'reveal hidden passage','attention_target':'instance_hero','known_before':'closed face','hidden_before':'path','reveal':'open path','framing_in':'wide','framing_out':'closer','execution':'frame-driven path','focus_change':'gap sharpens'}
        action={'action_id':f'action_{index}','instance_id':'instance_hero','time':{'start_frame':start,'end_frame':end},'trigger':'reveal','action':'open','consequence':'path reveals','relation_id':rel['relation_id'],'from_state':instance['state_in'],'to_state':'open','tracks':[{'channel':'progress','keyframes':[{'frame':start,'value':index},{'frame':end-1,'value':index+1}]}]}
        landmark={'landmark_id':f'landmark_{index}','beat_id':bid,'time':{'start_frame':start+20,'end_frame':end-1},'state_before':state(f'gap {index}'),'state_after':state(f'gap {index+1}'),'changed_variable':'gap width','read_frames':10,'perception_test':'gap and path separate'}
        shots.append({'shot_id':sid,'scene_id':'scene_connection','beat_ids':[bid],'time':{'start_frame':start,'end_frame':end},'visual_system_id':'style_fixture','style_tokens':{'palette':['palette_one'],'shape':'shapes_one','material':'materials_one','type':'type_roles_one','lighting':'lighting_one','motion':'motion_one'},'foreground':[{'instance_id':secondary['instance_id'],'information':'near depth','depth_role':'occlusion'}],'midground':[{'instance_id':'instance_hero','information':'opening','depth_role':'action'}],'background':[{'instance_id':secondary['instance_id'],'information':'path beyond','depth_role':'consequence'}],'secondary_actions':[{'instance_id':secondary['instance_id'],'behavior':'parallax','narrative_information':'space behind'}],'attention':{'hero':'instance_hero','secondary':[secondary['instance_id']],'suppressed':[],'protection':'low secondary contrast'},'camera':cam,'instances':[instance,secondary],'actions':[action],'landmarks':[landmark],'holds':[],'vfx_events':[],'transition_in':None if index==0 else 'transition_link','transition_out':'transition_link' if index==0 else None,'sound_intent':'off','implementation':{'source_files':[],'entry_export':'','state_evaluator':'','action_ids':[],'landmark_ids':[],'transition_ids':[]},'acceptance_tests':['readable opening']})
    manifest={'version':1,'film_id':'fixture_film','fps':30,'visual_system_id':'style_fixture','beats':beats,'scenes':[{'scene_id':'scene_connection','purpose':'connection','world_state_in':'closed','world_state_out':'open','shot_ids':['shot_0','shot_1']}],'shots':shots}
    graph={'version':1,'edges':[{'transition_id':'transition_link','from_shot':'shot_0','to_shot':'shot_1','type':'match_motion','time':{'start_frame':85,'end_frame':95},'cause':'opening continues','carries':['subject','action'],'invariant':'hinge stays','state_handoff':'open continues','continuity_test':'no gap reset','exception_reason':''}]}
    return dict(zip(FILES,[prod,claims,art,{'version':1,'visual_system_id':'style_fixture','assets':[asset]},manifest,graph]))

class V6Contracts(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(dir=ROOT/'v6')
        self.packet=Path(self.temp.name)
        self.data=fixture()
    def tearDown(self): self.temp.cleanup()
    def run_packet(self,stage='plan',strict=False):
        for name,value in self.data.items(): (self.packet/(name+'.json')).write_text(json.dumps(value),encoding='utf-8')
        return validate(self.packet,stage,strict)
    def assert_code(self,code):
        report=self.run_packet()
        self.assertFalse(report['passed']); self.assertIn(code,[i['code'] for i in report['issues']])
    def test_valid_plan(self): self.assertTrue(self.run_packet()['passed'])
    def test_empty_templates_fail(self):
        self.data={name:json.loads((ROOT/'v6/templates'/(name+'.json')).read_text()) for name in FILES}
        self.assert_code('SCHEMA')
    def test_chapter_forbidden(self):
        self.data['scene-manifest']['chapters']=[]
        self.assert_code('CHAPTER')
    def test_micro_motion_does_not_replace_change(self):
        beat=self.data['scene-manifest']['beats'][0]; beat['state_after']=copy.deepcopy(beat['state_before'])
        self.assert_code('STATE_CHANGE')
    def test_landmark_identical_fails(self):
        mark=self.data['scene-manifest']['shots'][0]['landmarks'][0];mark['state_after']=mark['state_before']
        self.assert_code('STATE_CHANGE')
    def test_causal_claim_not_invented(self):
        self.data['scene-manifest']['beats'][0]['relations'][0]['kind']='physical'
        self.assert_code('CAUSALITY')
    def test_missing_background(self):
        self.data['scene-manifest']['shots'][0]['background']=[]
        self.assert_code('SCHEMA')
    def test_scene_graph_gap(self):
        self.data['scene-manifest']['shots'][1]['time']['start_frame']=91
        self.assert_code('COVERAGE')
    def test_instance_reset(self):
        self.data['scene-manifest']['shots'][1]['instances'][0]['state_in']='closed'
        self.assert_code('CONTINUITY')
    def test_no_unknown_assets(self):
        self.data['scene-manifest']['shots'][0]['instances'][0]['asset_id']='asset_missing'
        self.assert_code('REFERENCE')
    def test_transition_must_carry_previous_meaning(self):
        self.data['transition-graph']['edges'][0]['to_shot']='shot_missing'
        self.assert_code('TRANSITION')
    def test_generic_fade_needs_reason(self):
        self.data['transition-graph']['edges'][0]['type']='fade_exception'
        self.assert_code('TRANSITION')
    def test_no_pretend_build_approval(self):
        report=self.run_packet('build')
        self.assertFalse(report['passed']);self.assertIn('GATE',[i['code'] for i in report['issues']])
    def test_render_not_authorized_by_structural_pass(self):
        report=self.run_packet('render')
        self.assertFalse(report['passed']);self.assertIn('AUTHORIZATION',[i['code'] for i in report['issues']])
    def test_duplicate_ids(self):
        self.data['scene-manifest']['beats'].append(copy.deepcopy(self.data['scene-manifest']['beats'][0]))
        self.assert_code('DUPLICATE')
    def test_strict_flags_provisional_timing(self): self.assertFalse(self.run_packet(strict=True)['passed'])
    def test_existing_packet_not_reset(self):
        with self.assertRaises(ValueError): init('fixture',self.packet)
    def test_bad_slug(self):
        with self.assertRaises(ValueError): init('../escape')
    def test_sessions_only_directory_can_initialize_without_resetting_receipt(self):
        target=self.packet/'new'
        (target/'sessions').mkdir(parents=True)
        receipt=target/'sessions/test.json'
        receipt.write_text('SYNTHETIC ONLY')
        self.assertEqual(init('topic-example',target),target)
        self.assertEqual(receipt.read_text(),'SYNTHETIC ONLY')
    def test_initializer_creates_incomplete_packet(self):
        target=self.packet/'new'
        self.assertEqual(init('topic-example',target),target)
        self.assertTrue(all((target/(name+'.json')).is_file() for name in FILES))
        self.assertFalse(validate(target)['passed'])
        self.assertEqual(json.loads((target/'production.json').read_text())['film_id'],'topic_example_v6')
    def test_physical_relation_needs_exact_support(self):
        self.data['scene-manifest']['beats'][0]['relations'][0]['kind']='physical'
        self.data['claim-ledger']['claims'][0]['causal_visuals_allowed']=['relation_other']
        self.assert_code('CAUSALITY')
    def test_word_anchor_provenance(self):
        beat=self.data['scene-manifest']['beats'][0]
        beat['anchors']=[{'word_index':0,'timestamp_seconds':1,'offset_frames':0,'frame':31,'alignment':'verified'}]
        self.assert_code('ANCHOR')
    def test_malformed_input_reports_not_crashes(self):
        self.data['scene-manifest']['beats']='bad'
        self.assert_code('SCHEMA')
    def test_secondary_cannot_be_hero(self):
        self.data['scene-manifest']['shots'][0]['secondary_actions'][0]['instance_id']='instance_hero'
        self.assert_code('SECONDARY')
    def test_review_hash_includes_voice_and_excludes_approval_itself(self):
        self.run_packet()
        original=review_hashes(self.packet)
        self.data['production']['reviews']['art_lock']['reviewer']='Synthetic test reviewer'
        self.run_packet()
        self.assertEqual(original,review_hashes(self.packet))
        self.data['production']['timing']['vo_start_frame']=1
        self.run_packet()
        self.assertNotEqual(original['production-core'],review_hashes(self.packet)['production-core'])
    def prepare_build(self):
        # Synthetic evidence, never copied into production or represented as art approval.
        (self.packet/'evidence.txt').write_text('SYNTHETIC CONTRACT TEST EVIDENCE ONLY')
        (self.packet/'implementation.tsx').write_text('export const Test = () => null;')
        with wave.open(str(self.packet/'voice.wav'),'wb') as stream:
            stream.setnchannels(1);stream.setsampwidth(2);stream.setframerate(1000);stream.writeframes(b'\0\0'*6000)
        (self.packet/'words.json').write_text(json.dumps([{'word':'first','start':0,'end':1},{'word':'second','start':3,'end':4}]))
        p=self.data['production'];p['timing'].update(status='verified',audio_file='voice.wav',timestamps_file='words.json',audio_duration_seconds=6)
        p['delivery']={'entry':str((self.packet/'implementation.tsx').relative_to(ROOT/'v6')).replace('\\','/'),'composition_id':'Test'}
        p['delivery']['entry']='../v6/'+p['delivery']['entry']
        p['platform_review'].update(status='reviewed',reviewer='synthetic harness',reviewed_at='test',decisions=['synthetic test only'])
        p['sound']['mix_report']='evidence.txt'
        p['rule_reads']=[{'stage':'build','paths':['CLAUDE.md','AGENTS.md','v6/CONTRACT.md','animation-studio/workflows/BUILDER_MASTER_GUIDE.md'],'decisions':['synthetic test only']}]
        for claim in self.data['claim-ledger']['claims']: claim['review_status']='reviewed'
        for frame in self.data['art-system']['styleframe_coverage']: frame.update(artifact='evidence.txt',review_status='approved')
        for asset in self.data['asset-bible']['assets']:
            for item in asset['inspection']: item.update(artifact='evidence.txt',status='observed')
        for i,beat in enumerate(self.data['scene-manifest']['beats']):
            beat['anchors']=[{'word_index':i,'timestamp_seconds':i*3,'offset_frames':0,'frame':i*90,'alignment':'verified'}]
        for shot in self.data['scene-manifest']['shots']:
            shot['implementation']={'source_files':['implementation.tsx'],'entry_export':'Test','state_evaluator':'test-only','action_ids':[a['action_id'] for a in shot['actions']],'landmark_ids':[m['landmark_id'] for m in shot['landmarks']],'transition_ids':[e for e in (shot['transition_in'],shot['transition_out']) if e]}
        self.run_packet()
        hashes=review_hashes(self.packet)
        for review in p['reviews'].values(): review.update(status='approved',reviewer='synthetic harness',timestamp='test',evidence=['evidence.txt'],observations=['synthetic contract acceptance only'],contract_hashes=hashes)
        p['render_authorization'].update(authorized=True,scope='synthetic test only',reviewer='synthetic harness',evidence='evidence.txt',contract_hashes=hashes)
    def test_structurally_complete_build_packet(self):
        self.prepare_build()
        report=self.run_packet('build',True)
        self.assertTrue(report['passed'],report['issues'])
    def test_structurally_complete_render_packet(self):
        self.prepare_build()
        report=self.run_packet('render',True)
        self.assertTrue(report['passed'],report['issues'])
    def test_unnarrated_soundtrack_has_no_fake_words(self):
        self.prepare_build()
        self.data['production']['timing'].update(mode='authored_audio',timestamps_file='')
        for beat in self.data['scene-manifest']['beats']: beat['anchors']=[]
        report=self.run_packet()
        self.assertTrue(report['passed'],report['issues'])
        self.data['scene-manifest']['beats'][0]['anchors']=[{'word_index':0,'timestamp_seconds':0,'offset_frames':0,'frame':0,'alignment':'verified'}]
        self.assertIn('ANCHOR',[i['code'] for i in self.run_packet()['issues']])
    def test_narrated_default_still_requires_words(self):
        self.prepare_build()
        self.data['production']['timing']['timestamps_file']=''
        self.assertIn('EVIDENCE',[i['code'] for i in self.run_packet()['issues']])
    def test_unnarrated_duration_is_measured(self):
        self.prepare_build()
        self.data['production']['timing'].update(mode='authored_audio',timestamps_file='',audio_duration_seconds=5)
        for beat in self.data['scene-manifest']['beats']: beat['anchors']=[]
        self.assertIn('DURATION',[i['code'] for i in self.run_packet()['issues']])
    def test_stale_voice_review_rejected(self):
        self.prepare_build()
        self.data['production']['timing']['opening_intent']='changed picture intent'
        report=self.run_packet('build')
        self.assertFalse(report['passed']);self.assertIn('STALE_REVIEW',[i['code'] for i in report['issues']])
    def test_audio_duration_measured_not_last_word(self):
        self.prepare_build()
        self.data['production']['timing']['audio_duration_seconds']=4
        report=self.run_packet('build')
        self.assertIn('DURATION',[i['code'] for i in report['issues']])
    def test_same_path_media_change_invalidates_review(self):
        self.prepare_build()
        with wave.open(str(self.packet/'voice.wav'),'wb') as stream:
            stream.setnchannels(1);stream.setsampwidth(2);stream.setframerate(1000);stream.writeframes(b'\1\0'*6000)
        report=self.run_packet('build')
        self.assertIn('STALE_REVIEW',[i['code'] for i in report['issues']])
    def test_changed_implementation_invalidates_review(self):
        self.prepare_build()
        (self.packet/'implementation.tsx').write_text('export const Changed = () => null;')
        report=self.run_packet('build')
        self.assertIn('STALE_REVIEW',[i['code'] for i in report['issues']])
    def test_offline_compiler_preserves_ids(self):
        self.prepare_build();self.run_packet()
        spec=importlib.util.spec_from_file_location('compiler',ROOT/'animation-studio/scripts/05_spec_generator.py')
        compiler=importlib.util.module_from_spec(spec);spec.loader.exec_module(compiler)
        # Pure compiler contract unit test; session/CLI enforcement has separate tests.
        with patch('v6_session.guard'):
            self.assertEqual(compiler.compile_v6(str(self.packet),'build'),0)
        handoff=json.loads((self.packet/'direction-handoff.json').read_text())
        self.assertEqual([s['shot_id'] for s in handoff['shots']],['shot_0','shot_1'])
        self.assertEqual(handoff['beats'][0]['metaphor']['type'],'threshold')

if __name__=='__main__': unittest.main()
