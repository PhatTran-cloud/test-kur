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
// Cartoon Creatures — Same style as Astronaut/Rocket
// Clean flat illustration, bold shapes, cute but recognizable
// ============================================================

// ---- Cartoon Wolf ----
const CartoonWolf: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const breathe = Math.sin(time * 1.5) * 2;
  const tailWag = Math.sin(time * 3) * 15;
  const earTwitch = Math.sin(time * 2.5) * 4;
  const headTilt = Math.sin(time * 0.8) * 2;
  const pawLift = Math.max(0, Math.sin(time * 2)) * 5;
  const eyeGlow = 0.7 + Math.sin(time * 2) * 0.3;

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 18px rgba(80,100,180,0.25))',
    }}>
      <svg width={300} height={320} viewBox="0 0 300 320" style={{ overflow: 'visible' }}>
        {/* Tail — bushy */}
        <path d={`M225 175 Q260 ${155 + tailWag} 270 ${135 + tailWag} Q280 ${125 + tailWag} 275 ${120 + tailWag} Q265 ${125 + tailWag} 255 ${140 + tailWag} Q245 160 225 170`}
          fill="#4a5068" stroke="#3a4058" strokeWidth={1} />
        <path d={`M265 ${132 + tailWag} Q275 ${128 + tailWag} 272 ${122 + tailWag}`}
          fill="none" stroke="#5a6078" strokeWidth={4} strokeLinecap="round" />

        {/* Body — chunky barrel shape */}
        <ellipse cx={160} cy={195 + breathe} rx={65} ry={45} fill="#4a5068" />
        {/* Belly — lighter */}
        <ellipse cx={155} cy={205 + breathe} rx={40} ry={28} fill="#5a6278" />

        {/* Back legs */}
        <rect x={195} y={230 + breathe} width={22} height={50} rx={11} fill="#4a5068" />
        <rect x={210} y={230 + breathe} width={22} height={48} rx={11} fill="#424a5e" />
        {/* Back paws */}
        <ellipse cx={206} cy={282 + breathe} rx={14} ry={8} fill="#3a4058" />
        <ellipse cx={221} cy={280 + breathe} rx={14} ry={8} fill="#3a4058" />

        {/* Front legs */}
        <rect x={100} y={228 + breathe} width={20} height={52 - pawLift} rx={10} fill="#4a5068" />
        <rect x={120} y={228 + breathe} width={20} height={50} rx={10} fill="#424a5e" />
        {/* Front paws */}
        <ellipse cx={110} cy={282 + breathe - pawLift} rx={13} ry={8} fill="#3a4058" />
        <ellipse cx={130} cy={280 + breathe} rx={13} ry={8} fill="#3a4058" />

        {/* Neck fur ruff */}
        <ellipse cx={110} cy={170 + breathe} rx={30} ry={25} fill="#5a6278" />

        {/* Head */}
        <g transform={`rotate(${headTilt} 100 120)`}>
          {/* Head shape — angular wolf */}
          <path d={`M60 ${105 + breathe} Q55 ${80 + breathe} 70 ${70 + breathe} L100 ${60 + breathe} L130 ${70 + breathe} Q145 ${80 + breathe} 140 ${105 + breathe} Q140 ${130 + breathe} 120 ${140 + breathe} L80 ${140 + breathe} Q60 ${130 + breathe} 60 ${105 + breathe} Z`}
            fill="#4a5068" stroke="#3a4058" strokeWidth={1.5} />

          {/* Cheek fur — lighter */}
          <path d={`M68 ${110 + breathe} Q80 ${120 + breathe} 100 ${125 + breathe} Q120 ${120 + breathe} 132 ${110 + breathe}`}
            fill="#5a6278" opacity={0.6} />

          {/* Snout — distinct lighter area */}
          <ellipse cx={100} cy={115 + breathe} rx={22} ry={16} fill="#5a6278" />
          {/* Nose — big and round */}
          <ellipse cx={100} cy={108 + breathe} rx={8} ry={6} fill="#222" />
          <ellipse cx={98} cy={106 + breathe} rx={3} ry={2} fill="#444" opacity={0.5} />

          {/* Mouth — gentle smile */}
          <path d={`M90 ${118 + breathe} Q100 ${124 + breathe} 110 ${118 + breathe}`}
            fill="none" stroke="#3a4058" strokeWidth={1.5} strokeLinecap="round" />

          {/* Eyes — large, expressive */}
          <ellipse cx={82} cy={92 + breathe} rx={12} ry={13} fill="#fff" stroke="#3a4058" strokeWidth={1.5} />
          <ellipse cx={82} cy={93 + breathe} rx={7} ry={8} fill={`rgb(200,170,50)`} />
          <circle cx={82} cy={91 + breathe} r={4} fill="#111" />
          <circle cx={80} cy={89 + breathe} r={2} fill={`rgba(255,255,255,${eyeGlow})`} />

          <ellipse cx={118} cy={92 + breathe} rx={12} ry={13} fill="#fff" stroke="#3a4058" strokeWidth={1.5} />
          <ellipse cx={118} cy={93 + breathe} rx={7} ry={8} fill={`rgb(200,170,50)`} />
          <circle cx={118} cy={91 + breathe} r={4} fill="#111" />
          <circle cx={116} cy={89 + breathe} r={2} fill={`rgba(255,255,255,${eyeGlow})`} />

          {/* Eyebrows — fierce */}
          <path d={`M70 ${82 + breathe} Q78 ${78 + breathe} 90 ${82 + breathe}`}
            fill="none" stroke="#3a4058" strokeWidth={2.5} strokeLinecap="round" />
          <path d={`M110 ${82 + breathe} Q122 ${78 + breathe} 130 ${82 + breathe}`}
            fill="none" stroke="#3a4058" strokeWidth={2.5} strokeLinecap="round" />

          {/* Ears — pointed */}
          <path d={`M70 ${75 + breathe} L58 ${38 + breathe + earTwitch} L82 ${65 + breathe}`}
            fill="#4a5068" stroke="#3a4058" strokeWidth={1.5} />
          <path d={`M65 ${65 + breathe} L62 ${48 + breathe + earTwitch} L76 ${62 + breathe}`}
            fill="#6a5070" opacity={0.4} />

          <path d={`M130 ${75 + breathe} L142 ${38 + breathe - earTwitch} L118 ${65 + breathe}`}
            fill="#4a5068" stroke="#3a4058" strokeWidth={1.5} />
          <path d={`M135 ${65 + breathe} L138 ${48 + breathe - earTwitch} L124 ${62 + breathe}`}
            fill="#6a5070" opacity={0.4} />
        </g>
      </svg>
    </div>
  );
};

// ---- Cartoon Dragon ----
const CartoonDragon: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const breathe = Math.sin(time * 1.2) * 2;
  const wingFlap = Math.sin(time * 2) * 12;
  const fireOn = Math.sin(time * 0.8) > 0.3;
  const fireFlicker = Math.sin(time * 8) * 0.3;
  const tailSwing = Math.sin(time * 1.5) * 10;
  const eyePulse = 0.8 + Math.sin(time * 3) * 0.2;

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 20px rgba(255,100,0,0.2))',
    }}>
      <svg width={360} height={380} viewBox="0 0 360 380" style={{ overflow: 'visible' }}>
        {/* Tail — curly */}
        <path d={`M240 250 Q280 ${260 + tailSwing} 300 ${240 + tailSwing} Q320 ${220 + tailSwing} 310 ${200 + tailSwing} Q300 ${190 + tailSwing} 295 ${195 + tailSwing}`}
          fill="none" stroke="#2a7a3a" strokeWidth={16} strokeLinecap="round" />
        <path d={`M240 250 Q280 ${260 + tailSwing} 300 ${240 + tailSwing} Q320 ${220 + tailSwing} 310 ${200 + tailSwing} Q300 ${190 + tailSwing} 295 ${195 + tailSwing}`}
          fill="none" stroke="#3a9a4a" strokeWidth={10} strokeLinecap="round" />
        {/* Tail spike */}
        <path d={`M292 ${195 + tailSwing} L285 ${180 + tailSwing} L298 ${188 + tailSwing}`}
          fill="#cc5500" />

        {/* Left wing */}
        <path d={`M120 140 Q80 ${100 + wingFlap} 50 ${80 + wingFlap * 1.3} Q30 ${70 + wingFlap * 1.4} 25 ${75 + wingFlap * 1.3} Q35 ${90 + wingFlap} 60 ${110 + wingFlap * 0.7} Q80 125 110 140`}
          fill="#2a6a30" stroke="#3a8a40" strokeWidth={1} opacity={0.8} />
        {/* Wing membrane lines */}
        <path d={`M110 138 Q75 ${105 + wingFlap} 45 ${82 + wingFlap * 1.2}`}
          fill="none" stroke="#1a5a2a" strokeWidth={1} opacity={0.4} />

        {/* Right wing */}
        <path d={`M200 140 Q240 ${100 + wingFlap} 270 ${80 + wingFlap * 1.3} Q290 ${70 + wingFlap * 1.4} 295 ${75 + wingFlap * 1.3} Q285 ${90 + wingFlap} 260 ${110 + wingFlap * 0.7} Q240 125 210 140`}
          fill="#2a6a30" stroke="#3a8a40" strokeWidth={1} opacity={0.8} />

        {/* Body — round chubby */}
        <ellipse cx={170} cy={230 + breathe} rx={70} ry={60} fill="#2a8a3a" />
        {/* Belly */}
        <ellipse cx={165} cy={240 + breathe} rx={45} ry={42} fill="#4aaa5a" />
        {/* Belly scales */}
        {[0, 1, 2, 3].map(i => (
          <path key={i} d={`M148 ${215 + i * 18 + breathe} Q165 ${210 + i * 18 + breathe} 182 ${215 + i * 18 + breathe}`}
            fill="none" stroke="#3a9a4a" strokeWidth={1} opacity={0.4} />
        ))}

        {/* Legs — stubby cute */}
        <ellipse cx={125} cy={290 + breathe} rx={18} ry={22} fill="#2a7a3a" />
        <ellipse cx={215} cy={290 + breathe} rx={18} ry={22} fill="#2a7a3a" />
        {/* Feet with claws */}
        <ellipse cx={125} cy={308 + breathe} rx={20} ry={10} fill="#1a6a2a" />
        <ellipse cx={215} cy={308 + breathe} rx={20} ry={10} fill="#1a6a2a" />
        {[0, 1, 2].map(i => (
          <g key={`claw-${i}`}>
            <ellipse cx={112 + i * 13} cy={315 + breathe} rx={3} ry={5} fill="#aa7733" />
            <ellipse cx={202 + i * 13} cy={315 + breathe} rx={3} ry={5} fill="#aa7733" />
          </g>
        ))}

        {/* Arms — small T-rex style */}
        <path d={`M115 ${200 + breathe} Q95 ${210 + breathe} 90 ${225 + breathe}`}
          fill="none" stroke="#2a8a3a" strokeWidth={12} strokeLinecap="round" />
        <circle cx={88} cy={228 + breathe} r={8} fill="#1a6a2a" />

        <path d={`M225 ${200 + breathe} Q245 ${210 + breathe} 250 ${225 + breathe}`}
          fill="none" stroke="#2a8a3a" strokeWidth={12} strokeLinecap="round" />
        <circle cx={252} cy={228 + breathe} r={8} fill="#1a6a2a" />

        {/* Head — big and round */}
        <ellipse cx={160} cy={130 + breathe} rx={55} ry={50} fill="#2a8a3a" stroke="#1a7a2a" strokeWidth={1.5} />
        {/* Snout — protruding */}
        <ellipse cx={155} cy={150 + breathe} rx={30} ry={20} fill="#3a9a4a" />

        {/* Nostrils */}
        <ellipse cx={145} cy={145 + breathe} rx={4} ry={3} fill="#1a5a2a" />
        <ellipse cx={165} cy={145 + breathe} rx={4} ry={3} fill="#1a5a2a" />
        {/* Smoke from nostrils */}
        <circle cx={142} cy={138 + breathe - Math.abs(Math.sin(time * 2)) * 8} r={3}
          fill="#888" opacity={0.25} />
        <circle cx={168} cy={140 + breathe - Math.abs(Math.sin(time * 2 + 1)) * 6} r={2.5}
          fill="#777" opacity={0.2} />

        {/* Mouth */}
        <path d={`M135 ${158 + breathe} Q155 ${165 + breathe} 175 ${158 + breathe}`}
          fill="none" stroke="#1a5a2a" strokeWidth={2} strokeLinecap="round" />
        {/* Teeth peeking out */}
        <path d={`M142 ${158 + breathe} L145 ${164 + breathe} L148 ${158 + breathe}`} fill="#fff" />
        <path d={`M162 ${158 + breathe} L165 ${164 + breathe} L168 ${158 + breathe}`} fill="#fff" />

        {/* Fire breath */}
        {fireOn && (
          <g opacity={0.7 + fireFlicker}>
            <ellipse cx={155} cy={175 + breathe} rx={15} ry={10} fill="#ff6600" opacity={0.6} />
            <ellipse cx={155} cy={185 + breathe} rx={10} ry={12} fill="#ff8800" opacity={0.5} />
            <ellipse cx={155} cy={180 + breathe} rx={6} ry={8} fill="#ffcc33" opacity={0.6} />
          </g>
        )}

        {/* Eyes — big cute with slit pupils */}
        <ellipse cx={140} cy={118 + breathe} rx={16} ry={18} fill="#fff" stroke="#1a6a2a" strokeWidth={2} />
        <ellipse cx={140} cy={120 + breathe} rx={10} ry={12} fill="#cc8800" />
        <ellipse cx={140} cy={120 + breathe} rx={4} ry={10} fill="#111" />
        <ellipse cx={138} cy={115 + breathe} rx={4} ry={3} fill={`rgba(255,255,255,${eyePulse})`} />

        <ellipse cx={180} cy={118 + breathe} rx={16} ry={18} fill="#fff" stroke="#1a6a2a" strokeWidth={2} />
        <ellipse cx={180} cy={120 + breathe} rx={10} ry={12} fill="#cc8800" />
        <ellipse cx={180} cy={120 + breathe} rx={4} ry={10} fill="#111" />
        <ellipse cx={178} cy={115 + breathe} rx={4} ry={3} fill={`rgba(255,255,255,${eyePulse})`} />

        {/* Horns */}
        <path d={`M130 ${85 + breathe} L118 ${55 + breathe} L135 ${75 + breathe}`}
          fill="#cc7700" stroke="#aa5500" strokeWidth={1} />
        <path d={`M190 ${85 + breathe} L202 ${55 + breathe} L185 ${75 + breathe}`}
          fill="#cc7700" stroke="#aa5500" strokeWidth={1} />

        {/* Head spikes */}
        {[0, 1, 2].map(i => (
          <path key={`hs-${i}`}
            d={`M${148 + i * 12} ${82 + breathe} L${152 + i * 12} ${68 + breathe} L${156 + i * 12} ${82 + breathe}`}
            fill="#1a7a2a" />
        ))}
      </svg>
    </div>
  );
};

// ---- Cartoon Medusa ----
const CartoonMedusa: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const float = Math.sin(time * 0.7) * 6;
  const snakePhase = time * 2;
  const eyeGlow = 0.6 + Math.sin(time * 2.5) * 0.4;
  const breathe = Math.sin(time * 1.2) * 2;

  return (
    <div style={{
      position: 'absolute', left: x, top: y + float,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 20px rgba(0,255,100,0.2))',
    }}>
      <svg width={280} height={380} viewBox="0 0 280 380" style={{ overflow: 'visible' }}>
        {/* Body / dress — flowing */}
        <path d={`M100 ${220 + breathe} Q80 ${260 + breathe} 75 ${310 + breathe} Q72 ${340 + breathe} 85 ${360 + breathe} L195 ${360 + breathe} Q208 ${340 + breathe} 205 ${310 + breathe} Q200 ${260 + breathe} 180 ${220 + breathe} Z`}
          fill="#1a5a3a" stroke="#0a4a2a" strokeWidth={1.5} />
        {/* Dress folds */}
        <path d={`M110 ${260 + breathe} Q130 ${270 + breathe} 140 ${290 + breathe}`}
          fill="none" stroke="#2a6a4a" strokeWidth={1} opacity={0.4} />
        <path d={`M170 ${260 + breathe} Q155 ${275 + breathe} 150 ${300 + breathe}`}
          fill="none" stroke="#2a6a4a" strokeWidth={1} opacity={0.4} />

        {/* Arms */}
        <path d={`M100 ${230 + breathe} Q70 ${240 + breathe} 55 ${260 + breathe}`}
          fill="none" stroke="#7ab88a" strokeWidth={14} strokeLinecap="round" />
        <circle cx={52} cy={264 + breathe} r={9} fill="#7ab88a" />

        <path d={`M180 ${230 + breathe} Q210 ${240 + breathe} 225 ${260 + breathe}`}
          fill="none" stroke="#7ab88a" strokeWidth={14} strokeLinecap="round" />
        <circle cx={228} cy={264 + breathe} r={9} fill="#7ab88a" />

        {/* Snake hair — 8 snakes */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = -80 + i * 22;
          const rad = (angle * Math.PI) / 180;
          const sway = Math.sin(snakePhase + i * 0.9) * 12;
          const len = 60 + i * 5;
          const endX = 140 + Math.cos(rad) * len + sway;
          const endY = 80 + Math.sin(rad) * len - 20;
          const midX = 140 + Math.cos(rad) * len * 0.5 + sway * 0.5;
          const midY = 80 + Math.sin(rad) * len * 0.5 - 10;
          const colors = ['#2a8a3a', '#3a9a4a', '#2a7a3a', '#4aaa5a', '#2a8a3a', '#3a9a4a', '#2a7a3a', '#3a8a3a'];
          return (
            <g key={i}>
              <path d={`M140 100 Q${midX} ${midY} ${endX} ${endY}`}
                fill="none" stroke={colors[i]} strokeWidth={6} strokeLinecap="round" />
              {/* Snake head */}
              <circle cx={endX} cy={endY} r={5} fill={colors[i]} />
              {/* Snake eyes */}
              <circle cx={endX - 1} cy={endY - 2} r={1.5} fill="#ff0" />
              <circle cx={endX + 2} cy={endY - 2} r={1.5} fill="#ff0" />
              {/* Snake tongue */}
              {i % 3 === 0 && (
                <path d={`M${endX} ${endY + 4} L${endX - 2} ${endY + 9} M${endX} ${endY + 4} L${endX + 2} ${endY + 9}`}
                  fill="none" stroke="#cc3333" strokeWidth={1} />
              )}
            </g>
          );
        })}

        {/* Head — green-tinted skin */}
        <ellipse cx={140} cy={135 + breathe} rx={42} ry={48} fill="#7ab88a" stroke="#5aa87a" strokeWidth={1.5} />

        {/* Face features */}
        {/* Eyes — glowing green menace */}
        <ellipse cx={122} cy={125 + breathe} rx={13} ry={14} fill="#fff" stroke="#5aa87a" strokeWidth={1.5} />
        <ellipse cx={122} cy={126 + breathe} rx={8} ry={9} fill="#00cc44" />
        <circle cx={122} cy={125 + breathe} r={5} fill="#006622" />
        <circle cx={120} cy={123 + breathe} r={2.5} fill={`rgba(255,255,255,${eyeGlow})`} />
        {/* Glow effect */}
        <ellipse cx={122} cy={125 + breathe} rx={16} ry={16} fill={`rgba(0,255,80,${eyeGlow * 0.15})`} />

        <ellipse cx={158} cy={125 + breathe} rx={13} ry={14} fill="#fff" stroke="#5aa87a" strokeWidth={1.5} />
        <ellipse cx={158} cy={126 + breathe} rx={8} ry={9} fill="#00cc44" />
        <circle cx={158} cy={125 + breathe} r={5} fill="#006622" />
        <circle cx={156} cy={123 + breathe} r={2.5} fill={`rgba(255,255,255,${eyeGlow})`} />
        <ellipse cx={158} cy={125 + breathe} rx={16} ry={16} fill={`rgba(0,255,80,${eyeGlow * 0.15})`} />

        {/* Eyelashes */}
        <path d={`M112 ${116 + breathe} Q118 ${112 + breathe} 125 ${114 + breathe}`}
          fill="none" stroke="#5aa87a" strokeWidth={2} />
        <path d={`M148 ${116 + breathe} Q155 ${112 + breathe} 165 ${114 + breathe}`}
          fill="none" stroke="#5aa87a" strokeWidth={2} />

        {/* Nose */}
        <path d={`M136 ${140 + breathe} Q140 ${145 + breathe} 144 ${140 + breathe}`}
          fill="none" stroke="#5aa87a" strokeWidth={1.5} />

        {/* Lips */}
        <path d={`M125 ${155 + breathe} Q140 ${162 + breathe} 155 ${155 + breathe}`}
          fill="#668877" stroke="#557766" strokeWidth={1} />
        <path d={`M128 ${155 + breathe} Q140 ${150 + breathe} 152 ${155 + breathe}`}
          fill="#7a9988" opacity={0.5} />

        {/* Stone gaze rays — subtle */}
        {[0, 1, 2].map(i => {
          const rayAngle = time * 0.3 + i * 2.1;
          const rayOp = 0.08 + Math.sin(time * 1.5 + i) * 0.05;
          return (
            <line key={i}
              x1={140} y1={125 + breathe}
              x2={140 + Math.cos(rayAngle) * 120}
              y2={125 + breathe + Math.sin(rayAngle) * 80}
              stroke="#00ff66" strokeWidth={1} opacity={rayOp} />
          );
        })}

        {/* Necklace — snake pendant */}
        <path d={`M115 ${195 + breathe} Q140 ${205 + breathe} 165 ${195 + breathe}`}
          fill="none" stroke="#aa8833" strokeWidth={2} />
        <circle cx={140} cy={205 + breathe} r={6} fill="#aa8833" stroke="#886622" strokeWidth={1} />
        <path d={`M138 ${203 + breathe} Q140 ${208 + breathe} 142 ${203 + breathe}`}
          fill="none" stroke="#666" strokeWidth={1} />
      </svg>
    </div>
  );
};

// ---- Starfield ----
const Stars: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame / 30;
  const stars = useMemo(() => {
    const s: { x: number; y: number; r: number; tw: number }[] = [];
    for (let i = 0; i < 200; i++) {
      s.push({ x: Math.random() * 1920, y: Math.random() * 1080, r: 0.5 + Math.random() * 1.5, tw: 1 + Math.random() * 3 });
    }
    return s;
  }, []);
  return (
    <>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: s.x, top: s.y, width: s.r * 2, height: s.r * 2,
          borderRadius: '50%', backgroundColor: '#fff',
          opacity: (0.3 + 0.5 * Math.sin(time * s.tw + i)) * 0.5,
        }} />
      ))}
    </>
  );
};

// ---- Main ----
const CartoonCreatures: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wolfIn = spring({ frame, fps, delay: 15, config: { damping: 200 }, durationInFrames: 40 });
  const dragonIn = spring({ frame, fps, delay: 40, config: { damping: 200 }, durationInFrames: 40 });
  const medusaIn = spring({ frame, fps, delay: 65, config: { damping: 200 }, durationInFrames: 40 });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a18', overflow: 'hidden' }}>
      <Stars />

      <div style={{ opacity: wolfIn, transform: `translateY(${interpolate(wolfIn, [0, 1], [50, 0])}px)` }}>
        <CartoonWolf frame={frame} x={80} y={350} scale={1.2} />
      </div>

      <div style={{ opacity: dragonIn, transform: `scale(${interpolate(dragonIn, [0, 1], [0.6, 1])})` }}>
        <CartoonDragon frame={frame} x={550} y={280} scale={1.15} />
      </div>

      <div style={{ opacity: medusaIn, transform: `translateY(${interpolate(medusaIn, [0, 1], [-40, 0])}px)` }}>
        <CartoonMedusa frame={frame} x={1100} y={250} scale={1.2} />
      </div>

      {/* Labels */}
      {[
        { text: 'WOLF', x: 160, op: wolfIn, color: '#6680aa' },
        { text: 'DRAGON', x: 650, op: dragonIn, color: '#55aa66' },
        { text: 'MEDUSA', x: 1200, op: medusaIn, color: '#66cc88' },
      ].map(l => (
        <div key={l.text} style={{
          position: 'absolute', left: l.x, bottom: 80, fontSize: 32, color: l.color,
          fontFamily: 'Georgia, serif', letterSpacing: 6, opacity: l.op,
          textShadow: `0 0 15px ${l.color}44`,
        }}>{l.text}</div>
      ))}

      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)',
        pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

export const CartoonCreaturesComp: React.FC = () => (
  <Composition
    id="CartoonCreatures"
    component={CartoonCreatures}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default CartoonCreatures;
