import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Composition,
} from 'remotion';

const EC = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

// ============================================================
// Creature Showcase: Wolf, Eagle, Dragon, Skull, Medusa, Spider
// Pure SVG — testing organic/horror subjects
// ============================================================

// ---- Wolf ----
const Wolf: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const breathe = Math.sin(time * 1.2) * 2;
  const earTwitch = Math.sin(time * 3) * 3;
  const tailWag = Math.sin(time * 2) * 12;
  const jawOpen = Math.max(0, Math.sin(time * 0.8)) * 4;
  const eyeGlow = 0.5 + Math.sin(time * 2.5) * 0.3;

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 15px rgba(100,150,255,0.2))',
    }}>
      <svg width={320} height={280} viewBox="0 0 320 280" style={{ overflow: 'visible' }}>
        {/* Body */}
        <path d={`M90 ${155 + breathe} Q60 ${140 + breathe} 55 165 Q50 190 70 210 Q90 230 130 235 L210 235 Q250 230 265 210 Q280 190 275 165 Q270 ${140 + breathe} 240 ${155 + breathe} Z`}
          fill="#3a3a4a" stroke="#555" strokeWidth={1.5} />
        {/* Fur texture lines */}
        <path d={`M100 ${170 + breathe} Q120 ${165 + breathe} 140 ${172 + breathe}`} fill="none" stroke="#4a4a5a" strokeWidth={1} opacity={0.5} />
        <path d={`M180 ${168 + breathe} Q200 ${163 + breathe} 220 ${170 + breathe}`} fill="none" stroke="#4a4a5a" strokeWidth={1} opacity={0.5} />

        {/* Tail */}
        <path d={`M265 195 Q290 ${180 + tailWag} 305 ${160 + tailWag} Q315 ${150 + tailWag} 310 ${145 + tailWag}`}
          fill="none" stroke="#3a3a4a" strokeWidth={12} strokeLinecap="round" />
        <path d={`M265 195 Q290 ${180 + tailWag} 305 ${160 + tailWag} Q315 ${150 + tailWag} 310 ${145 + tailWag}`}
          fill="none" stroke="#4a4a5a" strokeWidth={8} strokeLinecap="round" />

        {/* Front legs */}
        <path d="M105 235 L100 268 L95 275 L110 275 L112 260 L115 235" fill="#3a3a4a" stroke="#555" strokeWidth={1} />
        <path d="M140 235 L138 268 L133 275 L148 275 L150 260 L148 235" fill="#3a3a4a" stroke="#555" strokeWidth={1} />
        {/* Back legs */}
        <path d="M200 235 Q195 255 192 268 L188 275 L203 275 L205 260 Q208 245 210 235" fill="#3a3a4a" stroke="#555" strokeWidth={1} />
        <path d="M240 235 Q238 255 235 268 L230 275 L248 275 L250 258 Q248 245 245 235" fill="#3a3a4a" stroke="#555" strokeWidth={1} />

        {/* Neck */}
        <path d={`M90 ${155 + breathe} Q75 ${135 + breathe} 65 ${120 + breathe} Q55 ${105 + breathe} 60 ${95 + breathe}`}
          fill="#3a3a4a" stroke="#555" strokeWidth={18} strokeLinecap="round" />

        {/* Head */}
        <path d={`M30 ${80 + breathe} Q25 ${65 + breathe} 40 ${55 + breathe} L75 ${48 + breathe} Q90 ${55 + breathe} 90 ${70 + breathe} Q88 ${85 + breathe} 75 ${95 + breathe} L50 ${100 + breathe} Q35 ${95 + breathe} 30 ${80 + breathe} Z`}
          fill="#444455" stroke="#555" strokeWidth={1.5} />

        {/* Snout */}
        <path d={`M30 ${80 + breathe} Q15 ${78 + breathe} 8 ${75 + breathe} Q3 ${72 + breathe} 5 ${68 + breathe} Q10 ${62 + breathe} 25 ${65 + breathe}`}
          fill="#3a3a48" stroke="#555" strokeWidth={1.5} />
        {/* Nose */}
        <ellipse cx={8} cy={70 + breathe} rx={5} ry={4} fill="#222" />

        {/* Jaw / mouth */}
        <path d={`M8 ${75 + breathe} Q15 ${80 + breathe + jawOpen} 35 ${85 + breathe + jawOpen}`}
          fill="none" stroke="#555" strokeWidth={1.5} />
        {jawOpen > 1 && (
          <>
            <path d={`M12 ${76 + breathe + jawOpen * 0.5} L15 ${82 + breathe + jawOpen}`} stroke="#888" strokeWidth={1} />
            <path d={`M20 ${78 + breathe + jawOpen * 0.5} L22 ${84 + breathe + jawOpen}`} stroke="#888" strokeWidth={1} />
            <path d={`M28 ${80 + breathe + jawOpen * 0.5} L29 ${86 + breathe + jawOpen}`} stroke="#888" strokeWidth={1} />
          </>
        )}

        {/* Eyes — glowing */}
        <ellipse cx={38} cy={68 + breathe} rx={6} ry={5} fill="#000" />
        <ellipse cx={38} cy={68 + breathe} rx={4} ry={3.5} fill={`rgba(200,180,50,${eyeGlow})`} />
        <circle cx={36} cy={67 + breathe} r={1.5} fill={`rgba(255,255,200,${eyeGlow * 0.8})`} />

        <ellipse cx={58} cy={65 + breathe} rx={6} ry={5} fill="#000" />
        <ellipse cx={58} cy={65 + breathe} rx={4} ry={3.5} fill={`rgba(200,180,50,${eyeGlow})`} />
        <circle cx={56} cy={64 + breathe} r={1.5} fill={`rgba(255,255,200,${eyeGlow * 0.8})`} />

        {/* Ears */}
        <path d={`M45 ${55 + breathe} L38 ${30 + breathe + earTwitch} L55 ${45 + breathe}`}
          fill="#444455" stroke="#555" strokeWidth={1.5} />
        <path d={`M65 ${50 + breathe} L65 ${28 + breathe - earTwitch} L78 ${42 + breathe}`}
          fill="#444455" stroke="#555" strokeWidth={1.5} />
        {/* Inner ear */}
        <path d={`M46 ${52 + breathe} L42 ${36 + breathe + earTwitch} L52 ${46 + breathe}`}
          fill="#553344" opacity={0.4} />
      </svg>
    </div>
  );
};

// ---- Eagle ----
const Eagle: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const wingFlap = Math.sin(time * 2.5) * 25;
  const bodyBob = Math.sin(time * 2.5) * 4;
  const headTilt = Math.sin(time * 1.5) * 3;

  return (
    <div style={{
      position: 'absolute', left: x, top: y + bodyBob,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 20px rgba(200,150,50,0.2))',
    }}>
      <svg width={400} height={300} viewBox="0 0 400 300" style={{ overflow: 'visible' }}>
        {/* Left wing */}
        <path d={`M200 140 Q150 ${100 + wingFlap} 80 ${70 + wingFlap * 1.3} Q40 ${55 + wingFlap * 1.5} 10 ${60 + wingFlap * 1.6} Q30 ${75 + wingFlap * 1.2} 60 ${90 + wingFlap} Q100 ${110 + wingFlap * 0.7} 170 130`}
          fill="#5a3a1a" stroke="#6a4a2a" strokeWidth={1.5} />
        {/* Wing feather details */}
        <path d={`M100 ${85 + wingFlap * 1.1} Q80 ${80 + wingFlap * 1.3} 55 ${72 + wingFlap * 1.4}`}
          fill="none" stroke="#4a2a0a" strokeWidth={1} opacity={0.5} />
        <path d={`M130 ${95 + wingFlap * 0.9} Q100 ${88 + wingFlap * 1.1} 70 ${78 + wingFlap * 1.2}`}
          fill="none" stroke="#4a2a0a" strokeWidth={1} opacity={0.4} />

        {/* Right wing */}
        <path d={`M200 140 Q250 ${100 + wingFlap} 320 ${70 + wingFlap * 1.3} Q360 ${55 + wingFlap * 1.5} 390 ${60 + wingFlap * 1.6} Q370 ${75 + wingFlap * 1.2} 340 ${90 + wingFlap} Q300 ${110 + wingFlap * 0.7} 230 130`}
          fill="#5a3a1a" stroke="#6a4a2a" strokeWidth={1.5} />
        <path d={`M300 ${85 + wingFlap * 1.1} Q320 ${80 + wingFlap * 1.3} 345 ${72 + wingFlap * 1.4}`}
          fill="none" stroke="#4a2a0a" strokeWidth={1} opacity={0.5} />

        {/* Body */}
        <ellipse cx={200} cy={160} rx={35} ry={45} fill="#6a4a2a" stroke="#7a5a3a" strokeWidth={1.5} />
        {/* Chest — lighter */}
        <ellipse cx={200} cy={155} rx={22} ry={30} fill="#8a6a3a" opacity={0.5} />

        {/* Tail feathers */}
        <path d="M185 200 L170 250 L185 245 L200 255 L215 245 L230 250 L215 200" fill="#4a2a0a" stroke="#5a3a1a" strokeWidth={1} />

        {/* Head */}
        <g transform={`rotate(${headTilt} 200 115)`}>
          <ellipse cx={200} cy={115} rx={20} ry={18} fill="#f8f0e0" stroke="#ddd" strokeWidth={1} />
          {/* Beak */}
          <path d="M215 112 L240 118 L238 122 L215 120 Z" fill="#dd8800" stroke="#cc7700" strokeWidth={1} />
          <line x1={215} y1={117} x2={235} y2={120} stroke="#bb6600" strokeWidth={0.8} />
          {/* Eye */}
          <circle cx={210} cy={112} r={4} fill="#000" />
          <circle cx={211} cy={111} r={2} fill="#dd8800" />
          <circle cx={212} cy={110} r={0.8} fill="#fff" />
          {/* Brow ridge */}
          <path d="M205 108 Q210 105 218 108" fill="none" stroke="#ddd" strokeWidth={1.5} />
        </g>

        {/* Talons */}
        <path d="M185 200 L178 220 L172 228 M178 220 L180 230 M178 220 L185 228" fill="none" stroke="#dd8800" strokeWidth={2} strokeLinecap="round" />
        <path d="M215 200 L222 220 L228 228 M222 220 L220 230 M222 220 L215 228" fill="none" stroke="#dd8800" strokeWidth={2} strokeLinecap="round" />
      </svg>
    </div>
  );
};

// ---- Dragon Head (horror) ----
const DragonHead: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const breathe = Math.sin(time * 0.8) * 3;
  const jawOpen = 8 + Math.sin(time * 0.6) * 6;
  const eyePulse = 0.6 + Math.sin(time * 3) * 0.4;
  const smokeOp = 0.3 + Math.sin(time * 2) * 0.15;
  const fireFlicker = Math.sin(time * 8) * 0.3;

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 25px rgba(255,80,0,0.3))',
    }}>
      <svg width={350} height={380} viewBox="0 0 350 380" style={{ overflow: 'visible' }}>
        {/* Neck */}
        <path d={`M120 300 Q100 260 110 ${220 + breathe} Q120 ${190 + breathe} 140 ${170 + breathe}`}
          fill="#2a3a2a" stroke="#3a4a3a" strokeWidth={40} strokeLinecap="round" />
        <path d={`M230 300 Q250 260 240 ${220 + breathe} Q230 ${190 + breathe} 210 ${170 + breathe}`}
          fill="#2a3a2a" stroke="#3a4a3a" strokeWidth={35} strokeLinecap="round" />

        {/* Head base */}
        <path d={`M100 ${140 + breathe} Q80 ${110 + breathe} 95 ${80 + breathe} Q120 ${50 + breathe} 175 ${40 + breathe} Q230 ${50 + breathe} 255 ${80 + breathe} Q270 ${110 + breathe} 250 ${140 + breathe} Q240 ${160 + breathe} 175 ${165 + breathe} Q110 ${160 + breathe} 100 ${140 + breathe} Z`}
          fill="#2a4a2a" stroke="#3a5a3a" strokeWidth={2} />

        {/* Scales texture */}
        {[0, 1, 2, 3, 4].map(i => (
          <ellipse key={i} cx={130 + i * 25} cy={120 + breathe + (i % 2) * 10} rx={10} ry={8}
            fill="none" stroke="#3a6a3a" strokeWidth={1} opacity={0.3} />
        ))}

        {/* Horns */}
        <path d={`M120 ${75 + breathe} Q105 ${40 + breathe} 85 ${15 + breathe} Q80 ${8 + breathe} 82 ${5 + breathe}`}
          fill="none" stroke="#554433" strokeWidth={8} strokeLinecap="round" />
        <path d={`M230 ${75 + breathe} Q245 ${40 + breathe} 265 ${15 + breathe} Q270 ${8 + breathe} 268 ${5 + breathe}`}
          fill="none" stroke="#554433" strokeWidth={8} strokeLinecap="round" />
        {/* Horn ridges */}
        <path d={`M115 ${65 + breathe} L108 ${50 + breathe}`} stroke="#665544" strokeWidth={1} opacity={0.5} />
        <path d={`M235 ${65 + breathe} L242 ${50 + breathe}`} stroke="#665544" strokeWidth={1} opacity={0.5} />

        {/* Snout / upper jaw */}
        <path d={`M100 ${120 + breathe} Q75 ${110 + breathe} 55 ${105 + breathe} Q40 ${100 + breathe} 35 ${108 + breathe} Q50 ${115 + breathe} 75 ${118 + breathe}`}
          fill="#2a4a2a" stroke="#3a5a3a" strokeWidth={2} />

        {/* Lower jaw — opens */}
        <path d={`M75 ${125 + breathe} Q55 ${130 + breathe + jawOpen} 40 ${135 + breathe + jawOpen} Q35 ${138 + breathe + jawOpen} 45 ${133 + breathe + jawOpen * 0.8} Q60 ${128 + breathe + jawOpen * 0.5} 100 ${130 + breathe}`}
          fill="#1a3a1a" stroke="#2a4a2a" strokeWidth={2} />

        {/* Teeth */}
        {[0, 1, 2, 3, 4].map(i => {
          const tx = 50 + i * 12;
          return (
            <g key={`tooth-${i}`}>
              <path d={`M${tx} ${108 + breathe} L${tx + 3} ${118 + breathe + jawOpen * 0.2} L${tx + 6} ${108 + breathe}`}
                fill="#eeddcc" stroke="#ccbbaa" strokeWidth={0.5} />
              <path d={`M${tx + 2} ${133 + breathe + jawOpen * 0.5} L${tx + 5} ${123 + breathe + jawOpen * 0.3} L${tx + 8} ${133 + breathe + jawOpen * 0.5}`}
                fill="#ddccbb" stroke="#bbaa99" strokeWidth={0.5} />
            </g>
          );
        })}

        {/* Fire breath */}
        {jawOpen > 6 && (
          <g opacity={0.6 + fireFlicker}>
            <path d={`M38 ${120 + breathe + jawOpen * 0.5} Q10 ${115 + breathe} ${-15 + fireFlicker * 10} ${110 + breathe} Q-30 ${105 + breathe} -40 ${115 + breathe}`}
              fill="#ff4400" opacity={0.5} />
            <path d={`M38 ${118 + breathe + jawOpen * 0.4} Q15 ${114 + breathe} 0 ${110 + breathe}`}
              fill="#ff8800" opacity={0.6} />
            <path d={`M38 ${117 + breathe + jawOpen * 0.3} Q20 ${114 + breathe} 10 ${112 + breathe}`}
              fill="#ffcc33" opacity={0.5} />
          </g>
        )}

        {/* Smoke from nostrils */}
        <circle cx={42} cy={100 + breathe - Math.sin(time * 2) * 5} r={4} fill="#666" opacity={smokeOp * 0.5} />
        <circle cx={38} cy={92 + breathe - Math.sin(time * 2 + 1) * 8} r={6} fill="#555" opacity={smokeOp * 0.3} />

        {/* Eyes — menacing glow */}
        <ellipse cx={135} cy={95 + breathe} rx={14} ry={10} fill="#000" stroke="#3a5a3a" strokeWidth={1} />
        <ellipse cx={135} cy={95 + breathe} rx={8} ry={7} fill={`rgba(255,50,0,${eyePulse})`} />
        <ellipse cx={135} cy={95 + breathe} rx={3} ry={6} fill={`rgba(255,200,0,${eyePulse * 0.8})`} />

        <ellipse cx={215} cy={95 + breathe} rx={14} ry={10} fill="#000" stroke="#3a5a3a" strokeWidth={1} />
        <ellipse cx={215} cy={95 + breathe} rx={8} ry={7} fill={`rgba(255,50,0,${eyePulse})`} />
        <ellipse cx={215} cy={95 + breathe} rx={3} ry={6} fill={`rgba(255,200,0,${eyePulse * 0.8})`} />

        {/* Brow ridges */}
        <path d={`M115 ${85 + breathe} Q130 ${78 + breathe} 150 ${85 + breathe}`} fill="none" stroke="#3a5a3a" strokeWidth={3} />
        <path d={`M200 ${85 + breathe} Q215 ${78 + breathe} 235 ${85 + breathe}`} fill="none" stroke="#3a5a3a" strokeWidth={3} />

        {/* Spikes along head ridge */}
        {[0, 1, 2, 3].map(i => (
          <path key={`spike-${i}`}
            d={`M${150 + i * 20} ${50 + breathe} L${155 + i * 20} ${35 + breathe} L${160 + i * 20} ${50 + breathe}`}
            fill="#3a5a3a" stroke="#4a6a4a" strokeWidth={1} />
        ))}
      </svg>
    </div>
  );
};

// ---- Skull (horror) ----
const Skull: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const float = Math.sin(time * 0.6) * 8;
  const tilt = Math.sin(time * 0.4) * 4;
  const jawDrop = 2 + Math.sin(time * 0.5) * 3;
  const eyeFlicker = 0.4 + Math.sin(time * 4) * 0.3 + Math.sin(time * 7) * 0.15;
  const crackGlow = 0.1 + Math.sin(time * 1.5) * 0.08;

  return (
    <div style={{
      position: 'absolute', left: x, top: y + float,
      transform: `scale(${scale}) rotate(${tilt}deg)`,
      filter: 'drop-shadow(0 0 20px rgba(200,50,50,0.25))',
    }}>
      <svg width={240} height={300} viewBox="0 0 240 300" style={{ overflow: 'visible' }}>
        {/* Cranium */}
        <path d="M120 30 Q40 35 30 100 Q25 150 35 175 Q45 200 70 210 L170 210 Q195 200 205 175 Q215 150 210 100 Q200 35 120 30 Z"
          fill="#e8ddd0" stroke="#c8b8a8" strokeWidth={2} />

        {/* Cranium shading */}
        <path d="M120 35 Q60 40 50 90 Q45 130 55 160"
          fill="none" stroke="#d8c8b8" strokeWidth={1} opacity={0.4} />
        <ellipse cx={120} cy={80} rx={50} ry={30} fill="#f0e8dd" opacity={0.3} />

        {/* Cracks */}
        <path d="M90 50 L85 75 L95 90 L88 110" fill="none" stroke={`rgba(100,30,30,${crackGlow + 0.15})`} strokeWidth={1.5} />
        <path d="M155 60 L160 80 L150 95" fill="none" stroke={`rgba(100,30,30,${crackGlow + 0.1})`} strokeWidth={1} />

        {/* Eye sockets */}
        <ellipse cx={85} cy={130} rx={25} ry={22} fill="#1a0a0a" stroke="#998877" strokeWidth={2} />
        <ellipse cx={155} cy={130} rx={25} ry={22} fill="#1a0a0a" stroke="#998877" strokeWidth={2} />

        {/* Eyes — ghostly glow inside sockets */}
        <ellipse cx={85} cy={132} rx={10} ry={9} fill={`rgba(255,50,30,${eyeFlicker})`} />
        <circle cx={83} cy={130} r={3} fill={`rgba(255,150,100,${eyeFlicker * 0.7})`} />
        <ellipse cx={155} cy={132} rx={10} ry={9} fill={`rgba(255,50,30,${eyeFlicker})`} />
        <circle cx={153} cy={130} r={3} fill={`rgba(255,150,100,${eyeFlicker * 0.7})`} />

        {/* Nasal cavity */}
        <path d="M112 155 L120 175 L128 155 Z" fill="#2a1a1a" stroke="#887766" strokeWidth={1.5} />

        {/* Upper teeth row */}
        <path d="M70 210 L170 210" stroke="#c8b8a8" strokeWidth={2} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <rect key={`ut-${i}`} x={75 + i * 12} y={210} width={8} height={12} rx={1}
            fill="#e0d8cc" stroke="#b8a898" strokeWidth={0.8} />
        ))}

        {/* Lower jaw — separate, drops */}
        <g transform={`translate(0, ${jawDrop})`}>
          <path d="M65 225 Q70 250 90 260 Q110 268 120 270 Q130 268 150 260 Q170 250 175 225"
            fill="#ddd0c0" stroke="#b8a898" strokeWidth={2} />
          {/* Lower teeth */}
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <rect key={`lt-${i}`} x={80 + i * 11} y={222} width={7} height={10} rx={1}
              fill="#d8d0c0" stroke="#b8a898" strokeWidth={0.8} />
          ))}
        </g>

        {/* Cheekbones */}
        <path d="M35 170 Q50 185 70 195" fill="none" stroke="#c8b8a8" strokeWidth={2} />
        <path d="M205 170 Q190 185 170 195" fill="none" stroke="#c8b8a8" strokeWidth={2} />

        {/* Temple hollows */}
        <ellipse cx={45} cy={120} rx={12} ry={18} fill="#d8c8b8" opacity={0.3} />
        <ellipse cx={195} cy={120} rx={12} ry={18} fill="#d8c8b8" opacity={0.3} />
      </svg>
    </div>
  );
};

// ---- Spider (horror) ----
const Spider: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const bodyPulse = 1 + Math.sin(time * 2) * 0.03;
  const legPhase = time * 3;

  const legAngles = [
    { base: -50, length: 80, joint: 55 },
    { base: -25, length: 90, joint: 60 },
    { base: 10, length: 90, joint: 60 },
    { base: 40, length: 80, joint: 55 },
  ];

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 15px rgba(100,0,0,0.25))',
    }}>
      <svg width={300} height={250} viewBox="0 0 300 250" style={{ overflow: 'visible' }}>
        {/* Web thread from top */}
        <line x1={150} y1={0} x2={150} y2={70} stroke="#888" strokeWidth={0.8} opacity={0.4} />

        {/* Left legs (4) */}
        {legAngles.map((leg, i) => {
          const wave = Math.sin(legPhase + i * 0.8) * 8;
          const rad = (leg.base * Math.PI) / 180;
          const midX = 130 + Math.cos(rad) * leg.joint + wave * 0.5;
          const midY = 120 + Math.sin(rad) * leg.joint;
          const endX = 130 + Math.cos(rad) * leg.length + wave;
          const endY = 120 + Math.sin(rad) * leg.length + Math.abs(wave) * 0.3;
          return (
            <g key={`ll-${i}`}>
              <path d={`M130 120 Q${midX} ${midY} ${endX} ${endY}`}
                fill="none" stroke="#222" strokeWidth={3} strokeLinecap="round" />
              <path d={`M130 120 Q${midX} ${midY} ${endX} ${endY}`}
                fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
            </g>
          );
        })}

        {/* Right legs (4) — mirrored */}
        {legAngles.map((leg, i) => {
          const wave = Math.sin(legPhase + i * 0.8 + Math.PI) * 8;
          const mirrorBase = 180 - leg.base;
          const rad = (mirrorBase * Math.PI) / 180;
          const midX = 170 + Math.cos(rad) * leg.joint + wave * 0.5;
          const midY = 120 + Math.sin(rad) * leg.joint;
          const endX = 170 + Math.cos(rad) * leg.length + wave;
          const endY = 120 + Math.sin(rad) * leg.length + Math.abs(wave) * 0.3;
          return (
            <g key={`rl-${i}`}>
              <path d={`M170 120 Q${midX} ${midY} ${endX} ${endY}`}
                fill="none" stroke="#222" strokeWidth={3} strokeLinecap="round" />
              <path d={`M170 120 Q${midX} ${midY} ${endX} ${endY}`}
                fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
            </g>
          );
        })}

        {/* Abdomen */}
        <ellipse cx={150} cy={145} rx={32} ry={38} fill="#1a1a1a" stroke="#333" strokeWidth={1.5}
          transform={`scale(1, ${bodyPulse})`} style={{ transformOrigin: '150px 145px' }} />
        {/* Abdomen markings — hourglass */}
        <path d="M143 135 L150 150 L157 135" fill="#aa0000" opacity={0.7} />
        <path d="M143 155 L150 150 L157 155" fill="#aa0000" opacity={0.5} />

        {/* Cephalothorax */}
        <ellipse cx={150} cy={110} rx={22} ry={18} fill="#222" stroke="#333" strokeWidth={1.5} />

        {/* Eyes — 8 eyes, 2 rows */}
        {/* Main eyes */}
        <circle cx={142} cy={105} r={4} fill={`rgba(180,0,0,${0.6 + Math.sin(time * 4) * 0.3})`} />
        <circle cx={158} cy={105} r={4} fill={`rgba(180,0,0,${0.6 + Math.sin(time * 4 + 0.5) * 0.3})`} />
        {/* Secondary eyes */}
        <circle cx={136} cy={100} r={2.5} fill={`rgba(150,0,0,0.5)`} />
        <circle cx={164} cy={100} r={2.5} fill={`rgba(150,0,0,0.5)`} />
        {/* Tertiary eyes */}
        <circle cx={140} cy={112} r={2} fill={`rgba(120,0,0,0.4)`} />
        <circle cx={160} cy={112} r={2} fill={`rgba(120,0,0,0.4)`} />
        {/* Tiny outer eyes */}
        <circle cx={134} cy={107} r={1.5} fill={`rgba(100,0,0,0.3)`} />
        <circle cx={166} cy={107} r={1.5} fill={`rgba(100,0,0,0.3)`} />

        {/* Fangs */}
        <path d="M144 118 L140 130 L144 128" fill="#444" stroke="#555" strokeWidth={0.8} />
        <path d="M156 118 L160 130 L156 128" fill="#444" stroke="#555" strokeWidth={0.8} />

        {/* Pedipalps */}
        <path d="M140 115 Q130 118 125 115" fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
        <path d="M160 115 Q170 118 175 115" fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
      </svg>
    </div>
  );
};

// ---- Background ----
const DarkBg: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame / 30;
  return (
    <>
      <div style={{ position: 'absolute', left: Math.sin(time * 0.1) * 30 - 100, top: -50, width: 500, height: 500,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(40,10,10,0.4), transparent 70%)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', right: Math.sin(time * 0.15 + 1) * 40 - 150, bottom: -100, width: 600, height: 500,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,20,40,0.35), transparent 70%)', filter: 'blur(90px)' }} />
      <div style={{ position: 'absolute', left: 700, top: 100, width: 400, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,30,15,0.3), transparent 70%)', filter: 'blur(70px)' }} />
    </>
  );
};

// ---- Main ----
const CreatureShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wolfIn = spring({ frame, fps, delay: 10, config: { damping: 200 }, durationInFrames: 35 });
  const eagleIn = spring({ frame, fps, delay: 30, config: { damping: 200 }, durationInFrames: 35 });
  const dragonIn = spring({ frame, fps, delay: 50, config: { damping: 200 }, durationInFrames: 35 });
  const skullIn = spring({ frame, fps, delay: 70, config: { damping: 200 }, durationInFrames: 35 });
  const spiderIn = spring({ frame, fps, delay: 90, config: { damping: 200 }, durationInFrames: 35 });

  return (
    <AbsoluteFill style={{ backgroundColor: '#08080f', overflow: 'hidden' }}>
      <DarkBg />

      <div style={{ opacity: wolfIn, transform: `translateY(${interpolate(wolfIn, [0, 1], [40, 0])}px)` }}>
        <Wolf frame={frame} x={50} y={350} scale={1.1} />
      </div>

      <div style={{ opacity: eagleIn, transform: `translateY(${interpolate(eagleIn, [0, 1], [-40, 0])}px)` }}>
        <Eagle frame={frame} x={380} y={30} scale={1.0} />
      </div>

      <div style={{ opacity: dragonIn, transform: `translateX(${interpolate(dragonIn, [0, 1], [60, 0])}px)` }}>
        <DragonHead frame={frame} x={750} y={250} scale={1.15} />
      </div>

      <div style={{ opacity: skullIn, transform: `scale(${interpolate(skullIn, [0, 1], [0.5, 1])})` }}>
        <Skull frame={frame} x={1200} y={80} scale={1.1} />
      </div>

      <div style={{ opacity: spiderIn, transform: `translateY(${interpolate(spiderIn, [0, 1], [-50, 0])}px)` }}>
        <Spider frame={frame} x={1500} y={380} scale={1.2} />
      </div>

      {/* Labels */}
      {[
        { text: 'WOLF', x: 130, y: 680, op: wolfIn },
        { text: 'EAGLE', x: 500, y: 340, op: eagleIn },
        { text: 'DRAGON', x: 840, y: 650, op: dragonIn },
        { text: 'SKULL', x: 1260, y: 410, op: skullIn },
        { text: 'SPIDER', x: 1570, y: 680, op: spiderIn },
      ].map(l => (
        <div key={l.text} style={{
          position: 'absolute', left: l.x, top: l.y, fontSize: 22, color: '#aa8866',
          fontFamily: 'Georgia, serif', letterSpacing: 5, opacity: l.op,
          textShadow: '0 0 12px rgba(200,100,50,0.3)',
        }}>{l.text}</div>
      ))}

      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

export const CreatureShowcaseComp: React.FC = () => (
  <Composition
    id="CreatureShowcase"
    component={CreatureShowcase}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default CreatureShowcase;
