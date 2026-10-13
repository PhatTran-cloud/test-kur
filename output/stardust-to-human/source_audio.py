import requests, json, re
from pathlib import Path
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent
ASSETS=ROOT/'animation-studio/public/stardust-to-human/foley'
ASSETS.mkdir(exist_ok=True)
categories=['volcano','bubbles','rock','ice','forest','jungle','roar','explosion','rain','thunder','ocean','heartbeat','clock','footsteps','breathe','fire','wind','whoosh']
catalog=[]
for category in categories:
 url=f'https://mixkit.co/free-sound-effects/{category}/'
 response=requests.get(url,timeout=25);response.raise_for_status()
 soup=BeautifulSoup(response.text,'html.parser')
 for player in soup.select('[data-audio-player-item-id-value]'):
  parent=player
  while parent and not parent.find('h2'):parent=parent.parent
  if not parent:continue
  title=parent.find('h2').get_text(' ',strip=True)
  ident=player['data-audio-player-item-id-value']
  if any(c['id']==ident for c in catalog):continue
  catalog.append({'id':ident,'title':title,'category':category,'page':url,'license':'Mixkit Sound Effects Free License','licenseUrl':'https://mixkit.co/license/#sfxFree'})
 print(category,[(c['id'],c['title']) for c in catalog if c['category']==category],flush=True)
(OUT/'foley-catalog.json').write_text(json.dumps(catalog,indent=2))
selected={'lava':2440,'eruption':2443,'hiss':2447,'bubbles':1321,'water':1317,'rocks':400,'debris':403,'stone':3195,'forest':2414,'birds':1212,'jungle':2420,'roar':1976,'boom':2782,'big-boom':2777,'crash':1703,'rain':1262,'thunder':1296,'ocean':1195,'heart':490,'clock':1063,'footstep':1974,'breath':1914,'fire':1330,'wind':2658,'storm':2411,'whoosh':3024,'ignition':1349,'swirl':1493,'shimmer':2350,'rumble':1686}
ledger=[]
for name,ident in selected.items():
 item=next(c for c in catalog if c['id']==str(ident))
 modal=BeautifulSoup(requests.get(f'https://mixkit.co/free-sound-effects/download/{ident}/',timeout=25).text,'html.parser')
 url=modal.select_one('[data-download--modal-url-value]')['data-download--modal-url-value']
 dest=ASSETS/f'{name}.wav'
 if not dest.exists():
  response=requests.get(url,timeout=40);response.raise_for_status();dest.write_bytes(response.content)
 item={**item,'file':str(dest),'downloadUrl':url,'role':name};ledger.append(item);print('download',name,dest.stat().st_size,flush=True)
(OUT/'audio-source-ledger.json').write_text(json.dumps(ledger,indent=2))
