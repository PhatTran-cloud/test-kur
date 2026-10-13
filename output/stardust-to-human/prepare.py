"""Prepare this film from actual Whisper words; never use the brief's clock marks."""
import json
import hashlib
import math
import re
import subprocess
from difflib import SequenceMatcher
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import lfilter

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
PUBLIC = ROOT / 'animation-studio/public/stardust-to-human'
PUBLIC.mkdir(parents=True, exist_ok=True)
SR = 24000
words = json.loads((OUT / 'timestamps.json').read_text())


def tokens(text):
    return re.findall(r'[a-z0-9]+', text.lower())


# Flatten ASR tokens while retaining the original timestamp owner.
flat, owners = [], []
for i, w in enumerate(words):
    for token in tokens(w['word']):
        flat.append(token)
        owners.append(i)

script_tokens = tokens((OUT / 'raw-script.md').read_text())
script_mapping = {}
for block in SequenceMatcher(None, script_tokens, flat, autojunk=False).get_matching_blocks():
    for j in range(block.size):
        script_mapping[block.a+j] = block.b+j


def anchor(phrase, after=0):
    query = tokens(phrase)
    for i in range(len(script_tokens)-len(query)+1):
        if script_tokens[i:i+len(query)] == query:
            for distance in range(12):
                target_index = script_mapping.get(i+distance)
                if target_index is not None:
                    time = words[owners[target_index]]['start']
                    if time >= after:
                        return time
                    break
    candidates = []
    for i in range(len(flat) - len(query) + 1):
        if words[owners[i]]['start'] < after:
            continue
        score = SequenceMatcher(None, query, flat[i:i + len(query)]).ratio()
        candidates.append((score, -i, i))
    score, _, index = max(candidates)
    if score < 0.68:
        raise ValueError(f'No reliable phrase anchor: {phrase}: {score}')
    return words[owners[index]]['start']


chapters = [
    ('STARDUST TO HUMAN', 'Put your hand', 'cinematic', 'Zoom-In'),
    ('FROM NOTHING', 'To tell the story of Earth', 'floating', 'Scale'),
    ('THE SUN CAME FIRST', 'Fast forward to', 'radial', 'Hub-Spoke'),
    ('HELL AND THE MOON', 'Inside that disk', 'cinematic', 'Timeline'),
    ('WATER FROM THE SKY', 'After the impact Earth was', 'split-h', 'Comparison'),
    ('SLIME REWRITES THE SKY', 'Three point eight billion', 'grid', 'Zoom-In'),
    ('FROZEN THEN ALIVE', 'Cells with nuclei appeared', 'split-v', 'Comparison'),
    ('LAND AND THE GREAT DYING', 'Four hundred and seventy million', 'stacked', 'Timeline'),
    ('THE DINOSAURS LAST DAY', 'After the extinction', 'cinematic', 'Scale'),
    ('THE FINAL SECOND', 'The forests returned', 'floating', 'Verdict'),
]
chapter_times = [anchor(c[1]) for c in chapters]
probe = subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(OUT/'audio.mp3')],capture_output=True,text=True,check=True)
end_source = float(json.loads(probe.stdout)['format']['duration'])
hook_end = anchor('Literally')
close_start = chapter_times[-1]
pauses = {0.0: 0.0, words[5]['end']: 1.0,
          chapter_times[1]: 0.5,
          anchor('The impact shattered Theia'): 0.7,
          anchor('Dust hid the Sun'): 1.0}
cuts = sorted(set([0., hook_end, close_start, end_source, *pauses]))
segments = []
position = 0.
for left, right in zip(cuts, cuts[1:]):
    position += pauses.get(left, 0.)
    speed = 0.86 if left < hook_end else 0.9 if left >= close_start else 1.
    segments.append({'left': left, 'right': right, 'start': position, 'speed': speed})
    position += (right - left) / speed
duration = position + 7.


def warp(time):
    segment = next((s for s in segments if s['left'] <= time < s['right']), segments[-1])
    return segment['start'] + (time - segment['left']) / segment['speed']


def decode(path):
    result = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-f', 'f32le',
                             '-ac', '1', '-ar', str(SR), 'pipe:1'], capture_output=True, check=True)
    return np.frombuffer(result.stdout, dtype=np.float32).copy()


source = decode(OUT / 'audio.mp3')
vo = np.zeros(round(duration * SR), dtype=np.float32)
for n, segment in enumerate(segments):
    # Input-scoped trim: output-scoped -t truncates audio expanded by atempo < 1.
    result = subprocess.run(['ffmpeg', '-v', 'error',
        '-ss', str(segment['left']), '-t', str(segment['right'] - segment['left']),
        '-i', str(OUT / 'audio.mp3'),
        '-af', f"atempo={segment['speed']}", '-f', 'f32le', '-ar', str(SR), '-ac', '1', 'pipe:1'],
        capture_output=True, check=True)
    samples = np.frombuffer(result.stdout, dtype=np.float32)
    count = min(len(samples), round((segment['right'] - segment['left']) / segment['speed'] * SR))
    dest = round(segment['start'] * SR)
    vo[dest:dest + count] = samples[:count]
vo *= 0.78 / max(0.001, float(np.max(np.abs(vo))))
timed_words = [{**w, 'start': round(warp(w['start']), 4), 'end': round(warp(w['end']), 4)} for w in words]


def at(phrase, after=0):
    return warp(anchor(phrase, after))


cue_data = [
    ('Put your hand', 'heartbeat', 4, 'heartbeat', False),
    ('iron in your blood', 'reveal', 6, 'shimmer', False),
    ('the rock beneath your feet', 'fire-crackle', 7, 'lava', False),
    ('So how', 'reverse-cymbal', 3, 'riser', False),
    ('This is the whole story', 'bass-drop', 2, 'boom', False),
    ('To tell the story of Earth', 'space-hum', 8, 'drone', False),
    ('Then it expanded', 'bass-drop', 3, 'bloom', False),
    ('Inside every star', 'fire-crackle', 8, 'furnace', False),
    ('A supernova', 'explosion', 4, 'boom', True),
    ('The gold in a wedding ring', 'ding', 2, 'twinkle', False),
    ('A cold cloud of stardust', 'wind', 8, 'wind', False),
    ('Its shock wave arrived', 'sweep', 3, 'whoosh', False),
    ('The newborn Sun', 'reveal', 4, 'ignition', False),
    ('That disk was the construction site', 'space-hum', 7, 'swirl', False),
    ('dust grains collided', 'impact', 8, 'rocks', False),
    ('This was hell', 'fire-crackle', 8, 'meteors', False),
    ('A Mars sized planet called', 'reverse-cymbal', 5, 'riser', False),
    ('The impact shattered Theia', 'explosion', 5, 'boom', True),
    ('But the debris did not escape', 'click', 7, 'pebbles', False),
    ('Volcanoes erupted furiously', 'fire-crackle', 7, 'eruption', False),
    ('Then came rain', 'rain', 12, 'rain', False),
    ('Millions of icy comets', 'ocean-waves', 8, 'splash', False),
    ('on the ocean floor', 'water-drip', 8, 'underwater', False),
    ('learned to copy itself', 'pop', 8, 'cells', False),
    ('releasing oxygen', 'reveal', 8, 'bubbles', False),
    ('it froze into', 'wind', 7, 'blizzard', False),
    ('melted the ice', 'thunder', 6, 'ice', False),
    ('Cambrian Explosion', 'ocean-waves', 9, 'creatures', False),
    ('the first plants crept', 'wind', 8, 'forest', False),
    ('volcanoes in Siberia', 'fire-crackle', 10, 'eruption', False),
    ('the dinosaurs', 'impact', 8, 'dinosaur', False),
    ('a rock ten kilometers wide', 'reverse-cymbal', 5, 'riser', False),
    ('It struck Mexico', 'explosion', 7, 'boom', True),
    ('Dust hid the Sun', 'wind', 8, 'ash', False),
    ('The forests returned', 'wind', 8, 'forest', False),
    ('strike stones into knives', 'click', 7, 'knapping', False),
    ('compress four point five', 'click', 10, 'clock', False),
    ('You are made of stardust', 'heartbeat', 5, 'heartbeat', False),
]
manifest = []
for i, (phrase, asset, length, kind, loud) in enumerate(cue_data):
    # Repeated phrases such as dinosaurs and volcanoes must belong to their chapter.
    floor = chapter_times[8] if i == 30 else chapter_times[7] if i == 29 else chapter_times[9] if i >= 34 else 0
    manifest.append({'id': f'SFX-{i+1:02}', 'phrase': phrase, 'time': at(phrase, floor),
                     'asset': asset, 'duration': length, 'kind': kind, 'major': loud})
assert len(manifest) == 38 and sum(c['major'] for c in manifest) == 3
planned_cues = manifest
manifest = []  # User revision: remove every SFX, including heartbeat and impacts.

shots = [
 ('Put your hand', 'hand', 'YOU ARE STARDUST'),
 ('iron in your blood', 'elements', 'IRON / CALCIUM / GOLD'),
 ('Literally', 'dust', 'ASHES OF A STAR'),
 ('the rock beneath your feet', 'lava', '4.5 BILLION YEARS'),
 ('So how', 'earth', 'FROM FIRE TO HOME'),
 ('To tell the story of Earth', 'void', 'BEFORE EARTH'),
 ('Then it expanded', 'bang', '13.8 BILLION YEARS AGO'),
 ('hydrogen gas gathered', 'star', 'THE FIRST STARS'),
 ('Inside every star', 'elements', 'A COSMIC FURNACE'),
 ('It collapses inward', 'supernova', 'A STAR DIES'),
 ('two stellar corpses collided', 'collision-stars', 'GOLD FROM COLLISION'),
 ('Fast forward to', 'cloud', '4.6 BILLION YEARS'),
 ('The cloud collapsed inward', 'disk', 'GRAVITY BUILDS A STAR'),
 ('The newborn Sun', 'sun', 'THE SUN CAME FIRST'),
 ('That disk was the construction site', 'disk', 'THE PLANET FACTORY'),
 ('Inside that disk', 'accretion', 'DUST / ROCK / WORLD'),
 ('The newborn Earth', 'lava', '4.54 BILLION YEARS'),
 ('This was hell', 'meteors', '1,200 C / NO OCEANS'),
 ('A Mars sized planet', 'theia', 'THEIA APPROACHES'),
 ('The impact shattered Theia', 'collision', 'THE GREAT IMPACT'),
 ('But the debris did not escape', 'debris', 'GRAVITY HOLDS THE PIECES'),
 ('became the Moon', 'moon', '4.51 BILLION YEARS'),
 ('After the impact Earth was', 'lava', 'THE LONG COOLING'),
 ('Magma hardened', 'crust', 'THE FIRST CRUST'),
 ('Volcanoes erupted furiously', 'volcano', 'VAPOR BECOMES SKY'),
 ('Then came rain', 'rain', 'THOUSANDS OF YEARS OF RAIN'),
 ('Magma basins became oceans', 'ocean', '4.4 BILLION YEARS / OCEANS'),
 ('zircon crystals', 'zircon', 'WATER LEAVES EVIDENCE'),
 ('Three point eight billion', 'vents', 'THE OCEAN FLOOR'),
 ('A tiny fatty membrane', 'cells', 'LIFE COPIES ITSELF'),
 ('Blue water Green', 'slime', 'A BILLION YEARS OF MICROBES'),
 ('photosynthesis', 'oxygen', 'SUNLIGHT BECOMES ENERGY'),
 ('oxygen was poison', 'oxygen', '2.4 BILLION YEARS / OXYGEN'),
 ('Cells with nuclei', 'cells', 'CELLS BECOME COMPLEX'),
 ('it froze into', 'snowball', '720 MILLION / SNOWBALL EARTH'),
 ('volcanoes under the ice', 'thaw', 'VOLCANOES BREAK THE FREEZE'),
 ('Cambrian Explosion', 'cambrian', '541 MILLION / LIFE EXPLODES'),
 ('Four hundred and seventy', 'plants', 'LIFE REACHES LAND'),
 ('enormous forests', 'forest', 'THE LAND TURNS GREEN'),
 ('Lobe finned fish', 'fish', 'FINS BECOME FEET'),
 ('supercontinent Pangea', 'pangea', 'ONE SUPERCONTINENT'),
 ('volcanoes in Siberia', 'volcano', '252 MILLION / THE GREAT DYING'),
 ('Ninety percent', 'extinction', '90% OF MARINE SPECIES LOST'),
 ('After the extinction', 'dinosaur', '230 MILLION / DINOSAURS'),
 ('Mammals were just', 'mammal', 'SMALL CREATURES WAIT'),
 ('a rock ten kilometers wide', 'asteroid', '66 MILLION / INCOMING'),
 ('It struck Mexico', 'impact', 'THE DINOSAURS LAST DAY'),
 ('Dust hid the Sun', 'ash', 'THE SUN DISAPPEARS'),
 ('The weakest creatures', 'mammal', 'THE SURVIVORS'),
 ('The forests returned', 'forest', 'LIFE RETURNS'),
 ('one branch of apes', 'human', 'OUR ANCESTORS STAND UP'),
 ('Homo sapiens appeared', 'cave', '300,000 YEARS / US'),
 ('compress four point five', 'calendar', '4.54 BILLION YEARS / ONE CALENDAR YEAR'),
 ('Five thousand years of written history', 'calendar', 'THE FINAL 35 SECONDS'),
 ('It does not need us', 'earth', 'WE NEED IT'),
 ('You are made of stardust', 'city', "4.5 BILLION YEARS TO MAKE YOU."),
]
shot_list, cursor = [], 0
for phrase, kind, title in shots:
    try:
        time = anchor(phrase, cursor)
    except ValueError:
        time = anchor(phrase, max(0, cursor-2))
    cursor = time
    shot_list.append({'time': warp(time), 'frame': math.floor(warp(time)*30), 'kind': kind, 'title': title})

# User-approved visual hold: nine seconds of overhead street before the specimens.
shot_list[1]['frame'] = shot_list[0]['frame'] + 270
shot_list[1]['time'] = shot_list[1]['frame'] / 30

# Original local Foley plus deterministic custom sound design for missing textures.
rng = np.random.default_rng(4521)
sfx = np.zeros((len(vo), 2), np.float32)
asset_cache = {}
for cue in manifest:
    n = round(cue['duration'] * SR)
    t = np.arange(n) / SR
    kind = cue['kind']
    if cue['asset'] not in asset_cache:
        asset_cache[cue['asset']] = decode(ROOT / f"animation-studio/public/sfx/{cue['asset']}.mp3")
    original = np.resize(asset_cache[cue['asset']], n)
    noise = rng.normal(0, 1, n)
    low = lfilter([0.015], [1, -0.985], noise)
    designed = original.copy()
    if kind == 'heartbeat':
        designed = np.zeros(n)
        pulse_times = [0.25] if cue['id']=='SFX-38' else np.arange(.2,cue['duration'],60/55)
        for start in pulse_times:
            for delay, level in [(0.,1.),(.18,.6)]:
                phase=t-start-delay
                designed += np.where(phase>=0,np.sin(2*np.pi*52*phase)*np.exp(-np.maximum(phase,0)*19)*level,0)
    elif kind == 'boom':
        designed += 2 * np.sin(2*np.pi*(42*t - 2*t*t))*np.exp(-t*1.4) + low*np.exp(-t)
    elif kind in {'cells', 'bubbles', 'pebbles', 'rocks', 'knapping', 'clock'}:
        designed *= 0.35
        rate = 0.24 if kind == 'clock' else 0.7
        for start in np.arange(0, cue['duration'], rate):
            phase = t-start
            designed += np.where(phase >= 0, np.sin(2*np.pi*(350+160*np.sin(start))*phase)*np.exp(-np.maximum(phase,0)*30), 0)
    elif kind in {'riser', 'whoosh', 'swirl', 'meteors'}:
        designed += noise * np.sin(np.pi*t/cue['duration'])**2 * 0.25
    elif kind == 'dinosaur':
        designed += np.sin(2*np.pi*(48*t+6*np.sin(t*3))) * np.exp(-t/2) + low*2
    elif kind == 'forest':
        for start in [0.5, 2.3, 4.7, 6.1]:
            phase = t-start
            designed += np.where((phase >= 0) & (phase < .4), np.sin(2*np.pi*(1600*phase+500*phase**2))*np.sin(np.pi*np.clip(phase/.4,0,1))*.5, 0)
    envelope = np.minimum(t/.12, 1) * np.minimum((cue['duration']-t)/.5, 1)
    designed *= envelope
    peak = float(np.max(np.abs(designed)))
    designed *= (0.68 if cue['major'] else 0.105) / max(peak, .001)
    pan = np.zeros(n) if kind == 'heartbeat' else np.linspace(-.85, .85, n)
    stereo = designed[:,None] * np.stack([np.cos((pan+1)*np.pi/4), np.sin((pan+1)*np.pi/4)],axis=1)
    start = round(cue['time'] * SR)
    count = min(n, len(vo)-start)
    sfx[start:start+count] += stereo[:count]

# Compose original ambient/percussion/orchestral/piano beds, with measured speech ducking.
music = np.zeros((len(vo), 2), np.float32)
t = np.arange(len(vo)) / SR
chord_notes = [(48,55,60), (44,51,56), (41,48,53), (43,50,55)]
for bar in range(math.ceil(duration / 8)):
    left, right = bar*8, min(duration,(bar+1)*8)
    idx = slice(round(left*SR),round(right*SR))
    lt = t[idx]-left
    env = np.minimum(lt/1.2,1)*np.minimum((right-left-lt)/1.2,1)
    chapter = sum(warp(c) <= left for c in chapter_times)-1
    notes = chord_notes[bar%4]
    for channel in range(2):
        for note in notes:
            freq = 440*2**((note-69)/12)
            tone = np.sin(2*np.pi*freq*(1+.0008*channel)*lt)
            tone += .18*np.sin(2*np.pi*freq*2*lt)
            if 6 <= chapter <= 8:
                tone += .1*np.sin(2*np.pi*freq*3*lt)
            music[idx,channel] += tone*env*.023
    if 3 <= chapter <= 8:
        for hit in np.arange(0,right-left,.75 if chapter >= 6 else 1.5):
            phase = lt-hit
            drum = np.where(phase>=0,np.sin(2*np.pi*52*phase)*np.exp(-np.maximum(phase,0)*13),0)
            music[idx] += drum[:,None]*.035
    if chapter >= 9:
        for k,note in enumerate(notes*2):
            phase=lt-k*1.2
            freq=440*2**((note+12-69)/12)
            piano=np.where(phase>=0,(np.sin(2*np.pi*freq*phase)+.3*np.sin(2*np.pi*freq*2.01*phase))*np.exp(-np.maximum(phase,0)*2),0)
            music[idx] += piano[:,None]*.026

speech = np.zeros(len(vo), np.float32)
for w in timed_words:
    speech[max(0,round((w['start']-.08)*SR)):min(len(vo),round((w['end']+.16)*SR))] = 1
speech = lfilter([1-math.exp(-1/(SR*.12))], [1,-math.exp(-1/(SR*.12))], speech)
duck = 1 - speech*(1-10**(-14/20))
music *= duck[:,None]
tail_start = at('You are made of stardust')
music *= np.clip((tail_start+1-t)/1,0,1)[:,None]
sfx[t>position+5] = 0
for source_time, gap in pauses.items():
    if source_time == 0:
        continue
    end = warp(source_time)
    start = end-gap
    music[round(start*SR):round(end*SR)] = 0
    sfx[round(start*SR):round(end*SR)] = 0
mix = vo[:,None] + music + sfx
gain = min(1., .94 / max(.001,float(np.max(np.abs(mix)))))
for name, audio in [('vo',np.repeat(vo[:,None],2,axis=1)),('bgm',music),('sfx',sfx),('mix',mix)]:
    wavfile.write(str(PUBLIC/f'{name}.wav'),SR,(audio*gain).astype(np.float32))
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(PUBLIC/f'{name}.wav'),'-c:a','aac','-b:a','192k',str(PUBLIC/f'{name}.m4a')],check=True)

timeline = {'fps':30,'duration':duration,'frames':math.ceil(duration*30),'voiceEnd':position,
 'audioRevision':hashlib.sha256((PUBLIC/'mix.m4a').read_bytes()).hexdigest()[:12],
 'chapters':[{'index':i,'title':c[0],'time':warp(chapter_times[i]),'frame':math.floor(warp(chapter_times[i])*30),
              'layout':c[2],'pattern':c[3]} for i,c in enumerate(chapters)],'shots':shot_list,'cues':manifest,'words':timed_words}
(OUT/'timeline.json').write_text(json.dumps(timeline,indent=2))
(PUBLIC/'timeline.json').write_text(json.dumps(timeline,indent=2))
(OUT/'mix-report.json').write_text(json.dumps({'sampleRate':SR,'duration':duration,'duckingDb':-14,'gain':gain,
 'peak':float(np.max(np.abs(mix*gain))),'cueCount':0,'majorImpacts':0,'sfxEnabled':False,'source':'Narration and background music only; all SFX removed by user request',
 'stereoDifferenceRms':float(np.sqrt(np.mean((sfx[:,0]-sfx[:,1])**2)))},indent=2))
print(json.dumps({'duration':duration,'chapters':len(chapters),'shots':len(shot_list),'cues':len(manifest),'mixPeak':float(np.max(np.abs(mix*gain)))},indent=2))
