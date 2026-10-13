import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Composition,
} from 'remotion';

const W = 1920;
const H = 1080;
const EC = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

// ============================================================
// SVG Showcase: Astronaut, Spaceship, Rocket
// Pure SVG + CSS, no Three.js
// ============================================================

// ---- Starfield ----
const Starfield: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame / 30;
  const stars = useMemo(() => {
    const s: { x: number; y: number; r: number; tw: number }[] = [];
    for (let i = 0; i < 300; i++) {
      s.push({ x: Math.random() * W, y: Math.random() * H, r: 0.5 + Math.random() * 1.8, tw: 1 + Math.random() * 3 });
    }
    return s;
  }, []);
  return (
    <>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: s.x, top: s.y, width: s.r * 2, height: s.r * 2,
          borderRadius: '50%', backgroundColor: '#fff',
          opacity: (0.4 + 0.6 * Math.sin(time * s.tw + i)) * 0.7,
          boxShadow: s.r > 1.2 ? `0 0 ${s.r * 4}px rgba(255,255,255,0.3)` : undefined,
        }} />
      ))}
    </>
  );
};

// ---- Astronaut SVG ----
const Astronaut: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const float = Math.sin(time * 0.8) * 12;
  const tilt = Math.sin(time * 0.5) * 5;
  const breathe = 1 + Math.sin(time * 1.5) * 0.015;
  // Arm wave
  const armAngle = Math.sin(time * 1.2) * 15;
  // Leg drift
  const legDrift = Math.sin(time * 0.6) * 8;
  // Visor reflection shimmer
  const visorShimmer = 0.3 + Math.sin(time * 2) * 0.15;

  return (
    <div style={{
      position: 'absolute', left: x, top: y + float,
      transform: `scale(${scale * breathe}) rotate(${tilt}deg)`,
      transformOrigin: 'center center',
      filter: 'drop-shadow(0 0 20px rgba(100,180,255,0.3))',
    }}>
      <svg width={280} height={400} viewBox="0 0 280 400" style={{ overflow: 'visible' }}>
        {/* Backpack / Life support */}
        <rect x={85} y={130} width={110} height={120} rx={12} fill="#555" stroke="#777" strokeWidth={2} />
        <rect x={95} y={140} width={30} height={20} rx={4} fill="#333" stroke="#888" strokeWidth={1} />
        <rect x={95} y={168} width={30} height={20} rx={4} fill="#333" stroke="#666" strokeWidth={1} />
        {/* Oxygen hose */}
        <path d={`M85 170 Q60 170 55 150 Q50 130 60 115 Q70 100 90 105`} fill="none" stroke="#888" strokeWidth={5} strokeLinecap="round" />

        {/* Body / Suit torso */}
        <path d="M100 155 Q100 135 115 125 L165 125 Q180 135 180 155 L185 240 Q185 260 170 265 L110 265 Q95 260 95 240 Z"
          fill="#e8e8e8" stroke="#ccc" strokeWidth={2} />
        {/* Suit detail lines */}
        <line x1={140} y1={135} x2={140} y2={250} stroke="#bbb" strokeWidth={1} opacity={0.5} />
        <ellipse cx={140} cy={175} rx={25} ry={8} fill="none" stroke="#bbb" strokeWidth={1} opacity={0.4} />
        {/* Belt */}
        <rect x={98} y={230} width={84} height={12} rx={3} fill="#999" stroke="#777" strokeWidth={1} />
        <circle cx={140} cy={236} r={4} fill="#666" />

        {/* Left arm — waving */}
        <g transform={`rotate(${-20 + armAngle} 100 155)`}>
          <path d="M100 155 Q70 175 55 210 Q45 235 50 260" fill="none" stroke="#e0e0e0" strokeWidth={22} strokeLinecap="round" />
          {/* Glove */}
          <circle cx={50} cy={262} r={14} fill="#ccc" stroke="#aaa" strokeWidth={2} />
          <path d="M42 250 Q38 245 42 240" fill="none" stroke="#bbb" strokeWidth={3} strokeLinecap="round" />
        </g>

        {/* Right arm */}
        <g transform={`rotate(${10 - armAngle * 0.5} 180 155)`}>
          <path d="M180 155 Q210 175 225 210 Q235 235 230 260" fill="none" stroke="#e0e0e0" strokeWidth={22} strokeLinecap="round" />
          {/* Glove */}
          <circle cx={230} cy={262} r={14} fill="#ccc" stroke="#aaa" strokeWidth={2} />
        </g>

        {/* Left leg */}
        <g transform={`rotate(${legDrift} 120 265)`}>
          <path d="M120 265 Q115 310 110 350 Q108 370 115 380" fill="none" stroke="#ddd" strokeWidth={24} strokeLinecap="round" />
          {/* Boot */}
          <path d="M105 375 Q100 385 105 390 L128 390 Q135 385 130 375" fill="#999" stroke="#777" strokeWidth={2} />
        </g>

        {/* Right leg */}
        <g transform={`rotate(${-legDrift * 0.8} 160 265)`}>
          <path d="M160 265 Q165 310 170 350 Q172 370 165 380" fill="none" stroke="#ddd" strokeWidth={24} strokeLinecap="round" />
          {/* Boot */}
          <path d="M155 375 Q150 385 155 390 L178 390 Q185 385 180 375" fill="#999" stroke="#777" strokeWidth={2} />
        </g>

        {/* Helmet */}
        <ellipse cx={140} cy={95} rx={52} ry={55} fill="#e8e8e8" stroke="#ccc" strokeWidth={2} />
        {/* Visor */}
        <ellipse cx={140} cy={90} rx={38} ry={38} fill="#1a2a44" stroke="#4488aa" strokeWidth={2} />
        {/* Visor reflection */}
        <ellipse cx={128} cy={78} rx={18} ry={12} fill={`rgba(100,180,255,${visorShimmer})`}
          transform="rotate(-15 128 78)" />
        <ellipse cx={150} cy={100} rx={10} ry={6} fill={`rgba(100,180,255,${visorShimmer * 0.5})`} />
        {/* Helmet rim */}
        <path d="M88 95 Q88 40 140 38 Q192 40 192 95" fill="none" stroke="#ddd" strokeWidth={3} />
        {/* Antenna */}
        <line x1={170} y1={50} x2={185} y2={25} stroke="#aaa" strokeWidth={2} />
        <circle cx={185} cy={22} r={4} fill={`rgb(255,${100 + Math.sin(time * 4) * 80},50)`} />

        {/* Flag patch on arm */}
        <rect x={60} y={185} width={18} height={12} rx={1} fill="#224488" stroke="#446699" strokeWidth={0.5}
          transform={`rotate(${-20 + armAngle} 100 155)`} opacity={0.8} />
      </svg>
    </div>
  );
};

// ---- Spaceship SVG ----
const Spaceship: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const hover = Math.sin(time * 1.0) * 6;
  const enginePulse = 0.6 + Math.sin(time * 6) * 0.4;
  const engineFlicker = 0.5 + Math.sin(time * 12) * 0.3;

  return (
    <div style={{
      position: 'absolute', left: x, top: y + hover,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 25px rgba(0,150,255,0.25))',
    }}>
      <svg width={420} height={280} viewBox="0 0 420 280" style={{ overflow: 'visible' }}>
        {/* Engine glow */}
        <ellipse cx={60} cy={140} rx={35} ry={25} fill="#0088ff" opacity={enginePulse * 0.3} />
        <ellipse cx={45} cy={140} rx={50} ry={18} fill="#00aaff" opacity={enginePulse * 0.15} />

        {/* Engine exhaust trail */}
        <ellipse cx={30} cy={140} rx={40 + engineFlicker * 15} ry={10 + engineFlicker * 5}
          fill="#0066cc" opacity={engineFlicker * 0.25} />

        {/* Main hull */}
        <path d="M80 100 L350 85 Q400 100 400 140 Q400 180 350 195 L80 180 Q60 165 60 140 Q60 115 80 100Z"
          fill="url(#shipBody)" stroke="#8899aa" strokeWidth={1.5} />

        {/* Cockpit windshield */}
        <path d="M340 105 Q380 115 385 140 Q380 165 340 175 L320 170 Q315 140 320 110 Z"
          fill="#1a3355" stroke="#4488bb" strokeWidth={1.5} opacity={0.9} />
        {/* Cockpit reflection */}
        <path d="M345 115 Q365 125 368 140 Q365 148 355 152" fill="none" stroke="rgba(100,180,255,0.4)" strokeWidth={2} />

        {/* Hull panel lines */}
        <line x1={150} y1={102} x2={150} y2={178} stroke="#778899" strokeWidth={0.8} opacity={0.4} />
        <line x1={220} y1={96} x2={220} y2={184} stroke="#778899" strokeWidth={0.8} opacity={0.4} />
        <line x1={290} y1={92} x2={290} y2={188} stroke="#778899" strokeWidth={0.8} opacity={0.4} />

        {/* Top fin */}
        <path d="M120 100 L100 50 L80 48 L90 65 L100 100" fill="#889" stroke="#99aabb" strokeWidth={1} />
        {/* Bottom fin */}
        <path d="M120 180 L100 230 L80 232 L90 215 L100 180" fill="#889" stroke="#99aabb" strokeWidth={1} />

        {/* Wing - top */}
        <path d="M160 100 L130 55 Q180 60 200 95" fill="#778" stroke="#8899aa" strokeWidth={1} opacity={0.9} />
        {/* Wing - bottom */}
        <path d="M160 180 L130 225 Q180 220 200 185" fill="#778" stroke="#8899aa" strokeWidth={1} opacity={0.9} />

        {/* Engine nozzles */}
        <rect x={58} y={118} width={25} height={15} rx={3} fill="#556" stroke="#778" strokeWidth={1} />
        <rect x={58} y={147} width={25} height={15} rx={3} fill="#556" stroke="#778" strokeWidth={1} />
        {/* Engine inner glow */}
        <rect x={58} y={120} width={10} height={11} rx={2} fill={`rgba(0,150,255,${enginePulse})`} />
        <rect x={58} y={149} width={10} height={11} rx={2} fill={`rgba(0,150,255,${enginePulse})`} />

        {/* Hull lights */}
        <circle cx={300} cy={140} r={3} fill={`rgba(255,100,50,${0.5 + Math.sin(time * 3) * 0.5})`} />
        <circle cx={250} cy={98} r={2} fill={`rgba(50,255,100,${0.5 + Math.sin(time * 2.5 + 1) * 0.5})`} />
        <circle cx={250} cy={182} r={2} fill={`rgba(255,50,50,${0.5 + Math.sin(time * 2.5 + 2) * 0.5})`} />

        {/* Gradients */}
        <defs>
          <linearGradient id="shipBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8899aa" />
            <stop offset="30%" stopColor="#667788" />
            <stop offset="70%" stopColor="#556677" />
            <stop offset="100%" stopColor="#778899" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// ---- Rocket SVG ----
const Rocket: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const shake = Math.sin(time * 20) * 1.5;
  const flamePulse = 0.7 + Math.sin(time * 8) * 0.3;
  const flameLength = 80 + Math.sin(time * 6) * 25;
  const exhaust = Math.sin(time * 15) * 3;

  return (
    <div style={{
      position: 'absolute', left: x + shake, top: y,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 30px rgba(255,100,0,0.3))',
    }}>
      <svg width={160} height={500} viewBox="0 0 160 500" style={{ overflow: 'visible' }}>
        {/* Flame / Exhaust */}
        <path d={`M55 390 Q50 ${390 + flameLength * 0.6} ${80 + exhaust} ${390 + flameLength} Q${110 - exhaust} ${390 + flameLength * 0.6} 105 390`}
          fill="#ff4400" opacity={flamePulse * 0.9} />
        <path d={`M62 390 Q58 ${390 + flameLength * 0.5} ${80 + exhaust * 0.5} ${390 + flameLength * 0.8} Q${102 - exhaust * 0.5} ${390 + flameLength * 0.5} 98 390`}
          fill="#ff8800" opacity={flamePulse} />
        <path d={`M68 390 Q66 ${390 + flameLength * 0.35} 80 ${390 + flameLength * 0.6} Q94 ${390 + flameLength * 0.35} 92 390`}
          fill="#ffcc33" opacity={flamePulse} />
        <path d={`M74 390 Q73 ${390 + flameLength * 0.2} 80 ${390 + flameLength * 0.35} Q87 ${390 + flameLength * 0.2} 86 390`}
          fill="#fff8e0" opacity={flamePulse * 0.8} />

        {/* Smoke particles */}
        {[0, 1, 2, 3, 4].map(i => {
          const smokeY = 390 + flameLength + i * 20 + Math.sin(time * 3 + i) * 10;
          const smokeX = 80 + Math.sin(time * 2 + i * 1.5) * (15 + i * 8);
          const smokeOp = Math.max(0, 0.2 - i * 0.04);
          return (
            <circle key={i} cx={smokeX} cy={smokeY} r={8 + i * 5}
              fill="#887766" opacity={smokeOp} />
          );
        })}

        {/* Fins — 3 fins */}
        <path d="M55 350 L20 400 L30 405 L55 380 Z" fill="#cc3333" stroke="#aa2222" strokeWidth={1} />
        <path d="M105 350 L140 400 L130 405 L105 380 Z" fill="#cc3333" stroke="#aa2222" strokeWidth={1} />
        <path d="M75 360 L80 400 L85 360 Z" fill="#bb2222" stroke="#992222" strokeWidth={1} opacity={0.6} />

        {/* Nozzle */}
        <path d="M55 370 Q55 390 50 395 L110 395 Q105 390 105 370" fill="#444" stroke="#666" strokeWidth={1} />
        <ellipse cx={80} cy={390} rx={28} ry={6} fill="#333" stroke="#555" strokeWidth={1} />

        {/* Body tube */}
        <rect x={50} y={100} width={60} height={275} rx={5} fill="url(#rocketBody)" stroke="#ddd" strokeWidth={1.5} />

        {/* Body stripe */}
        <rect x={50} y={200} width={60} height={30} fill="#cc3333" stroke="#aa2222" strokeWidth={0.5} />
        <rect x={50} y={240} width={60} height={8} fill="#224488" />

        {/* Window */}
        <circle cx={80} cy={170} r={15} fill="#1a2a44" stroke="#4488bb" strokeWidth={2} />
        <circle cx={80} cy={170} r={12} fill="#223355" />
        <ellipse cx={75} cy={165} rx={5} ry={4} fill="rgba(100,180,255,0.4)" />

        {/* Nose cone */}
        <path d="M50 100 Q50 60 80 25 Q110 60 110 100" fill="url(#noseCone)" stroke="#ddd" strokeWidth={1.5} />
        {/* Nose tip */}
        <circle cx={80} cy={28} r={4} fill="#cc3333" />

        {/* Panel details */}
        <line x1={55} y1={140} x2={105} y2={140} stroke="#ccc" strokeWidth={0.5} opacity={0.5} />
        <line x1={55} y1={280} x2={105} y2={280} stroke="#ccc" strokeWidth={0.5} opacity={0.5} />
        <line x1={55} y1={320} x2={105} y2={320} stroke="#ccc" strokeWidth={0.5} opacity={0.5} />

        {/* Text on body */}
        <text x={80} y={265} textAnchor="middle" fontSize={10} fill="#fff" fontFamily="Arial" opacity={0.7}>V-II</text>

        <defs>
          <linearGradient id="rocketBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ccc" />
            <stop offset="30%" stopColor="#eee" />
            <stop offset="70%" stopColor="#eee" />
            <stop offset="100%" stopColor="#bbb" />
          </linearGradient>
          <linearGradient id="noseCone" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#bbb" />
            <stop offset="40%" stopColor="#ddd" />
            <stop offset="100%" stopColor="#aaa" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// ---- Nebula background glow ----
const Nebula: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame / 30;
  const d1 = Math.sin(time * 0.15) * 40;
  const d2 = Math.sin(time * 0.1 + 2) * 30;
  return (
    <>
      <div style={{ position: 'absolute', left: -100 + d1, top: 200, width: 600, height: 500,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,10,60,0.4), transparent 70%)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', right: -150 + d2, top: -100, width: 700, height: 600,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,30,60,0.35), transparent 70%)', filter: 'blur(90px)' }} />
      <div style={{ position: 'absolute', left: 600, bottom: -200, width: 500, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(40,15,30,0.25), transparent 70%)', filter: 'blur(70px)' }} />
    </>
  );
};

// ---- Main Scene ----
const SVGShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animations
  const astroIn = spring({ frame, fps, delay: 15, config: { damping: 200 }, durationInFrames: 40 });
  const shipIn = spring({ frame, fps, delay: 45, config: { damping: 200 }, durationInFrames: 40 });
  const rocketIn = spring({ frame, fps, delay: 75, config: { damping: 200 }, durationInFrames: 40 });

  const astroY = interpolate(astroIn, [0, 1], [100, 0]);
  const shipY = interpolate(shipIn, [0, 1], [80, 0]);
  const rocketY = interpolate(rocketIn, [0, 1], [120, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#060612', overflow: 'hidden' }}>
      <Nebula />
      <Starfield />

      {/* Astronaut — left */}
      <div style={{ opacity: astroIn, transform: `translateY(${astroY}px)` }}>
        <Astronaut frame={frame} x={80} y={280} scale={0.9} />
      </div>

      {/* Spaceship — center right */}
      <div style={{ opacity: shipIn, transform: `translateY(${shipY}px)` }}>
        <Spaceship frame={frame} x={500} y={150} scale={1.1} />
      </div>

      {/* Rocket — right */}
      <div style={{ opacity: rocketIn, transform: `translateY(${rocketY}px)` }}>
        <Rocket frame={frame} x={1300} y={80} scale={1.0} />
      </div>

      {/* Labels */}
      <div style={{ position: 'absolute', left: 120, bottom: 120, fontSize: 28, color: '#88aacc',
        fontFamily: 'Georgia, serif', letterSpacing: 4, opacity: astroIn,
        textShadow: '0 0 15px rgba(100,180,255,0.4)' }}>
        ASTRONAUT
      </div>
      <div style={{ position: 'absolute', left: 620, bottom: 120, fontSize: 28, color: '#88aacc',
        fontFamily: 'Georgia, serif', letterSpacing: 4, opacity: shipIn,
        textShadow: '0 0 15px rgba(100,180,255,0.4)' }}>
        SPACECRAFT
      </div>
      <div style={{ position: 'absolute', left: 1310, bottom: 120, fontSize: 28, color: '#88aacc',
        fontFamily: 'Georgia, serif', letterSpacing: 4, opacity: rocketIn,
        textShadow: '0 0 15px rgba(100,180,255,0.4)' }}>
        ROCKET
      </div>

      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%)',
        pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

export const SVGShowcaseComp: React.FC = () => (
  <Composition
    id="SVGShowcase"
    component={SVGShowcase}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default SVGShowcase;
