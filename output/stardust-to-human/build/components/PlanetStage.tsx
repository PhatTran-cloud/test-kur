import {AnimatedShaderMaterial} from './AnimatedShaderMaterial';
import React, {useMemo,useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {FilmCanvas as ThreeCanvas} from './FilmCanvas';
import {useTexture} from '@react-three/drei';
import {useVideoConfig, interpolate, staticFile} from 'remotion';
import * as THREE from 'three';

const KEY=new THREE.Vector3(-4,3,6).normalize();
const EC={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const vertex=`varying vec3 vN; varying vec3 vP; varying vec3 vV; varying vec2 vUv;
void main(){vP=position;vUv=uv;vN=normalize(mat3(modelMatrix)*normal);vec4 world=modelMatrix*vec4(position,1.);vV=normalize(cameraPosition-world.xyz);gl_Position=projectionMatrix*viewMatrix*world;}`;
const noise=`float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+4.7;a*=.5;}return s;}`;
const fragment=`precision highp float;varying vec3 vN;varying vec3 vP;varying vec3 vV;varying vec2 vUv;
uniform float mode,time,cooling,night;uniform vec3 sunDirection;uniform sampler2D dayMap,nightMap,moonMap;
${noise}
void main(){vec3 p=normalize(vP);float diffuse=max(0.,dot(normalize(vN),sunDirection));float light=.09+1.15*diffuse;
float terrain=fbm(p*4.+vec3(fbm(p*2.),fbm(p*2.+9.),fbm(p*2.+17.))*.8);vec3 col;
if(mode<.5){col=texture2D(dayMap,vUv).rgb*light;col+=texture2D(nightMap,vUv).rgb*(1.-smoothstep(0.,.25,diffuse))*night*1.5;}
else if(mode<1.5){float fissure=1.-smoothstep(.009,.045,abs(terrain-.5));vec3 rock=mix(vec3(.035,.02,.023),vec3(.13,.09,.085),fbm(p*20.));col=rock*light+vec3(1.4,.22,.009)*fissure*(1.-cooling);}
else if(mode<2.5){float relief=fbm(p*18.);vec3 ice=mix(vec3(.32,.47,.65),vec3(.93,.98,1.),relief);vec3 ancient=mix(vec3(.015,.13,.3),vec3(.14,.23,.16),smoothstep(.5,.53,terrain));col=mix(ice,ancient,cooling)*light;}
else if(mode<3.5){col=texture2D(moonMap,vUv).rgb*light;}
else if(mode<4.5){float plasma=fbm(p*12.+time*.004);col=mix(vec3(1.3,.085,.003),vec3(2.,1.1,.16),plasma);}
else {float lon=atan(p.x,p.z),lat=asin(p.y);vec2 q=vec2(lon,lat);float north=length((q-vec2(-.15,.42))/vec2(1.0,.52));float south=length((q-vec2(-.22,-.37))/vec2(.83,.67));float coast=min(north,south);float bay=length((q-vec2(.73,.09))/vec2(.65,.4));coast=max(coast,2.-bay);float land=1.-smoothstep(.94,1.04,coast+(fbm(p*19.)-.5)*.09);float ridges=pow(1.-abs(fbm(p*24.)*2.-1.),7.);vec3 green=mix(vec3(.18,.25,.12),vec3(.45,.36,.2),smoothstep(.15,.65,abs(lat)));green=mix(green,vec3(.52,.48,.4),ridges*.35);col=mix(vec3(.012,.085,.19),green,land)*light;col+=vec3(.04,.22,.22)*(1.-abs(land*2.-1.))*.3;}
gl_FragColor=vec4(col,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const atmosphere=`precision highp float;varying vec3 vN;varying vec3 vV;uniform vec3 sunDirection,tint;
void main(){float rim=pow(1.-max(0.,dot(normalize(vN),normalize(vV))),3.2);float lit=.12+.88*max(0.,dot(normalize(vN),sunDirection));gl_FragColor=vec4(tint,rim*lit*.62);}`;
type Maps={dayMap:THREE.Texture;nightMap:THREE.Texture;moonMap:THREE.Texture;cloudMap:THREE.Texture};
const Body:React.FC<{mode:number;time:number;maps:Maps;radius?:number;position?:[number,number,number];cooling?:number;night?:number;deform?:number}>=({mode,time,maps,radius=2,position=[0,0,0],cooling=0,night=0,deform=0})=>{
 const uniforms=useMemo(()=>({mode:{value:mode},time:{value:time},cooling:{value:cooling},night:{value:night},sunDirection:{value:KEY},dayMap:{value:maps.dayMap},nightMap:{value:maps.nightMap},moonMap:{value:maps.moonMap}}),[mode,time,cooling,night,maps]);
 const air=useMemo(()=>({sunDirection:{value:KEY},tint:{value:new THREE.Color(mode===1?'#ff732e':'#66bfff')}}),[mode]);
 return <group position={position} scale={[1+deform,1-deform*.5,1]}>
  <mesh rotation={[.18,time*.0025,.12]}><sphereGeometry args={[radius,96,64]}/><AnimatedShaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms}/></mesh>
  {mode!==3&&<mesh><sphereGeometry args={[radius*1.038,64,48]}/><AnimatedShaderMaterial vertexShader={vertex} fragmentShader={atmosphere} uniforms={air} transparent blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>}
  {(mode===0||mode===2)&&<mesh rotation={[.18,time*.0029,.12]}><sphereGeometry args={[radius*1.008,96,64]}/><meshStandardMaterial color="#fff" alphaMap={maps.cloudMap} transparent opacity={mode===2?.15:.42} depthWrite={false} roughness={1}/></mesh>}
 </group>;
};
const Disk:React.FC<{age:number;accreting:boolean}>=({age,accreting})=><group rotation={[1.1,.08,-.16]}>
 {[2.2,3,3.8,4.5].map(r=><mesh key={r}><torusGeometry args={[r,.013,6,96]}/><meshBasicMaterial color="#dfbb88" transparent opacity={.18}/></mesh>)}
 {Array.from({length:150},(_,i)=>{const a=i*2.399+age*.013/(1+i%7),r=2.1+(i%27)*.091;const collapse=accreting?interpolate(age,[0,360],[1,.72],EC):1;return <mesh key={i} position={[Math.cos(a)*r*collapse,Math.sin(a)*r*collapse,Math.sin(i*5)*.15]} rotation={[a,i,age*.012]}><dodecahedronGeometry args={[.025+(i%5)*.012,0]}/><meshStandardMaterial color={i%3===0?'#f1c795':'#807378'} roughness={.95}/></mesh>;})}
 </group>;
const Meteors:React.FC<{age:number}>=({age})=><>{Array.from({length:6},(_,i)=>{
 const cycle=age-i*58-15;if(cycle<0||cycle>85)return null;
 const normal=new THREE.Vector3(Math.sin(i*2.399)*.72,Math.cos(i*2.399)*.64,.8).normalize();
 const hit=normal.clone().multiplyScalar(2.15),start=hit.clone().add(new THREE.Vector3((i%2?1:-1)*2.6,2.1,1.8));
 const flight=interpolate(cycle,[0,38],[0,1],EC),position=start.clone().lerp(hit,flight),outward=start.clone().sub(hit).normalize();
 const orientation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
 const shock=interpolate(cycle,[38,44,75],[0,.35,.65],EC),fade=interpolate(cycle,[38,43,85],[0,.7,0],EC);
 return <group key={i}>
  {cycle<38&&<><mesh position={position} rotation={[cycle*.06,i,cycle*.09]}><icosahedronGeometry args={[.09,1]}/><meshStandardMaterial color="#4c3426" emissive="#d34d07" emissiveIntensity={1}/></mesh>
   {[0,1,2,3,4,5,6].map(j=><mesh key={j} position={position.clone().addScaledVector(outward,j*.1)} scale={.08*(1-j/8)}><sphereGeometry args={[1,8,6]}/><meshBasicMaterial color={j<3?'#ffcf68':'#c7561b'} transparent opacity={1-j/8} depthWrite={false}/></mesh>)}
  </>}
  {cycle>=38&&<group position={hit.clone().multiplyScalar(1.012)} quaternion={orientation}>
   <mesh scale={shock}><sphereGeometry args={[1,16,12]}/><meshBasicMaterial color="#ffb255" transparent opacity={fade*.6} depthWrite={false}/></mesh>
   <mesh scale={shock*1.7}><ringGeometry args={[.88,1,40]}/><meshBasicMaterial color="#ffce86" transparent opacity={fade} depthWrite={false} side={THREE.DoubleSide}/></mesh>
  </group>}
 </group>;
})}</>;
const PlanetContent:React.FC<{kind:string;age:number}>=({kind,age})=>{
 const loaded=useTexture(['earth_daymap.jpg','2k_earth_nightmap.jpg','2k_moon.jpg','2k_earth_clouds.jpg'].map(name=>staticFile(`stardust-to-human/textures/${name}`)));
 const maps=useMemo(()=>({dayMap:loaded[0],nightMap:loaded[1],moonMap:loaded[2],cloudMap:loaded[3]}),[loaded]);
 const collision=['theia','collision','collision-stars'].includes(kind),orbit=['moon','debris'].includes(kind),disk=['disk','accretion'].includes(kind);
 const mode=kind==='pangea'?5:['lava','meteors','theia','collision','debris','moon','crust','accretion'].includes(kind)?1:['snowball','thaw'].includes(kind)?2:['sun','star','disk','collision-stars'].includes(kind)?4:0;
 const x=collision||orbit?-.8:0;
 const moonAngle=age*.008+.25;
 const aggregate=interpolate(age,[0,250],[0,1],EC);
 return <>
  <ambientLight intensity={.12}/><directionalLight position={[-4,3,6]} intensity={2.2}/>
  <group position={[0,-.12,0]}>
   <Body maps={maps} mode={mode} time={age} radius={disk?.9:collision||orbit?1.85:2.15} position={[x,0,0]} cooling={kind==='crust'?interpolate(age,[0,220],[.35,.96],EC):kind==='thaw'?interpolate(age,[0,350],[0,1],EC):0} night={kind==='city'?1:0} deform={kind==='collision'?interpolate(age,[0,30,160],[0,.08,0],EC):0}/>
   {collision&&<Body maps={maps} mode={kind==='collision-stars'?4:1} time={age*1.2} cooling={kind==='collision-stars'?0:.5} radius={kind==='collision'?.95*interpolate(age,[0,20,85],[1,1,.015],EC):.95} position={[kind==='collision'?interpolate(age,[0,26],[1.78,.95],EC):interpolate(age,[0,220],[4.1,1.78],EC),.85,.2]}/>}
   {kind==='moon'&&<Body maps={maps} mode={3} time={age} radius={.51} position={[x+3.2*Math.cos(moonAngle),.45,2.1*Math.sin(moonAngle)]}/>}
   {kind==='meteors'&&<Meteors age={age}/>}
   {disk&&<Disk age={age} accreting={kind==='accretion'}/>}
   {kind==='debris'&&Array.from({length:120},(_,i)=>{const a=i*2.399+age*.013,r=2.9+(i%5)*.13;const p=new THREE.Vector3(x+Math.cos(a)*r,Math.sin(a)*.36,Math.sin(a)*r*.75);const cluster=new THREE.Vector3(x+3.2*Math.cos(moonAngle)+Math.cos(i*2.399)*.42,.45+Math.sin(i*2.399)*.37,2.1*Math.sin(moonAngle)+Math.sin(i*5)*.33);p.lerp(cluster,aggregate*.94);return <mesh key={i} position={p} rotation={[a,a*.5,a]}><icosahedronGeometry args={[.04+(i%4)*.017,1]}/><meshStandardMaterial color="#ae9e90" roughness={.95}/></mesh>;})}
   {kind==='collision'&&Array.from({length:75},(_,i)=>{const theta=i*2.399,spread=interpolate(age,[18,220],[.01,4.2],EC)*(1+(i%5)*.12);return <mesh key={i} position={[.8+Math.cos(theta)*spread,.55+Math.sin(theta)*spread*.65,Math.sin(i*5)*spread*.4]} rotation={[age*.017+i,age*.021+i,age*.013]}><icosahedronGeometry args={[.06+(i%5)*.023,1]}/><meshStandardMaterial color="#b69780" emissive="#ed5b19" emissiveIntensity={interpolate(age,[0,250],[1.3,.05],EC)} roughness={.9}/></mesh>;})}
   {kind==='collision'&&<mesh position={[.9,.55,.4]} scale={interpolate(age,[0,15,45],[.05,.7,1.5],EC)}><sphereGeometry args={[1,32,24]}/><meshBasicMaterial color="#fff0c8" transparent opacity={interpolate(age,[0,18,65],[0,.9,0],EC)} depthWrite={false}/></mesh>}
  </group>
 </>;
};
const PlanetCamera:React.FC<{kind:string;age:number;distance:number}>=({kind,age,distance})=>{
 const {camera}=useThree();useLayoutEffect(()=>{const t=age/30;const angle=kind==='city'?t*.023:t*.032;camera.position.set(Math.sin(angle)*distance,.1+Math.sin(t*.13)*.08,Math.cos(angle)*distance-Math.min(1.1,t*.1));camera.lookAt(0,-.12,0);camera.updateProjectionMatrix();},[camera,kind,age,distance]);return null;
};
export const PlanetStage:React.FC<{kind:string;age:number}>=({kind,age})=>{
 const {width,height}=useVideoConfig();
 const distance=['theia','collision','collision-stars','moon','debris','disk','accretion'].includes(kind)?10.5:8.7;
 return <ThreeCanvas width={width} height={height} camera={{position:[0,0,distance],fov:42}} style={{position:'absolute',inset:0}} gl={{antialias:true,alpha:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.15}}><PlanetCamera kind={kind} age={age} distance={distance}/><PlanetContent kind={kind} age={age}/></ThreeCanvas>;
};
