import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Composition,
  useVideoConfig,
} from 'remotion';

const EC = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

// ============================================================
// THICK STICKMAN HEROES v3 — ULTRA MINIMAL
//
// Formula: Color (80%) + ONE silhouette feature (20%) + ZERO interior detail
//
// Spider-Man = RED body + angular white eyes on head
// Batman     = DARK body + pointed ear triangles on head + cape
// Superman   = BLUE body + RED cape + skin head with curl
// Wonder Woman = RED body + tiara + long hair silhouette
// Creepy Boy = GRAY-GREEN body + red glow eyes in dark sockets
// ============================================================

const R = 'round' as const;

// Universal stickman base
const Stick: React.FC<{
  x: number; y: number; scale: number; frame: number;
  color: string;
  headFill?: string;
  // pose angles (degrees)
  la?: number; ra?: number; // arm angles from down
  ll?: number; rl?: number; // leg angles from down
  // slots
  headExtra?: React.ReactNode;
  behind?: React.ReactNode;
}> = ({ x, y, scale, frame, color, headFill, la = 15, ra = -15, ll = 8, rl = -8, headExtra, behind }) => {
  const t = frame / 30;
  const br = Math.sin(t * 1.3) * 1.5;           // breathe
  const sw = Math.sin(t * 0.7) * 0.6;            // sway
  const blink = (frame % 100) < 3 ? 0.15 : 1;    // blink

  const W = 11;    // limb stroke width
  const BW = 14;   // body width
  const HR = 26;   // head radius
  const hf = headFill || color;

  // geometry
  const headCY = -HR - 4;
  const shY = headCY + HR + 8;
  const hipY = shY + 68 + br;
  const arm = 50;
  const leg = 55;

  // arm/leg endpoints
  const lax = -Math.sin(((la + sw) * Math.PI) / 180) * arm;
  const lay = Math.cos(((la + sw) * Math.PI) / 180) * arm;
  const rax = -Math.sin(((ra - sw) * Math.PI) / 180) * arm;
  const ray = Math.cos(((ra - sw) * Math.PI) / 180) * arm;
  const llx = -Math.sin((ll * Math.PI) / 180) * leg;
  const lly = Math.cos((ll * Math.PI) / 180) * leg;
  const rlx = -Math.sin((rl * Math.PI) / 180) * leg;
  const rly = Math.cos((rl * Math.PI) / 180) * leg;

  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {behind}

      {/* Legs */}
      <line x1={0} y1={hipY} x2={llx} y2={hipY + lly} stroke={color} strokeWidth={W} strokeLinecap={R} />
      <line x1={0} y1={hipY} x2={rlx} y2={hipY + rly} stroke={color} strokeWidth={W} strokeLinecap={R} />
      {/* Feet */}
      <circle cx={llx - 2} cy={hipY + lly + 3} r={6} fill={color} />
      <circle cx={rlx + 2} cy={hipY + rly + 3} r={6} fill={color} />

      {/* Body */}
      <line x1={0} y1={shY} x2={0} y2={hipY} stroke={color} strokeWidth={BW} strokeLinecap={R} />

      {/* Arms */}
      <line x1={0} y1={shY + 4} x2={lax} y2={shY + 4 + lay} stroke={color} strokeWidth={W} strokeLinecap={R} />
      <line x1={0} y1={shY + 4} x2={rax} y2={shY + 4 + ray} stroke={color} strokeWidth={W} strokeLinecap={R} />
      {/* Hands */}
      <circle cx={lax} cy={shY + 4 + lay} r={6.5} fill={color} />
      <circle cx={rax} cy={shY + 4 + ray} r={6.5} fill={color} />

      {/* Head */}
      <g transform={`translate(0,${headCY + br * 0.3})`}>
        <circle cx={0} cy={0} r={HR} fill={hf} stroke="#111" strokeWidth={2.5} />
        {/* Default eyes if no headExtra provides them */}
        {!headExtra && <>
          <circle cx={-8} cy={-3} r={3} fill="#111" transform={`scale(1,${blink})`} />
          <circle cx={8} cy={-3} r={3} fill="#111" transform={`scale(1,${blink})`} />
        </>}
        {headExtra}
      </g>
    </g>
  );
};

// ============================================================
// SPIDER-MAN: red body + BIG angular white eyes (THE feature)
// ============================================================
const Spider: React.FC<{ x: number; y: number; s: number; frame: number }> = ({ x, y, s, frame }) => (
  <Stick x={x} y={y} scale={s} frame={frame}
    color="#cc2233" headFill="#cc2233"
    la={25} ra={-55}
    headExtra={<>
      {/* THE iconic feature: two large angular white eyes */}
      <path d="M-17 -4 L-9 -12 L-2 -3 L-9 3 Z" fill="white" stroke="#880015" strokeWidth={1} />
      <path d="M17 -4 L9 -12 L2 -3 L9 3 Z" fill="white" stroke="#880015" strokeWidth={1} />
    </>}
  />
);

// ============================================================
// BATMAN: dark body + pointed ears (THE feature) + cape
// ============================================================
const Bat: React.FC<{ x: number; y: number; s: number; frame: number }> = ({ x, y, s, frame }) => {
  const t = frame / 30;
  const cw = Math.sin(t * 1.5) * 5;
  return (
    <Stick x={x} y={y} scale={s} frame={frame}
      color="#2a2a35" headFill="#2a2a35"
      la={20} ra={-20}
      behind={<>
        {/* Cape — simple dark shape */}
        <path d={`M-8 -16 L${-35 + cw} ${110 + cw} Q${-20 + cw} ${120 + cw} 0 105 Q${20 - cw} ${120 - cw} ${35 - cw} ${110 - cw} L8 -16 Z`}
          fill="#18182a" />
      </>}
      headExtra={<>
        {/* THE iconic feature: pointed bat-ear triangles */}
        <polygon points="-16,-16 -10,-40 -4,-18" fill="#2a2a35" stroke="#111" strokeWidth={1.5} />
        <polygon points="16,-16 10,-40 4,-18" fill="#2a2a35" stroke="#111" strokeWidth={1.5} />
        {/* White slit eyes — minimal */}
        <path d="M-13 -2 L-7 -6 L-1 -2 Z" fill="white" />
        <path d="M13 -2 L7 -6 L1 -2 Z" fill="white" />
      </>}
    />
  );
};

// ============================================================
// SUPERMAN: blue body + red cape + skin head with black hair curl
// ============================================================
const Super: React.FC<{ x: number; y: number; s: number; frame: number }> = ({ x, y, s, frame }) => {
  const t = frame / 30;
  const cw = Math.sin(t * 1.0) * 7;
  return (
    <Stick x={x} y={y} scale={s} frame={frame}
      color="#1a4dcc" headFill="#daa870" headStroke="#111"
      la={10} ra={-65}
      behind={<>
        {/* Red cape */}
        <path d={`M-7 -14 L${-32 + cw} ${108 + cw} Q0 100 ${32 - cw} ${108 - cw} L7 -14 Z`}
          fill="#cc2222" />
      </>}
      headExtra={<>
        {/* Black hair — simple cap */}
        <path d="M-22 -8 Q-24 -22 -14 -27 Q0 -32 14 -27 Q24 -22 22 -8"
          fill="#1a1a1a" stroke="none" />
        {/* THE feature: signature forehead curl */}
        <path d="M-3 -18 Q-8 -13 -2 -11" fill="#1a1a1a" stroke="none" />
        {/* Simple dot eyes */}
        <circle cx={-8} cy={-2} r={2.5} fill="#111" />
        <circle cx={8} cy={-2} r={2.5} fill="#111" />
      </>}
    />
  );
};

// ============================================================
// WONDER WOMAN: red body + skin head + tiara + long hair silhouette
// ============================================================
const Wonder: React.FC<{ x: number; y: number; s: number; frame: number }> = ({ x, y, s, frame }) => (
  <Stick x={x} y={y} scale={s} frame={frame}
    color="#cc2244" headFill="#daa870"
    la={30} ra={-25}
    headExtra={<>
      {/* Long black hair — THE silhouette change */}
      <path d="M-24 -5 Q-26 12 -22 35" fill="none" stroke="#1a1010" strokeWidth={9} strokeLinecap={R} />
      <path d="M24 -5 Q26 12 22 35" fill="none" stroke="#1a1010" strokeWidth={9} strokeLinecap={R} />
      <path d="M-22 -10 Q-24 -22 -12 -26 Q0 -30 12 -26 Q24 -22 22 -10"
        fill="#1a1010" stroke="none" />
      {/* Gold tiara — simple bright arc */}
      <path d="M-18 -15 Q0 -22 18 -15" fill="none" stroke="#ddb833" strokeWidth={3.5} strokeLinecap={R} />
      {/* Star center */}
      <circle cx={0} cy={-19} r={2.5} fill="#ddb833" />
      {/* Simple dot eyes */}
      <circle cx={-8} cy={-2} r={2.5} fill="#111" />
      <circle cx={8} cy={-2} r={2.5} fill="#111" />
    </>}
  />
);

// ============================================================
// CREEPY BOY: gray-green body + skin head + RED GLOW eyes in dark sockets
// ============================================================
const Creepy: React.FC<{ x: number; y: number; s: number; frame: number }> = ({ x, y, s, frame }) => {
  const t = frame / 30;
  const tremble = Math.sin(t * 12) * 0.6;
  const glow = 0.6 + Math.sin(t * 3) * 0.2;
  return (
    <Stick x={x + tremble} y={y} scale={s} frame={frame}
      color="#4a5a48" headFill="#c4b8a0"
      la={12} ra={-18}
      headExtra={<>
        {/* Messy hair spikes — silhouette */}
        <path d="M-20 -10 Q-22 -22 -12 -26 Q0 -30 12 -26 Q22 -22 20 -10" fill="#3a2a1a" />
        {[-14, -4, 6, 15].map((hx, i) => (
          <line key={i} x1={hx} y1={-22} x2={hx + (i % 2 ? 5 : -4)} y2={-36 - (i % 3) * 4}
            stroke="#3a2a1a" strokeWidth={4.5} strokeLinecap={R} />
        ))}
        {/* THE feature: dark sockets + red glowing eyes */}
        <circle cx={-9} cy={-3} r={9} fill="#1a1015" />
        <circle cx={9} cy={-3} r={9} fill="#1a1015" />
        <circle cx={-9} cy={-3} r={3.5} fill={`rgba(220,50,30,${glow})`} />
        <circle cx={9} cy={-3} r={3.5} fill={`rgba(220,50,30,${glow})`} />
        <circle cx={-9} cy={-3} r={7} fill={`rgba(255,40,20,${glow * 0.1})`} />
        <circle cx={9} cy={-3} r={7} fill={`rgba(255,40,20,${glow * 0.1})`} />
      </>}
    />
  );
};

// ============================================================
// SCENE
// ============================================================
const StickHeroesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / 30;

  const heroes = [
    { C: Spider, label: 'SPIDER-MAN', lc: '#cc3344', cx: 200 },
    { C: Bat, label: 'BATMAN', lc: '#7777aa', cx: 560 },
    { C: Super, label: 'SUPERMAN', lc: '#4466dd', cx: 920 },
    { C: Wonder, label: 'WONDER WOMAN', lc: '#dda833', cx: 1280 },
    { C: Creepy, label: 'CREEPY BOY', lc: '#6a8a60', cx: 1640 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#0c0e14', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #141828 0%, #0e1220 50%, #0a0c14 100%)',
      }} />

      {/* Ground line */}
      <div style={{
        position: 'absolute', bottom: 155, left: 80, right: 80, height: 2,
        background: 'linear-gradient(90deg, transparent, #252a38 20%, #252a38 80%, transparent)',
      }} />

      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
        {heroes.map(({ C, label, lc, cx }, i) => {
          const e = spring({ frame, fps, config: { damping: 14, stiffness: 80 }, delay: i * 8 });
          const fl = Math.sin(t * 0.6 + i * 1.3) * 4;
          return (
            <g key={i} opacity={e} transform={`translate(0,${(1 - e) * 50 + fl})`}>
              <C x={cx} y={580} s={3.2} frame={frame} />
              <text x={cx} y={870} textAnchor="middle"
                fill={lc} fontSize={24} fontFamily="monospace" fontWeight="bold" opacity={0.7}>
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Title */}
      <div style={{
        position: 'absolute', top: 50, left: 0, right: 0, textAlign: 'center',
        opacity: interpolate(frame, [0, 25], [0, 1], EC),
      }}>
        <div style={{
          fontSize: 52, fontWeight: 'bold', fontFamily: 'monospace',
          color: '#d8d0c0', letterSpacing: 8,
        }}>
          STICK HEROES
        </div>
        <div style={{ fontSize: 18, fontFamily: 'monospace', color: '#555a68', marginTop: 6 }}>
          color + one silhouette feature
        </div>
      </div>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 55%, transparent 40%, rgba(0,0,0,0.4) 100%)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};

export const StickHeroesComp: React.FC = () => (
  <Composition
    id="StickHeroes"
    component={StickHeroesScene}
    durationInFrames={180}
    fps={30}
    width={1920}
    height={1080}
  />
);
