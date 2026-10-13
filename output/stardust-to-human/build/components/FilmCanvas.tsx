import React,{useEffect,useLayoutEffect,useRef,useCallback} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {getRemotionEnvironment,useCurrentFrame,useDelayRender} from 'remotion';
import {useThree} from '@react-three/fiber';

const CommittedFrame:React.FC<{frame:number;onDraw:()=>void}>=({frame,onDraw})=>{
 const advance=useThree(s=>s.advance);
 // This is last in the R3F tree. Wait for frame props, transforms and materials to commit.
 useEffect(()=>{advance(performance.now());onDraw();},[advance,frame,onDraw]);return null;
};
export const FilmCanvas:React.FC<React.ComponentProps<typeof ThreeCanvas>>=({children,...props})=>{
 const rendering=getRemotionEnvironment().isRendering,frame=useCurrentFrame();
 const {delayRender,continueRender}=useDelayRender(),pending=useRef<number|null>(null);
 useLayoutEffect(()=>{
  if(!rendering)return;
  const handle=delayRender(`Waiting for authored Three.js scene commit at ${frame}`);pending.current=handle;
  return ()=>{continueRender(handle);if(pending.current===handle)pending.current=null;};
 },[frame,rendering,delayRender,continueRender]);
 const onDraw=useCallback(()=>{if(pending.current!==null){continueRender(pending.current);pending.current=null;}},[continueRender]);
 return <ThreeCanvas {...props} frameloop="never" dpr={rendering?1:.55}>{children}<CommittedFrame frame={frame} onDraw={onDraw}/></ThreeCanvas>;
};
