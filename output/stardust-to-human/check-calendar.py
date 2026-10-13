from pathlib import Path
from datetime import datetime,timedelta
import json, importlib.util
import numpy as np
from scipy.io import wavfile
out=Path('output/stardust-to-human')
s=importlib.util.spec_from_file_location('tts',Path('animation-studio/scripts/01_tts_kokoro.py'));m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
a=m.strip_tags((out/'tagged-script.md').read_text(encoding='utf-8')).split()
b=Path('animation-studio/input/stardust-to-human.md').read_text(encoding='utf-8').split()
assert a==b, 'source/tag mismatch'
t=json.loads((out/'timeline.json').read_text())
assert len(t['shots'])==56 and not t['cues']
assert all(t['shots'][i]['frame']<t['shots'][i+1]['frame'] for i in range(55))
public=Path('animation-studio/public/stardust-to-human')
sr,mix=wavfile.read(public/'mix.wav',mmap=True)
assert np.abs(mix).max()<1 and mix[:sr*2].any() and not mix[-sr*2:].any()
_,sfx=wavfile.read(public/'sfx.wav',mmap=True);assert not sfx.any()
rows=[]
for label,years in [('Earth',4.54e9),('Early life',3.8e9),('Dinosaurs',230e6),('Impact',66e6),('Homo sapiens',300000),('Written history',5000)]:
 seconds=years/4.54e9*365*86400
 date=datetime(2027,1,1)-timedelta(seconds=seconds)
 rows.append({'event':label,'yearsAgo':years,'calendarDate':date.isoformat(),'secondsToYearEnd':seconds})
report={'scaleYears':4.54e9,'calendarDays':365,'dates':rows,'narrationSourcesMatch':True,'sfxCues':0,'mixPeak':float(np.abs(mix).max()),'openingAudioPresent':True,'closingSilence':True,'replacementSourceSpan':[469.14,494.04],'newVoice':'am_fenrir','durationSeconds':t['duration']}
(out/'calendar-revision/report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
