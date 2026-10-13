import React from 'react';
import {interpolate, spring, random} from 'remotion';
import {makeStar, makeCircle} from '@remotion/shapes';
import {PlanetStage} from './PlanetStage';
import {NaturalWorld, NATURAL_KINDS} from './NaturalWorld';
import {AsteroidWorld} from './AsteroidWorld';
import {SupernovaWorld} from './SupernovaWorld';
import {VolcanoWorld} from './VolcanoWorld';
import {SpaceWorld,CompactStarCollision} from './SpaceWorld';
import {ElementWorld} from './ElementWorld';
import {StreetWorld} from './StreetWorld';
import {CalendarWorld} from './CalendarWorld';

const EC={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const terrain='M0 760 Q200 670 390 755 T700 720 T1020 750 T1350 690 T1650 745 T1920 720 V1080 H0Z';
const tree='M0 0 C-65 -70 -120 -30 -130 -105 C-195 -165 -90 -200 -85 -225 C-130 -300 5 -345 45 -275 C120 -300 150 -240 120 -205 C200 -170 160 -100 105 -110 C90 -25 30 -55 0 0Z';
const fern='M0 0 Q-35 -45 -18 -90 Q10 -135 0 -205 M-5 -45 Q-72 -22 -85 -70 M-9 -75 Q58 -56 66 -110 M-6 -110 Q-62 -96 -65 -147 M-3 -145 Q40 -139 43 -178';

const Creature:React.FC<{type:string; f:number; i?:number}> = ({type,f,i=0}) => {
  const walk=Math.sin(f*.13+i)*16;
  if(type==='dinosaur')return <g stroke="#09191c" strokeWidth="5">
    <path d="M-380 120 Q-270 145 -180 45 Q-130 -105 35 -95 Q160 -120 190 -200 L335 -220 L420 -160 L405 -85 L270 -60 L215 0 L150 75 Q60 140 -65 110 L-150 150 Q-260 190 -380 120Z" fill="#447d63"/>
    <path d={`M-85 80 L${-100+walk} 235 L${-170+walk} 300 L${-90+walk} 306 L-10 170 L5 100 M95 75 L${135-walk} 226 L${90-walk} 282 L${190-walk} 286 L165 160`} fill="#2d5f50"/>
    <path d="M220 -75 L175 25 L140 50 L170 0 L172 -50" fill="#69a980"/><path d="M270 -80 L396 -104" stroke="#d7e2c2" strokeWidth="10"/>
    {Array.from({length:9},(_,k)=><path key={k} d={`M${272+k*14} -81 l7 15 l7 -19`} fill="#f6e9cc" stroke="none"/>)}<circle cx="316" cy="-158" r="12" fill="#e8b44a"/><circle cx="319" cy="-159" r="5" fill="#020809"/>
  </g>;
  if(type==='mammal')return <g><ellipse cx="-15" cy="5" rx="160" ry="92" fill="#826354"/><path d="M100 -60 Q230 -35 246 20 L170 63 L83 65Z" fill="#b99b7a"/><circle cx="119" cy="-73" r="42" fill="#b99b7a"/><circle cx="121" cy="-74" r="23" fill="#c98677"/><circle cx="177" cy="-9" r="9" fill="#171c23"/><path d="M-161 29 Q-325 -50 -328 75" fill="none" stroke="#967969" strokeWidth="15"/><path d={`M-55 62 l${walk} 68 M105 50 l${-walk} 64`} stroke="#8c6953" strokeWidth="30"/><path d="M214 20 l50 -12 M215 29 l53 18" stroke="#d8c3a1" strokeWidth="3"/></g>;
  if(type==='human')return <g stroke="#edd4b3" strokeWidth="34" strokeLinecap="round" fill="none"><circle cy="-230" r="44" fill="#edd4b3" stroke="none"/><path d="M0 -175 Q-25 -80 0 10"/><path d={`M-8 -128 L${-80+walk} -32 M-8 -128 L${80-walk} -75 M0 10 L${-60+walk} 162 M0 10 L${85-walk} 162`}/></g>;
  if(type==='fish')return <g fill="#e59458" stroke="#2b3441" strokeWidth="5"><path d="M-230 0 L-330 -100 L-318 110 L-210 25 Q-50 160 155 62 L250 10 L190 -80 Q-65 -125 -230 0Z"/><path d={`M-110 50 L${-145+walk} 160 L-45 142 L15 77 M90 65 L${122-walk} 174 L190 145 L150 46`} fill="#c97648"/><circle cx="166" cy="-25" r="15" fill="#fff1bd"/><circle cx="170" cy="-25" r="7" fill="#131922"/><path d="M-100 -75 L-80 -150 L55 -92"/><path d="M-40 -62 Q-60 0 -30 70 M10 -64 Q-12 0 16 77 M60 -61 Q40 0 65 70" fill="none"/></g>;
  return <g fill="#78b8c2" stroke="#0a526b" strokeWidth="5"><path d="M-215 0 Q-45 -140 165 -38 L250 0 L155 48 Q-75 130 -215 0Z"/>{Array.from({length:12},(_,k)=><path key={k} d={`M${-155+k*26} 0 Q${-185+k*26} ${90+walk} ${-205+k*26} 80 Q${-165+k*26} 15 ${-155+k*26} 0Z`} fill="#5599ab"/>)}<path d="M185 -20 Q230 -135 255 -55 M187 25 Q255 155 267 50" fill="none" stroke="#d5c895" strokeWidth="16"/><circle cx="166" cy="-26" r="13" fill="#ffdf8e"/></g>;
};

export const World:React.FC<{kind:string; frame:number; age:number; nextKind?:string}> = ({kind,frame:f,age:a}) => {
 if(kind==='hand'){
  const transition=interpolate(a,[246,270],[0,1],EC);
  return <><StreetWorld age={a}/>{a>=228&&<div style={{position:'absolute',inset:0,opacity:transition}}><ElementWorld age={Math.max(0,a-246)}/></div>}</>;
 }
 if(['void','bang','dust','cloud'].includes(kind))return <SpaceWorld key={kind} kind={kind} age={a}/>;
 if(kind==='elements'&&f>2000)return <SpaceWorld kind="furnace" age={a}/>;
 if(kind==='elements')return <ElementWorld age={a+24}/>;
 if(kind==='collision-stars')return <CompactStarCollision age={a}/>;
 if(kind==='calendar')return <CalendarWorld age={a}/>;
 if(kind==='supernova')return <SupernovaWorld age={a}/>;
 if(kind==='asteroid'||kind==='impact')return <AsteroidWorld age={a} impact={kind==='impact'}/>;
  if(kind==='volcano')return <VolcanoWorld age={a}/>;
 if(NATURAL_KINDS.includes(kind))return <NaturalWorld key={kind} kind={kind} age={a}/>;
 const pulse=1+Math.sin(f*.02)*.014;
 const fade=1;
 const planet=['lava','earth','snowball','thaw','pangea','moon','sun','star','theia','collision','debris','crust','meteors','collision-stars','city','disk','accretion'].includes(kind);
 const forest=['plants','forest','dinosaur','mammal','fish','human'].includes(kind);
 const sea=['ocean','vents','cells','slime','oxygen','cambrian'].includes(kind);
 const flash=kind==='collision'||kind==='impact'?interpolate(a,[0,7,30,75],[0,.7,.23,0],EC):0;
 return <div style={{position:'absolute',inset:0,opacity:fade}}>
  {planet&&<PlanetStage key={kind} kind={kind} age={a}/>}
  <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,overflow:'hidden'}}>
   <defs>
    <radialGradient id="solar"><stop stopColor="#fffbed"/><stop offset=".18" stopColor="#ffd88b"/><stop offset=".5" stopColor="#f27738" stopOpacity=".75"/><stop offset="1" stopColor="#a33d72" stopOpacity="0"/></radialGradient>
    <linearGradient id="sea" x2="0" y2="1"><stop stopColor="#0a5166"/><stop offset=".5" stopColor="#092c45"/><stop offset="1" stopColor="#030a1e"/></linearGradient>
    <linearGradient id="sky" x2="0" y2="1"><stop stopColor="#0c3641"/><stop offset=".7" stopColor="#3d7472"/><stop offset="1" stopColor="#efb880"/></linearGradient>
    <radialGradient id="cell"><stop stopColor="#6adbaf" stopOpacity=".55"/><stop offset=".75" stopColor="#128f92" stopOpacity=".8"/><stop offset="1" stopColor="#acffe1"/></radialGradient>
    <linearGradient id="lava"><stop stopColor="#f3a43c"/><stop offset=".4" stopColor="#ea4e27"/><stop offset="1" stopColor="#551a25"/></linearGradient>
   </defs>
   {kind==='hand'&&<g transform={`translate(960 550) scale(${pulse})`}>
     <path d="M-420 390 L-360 -80 Q-345 -210 -205 -205 L-118 -225 Q0 -330 120 -225 L240 -205 Q360 -150 390 -20 L440 390Z" fill="#27374b" stroke="#7899b2" strokeWidth="4"/>
     <path d="M-118 -225 L-70 -160 L35 -160 L120 -225" fill="#bd9a88"/><path d="M-360 280 L-90 130 L120 20 Q159 -20 176 9 Q187 32 150 60 L53 131 L206 88 Q249 83 252 116 Q252 139 202 148 L55 180 L199 163 Q243 170 239 197 Q236 223 190 222 L42 227 L163 227 Q213 236 202 263 Q195 284 144 283 L-21 282 Q-129 286 -188 358Z" fill="#d4af91" stroke="#8a605b" strokeWidth="4"/>
     <path d="M80 -40 C20 -95 -45 -45 1 20 L80 90 L154 20 C202 -45 134 -95 80 -40Z" fill="#fa8970" opacity={.65+Math.sin(f*.1)*.15}/>
     {[0,1,2].map(i=><circle key={i} cx="80" cy="8" r={85+i*55+f%30} fill="none" stroke="#ffd0a6" strokeWidth="2" opacity={.24-i*.05}/>)}
   </g>}
   {kind==='elements'&&<g transform="translate(235 380)">
    {['Fe','Ca','Au'].map((label,i)=>{const x=i*560, color=['#ff9a69','#b4e4ff','#f6cd75'][i];return <g key={label} transform={`translate(${x} ${Math.sin(f*.03+i)*10})`}>
     <rect x="-30" y="-20" width="450" height="310" rx="26" fill="#132335" stroke={color} strokeWidth="4"/>
     <text x="195" y="115" textAnchor="middle" fill={color} fontSize="100" fontFamily="Georgia">{label}</text>
     <text x="195" y="210" textAnchor="middle" fill="#f6f2dc" fontSize="40" fontFamily="Arial">{['BLOOD','BONES','YOUR RING'][i]}</text>
     <ellipse cx="195" cy="-70" rx="100" ry="32" fill="none" stroke={color} strokeWidth="4" transform={`rotate(${f*.6+i*45} 195 -70)`}/><circle cx="195" cy="-70" r="18" fill={color}/>
    </g>;})}
    <path d="M170 410 C460 350 840 350 1370 410" stroke="#b8cbdb" strokeWidth="3" fill="none" strokeDasharray="8 14"/>
   </g>}
   {kind==='theia'&&<g fontFamily="Arial" fontSize="38" fill="#fff3dc"><text x="630" y="775">EARLY EARTH</text><text x={1430-interpolate(a,[0,220],[0,300],EC)} y="295">THEIA</text></g>}
   {forest&&<>
    <path d="M0 0 H1920 V1080 H0Z" fill="url(#sky)"/><circle cx="1480" cy="330" r="130" fill="#ead6a4" opacity=".65"/>
    <path d={terrain} fill="#163d38"/>
    {Array.from({length:11},(_,i)=>{const x=i*195+20;const scale=kind==='plants'?.22:.72+(i%3)*.15;return <g key={i} transform={`translate(${x} ${800+(i%2)*40}) scale(${scale}) rotate(${Math.sin(f*.01+i)*1.1})`} opacity={i%2?.5:.8}><path d="M0 0 L-12 -140 L10 -145 L18 0Z" fill="#15382f"/><path d={tree} transform="translate(0 -135)" fill={i%2?'#397557':'#234f46'}/></g>;})}
    <path d="M0 960 Q350 810 640 865 T1150 880 T1920 845 V1080 H0Z" fill="#172e2c"/>
    {Array.from({length:9},(_,i)=><path key={i} d={fern} fill="none" stroke={i%2?'#8cae65':'#467b50'} strokeWidth="8" transform={`translate(${i*230} 1020) scale(.8) rotate(${Math.sin(f*.025+i)*3})`}/>)}
    {['dinosaur','mammal','fish','human'].includes(kind)&&<g transform={`translate(${930+Math.sin(f*.007)*65} 720) scale(${kind==='dinosaur'?1.35:1.4})`}><Creature type={kind} f={f}/></g>}
    {kind==='plants'&&<g transform="translate(980 840) scale(1.9)"><path d={fern} stroke="#acd28a" strokeWidth="12" fill="none"/></g>}
   </>}
   {sea&&<>
     <rect width="1920" height="1080" fill="url(#sea)"/>
     {Array.from({length:12},(_,i)=><path key={i} d={`M${i*195} 0 L${i*195-170} 900 L${i*195-20} 900 L${i*195+70} 0Z`} fill="#76d6d8" opacity={.035+Math.sin(f*.02+i)*.01}/>)}
     <path d={terrain} fill="#0b2834"/>
     {Array.from({length:28},(_,i)=><circle key={i} cx={100+random(i)*1720+Math.sin(f*.025+i)*12} cy={1080-(f*2+i*97)%1100} r={8+random(i+9)*18} fill="none" stroke="#8fdae0" strokeWidth="2" opacity=".45"/>)}
     {kind==='vents'&&[0,1,2].map(i=><g key={i} transform={`translate(${530+i*410} 880)`}><path d="M-100 50 L-50 -230 L40 -250 L95 50Z" fill="#33454b" stroke="#70b9b5" strokeWidth="5"/>{Array.from({length:12},(_,j)=><ellipse key={j} cx={Math.sin(f*.016+j)*50} cy={-280-(f*2+j*48)%550} rx={40+j*6} ry="60" fill="#03121d" opacity=".32"/>)}</g>)}
     {['cells','slime','oxygen'].includes(kind)&&Array.from({length:kind==='slime'?16:7},(_,i)=>{const x=310+(i%4)*430, y=kind==='slime'?775+(i%3)*50:330+Math.floor(i/4)*330;return <g key={i} transform={`translate(${x+Math.sin(f*.02+i)*20} ${y+Math.cos(f*.02+i)*18}) rotate(${f*.12+i*20})`}><ellipse rx={120+(i%3)*15} ry={85+(i%2)*30} fill="url(#cell)" stroke="#89f0ca" strokeWidth="5"/><path d="M-70 0 Q-25 -45 10 0 T65 0" fill="none" stroke="#e8dd80" strokeWidth="8"/><circle cx="-28" cy="-30" r="18" fill="#bc86d7"/><circle cx="45" cy="28" r="12" fill="#e2db86"/></g>;})}
     {kind==='oxygen'&&[0,1,2,3].map(i=><g key={i} transform={`translate(${440+i*350} ${530-(f*2+i*100)%430})`}><circle r="54" fill="#a8e4ee" fillOpacity=".16" stroke="#d9fbf2" strokeWidth="4"/><text textAnchor="middle" y="17" fontSize="44" fill="#eefff5">O₂</text></g>)}
     {kind==='cambrian'&&[0,1,2,3].map(i=><g key={i} transform={`translate(${480+(i%2)*880+Math.sin(f*.017+i)*100} ${360+Math.floor(i/2)*360}) scale(${.8+(i%2)*.35}) rotate(${Math.sin(f*.02+i)*8})`}><Creature type="cambrian" f={f} i={i}/></g>)}
     {kind==='ocean'&&Array.from({length:10},(_,i)=><path key={i} d={`M0 ${280+i*65} Q240 ${260+i*65+Math.sin(f*.03+i)*20} 480 ${280+i*65} T960 ${280+i*65} T1440 ${280+i*65} T1920 ${280+i*65}`} stroke="#97e0e6" strokeWidth="3" fill="none" opacity={.16+i*.02}/>)}
   </>}
   {['volcano','rain','impact','ash'].includes(kind)&&<>
    <rect width="1920" height="1080" fill={kind==='rain'?'#172c3c':kind==='ash'?'#182030':'#251724'}/>
    <path d="M0 920 L210 820 L330 900 L740 420 L895 470 L980 400 L1340 840 L1550 770 L1920 930 V1080 H0Z" fill="#283038" stroke="#72605b" strokeWidth="4"/>
    {['volcano','impact'].includes(kind)&&<><path d="M740 420 Q825 370 980 400 Q1160 850 1360 1080 H1180 Q970 700 895 470Z" fill="url(#lava)"/>{Array.from({length:35},(_,i)=>{const phase=(f*3+i*21)%560;return <circle key={i} cx={860+Math.sin(i*2.399)*phase} cy={410-phase*.8+phase*phase*.001} r={7+(i%5)*3} fill="#ffbc67"/>;})}{Array.from({length:12},(_,i)=><ellipse key={i} cx={830+Math.sin(i*2+f*.004)*320} cy={90+(i%4)*70} rx={120+(i%3)*70} ry="90" fill="#544d58" opacity=".5"/>)}</>}
    {kind==='rain'&&Array.from({length:130},(_,i)=>{const x=random(i)*1920,y=(random(i+8)*1080+f*19)%1080;return <path key={i} d={`M${x} ${y} l-12 54`} stroke="#abd1ed" strokeWidth="3" opacity=".45"/>;})}
    {kind==='ash'&&Array.from({length:80},(_,i)=><circle key={i} cx={random(i)*1920+Math.sin(f*.008+i)*30} cy={(random(i+5)*1080+f*.8)%1080} r={3+random(i+9)*5} fill="#bbc6cf" opacity=".35"/>)}
    {kind==='impact'&&<><circle cx="940" cy="610" r={Math.min(1100,a*13+60)} fill="url(#solar)"/><ellipse cx="940" cy="740" rx={Math.min(1500,a*22)} ry={Math.min(440,a*6)} stroke="#ffdcad" strokeWidth="16" fill="none"/></>}
   </>}
   {kind==='asteroid'&&<g transform={`translate(${1320-interpolate(a,[0,270],[0,700],EC)} ${290+interpolate(a,[0,270],[0,460],EC)}) rotate(-42)`}><path d="M0 0 L900 -85 L680 40Z" fill="#df7048" opacity=".5"/><path d="M0 0 L900 -30" stroke="#ffd68a" strokeWidth="40"/><path d={makeStar({points:9,innerRadius:80,outerRadius:104}).path} transform={`translate(-90 -85) rotate(${f})`} fill="#a56745" stroke="#ffd390" strokeWidth="8"/></g>}
   {kind==='zircon'&&<g transform={`translate(960 530) rotate(${Math.sin(f*.02)*8})`}><path d="M0 -300 L190 -120 L155 185 L0 290 L-175 140 L-155 -125Z" fill="#75bac8" stroke="#d4f5f4" strokeWidth="6"/><path d="M0 -300 L-30 -110 L0 290 L100 -60Z" fill="#b5e4ed" opacity=".5"/><path d="M-155 -125 L100 -60 L190 -120 M-30 -110 L-175 140" stroke="#f9f6cc" strokeWidth="4"/></g>}
   {kind==='extinction'&&<g transform={`translate(${245-a*.028} ${320-a*.012}) scale(${1+a*.000035})`}>{Array.from({length:100},(_,i)=>{const loss=interpolate(a,[i*2.2,i*2.2+60],[0,1],EC);return <path key={i} d={makeCircle({radius:25}).path} transform={`translate(${(i%20)*73} ${Math.floor(i/20)*78}) scale(${i<90?1-loss*.18:1+Math.sin(a*.022+i)*.035})`} fill={i<90?'#dd5c53':'#9ed7bd'} opacity={i<90?1-loss*.82:1}/>;})}<path d="M0 440 H1437" stroke="#fa7867" strokeWidth="5"/></g>}
   {kind==='cave'&&<><path d="M0 0 H1920 V1080 H0Z" fill="#503c31"/>{Array.from({length:80},(_,i)=><path key={i} d={`M${random(i)*1920} ${random(i+3)*1080} l${40+random(i+4)*170} ${random(i+5)*55}`} stroke="#80614b" strokeWidth="3" opacity=".3"/>)}<g transform="translate(950 650)" stroke="#d0a67c" strokeWidth="12" fill="none"><path d="M-350 -50 Q-180 -170 40 -110 L120 -30 L150 65 L-10 95 L-210 85Z M-280 45 L-290 200 M-40 95 L-30 200 M-210 -105 L-290 -190 M-120 -135 L-155 -225"/><path d="M285 -60 L285 140 M285 0 L230 65 M285 0 L350 55 M285 140 L235 235 M285 140 L350 235"/><circle cx="285" cy="-108" r="35"/></g></>}
   {kind==='calendar'&&<g transform="translate(330 230)"><rect width="1260" height="660" rx="28" fill="#e5e5d9"/><rect width="1260" height="125" rx="28" fill="#b24d50"/><text x="630" y="88" textAnchor="middle" fontFamily="Georgia" fontSize="64" fill="#fff1dc">EARTH: ONE YEAR</text>{Array.from({length:12},(_,i)=><g key={i} transform={`translate(${35+(i%4)*310} ${145+Math.floor(i/4)*155})`}><rect width="280" height="125" rx="12" fill={i===11?'#f5c877':'#c5d2cf'}/><text x="140" y="55" textAnchor="middle" fill="#20353b" fontSize="36">{['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][i]}</text><circle cx="140" cy="92" r="14" fill={i===0?'#578d94':i===2?'#63a36a':i===11?'#ab4b42':'#a9b8b4'}/></g>)}<text x="630" y="625" textAnchor="middle" fill="#20353b" fontSize="44">DECEMBER 31 / 23:59 / HUMANITY</text></g>}
   {kind==='city'&&<g>{Array.from({length:24},(_,i)=>{const x=20+i*80,h=80+random(i)*170;return <g key={i}><rect x={x} y={1000-h} width="62" height={h+80} fill="#111d30"/>{Array.from({length:24},(_,j)=><rect key={j} x={x+8+(j%4)*12} y={1010-h+Math.floor(j/4)*22} width="5" height="8" fill="#f7d58e" opacity={.45+Math.sin(f*.006+i)*.1}/>)}</g>;})}</g>}
   <rect width="1920" height="1080" fill="#fff3da" opacity={flash}/>
  </svg>
 </div>;
};
