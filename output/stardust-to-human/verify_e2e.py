import importlib.util
import json
import math
import sys
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy.io import wavfile

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[1]
PUBLIC = ROOT / 'animation-studio/public/stardust-to-human'
timeline = json.loads((OUT / 'timeline.json').read_text())
spec = importlib.util.spec_from_file_location('aligner', ROOT / 'animation-studio/scripts/03_aligner.py')
aligner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(aligner)
raw = (ROOT / 'animation-studio/input/stardust-to-human.md').read_text(encoding='utf-8')
tagged = (OUT / 'tagged-script.md').read_text(encoding='utf-8')
tts_spec = importlib.util.spec_from_file_location('tts', ROOT / 'animation-studio/scripts/01_tts_kokoro.py')
tts = importlib.util.module_from_spec(tts_spec)
tts_spec.loader.exec_module(tts)
assert tts.strip_tags(tagged).split() == raw.split(), 'Narration changed while tagging'
annotated = json.loads((OUT / 'annotated.json').read_text())
assert all(b['frame'] is not None for b in annotated['all_beats']), 'Unaligned beats'
assert len(timeline['chapters']) == 10 and len(timeline['shots']) == 56
assert timeline['cues'] == [], 'User requested zero SFX'
assert timeline['frames'] == math.ceil(timeline['duration'] * 30)
sr, mix = wavfile.read(PUBLIC / 'mix.wav', mmap=True)
assert np.max(np.abs(mix)) < 1, 'Clipping in source mix'
assert np.max(np.abs(mix[:sr * 2])) > .01, 'Opening audio missing'
assert np.max(np.abs(mix[-sr * 2:])) == 0, 'Closing is not silent'
_, sfx = wavfile.read(PUBLIC / 'sfx.wav', mmap=True)
stereo_rms = float(np.sqrt(np.mean((sfx[:, 0] - sfx[:, 1]) ** 2)))
assert np.max(np.abs(sfx)) == 0, 'SFX still audible'

qa = OUT / 'render/qa'
frames = json.loads((qa / 'frames.json').read_text())
sheet = Image.new('RGB', (1600, 10 * 205), '#111')
draw = ImageDraw.Draw(sheet)
for i, frame in enumerate(frames):
    image = Image.open(qa / f'{i:02}-{frame}.jpg').convert('RGB')
    if i < 58:
        assert np.asarray(image).std() > 10, f'Blank shot {i}'
    else:
        assert np.asarray(image).max() <= 2, f'Black hold failed: {frame}'
    image.thumbnail((320, 180))
    x, y = i % 5 * 320, i // 5 * 205
    # A separate sheet covers all 60 shots without overwriting rows.
    if y + 205 > sheet.height:
        extended = Image.new('RGB', (1600, y + 205), '#111')
        extended.paste(sheet)
        sheet = extended
        draw = ImageDraw.Draw(sheet)
    sheet.paste(image, (x, y))
    label = timeline['shots'][i]['kind'] if i < 56 else 'opening' if i < 58 else 'black / silence'
    draw.text((x + 8, y + 184), f'{i:02} {frame / 30:.2f}s {label}', fill='white')
sheet.save(OUT / 'render/contact-sheet-3dviz.jpg', quality=92)

report = {'narrationWords': len(raw.split()), 'alignedBeats': len(annotated['all_beats']),
          'durationSeconds': timeline['duration'], 'frames': timeline['frames'],
          'chapters': 10, 'shots': 56, 'sfxCues': 0, 'majorImpacts': 0,
          'mixPeak': float(np.max(np.abs(mix))), 'openingAudioPresent': True,
          'closingSilence': True, 'sfxStereoDifferenceRms': stereo_rms,
          'renderedSnapshots': len(frames)}
motion = json.loads((OUT / 'render/motion-frames.json').read_text())
motion_checks = {}
for kind in dict.fromkeys(s['kind'] for s in motion):
    samples = [s for s in motion if s['kind'] == kind]
    first = np.asarray(Image.open(samples[0]['file']), dtype=np.float32)
    last = np.asarray(Image.open(samples[-1]['file']), dtype=np.float32)
    difference = float(np.abs(first[100:430, 220:760] - last[100:430, 220:760]).mean())
    assert difference > .5, f'Frozen 3D state: {kind}'
    motion_checks[kind] = difference
report['motionMeanPixelDifferences'] = motion_checks
video = OUT / 'render/final.mp4'
if video.exists() and '--preview-only' not in sys.argv:
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)]))
    stream = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    assert int(stream['nb_frames']) == timeline['frames']
    assert stream['width'] == 1920 and stream['height'] == 1080
    assert any(s['codec_type'] == 'audio' for s in probe['streams'])
    encoded_checks = {}
    for index in [0, 1, 4, 9, 12, 18, 21, 34, 35, 40, 44, 45, 46, 50, 51, 55, 59]:
        frame = frames[index]
        capture = OUT / 'render' / f'encoded-{index:02}.png'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(frame / 30), '-i', str(video), '-frames:v', '1', '-vf', 'scale=960:540', str(capture)], check=True)
        encoded = np.asarray(Image.open(capture).convert('RGB'), dtype=np.float32)
        reference = np.asarray(Image.open(qa / f'{index:02}-{frame}.jpg').convert('RGB'), dtype=np.float32)
        difference = float(np.abs(encoded - reference).mean())
        assert difference < 8, f'Encoded output differs from verified scene {index}: {difference}'
        encoded_checks[str(index)] = difference
    report['encodedFrameMeanPixelDifferences'] = encoded_checks
    report['finalVideo'] = {'path': str(video), 'bytes': video.stat().st_size, 'duration': probe['format']['duration'], 'codec': stream['codec_name']}
(OUT / 'e2e-report.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
