import React,{useLayoutEffect,useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import {useTexture,useGLTF} from '@react-three/drei';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {Easing,interpolate,staticFile,useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {FilmCanvas} from './FilmCanvas';
import {StudioEnvironment} from './StudioEnvironment';
import {Cell,Dinosaur} from './NaturalWorld';
import timeline from '../../timeline.json';

const EC={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const smooth={...EC,easing:Easing.bezier(.22,.75,.25,1)};
const start=timeline.shots.find(s=>s.kind==='calendar')!.frame;
const normalize=(s:string)=>s.replace(/[^a-z0-9]/gi,'').toLowerCase();
const anchor=(word:string)=>{
 const w=timeline.words.find(w=>w.start>start/30+3&&w.start<start/30+28&&normalize(w.word)===word);
 if(!w)throw new Error(`Missing calendar narration anchor: ${word}`);
 return Math.round(w.start*timeline.fps)-start;
};
const YEAR=4.54e9,days=365;
// A non-leap calendar begins January 1 at 00:00 and ends at next January 1.
const yearlyX=(yearsAgo:number)=>200+(1-yearsAgo/YEAR)*1540;
const decemberX=(yearsAgo:number)=>950+((1-yearsAgo/YEAR)*days-334)/31*790;
const events=[
 {date:'JAN 01',time:'',label:'EARTH FORMS',age:YEAR,cue:anchor('earth'),color:'#91bdde',px:200,caption:'4.54 billion years ago'},
 {date:'≈ MAR 01',time:'',label:'EARLY LIFE',age:3.8e9,cue:anchor('life'),color:'#9bcab4',px:yearlyX(3.8e9),caption:'≈ 3.8 billion years ago'},
 {date:'≈ DEC 13',time:'',label:'DINOSAURS',age:230e6,cue:anchor('dinosaurs'),color:'#c4c493',px:decemberX(230e6),caption:'≈ 230 million years ago'},
 {date:'DEC 26',time:'',label:'THE IMPACT',age:66e6,cue:anchor('asteroid'),color:'#cda580',px:decemberX(66e6),caption:'66 million years ago'},
 {date:'DEC 31',time:'≈ 23:25',label:'HOMO SAPIENS',age:300000,cue:anchor('homo'),color:'#ddc399',px:decemberX(300000),caption:'≈ 300,000 years ago'},
];
const finalCue=anchor('history');
const activeAt=(age:number)=>Math.max(0,events.filter(e=>age>=e.cue).length-1);
const monthDays=[0,31,59,90,120,151,181,212,243,273,304,334];
const months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const EarthIcon:React.FC<{age:number}>=({age})=>{
 const [map,cloud]=useTexture(['earth_daymap.jpg','2k_earth_clouds.jpg'].map(f=>staticFile(`stardust-to-human/textures/${f}`)));
 map.colorSpace=THREE.SRGBColorSpace;
 return <group rotation={[.16,age*.002+.5,.12]}>
  <mesh><sphereGeometry args={[.59,64,48]}/><meshStandardMaterial map={map} roughness={.82}/></mesh>
  <mesh rotation={[0,age*.0004,0]}><sphereGeometry args={[.594,48,32]}/><meshStandardMaterial color="#e1e8ec" alphaMap={cloud} transparent opacity={.45} depthWrite={false} roughness={1}/></mesh>
  <mesh><sphereGeometry args={[.604,48,32]}/><meshBasicMaterial color="#5cbbdd" transparent opacity={.075} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>
 </group>;
};
const ImpactIcon:React.FC<{age:number;local:number}>=({age,local})=>{
 const geometry=useMemo(()=>{const g=new THREE.IcosahedronGeometry(.23,7),p=g.attributes.position;for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),d=1+.10*Math.sin(x*47+y*29)+.05*Math.sin(z*135+x*71);
  p.setXYZ(i,x*d*1.1,y*d*.87,z*d);
 }g.computeVertexNormals();return g;},[]);
 const approach=interpolate(local,[0,58],[0,1],smooth);
 const flash=interpolate(local,[57,60,69,96],[0,1,.45,0],EC);
 return <group rotation={[0,-.3,.1]}>
  <mesh rotation={[.4,age*.0008,.2]}><sphereGeometry args={[.45,48,32]}/><meshStandardMaterial color="#374957" roughness={.87}/></mesh>
  <mesh position={[.37-approach*.1,.64-approach*.24,.3]} geometry={geometry} rotation={[age*.004,age*.003,.2]}><meshStandardMaterial color="#807064" roughness={.92} emissive="#b73c12" emissiveIntensity={.1+flash}/></mesh>
  <mesh position={[.22,.29,.36]}><sphereGeometry args={[.055+Math.max(0,local-60)*.0003,24,16]}/><meshBasicMaterial color="#ffb473" transparent opacity={flash*.9} depthWrite={false}/></mesh>
  <pointLight position={[.19,.3,1]} color="#ffb16a" intensity={flash*3} distance={2}/>
 </group>;
};
const HumanBust:React.FC<{age:number}>=({age})=>{
 const source=useGLTF(staticFile('models/human/modern-human.glb')+'?v=5');
 const bust=useMemo(()=>{const scene=clone(source.scene);scene.traverse(o=>{if(o instanceof THREE.Mesh){
  const geometry=o.geometry.clone(),p=geometry.attributes.position,index=geometry.index,kept:number[]=[];
  for(let i=0;i<(index?index.count:p.count);i+=3){const a=index?index.getX(i):i,b=index?index.getX(i+1):i+1,c=index?index.getX(i+2):i+2;
   if(Math.min(p.getY(a),p.getY(b),p.getY(c))>=1.31)kept.push(a,b,c);
  }geometry.setIndex(kept);geometry.computeBoundingSphere();o.geometry=geometry;
 }});return scene;},[source.scene]);
 return <group position={[0,-2.25,0]} rotation={[0,-.2+Math.sin(age*.004)*.12,0]} scale={1.55}><primitive object={bust}/></group>;
};
const CalendarStage:React.FC<{age:number}>=({age})=>{
 const {camera}=useThree(),focus=activeAt(age);
 useLayoutEffect(()=>{camera.position.set(0,0,14);camera.lookAt(0,0,0);camera.updateProjectionMatrix();},[camera]);
 const stars=useMemo(()=>{const p=[];for(let i=0;i<240;i++)p.push(Math.sin(i*137.4)*16,Math.cos(i*73.2)*9,-10-Math.abs(Math.sin(i*31.4))*10);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));return g;},[]);
 return <><color attach="background" args={['#08121a']}/><StudioEnvironment/>
  <ambientLight intensity={.17}/><hemisphereLight intensity={.7} args={['#bfced7','#1d1710']}/>
  <directionalLight position={[-4,6,8]} intensity={2.8}/><directionalLight position={[5,2,-4]} color="#82c3dd" intensity={3}/>
  <points geometry={stars} rotation={[0,age*.000025,0]}><pointsMaterial color="#9ab0cb" size={.012} transparent opacity={.13} depthWrite={false}/></points>
  {events.map((event,i)=>{
   const selected=focus===i,reveal=interpolate(age,[event.cue-18,event.cue+36],[0,1],smooth);
   const emphasis=interpolate(age,[event.cue-18,event.cue+36],[0,1],smooth)-interpolate(age,[events[i+1]?.cue??9999,(events[i+1]?.cue??9999)+36],[0,1],smooth);
   return <group key={event.label} position={[(event.px-960)/105,.18+Math.sin(age*.011+i)*.015,0]} scale={.92+emphasis*.08}>
    <pointLight position={[0,1.5,2.2]} color={event.color} intensity={selected?2.5:.5} distance={3}/>
    {i===0&&<EarthIcon age={age}/>}
    {i===1&&<group rotation={[0,0,-.22]}><Cell age={age} seed={2} position={[.14,0,0]} scale={.31}/></group>}
    {i===2&&<group position={[.25,-.39,0]} scale={.17} rotation={[0,.38,0]}><Dinosaur age={age}/></group>}
    {i===3&&<ImpactIcon age={age} local={age-event.cue}/>}
    {i===4&&<HumanBust age={age}/>}
   </group>;
  })}
 </>;
};

export const CalendarWorld:React.FC<{age:number}>=({age})=>{
 const {width,height}=useVideoConfig(),focus=activeAt(age),final=interpolate(age,[finalCue,finalCue+40],[0,1],smooth);
 return <div style={{position:'absolute',inset:0,background:'#08121a'}}>
  <FilmCanvas width={width} height={height} orthographic camera={{position:[0,0,14],zoom:105,near:.1,far:100}} gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping}} style={{position:'absolute',inset:0}}><CalendarStage age={age}/></FilmCanvas>
  <div style={{position:'absolute',left:145,top:180,color:'#f0ebdd'}}>
   <div style={{fontFamily:'Georgia, serif',fontSize:76,lineHeight:1.1}}>4.54 billion years.</div>
   <div style={{fontSize:25,letterSpacing:3,marginTop:20,color:'#7e9b9f'}}>COMPRESSED INTO ONE CALENDAR YEAR · 365 DAYS</div>
  </div>
  <div style={{position:'absolute',right:165,top:193,textAlign:'right',color:'#afc1c3',fontSize:22,letterSpacing:2,lineHeight:1.6}}>ONE DAY ≈ 12.44 MILLION YEARS<br/>JANUARY 1 → DECEMBER 31</div>
  <svg width={width} height={height} style={{position:'absolute',inset:0}}>
   <defs><linearGradient id="yearRail"><stop stopColor="#809ca5"/><stop offset="1" stopColor="#c6b584"/></linearGradient></defs>
   <path d="M200 378H1740" fill="none" stroke="#687981" strokeWidth="2"/>
   <path d={`M200 378H${interpolate(age,events.map(e=>e.cue),events.map(e=>yearlyX(e.age)),smooth)}`} fill="none" stroke="url(#yearRail)" strokeWidth="3"/>
   {Array.from({length:365},(_,d)=><path key={d} d={`M${200+d/365*1540} 378v${d%7===0?12:5}`} stroke="#6b8089" strokeWidth="1" opacity={d%7===0?.65:.22}/>)}
   {monthDays.map((day,i)=><g key={day}><path d={`M${200+day/365*1540} 369v18`} stroke="#a5b6b7"/><text x={200+day/365*1540} y={348} fill={i===11?'#e6cc95':'#a6b7bd'} fontSize="22" letterSpacing="2" textAnchor="middle">{months[i]}</text></g>)}
   <path d={`M${yearlyX(YEAR*(1-334/365))} 398V421H950V644H1740`} fill="none" stroke="#a39270" strokeWidth="1.4" opacity=".65"/>
   <text x="970" y="442" fill="#bdaa84" fontSize="20" letterSpacing="3">DECEMBER / EXPANDED</text>
   {Array.from({length:32},(_,d)=><path key={d} d={`M${950+d/31*790} 644v${d%5===0?11:5}`} stroke="#897d65" strokeWidth="1" opacity=".45"/>)}
   {[0,1].map(i=><path key={i} d={`M${yearlyX(events[i].age)} 394V644`} fill="none" stroke="#556e7b" strokeWidth="1" opacity=".7"/>)}
   {events.map((e,i)=><g key={e.label}><circle cx={yearlyX(e.age)} cy="378" r={focus===i?5:3} fill={e.color}/><path d={`M${e.px} 644v20`} stroke={e.color} strokeWidth="1.5"/><circle cx={e.px} cy="644" r={focus===i?5:3} fill={e.color}/></g>)}
  </svg>
  {events.map((event,i)=>{const reveal=interpolate(age,[event.cue-18,event.cue+36],[0,1],smooth);return <div key={event.label} style={{position:'absolute',left:event.px-78,top:690,width:156,textAlign:'center',opacity:.47+reveal*.53,translate:`0 ${(1-reveal)*8}px`}}>
   <div style={{fontSize:24,letterSpacing:1,color:event.color,marginBottom:12}}>{event.date}</div>
   <div style={{fontSize:20,letterSpacing:1.5,color:focus===i?'#fff6df':'#b2c1c7'}}>{event.label}</div>
   <div style={{fontSize:18,color:'#789199',marginTop:10,lineHeight:1.4}}>{event.time||event.caption}</div>
  </div>;})}
  <div style={{position:'absolute',left:635,top:490,width:390,textAlign:'left',opacity:interpolate(age,[0,40],[0,1],EC),color:'#dedccd'}}>
   <div style={{fontFamily:'Georgia, serif',fontSize:52,lineHeight:1.1}}>{['A planet is born.','Life takes hold.','The age of giants.','One sudden impact.','Our brief moment.'][focus]}</div>
   <div style={{fontSize:21,letterSpacing:1,color:'#77949e',marginTop:20}}>{focus===4?'≈ 300,000 years in the last 35 minutes.':'A full year. A changing world.'}</div>
  </div>
  <div style={{position:'absolute',left:145,right:145,top:855,borderTop:'1px solid #354851',paddingTop:24,display:'flex',alignItems:'baseline',justifyContent:'space-between',color:'#d9dccf'}}>
   <span style={{fontSize:23,letterSpacing:2}}>JANUARY → DECEMBER</span>
   <div style={{opacity:final,textAlign:'right'}}><span style={{fontSize:23,color:'#adbfbd'}}>≈ 5,000 years of written history</span><span style={{fontFamily:'Georgia, serif',fontSize:46,marginLeft:34,color:'#edd5a7'}}>The final 35 seconds.</span></div>
  </div>
 </div>;
};
