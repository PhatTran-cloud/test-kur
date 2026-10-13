import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, random, spring} from 'remotion';
import {World} from './Worlds';
import timeline from '../../timeline.json';

const EC={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;

export const CosmicParticles:React.FC<{frame:number; color:string}> = ({frame:f,color}) => <>
 {Array.from({length:36},(_,i)=>{const x=random(`x${i}`)*1920,y=(random(`y${i}`)*1080-f*.2+1080)%1080;return <div key={i} style={{position:'absolute',left:x,top:y,width:12,height:12,borderRadius:'50%',background:color,opacity:.15+random(i)*.12,boxShadow:`0 0 16px ${color}`,transform:`scale(${.8+Math.sin(f*.017+i)*.2})`}}/>;})}
</>;

export const SceneShell:React.FC<{chapter:number; start:number}> = ({chapter,start}) => {
 const local=useCurrentFrame(),f=local+start;
 const chapterEnd=timeline.chapters[chapter+1]?.frame||timeline.frames;
 const list=timeline.shots.filter(s=>s.frame<=f&&s.frame<chapterEnd);
 const shot=list[list.length-1]||timeline.shots[0];
 const age=f-shot.frame;
 let motionIndex=Math.max(0,list.length-1);
 while(motionIndex>0&&timeline.shots[motionIndex-1].kind===shot.kind)motionIndex--;
 const motionAge=f-timeline.shots[motionIndex].frame;
 const color=chapter===3||chapter===7||chapter===8?'#ffad77':chapter>=4?'#8bd6d1':'#d4b7ff';
 const titleIn=spring({frame:age,fps:30,config:{damping:200,stiffness:120}});
 const titleSize=shot.title.length>34?58:72;
 const finalShot=shot.kind==='city';
 const contentFade=chapter===0?1:interpolate(local,[0,14],[0,1],EC);
 const previous=list[list.length-2];
 const blend=previous&&previous.kind!==shot.kind&&age<20&&shot.frame>start&&shot.kind!=='impact';
 let previousIndex=Math.max(0,list.length-2);
 while(previousIndex>0&&timeline.shots[previousIndex-1].kind===previous?.kind)previousIndex--;
 const fade=interpolate(age,[0,20],[0,1],EC);
 const flashAge=shot.kind==='bang'?age-27:shot.kind==='supernova'?age-40:-999;
 const burstFlash=flashAge>=0?Math.exp(-flashAge/5)*.65:0;
 return <AbsoluteFill style={{fontFamily:'Arial, sans-serif'}}>
  {/* Layer 2: content; authored World contains full-frame original SVG/3D illustration */}
  <AbsoluteFill style={{opacity:contentFade}}>
   {blend&&<AbsoluteFill key="outgoing"><World kind={previous.kind} frame={f} age={f-timeline.shots[previousIndex].frame}/></AbsoluteFill>}
   <AbsoluteFill key="incoming" style={{opacity:blend?fade:1}}><World kind={shot.kind} frame={f} age={motionAge}/></AbsoluteFill>
   <AbsoluteFill style={{backgroundColor:'#eef4ff',opacity:burstFlash,pointerEvents:'none'}}/>
   <div style={{position:'absolute',left:100,top:75,display:'flex',gap:18,alignItems:'center',color:'#f6edda',textShadow:'0 2px 10px #000'}}>
    <svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="25" fill="none" stroke={color} strokeWidth="3"/><path d="M8 36 H64 M36 8 V64" stroke={color} strokeWidth="2"/></svg>
    <span style={{fontSize:30,letterSpacing:5}}>{chapter===0?'PROLOGUE':`CHAPTER ${String(chapter).padStart(2,'0')}`} / {timeline.chapters[chapter].title}</span>
   </div>
   {/* Z8: support title group with its own star icon, within x100..1820 y860..1010 */}
   {shot.kind!=='calendar'&&<div style={{position:'absolute',left:100,right:100,top:finalShot?190:875,display:'flex',alignItems:'center',justifyContent:finalShot?'center':'flex-start',gap:25,opacity:titleIn,transform:`translateY(${(1-titleIn)*24+Math.sin(f*.02)*2}px)`,color:'#fff7e8',textShadow:'0 2px 25px #000'}}>
    <svg width="86" height="86" viewBox="0 0 86 86"><path d="M43 3 L52 33 L83 43 L52 53 L43 83 L33 53 L3 43 L33 33Z" fill={color}/></svg>
    <div style={{fontSize:titleSize,fontFamily:'Georgia, serif',letterSpacing:0,lineHeight:1.12,fontWeight:500}}>{shot.title}{finalShot&&<div style={{fontSize:48,marginTop:14,letterSpacing:3,color:'#f1dcb5'}}>DON'T WASTE THEM.</div>}</div>
   </div>}
   {finalShot&&<div style={{position:'absolute',left:100,right:100,bottom:70,textAlign:'center',color:'#dce7ed',fontSize:28,textShadow:'0 2px 8px #000'}}>Earth: NASA Blue Marble | Moon / clouds: Solar System Scope (CC BY 4.0)</div>}
   <svg width="1920" height="1080" style={{position:'absolute',inset:0,pointerEvents:'none'}}><path d="M100 1030 H1820" stroke="#c1cbd5" strokeOpacity=".2" strokeWidth="3"/><path d={`M100 1030 H${100+1720*f/timeline.frames}`} stroke={color} strokeWidth="4"/></svg>
  </AbsoluteFill>
 </AbsoluteFill>;
};
