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
// Forest Horror Scene — 2D Creepy Cartoon + Abstract
// Dark forest, fog, tense atmosphere, clear subjects
// Style: Over the Garden Wall meets Limbo
// ============================================================

const OL = '#0a0a0a';
const OW = 2.5;

// ---- Tree (dead, twisted) ----
const DeadTree: React.FC<{
  x: number; y: number; height: number; lean?: number; branches?: number;
  color?: string; strokeW?: number; detail?: boolean;
}> = ({ x, y, height, lean = 0, branches = 3, color = '#2e3240', strokeW = 8, detail = true }) => {
  const branchData = Array.from({ length: branches }, (_, i) => {
    const bh = 0.2 + (i / branches) * 0.55;
    const side = i % 2 ? 1 : -1;
    const len = 30 + (i % 3) * 20;
    const droop = 10 + (i % 2) * 15;
    return { bh, side, len, droop };
  });

  return (
    <g>
      {/* Trunk */}
      <path d={`M${x} ${y} Q${x + lean * 0.5} ${y - height * 0.5} ${x + lean} ${y - height}`}
        fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      {/* Trunk taper line */}
      {detail && (
        <path d={`M${x + 1} ${y} Q${x + lean * 0.5 + 1} ${y - height * 0.5} ${x + lean} ${y - height}`}
          fill="none" stroke="#3a3f4d" strokeWidth={strokeW * 0.4} strokeLinecap="round" opacity={0.3} />
      )}
      {/* Branches */}
      {branchData.map((br, i) => {
        const bx = x + lean * br.bh;
        const by = y - height * br.bh;
        const endX = bx + br.side * br.len;
        const endY = by - 15 + br.droop;
        return (
          <g key={i}>
            <path d={`M${bx} ${by} Q${bx + br.side * br.len * 0.6} ${by - 10} ${endX} ${endY}`}
              fill="none" stroke={color} strokeWidth={strokeW * 0.5} strokeLinecap="round" />
            {/* Twig at end */}
            {detail && (
              <path d={`M${endX} ${endY} Q${endX + br.side * 8} ${endY - 5} ${endX + br.side * 15} ${endY + 3}`}
                fill="none" stroke={color} strokeWidth={strokeW * 0.25} strokeLinecap="round" />
            )}
          </g>
        );
      })}
      {/* Roots at base */}
      {detail && <>
        <path d={`M${x} ${y} Q${x - 12} ${y + 5} ${x - 20} ${y + 3}`}
          fill="none" stroke={color} strokeWidth={strokeW * 0.4} strokeLinecap="round" />
        <path d={`M${x} ${y} Q${x + 10} ${y + 6} ${x + 18} ${y + 2}`}
          fill="none" stroke={color} strokeWidth={strokeW * 0.35} strokeLinecap="round" />
      </>}
    </g>
  );
};

// ---- Creepy Boy (consistent character) ----
const CreepyBoy: React.FC<{
  frame: number; x: number; y: number; scale?: number;
  expression?: 'scared' | 'nervous' | 'shocked';
  lookDir?: number; // -1 left, 0 center, 1 right
  armPose?: 'lantern' | 'shielding' | 'pointing';
}> = ({ frame, x, y, scale = 1, expression = 'scared', lookDir = 0, armPose = 'lantern' }) => {
  const time = frame / 30;
  const b = Math.sin(time * 1.5) * 1.5;
  const hb = Math.sin(time * 1.0) * 1;
  const tremble = expression === 'scared' ? Math.sin(time * 12) * 0.8 : 0;
  const ls = Math.sin(time * 1.0) * 3;
  const lf = 0.75 + Math.sin(time * 6) * 0.12 + Math.sin(time * 9) * 0.08;
  const hw = Math.sin(time * 0.8) * 2;

  // Expression params
  const eyeScale = expression === 'shocked' ? 1.2 : expression === 'scared' ? 1.1 : 1.0;
  const pupilSize = expression === 'shocked' ? 3 : expression === 'scared' ? 4 : 5;
  const browAngle = expression === 'scared' ? 8 : expression === 'shocked' ? 12 : 4;
  const mouthOpen = expression === 'shocked' ? 18 : expression === 'scared' ? 10 : 6;
  const mouthWidth = expression === 'shocked' ? 30 : 38;

  // Pupil position based on look direction
  const pupilOffX = lookDir * 5;
  const pupilOffY = -1;

  return (
    <g transform={`translate(${x + tremble}, ${y}) scale(${scale})`}>
      {/* Lantern glow on ground */}
      {armPose === 'lantern' && (<>
        <ellipse cx={85 + ls} cy={175} rx={80} ry={15}
          fill={`rgba(255,170,50,${lf * 0.2})`} />
        <ellipse cx={85 + ls} cy={175} rx={150} ry={25}
          fill={`rgba(255,150,40,${lf * 0.06})`} />
      </>)}

      {/* === LEGS === */}
      <line x1={-4} y1={72 + b} x2={-10} y2={120} stroke="#3a4550" strokeWidth={10} strokeLinecap="round" />
      <line x1={4} y1={72 + b} x2={10} y2={120} stroke="#3a4550" strokeWidth={10} strokeLinecap="round" />
      {/* Outline */}
      <line x1={-4} y1={72 + b} x2={-10} y2={120} stroke={OL} strokeWidth={12} strokeLinecap="round" opacity={0.1} />
      <line x1={4} y1={72 + b} x2={10} y2={120} stroke={OL} strokeWidth={12} strokeLinecap="round" opacity={0.1} />
      {/* Shoes */}
      <ellipse cx={-12} cy={123} rx={11} ry={5} fill="#2a1f15" stroke={OL} strokeWidth={1.8} />
      <ellipse cx={12} cy={123} rx={11} ry={5} fill="#2a1f15" stroke={OL} strokeWidth={1.8} />

      {/* === TORSO === */}
      <path d={`M-28 ${18 + b} Q-32 ${45 + b} -28 ${72 + b} L28 ${72 + b} Q32 ${45 + b} 28 ${18 + b} Z`}
        fill="#4a6050" stroke={OL} strokeWidth={OW} strokeLinejoin="round" />
      {/* Shirt stripes visible in center */}
      <rect x={-10} y={22 + b} width={20} height={48} fill="#6a7a70" />
      {[0, 1, 2].map(i => (
        <rect key={i} x={-8} y={26 + i * 14 + b} width={16} height={4} fill="#556a5a" />
      ))}
      {/* Collar */}
      <path d={`M-15 ${18 + b} L0 ${28 + b} L15 ${18 + b}`} fill="#5a7060" stroke={OL} strokeWidth={1.5} />

      {/* === LEFT ARM === */}
      {armPose === 'lantern' ? <>
        {/* Holding down, relaxed */}
        <path d={`M-28 ${22 + b} Q-38 ${45 + b} -35 ${65 + b}`}
          fill="none" stroke="#4a6050" strokeWidth={10} strokeLinecap="round" />
        <circle cx={-35} cy={67 + b} r={5.5} fill="#c4b8a0" stroke={OL} strokeWidth={1.5} />
      </> : armPose === 'shielding' ? <>
        {/* Arm raised defensively */}
        <path d={`M-28 ${22 + b} Q-42 ${10 + b} -38 ${-5 + b}`}
          fill="none" stroke="#4a6050" strokeWidth={10} strokeLinecap="round" />
        <circle cx={-38} cy={-7 + b} r={5.5} fill="#c4b8a0" stroke={OL} strokeWidth={1.5} />
      </> : <>
        {/* Pointing forward */}
        <path d={`M-28 ${22 + b} Q-42 ${30 + b} -48 ${25 + b}`}
          fill="none" stroke="#4a6050" strokeWidth={10} strokeLinecap="round" />
        <circle cx={-50} cy={24 + b} r={5} fill="#c4b8a0" stroke={OL} strokeWidth={1.5} />
        <line x1={-54} y1={23 + b} x2={-62} y2={21 + b} stroke="#c4b8a0" strokeWidth={3} strokeLinecap="round" />
      </>}

      {/* === RIGHT ARM + LANTERN === */}
      <path d={`M28 ${22 + b} Q48 ${8 + b} ${60 + ls} ${-5 + b}`}
        fill="none" stroke="#4a6050" strokeWidth={10} strokeLinecap="round" />
      <circle cx={62 + ls} cy={-7 + b} r={6} fill="#c4b8a0" stroke={OL} strokeWidth={1.5} />

      {/* Lantern */}
      <g transform={`translate(${62 + ls}, ${-2 + b})`}>
        <path d="M-5 -2 Q0 -10 5 -2" fill="none" stroke="#554430" strokeWidth={2} strokeLinecap="round" />
        <rect x={-8} y={0} width={16} height={4} rx={1.5} fill="#554430" stroke={OL} strokeWidth={1} />
        <path d="M-2.5 0 L-2 -4 L2 -4 L2.5 0" fill="#443322" stroke={OL} strokeWidth={0.6} />
        <path d="M-9 4 L-10 28 Q-10 31 -7 31 L7 31 Q10 31 10 28 L9 4 Z"
          fill="rgba(255,180,60,0.1)" stroke="#665533" strokeWidth={1.5} />
        <line x1={-5} y1={4} x2={-5.5} y2={31} stroke="#665533" strokeWidth={0.5} opacity={0.4} />
        <line x1={0} y1={4} x2={0} y2={31} stroke="#665533" strokeWidth={0.5} opacity={0.4} />
        <line x1={5} y1={4} x2={5.5} y2={31} stroke="#665533" strokeWidth={0.5} opacity={0.4} />
        <line x1={-9.5} y1={17} x2={9.5} y2={17} stroke="#665533" strokeWidth={0.6} />
        {/* Flame */}
        <path d={`M0 14 Q${-3 + Math.sin(time * 8) * 1.5} 9 0 ${4 + Math.sin(time * 10) * 1} Q${3 + Math.sin(time * 7) * 1.5} 9 0 14 Z`}
          fill={`rgba(255,200,80,${lf})`} />
        <path d={`M0 15 Q-1 12 0 ${9 + Math.sin(time * 12)} Q1 12 0 15 Z`}
          fill={`rgba(255,245,200,${lf * 0.8})`} />
        <circle cx={0} cy={14} r={18} fill={`rgba(255,180,50,${lf * 0.3})`} />
        <circle cx={0} cy={14} r={45} fill={`rgba(255,160,40,${lf * 0.1})`} />
        <circle cx={0} cy={14} r={80} fill={`rgba(255,150,40,${lf * 0.03})`} />
        <rect x={-9.5} y={31} width={19} height={4} rx={1.5} fill="#554430" stroke={OL} strokeWidth={1} />
      </g>

      {/* === NECK === */}
      <rect x={-7} y={8 + b + hb} width={14} height={10} rx={3} fill="#c4b8a0" stroke={OL} strokeWidth={1.2} />

      {/* === HEAD === */}
      <g transform={`translate(0, ${-62 + b + hb + tremble * 0.5})`}>
        {/* Face circle */}
        <circle cx={0} cy={0} r={58} fill="#c4b8a0" stroke={OL} strokeWidth={3} />
        {/* Warm light from right */}
        <ellipse cx={25} cy={-5} rx={35} ry={40} fill="rgba(255,190,100,0.06)" />

        {/* Eye sockets */}
        <circle cx={-18} cy={-5} r={22 * eyeScale} fill="#1a1015" />
        <circle cx={18} cy={-5} r={22 * eyeScale} fill="#1a1015" />
        <circle cx={-18} cy={-5} r={25 * eyeScale} fill="none" stroke="rgba(50,30,40,0.4)" strokeWidth={4} />
        <circle cx={18} cy={-5} r={25 * eyeScale} fill="none" stroke="rgba(50,30,40,0.4)" strokeWidth={4} />

        {/* Eyeballs */}
        <circle cx={-18} cy={-5} r={18 * eyeScale} fill="#e2ded6" stroke={OL} strokeWidth={1.5} />
        <circle cx={18} cy={-5} r={18 * eyeScale} fill="#e2ded6" stroke={OL} strokeWidth={1.5} />

        {/* Iris + pupil */}
        <circle cx={-16 + pupilOffX} cy={-3 + pupilOffY} r={6} fill="rgba(200,50,30,0.8)" />
        <circle cx={20 + pupilOffX} cy={-3 + pupilOffY} r={6} fill="rgba(200,50,30,0.8)" />
        <circle cx={-15 + pupilOffX} cy={-2 + pupilOffY} r={pupilSize} fill="#0a0505" />
        <circle cx={21 + pupilOffX} cy={-2 + pupilOffY} r={pupilSize} fill="#0a0505" />

        {/* Eye shine */}
        <circle cx={-22} cy={-12} r={3.5} fill="#fff" opacity={0.8} />
        <circle cx={14} cy={-12} r={3.5} fill="#fff" opacity={0.8} />
        <circle cx={-12} cy={1} r={1.5} fill="#fff" opacity={0.2} />
        <circle cx={24} cy={1} r={1.5} fill="#fff" opacity={0.2} />

        {/* Eyebrows — expression driven */}
        <path d={`M-36 ${-28 - browAngle} Q-18 ${-35 - browAngle * 0.5} 0 ${-28}`}
          fill="none" stroke="#3a2a1a" strokeWidth={3} strokeLinecap="round" />
        <path d={`M0 ${-28} Q18 ${-35 - browAngle * 0.5} 36 ${-28 - browAngle}`}
          fill="none" stroke="#3a2a1a" strokeWidth={3} strokeLinecap="round" />

        {/* Nose */}
        <path d="M-1 12 L-2 20 Q-5 24 -7 25 Q-2 27 0 26 Q2 27 7 25 Q5 24 2 20 L1 12"
          fill="none" stroke="#9a8570" strokeWidth={1.2} />

        {/* Mouth — expression driven */}
        <g transform={`translate(0, 38)`}>
          {expression === 'shocked' ? <>
            {/* O-shaped shocked mouth */}
            <ellipse cx={0} cy={2} rx={mouthWidth * 0.45} ry={mouthOpen * 0.6} fill="#0e0808" stroke={OL} strokeWidth={2.5} />
            {/* Few teeth visible */}
            {[-8, 0, 8].map((tx, i) => (
              <rect key={i} x={tx - 3} y={-mouthOpen * 0.3} width={6} height={5} rx={1} fill="#d5cfc0" stroke="#b0a898" strokeWidth={0.5} />
            ))}
          </> : expression === 'scared' ? <>
            {/* Grimace / clenched teeth showing */}
            <path d={`M-${mouthWidth} -1 Q-${mouthWidth * 0.6} ${mouthOpen * 0.3} 0 ${mouthOpen * 0.4} Q${mouthWidth * 0.6} ${mouthOpen * 0.3} ${mouthWidth} -1`}
              fill="#0e0808" stroke={OL} strokeWidth={2.5} />
            <path d={`M-${mouthWidth} -1 Q0 -4 ${mouthWidth} -1`} fill="none" stroke={OL} strokeWidth={1} />
            {/* Teeth */}
            {[-28, -18, -8, 2, 12, 22].map((tx, i) => (
              <rect key={i} x={tx} y={-1} width={8} height={5 + (i % 2) * 2} rx={0.5}
                fill="#d5cfc0" stroke="#b0a898" strokeWidth={0.5} />
            ))}
            {[-22, -10, 4, 16].map((tx, i) => (
              <path key={`l${i}`} d={`M${tx} ${mouthOpen * 0.35} L${tx + 4} ${mouthOpen * 0.35 - 4} L${tx + 8} ${mouthOpen * 0.35}`}
                fill="#ccc8b8" stroke="#b0a898" strokeWidth={0.5} />
            ))}
          </> : <>
            {/* Nervous thin mouth */}
            <path d={`M-25 0 Q-10 ${mouthOpen * 0.3} 0 ${mouthOpen * 0.2} Q10 ${mouthOpen * 0.3} 25 0`}
              fill="#0e0808" stroke={OL} strokeWidth={2} />
          </>}
        </g>

        {/* Sweat drop (when scared) */}
        {expression === 'scared' && (
          <g transform={`translate(40, ${-15 + Math.sin(time * 3) * 3})`}>
            <path d="M0 -5 Q-3 0 0 5 Q3 0 0 -5 Z" fill="rgba(150,200,255,0.5)" stroke="rgba(100,150,220,0.3)" strokeWidth={0.8} />
          </g>
        )}

        {/* Hair */}
        <path d={`M-52 -12 Q-55 -40 -45 -58 Q-32 -72 -8 -76 Q12 -78 30 -72 Q48 -65 54 -48 Q58 -35 55 -18 L45 -22 Q42 -38 35 -48 Q22 -60 2 -62 Q-18 -61 -30 -50 Q-40 -38 -38 -22 Z`}
          fill="#3a2a1a" stroke={OL} strokeWidth={2} />
        <path d={`M-35 -55 Q${-45 + hw} -72 ${-38 + hw} -85`} fill="none" stroke="#3a2a1a" strokeWidth={8} strokeLinecap="round" />
        <path d={`M-15 -65 Q${-20 + hw} -82 ${-12 + hw} -92`} fill="none" stroke="#3a2a1a" strokeWidth={7} strokeLinecap="round" />
        <path d={`M8 -68 Q${12 + hw} -88 ${20 + hw} -96`} fill="none" stroke="#3a2a1a" strokeWidth={8} strokeLinecap="round" />
        <path d={`M28 -62 Q${36 + hw} -78 ${40 + hw} -88`} fill="none" stroke="#3a2a1a" strokeWidth={7} strokeLinecap="round" />
        <path d={`M42 -50 Q${50 + hw * 0.5} -65 ${48 + hw * 0.5} -78`} fill="none" stroke="#3a2a1a" strokeWidth={6} strokeLinecap="round" />
        {/* Bangs */}
        <path d="M-32 -35 Q-26 -18 -35 -10" fill="none" stroke="#3a2a1a" strokeWidth={7} strokeLinecap="round" />
        <path d="M-12 -42 Q-8 -25 -15 -18" fill="none" stroke="#3a2a1a" strokeWidth={6} strokeLinecap="round" />
        <path d="M35 -38 Q38 -22 44 -15" fill="none" stroke="#3a2a1a" strokeWidth={6} strokeLinecap="round" />

        {/* Ears */}
        <path d="M-55 2 Q-63 -8 -60 -20 Q-58 -10 -55 2 Z" fill="#b8a890" stroke={OL} strokeWidth={1.5} />
        <path d="M55 2 Q63 -8 60 -20 Q58 -10 55 2 Z" fill="#b8a890" stroke={OL} strokeWidth={1.5} />
      </g>
    </g>
  );
};

// ---- Shadow Creature (lurking between trees) ----
const LurkingCreature: React.FC<{
  x: number; y: number; scale?: number; frame: number; variant?: number;
}> = ({ x, y, scale = 1, frame, variant = 0 }) => {
  const time = frame / 30;
  const sway = Math.sin(time * 0.3 + variant * 2) * 5;
  const eyePulse = 0.4 + Math.sin(time * 2 + variant) * 0.3;
  const armReach = Math.sin(time * 0.5 + variant) * 10;

  return (
    <g transform={`translate(${x + sway}, ${y}) scale(${scale})`} opacity={0.5}>
      {/* Tall slender body */}
      <path d={`M-8 0 Q-12 -50 -10 -100 Q-8 -150 -5 -180 Q0 -195 5 -180 Q8 -150 10 -100 Q12 -50 8 0 Z`}
        fill="#141620" />
      {/* Head */}
      <ellipse cx={0} cy={-200} rx={16} ry={20} fill="#141620" />
      {/* Eyes — glowing red */}
      <circle cx={-5} cy={-203} r={3.5} fill="#ff3300" opacity={eyePulse} />
      <circle cx={5} cy={-203} r={3.5} fill="#ff3300" opacity={eyePulse} />
      <circle cx={-5} cy={-203} r={12} fill="#ff2200" opacity={eyePulse * 0.12} />
      <circle cx={5} cy={-203} r={12} fill="#ff2200" opacity={eyePulse * 0.12} />
      {/* Long arms reaching */}
      <path d={`M-8 -140 Q${-30 + armReach} -120 ${-45 + armReach} -95`}
        fill="none" stroke="#141620" strokeWidth={5} strokeLinecap="round" />
      <path d={`M8 -130 Q${25 - armReach * 0.5} -105 ${35 - armReach * 0.5} -80`}
        fill="none" stroke="#141620" strokeWidth={4.5} strokeLinecap="round" />
      {/* Spindly fingers */}
      {[-6, -2, 2, 6].map((dx, i) => (
        <line key={i} x1={-45 + armReach} y1={-95} x2={-50 + armReach + dx} y2={-82 + i * 2}
          stroke="#141620" strokeWidth={1.5} strokeLinecap="round" />
      ))}
    </g>
  );
};

// ---- Mushroom (eerie, glowing) ----
const GlowMushroom: React.FC<{ x: number; y: number; scale?: number; frame: number }> = ({ x, y, scale = 1, frame }) => {
  const time = frame / 30;
  const glow = 0.3 + Math.sin(time * 1.5) * 0.15;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <rect x={-2} y={-10} width={4} height={12} rx={1.5} fill="#5a5a48" stroke={OL} strokeWidth={1} />
      <ellipse cx={0} cy={-12} rx={10} ry={6} fill="#4a7a55" stroke={OL} strokeWidth={1.2} />
      <ellipse cx={-3} cy={-13} rx={2} ry={1.5} fill="#6aaa70" opacity={0.6} />
      <ellipse cx={3} cy={-11} rx={1.5} ry={1} fill="#5a9a60" opacity={0.4} />
      <circle cx={0} cy={-12} r={18} fill={`rgba(80,220,100,${glow * 0.15})`} />
      <circle cx={0} cy={-12} r={40} fill={`rgba(80,200,100,${glow * 0.04})`} />
    </g>
  );
};

// ---- Rock ----
const Rock: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <path d={`M${x} ${y} Q${x + w * 0.2} ${y - h} ${x + w * 0.5} ${y - h * 0.9} Q${x + w * 0.8} ${y - h * 0.7} ${x + w} ${y} Z`}
      fill="#2a2d35" stroke="#3a3d48" strokeWidth={1.5} />
    <path d={`M${x + w * 0.25} ${y - h * 0.7} Q${x + w * 0.4} ${y - h * 0.5} ${x + w * 0.6} ${y - h * 0.6}`}
      fill="none" stroke="#3a3d45" strokeWidth={1} opacity={0.4} />
    {/* Highlight edge */}
    <path d={`M${x + w * 0.15} ${y - h * 0.8} Q${x + w * 0.35} ${y - h * 1.05} ${x + w * 0.5} ${y - h * 0.9}`}
      fill="none" stroke="#454855" strokeWidth={0.8} opacity={0.3} />
  </g>
);

// ---- Main Scene ----
const ForestHorrorScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / 30;

  // Character walks in from left, stops, looks around scared
  const walkIn = interpolate(frame, [0, 60], [0, 1], EC);
  const charX = interpolate(frame, [0, 60, 120, 300], [-100, 500, 500, 500], EC);
  const charLook = frame < 120 ? 0 : frame < 180 ? interpolate(frame, [120, 150], [0, 1], EC) : frame < 240 ? interpolate(frame, [180, 210], [1, -1], EC) : interpolate(frame, [240, 260], [-1, 0], EC);
  const charExpr: 'nervous' | 'scared' | 'shocked' = frame < 150 ? 'nervous' : frame < 240 ? 'scared' : 'shocked';

  // Creatures fade in gradually
  const creaturesOp = interpolate(frame, [80, 160], [0, 1], EC);
  // Extra creature appears later
  const extraCreature = interpolate(frame, [200, 260], [0, 1], EC);

  // Fog animation
  const fog1 = Math.sin(time * 0.08) * 60;
  const fog2 = Math.sin(time * 0.06 + 1.5) * 40;
  const fog3 = Math.sin(time * 0.1 + 3) * 50;

  // Fireflies
  const fireflies = Array.from({ length: 8 }, (_, i) => ({
    x: 200 + Math.sin(time * 0.3 + i * 1.7) * 600 + i * 150,
    y: 250 + Math.cos(time * 0.25 + i * 2.1) * 200,
    op: 0.35 + Math.sin(time * 2 + i * 1.3) * 0.2,
    r: 2.5 + Math.sin(time * 1.5 + i) * 1,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0c0e', overflow: 'hidden' }}>
      {/* Sky gradient — dark blue-gray with visible clouds */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, #1a2030 0%, #1c2236 30%, #151a28 60%, #0e1118 100%)',
      }} />

      {/* Cloud layer — subtle dark clouds */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: '100%', height: 400,
        background: 'radial-gradient(ellipse 600px 120px at 30% 25%, rgba(40,50,70,0.35), transparent), radial-gradient(ellipse 500px 100px at 65% 20%, rgba(35,45,65,0.3), transparent), radial-gradient(ellipse 700px 80px at 80% 35%, rgba(30,40,55,0.25), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Moon — visible, eerie glow */}
      <div style={{
        position: 'absolute', left: 1480, top: 50, width: 90, height: 90,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 40%, rgba(200,210,230,0.4), rgba(150,160,180,0.15) 60%, transparent)',
        boxShadow: '0 0 80px rgba(180,190,220,0.15), 0 0 200px rgba(150,160,200,0.06)',
      }} />

      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
        {/* ====== BACKGROUND TREES (far, silhouette, visible against sky) ====== */}
        {[100, 250, 420, 580, 750, 920, 1080, 1250, 1400, 1550, 1700, 1850].map((tx, i) => (
          <DeadTree key={`bg-${i}`} x={tx} y={750} height={250 + (i % 3) * 80}
            lean={(i % 2 ? 1 : -1) * (5 + (i % 4) * 3)} branches={2}
            color="#252835" strokeW={5} detail={false} />
        ))}

        {/* ====== MID TREES (medium detail, clearly visible) ====== */}
        {[60, 300, 680, 1050, 1380, 1700, 1880].map((tx, i) => (
          <DeadTree key={`mid-${i}`} x={tx} y={780} height={300 + (i % 3) * 60}
            lean={(i % 2 ? 1 : -1) * (3 + (i % 3) * 4)} branches={3 + (i % 2)}
            color="#2e3240" strokeW={7} detail={true} />
        ))}

        {/* ====== FOREGROUND TREES (close, thick, detailed, darkest) ====== */}
        <DeadTree x={-20} y={820} height={420} lean={8} branches={5} color="#383d4a" strokeW={14} />
        <DeadTree x={180} y={810} height={380} lean={-5} branches={4} color="#383d4a" strokeW={12} />
        <DeadTree x={1650} y={815} height={400} lean={-6} branches={5} color="#383d4a" strokeW={13} />
        <DeadTree x={1850} y={820} height={350} lean={5} branches={4} color="#383d4a" strokeW={11} />

        {/* ====== GROUND ====== */}
        {/* Ground plane — uneven, organic, visible dark earth */}
        <path d="M0 800 Q100 790 200 795 Q400 805 600 798 Q800 792 1000 800 Q1200 808 1400 795 Q1600 790 1800 798 L1920 800 L1920 1080 L0 1080 Z"
          fill="#1a1d22" stroke="none" />
        {/* Ground texture lines */}
        <path d="M0 810 Q300 805 600 812 Q900 818 1200 808 Q1500 803 1920 810"
          fill="none" stroke="#252830" strokeWidth={1.5} />
        <path d="M0 830 Q250 835 500 828 Q750 822 1000 832 Q1300 838 1600 825 Q1800 820 1920 828"
          fill="none" stroke="#222530" strokeWidth={1} />
        {/* Ground color variation — patches of earth */}
        <ellipse cx={400} cy={860} rx={180} ry={30} fill="#1e2128" opacity={0.5} />
        <ellipse cx={1100} cy={850} rx={220} ry={25} fill="#1c1f26" opacity={0.4} />
        <ellipse cx={1600} cy={870} rx={150} ry={20} fill="#1e2228" opacity={0.4} />

        {/* Rocks */}
        <Rock x={320} y={800} w={50} h={20} />
        <Rock x={850} y={805} w={35} h={15} />
        <Rock x={1300} y={798} w={45} h={18} />

        {/* Mushrooms */}
        <GlowMushroom x={380} y={798} scale={1.2} frame={frame} />
        <GlowMushroom x={920} y={802} scale={0.8} frame={frame} />
        <GlowMushroom x={1250} y={796} scale={1.0} frame={frame} />

        {/* ====== FOG LAYERS ====== */}
        {/* Low ground fog — visible, eerie */}
        <rect x={-100 + fog1} y={760} width={2200} height={55} rx={25}
          fill="rgba(40,50,70,0.25)" filter="url(#fBlur)" />
        <rect x={-200 + fog2} y={790} width={2400} height={65} rx={30}
          fill="rgba(35,45,65,0.3)" filter="url(#fBlur)" />
        {/* Mid fog — subtle, adds depth */}
        <rect x={-150 + fog3} y={580} width={2300} height={50} rx={25}
          fill="rgba(40,50,70,0.1)" filter="url(#fBlur)" />

        <defs>
          <filter id="fBlur"><feGaussianBlur stdDeviation="18" /></filter>
        </defs>

        {/* ====== CREATURES (between trees) ====== */}
        <g opacity={creaturesOp}>
          <LurkingCreature x={250} y={780} scale={1.5} frame={frame} variant={0} />
          <LurkingCreature x={1100} y={770} scale={1.3} frame={frame} variant={1} />
          <LurkingCreature x={1600} y={775} scale={1.6} frame={frame} variant={2} />
        </g>
        <g opacity={extraCreature}>
          <LurkingCreature x={700} y={778} scale={1.8} frame={frame} variant={3} />
        </g>

        {/* ====== FIREFLIES ====== */}
        {fireflies.map((f, i) => (
          <g key={i}>
            <circle cx={f.x} cy={f.y} r={f.r} fill="#ccff88" opacity={f.op} />
            <circle cx={f.x} cy={f.y} r={f.r * 5} fill="#ccff88" opacity={f.op * 0.15} />
          </g>
        ))}

        {/* ====== CHARACTER ====== */}
        <g opacity={walkIn}>
          <CreepyBoy
            frame={frame}
            x={charX} y={620}
            scale={3.0}
            expression={charExpr}
            lookDir={charLook}
            armPose="lantern"
          />
        </g>
      </svg>

      {/* ====== VIGNETTE — strong but clear center ====== */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 35% 55%, transparent 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Scan lines */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 6px)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};

export const ForestHorrorComp: React.FC = () => (
  <Composition
    id="ForestHorror"
    component={ForestHorrorScene}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

// ============================================================
// STICKMAN VERSION — same forest, minimalist character
// Style: Limbo meets horror — white stick figure in dark world
// ============================================================

const StickMan: React.FC<{
  frame: number; x: number; y: number; scale?: number;
  expression?: 'calm' | 'scared' | 'shocked';
  lookDir?: number;
  armPose?: 'lantern' | 'shielding' | 'running';
  walking?: boolean;
}> = ({ frame, x, y, scale = 1, expression = 'calm', lookDir = 0, armPose = 'lantern', walking = false }) => {
  const time = frame / 30;
  const SC = '#d8d0c0'; // stick color — pale bone white
  const SW = 4.5; // stroke width
  const tremble = expression === 'scared' ? Math.sin(time * 14) * 1.2 : expression === 'shocked' ? Math.sin(time * 20) * 2 : 0;
  const breathe = Math.sin(time * 1.2) * 1.5;
  const ls = Math.sin(time * 1.0) * 3;
  const lf = 0.8 + Math.sin(time * 6) * 0.12 + Math.sin(time * 9) * 0.06;

  // Walk cycle
  const walkCycle = walking ? Math.sin(time * 4) * 12 : 0;
  const walkCycle2 = walking ? Math.sin(time * 4 + Math.PI) * 12 : 0;

  // Head bob
  const headBob = walking ? Math.abs(Math.sin(time * 4)) * 3 : breathe;

  // Eye params
  const eyeR = expression === 'shocked' ? 5 : expression === 'scared' ? 4.5 : 4;
  const pupilR = expression === 'shocked' ? 2 : expression === 'scared' ? 2.5 : 3;
  const pupilOff = lookDir * 2.5;

  // Mouth
  const mouthW = expression === 'shocked' ? 0 : expression === 'scared' ? 10 : 8;
  const mouthCurve = expression === 'scared' ? -3 : expression === 'calm' ? 0 : 0;

  return (
    <g transform={`translate(${x + tremble}, ${y}) scale(${scale})`}>
      {/* Lantern glow on ground */}
      {armPose === 'lantern' && (<>
        <ellipse cx={40 + ls} cy={105} rx={70} ry={12}
          fill={`rgba(255,170,50,${lf * 0.2})`} />
        <ellipse cx={40 + ls} cy={105} rx={140} ry={22}
          fill={`rgba(255,150,40,${lf * 0.06})`} />
      </>)}

      {/* === LEGS === */}
      <line x1={0} y1={40 + breathe} x2={-12 + walkCycle * 0.3} y2={100 + walkCycle}
        stroke={SC} strokeWidth={SW} strokeLinecap="round" />
      <line x1={0} y1={40 + breathe} x2={12 + walkCycle2 * 0.3} y2={100 + walkCycle2}
        stroke={SC} strokeWidth={SW} strokeLinecap="round" />
      {/* Feet */}
      <line x1={-12 + walkCycle * 0.3} y1={100 + walkCycle} x2={-20 + walkCycle * 0.2} y2={102 + walkCycle}
        stroke={SC} strokeWidth={SW * 0.8} strokeLinecap="round" />
      <line x1={12 + walkCycle2 * 0.3} y1={100 + walkCycle2} x2={4 + walkCycle2 * 0.2} y2={102 + walkCycle2}
        stroke={SC} strokeWidth={SW * 0.8} strokeLinecap="round" />

      {/* === BODY (spine) === */}
      <line x1={0} y1={-15 + headBob} x2={0} y2={42 + breathe}
        stroke={SC} strokeWidth={SW} strokeLinecap="round" />

      {/* === LEFT ARM === */}
      {armPose === 'shielding' ? (
        <path d={`M0 0 Q-20 -15 -25 -25`}
          fill="none" stroke={SC} strokeWidth={SW} strokeLinecap="round" />
      ) : (
        <path d={`M0 ${2 + breathe * 0.3} Q-18 ${15 + breathe} -22 ${35 + breathe}`}
          fill="none" stroke={SC} strokeWidth={SW} strokeLinecap="round" />
      )}

      {/* === RIGHT ARM + LANTERN === */}
      <path d={`M0 ${2 + breathe * 0.3} Q25 ${-8 + breathe * 0.5} ${32 + ls} ${-15 + breathe * 0.3}`}
        fill="none" stroke={SC} strokeWidth={SW} strokeLinecap="round" />

      {/* Lantern (minimalist) */}
      {armPose === 'lantern' && (
        <g transform={`translate(${33 + ls}, ${-12 + breathe * 0.3})`}>
          {/* Handle */}
          <path d="M-3 -1 Q0 -6 3 -1" fill="none" stroke="#887055" strokeWidth={2} strokeLinecap="round" />
          {/* Body — simple trapezoid */}
          <path d="M-5 0 L-6 18 Q-6 20 -4 20 L4 20 Q6 20 6 18 L5 0 Z"
            fill={`rgba(255,180,60,${lf * 0.15})`} stroke="#776040" strokeWidth={1.5} />
          {/* Flame */}
          <path d={`M0 8 Q${-2 + Math.sin(time * 8) * 1} 4 0 ${1 + Math.sin(time * 10) * 1} Q${2 + Math.sin(time * 7) * 1} 4 0 8 Z`}
            fill={`rgba(255,210,90,${lf})`} />
          <circle cx={0} cy={6} r={2} fill={`rgba(255,250,220,${lf * 0.9})`} />
          {/* Glow */}
          <circle cx={0} cy={8} r={15} fill={`rgba(255,180,50,${lf * 0.25})`} />
          <circle cx={0} cy={8} r={40} fill={`rgba(255,160,40,${lf * 0.08})`} />
          <circle cx={0} cy={8} r={70} fill={`rgba(255,150,40,${lf * 0.025})`} />
        </g>
      )}

      {/* === HEAD === */}
      <g transform={`translate(0, ${-38 + headBob})`}>
        {/* Head circle — slightly larger for stickman proportion */}
        <circle cx={0} cy={0} r={22} fill="#1a1d22" stroke={SC} strokeWidth={SW} />

        {/* Eyes — white dots, creepy in dark head */}
        <circle cx={-7 + pupilOff} cy={-2} r={eyeR} fill={SC} />
        <circle cx={7 + pupilOff} cy={-2} r={eyeR} fill={SC} />
        {/* Pupils */}
        <circle cx={-7 + pupilOff * 1.3} cy={-1.5} r={pupilR} fill="#0a0808" />
        <circle cx={7 + pupilOff * 1.3} cy={-1.5} r={pupilR} fill="#0a0808" />

        {/* Eye glow — subtle warm reflection from lantern */}
        <circle cx={-9} cy={-4} r={1.2} fill="#fff" opacity={0.7} />
        <circle cx={5} cy={-4} r={1.2} fill="#fff" opacity={0.7} />

        {expression === 'shocked' ? (
          /* O mouth */
          <ellipse cx={0} cy={10} rx={5} ry={6} fill="none" stroke={SC} strokeWidth={2} />
        ) : expression === 'scared' ? (
          /* Wavy grimace */
          <path d={`M-${mouthW} 9 Q-${mouthW * 0.5} ${9 + mouthCurve} 0 ${10 + mouthCurve * 0.5} Q${mouthW * 0.5} ${9 + mouthCurve} ${mouthW} 9`}
            fill="none" stroke={SC} strokeWidth={2} strokeLinecap="round" />
        ) : (
          /* Neutral line */
          <line x1={-6} y1={9} x2={6} y2={9} stroke={SC} strokeWidth={2} strokeLinecap="round" />
        )}

        {/* Sweat (scared) */}
        {expression === 'scared' && (
          <path d={`M20 ${-8 + Math.sin(time * 3) * 2} Q18 ${-3 + Math.sin(time * 3) * 2} 20 ${2 + Math.sin(time * 3) * 2}`}
            fill="none" stroke="rgba(150,200,255,0.5)" strokeWidth={1.5} strokeLinecap="round" />
        )}

        {/* Hair — few messy sticks on top */}
        <line x1={-8} y1={-20} x2={-12} y2={-30} stroke={SC} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={0} y1={-22} x2={2} y2={-34} stroke={SC} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={8} y1={-20} x2={14} y2={-32} stroke={SC} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    </g>
  );
};

// ---- Stickman Shadow Creature ----
const StickCreature: React.FC<{
  x: number; y: number; scale?: number; frame: number; variant?: number;
}> = ({ x, y, scale = 1, frame, variant = 0 }) => {
  const time = frame / 30;
  const sway = Math.sin(time * 0.4 + variant * 2) * 6;
  const eyePulse = 0.5 + Math.sin(time * 2.5 + variant) * 0.35;
  const armReach = Math.sin(time * 0.6 + variant) * 12;
  const SC = '#181c24';

  return (
    <g transform={`translate(${x + sway}, ${y}) scale(${scale})`} opacity={0.6}>
      {/* Spine — very tall, thin */}
      <line x1={0} y1={0} x2={0} y2={-180} stroke={SC} strokeWidth={4} strokeLinecap="round" />
      {/* Head — elongated */}
      <ellipse cx={0} cy={-195} rx={12} ry={18} fill={SC} />
      {/* Eyes */}
      <circle cx={-4} cy={-198} r={3} fill="#ff3300" opacity={eyePulse} />
      <circle cx={4} cy={-198} r={3} fill="#ff3300" opacity={eyePulse} />
      <circle cx={-4} cy={-198} r={10} fill="#ff2200" opacity={eyePulse * 0.1} />
      <circle cx={4} cy={-198} r={10} fill="#ff2200" opacity={eyePulse * 0.1} />
      {/* Long arms — reaching */}
      <path d={`M0 -130 Q${-25 + armReach} -110 ${-42 + armReach} -85`}
        fill="none" stroke={SC} strokeWidth={3} strokeLinecap="round" />
      <path d={`M0 -120 Q${20 - armReach * 0.6} -100 ${32 - armReach * 0.6} -75`}
        fill="none" stroke={SC} strokeWidth={3} strokeLinecap="round" />
      {/* Fingers */}
      {[-4, 0, 4].map((dx, i) => (
        <line key={i} x1={-42 + armReach} y1={-85} x2={-48 + armReach + dx} y2={-72 + i * 2}
          stroke={SC} strokeWidth={1.5} strokeLinecap="round" />
      ))}
      {/* Legs — spider-like */}
      <line x1={0} y1={0} x2={-18} y2={15} stroke={SC} strokeWidth={3} strokeLinecap="round" />
      <line x1={0} y1={0} x2={18} y2={15} stroke={SC} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};

const ForestHorrorStickScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / 30;

  // Character walks in from left, stops, looks around
  const walkPhase = frame < 60;
  const walkIn = interpolate(frame, [0, 60], [0, 1], EC);
  const charX = interpolate(frame, [0, 60, 120, 300], [-50, 480, 480, 480], EC);
  const charLook = frame < 120 ? 0 : frame < 180 ? interpolate(frame, [120, 150], [0, 1], EC) : frame < 240 ? interpolate(frame, [180, 210], [1, -1], EC) : interpolate(frame, [240, 260], [-1, 0], EC);
  const charExpr: 'calm' | 'scared' | 'shocked' = frame < 150 ? 'calm' : frame < 240 ? 'scared' : 'shocked';

  // Creatures
  const creaturesOp = interpolate(frame, [90, 170], [0, 1], EC);
  const extraCreature = interpolate(frame, [210, 270], [0, 1], EC);

  // Fog
  const fog1 = Math.sin(time * 0.08) * 60;
  const fog2 = Math.sin(time * 0.06 + 1.5) * 40;
  const fog3 = Math.sin(time * 0.1 + 3) * 50;

  // Fireflies
  const fireflies = Array.from({ length: 10 }, (_, i) => ({
    x: 150 + Math.sin(time * 0.3 + i * 1.5) * 650 + i * 140,
    y: 200 + Math.cos(time * 0.2 + i * 2.3) * 250,
    op: 0.3 + Math.sin(time * 2 + i * 1.1) * 0.2,
    r: 2 + Math.sin(time * 1.5 + i) * 0.8,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: '#080a0d', overflow: 'hidden' }}>
      {/* Sky — slightly bluer for stickman style */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, #161e2e 0%, #182030 30%, #121824 60%, #0c1018 100%)',
      }} />

      {/* Clouds */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: '100%', height: 400,
        background: 'radial-gradient(ellipse 600px 120px at 25% 22%, rgba(35,45,65,0.3), transparent), radial-gradient(ellipse 500px 100px at 60% 18%, rgba(30,40,60,0.25), transparent), radial-gradient(ellipse 700px 80px at 85% 30%, rgba(25,35,50,0.2), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Moon */}
      <div style={{
        position: 'absolute', left: 1500, top: 40, width: 80, height: 80,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 40%, rgba(190,200,220,0.35), rgba(140,150,170,0.12) 60%, transparent)',
        boxShadow: '0 0 80px rgba(170,180,210,0.12), 0 0 180px rgba(140,150,190,0.05)',
      }} />

      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
        {/* BG Trees */}
        {[100, 250, 420, 580, 750, 920, 1080, 1250, 1400, 1550, 1700, 1850].map((tx, i) => (
          <DeadTree key={`bg-${i}`} x={tx} y={750} height={250 + (i % 3) * 80}
            lean={(i % 2 ? 1 : -1) * (5 + (i % 4) * 3)} branches={2}
            color="#222838" strokeW={4} detail={false} />
        ))}

        {/* Mid Trees */}
        {[60, 300, 680, 1050, 1380, 1700, 1880].map((tx, i) => (
          <DeadTree key={`mid-${i}`} x={tx} y={780} height={300 + (i % 3) * 60}
            lean={(i % 2 ? 1 : -1) * (3 + (i % 3) * 4)} branches={3 + (i % 2)}
            color="#2a3042" strokeW={6} detail={true} />
        ))}

        {/* FG Trees */}
        <DeadTree x={-20} y={820} height={420} lean={8} branches={5} color="#343a4c" strokeW={12} />
        <DeadTree x={180} y={810} height={380} lean={-5} branches={4} color="#343a4c" strokeW={10} />
        <DeadTree x={1650} y={815} height={400} lean={-6} branches={5} color="#343a4c" strokeW={11} />
        <DeadTree x={1850} y={820} height={350} lean={5} branches={4} color="#343a4c" strokeW={10} />

        {/* Ground */}
        <path d="M0 800 Q100 790 200 795 Q400 805 600 798 Q800 792 1000 800 Q1200 808 1400 795 Q1600 790 1800 798 L1920 800 L1920 1080 L0 1080 Z"
          fill="#181c24" stroke="none" />
        <path d="M0 810 Q300 805 600 812 Q900 818 1200 808 Q1500 803 1920 810"
          fill="none" stroke="#22272f" strokeWidth={1.5} />

        {/* Rocks */}
        <Rock x={280} y={800} w={55} h={22} />
        <Rock x={820} y={805} w={40} h={16} />
        <Rock x={1350} y={798} w={48} h={20} />

        {/* Mushrooms */}
        <GlowMushroom x={400} y={798} scale={1.0} frame={frame} />
        <GlowMushroom x={950} y={803} scale={0.7} frame={frame} />
        <GlowMushroom x={1200} y={796} scale={0.9} frame={frame} />

        {/* Fog */}
        <rect x={-100 + fog1} y={760} width={2200} height={55} rx={25}
          fill="rgba(35,45,65,0.22)" filter="url(#fBlur2)" />
        <rect x={-200 + fog2} y={790} width={2400} height={65} rx={30}
          fill="rgba(30,40,60,0.28)" filter="url(#fBlur2)" />
        <rect x={-150 + fog3} y={580} width={2300} height={50} rx={25}
          fill="rgba(35,45,60,0.08)" filter="url(#fBlur2)" />

        <defs>
          <filter id="fBlur2"><feGaussianBlur stdDeviation="20" /></filter>
        </defs>

        {/* Stick Creatures */}
        <g opacity={creaturesOp}>
          <StickCreature x={250} y={780} scale={1.4} frame={frame} variant={0} />
          <StickCreature x={1100} y={770} scale={1.2} frame={frame} variant={1} />
          <StickCreature x={1620} y={775} scale={1.5} frame={frame} variant={2} />
        </g>
        <g opacity={extraCreature}>
          <StickCreature x={720} y={778} scale={1.7} frame={frame} variant={3} />
        </g>

        {/* Fireflies */}
        {fireflies.map((f, i) => (
          <g key={i}>
            <circle cx={f.x} cy={f.y} r={f.r} fill="#ccff88" opacity={f.op} />
            <circle cx={f.x} cy={f.y} r={f.r * 5} fill="#ccff88" opacity={f.op * 0.12} />
          </g>
        ))}

        {/* Stickman Character */}
        <g opacity={walkIn}>
          <StickMan
            frame={frame}
            x={charX} y={700}
            scale={3.2}
            expression={charExpr}
            lookDir={charLook}
            armPose="lantern"
            walking={walkPhase}
          />
        </g>
      </svg>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 32% 58%, transparent 28%, rgba(0,0,0,0.3) 58%, rgba(0,0,0,0.75) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Scan lines */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.02) 3px, rgba(0,0,0,0.02) 6px)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};

export const ForestHorrorStickComp: React.FC = () => (
  <Composition
    id="ForestHorrorStick"
    component={ForestHorrorStickScene}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default ForestHorrorScene;
