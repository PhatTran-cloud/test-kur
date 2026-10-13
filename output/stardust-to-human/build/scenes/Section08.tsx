// Layout: stacked
// Flow: left-to-right
// Composition: Timeline
// Hook: F1 Slow Burn, visible modern street from frame zero.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneShell, CosmicParticles} from '../components/SceneShell';

export const Section08:React.FC=()=>{
 const frame=useCurrentFrame();
 // Z5: illustrated subject spans the middle row; title companion lives in Z8.
 return <AbsoluteFill>
  {/* Layer 0: opaque background */}
  <AbsoluteFill style={{backgroundColor:'#061822'}}/>
  {/* Layer 1: particles with boxShadow glow and atmospheric orbit geometry */}
  <AbsoluteFill><CosmicParticles frame={frame+10472} color="#ffad77"/>
   <svg width="1920" height="1080"><ellipse cx="960" cy="540" rx="870" ry="470" fill="none" stroke="#ffad77" strokeWidth="2" opacity=".08"/></svg>
  </AbsoluteFill>
  {/* Layer 2: domain illustration; Z5 spans Z4+Z5+Z6 for full-frame cinematic subjects */}
  <AbsoluteFill><SceneShell chapter={7} start={10472}/></AbsoluteFill>
  {/* Layer 3: vignette and moving scan overlay */}
  <AbsoluteFill style={{background:'radial-gradient(ellipse at center, transparent 45%, #01030a 100%)',opacity:.22}}/>
  <div style={{position:'absolute',left:0,right:0,top:(frame*.5)%1080,height:1,backgroundColor:'#d5edff',opacity:.04+Math.sin(frame*.02)*.005}}/>
 </AbsoluteFill>;
};
