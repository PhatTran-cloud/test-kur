from pathlib import Path
import json, subprocess, shutil
from pydub import AudioSegment
out=Path('output/stardust-to-human'); rev=out/'calendar-revision'
# Preserve source artifacts once.
for name in ['audio.mp3','timestamps.json','raw-script.md']:
    src=out/name; bak=out/f'original-{name}'
    if not bak.exists(): shutil.copy2(src,bak)
# Replace just the calendar spoken span; preserve all other narration and source timing.
original=AudioSegment.from_file(out/'original-audio.mp3')
replacement=AudioSegment.from_file(rev/'fitted.wav')[:25000]
left,right=469140,494040
joined=original[:left]+replacement+original[right:]
joined.export(out/'audio.mp3',format='mp3',bitrate='192k')
# Update exact word timestamps for the revised segment from Whisper output.
old=json.loads((out/'original-timestamps.json').read_text())
new=json.loads((rev/'whisper.json').read_text())
words=[]
for seg in new['segments']:
  for w in seg.get('words',[]): words.append({'word':w['word'].strip(),'start':round(469.14+w['start'],4),'end':round(469.14+w['end'],4)})
merged=[w for w in old if w['end']<=469.14 or w['start']>=494.04]+words
merged.sort(key=lambda w:w['start'])
(out/'timestamps.json').write_text(json.dumps(merged,indent=2))
# Replace only the old cosmic-calendar paragraph in the source script.
script=(out/'original-raw-script.md').read_text()
oldpara='''If we compress four point five billion years into a single year:\n\nEarth is born on January first. The first life appears in late March. Dinosaurs arrive on December thirteenth. The asteroid kills them on December twenty-sixth. Humans arrive at eleven fifty-nine p.m. on December thirty-first.\n\nEvery dynasty. Every war. Every phone... all within the final fourteen seconds.'''
newpara='''If we compress four point five four billion years into one year:\n\nEarth forms on January first. Life around three point eight billion years ago falls in early March. Dinosaurs arrive around December thirteenth. The asteroid strikes on December twenty-sixth. Homo sapiens arrives around eleven twenty-five p.m. on December thirty-first. Five thousand years of written history, including dynasties, wars, and phones, fit into roughly the final thirty-five seconds.'''
if oldpara not in script: raise SystemExit('calendar paragraph not found')
(out/'raw-script.md').write_text(script.replace(oldpara,newpara))
print({'audioSeconds':len(joined)/1000,'wordCount':len(merged),'replacementWords':len(words)})
