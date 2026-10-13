import React from 'react';
import {AbsoluteFill, Audio, Composition, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';
import {slide} from '@remotion/transitions/slide';
import {getAudioDurationInSeconds} from '../../../animation-studio/src/utils/audioMetadata';
import timeline from '../timeline.json';
import {Section01} from './scenes/Section01';
import {Section02} from './scenes/Section02';
import {Section03} from './scenes/Section03';
import {Section04} from './scenes/Section04';
import {Section05} from './scenes/Section05';
import {Section06} from './scenes/Section06';
import {Section07} from './scenes/Section07';
import {Section08} from './scenes/Section08';
import {Section09} from './scenes/Section09';
import {Section10} from './scenes/Section10';

const scenes=[Section01,Section02,Section03,Section04,Section05,Section06,Section07,Section08,Section09,Section10];
const chapterTransitions=[
 <TransitionSeries.Transition key="t0" presentation={fade()} timing={linearTiming({durationInFrames:20})}/>,
 <TransitionSeries.Transition key="t1" presentation={wipe({direction:'from-left'})} timing={linearTiming({durationInFrames:20})}/>,
 <TransitionSeries.Transition key="t2" presentation={fade()} timing={linearTiming({durationInFrames:20})}/>,
 <TransitionSeries.Transition key="t3" presentation={slide({direction:'from-right'})} timing={linearTiming({durationInFrames:20})}/>,
 <TransitionSeries.Transition key="t4" presentation={fade()} timing={linearTiming({durationInFrames:20})}/>,
 <TransitionSeries.Transition key="t5" presentation={wipe({direction:'from-bottom'})} timing={linearTiming({durationInFrames:20})}/>,
 <TransitionSeries.Transition key="t6" presentation={fade()} timing={linearTiming({durationInFrames:20})}/>,
 <TransitionSeries.Transition key="t7" presentation={wipe({direction:'from-right'})} timing={linearTiming({durationInFrames:20})}/>,
 <TransitionSeries.Transition key="t8" presentation={fade()} timing={linearTiming({durationInFrames:20})}/>
];
const durationFor=(i:number)=>((i===9?timeline.frames:timeline.chapters[i+1].frame)-(i===0?0:timeline.chapters[i].frame))+(i===9?0:20);
const EC={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;

export const StardustFilm:React.FC = () => {
 const frame=useCurrentFrame();
 const black=frame>=timeline.frames-60?1:frame>timeline.frames-75?interpolate(frame,[timeline.frames-75,timeline.frames-60],[0,1],EC):0;
 return <AbsoluteFill style={{backgroundColor:'#000'}}>
  <TransitionSeries>{scenes.map((Scene,i)=><React.Fragment key={i}>
   <TransitionSeries.Sequence durationInFrames={durationFor(i)} premountFor={30}><Scene/></TransitionSeries.Sequence>
   {i<9&&chapterTransitions[i]}
  </React.Fragment>)}</TransitionSeries>
  <Audio src={`${staticFile("stardust-to-human/mix.m4a")}?v=${timeline.audioRevision}`}/>
  <AbsoluteFill style={{backgroundColor:'#000',opacity:black,pointerEvents:'none'}}/>
 </AbsoluteFill>;
};

export const StardustToHumanComp:React.FC=()=> <Composition id="StardustToHuman" component={StardustFilm} fps={30} width={1920} height={1080} durationInFrames={timeline.frames}
 calculateMetadata={async()=>({durationInFrames:Math.ceil(await getAudioDurationInSeconds(`${staticFile("stardust-to-human/mix.m4a")}?v=${timeline.audioRevision}`)*30)})}/>;
