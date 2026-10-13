from pathlib import Path
import json,requests,subprocess,importlib.util
out=Path('output/stardust-to-human')
revision=out/'calendar-revision';revision.mkdir(exist_ok=True)
text='If we compress four point five four billion years into one year: Earth forms on January first. Life around three point eight billion years ago falls in early March. Dinosaurs arrive around December thirteenth. The asteroid strikes on December twenty sixth. Homo sapiens arrives around eleven twenty five p.m. on December thirty first. Five thousand years of written history, including dynasties, wars, and phones, fit into roughly the final thirty five seconds.'
(revision/'narration.txt').write_text(text)
r=requests.post('http://localhost:8880/v1/audio/speech',json={'model':'kokoro','input':text,'voice':'am_fenrir','response_format':'mp3','speed':1},timeout=300);r.raise_for_status();(revision/'voice.mp3').write_bytes(r.content)
dur=float(json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(revision/'voice.mp3')]))['format']['duration'])
left,right=469.14,494.04
speed=dur/(right-left)
subprocess.run(['ffmpeg','-v','error','-y','-i',str(revision/'voice.mp3'),'-af',f'atempo={speed},apad','-t',str(right-left),str(revision/'fitted.wav')],check=True)
with (revision/'fitted.wav').open('rb') as f:
 r=requests.post('http://localhost:9000/asr',params={'encode':'true','task':'transcribe','language':'en','word_timestamps':'true','output':'json','vad_filter':'false'},files={'audio_file':('fitted.wav',f,'audio/wav')},timeout=600)
r.raise_for_status();asr=r.json();(revision/'whisper.json').write_text(json.dumps(asr,indent=2))
print({'generatedDuration':dur,'fitSpeed':speed,'words':sum(len(s.get('words',[])) for s in asr['segments'])})
