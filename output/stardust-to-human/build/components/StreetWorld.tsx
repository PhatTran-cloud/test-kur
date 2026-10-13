import React,{useMemo,useLayoutEffect} from 'react';
import {FilmCanvas as ThreeCanvas} from './FilmCanvas';
import {useThree} from '@react-three/fiber';
import {Environment} from '@react-three/drei';
import {staticFile,useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {Human} from './HumanAsset';

type V3=[number,number,number];
type Module={position:V3;scale:V3;slot:number};
// Plans retain facade rhythm and street clearance before material-slot compilation.
const buildings=Array.from({length:12},(_,i)=>({x:i%2===0?-10:10,z:7-Math.floor(i/2)*12,width:7.5,depth:10,floors:3+i%4,bays:3,front:i%2===0?1:-1,material:i%3}));
function cityModules():Module[]{
 const modules:Module[]=[];
 for(const b of buildings){const h=b.floors*3.15;
  modules.push({position:[b.x,h/2,b.z],scale:[b.width,h,b.depth],slot:b.material});
  const face=b.x+b.front*(b.width/2+.03);
  for(let floor=0;floor<b.floors;floor++)for(let bay=0;bay<b.bays;bay++){
   const z=b.z-3.2+bay*3.2,y=1.75+floor*3.15;
   modules.push({position:[face,y,z],scale:[.12,1.85,1.7],slot:3});
   for(const dz of [-.95,.95])modules.push({position:[face+b.front*.08,y,z+dz],scale:[.19,2.05,.12],slot:4});
   for(const dy of [-1.02,1.02])modules.push({position:[face+b.front*.08,y+dy,z],scale:[.19,.12,2.02],slot:4});
   modules.push({position:[face+b.front*.2,y-1.03,z],scale:[.4,.12,2.2],slot:4});
  }
  for(let floor=1;floor<=b.floors;floor++)modules.push({position:[face,3.15*floor,b.z],scale:[.25,.14,10.2],slot:4});
  modules.push({position:[face+b.front*.32,2.9,b.z],scale:[.7,.14,9.8],slot:5});
 }
 return modules;
}
const City:React.FC=()=>{
 const meshes=useMemo(()=>{
  const slots=Array.from({length:6},()=>[] as THREE.BufferGeometry[]);
  for(const m of cityModules()){const g=new THREE.BoxGeometry(...m.scale);g.translate(...m.position);slots[m.slot].push(g);}
  return slots.map(s=>mergeGeometries(s));
 },[]);
 const colors=['#b4a699','#bcc5c5','#806f68','#3c5867','#d9ded9','#263d38'];
 return <>{meshes.map((g,i)=><mesh key={i} geometry={g} castShadow receiveShadow><meshStandardMaterial color={colors[i]} metalness={i===3?.65:0} roughness={i===3?.16:.78}/></mesh>)}</>;
};
const StreetCamera:React.FC<{age:number}>=({age})=>{const {camera}=useThree();useLayoutEffect(()=>{const t=THREE.MathUtils.clamp(age/270,0,1),rise=t*t*(3-2*t);camera.position.set(4-rise,18+rise*14,-rise*3);camera.lookAt(0,.1,-7-rise*2);camera.updateProjectionMatrix();},[camera,age]);return null;};
const Ground:React.FC=()=>{
 const map=useMemo(()=>{const w=512,data=new Uint8Array(w*w*4);for(let y=0;y<w;y++)for(let x=0;x<w;x++){const hash=Math.sin(x*127.1+y*311.7)*43758.5453,n=hash-Math.floor(hash),joint=x%128<2||y%64<2;const c=joint?62:123+n*17;const i=(y*w+x)*4;data[i]=c;data[i+1]=c;data[i+2]=c-3;data[i+3]=255;}const t=new THREE.DataTexture(data,w,w);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,24);t.needsUpdate=true;return t;},[]);
 return <><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.01,-20]} receiveShadow><planeGeometry args={[13,85]}/><meshStandardMaterial color="#babdbd" map={map} bumpMap={map} bumpScale={.013} roughness={.82}/></mesh>
  {[-6.3,6.3].map(x=><mesh key={x} position={[x,.055,-20]} receiveShadow><boxGeometry args={[.18,.12,85]}/><meshStandardMaterial color="#a9aaa8" roughness={.9}/></mesh>)}
 </>;
};
const Lamps:React.FC=()=> <>{[-5.4,5.4].flatMap(x=>[1,-14,-29].map((z,i)=><group key={`${x}-${z}`} position={[x,0,z]}>
 <mesh castShadow position={[0,2.05,0]}><cylinderGeometry args={[.045,.07,4.1,12]}/><meshStandardMaterial color="#333d3e" metalness={.7} roughness={.35}/></mesh>
 <mesh position={[0,4.15,0]}><cylinderGeometry args={[.3,.2,.13,24]}/><meshStandardMaterial color="#414e50" metalness={.6}/></mesh>
 <mesh position={[0,.33,.5]} castShadow><boxGeometry args={[.45,.66,.45]}/><meshStandardMaterial color="#52615a" roughness={.8}/></mesh>
 </group>))}</>;
const Crowd:React.FC<{age:number}>=({age})=> <>{Array.from({length:18},(_,i)=>{
 const lane=i%3,direction=lane===1?-1:1,speed=.85+(i%5)*.075,z=5-Math.floor(i/3)*4.6-direction*age/30*speed;
 return <group key={i} position={[-2.8+lane*2.4+(i%2)*.35,0,z]}>
  <Human age={age*(speed/.95)} phase={i*1.63} close walking size={.97+(i%4)*.025} view={direction===1?Math.PI:0} tint={['#becbda','#a1a4b5','#c3a48d','#8dabb7','#aaaaa4','#7e998a'][i%6]}/>
 </group>;
})}</>;
export const StreetWorld:React.FC<{age:number}>=({age})=>{
 const {width,height}=useVideoConfig();return <ThreeCanvas width={width} height={height} shadows camera={{position:[4,2.25,9],fov:47,near:.1,far:140}} style={{position:'absolute',inset:0}} gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:.9}}>
  <color attach="background" args={['#c4d0d2']}/><fog attach="fog" args={['#c4d0d2',26,85]}/><StreetCamera age={age}/>
  <Environment files={staticFile('models/human/lebombo_2k.hdr')} environmentIntensity={.45}/>
  <hemisphereLight args={['#d1e6ed','#666458',1]}/><directionalLight position={[-12,18,8]} color="#fff1db" intensity={3} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22} shadow-camera-far={70} shadow-normalBias={.01}/>
  <City/><Ground/><Lamps/><Crowd age={age}/>
 </ThreeCanvas>;
};
