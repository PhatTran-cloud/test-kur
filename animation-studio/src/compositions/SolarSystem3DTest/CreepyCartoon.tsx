import React from 'react';
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
// Creepy Cartoon — Tim Burton / Coraline / Over the Garden Wall
// Big hollow eyes, wide grins, lantern glow, shadow creatures
// Chibi-horror proportions: big head (~40% of height), small body
// ============================================================

// ---- Shadow Creature (background silhouette) ----
const ShadowCreature: React.FC<{
  x: number; y: number; scale?: number; variant: number; frame: number;
}> = ({ x, y, scale = 1, variant, frame }) => {
  const time = frame / 30;
  const sway = Math.sin(time * 0.4 + variant * 2) * 8;
  const armReach = Math.sin(time * 0.6 + variant) * 12;
  const headTilt = Math.sin(time * 0.3 + variant * 1.5) * 5;

  // Different creature shapes
  const creatures = [
    // Tall slender figure with long arms
    () => (
      <g transform={`translate(${x + sway}, ${y}) scale(${scale})`} opacity={0.15}>
        {/* Body — tall, thin */}
        <path d={`M0 0 Q-8 -60 -5 -120 Q-3 -180 0 -220 Q3 -180 5 -120 Q8 -60 0 0 Z`}
          fill="#0a0a10" />
        {/* Head — elongated */}
        <ellipse cx={0} cy={-235 + headTilt} rx={18} ry={22} fill="#0a0a10" />
        {/* Long arms reaching */}
        <path d={`M-5 -160 Q${-35 + armReach} -140 ${-55 + armReach} -110 Q${-65 + armReach} -95 ${-70 + armReach} -80`}
          fill="none" stroke="#0a0a10" strokeWidth={6} strokeLinecap="round" />
        <path d={`M5 -150 Q${30 - armReach * 0.5} -120 ${45 - armReach * 0.5} -90`}
          fill="none" stroke="#0a0a10" strokeWidth={5} strokeLinecap="round" />
        {/* Fingers — spindly */}
        {[-8, -3, 2, 7].map((dx, i) => (
          <line key={i} x1={-70 + armReach} y1={-80} x2={-78 + armReach + dx} y2={-65 + i * 2}
            stroke="#0a0a10" strokeWidth={2} strokeLinecap="round" />
        ))}
      </g>
    ),
    // Hunched beast
    () => (
      <g transform={`translate(${x + sway * 0.5}, ${y}) scale(${scale})`} opacity={0.12}>
        <path d={`M-30 0 Q-40 -40 -35 -80 Q-30 -110 -15 -130 Q0 -145 15 -130 Q30 -110 35 -80 Q40 -40 30 0 Z`}
          fill="#080810" />
        {/* Humped back */}
        <path d={`M-20 -120 Q0 -160 20 -120`} fill="#080810" />
        {/* Head — small, jutting forward */}
        <ellipse cx={-25 + headTilt} cy={-125} rx={14} ry={12} fill="#080810" />
        {/* Dangling arms */}
        <path d={`M-30 -90 Q${-50 + armReach * 0.3} -60 ${-45 + armReach * 0.3} -30`}
          fill="none" stroke="#080810" strokeWidth={7} strokeLinecap="round" />
        <path d={`M25 -85 Q${40 - armReach * 0.3} -55 ${38 - armReach * 0.3} -25`}
          fill="none" stroke="#080810" strokeWidth={6} strokeLinecap="round" />
      </g>
    ),
    // Spidery multi-limbed thing
    () => (
      <g transform={`translate(${x + sway * 0.7}, ${y}) scale(${scale})`} opacity={0.13}>
        <ellipse cx={0} cy={-80} rx={22} ry={18} fill="#090910" />
        {/* Many legs/arms */}
        {[-40, -25, -10, 10, 25, 40].map((angle, i) => {
          const a = ((angle + armReach * (i % 2 ? 0.3 : -0.3)) * Math.PI) / 180;
          const len = 60 + (i % 3) * 15;
          return (
            <path key={i}
              d={`M${Math.sin(a) * 20} ${-80 + Math.cos(a) * 15} Q${Math.sin(a) * len * 0.6} ${-80 + Math.cos(a) * len * 0.6 + 20} ${Math.sin(a) * len} ${-80 + Math.cos(a) * len + 30}`}
              fill="none" stroke="#090910" strokeWidth={4} strokeLinecap="round" />
          );
        })}
      </g>
    ),
  ];

  return creatures[variant % 3]();
};

// ---- Creepy Boy with Lantern (v3 — exaggerated proportions like reference) ----
// Reference: head = 60% height, body tiny + thin, short legs, bobblehead horror
const CreepyBoy: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const b = Math.sin(time * 1.3) * 1.5;
  const hb = Math.sin(time * 0.8) * 1.5;
  const blink = Math.sin(time * 2.5) > 0.94 ? 1 : 0;
  const ls = Math.sin(time * 1.0) * 4;
  const lf = 0.7 + Math.sin(time * 6) * 0.15 + Math.sin(time * 9) * 0.1;
  const mt = Math.sin(time * 1.5) * 1;
  const hw = Math.sin(time * 0.8) * 3;
  const ep = 0.6 + Math.sin(time * 2.5) * 0.3;
  const bodySway = Math.sin(time * 0.6) * 1;
  const OL = '#111';
  const OW = 2.5;

  // Layout: head center at (200, 120), body starts at ~240, total height ~480
  // Head: r=100 → 200px diameter = ~42% of 480
  // Body: only 100px tall, legs: 80px
  const headCX = 200;
  const headCY = 120;
  const headR = 100;
  const neckY = headCY + headR - 15; // ~205
  const bodyTop = neckY + 15; // ~220
  const bodyBot = bodyTop + 95; // ~315
  const legBot = bodyBot + 85; // ~400

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${scale})`,
    }}>
      <svg width={420} height={440} viewBox="0 0 420 440" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="lglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffaa33" stopOpacity={lf * 0.45} />
            <stop offset="50%" stopColor="#ff8811" stopOpacity={lf * 0.15} />
            <stop offset="100%" stopColor="#ff6600" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Lantern area glow */}
        <circle cx={310 + ls} cy={220 + b} r={180} fill="url(#lglow)" />

        {/* ====== LEGS — short, thin ====== */}
        <path d={`M180 ${bodyBot + b} L174 ${bodyBot + 50 + b} L172 ${legBot + b}`}
          fill="none" stroke="#3a4550" strokeWidth={14} strokeLinecap="round" />
        <path d={`M215 ${bodyBot + b} L221 ${bodyBot + 50 + b} L223 ${legBot + b}`}
          fill="none" stroke="#3a4550" strokeWidth={14} strokeLinecap="round" />
        {/* Outline */}
        <path d={`M180 ${bodyBot + b} L174 ${bodyBot + 50 + b} L172 ${legBot + b}`}
          fill="none" stroke={OL} strokeWidth={16} strokeLinecap="round" opacity={0.12} />
        <path d={`M215 ${bodyBot + b} L221 ${bodyBot + 50 + b} L223 ${legBot + b}`}
          fill="none" stroke={OL} strokeWidth={16} strokeLinecap="round" opacity={0.12} />
        {/* Shoes — round, chunky relative to thin legs */}
        <ellipse cx={168} cy={legBot + 4 + b} rx={16} ry={7} fill="#2a1f15" stroke={OL} strokeWidth={OW} />
        <ellipse cx={227} cy={legBot + 4 + b} rx={16} ry={7} fill="#2a1f15" stroke={OL} strokeWidth={OW} />

        {/* ====== TORSO — small, narrow ====== */}
        {/* Jacket body — tapered, slightly A-line */}
        <path d={`M155 ${bodyTop + b + bodySway} Q148 ${bodyTop + 30 + b} 145 ${bodyTop + 60 + b} Q143 ${bodyBot - 5 + b} 148 ${bodyBot + b} L247 ${bodyBot + b} Q252 ${bodyBot - 5 + b} 250 ${bodyTop + 60 + b} Q247 ${bodyTop + 30 + b} 240 ${bodyTop + b - bodySway} Z`}
          fill="#4a6050" stroke={OL} strokeWidth={OW} strokeLinejoin="round" />

        {/* Shirt underneath — visible stripe through center gap */}
        <rect x={180} y={bodyTop + 5 + b} width={35} height={85} rx={2} fill="#6a7a70" />
        {[0, 1, 2, 3].map(i => (
          <rect key={i} x={182} y={bodyTop + 12 + i * 18 + b} width={31} height={6} rx={1}
            fill="#556a5a" />
        ))}

        {/* Jacket lapels / collar overlap */}
        <path d={`M168 ${bodyTop + b} L190 ${bodyTop + 25 + b} L197 ${bodyTop + b}`}
          fill="#5a7060" stroke={OL} strokeWidth={1.5} />
        <path d={`M227 ${bodyTop + b} L205 ${bodyTop + 25 + b} L197 ${bodyTop + b}`}
          fill="#5a7060" stroke={OL} strokeWidth={1.5} />

        {/* Jacket pocket (small) */}
        <rect x={218} y={bodyTop + 45 + b} width={18} height={14} rx={2} fill="none" stroke={OL} strokeWidth={1.2} />

        {/* ====== LEFT ARM — thin, dangling ====== */}
        <path d={`M155 ${bodyTop + 5 + b} Q140 ${bodyTop + 40 + b} 135 ${bodyTop + 70 + b}`}
          fill="none" stroke="#4a6050" strokeWidth={14} strokeLinecap="round" />
        {/* Forearm */}
        <path d={`M135 ${bodyTop + 70 + b} Q130 ${bodyTop + 85 + b} 132 ${bodyBot + 5 + b}`}
          fill="none" stroke="#4a6050" strokeWidth={11} strokeLinecap="round" />
        {/* Hand */}
        <circle cx={132} cy={bodyBot + 8 + b} r={8} fill="#c4b8a0" stroke={OL} strokeWidth={1.5} />
        {/* Fingers */}
        {[-18, -6, 6, 15].map((a, i) => {
          const ra = ((a + 85) * Math.PI) / 180;
          return <line key={i} x1={132 + Math.cos(ra) * 6} y1={bodyBot + 8 + b + Math.sin(ra) * 6}
            x2={132 + Math.cos(ra) * 13} y2={bodyBot + 8 + b + Math.sin(ra) * 13}
            stroke="#c4b8a0" strokeWidth={3} strokeLinecap="round" />;
        })}

        {/* ====== RIGHT ARM — holding lantern UP high ====== */}
        {/* Upper arm */}
        <path d={`M240 ${bodyTop + 5 + b} Q262 ${bodyTop - 5 + b} 278 ${bodyTop - 20 + b}`}
          fill="none" stroke="#4a6050" strokeWidth={14} strokeLinecap="round" />
        {/* Forearm going up */}
        <path d={`M278 ${bodyTop - 20 + b} Q295 ${bodyTop - 35 + b} ${302 + ls} ${bodyTop - 50 + b}`}
          fill="none" stroke="#4a6050" strokeWidth={11} strokeLinecap="round" />
        {/* Fist */}
        <circle cx={304 + ls} cy={bodyTop - 52 + b} r={9} fill="#c4b8a0" stroke={OL} strokeWidth={1.5} />
        <path d={`M${298 + ls} ${bodyTop - 55 + b} Q${296 + ls} ${bodyTop - 52 + b} ${298 + ls} ${bodyTop - 49 + b}`}
          fill="none" stroke="#a89878" strokeWidth={1.2} />

        {/* ====== LANTERN ====== */}
        <g transform={`translate(${304 + ls}, ${bodyTop - 42 + b})`}>
          <path d="M-7 -3 Q0 -14 7 -3" fill="none" stroke="#554430" strokeWidth={2.5} strokeLinecap="round" />
          <rect x={-12} y={0} width={24} height={5} rx={2} fill="#554430" stroke={OL} strokeWidth={1.2} />
          <path d="M-3 0 L-2.5 -5 L2.5 -5 L3 0" fill="#443322" stroke={OL} strokeWidth={0.8} />
          <path d="M-13 5 L-15 38 Q-15 42 -11 42 L11 42 Q15 42 15 38 L13 5 Z"
            fill="rgba(255,180,60,0.08)" stroke="#665533" strokeWidth={1.8} />
          <line x1={-7} y1={5} x2={-8} y2={42} stroke="#665533" strokeWidth={0.6} opacity={0.5} />
          <line x1={0} y1={5} x2={0} y2={42} stroke="#665533" strokeWidth={0.6} opacity={0.5} />
          <line x1={7} y1={5} x2={8} y2={42} stroke="#665533" strokeWidth={0.6} opacity={0.5} />
          <line x1={-14} y1={23} x2={14} y2={23} stroke="#665533" strokeWidth={0.8} />
          {/* Flame */}
          <path d={`M0 18 Q${-4 + Math.sin(time * 8) * 2} 12 0 ${6 + Math.sin(time * 10) * 1.5} Q${4 + Math.sin(time * 7) * 2} 12 0 18 Z`}
            fill={`rgba(255,200,80,${lf})`} />
          <path d={`M0 20 Q-1.5 16 0 ${12 + Math.sin(time * 12) * 1} Q1.5 16 0 20 Z`}
            fill={`rgba(255,245,200,${lf * 0.8})`} />
          <circle cx={0} cy={18} r={18} fill={`rgba(255,180,50,${lf * 0.12})`} />
          <circle cx={0} cy={18} r={40} fill={`rgba(255,160,40,${lf * 0.04})`} />
          <rect x={-14} y={42} width={28} height={5} rx={2} fill="#554430" stroke={OL} strokeWidth={1.2} />
        </g>

        {/* ====== NECK — thin ====== */}
        <rect x={188} y={neckY + b + hb} width={20} height={16} rx={4} fill="#c4b8a0" stroke={OL} strokeWidth={1.5} />

        {/* ====== HEAD — MASSIVE ====== */}
        <g transform={`translate(${headCX}, ${headCY + b + hb})`}>
          {/* Face — big round circle with slight chin */}
          <path d={`M${-headR} 5 Q${-headR - 3} -35 ${-headR + 10} -65 Q${-headR + 25} ${-headR} ${-headR + 55} ${-headR - 10} Q${-15} ${-headR - 15} 0 ${-headR - 15} Q15 ${-headR - 15} ${headR - 55} ${-headR - 10} Q${headR - 25} ${-headR} ${headR - 10} -65 Q${headR + 3} -35 ${headR} 5 Q${headR - 3} 40 ${headR - 18} 62 Q${headR - 35} 78 ${headR - 60} 88 Q15 95 0 96 Q-15 95 ${-headR + 60} 88 Q${-headR + 35} 78 ${-headR + 18} 62 Q${-headR + 3} 40 ${-headR} 5 Z`}
            fill="#c4b8a0" stroke={OL} strokeWidth={3} strokeLinejoin="round" />

          {/* Warm side-light from lantern */}
          <ellipse cx={40} cy={0} rx={60} ry={70} fill="rgba(255,190,100,0.05)" />

          {/* ====== EYES ====== */}
          {/* Socket hollows */}
          <circle cx={-30} cy={-8} r={34} fill="#1a1015" />
          <circle cx={30} cy={-8} r={34} fill="#1a1015" />
          {/* Bruise rings */}
          <circle cx={-30} cy={-8} r={38} fill="none" stroke="rgba(50,30,40,0.4)" strokeWidth={6} />
          <circle cx={30} cy={-8} r={38} fill="none" stroke="rgba(50,30,40,0.4)" strokeWidth={6} />

          {!blink ? <>
            {/* Big white eyeballs */}
            <circle cx={-30} cy={-8} r={28} fill="#e2ded6" stroke={OL} strokeWidth={2} />
            <circle cx={30} cy={-8} r={28} fill="#e2ded6" stroke={OL} strokeWidth={2} />
            {/* Small iris = vacant creepy stare */}
            <circle cx={-27} cy={-4} r={9} fill={`rgba(200,50,30,${ep})`} />
            <circle cx={33} cy={-4} r={9} fill={`rgba(200,50,30,${ep})`} />
            {/* Tiny pupil */}
            <circle cx={-26} cy={-3} r={5} fill="#0a0505" />
            <circle cx={34} cy={-3} r={5} fill="#0a0505" />
            {/* Eye shine */}
            <circle cx={-34} cy={-16} r={5} fill="#fff" opacity={0.8} />
            <circle cx={26} cy={-16} r={5} fill="#fff" opacity={0.8} />
            <circle cx={-22} cy={2} r={2.5} fill="#fff" opacity={0.25} />
            <circle cx={38} cy={2} r={2.5} fill="#fff" opacity={0.25} />
            {/* Red glow */}
            <circle cx={-30} cy={-8} r={40} fill={`rgba(200,50,30,${ep * 0.04})`} />
            <circle cx={30} cy={-8} r={40} fill={`rgba(200,50,30,${ep * 0.04})`} />
          </> : <>
            <path d="M-55 -8 Q-30 2 -5 -8" fill="none" stroke={OL} strokeWidth={3} strokeLinecap="round" />
            <path d="M5 -8 Q30 2 55 -8" fill="none" stroke={OL} strokeWidth={3} strokeLinecap="round" />
          </>}

          {/* Eyebrows */}
          <path d="M-58 -48 Q-30 -58 -2 -48" fill="none" stroke="#3a2a1a" strokeWidth={3.5} strokeLinecap="round" />
          <path d="M2 -48 Q30 -58 58 -48" fill="none" stroke="#3a2a1a" strokeWidth={3.5} strokeLinecap="round" />

          {/* Nose — tiny */}
          <path d="M-2 22 L-4 32 Q-7 36 -10 37 Q-5 40 0 39 Q5 40 10 37 Q7 36 4 32 L2 22"
            fill="none" stroke="#9a8570" strokeWidth={1.5} />

          {/* ====== MOUTH — wide menacing grin ====== */}
          <g transform={`translate(0, ${55 + mt})`}>
            <path d={`M-48 -2 Q-30 ${18 + mt} 0 ${20 + mt} Q30 ${18 + mt} 48 -2 Q30 -6 0 -7 Q-30 -6 -48 -2 Z`}
              fill="#0e0808" stroke={OL} strokeWidth={3} />
            {/* Upper teeth */}
            {[
              { x: -38, w: 10, h: 10 },
              { x: -26, w: 11, h: 13 },
              { x: -13, w: 12, h: 15 },
              { x: 1, w: 12, h: 15 },
              { x: 15, w: 11, h: 13 },
              { x: 28, w: 10, h: 10 },
            ].map((t, i) => (
              <path key={`ut-${i}`}
                d={`M${t.x} -2 L${t.x + 1} ${t.h - 2} L${t.x + t.w - 1} ${t.h - 2} L${t.x + t.w} -2`}
                fill="#d5cfc0" stroke="#b0a898" strokeWidth={0.8} />
            ))}
            {/* Lower teeth */}
            {[
              { x: -30, w: 12, h: 8 },
              { x: -14, w: 11, h: 10 },
              { x: 3, w: 11, h: 10 },
              { x: 18, w: 12, h: 8 },
            ].map((t, i) => (
              <path key={`lt-${i}`}
                d={`M${t.x} ${15 + mt} L${t.x + t.w / 2} ${15 + mt - t.h} L${t.x + t.w} ${15 + mt}`}
                fill="#ccc8b8" stroke="#b0a898" strokeWidth={0.8} />
            ))}
            <path d={`M-45 0 Q0 4 45 0`} fill="none" stroke="#5a2a2a" strokeWidth={1} opacity={0.3} />
          </g>

          {/* ====== HAIR ====== */}
          <path d={`M-72 -15 Q-75 -55 -65 -85 Q-50 -108 -15 -115 Q10 -118 35 -112 Q60 -105 72 -78 Q78 -55 75 -25 L62 -30 Q58 -50 50 -68 Q35 -90 5 -95 Q-25 -93 -42 -75 Q-58 -55 -55 -30 Z`}
            fill="#3a2a1a" stroke={OL} strokeWidth={2.5} />
          {/* Spikes */}
          <path d={`M-50 -80 Q${-65 + hw} -108 ${-55 + hw} -128`} fill="none" stroke="#3a2a1a" strokeWidth={12} strokeLinecap="round" />
          <path d={`M-25 -98 Q${-33 + hw} -125 ${-22 + hw} -142`} fill="none" stroke="#3a2a1a" strokeWidth={11} strokeLinecap="round" />
          <path d={`M5 -105 Q${10 + hw} -135 ${22 + hw} -150`} fill="none" stroke="#3a2a1a" strokeWidth={12} strokeLinecap="round" />
          <path d={`M32 -100 Q${44 + hw} -125 ${48 + hw} -140`} fill="none" stroke="#3a2a1a" strokeWidth={10} strokeLinecap="round" />
          <path d={`M55 -82 Q${68 + hw * 0.5} -105 ${64 + hw * 0.5} -122`} fill="none" stroke="#3a2a1a" strokeWidth={9} strokeLinecap="round" />
          {/* Spike outlines */}
          <path d={`M-50 -80 Q${-65 + hw} -108 ${-55 + hw} -128`} fill="none" stroke={OL} strokeWidth={13} strokeLinecap="round" opacity={0.12} />
          <path d={`M5 -105 Q${10 + hw} -135 ${22 + hw} -150`} fill="none" stroke={OL} strokeWidth={13} strokeLinecap="round" opacity={0.12} />
          {/* Bangs */}
          <path d={`M-45 -50 Q-38 -28 -50 -18`} fill="none" stroke="#3a2a1a" strokeWidth={10} strokeLinecap="round" />
          <path d={`M-22 -62 Q-16 -40 -26 -30`} fill="none" stroke="#3a2a1a" strokeWidth={9} strokeLinecap="round" />
          <path d={`M45 -55 Q50 -35 58 -25`} fill="none" stroke="#3a2a1a" strokeWidth={9} strokeLinecap="round" />
          {/* Highlight */}
          <path d="M-35 -88 Q-28 -80 -32 -68" fill="none" stroke="#4a3a28" strokeWidth={1.8} opacity={0.35} />

          {/* Ears */}
          <path d={`M-78 0 Q-88 -12 -85 -28 Q-82 -14 -78 0 Z`} fill="#b8a890" stroke={OL} strokeWidth={OW} />
          <path d={`M78 0 Q88 -12 85 -28 Q82 -14 78 0 Z`} fill="#b8a890" stroke={OL} strokeWidth={OW} />

          {/* Smudges */}
          <ellipse cx={-48} cy={35} rx={8} ry={4} fill="rgba(60,50,40,0.12)" transform="rotate(-10 -48 35)" />
          <ellipse cx={50} cy={20} rx={7} ry={3} fill="rgba(60,50,40,0.08)" transform="rotate(8 50 20)" />
        </g>

        {/* Shadow */}
        <ellipse cx={headCX} cy={legBot + 12 + b} rx={42} ry={5} fill="rgba(0,0,0,0.3)" />
      </svg>
    </div>
  );
};

// ---- Main Scene ----
const CreepyCartoonScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const time = frame / 30;

  const charIn = spring({ frame, fps, delay: 10, config: { damping: 200, mass: 2 }, durationInFrames: 60 });
  const creaturesIn = interpolate(frame, [30, 80], [0, 1], EC);

  // Fog drift
  const fog1X = Math.sin(time * 0.1) * 100;
  const fog2X = Math.sin(time * 0.08 + 2) * 80;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0c10', overflow: 'hidden' }}>
      {/* Background — dark teal-ish gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 60% 40%, #0f1520 0%, #080a10 50%, #050608 100%)',
      }} />

      {/* Shadow creatures — background */}
      <div style={{ opacity: creaturesIn }}>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
          <ShadowCreature x={150} y={750} scale={2.5} variant={0} frame={frame} />
          <ShadowCreature x={450} y={800} scale={2.0} variant={1} frame={frame} />
          <ShadowCreature x={1400} y={780} scale={2.3} variant={2} frame={frame} />
          <ShadowCreature x={1650} y={760} scale={2.8} variant={0} frame={frame} />
          <ShadowCreature x={800} y={820} scale={1.8} variant={1} frame={frame} />
        </svg>
      </div>

      {/* Ground fog layers */}
      <div style={{
        position: 'absolute', bottom: 50, left: -200 + fog1X, width: 2400, height: 120,
        background: 'linear-gradient(to top, rgba(15,20,25,0.5), transparent)',
        filter: 'blur(30px)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: -300 + fog2X, width: 2500, height: 150,
        background: 'linear-gradient(to top, rgba(10,15,20,0.7), transparent)',
        filter: 'blur(40px)',
      }} />

      {/* The creepy boy — center */}
      <div style={{
        opacity: charIn,
        transform: `translateY(${interpolate(charIn, [0, 1], [50, 0])}px)`,
      }}>
        <CreepyBoy frame={frame} x={580} y={100} scale={1.8} />
      </div>

      {/* Ground surface hint */}
      <div style={{
        position: 'absolute', bottom: 90, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent 5%, rgba(30,35,40,0.3) 30%, rgba(30,35,40,0.3) 70%, transparent 95%)',
      }} />

      {/* Dust particles in lantern light */}
      <svg width={1920} height={1080} viewBox="0 0 1920 1080"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 15 }, (_, i) => {
          const seed = i * 97.3;
          const px = 850 + Math.sin(time * 0.5 + seed) * 150;
          const py = 250 + Math.cos(time * 0.3 + seed * 0.7) * 200;
          const op = 0.06 + Math.sin(time * 2 + i) * 0.04;
          return (
            <circle key={i} cx={px} cy={py} r={1.5 + (i % 3) * 0.5}
              fill="#ffcc66" opacity={op} />
          );
        })}
      </svg>

      {/* Heavy vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 55% 45%, transparent 20%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.9) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Subtle film grain / noise overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.02) 3px, rgba(0,0,0,0.02) 6px)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};

// ---- Creepy Stickman with Lantern ----
const CreepyStickBoy: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const breathe = Math.sin(time * 1.2) * 2;
  const headBob = Math.sin(time * 0.7) * 2;
  const walkCycle = Math.sin(time * 2) * 12;
  const armSwing = Math.sin(time * 1.5) * 8;
  const lanternSwing = Math.sin(time * 1.0) * 5;
  const lanternFlicker = 0.7 + Math.sin(time * 7) * 0.15 + Math.sin(time * 11) * 0.1;
  const eyePulse = 0.6 + Math.sin(time * 2.5) * 0.3;
  const blink = Math.sin(time * 2.8) > 0.95 ? 1 : 0;
  const headTilt = Math.sin(time * 0.5) * 4;

  const rad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Lantern glow — large area */}
      <circle cx={65 + lanternSwing} cy={-30 + breathe} r={200}
        fill={`rgba(255,170,50,${lanternFlicker * 0.04})`} />
      <circle cx={65 + lanternSwing} cy={-30 + breathe} r={100}
        fill={`rgba(255,180,60,${lanternFlicker * 0.08})`} />

      {/* Shadow on ground */}
      <ellipse cx={0} cy={105} rx={40} ry={5} fill="rgba(0,0,0,0.35)" />

      {/* ── LEGS — stick style but with slight thickness ── */}
      <line x1={-5} y1={40 + breathe} x2={-12 + walkCycle * 0.3} y2={75} stroke="#888" strokeWidth={4} strokeLinecap="round" />
      <line x1={-12 + walkCycle * 0.3} y1={75} x2={-15 + walkCycle * 0.5} y2={100} stroke="#888" strokeWidth={4} strokeLinecap="round" />
      <line x1={5} y1={40 + breathe} x2={12 - walkCycle * 0.3} y2={75} stroke="#888" strokeWidth={4} strokeLinecap="round" />
      <line x1={12 - walkCycle * 0.3} y1={75} x2={15 - walkCycle * 0.5} y2={100} stroke="#888" strokeWidth={4} strokeLinecap="round" />

      {/* Feet — small */}
      <ellipse cx={-15 + walkCycle * 0.5} cy={102} rx={8} ry={3} fill="#555" />
      <ellipse cx={15 - walkCycle * 0.5} cy={102} rx={8} ry={3} fill="#555" />

      {/* ── SPINE ── */}
      <line x1={0} y1={-35 + breathe + headBob} x2={0} y2={40 + breathe} stroke="#888" strokeWidth={4.5} strokeLinecap="round" />

      {/* ── LEFT ARM (dangling) ── */}
      <line x1={-3} y1={-25 + breathe} x2={-18 - armSwing * 0.5} y2={5 + breathe} stroke="#888" strokeWidth={3.5} strokeLinecap="round" />
      <line x1={-18 - armSwing * 0.5} y1={5 + breathe} x2={-22 - armSwing * 0.3} y2={30 + breathe} stroke="#888" strokeWidth={3.5} strokeLinecap="round" />
      {/* Hand */}
      <circle cx={-22 - armSwing * 0.3} cy={32 + breathe} r={4} fill="#999" />

      {/* ── RIGHT ARM (holding lantern up) ── */}
      <line x1={3} y1={-25 + breathe} x2={30} y2={-40 + breathe} stroke="#888" strokeWidth={3.5} strokeLinecap="round" />
      <line x1={30} y1={-40 + breathe} x2={55 + lanternSwing} y2={-50 + breathe} stroke="#888" strokeWidth={3.5} strokeLinecap="round" />
      {/* Fist */}
      <circle cx={57 + lanternSwing} cy={-50 + breathe} r={4.5} fill="#999" />

      {/* ── LANTERN ── */}
      <g transform={`translate(${57 + lanternSwing}, ${-45 + breathe})`}>
        <path d="M-1 -6 Q0 -10 1 -6" fill="none" stroke="#886633" strokeWidth={1.5} />
        <rect x={-7} y={0} width={14} height={3} rx={1} fill="#665533" />
        <rect x={-8} y={3} width={16} height={22} rx={2} fill="rgba(255,180,60,0.1)" stroke="#665533" strokeWidth={1.2} />
        {/* Flame */}
        <path d={`M0 10 Q${-2 + Math.sin(time * 9) * 1.5} 6 0 ${4 + Math.sin(time * 11) * 1} Q${2 + Math.sin(time * 8) * 1.5} 6 0 10 Z`}
          fill={`rgba(255,200,80,${lanternFlicker})`} />
        <line x1={-8} y1={14} x2={8} y2={14} stroke="#665533" strokeWidth={0.6} />
        <line x1={0} y1={3} x2={0} y2={25} stroke="#665533" strokeWidth={0.6} />
        <rect x={-8} y={25} width={16} height={3} rx={1} fill="#665533" />
      </g>

      {/* ── HEAD — large circle, creepy eyes ── */}
      <g transform={`rotate(${headTilt} 0 ${-55 + breathe + headBob})`}>
        <circle cx={0} cy={-55 + breathe + headBob} r={22} fill="#0c0c10" stroke="#777" strokeWidth={3} />

        {!blink ? <>
          {/* Big hollow eye sockets */}
          <ellipse cx={-8} cy={-58 + breathe + headBob} rx={8} ry={7} fill="#050508" />
          <ellipse cx={8} cy={-58 + breathe + headBob} rx={8} ry={7} fill="#050508" />

          {/* Eyeballs */}
          <ellipse cx={-8} cy={-58 + breathe + headBob} rx={6} ry={5.5} fill="#c8c4bc" />
          <ellipse cx={8} cy={-58 + breathe + headBob} rx={6} ry={5.5} fill="#c8c4bc" />

          {/* Small red irises = creepy stare */}
          <circle cx={-7} cy={-57 + breathe + headBob} r={2.5} fill="#cc3322" opacity={eyePulse} />
          <circle cx={9} cy={-57 + breathe + headBob} r={2.5} fill="#cc3322" opacity={eyePulse} />

          {/* Pupils */}
          <circle cx={-6.5} cy={-56.5 + breathe + headBob} r={1.3} fill="#111" />
          <circle cx={9.5} cy={-56.5 + breathe + headBob} r={1.3} fill="#111" />

          {/* Eye shine */}
          <circle cx={-9} cy={-60 + breathe + headBob} r={1.2} fill="#fff" opacity={0.6} />
          <circle cx={7} cy={-60 + breathe + headBob} r={1.2} fill="#fff" opacity={0.6} />

          {/* Eye glow */}
          <circle cx={-8} cy={-58 + breathe + headBob} r={14} fill={`rgba(200,50,30,${eyePulse * 0.04})`} />
          <circle cx={8} cy={-58 + breathe + headBob} r={14} fill={`rgba(200,50,30,${eyePulse * 0.04})`} />
        </> : <>
          {/* Blink — closed lines */}
          <line x1={-14} y1={-58 + breathe + headBob} x2={-2} y2={-58 + breathe + headBob} stroke="#555" strokeWidth={1.5} />
          <line x1={2} y1={-58 + breathe + headBob} x2={14} y2={-58 + breathe + headBob} stroke="#555" strokeWidth={1.5} />
        </>}

        {/* Wide creepy grin */}
        <path d={`M-14 ${-45 + breathe + headBob} Q-8 ${-38 + breathe + headBob} 0 ${-37 + breathe + headBob} Q8 ${-38 + breathe + headBob} 14 ${-45 + breathe + headBob}`}
          fill="#0a0808" stroke="#555" strokeWidth={1} />
        {/* Teeth */}
        {[-10, -5, 0, 5, 10].map((tx, i) => (
          <line key={i} x1={tx} y1={-45 + breathe + headBob} x2={tx} y2={-40 + breathe + headBob + (i % 2) * 1.5}
            stroke="#bbb" strokeWidth={1} />
        ))}

        {/* Messy hair spikes */}
        {[-15, -8, 0, 8, 15].map((hx, i) => (
          <line key={i} x1={hx * 0.7} y1={-72 + breathe + headBob} x2={hx + Math.sin(time * 0.8 + i) * 2} y2={-82 - (i % 3) * 5 + breathe + headBob}
            stroke="#444" strokeWidth={3} strokeLinecap="round" />
        ))}
      </g>
    </g>
  );
};

// ---- Creepy Stickman Scene ----
const CreepyStickScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / 30;

  const mainIn = spring({ frame, fps, delay: 10, config: { damping: 200, mass: 1.5 }, durationInFrames: 50 });
  const creaturesIn = interpolate(frame, [20, 70], [0, 1], EC);

  const fog1X = Math.sin(time * 0.12) * 80;
  const fog2X = Math.sin(time * 0.09 + 1.5) * 60;

  return (
    <AbsoluteFill style={{ backgroundColor: '#08090d', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 45% 45%, #0d1018 0%, #080a0e 50%, #050607 100%)',
      }} />

      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="stickFogBlur"><feGaussianBlur stdDeviation="20" /></filter>
        </defs>

        {/* Dead trees */}
        {[180, 400, 700, 1200, 1500, 1750].map((tx, i) => {
          const h = 180 + (i % 3) * 60;
          return (
            <g key={i}>
              <line x1={tx} y1={780 - h} x2={tx + (i % 2 ? 3 : -3)} y2={780}
                stroke="#111116" strokeWidth={3 + (i % 2) * 2} strokeLinecap="round" />
              <line x1={tx} y1={780 - h * 0.6} x2={tx + (i % 2 ? 20 : -25)} y2={780 - h * 0.72}
                stroke="#111116" strokeWidth={2} strokeLinecap="round" />
              <line x1={tx} y1={780 - h * 0.35} x2={tx + (i % 2 ? -18 : 22)} y2={780 - h * 0.45}
                stroke="#111116" strokeWidth={1.5} strokeLinecap="round" />
            </g>
          );
        })}

        {/* Shadow creatures in background */}
        <g opacity={creaturesIn}>
          <ShadowCreature x={200} y={750} scale={2.2} variant={0} frame={frame} />
          <ShadowCreature x={550} y={780} scale={1.8} variant={2} frame={frame} />
          <ShadowCreature x={1350} y={760} scale={2.0} variant={1} frame={frame} />
          <ShadowCreature x={1600} y={740} scale={2.5} variant={0} frame={frame} />
        </g>

        {/* Ground fog */}
        <rect x={-100 + fog1X} y={730} width={2200} height={80} rx={40}
          fill="rgba(12,14,18,0.4)" filter="url(#stickFogBlur)" />
        <rect x={-200 + fog2X} y={760} width={2400} height={100} rx={50}
          fill="rgba(10,12,16,0.5)" filter="url(#stickFogBlur)" />

        {/* Main creepy stickman — center */}
        <g opacity={mainIn} transform={`translate(0, ${interpolate(mainIn, [0, 1], [40, 0])})`}>
          <CreepyStickBoy frame={frame} x={900} y={620} scale={3.2} />
        </g>

        {/* Distant stickman figures — barely visible, watching */}
        {[
          { x: 350, y: 640, s: 1.5, delay: 0.5 },
          { x: 1500, y: 650, s: 1.3, delay: 1.2 },
          { x: 250, y: 660, s: 1.0, delay: 2.0 },
          { x: 1650, y: 645, s: 1.1, delay: 0.8 },
        ].map((fig, i) => (
          <g key={i} opacity={creaturesIn * 0.35}>
            <CreepyStickBoy frame={frame} x={fig.x} y={fig.y} scale={fig.s} />
          </g>
        ))}

        {/* Dust particles */}
        {Array.from({ length: 20 }, (_, i) => {
          const seed = i * 73.7;
          const px = 700 + Math.sin(time * 0.4 + seed) * 250;
          const py = 300 + Math.cos(time * 0.3 + seed * 0.6) * 250;
          const op = 0.05 + Math.sin(time * 2 + i * 0.8) * 0.03;
          return <circle key={i} cx={px} cy={py} r={1.2 + (i % 3) * 0.4} fill="#ffcc66" opacity={op} />;
        })}
      </svg>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 47% 50%, transparent 18%, rgba(0,0,0,0.6) 55%, rgba(0,0,0,0.92) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Scan lines */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};

export const CreepyCartoonComp: React.FC = () => (
  <Composition
    id="CreepyCartoon"
    component={CreepyCartoonScene}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export const CreepyStickComp: React.FC = () => (
  <Composition
    id="CreepyStick"
    component={CreepyStickScene}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default CreepyCartoonScene;
