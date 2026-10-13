from v6_session import guard
guard('asset-intake', 'stardust-to-human', record=False)
import pathlib,json,numpy as np,struct,sys
modern='--modern' in sys.argv
p=pathlib.Path('animation-studio/public/models/human');v=[];uv=[];faces=[];group=''
for l in (p/'base.obj').read_text().splitlines():
 s=l.split()
 if not s:continue
 if s[0]=='v':v.append(list(map(float,s[1:])))
 elif s[0]=='vt':uv.append(list(map(float,s[1:])))
 elif s[0]=='g':group=s[1]
 elif s[0]=='f' and group=='body':faces.append([int(t.split('/')[0])-1 for t in s[1:]])
v=np.array(v)
for n,a in [('asian-male-young.target',.55),('african-male-young.target',.25),('caucasian-male-young.target',.2),('universal-male-young-averagemuscle-averageweight.target',1)]:
 for l in (p/n).read_text().splitlines():
  s=l.split()
  if s and not l.startswith('#'):v[int(s[0])]+=np.array(list(map(float,s[1:])))*a
bodyids=sorted(set(i for f in faces for i in f));bottom=v[bodyids,1].min();scale=1.78/(v[bodyids,1].max()-bottom);v=(v-[0,bottom,0])*scale
rig=json.loads((p/'default.mhskel').read_text());weights=json.loads((p/'default_weights.mhw').read_text())['weights'];names=list(rig['bones']);heads={n:v[rig['joints'][b['head']]].mean(axis=0) for n,b in rig['bones'].items()}
print('body',len(bodyids),'faces',len(faces),'height',v[bodyids,1].max());print({n:heads[n].round(3).tolist() for n in ['head','eye.L','eye.R','upperarm01.L','upperarm02.L','lowerarm01.L','lowerarm02.L','wrist.L','upperleg01.L','lowerleg01.L']})
# All bones use a world-aligned rest frame. This preserves the provided skin weights and gives explicit pose axes.
wlist=[[] for _ in v]
for n,ws in weights.items():
 for i,w in ws:wlist[i].append((names.index(n),w))
ji=np.zeros((len(v),4),np.uint16);jw=np.zeros((len(v),4),np.float32)
for i,ws in enumerate(wlist):
 ws=sorted(ws,key=lambda a:a[1],reverse=True)[:4] or [(names.index('root'),1)]
 for j,(bone,w) in enumerate(ws):ji[i,j]=bone;jw[i,j]=w
 jw[i]/=jw[i].sum()
tris=[[],[],[],[]] if modern else [[],[],[]]
for f in faces:
 c=v[f].mean(axis=0);y=c[1];x=c[0];z=c[2]
 material=1 if .64<y<1.03 and abs(x)<.29 else 0
 # A fitted woven sleeveless tunic, avoiding bare anatomy at the chest and pelvis.
 if 1.0<=y<1.43 and abs(x)<.29:material=1
 if modern:
  material=0
  if .64<y<1.04 and abs(x)<.29:material=2
  if 1.04<=y<1.435 and abs(x)<.27:material=1
  shoulder=heads['upperarm01.L' if x>0 else 'upperarm01.R'];elbow=heads['lowerarm01.L' if x>0 else 'lowerarm01.R'];axis=elbow-shoulder
  along=np.dot(c-shoulder,axis)/np.dot(axis,axis);d=np.linalg.norm(c-shoulder-np.clip(along,0,1)*axis)
  if -.18<along<.45 and d<.095:material=1
 # Short hair follows the authored scalp rather than adding a spherical helmet.
 if y>1.697 or (y>1.62 and z<-.005):material=3 if modern else 2
 for k in range(1,len(f)-1):tris[material].extend([f[0],f[k],f[k+1]])
normal=np.zeros_like(v)
for ts in tris:
 for a,b,c in np.array(ts).reshape(-1,3):
  n=np.cross(v[b]-v[a],v[c]-v[a]);normal[a]+=n;normal[b]+=n;normal[c]+=n
normal/=np.maximum(np.linalg.norm(normal,axis=1)[:,None],1e-12)
g={'asset':{'version':'2.0','generator':'MakeHuman CC0 asset intake; authored mesh and default weights'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':'AdultHuman','children':[1,2]},{'name':'Body','mesh':0,'skin':0},{'name':'Skeleton','children':[3+names.index('root')]}],'skins':[{'joints':list(range(3,3+len(names))),'skeleton':3+names.index('root')}],'meshes':[{'primitives':[]}],'materials':[{'name':'Skin','pbrMetallicRoughness':{'baseColorFactor':[.38,.205,.115,1],'roughnessFactor':.65,'metallicFactor':0}},{'name':'WovenTunic','pbrMetallicRoughness':{'baseColorFactor':[.16,.105,.056,1],'roughnessFactor':.95,'metallicFactor':0}},{'name':'ShortHair','pbrMetallicRoughness':{'baseColorFactor':[.025,.019,.015,1],'roughnessFactor':.93,'metallicFactor':0}}],'buffers':[{}],'bufferViews':[],'accessors':[]}
data=bytearray()
if modern:
 g['materials']=[{'name':'ModernClothing','pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'roughnessFactor':.85,'metallicFactor':0}}]
 colors=np.tile([.38,.205,.115],(len(v),1))
 for i,c in enumerate(v):
  x,y,z=c;side='L' if x>0 else 'R';shoulder=heads[f'upperarm01.{side}'];elbow=heads[f'lowerarm01.{side}'];axis=elbow-shoulder
  along=np.dot(c-shoulder,axis)/np.dot(axis,axis);d=np.linalg.norm(c-shoulder-np.clip(along,0,1)*axis)
  collar=1.407+.11*min(1,abs(x)/.25);shirt=min(np.clip((y-1.045)/.025,0,1),np.clip((collar-y)/.018,0,1),np.clip((.272-abs(x))/.018,0,1))
  if d<.095:shirt=max(shirt,min(np.clip((along+.15)/.13,0,1),np.clip((.4-along)/.12,0,1)))
  colors[i]=colors[i]*(1-shirt)+np.array([.65,.69,.71])*shirt
  shorts=min(np.clip((y-.665)/.025,0,1),np.clip((1.058-y)/.02,0,1),np.clip((.3-abs(x))/.02,0,1))
  colors[i]=colors[i]*(1-shorts)+np.array([.024,.037,.052])*shorts
  hair=max(np.clip((y-1.694)/.012,0,1),np.clip((y-1.623)/.012,0,1)*np.clip((-z-.005)/.02,0,1))
  colors[i]=colors[i]*(1-hair)+np.array([.025,.019,.015])*hair
 tris=[sum(tris,[])]
def accessor(arr,ctype,typ,target=None):
 while len(data)%4:data.append(0)
 start=len(data);data.extend(arr.tobytes());bv={'buffer':0,'byteOffset':start,'byteLength':arr.nbytes}
 if target:bv['target']=target
 g['bufferViews'].append(bv);a={'bufferView':len(g['bufferViews'])-1,'componentType':ctype,'count':len(arr),'type':typ}
 if typ=='VEC3':a.update(min=arr.min(axis=0).tolist(),max=arr.max(axis=0).tolist())
 g['accessors'].append(a);return len(g['accessors'])-1
pos=accessor(v.astype(np.float32),5126,'VEC3',34962);norm=accessor(normal.astype(np.float32),5126,'VEC3',34962);joint=accessor(ji,5123,'VEC4',34962);weight=accessor(jw,5126,'VEC4',34962)
attributes={'POSITION':pos,'NORMAL':norm,'JOINTS_0':joint,'WEIGHTS_0':weight}
if modern:attributes['COLOR_0']=accessor(colors.astype(np.float32),5126,'VEC3',34962)
for m,t in enumerate(tris):g['meshes'][0]['primitives'].append({'attributes':attributes,'indices':accessor(np.array(t,np.uint16),5123,'SCALAR',34963),'material':m})
inv=[]
for n in names:
 parent=rig['bones'][n]['parent'];relative=heads[n]-heads[parent] if parent else heads[n];children=[3+names.index(k) for k,b in rig['bones'].items() if b['parent']==n]
 node={'name':n,'translation':relative.tolist()}
 if children:node['children']=children
 g['nodes'].append(node);matrix=np.eye(4);matrix[:3,3]=-heads[n];inv.append(matrix.T.reshape(-1))
g['skins'][0]['inverseBindMatrices']=accessor(np.array(inv,np.float32),5126,'MAT4')
g['buffers'][0]['byteLength']=len(data)
while len(data)%4:data.append(0)
j=json.dumps(g,separators=(',',':')).encode();j+=b' '*((-len(j))%4)
glb=struct.pack('<III',0x46546c67,2,12+8+len(j)+8+len(data))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(data),0x004e4942)+data
(p/('modern-human.glb' if modern else 'adult-human.glb')).write_bytes(glb)
(p/'intake.json').write_text(json.dumps({'source':'https://github.com/makehumancommunity/makehuman','license':'CC0','heightMetres':1.78,'vertices':len(bodyids),'triangles':sum(len(t)//3 for t in tris),'bones':len(names),'eyes':{n:heads[n].tolist() for n in ['eye.L','eye.R']},'head':heads['head'].tolist()},indent=2));print('GLB bytes',len(glb))
