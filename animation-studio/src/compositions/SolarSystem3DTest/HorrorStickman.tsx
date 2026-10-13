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
// Horror Stickman — High Abstract + 2D Horror Cartoon
// Style: Limbo/Inside meets stickman, eerie atmosphere
// Minimal lines, maximum mood. Glowing features, fog, particles.
// ============================================================

// ---- Stickman Base (reusable, configurable) ----
interface StickPose {
  headTilt?: number;
  torsoLean?: number;
  leftArmAngle?: number;   // upper arm angle from torso
  leftForearm?: number;    // forearm bend
  rightArmAngle?: number;
  rightForearm?: number;
  leftLegAngle?: number;
  leftKnee?: number;
  rightLegAngle?: number;
  rightKnee?: number;
}

const Stickman: React.FC<{
  x: number; y: number; scale?: number;
  pose: StickPose;
  color?: string; strokeW?: number;
  eyeColor?: string; eyeGlow?: number;
  headSize?: number;
  hasHorns?: boolean; hasTail?: boolean; hasWeapon?: 'scythe' | 'axe' | 'lantern' | null;
  glitchAmount?: number;
  breathe?: number;
}> = ({
  x, y, scale = 1, pose, color = '#c8c8c8', strokeW = 3.5,
  eyeColor = '#ff3300', eyeGlow = 0.5, headSize = 18,
  hasHorns = false, hasTail = false, hasWeapon = null,
  glitchAmount = 0, breathe = 0,
}) => {
  const {
    headTilt = 0, torsoLean = 0,
    leftArmAngle = 30, leftForearm = 20,
    rightArmAngle = -30, rightForearm = -20,
    leftLegAngle = 10, leftKnee = 10,
    rightLegAngle = -10, rightKnee = -10,
  } = pose;

  const rad = (deg: number) => (deg * Math.PI) / 180;

  // Body points
  const neckY = -60 + breathe;
  const shoulderY = -52 + breathe;
  const hipY = 20 + breathe;
  const torsoOffX = Math.sin(rad(torsoLean)) * 10;

  // Arm joints
  const armLen = 35;
  const foreLen = 30;
  const lShX = torsoOffX - 2;
  const rShX = torsoOffX + 2;

  const lElbowX = lShX + Math.sin(rad(leftArmAngle)) * armLen;
  const lElbowY = shoulderY + Math.cos(rad(leftArmAngle)) * armLen;
  const lHandX = lElbowX + Math.sin(rad(leftArmAngle + leftForearm)) * foreLen;
  const lHandY = lElbowY + Math.cos(rad(leftArmAngle + leftForearm)) * foreLen;

  const rElbowX = rShX + Math.sin(rad(rightArmAngle)) * armLen;
  const rElbowY = shoulderY + Math.cos(rad(rightArmAngle)) * armLen;
  const rHandX = rElbowX + Math.sin(rad(rightArmAngle + rightForearm)) * foreLen;
  const rHandY = rElbowY + Math.cos(rad(rightArmAngle + rightForearm)) * foreLen;

  // Leg joints
  const legLen = 40;
  const shinLen = 38;
  const lKneeX = torsoOffX + Math.sin(rad(leftLegAngle)) * legLen;
  const lKneeY = hipY + Math.cos(rad(leftLegAngle)) * legLen;
  const lFootX = lKneeX + Math.sin(rad(leftLegAngle + leftKnee)) * shinLen;
  const lFootY = lKneeY + Math.cos(rad(leftLegAngle + leftKnee)) * shinLen;

  const rKneeX = torsoOffX + Math.sin(rad(rightLegAngle)) * legLen;
  const rKneeY = hipY + Math.cos(rad(rightLegAngle)) * legLen;
  const rFootX = rKneeX + Math.sin(rad(rightLegAngle + rightKnee)) * shinLen;
  const rFootY = rKneeY + Math.cos(rad(rightLegAngle + rightKnee)) * shinLen;

  const glitchX = glitchAmount > 0 ? (Math.random() - 0.5) * glitchAmount : 0;
  const glitchY = glitchAmount > 0 ? (Math.random() - 0.5) * glitchAmount * 0.5 : 0;

  return (
    <g transform={`translate(${x + glitchX}, ${y + glitchY}) scale(${scale})`}>
      {/* Shadow on ground */}
      <ellipse cx={torsoOffX} cy={lFootY + 5} rx={25 * scale} ry={4} fill="rgba(0,0,0,0.3)" />

      {/* Tail */}
      {hasTail && (
        <path d={`M${torsoOffX} ${hipY} Q${torsoOffX + 30} ${hipY + 10} ${torsoOffX + 40} ${hipY - 5} Q${torsoOffX + 50} ${hipY - 15} ${torsoOffX + 45} ${hipY - 25}`}
          fill="none" stroke={color} strokeWidth={strokeW * 0.6} strokeLinecap="round" opacity={0.7} />
      )}

      {/* Legs */}
      <line x1={torsoOffX} y1={hipY} x2={lKneeX} y2={lKneeY} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      <line x1={lKneeX} y1={lKneeY} x2={lFootX} y2={lFootY} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      <line x1={torsoOffX} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />

      {/* Spine / torso */}
      <line x1={0} y1={neckY} x2={torsoOffX} y2={hipY} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />

      {/* Arms */}
      <line x1={lShX} y1={shoulderY} x2={lElbowX} y2={lElbowY} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      <line x1={lElbowX} y1={lElbowY} x2={lHandX} y2={lHandY} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      <line x1={rShX} y1={shoulderY} x2={rElbowX} y2={rElbowY} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      <line x1={rElbowX} y1={rElbowY} x2={rHandX} y2={rHandY} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />

      {/* Weapon */}
      {hasWeapon === 'scythe' && (
        <g transform={`translate(${rHandX}, ${rHandY})`}>
          <line x1={0} y1={0} x2={5} y2={-70} stroke="#666" strokeWidth={2.5} />
          <path d="M5 -70 Q-10 -85 -25 -75 Q-15 -70 -5 -65" fill="#888" stroke="#aaa" strokeWidth={0.8} />
        </g>
      )}
      {hasWeapon === 'axe' && (
        <g transform={`translate(${rHandX}, ${rHandY})`}>
          <line x1={0} y1={0} x2={3} y2={-55} stroke="#665544" strokeWidth={3} />
          <path d="M3 -55 L-12 -65 L-10 -45 Z" fill="#888" stroke="#aaa" strokeWidth={0.5} />
        </g>
      )}
      {hasWeapon === 'lantern' && (
        <g transform={`translate(${lHandX}, ${lHandY})`}>
          <line x1={0} y1={0} x2={0} y2={5} stroke="#886633" strokeWidth={1.5} />
          <rect x={-6} y={5} width={12} height={16} rx={2} fill="none" stroke="#aa8844" strokeWidth={1} />
          <rect x={-4} y={7} width={8} height={12} rx={1} fill={`rgba(255,180,50,${eyeGlow * 0.5})`} />
          <circle cx={0} cy={13} r={10} fill={`rgba(255,180,50,${eyeGlow * 0.08})`} />
        </g>
      )}

      {/* Head */}
      <g transform={`rotate(${headTilt} 0 ${neckY - headSize})`}>
        <circle cx={0} cy={neckY - headSize} r={headSize} fill="#0a0a0c" stroke={color} strokeWidth={strokeW * 0.8} />

        {/* Eyes — the horror focal point */}
        <circle cx={-6} cy={neckY - headSize - 2} r={3} fill={eyeColor} opacity={eyeGlow} />
        <circle cx={6} cy={neckY - headSize - 2} r={3} fill={eyeColor} opacity={eyeGlow} />
        {/* Eye inner */}
        <circle cx={-6} cy={neckY - headSize - 2} r={1.5} fill="#fff" opacity={eyeGlow * 0.5} />
        <circle cx={6} cy={neckY - headSize - 2} r={1.5} fill="#fff" opacity={eyeGlow * 0.5} />
        {/* Eye glow halo */}
        <circle cx={-6} cy={neckY - headSize - 2} r={12} fill={eyeColor} opacity={eyeGlow * 0.06} />
        <circle cx={6} cy={neckY - headSize - 2} r={12} fill={eyeColor} opacity={eyeGlow * 0.06} />

        {/* Mouth — simple, eerie */}
        <path d={`M-7 ${neckY - headSize + 8} Q0 ${neckY - headSize + 12} 7 ${neckY - headSize + 8}`}
          fill="none" stroke={color} strokeWidth={1.2} opacity={0.4} />

        {/* Horns */}
        {hasHorns && <>
          <path d={`M-10 ${neckY - headSize - 14} L-16 ${neckY - headSize - 35} L-5 ${neckY - headSize - 18}`}
            fill="#1a1a1a" stroke={color} strokeWidth={1} opacity={0.8} />
          <path d={`M10 ${neckY - headSize - 14} L16 ${neckY - headSize - 35} L5 ${neckY - headSize - 18}`}
            fill="#1a1a1a" stroke={color} strokeWidth={1} opacity={0.8} />
        </>}
      </g>
    </g>
  );
};

// ---- Atmospheric Particles (dust/ember) ----
const HorrorParticles: React.FC<{ frame: number; count: number; color: string; area: { x: number; y: number; w: number; h: number } }> = ({ frame, count, color, area }) => {
  const time = frame / 30;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const seed = i * 137.508;
        const px = area.x + ((seed * 7.3 + time * 15 * (0.5 + (i % 3) * 0.3)) % area.w);
        const py = area.y + ((seed * 3.1 + time * -8 * (0.3 + (i % 4) * 0.2)) % area.h);
        const r = 1 + (i % 3) * 0.8;
        const op = 0.08 + Math.sin(time * 2 + i * 0.5) * 0.05;
        return (
          <circle key={i} cx={px} cy={py} r={r} fill={color} opacity={op} />
        );
      })}
    </>
  );
};

// ---- Scene 1: The Wanderer — alone in fog, lantern, walking ----
const SceneWanderer: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
  const time = frame / 30;
  const walkCycle = time * 2.5;
  const breathe = Math.sin(time * 1.2) * 1.5;
  const eyePulse = 0.5 + Math.sin(time * 2.5) * 0.3;
  const fogDrift1 = Math.sin(time * 0.15) * 80;
  const fogDrift2 = Math.sin(time * 0.1 + 2) * 60;

  const walkLeg = Math.sin(walkCycle) * 18;
  const walkArm = Math.sin(walkCycle) * 12;

  return (
    <g opacity={opacity}>
      {/* Dead trees silhouette — far background */}
      {[200, 520, 850, 1150, 1500, 1750].map((tx, i) => {
        const h = 200 + (i % 3) * 80;
        const lean = (i % 2 ? 1 : -1) * 5;
        return (
          <g key={i} transform={`translate(${tx}, ${700 - h})`}>
            <line x1={lean} y1={0} x2={0} y2={h} stroke="#111115" strokeWidth={4 + (i % 2) * 2} strokeLinecap="round" />
            {/* Branches */}
            <line x1={lean * 0.3} y1={h * 0.25} x2={lean * 0.3 + (i % 2 ? 25 : -30)} y2={h * 0.15}
              stroke="#111115" strokeWidth={2} strokeLinecap="round" />
            <line x1={lean * 0.5} y1={h * 0.5} x2={lean * 0.5 + (i % 2 ? -20 : 25)} y2={h * 0.4}
              stroke="#111115" strokeWidth={1.5} strokeLinecap="round" />
          </g>
        );
      })}

      {/* Ground fog layers */}
      <rect x={-100 + fogDrift1} y={640} width={2200} height={80} rx={40}
        fill="rgba(15,15,20,0.4)" filter="url(#fogBlur)" />
      <rect x={-200 + fogDrift2} y={670} width={2400} height={100} rx={50}
        fill="rgba(12,12,18,0.5)" filter="url(#fogBlur)" />

      {/* The Wanderer — center-left, walking */}
      <Stickman
        x={480} y={620}
        scale={2.8}
        pose={{
          headTilt: Math.sin(time * 0.5) * 3,
          torsoLean: 3,
          leftArmAngle: 15 + walkArm * 0.3,
          leftForearm: 60,
          rightArmAngle: -15 - walkArm * 0.3,
          rightForearm: -10,
          leftLegAngle: walkLeg,
          leftKnee: Math.max(0, -walkLeg * 0.8),
          rightLegAngle: -walkLeg,
          rightKnee: Math.max(0, walkLeg * 0.8),
        }}
        color="#888"
        eyeColor="#ffcc44"
        eyeGlow={eyePulse}
        hasWeapon="lantern"
        breathe={breathe}
      />

      {/* Mysterious figure in the distance — barely visible */}
      <Stickman
        x={1350} y={590}
        scale={1.6}
        pose={{
          headTilt: -5,
          leftArmAngle: 5,
          leftForearm: 5,
          rightArmAngle: -5,
          rightForearm: -5,
          leftLegAngle: 3,
          leftKnee: 0,
          rightLegAngle: -3,
          rightKnee: 0,
        }}
        color="#222228"
        strokeW={2.5}
        eyeColor="#ff2200"
        eyeGlow={0.3 + Math.sin(time * 3) * 0.2}
        headSize={16}
        breathe={Math.sin(time * 0.5) * 1}
      />
    </g>
  );
};

// ---- Scene 2: The Confrontation — demon vs human ----
const SceneConfrontation: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
  const time = frame / 30;
  const breatheA = Math.sin(time * 1.0) * 2;
  const breatheB = Math.sin(time * 0.7) * 2;
  const demonFloat = Math.sin(time * 0.5) * 8;
  const eyePulseHuman = 0.4 + Math.sin(time * 2) * 0.2;
  const eyePulseDemon = 0.7 + Math.sin(time * 3) * 0.3;
  const scytheSwing = Math.sin(time * 0.8) * 5;
  const tensionPulse = 0.03 + Math.sin(time * 1.5) * 0.02;

  return (
    <g opacity={opacity}>
      {/* Energy/tension line between them */}
      <line x1={650} y1={500} x2={1270} y2={480 + demonFloat}
        stroke="#ff2200" strokeWidth={0.8} opacity={tensionPulse}
        strokeDasharray="8 12" />
      <line x1={650} y1={510} x2={1270} y2={490 + demonFloat}
        stroke="#ff4400" strokeWidth={0.5} opacity={tensionPulse * 0.7}
        strokeDasharray="5 15" />

      {/* Ground crack effect */}
      <path d="M800 700 L810 690 L830 695 L850 680 L870 690 L900 675 L920 685 L940 670 L960 682 L980 668 L1000 680 L1020 672 L1050 685 L1070 670 L1100 680"
        fill="none" stroke="#221111" strokeWidth={1.5} opacity={0.3} />

      {/* Human — defensive stance, axe ready */}
      <Stickman
        x={550} y={600}
        scale={2.8}
        pose={{
          headTilt: 5,
          torsoLean: -5,
          leftArmAngle: -40,
          leftForearm: -30,
          rightArmAngle: 50,
          rightForearm: 40,
          leftLegAngle: -20,
          leftKnee: -15,
          rightLegAngle: 15,
          rightKnee: 10,
        }}
        color="#999"
        strokeW={3.5}
        eyeColor="#88aaff"
        eyeGlow={eyePulseHuman}
        hasWeapon="axe"
        breathe={breatheA}
      />

      {/* Demon — floating, horns, scythe, tail */}
      <Stickman
        x={1300} y={530 + demonFloat}
        scale={3.2}
        pose={{
          headTilt: -8 + Math.sin(time * 0.6) * 3,
          torsoLean: 2,
          leftArmAngle: -60 + scytheSwing,
          leftForearm: -20,
          rightArmAngle: 45,
          rightForearm: 70,
          leftLegAngle: -5,
          leftKnee: 15,
          rightLegAngle: 10,
          rightKnee: -20,
        }}
        color="#aa3333"
        strokeW={4}
        eyeColor="#ff0000"
        eyeGlow={eyePulseDemon}
        headSize={22}
        hasHorns
        hasTail
        hasWeapon="scythe"
        breathe={breatheB}
      />

      {/* Ember particles rising */}
      <HorrorParticles frame={frame} count={25} color="#ff4422"
        area={{ x: 700, y: 300, w: 500, h: 400 }} />
    </g>
  );
};

// ---- Scene 3: The Horde — multiple figures approaching ----
const SceneHorde: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
  const time = frame / 30;
  const eyePulse = 0.5 + Math.sin(time * 2.5) * 0.3;

  const hordeMembers = [
    { x: 300, y: 610, s: 2.5, delay: 0, lean: 5 },
    { x: 580, y: 590, s: 3.0, delay: 0.3, lean: -3 },
    { x: 860, y: 600, s: 2.8, delay: 0.6, lean: 8 },
    { x: 1100, y: 585, s: 3.1, delay: 0.2, lean: -5 },
    { x: 1350, y: 605, s: 2.6, delay: 0.5, lean: 4 },
    { x: 1580, y: 595, s: 2.9, delay: 0.8, lean: -7 },
    // Background figures — smaller, darker
    { x: 200, y: 540, s: 1.4, delay: 0.1, lean: 3 },
    { x: 450, y: 535, s: 1.3, delay: 0.4, lean: -2 },
    { x: 700, y: 530, s: 1.5, delay: 0.7, lean: 6 },
    { x: 950, y: 538, s: 1.2, delay: 0.9, lean: -4 },
    { x: 1200, y: 532, s: 1.4, delay: 0.2, lean: 5 },
    { x: 1450, y: 540, s: 1.3, delay: 0.6, lean: -6 },
    { x: 1650, y: 535, s: 1.5, delay: 0.3, lean: 2 },
  ];

  return (
    <g opacity={opacity}>
      {/* Background — red haze */}
      <rect x={0} y={0} width={1920} height={1080} fill="rgba(40,5,5,0.15)" />

      {hordeMembers.map((m, i) => {
        const isBg = i >= 6;
        const walkPhase = time * 1.8 + m.delay * 3;
        const wLeg = Math.sin(walkPhase) * 15;
        const wArm = Math.sin(walkPhase) * 10;
        const headJerk = Math.sin(time * 2 + m.delay * 5) * (isBg ? 2 : 5);
        const glitch = isBg ? 0 : (Math.sin(time * 7 + i * 3) > 0.95 ? 4 : 0);

        return (
          <Stickman
            key={i}
            x={m.x} y={m.y}
            scale={m.s}
            pose={{
              headTilt: headJerk + m.lean * 0.5,
              torsoLean: m.lean,
              leftArmAngle: 20 + wArm,
              leftForearm: 15,
              rightArmAngle: -20 - wArm,
              rightForearm: -15,
              leftLegAngle: wLeg,
              leftKnee: Math.max(0, -wLeg * 0.6),
              rightLegAngle: -wLeg,
              rightKnee: Math.max(0, wLeg * 0.6),
            }}
            color={isBg ? '#1a1a22' : '#555'}
            strokeW={isBg ? 2 : 3}
            eyeColor="#ff2200"
            eyeGlow={isBg ? eyePulse * 0.4 : eyePulse}
            headSize={isBg ? 14 : 17}
            glitchAmount={glitch}
            breathe={Math.sin(time * 1 + m.delay) * 1.5}
          />
        );
      })}

      {/* Dust particles */}
      <HorrorParticles frame={frame} count={30} color="#ff3322"
        area={{ x: 100, y: 350, w: 1700, h: 350 }} />
    </g>
  );
};

// ---- Main Composition ----
const HorrorStickmanScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const time = frame / 30;

  // Scene timing: 3 phases
  const scene1Op = interpolate(frame, [0, 20, 250, 280], [0, 1, 1, 0], EC);
  const scene2Op = interpolate(frame, [260, 290, 530, 560], [0, 1, 1, 0], EC);
  const scene3Op = interpolate(frame, [540, 570, 850, 870], [0, 1, 1, 0], EC);

  // Background ambient pulse
  const ambientPulse = 0.02 + Math.sin(time * 0.3) * 0.01;

  return (
    <AbsoluteFill style={{ backgroundColor: '#06060a', overflow: 'hidden' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <filter id="fogBlur">
            <feGaussianBlur stdDeviation="25" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="vignetteGrad">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="70%" stopColor="rgba(0,0,0,0.4)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
          </radialGradient>
        </defs>

        {/* Ambient background glow */}
        <rect x={600} y={300} width={700} height={400} rx={350}
          fill={`rgba(80,20,10,${ambientPulse})`} filter="url(#fogBlur)" />

        {/* Ground plane — subtle horizon line */}
        <line x1={0} y1={700} x2={1920} y2={700}
          stroke="#151518" strokeWidth={1} opacity={0.4} />

        {/* Scene 1: Wanderer */}
        <SceneWanderer frame={frame} opacity={scene1Op} />

        {/* Scene 2: Confrontation */}
        <SceneConfrontation frame={frame} opacity={scene2Op} />

        {/* Scene 3: Horde */}
        <SceneHorde frame={frame} opacity={scene3Op} />

        {/* Vignette overlay */}
        <rect x={0} y={0} width={1920} height={1080} fill="url(#vignetteGrad)" />

        {/* Scan line effect — very subtle */}
        {frame % 2 === 0 && (
          <rect x={0} y={0} width={1920} height={1080}
            fill="rgba(0,0,0,0.03)"
            style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
        )}
      </svg>

      {/* CSS scan lines overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
        pointerEvents: 'none',
      }} />

      {/* Phase labels — minimal */}
      {scene1Op > 0.5 && (
        <div style={{
          position: 'absolute', left: 80, bottom: 80,
          fontSize: 18, color: '#333', fontFamily: 'monospace',
          letterSpacing: 4, opacity: scene1Op * 0.4,
        }}>THE WANDERER</div>
      )}
      {scene2Op > 0.5 && (
        <div style={{
          position: 'absolute', left: 80, bottom: 80,
          fontSize: 18, color: '#442222', fontFamily: 'monospace',
          letterSpacing: 4, opacity: scene2Op * 0.4,
        }}>THE CONFRONTATION</div>
      )}
      {scene3Op > 0.5 && (
        <div style={{
          position: 'absolute', left: 80, bottom: 80,
          fontSize: 18, color: '#442222', fontFamily: 'monospace',
          letterSpacing: 4, opacity: scene3Op * 0.4,
        }}>THE HORDE</div>
      )}
    </AbsoluteFill>
  );
};

export const HorrorStickmanComp: React.FC = () => (
  <Composition
    id="HorrorStickman"
    component={HorrorStickmanScene}
    durationInFrames={900}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default HorrorStickmanScene;
