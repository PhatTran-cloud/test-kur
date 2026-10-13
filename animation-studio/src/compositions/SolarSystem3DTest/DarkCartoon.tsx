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
// Dark 2D Cartoon — Horror/Creepy style
// Bold silhouettes, glowing eyes, fog, muted palette
// Think: Limbo, Inside, Over the Garden Wall, Coraline
// ============================================================

// ---- Fog Layer ----
const FogLayer: React.FC<{ y: number; speed: number; opacity: number; color: string }> = ({ y, speed, opacity, color }) => {
  const frame = useCurrentFrame();
  const time = frame / 30;
  const drift = Math.sin(time * speed) * 100;
  return (
    <div style={{
      position: 'absolute', left: -200 + drift, top: y, width: 2400, height: 120,
      background: `linear-gradient(90deg, transparent, ${color}, ${color}, transparent)`,
      opacity, filter: 'blur(40px)',
    }} />
  );
};

// ---- Dark Cerberus (3-headed hound) ----
const DarkCerberus: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const breathe = Math.sin(time * 1.0) * 3;
  const headSway1 = Math.sin(time * 1.3) * 5;
  const headSway2 = Math.sin(time * 1.1 + 1) * 4;
  const headSway3 = Math.sin(time * 1.5 + 2) * 6;
  const jawOpen1 = Math.max(0, Math.sin(time * 0.7)) * 8;
  const jawOpen2 = Math.max(0, Math.sin(time * 0.6 + 1.5)) * 6;
  const jawOpen3 = Math.max(0, Math.sin(time * 0.8 + 3)) * 7;
  const eyePulse = 0.6 + Math.sin(time * 3) * 0.4;
  const droolDrip = (time * 2) % 3;
  const chainSwing = Math.sin(time * 1.2) * 8;

  const renderHead = (cx: number, cy: number, sway: number, jaw: number, eyeColor: string, headScale: number) => (
    <g transform={`translate(${sway}, 0)`}>
      {/* Neck */}
      <path d={`M${cx} ${cy + 40} Q${cx} ${cy + 20} ${cx} ${cy}`}
        fill="none" stroke="#1a1a1a" strokeWidth={28 * headScale} strokeLinecap="round" />

      {/* Head shape — angular, menacing */}
      <path d={`M${cx - 28 * headScale} ${cy - 5} Q${cx - 30 * headScale} ${cy - 25 * headScale} ${cx - 15 * headScale} ${cy - 35 * headScale} L${cx + 15 * headScale} ${cy - 35 * headScale} Q${cx + 30 * headScale} ${cy - 25 * headScale} ${cx + 28 * headScale} ${cy - 5} Q${cx + 25 * headScale} ${cy + 15 * headScale} ${cx} ${cy + 20 * headScale} Q${cx - 25 * headScale} ${cy + 15 * headScale} ${cx - 28 * headScale} ${cy - 5} Z`}
        fill="#111" stroke="#222" strokeWidth={1} />

      {/* Snout */}
      <path d={`M${cx - 18 * headScale} ${cy} Q${cx - 25 * headScale} ${cy - 5} ${cx - 28 * headScale} ${cy + 2} Q${cx} ${cy + 8 * headScale} ${cx + 28 * headScale} ${cy + 2} Q${cx + 25 * headScale} ${cy - 5} ${cx + 18 * headScale} ${cy}`}
        fill="#0d0d0d" />

      {/* Lower jaw */}
      <path d={`M${cx - 22 * headScale} ${cy + 5} Q${cx} ${cy + 12 + jaw} ${cx + 22 * headScale} ${cy + 5}`}
        fill="#0a0a0a" stroke="#1a1a1a" strokeWidth={1} />

      {/* Teeth — jagged */}
      {[-15, -8, -1, 6, 13].map((tx, i) => (
        <path key={i}
          d={`M${cx + tx * headScale} ${cy + 2} L${cx + (tx + 3) * headScale} ${cy + 10 + jaw * 0.3} L${cx + (tx + 6) * headScale} ${cy + 2}`}
          fill="#ddd" opacity={0.9} />
      ))}
      {/* Bottom teeth */}
      {[-12, -4, 4, 12].map((tx, i) => (
        <path key={`bt-${i}`}
          d={`M${cx + tx * headScale} ${cy + 8 + jaw * 0.6} L${cx + (tx + 2) * headScale} ${cy + 1} L${cx + (tx + 4) * headScale} ${cy + 8 + jaw * 0.6}`}
          fill="#ccc" opacity={0.8} />
      ))}

      {/* Eyes — glowing red/orange */}
      <ellipse cx={cx - 10 * headScale} cy={cy - 15 * headScale} rx={6 * headScale} ry={5 * headScale} fill="#000" />
      <ellipse cx={cx - 10 * headScale} cy={cy - 15 * headScale} rx={4 * headScale} ry={3.5 * headScale}
        fill={eyeColor} opacity={eyePulse} />
      <circle cx={cx - 11 * headScale} cy={cy - 16 * headScale} r={1.5 * headScale}
        fill="#fff" opacity={eyePulse * 0.6} />
      {/* Eye glow */}
      <ellipse cx={cx - 10 * headScale} cy={cy - 15 * headScale} rx={10 * headScale} ry={8 * headScale}
        fill={eyeColor} opacity={eyePulse * 0.1} />

      <ellipse cx={cx + 10 * headScale} cy={cy - 15 * headScale} rx={6 * headScale} ry={5 * headScale} fill="#000" />
      <ellipse cx={cx + 10 * headScale} cy={cy - 15 * headScale} rx={4 * headScale} ry={3.5 * headScale}
        fill={eyeColor} opacity={eyePulse} />
      <circle cx={cx + 9 * headScale} cy={cy - 16 * headScale} r={1.5 * headScale}
        fill="#fff" opacity={eyePulse * 0.6} />
      <ellipse cx={cx + 10 * headScale} cy={cy - 15 * headScale} rx={10 * headScale} ry={8 * headScale}
        fill={eyeColor} opacity={eyePulse * 0.1} />

      {/* Ears — pointed, torn */}
      <path d={`M${cx - 22 * headScale} ${cy - 25 * headScale} L${cx - 30 * headScale} ${cy - 50 * headScale} L${cx - 15 * headScale} ${cy - 32 * headScale}`}
        fill="#111" stroke="#222" strokeWidth={1} />
      <path d={`M${cx + 22 * headScale} ${cy - 25 * headScale} L${cx + 30 * headScale} ${cy - 50 * headScale} L${cx + 15 * headScale} ${cy - 32 * headScale}`}
        fill="#111" stroke="#222" strokeWidth={1} />

      {/* Drool */}
      {jaw > 3 && (
        <line x1={cx - 5 * headScale} y1={cy + 10 + jaw * 0.5}
          x2={cx - 5 * headScale} y2={cy + 10 + jaw * 0.5 + droolDrip * 6}
          stroke="#446" strokeWidth={1.5} opacity={0.4} strokeLinecap="round" />
      )}

      {/* Nose */}
      <ellipse cx={cx} cy={cy - 2} rx={5 * headScale} ry={3 * headScale} fill="#1a1a1a" />
    </g>
  );

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 30px rgba(180,30,0,0.15))',
    }}>
      <svg width={380} height={350} viewBox="0 0 380 350" style={{ overflow: 'visible' }}>
        {/* Chain on ground */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <ellipse key={i} cx={120 + i * 25 + chainSwing * (i % 2 ? 1 : -1) * 0.3}
            cy={310} rx={10} ry={6} fill="none" stroke="#444" strokeWidth={2.5} opacity={0.5}
            transform={`rotate(${15 + i * 10} ${120 + i * 25} 310)`} />
        ))}

        {/* Body — massive, dark */}
        <ellipse cx={190} cy={230 + breathe} rx={90} ry={65} fill="#0e0e0e" />
        {/* Ribcage hint */}
        {[0, 1, 2].map(i => (
          <path key={i} d={`M140 ${210 + i * 18 + breathe} Q190 ${205 + i * 18 + breathe} 240 ${210 + i * 18 + breathe}`}
            fill="none" stroke="#1a1a1a" strokeWidth={1.5} opacity={0.3} />
        ))}

        {/* Front legs — muscular */}
        <rect x={120} y={280 + breathe} width={28} height={55} rx={14} fill="#0e0e0e" />
        <rect x={230} y={280 + breathe} width={28} height={55} rx={14} fill="#0e0e0e" />
        {/* Claws */}
        {[0, 1, 2].map(i => (
          <g key={`fc-${i}`}>
            <path d={`M${124 + i * 8} ${335 + breathe} L${126 + i * 8} ${345 + breathe}`} stroke="#888" strokeWidth={2} strokeLinecap="round" />
            <path d={`M${234 + i * 8} ${335 + breathe} L${236 + i * 8} ${345 + breathe}`} stroke="#888" strokeWidth={2} strokeLinecap="round" />
          </g>
        ))}

        {/* Back legs */}
        <rect x={100} y={270 + breathe} width={25} height={50} rx={12} fill="#0a0a0a" />
        <rect x={255} y={270 + breathe} width={25} height={50} rx={12} fill="#0a0a0a" />

        {/* Tail — spiked */}
        <path d={`M280 ${220 + breathe} Q320 ${200 + breathe + Math.sin(time * 1.5) * 15} 340 ${180 + breathe + Math.sin(time * 1.5) * 20}`}
          fill="none" stroke="#0e0e0e" strokeWidth={12} strokeLinecap="round" />
        <path d={`M338 ${180 + breathe + Math.sin(time * 1.5) * 20} L350 ${165 + breathe + Math.sin(time * 1.5) * 20} L335 ${175 + breathe + Math.sin(time * 1.5) * 20}`}
          fill="#333" />

        {/* 3 Heads */}
        {/* Left head — slightly lower, snarling */}
        {renderHead(120, 120 + breathe + headSway1, headSway1, jawOpen1, '#ff3300', 0.85)}
        {/* Center head — dominant, largest */}
        {renderHead(190, 95 + breathe + headSway2, headSway2, jawOpen2, '#ff5500', 1.0)}
        {/* Right head — alert, watchful */}
        {renderHead(260, 115 + breathe + headSway3, headSway3, jawOpen3, '#ff2200', 0.9)}

        {/* Collar — spiked */}
        <path d={`M110 ${175 + breathe} Q190 ${160 + breathe} 270 ${175 + breathe}`}
          fill="none" stroke="#333" strokeWidth={6} />
        {[0, 1, 2, 3, 4].map(i => (
          <path key={`spike-${i}`}
            d={`M${130 + i * 30} ${168 + breathe} L${135 + i * 30} ${155 + breathe} L${140 + i * 30} ${168 + breathe}`}
            fill="#555" stroke="#444" strokeWidth={1} />
        ))}
      </svg>
    </div>
  );
};

// ---- Dark Medusa ----
const DarkMedusa: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const float = Math.sin(time * 0.5) * 5;
  const snakePhase = time * 1.5;
  const eyePulse = 0.5 + Math.sin(time * 2) * 0.5;
  const breathe = Math.sin(time * 0.8) * 2;
  const stoneRayOp = 0.05 + Math.sin(time * 1.5) * 0.04;

  return (
    <div style={{
      position: 'absolute', left: x, top: y + float,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 25px rgba(0,200,80,0.15))',
    }}>
      <svg width={300} height={420} viewBox="0 0 300 420" style={{ overflow: 'visible' }}>
        {/* Stone gaze rays — eerie */}
        {[0, 1, 2, 3, 4].map(i => {
          const angle = -0.6 + i * 0.3 + Math.sin(time * 0.4 + i) * 0.15;
          return (
            <line key={i} x1={150} y1={155 + breathe}
              x2={150 + Math.cos(angle) * 200} y2={155 + breathe + Math.sin(angle) * 150}
              stroke="#00ff55" strokeWidth={1} opacity={stoneRayOp} />
          );
        })}

        {/* Body — dark flowing dress/robes */}
        <path d={`M105 ${240 + breathe} Q85 ${300 + breathe} 80 ${360 + breathe} Q78 ${390 + breathe} 90 ${410 + breathe} L210 ${410 + breathe} Q222 ${390 + breathe} 220 ${360 + breathe} Q215 ${300 + breathe} 195 ${240 + breathe} Z`}
          fill="#0a0a0a" stroke="#1a1a1a" strokeWidth={1} />
        {/* Tattered edges */}
        <path d={`M90 ${408 + breathe} L85 ${420 + breathe} L100 ${412 + breathe} L95 ${422 + breathe} L115 ${410 + breathe}`}
          fill="#0a0a0a" />
        <path d={`M185 ${410 + breathe} L190 ${422 + breathe} L200 ${412 + breathe} L205 ${420 + breathe} L210 ${410 + breathe}`}
          fill="#0a0a0a" />

        {/* Arms — thin, ghostly */}
        <path d={`M108 ${255 + breathe} Q75 ${270 + breathe} 55 ${295 + breathe} Q45 ${310 + breathe} 50 ${320 + breathe}`}
          fill="none" stroke="#1a2a1a" strokeWidth={10} strokeLinecap="round" />
        <path d={`M192 ${255 + breathe} Q225 ${270 + breathe} 245 ${295 + breathe} Q255 ${310 + breathe} 250 ${320 + breathe}`}
          fill="none" stroke="#1a2a1a" strokeWidth={10} strokeLinecap="round" />
        {/* Clawed fingers */}
        {[-8, 0, 8].map((dx, i) => (
          <g key={`lf-${i}`}>
            <line x1={50 + dx * 0.3} y1={320 + breathe} x2={45 + dx} y2={335 + breathe}
              stroke="#1a2a1a" strokeWidth={3} strokeLinecap="round" />
            <line x1={250 - dx * 0.3} y1={320 + breathe} x2={255 - dx} y2={335 + breathe}
              stroke="#1a2a1a" strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}

        {/* Snake hair — 10 snakes, longer, more sinister */}
        {Array.from({ length: 10 }, (_, i) => {
          const angle = -85 + i * 18;
          const rad = (angle * Math.PI) / 180;
          const sway = Math.sin(snakePhase + i * 0.7) * 15;
          const len = 75 + (i % 3) * 10;
          const mid1X = 150 + Math.cos(rad) * len * 0.4 + sway * 0.3;
          const mid1Y = 100 + Math.sin(rad) * len * 0.4;
          const endX = 150 + Math.cos(rad) * len + sway;
          const endY = 100 + Math.sin(rad) * len - 15;
          return (
            <g key={i}>
              <path d={`M150 115 Q${mid1X} ${mid1Y} ${endX} ${endY}`}
                fill="none" stroke="#0a1a0a" strokeWidth={5} strokeLinecap="round" />
              <path d={`M150 115 Q${mid1X} ${mid1Y} ${endX} ${endY}`}
                fill="none" stroke="#1a3a1a" strokeWidth={3} strokeLinecap="round" />
              {/* Snake head — small diamond */}
              <path d={`M${endX} ${endY - 4} L${endX - 4} ${endY} L${endX} ${endY + 4} L${endX + 4} ${endY} Z`}
                fill="#1a3a1a" />
              {/* Snake eyes — tiny glowing dots */}
              <circle cx={endX - 1} cy={endY - 1} r={1.2} fill="#ccff00" opacity={0.8} />
              <circle cx={endX + 1} cy={endY - 1} r={1.2} fill="#ccff00" opacity={0.8} />
            </g>
          );
        })}

        {/* Head — pale green, gaunt */}
        <ellipse cx={150} cy={150 + breathe} rx={40} ry={48} fill="#1a2a1a" stroke="#0a1a0a" strokeWidth={1.5} />
        {/* Face — slightly lighter center */}
        <ellipse cx={150} cy={148 + breathe} rx={30} ry={38} fill="#223322" opacity={0.5} />

        {/* Eyes — LARGE, glowing toxic green */}
        <ellipse cx={133} cy={142 + breathe} rx={14} ry={16} fill="#000" stroke="#0a1a0a" strokeWidth={1} />
        <ellipse cx={133} cy={143 + breathe} rx={9} ry={11} fill={`rgba(0,255,60,${eyePulse})`} />
        <ellipse cx={133} cy={143 + breathe} rx={3} ry={9} fill={`rgba(0,180,40,${eyePulse})`} />
        <circle cx={131} cy={139 + breathe} r={2.5} fill={`rgba(200,255,200,${eyePulse * 0.7})`} />
        {/* Glow halo */}
        <ellipse cx={133} cy={142 + breathe} rx={20} ry={20}
          fill={`rgba(0,255,60,${eyePulse * 0.08})`} />

        <ellipse cx={167} cy={142 + breathe} rx={14} ry={16} fill="#000" stroke="#0a1a0a" strokeWidth={1} />
        <ellipse cx={167} cy={143 + breathe} rx={9} ry={11} fill={`rgba(0,255,60,${eyePulse})`} />
        <ellipse cx={167} cy={143 + breathe} rx={3} ry={9} fill={`rgba(0,180,40,${eyePulse})`} />
        <circle cx={165} cy={139 + breathe} r={2.5} fill={`rgba(200,255,200,${eyePulse * 0.7})`} />
        <ellipse cx={167} cy={142 + breathe} rx={20} ry={20}
          fill={`rgba(0,255,60,${eyePulse * 0.08})`} />

        {/* Dark eye sockets / shadow */}
        <path d={`M120 ${135 + breathe} Q128 ${130 + breathe} 140 ${133 + breathe}`}
          fill="none" stroke="#0a0a0a" strokeWidth={2} />
        <path d={`M160 ${135 + breathe} Q165 ${130 + breathe} 175 ${133 + breathe}`}
          fill="none" stroke="#0a0a0a" strokeWidth={2} />

        {/* Nose — just slits */}
        <line x1={147} y1={160 + breathe} x2={145} y2={167 + breathe} stroke="#0a1a0a" strokeWidth={1.5} />
        <line x1={153} y1={160 + breathe} x2={155} y2={167 + breathe} stroke="#0a1a0a" strokeWidth={1.5} />

        {/* Mouth — thin, sinister smile */}
        <path d={`M130 ${178 + breathe} Q140 ${183 + breathe} 150 ${180 + breathe} Q160 ${183 + breathe} 170 ${178 + breathe}`}
          fill="none" stroke="#0a1a0a" strokeWidth={1.5} />
        {/* Mouth corners turned up — creepy */}
        <path d={`M128 ${178 + breathe} Q126 ${175 + breathe} 125 ${172 + breathe}`}
          fill="none" stroke="#0a1a0a" strokeWidth={1} opacity={0.5} />
        <path d={`M172 ${178 + breathe} Q174 ${175 + breathe} 175 ${172 + breathe}`}
          fill="none" stroke="#0a1a0a" strokeWidth={1} opacity={0.5} />
      </svg>
    </div>
  );
};

// ---- Dark Skull Reaper ----
const DarkReaper: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const float = Math.sin(time * 0.4) * 8;
  const cloakWave = Math.sin(time * 0.8) * 3;
  const scytheSwing = Math.sin(time * 0.6) * 5;
  const eyeFlicker = 0.4 + Math.sin(time * 5) * 0.3 + Math.sin(time * 8) * 0.15;
  const jawDrop = 1 + Math.sin(time * 0.4) * 2;

  return (
    <div style={{
      position: 'absolute', left: x, top: y + float,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 25px rgba(100,50,200,0.15))',
    }}>
      <svg width={320} height={450} viewBox="0 0 320 450" style={{ overflow: 'visible' }}>
        {/* Scythe */}
        <g transform={`rotate(${scytheSwing} 220 200)`}>
          {/* Handle */}
          <line x1={220} y1={80} x2={220} y2={420} stroke="#444" strokeWidth={4} />
          {/* Blade */}
          <path d="M220 80 Q180 50 140 70 Q120 80 115 100 Q120 110 140 105 Q180 90 220 95"
            fill="#666" stroke="#888" strokeWidth={1} />
          <path d="M220 82 Q185 58 150 72 Q135 80 130 92"
            fill="none" stroke="#999" strokeWidth={0.8} opacity={0.4} />
        </g>

        {/* Cloak body — flowing, tattered */}
        <path d={`M100 ${170} Q80 ${250 + cloakWave} 70 ${350} Q65 ${400 + cloakWave} 55 ${440} L75 ${435} L85 ${442} L100 ${432} L120 ${440} L140 ${435} L160 ${442} L180 ${435} L195 ${440} L210 ${432} L225 ${440} L245 ${435} Q240 ${400 - cloakWave} 230 ${350} Q220 ${250 - cloakWave} 200 ${170} Z`}
          fill="#0a0a0f" stroke="#151520" strokeWidth={1} />

        {/* Cloak inner shadow */}
        <path d={`M115 ${200} Q100 ${280 + cloakWave} 95 ${370} Q92 ${410} 90 ${430}`}
          fill="none" stroke="#0f0f18" strokeWidth={2} opacity={0.4} />
        <path d={`M185 ${200} Q200 ${280 - cloakWave} 205 ${370} Q208 ${410} 210 ${430}`}
          fill="none" stroke="#0f0f18" strokeWidth={2} opacity={0.4} />

        {/* Hood */}
        <path d="M90 170 Q85 120 100 95 Q120 70 150 60 Q180 70 200 95 Q215 120 210 170 Q200 190 150 195 Q100 190 90 170 Z"
          fill="#0a0a0f" stroke="#151520" strokeWidth={1.5} />

        {/* Hood inner shadow — deep black */}
        <ellipse cx={150} cy={140} rx={40} ry={35} fill="#050508" />

        {/* Skull face inside hood */}
        {/* Skull shape */}
        <path d="M125 110 Q120 95 130 85 Q140 75 150 73 Q160 75 170 85 Q180 95 175 110 Q175 130 165 138 L135 138 Q125 130 125 110 Z"
          fill="#d8d0c0" stroke="#aaa090" strokeWidth={1} />

        {/* Eye sockets — deep dark */}
        <ellipse cx={138} cy={108} rx={10} ry={9} fill="#050508" />
        <ellipse cx={162} cy={108} rx={10} ry={9} fill="#050508" />

        {/* Soul fire in eyes */}
        <ellipse cx={138} cy={109} rx={5} ry={4.5}
          fill={`rgba(150,80,255,${eyeFlicker})`} />
        <circle cx={137} cy={107} r={2}
          fill={`rgba(200,150,255,${eyeFlicker * 0.7})`} />
        <ellipse cx={138} cy={108} rx={12} ry={10}
          fill={`rgba(150,80,255,${eyeFlicker * 0.08})`} />

        <ellipse cx={162} cy={109} rx={5} ry={4.5}
          fill={`rgba(150,80,255,${eyeFlicker})`} />
        <circle cx={161} cy={107} r={2}
          fill={`rgba(200,150,255,${eyeFlicker * 0.7})`} />
        <ellipse cx={162} cy={108} rx={12} ry={10}
          fill={`rgba(150,80,255,${eyeFlicker * 0.08})`} />

        {/* Nasal cavity */}
        <path d="M147 118 L150 126 L153 118" fill="#050508" />

        {/* Teeth / jaw */}
        <path d={`M132 133 L168 133`} stroke="#aaa090" strokeWidth={1} />
        {[0, 1, 2, 3, 4].map(i => (
          <rect key={i} x={134 + i * 7} y={133} width={5} height={5 + jawDrop} rx={0.5}
            fill="#c8c0b0" stroke="#aaa090" strokeWidth={0.5} />
        ))}

        {/* Bony hand holding scythe */}
        <path d="M195 230 Q210 225 215 215 Q218 210 220 200"
          fill="none" stroke="#c8c0b0" strokeWidth={5} strokeLinecap="round" />
        {/* Finger bones */}
        {[0, 1, 2].map(i => (
          <line key={i} x1={218 + i * 2} y1={200} x2={220 + i * 3} y2={190}
            stroke="#b8b0a0" strokeWidth={2} strokeLinecap="round" />
        ))}

        {/* Wispy soul particles around */}
        {[0, 1, 2, 3].map(i => {
          const px = 150 + Math.sin(time * 0.8 + i * 1.5) * 50;
          const py = 250 + Math.cos(time * 0.6 + i * 2) * 80;
          const pOp = 0.15 + Math.sin(time * 2 + i) * 0.1;
          return (
            <circle key={i} cx={px} cy={py} r={3 + Math.sin(time + i) * 1.5}
              fill="#8855cc" opacity={pOp} />
          );
        })}
      </svg>
    </div>
  );
};

// ---- Main Scene ----
const DarkCartoon: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const cerberusIn = spring({ frame, fps, delay: 20, config: { damping: 300 }, durationInFrames: 50 });
  const medusaIn = spring({ frame, fps, delay: 50, config: { damping: 300 }, durationInFrames: 50 });
  const reaperIn = spring({ frame, fps, delay: 80, config: { damping: 300 }, durationInFrames: 50 });

  return (
    <AbsoluteFill style={{ backgroundColor: '#050508', overflow: 'hidden' }}>
      {/* Ground line */}
      <div style={{
        position: 'absolute', bottom: 80, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent 5%, #1a1a2a 30%, #1a1a2a 70%, transparent 95%)',
        opacity: 0.3,
      }} />

      {/* Fog layers */}
      <FogLayer y={650} speed={0.15} opacity={0.08} color="#1a1520" />
      <FogLayer y={720} speed={0.1} opacity={0.12} color="#15101a" />
      <FogLayer y={800} speed={0.08} opacity={0.15} color="#100a15" />

      {/* Ambient red/purple glow spots */}
      <div style={{ position: 'absolute', left: 50, top: 400, width: 350, height: 300,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(80,10,0,0.15), transparent 70%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', left: 650, top: 300, width: 300, height: 300,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,40,15,0.12), transparent 70%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', left: 1300, top: 200, width: 350, height: 350,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,10,50,0.15), transparent 70%)', filter: 'blur(60px)' }} />

      {/* Cerberus */}
      <div style={{ opacity: cerberusIn, transform: `translateY(${interpolate(cerberusIn, [0, 1], [30, 0])}px)` }}>
        <DarkCerberus frame={frame} x={30} y={300} scale={1.15} />
      </div>

      {/* Medusa */}
      <div style={{ opacity: medusaIn, transform: `translateY(${interpolate(medusaIn, [0, 1], [-20, 0])}px)` }}>
        <DarkMedusa frame={frame} x={600} y={220} scale={1.1} />
      </div>

      {/* Reaper */}
      <div style={{ opacity: reaperIn, transform: `translateY(${interpolate(reaperIn, [0, 1], [25, 0])}px)` }}>
        <DarkReaper frame={frame} x={1150} y={180} scale={1.1} />
      </div>

      {/* Labels — minimal, muted */}
      {[
        { text: 'CERBERUS', x: 120, y: 740, op: cerberusIn, color: '#882200' },
        { text: 'MEDUSA', x: 680, y: 740, op: medusaIn, color: '#228833' },
        { text: 'REAPER', x: 1250, y: 740, op: reaperIn, color: '#553388' },
      ].map(l => (
        <div key={l.text} style={{
          position: 'absolute', left: l.x, top: l.y, fontSize: 26, color: l.color,
          fontFamily: 'Georgia, serif', letterSpacing: 8, opacity: l.op * 0.7,
          textTransform: 'uppercase',
          textShadow: `0 0 20px ${l.color}44`,
        }}>{l.text}</div>
      ))}

      {/* Heavy vignette */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.75) 100%)',
        pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

export const DarkCartoonComp: React.FC = () => (
  <Composition
    id="DarkCartoon"
    component={DarkCartoon}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default DarkCartoon;
