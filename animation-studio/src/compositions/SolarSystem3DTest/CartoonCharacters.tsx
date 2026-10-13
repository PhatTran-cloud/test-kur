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
// 2D Cartoon Characters — expressive human-like characters
// Style: Adventure Time / Gravity Falls / Kurzgesagt human
// ============================================================

// ---- Girl Character (curious explorer type) ----
const GirlExplorer: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const breathe = Math.sin(time * 1.5) * 1.5;
  const blink = Math.sin(time * 3) > 0.92 ? 1 : 0; // occasional blink
  const headTilt = Math.sin(time * 0.8) * 3;
  const armSwing = Math.sin(time * 1.8) * 8;
  const legWalk = Math.sin(time * 2.2) * 6;
  const hairBounce = Math.sin(time * 2) * 3;
  const ponytailSwing = Math.sin(time * 1.5) * 10;

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
    }}>
      <svg width={220} height={380} viewBox="0 0 220 380" style={{ overflow: 'visible' }}>
        {/* Left leg */}
        <g transform={`rotate(${legWalk} 95 255)`}>
          <rect x={82} y={255} width={26} height={65} rx={13} fill="#445" />
          {/* Boot */}
          <path d="M78 315 Q78 330 85 332 L108 332 Q115 330 115 318 L108 310 L82 310 Z" fill="#664433" stroke="#553322" strokeWidth={1} />
          <rect x={80} y={310} width={32} height={5} rx={2} fill="#775544" />
        </g>

        {/* Right leg */}
        <g transform={`rotate(${-legWalk} 125 255)`}>
          <rect x={112} y={255} width={26} height={65} rx={13} fill="#3a3f4a" />
          <path d="M108 315 Q108 330 115 332 L138 332 Q145 330 145 318 L138 310 L112 310 Z" fill="#664433" stroke="#553322" strokeWidth={1} />
          <rect x={110} y={310} width={32} height={5} rx={2} fill="#775544" />
        </g>

        {/* Body — jacket */}
        <path d={`M80 ${160 + breathe} Q75 ${180 + breathe} 78 ${220 + breathe} L80 ${260 + breathe} L140 ${260 + breathe} L142 ${220 + breathe} Q145 ${180 + breathe} 140 ${160 + breathe} Z`}
          fill="#cc4444" stroke="#aa3333" strokeWidth={1.5} />
        {/* Jacket zipper */}
        <line x1={110} y1={165 + breathe} x2={110} y2={255 + breathe} stroke="#aa3333" strokeWidth={1.5} />
        {/* Jacket pocket */}
        <rect x={85} y={220 + breathe} width={22} height={15} rx={2} fill="none" stroke="#aa3333" strokeWidth={1} />
        {/* Collar */}
        <path d={`M88 ${162 + breathe} L110 ${172 + breathe} L132 ${162 + breathe}`}
          fill="none" stroke="#aa3333" strokeWidth={1.5} />

        {/* Backpack strap visible on shoulder */}
        <path d={`M85 ${162 + breathe} Q80 ${175 + breathe} 82 ${195 + breathe}`}
          fill="none" stroke="#886622" strokeWidth={4} strokeLinecap="round" />
        <path d={`M135 ${162 + breathe} Q140 ${175 + breathe} 138 ${195 + breathe}`}
          fill="none" stroke="#886622" strokeWidth={4} strokeLinecap="round" />

        {/* Left arm */}
        <g transform={`rotate(${armSwing} 85 170)`}>
          <path d={`M85 ${170 + breathe} Q65 ${200 + breathe} 60 ${230 + breathe}`}
            fill="none" stroke="#cc4444" strokeWidth={18} strokeLinecap="round" />
          {/* Hand — skin color */}
          <circle cx={58} cy={234 + breathe} r={10} fill="#f0c8a0" />
          {/* Fingers hint */}
          <path d={`M52 ${230 + breathe} Q48 ${228 + breathe} 48 ${232 + breathe}`}
            fill="none" stroke="#e0b890" strokeWidth={2} strokeLinecap="round" />
        </g>

        {/* Right arm — holding magnifying glass */}
        <g transform={`rotate(${-armSwing * 0.5} 135 170)`}>
          <path d={`M135 ${170 + breathe} Q155 ${195 + breathe} 165 ${215 + breathe}`}
            fill="none" stroke="#cc4444" strokeWidth={18} strokeLinecap="round" />
          <circle cx={167} cy={219 + breathe} r={10} fill="#f0c8a0" />
          {/* Magnifying glass */}
          <circle cx={180} cy={205 + breathe} r={14} fill="none" stroke="#886644" strokeWidth={3} />
          <circle cx={180} cy={205 + breathe} r={11} fill="#aaddff" opacity={0.3} />
          <line x1={170} y1={215 + breathe} x2={162} y2={225 + breathe} stroke="#886644" strokeWidth={3} strokeLinecap="round" />
        </g>

        {/* Neck */}
        <rect x={100} y={148 + breathe} width={20} height={16} rx={5} fill="#f0c8a0" />

        {/* Head */}
        <g transform={`rotate(${headTilt} 110 110)`}>
          {/* Hair back layer */}
          <ellipse cx={110} cy={100} rx={48} ry={50} fill="#553320" />

          {/* Face */}
          <ellipse cx={110} cy={108} rx={40} ry={42} fill="#f0c8a0" stroke="#e0b890" strokeWidth={1} />

          {/* Hair front */}
          <path d={`M65 ${88 + hairBounce} Q70 ${60 + hairBounce} 95 ${58 + hairBounce} Q110 ${55 + hairBounce} 130 ${60 + hairBounce} Q155 ${65 + hairBounce} 155 ${92 + hairBounce} Q150 ${85 + hairBounce} 140 ${82 + hairBounce} Q120 ${75 + hairBounce} 100 ${78 + hairBounce} Q80 ${82 + hairBounce} 70 ${90 + hairBounce} Z`}
            fill="#663828" />
          {/* Bangs */}
          <path d={`M80 ${85 + hairBounce} Q90 ${78 + hairBounce} 105 ${82 + hairBounce}`}
            fill="#663828" stroke="#553320" strokeWidth={1} />
          <path d={`M100 ${80 + hairBounce} Q115 ${75 + hairBounce} 130 ${82 + hairBounce}`}
            fill="#663828" stroke="#553320" strokeWidth={1} />

          {/* Ponytail */}
          <path d={`M148 90 Q165 ${85 + ponytailSwing} 170 ${100 + ponytailSwing} Q172 ${115 + ponytailSwing} 165 ${130 + ponytailSwing}`}
            fill="none" stroke="#663828" strokeWidth={14} strokeLinecap="round" />
          <path d={`M148 90 Q165 ${85 + ponytailSwing} 170 ${100 + ponytailSwing} Q172 ${115 + ponytailSwing} 165 ${130 + ponytailSwing}`}
            fill="none" stroke="#553320" strokeWidth={10} strokeLinecap="round" />
          {/* Hair tie */}
          <circle cx={150} cy={90} r={4} fill="#cc4444" />

          {/* Eyes */}
          {blink ? (
            <>
              <path d="M90 105 Q97 102 104 105" fill="none" stroke="#333" strokeWidth={2} />
              <path d="M116 105 Q123 102 130 105" fill="none" stroke="#333" strokeWidth={2} />
            </>
          ) : (
            <>
              <ellipse cx={97} cy={105} rx={10} ry={11} fill="#fff" stroke="#ddd" strokeWidth={1} />
              <ellipse cx={97} cy={106} rx={6} ry={7} fill="#4488aa" />
              <circle cx={97} cy={105} r={4} fill="#223344" />
              <circle cx={95} cy={103} r={2} fill="#fff" />

              <ellipse cx={123} cy={105} rx={10} ry={11} fill="#fff" stroke="#ddd" strokeWidth={1} />
              <ellipse cx={123} cy={106} rx={6} ry={7} fill="#4488aa" />
              <circle cx={123} cy={105} r={4} fill="#223344" />
              <circle cx={121} cy={103} r={2} fill="#fff" />
            </>
          )}

          {/* Eyebrows */}
          <path d="M87 95 Q93 91 103 94" fill="none" stroke="#553320" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M117 94 Q127 91 133 95" fill="none" stroke="#553320" strokeWidth={2.5} strokeLinecap="round" />

          {/* Nose */}
          <path d="M108 115 Q110 119 113 115" fill="none" stroke="#d8a880" strokeWidth={1.5} />

          {/* Mouth — slight smile */}
          <path d="M98 126 Q105 132 110 131 Q115 132 122 126" fill="none" stroke="#aa6655" strokeWidth={2} strokeLinecap="round" />

          {/* Blush */}
          <ellipse cx={88} cy={120} rx={8} ry={5} fill="#ffaaaa" opacity={0.3} />
          <ellipse cx={132} cy={120} rx={8} ry={5} fill="#ffaaaa" opacity={0.3} />

          {/* Freckles */}
          {[0, 1, 2].map(i => (
            <g key={i}>
              <circle cx={86 + i * 4} cy={116 + (i % 2) * 3} r={1} fill="#d0a080" opacity={0.5} />
              <circle cx={130 + i * 4} cy={116 + (i % 2) * 3} r={1} fill="#d0a080" opacity={0.5} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

// ---- Boy Character (nerdy scientist type) ----
const BoyScientist: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const breathe = Math.sin(time * 1.3) * 1.5;
  const blink = Math.sin(time * 2.8) > 0.93 ? 1 : 0;
  const headBob = Math.sin(time * 1.0) * 2;
  const armGesture = Math.sin(time * 1.5) * 10;
  const glassesShine = 0.2 + Math.sin(time * 2) * 0.15;
  const labCoatWave = Math.sin(time * 0.8) * 2;

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
    }}>
      <svg width={220} height={380} viewBox="0 0 220 380" style={{ overflow: 'visible' }}>
        {/* Legs */}
        <rect x={82} y={260 + breathe} width={24} height={60} rx={12} fill="#334" />
        <rect x={114} y={260 + breathe} width={24} height={60} rx={12} fill="#2a2f3a" />
        {/* Shoes */}
        <ellipse cx={94} cy={322 + breathe} rx={16} ry={8} fill="#333" stroke="#444" strokeWidth={1} />
        <ellipse cx={126} cy={322 + breathe} rx={16} ry={8} fill="#333" stroke="#444" strokeWidth={1} />

        {/* Lab coat — white, open */}
        <path d={`M68 ${165 + breathe} Q65 ${200 + breathe} 68 ${240 + breathe} L72 ${275 + breathe + labCoatWave} L82 ${272 + breathe} L80 ${240 + breathe} L80 ${180 + breathe}`}
          fill="#e8e8ee" stroke="#ccc" strokeWidth={1} />
        <path d={`M152 ${165 + breathe} Q155 ${200 + breathe} 152 ${240 + breathe} L148 ${275 + breathe - labCoatWave} L138 ${272 + breathe} L140 ${240 + breathe} L140 ${180 + breathe}`}
          fill="#e8e8ee" stroke="#ccc" strokeWidth={1} />

        {/* Body — shirt underneath */}
        <path d={`M82 ${162 + breathe} Q78 ${185 + breathe} 80 ${220 + breathe} L82 ${265 + breathe} L138 ${265 + breathe} L140 ${220 + breathe} Q142 ${185 + breathe} 138 ${162 + breathe} Z`}
          fill="#3377aa" stroke="#2266aa" strokeWidth={1} />
        {/* Shirt pocket with pen */}
        <rect x={118} y={178 + breathe} width={16} height={18} rx={2} fill="none" stroke="#2266aa" strokeWidth={1} />
        <line x1={124} y1={175 + breathe} x2={124} y2={185 + breathe} stroke="#cc3333" strokeWidth={2} />
        <circle cx={124} cy={174 + breathe} r={1.5} fill="#cc3333" />

        {/* Tie */}
        <path d={`M105 ${165 + breathe} L110 ${175 + breathe} L115 ${165 + breathe} L112 ${205 + breathe} L110 ${210 + breathe} L108 ${205 + breathe} Z`}
          fill="#cc3333" stroke="#aa2222" strokeWidth={0.5} />

        {/* Left arm — gesturing up */}
        <g transform={`rotate(${-30 + armGesture} 85 170)`}>
          <path d={`M82 ${170 + breathe} Q60 ${185 + breathe} 48 ${200 + breathe}`}
            fill="none" stroke="#e8e8ee" strokeWidth={18} strokeLinecap="round" />
          <circle cx={45} cy={204 + breathe} r={10} fill="#f0c8a0" />
          {/* Pointing finger */}
          <path d={`M38 ${200 + breathe} Q32 ${195 + breathe} 28 ${190 + breathe}`}
            fill="none" stroke="#f0c8a0" strokeWidth={5} strokeLinecap="round" />
        </g>

        {/* Right arm — holding clipboard */}
        <g transform={`rotate(${5} 135 170)`}>
          <path d={`M138 ${170 + breathe} Q155 ${200 + breathe} 158 ${225 + breathe}`}
            fill="none" stroke="#e8e8ee" strokeWidth={18} strokeLinecap="round" />
          <circle cx={160} cy={229 + breathe} r={10} fill="#f0c8a0" />
          {/* Clipboard */}
          <rect x={150} y={215 + breathe} width={30} height={40} rx={2} fill="#ddc8a0" stroke="#aa9870" strokeWidth={1} />
          <rect x={158} y={212 + breathe} width={14} height={6} rx={1} fill="#887766" />
          {/* Lines on clipboard */}
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1={155} y1={225 + i * 7 + breathe} x2={175} y2={225 + i * 7 + breathe}
              stroke="#aa9870" strokeWidth={0.8} opacity={0.6} />
          ))}
        </g>

        {/* Neck */}
        <rect x={100} y={150 + breathe} width={20} height={16} rx={5} fill="#f0c8a0" />

        {/* Head */}
        <g transform={`translate(0, ${headBob})`}>
          {/* Face */}
          <ellipse cx={110} cy={108} rx={38} ry={42} fill="#f0c8a0" stroke="#e0b890" strokeWidth={1} />

          {/* Hair — messy, dark */}
          <path d={`M72 95 Q70 65 90 55 Q110 48 130 55 Q150 65 148 95 Q140 80 125 75 Q110 72 95 75 Q80 80 72 95 Z`}
            fill="#2a2020" />
          {/* Messy hair spikes */}
          <path d="M85 62 L80 48 L92 58" fill="#2a2020" />
          <path d="M110 55 L112 40 L118 53" fill="#2a2020" />
          <path d="M135 60 L140 46 L142 60" fill="#2a2020" />

          {/* Glasses */}
          <circle cx={95} cy={106} r={14} fill="none" stroke="#555" strokeWidth={2.5} />
          <circle cx={125} cy={106} r={14} fill="none" stroke="#555" strokeWidth={2.5} />
          <line x1={109} y1={106} x2={111} y2={106} stroke="#555" strokeWidth={2.5} />
          <line x1={81} y1={106} x2={73} y2={102} stroke="#555" strokeWidth={2} />
          <line x1={139} y1={106} x2={147} y2={102} stroke="#555" strokeWidth={2} />
          {/* Lens shine */}
          <ellipse cx={90} cy={101} rx={5} ry={3} fill={`rgba(255,255,255,${glassesShine})`} transform="rotate(-15 90 101)" />
          <ellipse cx={120} cy={101} rx={5} ry={3} fill={`rgba(255,255,255,${glassesShine})`} transform="rotate(-15 120 101)" />

          {/* Eyes behind glasses */}
          {blink ? (
            <>
              <path d="M89 107 Q95 104 101 107" fill="none" stroke="#333" strokeWidth={2} />
              <path d="M119 107 Q125 104 131 107" fill="none" stroke="#333" strokeWidth={2} />
            </>
          ) : (
            <>
              <ellipse cx={95} cy={107} rx={7} ry={8} fill="#fff" />
              <ellipse cx={95} cy={108} rx={4.5} ry={5.5} fill="#556b2f" />
              <circle cx={95} cy={107} r={3} fill="#2a3a15" />
              <circle cx={93} cy={105} r={1.5} fill="#fff" />

              <ellipse cx={125} cy={107} rx={7} ry={8} fill="#fff" />
              <ellipse cx={125} cy={108} rx={4.5} ry={5.5} fill="#556b2f" />
              <circle cx={125} cy={107} r={3} fill="#2a3a15" />
              <circle cx={123} cy={105} r={1.5} fill="#fff" />
            </>
          )}

          {/* Eyebrows — expressive, raised */}
          <path d="M84 92 Q90 87 100 90" fill="none" stroke="#2a2020" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M120 90 Q130 87 136 92" fill="none" stroke="#2a2020" strokeWidth={2.5} strokeLinecap="round" />

          {/* Nose */}
          <ellipse cx={110} cy={118} rx={5} ry={4} fill="#e8b890" />

          {/* Mouth — excited open smile */}
          <path d="M96 130 Q103 138 110 137 Q117 138 124 130" fill="#cc6655" stroke="#aa5544" strokeWidth={1} />
          <path d="M100 130 Q110 128 120 130" fill="#fff" opacity={0.8} />

          {/* Ears */}
          <ellipse cx={72} cy={110} rx={6} ry={10} fill="#f0c8a0" stroke="#e0b890" strokeWidth={1} />
          <ellipse cx={148} cy={110} rx={6} ry={10} fill="#f0c8a0" stroke="#e0b890" strokeWidth={1} />
        </g>
      </svg>
    </div>
  );
};

// ---- Old Wise Man (narrator type) ----
const WiseOldMan: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const breathe = Math.sin(time * 0.8) * 1.5;
  const blink = Math.sin(time * 2.5) > 0.94 ? 1 : 0;
  const staffGlow = 0.4 + Math.sin(time * 1.5) * 0.3;
  const beardSway = Math.sin(time * 0.6) * 2;
  const cloakWave = Math.sin(time * 0.5) * 3;

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))',
    }}>
      <svg width={260} height={420} viewBox="0 0 260 420" style={{ overflow: 'visible' }}>
        {/* Staff */}
        <line x1={200} y1={60} x2={210} y2={400} stroke="#886644" strokeWidth={5} />
        <line x1={200} y1={60} x2={210} y2={400} stroke="#997755" strokeWidth={3} />
        {/* Staff crystal/orb */}
        <circle cx={198} cy={55} r={12} fill={`rgba(100,180,255,${staffGlow})`} />
        <circle cx={198} cy={55} r={8} fill={`rgba(150,210,255,${staffGlow * 0.8})`} />
        <circle cx={196} cy={52} r={3} fill={`rgba(255,255,255,${staffGlow * 0.6})`} />
        {/* Staff glow halo */}
        <circle cx={198} cy={55} r={20} fill={`rgba(100,180,255,${staffGlow * 0.1})`} />

        {/* Robe body — long, flowing */}
        <path d={`M75 ${175 + breathe} Q65 ${250 + breathe} 60 ${340 + breathe} Q58 ${380 + breathe + cloakWave} 65 ${400 + breathe} L175 ${400 + breathe} Q182 ${380 + breathe - cloakWave} 180 ${340 + breathe} Q175 ${250 + breathe} 165 ${175 + breathe} Z`}
          fill="#334477" stroke="#223366" strokeWidth={1.5} />
        {/* Robe folds */}
        <path d={`M95 ${220 + breathe} Q110 ${280 + breathe} 105 ${350 + breathe}`}
          fill="none" stroke="#2a3a66" strokeWidth={1.5} opacity={0.4} />
        <path d={`M145 ${220 + breathe} Q135 ${280 + breathe} 140 ${350 + breathe}`}
          fill="none" stroke="#2a3a66" strokeWidth={1.5} opacity={0.4} />
        {/* Belt/sash */}
        <path d={`M78 ${230 + breathe} Q120 ${235 + breathe} 162 ${230 + breathe}`}
          fill="none" stroke="#aa8833" strokeWidth={5} />
        <circle cx={120} cy={233 + breathe} r={6} fill="#cc9933" stroke="#aa8833" strokeWidth={1} />

        {/* Left arm in robe */}
        <path d={`M80 ${195 + breathe} Q55 ${220 + breathe} 50 ${250 + breathe}`}
          fill="none" stroke="#334477" strokeWidth={20} strokeLinecap="round" />
        <circle cx={48} cy={254 + breathe} r={10} fill="#e8c8a0" />

        {/* Right arm holding staff */}
        <path d={`M160 ${195 + breathe} Q180 ${215 + breathe} 192 ${230 + breathe}`}
          fill="none" stroke="#334477" strokeWidth={20} strokeLinecap="round" />
        <circle cx={195} cy={234 + breathe} r={10} fill="#e8c8a0" />

        {/* Neck */}
        <rect x={105} y={158 + breathe} width={18} height={20} rx={5} fill="#e8c8a0" />

        {/* Head */}
        <g>
          {/* Face — more angular, older */}
          <ellipse cx={115} cy={112} rx={38} ry={44} fill="#e8c8a0" stroke="#d8b890" strokeWidth={1} />

          {/* White/grey hair */}
          <path d="M77 100 Q75 60 100 48 Q115 42 130 48 Q155 60 153 100 Q145 85 130 78 Q115 75 100 78 Q85 85 77 100 Z"
            fill="#ccc8c0" />
          {/* Hair wisps */}
          <path d="M80 70 Q75 55 78 45" fill="none" stroke="#bbb8b0" strokeWidth={2} strokeLinecap="round" />
          <path d="M150 70 Q155 55 152 45" fill="none" stroke="#bbb8b0" strokeWidth={2} strokeLinecap="round" />

          {/* Bushy eyebrows */}
          <path d="M85 93 Q95 85 108 91" fill="#bbb8b0" stroke="#aaa8a0" strokeWidth={1} />
          <path d="M122 91 Q135 85 145 93" fill="#bbb8b0" stroke="#aaa8a0" strokeWidth={1} />

          {/* Eyes — wise, slightly droopy */}
          {blink ? (
            <>
              <path d="M92 104 Q100 101 108 104" fill="none" stroke="#555" strokeWidth={2} />
              <path d="M122 104 Q130 101 138 104" fill="none" stroke="#555" strokeWidth={2} />
            </>
          ) : (
            <>
              <ellipse cx={100} cy={104} rx={9} ry={8} fill="#fff" stroke="#ddd" strokeWidth={1} />
              <ellipse cx={100} cy={105} rx={5} ry={5.5} fill="#4a6a8a" />
              <circle cx={100} cy={104} r={3} fill="#2a3a4a" />
              <circle cx={98} cy={102} r={1.5} fill="#fff" />

              <ellipse cx={130} cy={104} rx={9} ry={8} fill="#fff" stroke="#ddd" strokeWidth={1} />
              <ellipse cx={130} cy={105} rx={5} ry={5.5} fill="#4a6a8a" />
              <circle cx={130} cy={104} r={3} fill="#2a3a4a" />
              <circle cx={128} cy={102} r={1.5} fill="#fff" />
            </>
          )}
          {/* Crow's feet wrinkles */}
          <path d="M86 106 L82 104 M86 108 L82 108" stroke="#d0a880" strokeWidth={0.8} opacity={0.5} />
          <path d="M144 106 L148 104 M144 108 L148 108" stroke="#d0a880" strokeWidth={0.8} opacity={0.5} />

          {/* Nose — larger, distinctive */}
          <path d="M112 112 Q115 122 118 118 Q116 124 110 122" fill="#ddb890" stroke="#d0a880" strokeWidth={1} />

          {/* Mouth — gentle smile */}
          <path d="M102 132 Q110 137 115 136 Q120 137 128 132" fill="none" stroke="#aa7766" strokeWidth={1.5} strokeLinecap="round" />

          {/* Beard — long flowing */}
          <path d={`M82 130 Q78 ${150 + beardSway} 80 ${180 + beardSway} Q85 ${210 + beardSway} 95 ${230 + beardSway} Q105 ${245 + beardSway} 115 ${250 + beardSway} Q125 ${245 + beardSway} 135 ${230 + beardSway} Q145 ${210 + beardSway} 150 ${180 + beardSway} Q152 ${150 - beardSway} 148 130`}
            fill="#ccc8c0" stroke="#bbb8b0" strokeWidth={1} />
          {/* Beard detail lines */}
          <path d={`M95 ${160 + beardSway} Q108 ${170 + beardSway} 100 ${200 + beardSway}`}
            fill="none" stroke="#bbb8b0" strokeWidth={1} opacity={0.4} />
          <path d={`M135 ${160 + beardSway} Q125 ${175 + beardSway} 130 ${200 + beardSway}`}
            fill="none" stroke="#bbb8b0" strokeWidth={1} opacity={0.4} />
          {/* Mustache */}
          <path d="M100 128 Q108 135 115 128 Q122 135 130 128" fill="#c0bab0" stroke="#b0aaa0" strokeWidth={1} />

          {/* Ears */}
          <ellipse cx={77} cy={108} rx={6} ry={12} fill="#e8c8a0" stroke="#d8b890" strokeWidth={1} />
          <ellipse cx={153} cy={108} rx={6} ry={12} fill="#e8c8a0" stroke="#d8b890" strokeWidth={1} />

          {/* Hat — wizard-style pointed */}
          <path d="M70 82 Q65 40 115 8 Q165 40 160 82 Q140 72 115 70 Q90 72 70 82 Z"
            fill="#334477" stroke="#223366" strokeWidth={1.5} />
          {/* Hat brim */}
          <ellipse cx={115} cy={82} rx={50} ry={10} fill="#334477" stroke="#223366" strokeWidth={1.5} />
          {/* Hat band */}
          <path d="M70 78 Q115 72 160 78" fill="none" stroke="#aa8833" strokeWidth={3} />
          {/* Star on hat */}
          <path d="M115 35 L118 28 L121 35 L128 33 L123 38 L127 45 L120 41 L115 48 L110 41 L103 45 L107 38 L102 33 L109 35 L112 28 Z"
            fill="#ffdd44" opacity={0.8} />
        </g>
      </svg>
    </div>
  );
};

// ---- Background ----
const Bg: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame / 30;
  return (
    <>
      {/* Warm gradient bg */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }} />
      {/* Stars */}
      {useMemo(() => Array.from({ length: 150 }, (_, i) => ({
        x: Math.random() * 1920, y: Math.random() * 600, r: 0.5 + Math.random() * 1.5, tw: 1 + Math.random() * 3,
      })), []).map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: s.x, top: s.y, width: s.r * 2, height: s.r * 2,
          borderRadius: '50%', backgroundColor: '#fff',
          opacity: (0.3 + 0.5 * Math.sin(time * s.tw + i)) * 0.5,
        }} />
      ))}
      {/* Ground */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
        background: 'linear-gradient(180deg, #1a2a1a 0%, #0a150a 100%)' }} />
    </>
  );
};

// ---- Main ----
const CartoonCharacters: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const girlIn = spring({ frame, fps, delay: 15, config: { damping: 200 }, durationInFrames: 40 });
  const boyIn = spring({ frame, fps, delay: 40, config: { damping: 200 }, durationInFrames: 40 });
  const wizardIn = spring({ frame, fps, delay: 65, config: { damping: 200 }, durationInFrames: 40 });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg />

      <div style={{ opacity: girlIn, transform: `translateY(${interpolate(girlIn, [0, 1], [40, 0])}px)` }}>
        <GirlExplorer frame={frame} x={120} y={290} scale={1.15} />
      </div>

      <div style={{ opacity: boyIn, transform: `translateY(${interpolate(boyIn, [0, 1], [40, 0])}px)` }}>
        <BoyScientist frame={frame} x={620} y={290} scale={1.15} />
      </div>

      <div style={{ opacity: wizardIn, transform: `translateY(${interpolate(wizardIn, [0, 1], [40, 0])}px)` }}>
        <WiseOldMan frame={frame} x={1150} y={230} scale={1.1} />
      </div>

      {/* Labels */}
      {[
        { text: 'EXPLORER', x: 155, op: girlIn, color: '#cc6666' },
        { text: 'SCIENTIST', x: 650, op: boyIn, color: '#6699cc' },
        { text: 'WIZARD', x: 1210, op: wizardIn, color: '#aa9944' },
      ].map(l => (
        <div key={l.text} style={{
          position: 'absolute', left: l.x, bottom: 40, fontSize: 26, color: l.color,
          fontFamily: 'Georgia, serif', letterSpacing: 5, opacity: l.op,
          textShadow: `0 0 12px ${l.color}44`,
        }}>{l.text}</div>
      ))}

      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
        pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

export const CartoonCharactersComp: React.FC = () => (
  <Composition
    id="CartoonCharacters"
    component={CartoonCharacters}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default CartoonCharacters;
