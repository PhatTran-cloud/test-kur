import React,{useMemo} from 'react';
import {FilmCanvas as ThreeCanvas} from './FilmCanvas';
import {useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Starfield} from './SpaceWorld';
import {StudioEnvironment} from './StudioEnvironment';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
const Specimens:React.FC<{age:number}>=({age})=>{
 const geometry=useMemo(()=>{let g:THREE.BufferGeometry=new THREE.IcosahedronGeometry(1,5);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),s=.9+.04*Math.sin(x*17+y*13+z*19)+.012*Math.sin(x*79+y*43);p.setXYZ(i,x*s,y*s,z*s);}g.deleteAttribute('normal');g.deleteAttribute('uv');g=mergeVertices(g);g.computeVertexNormals();return g;},[]);
 return <><color attach="background" args={['#05070b']}/><Starfield/><StudioEnvironment/><ambientLight intensity={.3}/><hemisphereLight intensity={.8} args={['#c3def5','#151210']}/><directionalLight position={[-4,5,5]} intensity={5}/><directionalLight position={[4,1,-2]} color="#89c8e5" intensity={3}/>
  <mesh position={[-3.15,.1,0]} geometry={geometry} rotation={[.3,age*.003,.2]}><meshStandardMaterial color="#797875" metalness={.85} roughness={.36}/></mesh>
  <group position={[0,.1,0]} rotation={[.25,age*.002,-.2]}>{[-1,0,1].map(i=><mesh key={i} position={[i*.35,i*.25,0]} rotation={[.2,i*.4,.1]} scale={[.32,.8,.4]}><boxGeometry/><meshPhysicalMaterial color="#e1e7df" roughness={.23} metalness={.05} clearcoat={.8}/></mesh>)}</group>
  <mesh position={[3.15,.1,0]} rotation={[.52,age*.004,.25]}><torusGeometry args={[.8,.14,32,128]}/><meshStandardMaterial color="#e5b452" metalness={1} roughness={.18}/></mesh>
 </>;
};
export const ElementWorld:React.FC<{age:number}>=({age})=>{const {width,height}=useVideoConfig();return <><ThreeCanvas width={width} height={height} camera={{position:[0,.4,10],fov:43}} style={{position:'absolute',inset:0}} gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping}}><Specimens age={age}/></ThreeCanvas><div style={{position:'absolute',left:250,right:250,top:710,display:'grid',gridTemplateColumns:'repeat(3,1fr)',textAlign:'center',color:'#e3e5e4',fontSize:34}}>{['Fe / IRON','Ca / CALCIUM','Au / GOLD'].map(label=><div key={label}>{label}</div>)}</div></>;};
