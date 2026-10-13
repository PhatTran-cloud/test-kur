"""Fit CC0 MakeHuman system clothing and UV skin to the existing authored rig."""
from v6_session import guard
guard('asset-intake', 'stardust-to-human', record=False)
import runpy, sys, json, struct
from pathlib import Path
import numpy as np
from scipy.spatial import cKDTree

sys.argv = ['intake-human.py', '--modern']
base = runpy.run_path('animation-studio/scripts/intake-human.py')
p, v, rig, names = (base[k] for k in ['p', 'v', 'rig', 'names'])
heads, jw, ji = (base[k] for k in ['heads', 'jw', 'ji'])
scale, bottom = base['scale'], base['bottom']
cloth = p/'system/clothes/male_casualsuit06'

def obj(path, body_only=False):
    positions, uvs, faces, group = [], [], [], ''
    for line in path.read_text().splitlines():
        s = line.split()
        if not s: continue
        if s[0] == 'v': positions.append(list(map(float, s[1:])))
        elif s[0] == 'vt': uvs.append(list(map(float, s[1:3])))
        elif s[0] == 'g': group = s[1]
        elif s[0] == 'f' and (not body_only or group == 'body'):
            faces.append([(int(t.split('/')[0])-1, int(t.split('/')[1])-1) for t in s[1:]])
    return np.array(positions), np.array(uvs), faces

raw, skin_uv, skin_faces = obj(p/'base.obj', True)
_, cloth_uv, cloth_faces = obj(cloth/'male_casualsuit06.obj')
refs, deleted, factors = [], set(), np.ones(3)
section = ''
for line in (cloth/'male_casualsuit06.mhclo').read_text().splitlines():
    s = line.split()
    if not s or s[0].startswith('#'): continue
    if s[0] in ['x_scale', 'y_scale', 'z_scale']:
        axis = 'xyz'.index(s[0][0]); a,b = map(int,s[1:3])
        factors[axis] = abs((v[a,axis]-v[b,axis])/scale)/float(s[3])
    elif s[0] in ['verts', 'delete_verts']: section = s[0]
    elif section == 'verts' and s[0].lstrip('-').isdigit():
        if len(s) == 1: refs.append(([int(s[0])], [1.], [0.,0.,0.]))
        else: refs.append((list(map(int,s[:3])),list(map(float,s[3:6])),list(map(float,s[6:9]))))
    elif section == 'delete_verts':
        i = 0
        while i < len(s):
            if i+2 < len(s) and s[i+1] == '-': deleted.update(range(int(s[i]),int(s[i+2])+1)); i+=3
            else: deleted.add(int(s[i])); i+=1

cloth_v = np.array([sum(v[i]*w for i,w in zip(ids,ws))+np.array(offset)*factors*scale for ids,ws,offset in refs])
body_ids = np.array(base['bodyids'])
tree = cKDTree(v[body_ids]); distances, nearest = tree.query(cloth_v,k=3)
cloth_ji = np.zeros((len(cloth_v),4),np.uint16)
cloth_jw = np.zeros((len(cloth_v),4),np.float32)
for row in range(len(cloth_v)):
    contributions = {}
    for near,d in zip(nearest[row],distances[row]):
        vertex = body_ids[near]
        for bone,w in zip(ji[vertex],jw[vertex]): contributions[int(bone)] = contributions.get(int(bone),0)+w/max(.001,d)**2
    top = sorted(contributions.items(),key=lambda item:item[1],reverse=True)[:4]
    for j,(bone,w) in enumerate(top): cloth_ji[row,j]=bone;cloth_jw[row,j]=w
    cloth_jw[row]/=cloth_jw[row].sum()

g = base['g'];g['accessors']=[];g['bufferViews']=[];g['meshes']=[{'primitives':[]}]; data=bytearray()
g['materials']=[
 {'name':'AuthoredSkin','pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'baseColorTexture':{'index':0},'roughnessFactor':.62,'metallicFactor':0}},
 {'name':'AuthoredCottonAndDenim','pbrMetallicRoughness':{'baseColorTexture':{'index':1},'roughnessFactor':.88,'metallicFactor':0},'normalTexture':{'index':2,'scale':.35},'doubleSided':True}]
g['images']=[{'uri':'system/skins/young_asian_male/young_lightskinned_male_diffuse3.png'}, {'uri':'system/clothes/male_casualsuit06/male_casualsuit06_diffuse.png'}, {'uri':'system/clothes/male_casualsuit06/male_casualsuit06_normal.png'}]
g['textures']=[{'source':i} for i in range(3)]

def accessor(arr,ctype,typ,target=None):
    while len(data)%4:data.append(0)
    start=len(data);data.extend(arr.tobytes());bv={'buffer':0,'byteOffset':start,'byteLength':arr.nbytes}
    if target:bv['target']=target
    g['bufferViews'].append(bv);a={'bufferView':len(g['bufferViews'])-1,'componentType':ctype,'count':len(arr),'type':typ}
    if typ=='VEC3':a.update(min=arr.min(axis=0).tolist(),max=arr.max(axis=0).tolist())
    g['accessors'].append(a);return len(g['accessors'])-1

def primitive(positions,uvs,faces,joints,weights,material):
    remap={};original=[];coords=[];triangles=[]
    normals=np.zeros_like(positions)
    for face in faces:
        for k in range(1,len(face)-1):
            tri=[face[0],face[k],face[k+1]];ids=[a[0] for a in tri]
            n=np.cross(positions[ids[1]]-positions[ids[0]],positions[ids[2]]-positions[ids[0]])
            for vertex,tex in tri:
                normals[vertex]+=n;key=(vertex,tex)
                if key not in remap:remap[key]=len(original);original.append(vertex);coords.append([uvs[tex][0],1-uvs[tex][1]])
                triangles.append(remap[key])
    normals/=np.maximum(np.linalg.norm(normals,axis=1)[:,None],1e-12)
    attrs={'POSITION':accessor(positions[original].astype(np.float32),5126,'VEC3',34962),'NORMAL':accessor(normals[original].astype(np.float32),5126,'VEC3',34962),'TEXCOORD_0':accessor(np.array(coords,np.float32),5126,'VEC2',34962),'JOINTS_0':accessor(joints[original],5123,'VEC4',34962),'WEIGHTS_0':accessor(weights[original],5126,'VEC4',34962)}
    g['meshes'][0]['primitives'].append({'attributes':attrs,'indices':accessor(np.array(triangles,np.uint32),5125,'SCALAR',34963),'material':material})

primitive(v,skin_uv,[f for f in skin_faces if not any(i in deleted for i,_ in f)],ji,jw,0)
primitive(cloth_v,cloth_uv,cloth_faces,cloth_ji,cloth_jw,1)
shoe_path=p/'system/clothes/shoes01'
_,shoe_uv,shoe_faces=obj(shoe_path/'shoes01.obj')
shoe_refs=[];shoe_factors=np.ones(3);section=''
for line in (shoe_path/'shoes01.mhclo').read_text().splitlines():
    s=line.split()
    if not s or s[0].startswith('#'):continue
    if s[0] in ['x_scale','y_scale','z_scale']:
        axis='xyz'.index(s[0][0]);a,b=map(int,s[1:3]);shoe_factors[axis]=abs((v[a,axis]-v[b,axis])/scale)/float(s[3])
    elif s[0] in ['verts','delete_verts']:section=s[0]
    elif section=='verts' and len(s)==9:shoe_refs.append((list(map(int,s[:3])),list(map(float,s[3:6])),list(map(float,s[6:9]))))
shoe_v=np.array([sum(v[i]*w for i,w in zip(ids,ws))+np.array(offset)*shoe_factors*scale for ids,ws,offset in shoe_refs])
_,shoe_near=tree.query(shoe_v,k=1);shoe_ji=ji[body_ids[shoe_near]];shoe_jw=jw[body_ids[shoe_near]]
g['images'].extend([{'uri':'system/clothes/shoes01/shoes01_diffuse.png'},{'uri':'system/clothes/shoes01/shoes01_normal.png'}]);g['textures'].extend([{'source':3},{'source':4}])
g['materials'].append({'name':'AuthoredShoes','pbrMetallicRoughness':{'baseColorTexture':{'index':3},'roughnessFactor':.75,'metallicFactor':0},'normalTexture':{'index':4,'scale':.5},'doubleSided':True})
primitive(shoe_v,shoe_uv,shoe_faces,shoe_ji,shoe_jw,2)
inv=[]
for n in names:
    matrix=np.eye(4);matrix[:3,3]=-heads[n];inv.append(matrix.T.reshape(-1))
g['skins'][0]['inverseBindMatrices']=accessor(np.array(inv,np.float32),5126,'MAT4')
g['buffers'][0]['byteLength']=len(data)
while len(data)%4:data.append(0)
j=json.dumps(g,separators=(',',':')).encode();j+=b' '*((-len(j))%4)
glb=struct.pack('<III',0x46546c67,2,12+8+len(j)+8+len(data))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(data),0x004e4942)+data
(p/'modern-human.glb').write_bytes(glb)
print('UV skin and authored clothing:',len(glb),'bytes;',len(cloth_v),'garment vertices')
