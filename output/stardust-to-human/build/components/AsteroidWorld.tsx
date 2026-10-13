import {AnimatedShaderMaterial} from './AnimatedShaderMaterial';
import React,{useMemo,useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {FilmCanvas as ThreeCanvas} from './FilmCanvas';
import {useTexture} from '@react-three/drei';
import {useVideoConfig,staticFile,interpolate} from 'remotion';
import * as THREE from 'three';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
const EC={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const vertex=`varying vec3 p,n,w;varying vec2 tex;void main(){p=position;tex=uv;n=normalize(mat3(modelMatrix)*normal);vec4 world=modelMatrix*vec4(position,1.);w=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`;
const noise=`float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}float fbm(vec3 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=noise(p)*a;p=p*2.03+7.4;a*=.5;}return s;}`;
const rockFragment=`varying vec3 p,n,w;varying vec2 tex;uniform float age;${noise}
void main(){float grain=fbm(p*28.);float large=fbm(p*4.);vec3 N=normalize(n);float key=max(0.,dot(N,normalize(vec3(-3.,4.,6.))));vec3 base=mix(vec3(.045,.041,.038),vec3(.34,.29,.23),large);vec3 color=base*(.32+key*1.8)*(grain*.8+.6);float heat=pow(max(0.,dot(N,normalize(vec3(-.7,-.5,1.)))),7.);float crack=1.-smoothstep(.006,.025,abs(fbm(p*12.)-.51));color+=vec3(2.2,.42,.035)*heat*(.12+crack*.8);gl_FragColor=vec4(color,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const flameFragment=`varying vec3 p,n,w;varying vec2 tex;uniform float age;${noise}
void main(){float flow=fbm(vec3(tex.x*7.-age*.055,tex.y*12.,age*.012));float f=pow(1.-tex.x,1.5);float facing=abs(dot(normalize(n),normalize(cameraPosition-w)));float alpha=f*(.12+.65*flow)*pow(facing,.65);vec3 col=mix(vec3(2.6,.17,.008),vec3(4.,1.4,.22),smoothstep(.38,.78,flow)*(1.-tex.x));gl_FragColor=vec4(col,alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
function rockGeometry(){const raw=new THREE.IcosahedronGeometry(1,8);raw.deleteAttribute('normal');raw.deleteAttribute('uv');const g=mergeVertices(raw),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i),q=v.clone().normalize();let r=1+.11*Math.sin(q.x*7+q.z*4)*Math.cos(q.y*9)+.06*Math.sin(q.x*19+q.y*14+q.z*11);
  for(const [x,y,z,size,depth] of [[.4,.6,.7,.25,.16],[-.6,.1,.7,.3,.15],[.1,-.6,.8,.22,.12]]){const d=q.distanceTo(new THREE.Vector3(x,y,z).normalize());r-=Math.exp(-d*d/(size*size))*depth;}
  v.copy(q).multiplyScalar(r);p.setXYZ(i,v.x*1.13,v.y*.87,v.z);}
 g.computeVertexNormals();return g;}
function wakeGeometry(){const positions:number[]=[],uv:number[]=[],idx:number[]=[],steps=72,sides=36;const direction=new THREE.Vector3(.66,.52,-.4).normalize(),a=new THREE.Vector3(0,0,1).cross(direction).normalize(),b=direction.clone().cross(a);
 for(let j=0;j<=steps;j++){const t=j/steps,r=(.76*(1-t)**1.2+.015)*(1+.12*Math.sin(t*35)),center=direction.clone().multiplyScalar(.65+t*6.3);
  for(let k=0;k<=sides;k++){const angle=k/sides*Math.PI*2,v=center.clone().addScaledVector(a,Math.cos(angle)*r).addScaledVector(b,Math.sin(angle)*r);positions.push(v.x,v.y,v.z);uv.push(t,k/sides);if(j<steps&&k<sides){const i=j*(sides+1)+k;idx.push(i,i+1,i+sides+1,i+1,i+sides+2,i+sides+1);}}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
const Content:React.FC<{age:number;impact:boolean}>=({age,impact})=>{
 const {camera}=useThree();useLayoutEffect(()=>{const t=(age+(impact?232:0))/30;camera.position.set(t*.025,.2,9-t*.07);camera.lookAt(0,0,-4);camera.updateProjectionMatrix();},[camera,age,impact]);
 const earth=useTexture(staticFile('stardust-to-human/textures/earth_daymap.jpg'));earth.colorSpace=THREE.SRGBColorSpace;
 const geometry=useMemo(rockGeometry,[]),wake=useMemo(wakeGeometry,[]);
 const t=interpolate(age,[0,232],[0,1],EC),center=new THREE.Vector3(-2.6,-1.35,-4),normal=new THREE.Vector3(.66,.52,.4).normalize(),hit=center.clone().addScaledVector(normal,2.3);
 const progress=t*t,position=new THREE.Vector3(9,7,-24).lerp(hit,progress);
 const flash=impact?interpolate(age,[0,5,35,100],[0,1,.6,0],EC):0;
 const stars=useMemo(()=>{const p=[];for(let i=0;i<500;i++)p.push(Math.sin(i*137.3)*20,Math.cos(i*41.7)*12,-20-Math.abs(Math.sin(i*2.3))*20);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));return g;},[]);
 return <><color attach="background" args={['#050c13']}/><ambientLight intensity={.25}/><directionalLight position={[-3,4,6]} intensity={3}/>
  <points geometry={stars}><pointsMaterial size={.025} color="#c5d4dc"/></points>
  <group position={center} rotation={[.3,.6,.1]}><mesh><sphereGeometry args={[2.3,96,64]}/><meshStandardMaterial map={earth} roughness={1}/></mesh><mesh><sphereGeometry args={[2.33,64,48]}/><meshBasicMaterial color="#2685ab" transparent opacity={.12} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh></group>
  {!impact&&<group position={position} scale={.24}>
   <mesh geometry={wake}><AnimatedShaderMaterial vertexShader={vertex} fragmentShader={flameFragment} uniforms={{age:{value:age}}} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending}/></mesh>
   <mesh geometry={geometry} rotation={[age*.002,age*.003,.2]}><AnimatedShaderMaterial vertexShader={vertex} fragmentShader={rockFragment} uniforms={{age:{value:age}}}/></mesh>
  </group>}
  {impact&&<group position={hit}>
   <pointLight color="#ffca76" intensity={flash*130} distance={20}/>
   <mesh scale={.08+age*.028}><sphereGeometry args={[1,48,32]}/><meshBasicMaterial color="#fff1ce" transparent opacity={flash*.9} depthWrite={false}/></mesh>
   <group quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),normal)}><mesh scale={.15+age*.036}><ringGeometry args={[.91,1,64]}/><meshBasicMaterial color="#ffb951" transparent opacity={interpolate(age,[0,9,150],[0,.8,0],EC)} side={THREE.DoubleSide} depthWrite={false}/></mesh></group>
   {Array.from({length:80},(_,i)=>{const a=i*2.399,s=Math.max(0,age-4)*.018*(1+i%5*.12);return <mesh key={i} position={[Math.cos(a)*s,Math.sin(a)*s*.8,s*.25+Math.sin(i*7)*s*.3]} scale={.025+(i%3)*.009}><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color="#57453a" emissive="#ff600e" emissiveIntensity={interpolate(age,[0,180],[2,.05],EC)}/></mesh>;})}
  </group>}
 </>;
};
export const AsteroidWorld:React.FC<{age:number;impact?:boolean}>=({age,impact=false})=>{const {width,height}=useVideoConfig();const flash=impact?interpolate(age,[0,3,12,30],[0,.9,.4,0],EC):0;return <><ThreeCanvas width={width} height={height} camera={{position:[0,.2,9],fov:42,near:.1,far:150}} gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping}} style={{position:'absolute',inset:0}}><Content age={age} impact={impact}/></ThreeCanvas>{impact&&<div style={{position:'absolute',inset:0,backgroundColor:'#fff3cf',opacity:flash}}/>}</>;};
