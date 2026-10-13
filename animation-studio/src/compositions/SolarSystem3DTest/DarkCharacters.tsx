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
// Dark Adult Characters — Horror / Noir / Supernatural
// Style: adult proportions, Limbo-meets-Hellboy, muted palette
// NOT chibi. Real human ratios: 7-8 heads tall, angular features
// ============================================================

// ---- Paranormal Detective (trenchcoat, flashlight, weary face) ----
const Detective: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const breathe = Math.sin(time * 1.2) * 1.5;
  const coatSway = Math.sin(time * 0.7) * 3;
  const flashlightFlicker = 0.75 + Math.sin(time * 8) * 0.15 + Math.sin(time * 13) * 0.1;
  const headTilt = Math.sin(time * 0.5) * 1.5;
  const blinkCycle = Math.sin(time * 2.8);
  const blink = blinkCycle > 0.93 ? 1 : 0;
  const armMove = Math.sin(time * 0.9) * 2;
  const shadowPulse = 0.3 + Math.sin(time * 1.5) * 0.1;

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 20px rgba(200,170,80,0.08))',
    }}>
      <svg width={280} height={500} viewBox="0 0 280 500" style={{ overflow: 'visible' }}>
        {/* Flashlight beam — cone of pale yellow light */}
        <defs>
          <radialGradient id="flashbeam" cx="0%" cy="50%" r="100%">
            <stop offset="0%" stopColor="#fff8cc" stopOpacity={flashlightFlicker * 0.15} />
            <stop offset="100%" stopColor="#fff8cc" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="coatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1a1f" />
            <stop offset="100%" stopColor="#111115" />
          </linearGradient>
        </defs>

        {/* Flashlight beam cone */}
        <path d={`M${85 + armMove} 265 L${20 + armMove * 2} 180 L${-30 + armMove * 2} 320`}
          fill="url(#flashbeam)" opacity={flashlightFlicker * 0.6} />

        {/* ── LEGS ── */}
        {/* Left leg — dark pants */}
        <path d={`M115 ${395 + breathe} L110 ${455} L105 ${475} L95 ${480} L125 ${480} L120 ${475} L118 ${455} Z`}
          fill="#15151a" stroke="#1a1a20" strokeWidth={0.5} />
        {/* Right leg */}
        <path d={`M155 ${395 + breathe} L160 ${455} L162 ${475} L170 ${480} L140 ${480} L145 ${475} L148 ${455} Z`}
          fill="#15151a" stroke="#1a1a20" strokeWidth={0.5} />
        {/* Shoes — worn leather */}
        <path d="M92 478 Q95 485 100 488 L128 488 Q130 485 128 478 Z" fill="#1a1410" stroke="#0d0a08" strokeWidth={0.8} />
        <path d="M138 478 Q140 485 143 488 L172 488 Q175 485 172 478 Z" fill="#1a1410" stroke="#0d0a08" strokeWidth={0.8} />

        {/* ── TRENCHCOAT ── */}
        {/* Coat body — long, flowing past knees */}
        <path d={`M75 ${195 + breathe} Q68 ${250} 65 ${310 + coatSway} Q60 ${370 + coatSway} 62 ${420 + coatSway} L70 ${425 + coatSway * 0.5} L80 ${418 + coatSway} Q85 ${370 - coatSway * 0.5} 90 ${310} Q95 ${250} 100 ${200 + breathe} Z`}
          fill="url(#coatGrad)" stroke="#222228" strokeWidth={0.5} />
        <path d={`M195 ${195 + breathe} Q202 ${250} 205 ${310 - coatSway} Q210 ${370 - coatSway} 208 ${420 - coatSway} L200 ${425 - coatSway * 0.5} L190 ${418 - coatSway} Q185 ${370 + coatSway * 0.5} 180 ${310} Q175 ${250} 170 ${200 + breathe} Z`}
          fill="url(#coatGrad)" stroke="#222228" strokeWidth={0.5} />

        {/* Coat center body */}
        <rect x={100} y={195 + breathe} width={70} height={210} rx={2} fill="#16161b" />

        {/* Coat collar — popped up */}
        <path d={`M90 ${195 + breathe} Q100 ${180 + breathe} 110 ${175 + breathe}`}
          fill="none" stroke="#222228" strokeWidth={6} strokeLinecap="round" />
        <path d={`M180 ${195 + breathe} Q170 ${180 + breathe} 160 ${175 + breathe}`}
          fill="none" stroke="#222228" strokeWidth={6} strokeLinecap="round" />

        {/* Belt */}
        <rect x={88} y={295 + breathe} width={95} height={5} rx={2} fill="#2a2218" />
        <rect x={130} y={293 + breathe} width={10} height={9} rx={1} fill="#3a3020" stroke="#4a4030" strokeWidth={0.5} />

        {/* Coat buttons */}
        {[0, 1, 2].map(i => (
          <circle key={i} cx={135} cy={220 + i * 28 + breathe} r={2.5} fill="#2a2a30" stroke="#3a3a40" strokeWidth={0.5} />
        ))}

        {/* ── LEFT ARM (flashlight arm) ── */}
        <path d={`M85 ${200 + breathe} Q75 ${230 + breathe + armMove} ${80 + armMove} ${260 + breathe}`}
          fill="none" stroke="#16161b" strokeWidth={22} strokeLinecap="round" />
        {/* Hand */}
        <circle cx={80 + armMove} cy={262 + breathe} r={8} fill="#c4a882" />
        {/* Flashlight */}
        <rect x={70 + armMove} y={255 + breathe} width={28} height={8} rx={3} fill="#3a3a40" stroke="#555" strokeWidth={0.5} />
        <circle cx={73 + armMove} cy={259 + breathe} r={4} fill={`rgba(255,248,180,${flashlightFlicker * 0.8})`} />
        <circle cx={73 + armMove} cy={259 + breathe} r={6} fill={`rgba(255,248,180,${flashlightFlicker * 0.12})`} />

        {/* ── RIGHT ARM ── */}
        <path d={`M185 ${200 + breathe} Q195 ${235 + breathe} 190 ${275 + breathe}`}
          fill="none" stroke="#16161b" strokeWidth={20} strokeLinecap="round" />
        {/* Hand in pocket hint */}
        <path d={`M188 ${272 + breathe} Q190 ${280 + breathe} 185 ${290 + breathe}`}
          fill="none" stroke="#16161b" strokeWidth={12} strokeLinecap="round" />

        {/* ── NECK ── */}
        <rect x={125} y={165 + breathe} width={20} height={18} rx={3} fill="#c4a882" />

        {/* ── HEAD ── */}
        <g transform={`rotate(${headTilt} 135 ${140 + breathe})`}>
          {/* Face shape — angular jaw, adult proportions */}
          <path d={`M110 ${110 + breathe} Q108 ${95 + breathe} 115 ${82 + breathe} Q125 ${68 + breathe} 140 ${65 + breathe} Q155 ${68 + breathe} 165 ${82 + breathe} Q172 ${95 + breathe} 170 ${110 + breathe} Q168 ${135 + breathe} 160 ${150 + breathe} Q150 ${158 + breathe} 140 ${160 + breathe} Q130 ${158 + breathe} 120 ${150 + breathe} Q112 ${135 + breathe} 110 ${110 + breathe} Z`}
            fill="#c4a882" stroke="#a89070" strokeWidth={0.8} />

          {/* Stubble shadow on jaw */}
          <path d={`M118 ${138 + breathe} Q130 ${150 + breathe} 140 ${152 + breathe} Q150 ${150 + breathe} 162 ${138 + breathe}`}
            fill="rgba(80,70,60,0.15)" />

          {/* Hair — dark, slightly messy */}
          <path d={`M108 ${105 + breathe} Q105 ${85 + breathe} 112 ${72 + breathe} Q120 ${62 + breathe} 140 ${58 + breathe} Q160 ${62 + breathe} 170 ${72 + breathe} Q175 ${85 + breathe} 172 ${100 + breathe} Q170 ${90 + breathe} 165 ${80 + breathe} Q155 ${68 + breathe} 140 ${65 + breathe} Q125 ${68 + breathe} 115 ${80 + breathe} Q110 ${90 + breathe} 108 ${105 + breathe} Z`}
            fill="#1a1510" />
          {/* Hair strands falling on forehead */}
          <path d={`M122 ${75 + breathe} Q125 ${82 + breathe} 120 ${88 + breathe}`}
            fill="none" stroke="#1a1510" strokeWidth={3} />
          <path d={`M133 ${72 + breathe} Q130 ${80 + breathe} 132 ${86 + breathe}`}
            fill="none" stroke="#1a1510" strokeWidth={2.5} />

          {/* Eyebrows — furrowed, serious */}
          <path d={`M119 ${96 + breathe} Q125 ${92 + breathe} 135 ${94 + breathe}`}
            fill="none" stroke="#1a1510" strokeWidth={2.5} strokeLinecap="round" />
          <path d={`M148 ${94 + breathe} Q158 ${92 + breathe} 163 ${96 + breathe}`}
            fill="none" stroke="#1a1510" strokeWidth={2.5} strokeLinecap="round" />

          {/* Eyes — narrow, tired */}
          <ellipse cx={127} cy={105 + breathe} rx={8} ry={blink ? 0.5 : 4.5} fill="#e8e4dc" />
          <ellipse cx={155} cy={105 + breathe} rx={8} ry={blink ? 0.5 : 4.5} fill="#e8e4dc" />
          {!blink && <>
            <circle cx={128} cy={105 + breathe} r={3} fill="#3a5540" />
            <circle cx={128} cy={105 + breathe} r={1.8} fill="#111" />
            <circle cx={156} cy={105 + breathe} r={3} fill="#3a5540" />
            <circle cx={156} cy={105 + breathe} r={1.8} fill="#111" />
            <circle cx={126.5} cy={103.5 + breathe} r={0.8} fill="#fff" opacity={0.6} />
            <circle cx={154.5} cy={103.5 + breathe} r={0.8} fill="#fff" opacity={0.6} />
          </>}
          {/* Eye bags / dark circles */}
          <path d={`M120 ${110 + breathe} Q127 ${113 + breathe} 134 ${110 + breathe}`}
            fill="none" stroke="rgba(100,80,70,0.25)" strokeWidth={1.5} />
          <path d={`M148 ${110 + breathe} Q155 ${113 + breathe} 162 ${110 + breathe}`}
            fill="none" stroke="rgba(100,80,70,0.25)" strokeWidth={1.5} />

          {/* Nose — angular */}
          <path d={`M138 ${100 + breathe} L135 ${120 + breathe} L130 ${124 + breathe} Q135 ${126 + breathe} 140 ${124 + breathe} L145 ${124 + breathe}`}
            fill="none" stroke="#a89070" strokeWidth={1.2} />

          {/* Mouth — thin, set, stern */}
          <path d={`M127 ${135 + breathe} Q135 ${137 + breathe} 140 ${136 + breathe} Q145 ${137 + breathe} 153 ${135 + breathe}`}
            fill="none" stroke="#8a6a55" strokeWidth={1.5} strokeLinecap="round" />

          {/* Scar on right cheek */}
          <path d={`M158 ${118 + breathe} L163 ${128 + breathe}`}
            fill="none" stroke="rgba(180,140,120,0.4)" strokeWidth={1} />
        </g>

        {/* Shadow underneath */}
        <ellipse cx={135} cy={490} rx={55} ry={6}
          fill={`rgba(0,0,0,${shadowPulse})`} />
      </svg>
    </div>
  );
};

// ---- Cultist / Occultist (hooded robe, ritual staff, rune glow) ----
const Cultist: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const breathe = Math.sin(time * 0.8) * 2;
  const runeGlow = 0.4 + Math.sin(time * 2) * 0.4;
  const runePulseB = 0.3 + Math.sin(time * 2.5 + 1) * 0.35;
  const staffFloat = Math.sin(time * 0.6) * 3;
  const robeSway = Math.sin(time * 0.5) * 2;
  const headTilt = Math.sin(time * 0.4) * 1.5;
  const handGlow = 0.2 + Math.sin(time * 3) * 0.15;
  const orbRotate = time * 40; // degrees, continuous rotation

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 25px rgba(180,50,50,0.1))',
    }}>
      <svg width={300} height={510} viewBox="0 0 300 510" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="runeGlowGrad">
            <stop offset="0%" stopColor="#ff3333" stopOpacity={runeGlow * 0.6} />
            <stop offset="100%" stopColor="#ff3333" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="orbGrad">
            <stop offset="0%" stopColor="#ff6644" stopOpacity={0.9} />
            <stop offset="40%" stopColor="#cc2200" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#880000" stopOpacity={0.3} />
          </radialGradient>
        </defs>

        {/* ── ROBE (full body) ── */}
        {/* Main robe — dark burgundy/black */}
        <path d={`M90 ${180 + breathe} Q80 ${250 + robeSway} 72 ${330 + robeSway} Q65 ${400 + robeSway} 60 ${470 + robeSway} L70 ${475 + robeSway * 0.5} L82 ${468 + robeSway} L95 ${478 + robeSway * 0.3} Q100 ${400} 105 ${330} Q108 ${260} 110 ${195 + breathe} Z`}
          fill="#140a0e" stroke="#1e1015" strokeWidth={0.5} />
        <path d={`M200 ${180 + breathe} Q210 ${250 - robeSway} 218 ${330 - robeSway} Q225 ${400 - robeSway} 230 ${470 - robeSway} L220 ${475 - robeSway * 0.5} L208 ${468 - robeSway} L195 ${478 - robeSway * 0.3} Q190 ${400} 185 ${330} Q182 ${260} 180 ${195 + breathe} Z`}
          fill="#140a0e" stroke="#1e1015" strokeWidth={0.5} />

        {/* Robe center */}
        <rect x={110} y={195 + breathe} width={70} height={280} rx={2} fill="#120a0d" />

        {/* Robe sash/rope belt */}
        <path d={`M92 ${290 + breathe} Q145 ${285 + breathe} 198 ${290 + breathe}`}
          fill="none" stroke="#3a2020" strokeWidth={4} />
        {/* Hanging rope end */}
        <path d={`M140 ${288 + breathe} L135 ${320 + breathe + robeSway} L138 ${340 + breathe + robeSway}`}
          fill="none" stroke="#3a2020" strokeWidth={3} strokeLinecap="round" />

        {/* Robe symbol — pentagram/rune on chest */}
        <g transform={`translate(145, ${235 + breathe})`}>
          <circle cx={0} cy={0} r={18} fill="none" stroke={`rgba(200,40,40,${runeGlow * 0.6})`} strokeWidth={1} />
          {/* Pentagram */}
          {[0, 1, 2, 3, 4].map(i => {
            const a1 = ((i * 144 - 90) * Math.PI) / 180;
            const a2 = (((i + 1) * 144 - 90) * Math.PI) / 180;
            return (
              <line key={i}
                x1={Math.cos(a1) * 14} y1={Math.sin(a1) * 14}
                x2={Math.cos(a2) * 14} y2={Math.sin(a2) * 14}
                stroke={`rgba(200,40,40,${runeGlow * 0.5})`} strokeWidth={0.8} />
            );
          })}
          {/* Glow */}
          <circle cx={0} cy={0} r={28} fill={`rgba(200,40,40,${runeGlow * 0.06})`} />
        </g>

        {/* ── HOOD ── */}
        <path d={`M95 ${185 + breathe} Q90 ${155 + breathe} 100 ${130 + breathe} Q115 ${100 + breathe} 145 ${90 + breathe} Q175 ${100 + breathe} 190 ${130 + breathe} Q200 ${155 + breathe} 195 ${185 + breathe} Q190 ${195 + breathe} 145 ${200 + breathe} Q100 ${195 + breathe} 95 ${185 + breathe} Z`}
          fill="#140a0e" stroke="#1e1015" strokeWidth={1} />

        {/* Hood inner shadow */}
        <ellipse cx={145} cy={155 + breathe} rx={35} ry={30} fill="#080408" />

        <g transform={`rotate(${headTilt} 145 ${140 + breathe})`}>
          {/* Face — pale, gaunt, partially hidden */}
          <path d={`M120 ${130 + breathe} Q118 ${115 + breathe} 125 ${108 + breathe} Q135 ${100 + breathe} 145 ${98 + breathe} Q155 ${100 + breathe} 165 ${108 + breathe} Q172 ${115 + breathe} 170 ${130 + breathe} Q168 ${150 + breathe} 160 ${165 + breathe} Q152 ${170 + breathe} 145 ${172 + breathe} Q138 ${170 + breathe} 130 ${165 + breathe} Q122 ${150 + breathe} 120 ${130 + breathe} Z`}
            fill="#c8b8a0" stroke="none" />

          {/* Face in shadow — lower half barely visible */}
          <path d={`M118 ${140 + breathe} Q145 ${135 + breathe} 172 ${140 + breathe} L172 ${130 + breathe} Q145 ${125 + breathe} 118 ${130 + breathe} Z`}
            fill="rgba(8,4,8,0.3)" />

          {/* Eyes — deep set, intense, glowing slightly red */}
          <ellipse cx={133} cy={125 + breathe} rx={7} ry={4} fill="#0a0408" />
          <ellipse cx={157} cy={125 + breathe} rx={7} ry={4} fill="#0a0408" />
          <ellipse cx={133} cy={125 + breathe} rx={4} ry={2.5} fill={`rgba(220,60,30,${runeGlow * 0.7})`} />
          <ellipse cx={157} cy={125 + breathe} rx={4} ry={2.5} fill={`rgba(220,60,30,${runeGlow * 0.7})`} />
          {/* Eye glow halo */}
          <ellipse cx={133} cy={125 + breathe} rx={12} ry={8} fill={`rgba(220,60,30,${runeGlow * 0.06})`} />
          <ellipse cx={157} cy={125 + breathe} rx={12} ry={8} fill={`rgba(220,60,30,${runeGlow * 0.06})`} />

          {/* Nose — barely visible */}
          <line x1={145} y1={133 + breathe} x2={143} y2={142 + breathe} stroke="rgba(100,80,65,0.3)" strokeWidth={1} />

          {/* Mouth — hidden in shadow, thin line */}
          <path d={`M135 ${153 + breathe} Q145 ${155 + breathe} 155 ${153 + breathe}`}
            fill="none" stroke="rgba(80,50,50,0.3)" strokeWidth={1} />
        </g>

        {/* ── LEFT ARM + STAFF ── */}
        <path d={`M95 ${200 + breathe} Q80 ${240 + breathe} 75 ${280 + breathe + staffFloat}`}
          fill="none" stroke="#140a0e" strokeWidth={20} strokeLinecap="round" />
        {/* Hand gripping staff */}
        <circle cx={75} cy={282 + breathe + staffFloat} r={7} fill="#c8b8a0" />

        {/* Staff */}
        <line x1={75} y1={100 + staffFloat} x2={75} y2={470 + staffFloat} stroke="#2a1a15" strokeWidth={5} />
        <line x1={75} y1={100 + staffFloat} x2={75} y2={470 + staffFloat} stroke="#3a2a22" strokeWidth={3} />

        {/* Staff top — floating orb */}
        <g transform={`translate(75, ${85 + staffFloat})`}>
          {/* Orb cradle — twisted metal */}
          <path d="M-8 10 Q-12 0 -8 -8 Q0 -14 8 -8 Q12 0 8 10" fill="none" stroke="#3a2a22" strokeWidth={2} />
          {/* Orb */}
          <circle cx={0} cy={-2} r={10} fill="url(#orbGrad)" />
          <circle cx={-3} cy={-5} r={3} fill="rgba(255,200,150,0.3)" />
          {/* Orb glow */}
          <circle cx={0} cy={-2} r={18} fill={`rgba(220,60,30,${runeGlow * 0.1})`} />

          {/* Rotating rune marks around orb */}
          {[0, 1, 2].map(i => {
            const a = ((orbRotate + i * 120) * Math.PI) / 180;
            return (
              <circle key={i} cx={Math.cos(a) * 15} cy={Math.sin(a) * 15 - 2} r={1.5}
                fill={`rgba(255,80,40,${runePulseB})`} />
            );
          })}
        </g>

        {/* ── RIGHT ARM — raised, casting ── */}
        <path d={`M195 ${200 + breathe} Q215 ${225 + breathe} 220 ${250 + breathe}`}
          fill="none" stroke="#140a0e" strokeWidth={20} strokeLinecap="round" />
        {/* Hand — open, fingers spread */}
        <g transform={`translate(222, ${252 + breathe})`}>
          <circle cx={0} cy={0} r={7} fill="#c8b8a0" />
          {/* Fingers */}
          {[-20, -10, 0, 10, 20].map((angle, i) => {
            const a = ((angle - 30) * Math.PI) / 180;
            return (
              <line key={i} x1={Math.cos(a) * 5} y1={Math.sin(a) * 5}
                x2={Math.cos(a) * 14} y2={Math.sin(a) * 14}
                stroke="#c8b8a0" strokeWidth={2.5} strokeLinecap="round" />
            );
          })}
          {/* Glow from hand */}
          <circle cx={0} cy={0} r={20} fill={`rgba(220,60,30,${handGlow * 0.15})`} />
        </g>

        {/* Floating rune particles */}
        {[0, 1, 2, 3, 4].map(i => {
          const px = 145 + Math.sin(time * 0.5 + i * 1.3) * 60;
          const py = 250 + Math.cos(time * 0.4 + i * 1.7) * 80;
          return (
            <circle key={i} cx={px} cy={py + breathe} r={1.5 + Math.sin(time * 2 + i) * 0.8}
              fill={`rgba(200,40,40,${0.1 + Math.sin(time + i) * 0.06})`} />
          );
        })}

        {/* Shadow */}
        <ellipse cx={145} cy={490} rx={50} ry={6} fill="rgba(0,0,0,0.3)" />
      </svg>
    </div>
  );
};

// ---- Haunted Woman / Ghost Medium (flowing hair, ethereal dress, spirit energy) ----
const Medium: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const float = Math.sin(time * 0.5) * 6;
  const breathe = Math.sin(time * 1.0) * 2;
  const hairFlow = Math.sin(time * 0.6);
  const eyeGlow = 0.5 + Math.sin(time * 1.8) * 0.4;
  const dressWave = Math.sin(time * 0.4) * 4;
  const spiritOrbs = time * 0.8;
  const headTilt = Math.sin(time * 0.35) * 2;
  const blinkCycle = Math.sin(time * 2.2);
  const blink = blinkCycle > 0.95 ? 1 : 0;
  const handFloat = Math.sin(time * 0.7) * 5;

  return (
    <div style={{
      position: 'absolute', left: x, top: y + float,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 30px rgba(120,160,255,0.1))',
    }}>
      <svg width={320} height={520} viewBox="0 0 320 520" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="dressGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1825" />
            <stop offset="60%" stopColor="#12101a" />
            <stop offset="100%" stopColor="#0a0810" stopOpacity={0.7} />
          </linearGradient>
          <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0a12" />
            <stop offset="100%" stopColor="#151520" />
          </linearGradient>
        </defs>

        {/* Spirit energy wisps around */}
        {[0, 1, 2, 3, 4, 5].map(i => {
          const angle = spiritOrbs + i * 1.05;
          const radius = 100 + Math.sin(time * 0.3 + i) * 30;
          const px = 160 + Math.cos(angle) * radius;
          const py = 260 + Math.sin(angle) * radius * 0.6;
          const op = 0.08 + Math.sin(time * 1.5 + i) * 0.05;
          return (
            <g key={i}>
              <circle cx={px} cy={py + breathe} r={3 + Math.sin(time + i) * 1.5} fill={`rgba(130,170,255,${op})`} />
              <circle cx={px} cy={py + breathe} r={8} fill={`rgba(130,170,255,${op * 0.3})`} />
            </g>
          );
        })}

        {/* ── DRESS — long, flowing, slightly transparent at bottom ── */}
        <path d={`M105 ${220 + breathe} Q90 ${300 + dressWave} 75 ${380 + dressWave} Q60 ${440 + dressWave} 50 ${490 + dressWave} Q55 ${495 + dressWave} 65 ${492 + dressWave} Q80 ${488 + dressWave} 100 ${495 + dressWave} Q120 ${490 + dressWave * 0.5} 140 ${495} Q160 ${490 - dressWave * 0.5} 180 ${495 - dressWave * 0.3} Q200 ${492 - dressWave} 220 ${488 - dressWave} Q235 ${495 - dressWave} 250 ${490 - dressWave} Q240 ${440 - dressWave} 225 ${380 - dressWave} Q210 ${300 - dressWave} 195 ${220 + breathe} Z`}
          fill="url(#dressGrad)" stroke="#1e1a28" strokeWidth={0.5} />

        {/* Dress inner folds */}
        <path d={`M120 ${270 + breathe + dressWave * 0.3} Q150 ${350 + dressWave * 0.5} 130 ${450 + dressWave}`}
          fill="none" stroke="rgba(30,25,40,0.5)" strokeWidth={1.5} />
        <path d={`M180 ${270 + breathe - dressWave * 0.3} Q170 ${350 - dressWave * 0.5} 185 ${450 - dressWave}`}
          fill="none" stroke="rgba(30,25,40,0.5)" strokeWidth={1.5} />

        {/* ── SHOULDERS + UPPER BODY ── */}
        <path d={`M110 ${195 + breathe} Q115 ${188 + breathe} 130 ${185 + breathe} L170 ${185 + breathe} Q185 ${188 + breathe} 190 ${195 + breathe} Q195 ${210 + breathe} 195 ${225 + breathe} L105 ${225 + breathe} Q105 ${210 + breathe} 110 ${195 + breathe} Z`}
          fill="#1a1825" />

        {/* Necklace — thin chain with pendant */}
        <path d={`M130 ${188 + breathe} Q150 ${200 + breathe} 170 ${188 + breathe}`}
          fill="none" stroke="#556" strokeWidth={0.8} />
        <circle cx={150} cy={200 + breathe} r={4} fill="none" stroke={`rgba(130,170,255,${eyeGlow * 0.5})`} strokeWidth={1} />
        <circle cx={150} cy={200 + breathe} r={2} fill={`rgba(130,170,255,${eyeGlow * 0.6})`} />

        {/* ── NECK ── */}
        <rect x={140} y={168 + breathe} width={20} height={20} rx={4} fill="#d4c4ae" />

        {/* ── ARMS ── */}
        {/* Left arm — slightly raised */}
        <path d={`M108 ${200 + breathe} Q90 ${230 + breathe + handFloat} 85 ${260 + breathe + handFloat}`}
          fill="none" stroke="#1a1825" strokeWidth={16} strokeLinecap="round" />
        {/* Hand */}
        <ellipse cx={84} cy={264 + breathe + handFloat} rx={6} ry={7} fill="#d4c4ae" />
        {/* Fingers — delicate */}
        {[-12, -5, 2, 8].map((angle, i) => {
          const a = ((angle - 80) * Math.PI) / 180;
          return (
            <line key={i} x1={84 + Math.cos(a) * 5} y1={264 + breathe + handFloat + Math.sin(a) * 5}
              x2={84 + Math.cos(a) * 11} y2={264 + breathe + handFloat + Math.sin(a) * 11}
              stroke="#d4c4ae" strokeWidth={2} strokeLinecap="round" />
          );
        })}
        {/* Spirit energy from hand */}
        <circle cx={82} cy={275 + breathe + handFloat} r={10} fill={`rgba(130,170,255,${eyeGlow * 0.06})`} />

        {/* Right arm */}
        <path d={`M192 ${200 + breathe} Q210 ${235 + breathe - handFloat * 0.5} 215 ${265 + breathe - handFloat * 0.5}`}
          fill="none" stroke="#1a1825" strokeWidth={16} strokeLinecap="round" />
        <ellipse cx={216} cy={268 + breathe - handFloat * 0.5} rx={6} ry={7} fill="#d4c4ae" />

        {/* ── HEAD ── */}
        <g transform={`rotate(${headTilt} 150 ${135 + breathe})`}>
          {/* Face — softer jawline, mature woman */}
          <path d={`M120 ${118 + breathe} Q118 ${105 + breathe} 124 ${92 + breathe} Q133 ${78 + breathe} 150 ${75 + breathe} Q167 ${78 + breathe} 176 ${92 + breathe} Q182 ${105 + breathe} 180 ${118 + breathe} Q178 ${140 + breathe} 172 ${152 + breathe} Q163 ${162 + breathe} 150 ${165 + breathe} Q137 ${162 + breathe} 128 ${152 + breathe} Q122 ${140 + breathe} 120 ${118 + breathe} Z`}
            fill="#d4c4ae" stroke="#b8a898" strokeWidth={0.5} />

          {/* Cheekbones — subtle highlight */}
          <ellipse cx={128} cy={128 + breathe} rx={8} ry={3} fill="rgba(200,170,160,0.15)" />
          <ellipse cx={172} cy={128 + breathe} rx={8} ry={3} fill="rgba(200,170,160,0.15)" />

          {/* Eyes — large, striking, faintly glowing */}
          <ellipse cx={137} cy={115 + breathe} rx={10} ry={blink ? 0.5 : 6} fill="#e8e4dc" />
          <ellipse cx={163} cy={115 + breathe} rx={10} ry={blink ? 0.5 : 6} fill="#e8e4dc" />
          {!blink && <>
            <circle cx={138} cy={115 + breathe} r={4} fill={`rgba(100,140,220,${0.6 + eyeGlow * 0.3})`} />
            <circle cx={138} cy={115 + breathe} r={2.2} fill="#111" />
            <circle cx={164} cy={115 + breathe} r={4} fill={`rgba(100,140,220,${0.6 + eyeGlow * 0.3})`} />
            <circle cx={164} cy={115 + breathe} r={2.2} fill="#111" />
            {/* Eye shine */}
            <circle cx={136} cy={113 + breathe} r={1.2} fill="rgba(255,255,255,0.7)" />
            <circle cx={162} cy={113 + breathe} r={1.2} fill="rgba(255,255,255,0.7)" />
            {/* Subtle glow around eyes */}
            <ellipse cx={137} cy={115 + breathe} rx={14} ry={9} fill={`rgba(100,150,255,${eyeGlow * 0.04})`} />
            <ellipse cx={163} cy={115 + breathe} rx={14} ry={9} fill={`rgba(100,150,255,${eyeGlow * 0.04})`} />
          </>}

          {/* Eyebrows — elegant arch */}
          <path d={`M125 ${106 + breathe} Q132 ${102 + breathe} 145 ${104 + breathe}`}
            fill="none" stroke="#1a1510" strokeWidth={1.8} strokeLinecap="round" />
          <path d={`M155 ${104 + breathe} Q168 ${102 + breathe} 175 ${106 + breathe}`}
            fill="none" stroke="#1a1510" strokeWidth={1.8} strokeLinecap="round" />

          {/* Nose — refined */}
          <path d={`M148 ${112 + breathe} L146 ${128 + breathe} Q148 ${132 + breathe} 150 ${131 + breathe} Q153 ${132 + breathe} 154 ${128 + breathe}`}
            fill="none" stroke="rgba(160,140,125,0.5)" strokeWidth={0.8} />

          {/* Lips — fuller, darker */}
          <path d={`M138 ${142 + breathe} Q145 ${139 + breathe} 150 ${140 + breathe} Q155 ${139 + breathe} 162 ${142 + breathe}`}
            fill="none" stroke="#8a5a55" strokeWidth={1.2} />
          <path d={`M138 ${142 + breathe} Q150 ${147 + breathe} 162 ${142 + breathe}`}
            fill="rgba(120,70,70,0.25)" />

          {/* ── HAIR — long, dark, flowing ── */}
          {/* Hair mass on head */}
          <path d={`M115 ${115 + breathe} Q112 ${95 + breathe} 120 ${82 + breathe} Q130 ${70 + breathe} 150 ${68 + breathe} Q170 ${70 + breathe} 180 ${82 + breathe} Q188 ${95 + breathe} 185 ${115 + breathe}`}
            fill="url(#hairGrad)" />

          {/* Long flowing strands — left side */}
          <path d={`M118 ${110 + breathe} Q108 ${160 + breathe} 95 ${220 + breathe + hairFlow * 8} Q85 ${270 + hairFlow * 12} 80 ${310 + hairFlow * 15}`}
            fill="none" stroke="#0e0e18" strokeWidth={12} strokeLinecap="round" />
          <path d={`M115 ${115 + breathe} Q100 ${170 + breathe} 90 ${230 + breathe + hairFlow * 10} Q82 ${280 + hairFlow * 14} 78 ${320 + hairFlow * 16}`}
            fill="none" stroke="#12121c" strokeWidth={8} strokeLinecap="round" />

          {/* Long flowing strands — right side */}
          <path d={`M182 ${110 + breathe} Q192 ${160 + breathe} 205 ${220 + breathe - hairFlow * 8} Q215 ${270 - hairFlow * 12} 220 ${310 - hairFlow * 15}`}
            fill="none" stroke="#0e0e18" strokeWidth={12} strokeLinecap="round" />
          <path d={`M185 ${115 + breathe} Q200 ${170 + breathe} 210 ${230 + breathe - hairFlow * 10} Q218 ${280 - hairFlow * 14} 222 ${320 - hairFlow * 16}`}
            fill="none" stroke="#12121c" strokeWidth={8} strokeLinecap="round" />

          {/* Front bangs */}
          <path d={`M128 ${80 + breathe} Q130 ${90 + breathe} 125 ${100 + breathe}`}
            fill="none" stroke="#0e0e18" strokeWidth={5} strokeLinecap="round" />
          <path d={`M140 ${76 + breathe} Q138 ${85 + breathe} 140 ${95 + breathe}`}
            fill="none" stroke="#0e0e18" strokeWidth={4} strokeLinecap="round" />
        </g>

        {/* Ghost fade at bottom of dress */}
        <ellipse cx={150} cy={498} rx={70} ry={8} fill="rgba(0,0,0,0.2)" />
      </svg>
    </div>
  );
};

// ---- Scarred Soldier / Survivor (military jacket, bandaged arm, haunted eyes) ----
const Survivor: React.FC<{ frame: number; x: number; y: number; scale?: number }> = ({ frame, x, y, scale = 1 }) => {
  const time = frame / 30;
  const breathe = Math.sin(time * 1.0) * 2;
  const headTilt = Math.sin(time * 0.6) * 1;
  const blinkCycle = Math.sin(time * 3.2);
  const blink = blinkCycle > 0.94 ? 1 : 0;
  const shoulderTense = Math.sin(time * 0.8) * 1;
  const scarPulse = 0.4 + Math.sin(time * 1.5) * 0.15;

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${scale})`,
      filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.2))',
    }}>
      <svg width={260} height={500} viewBox="0 0 260 500" style={{ overflow: 'visible' }}>
        {/* ── LEGS ── */}
        <path d={`M100 ${390 + breathe} L95 ${440} L93 ${460} L88 ${470} L118 ${470} L115 ${460} L110 ${440} Z`}
          fill="#1a1a18" />
        <path d={`M150 ${390 + breathe} L155 ${440} L157 ${460} L162 ${470} L132 ${470} L135 ${460} L140 ${440} Z`}
          fill="#1a1a18" />
        {/* Combat boots */}
        <path d="M85 468 Q88 478 93 480 L120 480 Q122 478 120 468 Z" fill="#1a1510" stroke="#0d0a08" strokeWidth={1} />
        <path d="M130 468 Q133 478 138 480 L165 480 Q167 478 165 468 Z" fill="#1a1510" stroke="#0d0a08" strokeWidth={1} />
        {/* Boot laces hint */}
        {[0, 1, 2].map(i => (
          <g key={`bl-${i}`}>
            <line x1={97} y1={470 + i * 3} x2={112} y2={470 + i * 3} stroke="#2a2520" strokeWidth={0.5} />
            <line x1={138} y1={470 + i * 3} x2={153} y2={470 + i * 3} stroke="#2a2520" strokeWidth={0.5} />
          </g>
        ))}

        {/* ── MILITARY JACKET ── */}
        <path d={`M75 ${190 + breathe + shoulderTense} Q70 ${250 + breathe} 72 ${310 + breathe} Q74 ${360} 78 ${395} L172 ${395} Q176 ${360} 178 ${310 + breathe} Q180 ${250 + breathe} 175 ${190 + breathe - shoulderTense} Z`}
          fill="#2a2a20" stroke="#333328" strokeWidth={0.5} />

        {/* Jacket pockets */}
        <rect x={85} y={300 + breathe} width={35} height={25} rx={2} fill="none" stroke="#333328" strokeWidth={1} />
        <rect x={130} y={300 + breathe} width={35} height={25} rx={2} fill="none" stroke="#333328" strokeWidth={1} />
        <line x1={85} y1={308 + breathe} x2={120} y2={308 + breathe} stroke="#333328" strokeWidth={0.5} />
        <line x1={130} y1={308 + breathe} x2={165} y2={308 + breathe} stroke="#333328" strokeWidth={0.5} />

        {/* Jacket collar */}
        <path d={`M88 ${195 + breathe} Q95 ${185 + breathe} 108 ${182 + breathe}`}
          fill="none" stroke="#333328" strokeWidth={5} strokeLinecap="round" />
        <path d={`M162 ${195 + breathe} Q155 ${185 + breathe} 142 ${182 + breathe}`}
          fill="none" stroke="#333328" strokeWidth={5} strokeLinecap="round" />

        {/* Dog tags */}
        <line x1={125} y1={190 + breathe} x2={122} y2={220 + breathe} stroke="#666" strokeWidth={0.8} />
        <rect x={118} y={220 + breathe} width={10} height={14} rx={2} fill="#888" stroke="#666" strokeWidth={0.5} />
        <rect x={120} y={223 + breathe} width={6} height={2} rx={0.5} fill="#666" />

        {/* Zipper line */}
        <line x1={125} y1={195 + breathe} x2={125} y2={390 + breathe} stroke="#444438" strokeWidth={1.5} />

        {/* ── LEFT ARM (bandaged) ── */}
        <path d={`M78 ${195 + breathe + shoulderTense} Q65 ${240 + breathe} 68 ${280 + breathe}`}
          fill="none" stroke="#2a2a20" strokeWidth={20} strokeLinecap="round" />
        {/* Bandage wrapping on forearm */}
        <path d={`M60 ${258 + breathe} Q72 ${255 + breathe} 75 ${268 + breathe}`}
          fill="none" stroke="#c8c0a8" strokeWidth={4} />
        <path d={`M58 ${266 + breathe} Q70 ${263 + breathe} 73 ${276 + breathe}`}
          fill="none" stroke="#c8c0a8" strokeWidth={4} />
        <path d={`M56 ${274 + breathe} Q68 ${271 + breathe} 71 ${284 + breathe}`}
          fill="none" stroke="#c8c0a8" strokeWidth={4} />
        {/* Blood stain on bandage */}
        <circle cx={65} cy={270 + breathe} r={4} fill="rgba(120,30,20,0.3)" />
        {/* Hand */}
        <ellipse cx={67} cy={290 + breathe} rx={7} ry={8} fill="#c4a882" />

        {/* ── RIGHT ARM ── */}
        <path d={`M172 ${195 + breathe - shoulderTense} Q185 ${240 + breathe} 180 ${280 + breathe}`}
          fill="none" stroke="#2a2a20" strokeWidth={20} strokeLinecap="round" />
        <ellipse cx={180} cy={285 + breathe} rx={7} ry={8} fill="#c4a882" />

        {/* ── NECK ── */}
        <rect x={115} y={170 + breathe} width={20} height={18} rx={3} fill="#c4a882" />

        {/* ── HEAD ── */}
        <g transform={`rotate(${headTilt} 125 ${135 + breathe})`}>
          {/* Face — square jaw, weathered */}
          <path d={`M100 ${118 + breathe} Q98 ${100 + breathe} 105 ${88 + breathe} Q115 ${74 + breathe} 130 ${72 + breathe} Q145 ${74 + breathe} 155 ${88 + breathe} Q162 ${100 + breathe} 160 ${118 + breathe} Q158 ${142 + breathe} 152 ${155 + breathe} Q145 ${163 + breathe} 130 ${165 + breathe} Q115 ${163 + breathe} 108 ${155 + breathe} Q102 ${142 + breathe} 100 ${118 + breathe} Z`}
            fill="#c4a882" stroke="#a89070" strokeWidth={0.5} />

          {/* 5 o'clock shadow */}
          <path d={`M108 ${140 + breathe} Q120 ${155 + breathe} 130 ${158 + breathe} Q140 ${155 + breathe} 152 ${140 + breathe}`}
            fill="rgba(60,55,45,0.12)" />

          {/* Short buzz cut hair */}
          <path d={`M100 ${110 + breathe} Q98 ${92 + breathe} 105 ${82 + breathe} Q115 ${70 + breathe} 130 ${68 + breathe} Q145 ${70 + breathe} 155 ${82 + breathe} Q162 ${92 + breathe} 160 ${110 + breathe}`}
            fill="#2a2520" />

          {/* Eyebrows — heavy, stern */}
          <path d={`M108 ${102 + breathe} Q115 ${98 + breathe} 125 ${100 + breathe}`}
            fill="none" stroke="#2a2520" strokeWidth={3} strokeLinecap="round" />
          <path d={`M138 ${100 + breathe} Q148 ${98 + breathe} 155 ${102 + breathe}`}
            fill="none" stroke="#2a2520" strokeWidth={3} strokeLinecap="round" />

          {/* Eyes — intense, haunted, one slightly damaged */}
          {/* Left eye — normal but tired */}
          <ellipse cx={117} cy={112 + breathe} rx={8} ry={blink ? 0.5 : 4.5} fill="#e0dcd4" />
          {!blink && <>
            <circle cx={118} cy={112 + breathe} r={3} fill="#5a7060" />
            <circle cx={118} cy={112 + breathe} r={1.8} fill="#111" />
            <circle cx={116.5} cy={110.5 + breathe} r={0.8} fill="#fff" opacity={0.5} />
          </>}
          {/* Dark circle */}
          <path d={`M110 ${117 + breathe} Q117 ${120 + breathe} 124 ${117 + breathe}`}
            fill="none" stroke="rgba(80,60,50,0.3)" strokeWidth={1.5} />

          {/* Right eye — scar across it */}
          <ellipse cx={145} cy={112 + breathe} rx={8} ry={blink ? 0.5 : 4.5} fill="#e0dcd4" />
          {!blink && <>
            <circle cx={146} cy={112 + breathe} r={3} fill="#5a7060" opacity={0.7} />
            <circle cx={146} cy={112 + breathe} r={1.8} fill="#111" />
            <circle cx={144.5} cy={110.5 + breathe} r={0.6} fill="#fff" opacity={0.3} />
          </>}
          {/* Scar running through right eye */}
          <path d={`M140 ${96 + breathe} Q143 ${105 + breathe} 148 ${112 + breathe} Q150 ${120 + breathe} 152 ${130 + breathe}`}
            fill="none" stroke={`rgba(180,100,80,${scarPulse})`} strokeWidth={2} strokeLinecap="round" />

          {/* Nose — slightly crooked (broken once) */}
          <path d={`M128 ${105 + breathe} L126 ${122 + breathe} Q124 ${128 + breathe} 128 ${130 + breathe} L135 ${130 + breathe}`}
            fill="none" stroke="#a89070" strokeWidth={1.2} />

          {/* Mouth — tight, grim */}
          <path d={`M116 ${142 + breathe} Q125 ${144 + breathe} 130 ${143 + breathe} Q135 ${144 + breathe} 144 ${141 + breathe}`}
            fill="none" stroke="#8a6a55" strokeWidth={1.8} strokeLinecap="round" />
        </g>

        {/* Shadow */}
        <ellipse cx={125} cy={488} rx={48} ry={5} fill="rgba(0,0,0,0.25)" />
      </svg>
    </div>
  );
};

// ---- Main Scene ----
const DarkCharactersScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const detectiveIn = spring({ frame, fps, delay: 15, config: { damping: 200, mass: 1.5 }, durationInFrames: 60 });
  const cultistIn = spring({ frame, fps, delay: 40, config: { damping: 200, mass: 1.5 }, durationInFrames: 60 });
  const mediumIn = spring({ frame, fps, delay: 65, config: { damping: 200, mass: 1.5 }, durationInFrames: 60 });
  const survivorIn = spring({ frame, fps, delay: 90, config: { damping: 200, mass: 1.5 }, durationInFrames: 60 });

  return (
    <AbsoluteFill style={{ backgroundColor: '#08080c', overflow: 'hidden' }}>
      {/* Ambient fog / mist at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: -100, right: -100, height: 200,
        background: 'linear-gradient(to top, rgba(15,12,20,0.6), transparent)',
        filter: 'blur(30px)',
      }} />

      {/* Subtle ground line */}
      <div style={{
        position: 'absolute', bottom: 95, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent 5%, #1a1a22 25%, #1a1a22 75%, transparent 95%)',
        opacity: 0.2,
      }} />

      {/* Ambient color spots */}
      <div style={{ position: 'absolute', left: -50, top: 200, width: 400, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,170,80,0.04), transparent 70%)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', left: 350, top: 150, width: 350, height: 350,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,40,30,0.04), transparent 70%)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', left: 800, top: 180, width: 350, height: 350,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,140,220,0.04), transparent 70%)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', left: 1250, top: 200, width: 350, height: 350,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(80,100,60,0.04), transparent 70%)', filter: 'blur(80px)' }} />

      {/* Detective */}
      <div style={{ opacity: detectiveIn, transform: `translateY(${interpolate(detectiveIn, [0, 1], [40, 0])}px)` }}>
        <Detective frame={frame} x={60} y={140} scale={1.05} />
      </div>

      {/* Cultist */}
      <div style={{ opacity: cultistIn, transform: `translateY(${interpolate(cultistIn, [0, 1], [-30, 0])}px)` }}>
        <Cultist frame={frame} x={400} y={100} scale={1.0} />
      </div>

      {/* Medium */}
      <div style={{ opacity: mediumIn, transform: `translateY(${interpolate(mediumIn, [0, 1], [30, 0])}px)` }}>
        <Medium frame={frame} x={750} y={90} scale={1.0} />
      </div>

      {/* Survivor */}
      <div style={{ opacity: survivorIn, transform: `translateY(${interpolate(survivorIn, [0, 1], [35, 0])}px)` }}>
        <Survivor frame={frame} x={1170} y={140} scale={1.05} />
      </div>

      {/* Labels — subdued, serif */}
      {[
        { text: 'DETECTIVE', x: 110, op: detectiveIn, color: '#8a7a50' },
        { text: 'CULTIST', x: 475, op: cultistIn, color: '#8a3030' },
        { text: 'MEDIUM', x: 845, op: mediumIn, color: '#5a6a8a' },
        { text: 'SURVIVOR', x: 1220, op: survivorIn, color: '#5a6a50' },
      ].map(l => (
        <div key={l.text} style={{
          position: 'absolute', left: l.x, top: 710, fontSize: 22, color: l.color,
          fontFamily: 'Georgia, serif', letterSpacing: 6, opacity: l.op * 0.6,
          textTransform: 'uppercase',
          textShadow: `0 0 15px ${l.color}33`,
        }}>{l.text}</div>
      ))}

      {/* Heavy vignette */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

export const DarkCharactersComp: React.FC = () => (
  <Composition
    id="DarkCharacters"
    component={DarkCharactersScene}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default DarkCharactersScene;
