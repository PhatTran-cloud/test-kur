import json
import importlib.util
from pathlib import Path

OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[1]
timeline=json.loads((OUT/'timeline.json').read_text())
build=OUT/'build'
(build/'scenes').mkdir(exist_ok=True)
for chapter in timeline['chapters']:
    index=chapter['index']
    name=f'Section{index+1:02}'
    start=0 if index==0 else chapter['frame']
    color='#ffad77' if index in [3,7,8] else '#8bd6d1' if index>=4 else '#d4b7ff'
    bg='#061822' if index>=4 else '#060a16'
    (build/'scenes'/f'{name}.tsx').write_text(f'''// Layout: {chapter['layout']}
// Flow: left-to-right
// Composition: {chapter['pattern']}
// Hook: F1 Slow Burn, visible modern street from frame zero.
import React from 'react';
import {{AbsoluteFill, useCurrentFrame}} from 'remotion';
import {{SceneShell, CosmicParticles}} from '../components/SceneShell';

export const {name}:React.FC=()=>{{
 const frame=useCurrentFrame();
 // Z5: illustrated subject spans the middle row; title companion lives in Z8.
 return <AbsoluteFill>
  {{/* Layer 0: opaque background */}}
  <AbsoluteFill style={{{{backgroundColor:'{bg}'}}}}/>
  {{/* Layer 1: particles with boxShadow glow and atmospheric orbit geometry */}}
  <AbsoluteFill><CosmicParticles frame={{frame+{start}}} color="{color}"/>
   <svg width="1920" height="1080"><ellipse cx="960" cy="540" rx="870" ry="470" fill="none" stroke="{color}" strokeWidth="2" opacity=".08"/></svg>
  </AbsoluteFill>
  {{/* Layer 2: domain illustration; Z5 spans Z4+Z5+Z6 for full-frame cinematic subjects */}}
  <AbsoluteFill><SceneShell chapter={{{index}}} start={{{start}}}/></AbsoluteFill>
  {{/* Layer 3: vignette and moving scan overlay */}}
  <AbsoluteFill style={{{{background:'radial-gradient(ellipse at center, transparent 45%, #01030a 100%)',opacity:.22}}}}/>
  <div style={{{{position:'absolute',left:0,right:0,top:(frame*.5)%1080,height:1,backgroundColor:'#d5edff',opacity:.04+Math.sin(frame*.02)*.005}}}}/>
 </AbsoluteFill>;
}};
''',encoding='utf-8')

# Add final audio-time chapter annotations without discarding the original ASR artifacts.
annotated=json.loads((OUT/'annotated.json').read_text())
(OUT/'annotated-source.json').write_text(json.dumps(annotated,indent=2))
spec=importlib.util.spec_from_file_location('aligner',ROOT/'animation-studio/scripts/03_aligner.py')
aligner=importlib.util.module_from_spec(spec)
spec.loader.exec_module(aligner)
tagged=(OUT/'tagged-script.md').read_text(encoding='utf-8')
beats=aligner.align_tags_to_frames(tagged,timeline['words'])
sections=[]
for i,c in enumerate(timeline['chapters']):
    start=0 if i==0 else c['frame']
    end=timeline['chapters'][i+1]['frame'] if i<9 else timeline['frames']
    section_beats=[b for b in beats if b['frame'] is not None and start<=b['frame']<end and b['tag']!='SB']
    words=[w['word'] for w in timeline['words'] if start/30<=w['start']<end/30]
    sections.append({'section_id':i+1,'title':c['title'],'start_frame':start,'end_frame':end,
                     'narration':' '.join(words),'layout':c['layout'],'composition':c['pattern'],'beats':section_beats})
annotated.update(sections=sections,audio_duration_frames=timeline['frames'],audio_duration_seconds=timeline['duration'],all_beats=beats)
(OUT/'annotated.json').write_text(json.dumps(annotated,indent=2))
(build/'constants.ts').write_text("import timeline from '../timeline.json';\nexport const FPS=30;\nexport const SECTIONS=timeline.chapters;\nexport const TRANSITIONS=[20,20,20,20,20,20,20,20,20];\nexport const COLORS={bg:'#060a16',primary:'#d4b7ff',secondary:'#8bd6d1'};\nexport const ZONES={Z5:{x:960,y:540},Z8:{x:960,y:940}};\n")
spec_lines=['# Stardust To Human - executed production specification','',
 'The English production brief owns narration. Visual timing follows actual Whisper words, with the user-approved nine-second overhead street hold. Hook: F1 Slow Burn. Audio: Kokoro am_fenrir, first three sentences slowed to 0.86x, final chapter 0.9x; narration and original local music only. All SFX are disabled. Duration follows the mixed audio file. Preview pending approval; no final export is authorized.',
 '', 'Four layers per scene: opaque domain backdrop; 36 glowing particles and orbit geometry; original subject illustration; light vignette and scan overlay. Frame-driven deterministic motion only. No captions. 3D natural environments, lofted articulated creatures, shader membranes, wave optics, volcano terrain and bounded ash volumes replace the flat SVG environment illustrations. Planetary bodies are directed with 3dviz-pro-max. SVG is retained for explanatory graphics and text. Modern Earth uses NASA Blue Marble; lunar and cloud maps use Solar System Scope CC BY 4.0. Ancient geology, orbit scales, impacts and compressed timing are authored illustrations rather than physical simulation. See asset-credits.md.', '',
 'Each illustrated shot enters over 18 frames, holds with subject-specific motion, reacts with bubbles, impacts, rain or footsteps, and exits at the next spoken anchor. Chapter transitions overlap 20 frames; each preceding sequence includes those frames, preserving audio-time chapter starts.', '',
 'The requested chapter layout names are retained as direction; individual illustrated shots vary within chapters. Final date/title group always has its star icon companion. Final card holds five seconds; final two seconds are fully black and silent.', '']
for i,s in enumerate(sections):
    spec_lines.extend([f"## {i+1}. {s['title']}",f"Frames {s['start_frame']}..{s['end_frame']}. Layout: {s['layout']}. Pattern: {s['composition']}.",''])
    for shot in timeline['shots']:
        if s['start_frame']<=shot['frame']<s['end_frame']:
            spec_lines.append(f"- Frame {shot['frame']}: {shot['kind']} - {shot['title']}")
    spec_lines.append('')
spec_lines.extend(['## Sound cues',''])
spec_lines.extend(f"- {c['id']}: {c['time']:.3f}s / {c['phrase']} / {c['kind']} / {'major impact' if c['major'] else 'supporting'}" for c in timeline['cues'])
(OUT/'spec.md').write_text('\n'.join(spec_lines),encoding='utf-8')
(OUT/'visual-blocks.json').write_text(json.dumps({'sections':sections,'shots':timeline['shots']},indent=2))

# The portable checkout has registry entries for absent gitignored builds.
# Disable only unavailable imports/registrations; retain every existing composition.
registry=ROOT/'animation-studio/src/compositions/EdubaShorts/index.tsx'
content=registry.read_text(encoding='utf-8')
import re
missing=[]
for match in re.finditer(r"^import \{ ([^}]+) \} from '([^']+)';",content,re.M):
    if not match[2].startswith('.'):
        continue
    base=registry.parent/match[2]
    if not any(Path(str(base)+ext).exists() for ext in ['.tsx','.ts','.js']):
        missing.extend(n.strip() for n in match[1].split(','))
        content=content.replace(match[0], '// Unavailable generated build: '+match[0])
for name in missing:
    content=re.sub(r'^\s*<'+re.escape(name)+r' />\s*$',f'      {{/* {name}: generated build absent in this checkout */}}',content,flags=re.M)
if 'import { StardustToHumanComp }' not in content:
    content="import { StardustToHumanComp } from '../../../../output/stardust-to-human/build/StardustToHuman';\n"+content
    content=content.replace('<Folder name="EdubaShorts">','<Folder name="EdubaShorts">\n      <StardustToHumanComp />')
registry.write_text(content,encoding='utf-8')
print(f'Generated 10 scenes, {len(timeline["shots"])} shots; repaired {len(missing)} unavailable registry entries.')
