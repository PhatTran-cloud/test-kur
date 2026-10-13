"""Audit the prepared narration, without regenerating or changing its timing."""
import json, re, requests, subprocess
from pathlib import Path
from difflib import SequenceMatcher
import numpy as np
from scipy.io import wavfile

OUT=Path(__file__).resolve().parent
PUBLIC=OUT.parents[1]/'animation-studio/public/stardust-to-human'
audit=OUT/'voice-review';audit.mkdir(exist_ok=True)
sr,vo=wavfile.read(PUBLIC/'vo.wav',mmap=True)
mono=np.asarray(vo[:,0]);window=round(sr*.02)
energy=np.sqrt(np.mean(mono[:len(mono)//window*window].reshape(-1,window)**2,axis=1))
mask=energy<.006
changes=np.diff(np.r_[False,mask,False].astype(int));gaps=[]
for start,end in zip(np.flatnonzero(changes==1),np.flatnonzero(changes==-1)):
 if (end-start)*.02>=1.2:gaps.append({'start':round(start*.02,2),'end':round(end*.02,2),'seconds':round((end-start)*.02,2)})
print('Long narration pauses:',json.dumps(gaps),flush=True)
timeline=json.loads((OUT/'timeline.json').read_text())
revision=timeline['audioRevision']
cache=audit/f'prepared-vo-{revision}-asr.json'
if not cache.exists():
 chunks=[]
 # PCM WAV avoids a decoder issue returning empty results for the AAC upload.
 # Short independent windows also avoid ASR repeating text over the long film.
 for chapter in timeline['chapters']:
  index=chapter['index'];start=chapter['time'];end=timeline['chapters'][index+1]['time'] if index<9 else timeline['voiceEnd']
  file=audit/f'chapter-{index}-{revision}.wav'
  subprocess.run(['ffmpeg','-v','error','-y','-ss',str(start),'-i',str(PUBLIC/'vo.wav'),'-t',str(end-start),'-ac','1','-ar','16000',str(file)],check=True)
  with file.open('rb') as f:
   r=requests.post('http://localhost:9000/asr',params={'encode':'true','task':'transcribe','language':'en','word_timestamps':'true','output':'json','vad_filter':'false'},files={'audio_file':(file.name,f,'audio/wav')},timeout=600)
  r.raise_for_status();data=r.json();assert data.get('segments'),f'Empty ASR chapter {index}'
  (audit/f'chapter-{index}-{revision}-asr.json').write_text(json.dumps(data,indent=2))
  chunks.append(data)
  print(f"Chapter {index}: {data['text'][-140:]}",flush=True)
 cache.write_text(json.dumps({'text':' '.join(c['text'] for c in chunks),'segments':[s for c in chunks for s in c['segments']]},indent=2))
asr=json.loads(cache.read_text())
def tokens(text):return re.findall(r'[a-z0-9]+',text.lower())
expected=tokens((OUT/'raw-script.md').read_text())
actual=tokens(asr['text'])
matcher=SequenceMatcher(None,expected,actual,autojunk=False)
edits=[]
for tag,a,b,c,d in matcher.get_opcodes():
 if tag!='equal':edits.append({'type':tag,'expected':' '.join(expected[a:b]),'heard':' '.join(actual[c:d]),'context':' '.join(expected[max(0,a-4):b+4])})
words=[w for s in asr['segments'] for w in s.get('words',[])]
report={'audioRevision':revision,'preparedDurationSeconds':len(mono)/sr,'expectedTokens':len(expected),'asrTokens':len(actual),'alignmentRatio':matcher.ratio(),'differencesToReview':edits,'pausesAtLeast1p2s':gaps,'peak':float(abs(mono).max()),'openingRms':float(np.sqrt(np.mean(mono[:sr*2]**2))),'firstRecognizedWords':words[:6],'lastRecognizedWords':words[-10:]}
(audit/'report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2),flush=True)
