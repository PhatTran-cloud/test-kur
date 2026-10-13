"""Compare the middle of each shot, excluding titles and the global progress bar."""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

root=Path(__file__).resolve().parent/'render'
samples=json.loads((root/'motion-audit.json').read_text())
report=[];sheet=Image.new('RGB',(1200,1400),'#101316');draw=ImageDraw.Draw(sheet)
for index in range(56):
    pair=[s for s in samples if s['index']==index]
    images=[Image.open(s['file']).convert('RGB') for s in pair]
    arrays=[np.asarray(im,dtype=float)[90:425,105:855] for im in images]
    difference=np.abs(arrays[1]-arrays[0]).mean(axis=2)
    row={'shot':index,'kind':pair[0]['kind'],'frames':[s['frame'] for s in pair],
         'meanDifference':round(float(difference.mean()),3),
         'changedFraction':round(float((difference>8).mean()),4),
         'nonblank':all(float(a.std())>3 for a in arrays)}
    row['needsReview']=row['meanDifference']<.4 or not row['nonblank']
    report.append(row)
    x=index%6*200;y=index//6*140
    sheet.paste(images[1].resize((200,112)),(x,y));draw.text((x+5,y+115),f"{index:02} {row['kind']} d={row['meanDifference']}",fill='white')
(root/'motion-audit-report.json').write_text(json.dumps(report,indent=2))
sheet.save(root/'motion-audit-contact.jpg',quality=92)
print(json.dumps({'shots':len(report),'withVisibleChange':sum(not r['needsReview'] for r in report),
                  'needsReview':[r for r in report if r['needsReview']]},indent=2))
