"""Validate the approved encoded film, including audio and continuous 3D state."""
import json, math, subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

OUT=Path(__file__).resolve().parent
PUBLIC=OUT.parents[1]/'animation-studio/public/stardust-to-human'
render=OUT/'render';video=render/'final.mp4';qa=render/'final-qa';qa.mkdir(exist_ok=True)
t=json.loads((OUT/'timeline.json').read_text())
def decode(path,rate=24000):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-vn','-ac','1','-ar',str(rate),'-f','f32le','-']),dtype=np.float32)
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)]))
vs=next(s for s in probe['streams'] if s['codec_type']=='video')
assert (vs['width'],vs['height'])==(1920,1080)
assert int(vs['nb_frames'])==t['frames'] and vs['avg_frame_rate']=='30/1'
assert any(s['codec_type']=='audio' for s in probe['streams'])
subprocess.run(['ffmpeg','-v','error','-i',str(video),'-f','null','NUL'],check=True)
audio=decode(video);reference=decode(PUBLIC/'mix.m4a');n=min(len(audio),len(reference))
assert abs(len(audio)-len(reference))<24000*.1
# AAC adds a deterministic encoder delay; align on the first 12 seconds before comparing.
from scipy.signal import correlate
probe_n=min(n,24000*12);lag=int(correlate(audio[:probe_n],reference[:probe_n],method='fft').argmax()-(probe_n-1))
aa=audio[max(lag,0):];bb=reference[max(-lag,0):];n=min(len(aa),len(bb))
error=float(np.sqrt(np.mean((aa[:n]-bb[:n])**2)))
correlation=float(np.corrcoef(aa[:n],bb[:n])[0,1])
assert correlation>.99 and error<.01,(correlation,error,lag)
assert np.sqrt(np.mean(audio[:48000]**2))>.01
assert np.sqrt(np.mean(audio[526*24000:528*24000]**2))>.01,'Final spoken sentence missing'
assert np.max(np.abs(audio[-48000:]))<.001,'Closing black should be silent'
samples=[];sheet=Image.new('RGB',(1600,12*205),'#111');draw=ImageDraw.Draw(sheet)
for index,shot in enumerate(t['shots']):
 end=t['shots'][index+1]['frame'] if index+1<len(t['shots']) else t['frames']-60
 frame=min(shot['frame']+90,end-1);file=qa/f'{index:02}-{frame}.jpg'
 subprocess.run(['ffmpeg','-v','error','-y','-ss',str(frame/30),'-i',str(video),'-frames:v','1','-vf','scale=960:540',str(file)],check=True)
 im=Image.open(file).convert('RGB');assert np.asarray(im).std()>8,f'Blank encoded shot {index}'
 thumb=im.copy();thumb.thumbnail((320,180));x=index%5*320;y=index//5*205;sheet.paste(thumb,(x,y));draw.text((x+5,y+184),f'{index:02} {frame/30:.2f}s {shot["kind"]}',fill='white')
 samples.append({'kind':shot['kind'],'frame':frame,'file':str(file)})
sheet.save(qa/'contact-sheet.jpg',quality=92)
matches={}
for kind,offsets in [('bang',[65,100,180]),('supernova',[65,100,180])]:
 shot=next(s for s in t['shots'] if s['kind']==kind)
 for offset in offsets:
  frame=shot['frame']+offset;file=qa/f'{kind}-{offset}.jpg'
  subprocess.run(['ffmpeg','-v','error','-y','-ss',str(frame/30),'-i',str(video),'-frames:v','1','-vf','scale=960:540',str(file)],check=True)
  a=np.asarray(Image.open(file),dtype=float);b=np.asarray(Image.open(render/f'event-{kind}-{offset}.jpg'),dtype=float)
  difference=float(abs(a-b).mean());assert difference<8,(kind,offset,difference);matches[f'{kind}+{offset}']=difference
for frame in [0,t['frames']-30,t['frames']-1]:
 file=qa/f'hold-{frame}.jpg';subprocess.run(['ffmpeg','-v','error','-y','-ss',str(frame/30),'-i',str(video),'-frames:v','1','-vf','scale=960:540',str(file)],check=True)
 pixels=np.asarray(Image.open(file));assert pixels.std()>8 if frame==0 else pixels.max()<=3
report={'file':str(video),'bytes':video.stat().st_size,'durationSeconds':float(probe['format']['duration']),'frames':int(vs['nb_frames']),'resolution':[1920,1080],'fps':30,'decode':'passed','audioRevision':t['audioRevision'],'audioEncoderDelaySamples':lag,'audioCorrelation':correlation,'audioRmsDifference':error,'sfxCues':len(t['cues']),'encodedShotChecks':len(samples),'continuousExplosionVsFreshStillMeanDifferences':matches,'openingVisible':True,'lastSentencePresent':True,'closingBlackAndSilence':True}
(OUT/'final-verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
