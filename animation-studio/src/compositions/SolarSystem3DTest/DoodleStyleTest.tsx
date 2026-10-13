import React from 'react';
import { useCurrentFrame, interpolate, Composition, spring, useVideoConfig, random } from 'remotion';

// ═══════════════════════════════════════════════════════════
// DOODLE STYLE — Minimalist 2D cartoon, flat design,
// hand-drawn outline, soft color palette, children's illustration
// Reference: deadpan humor web comic style
// ═══════════════════════════════════════════════════════════

const O = '#2a2a2a'; // outline color

// Wobble helper — makes paths look hand-drawn by adding slight randomness
const w = (v: number, seed: string, amt = 3) => v + (random(seed) - 0.5) * amt * 2;

// ═══════════════════════════════════════════════════════════
// SKY — plain light gray, no blue
// ═══════════════════════════════════════════════════════════
const Sky: React.FC = () => (
  <rect x={0} y={0} width={1920} height={1080} fill="#e8e4da" />
);

// ═══════════════════════════════════════════════════════════
// GROUND — flat green strip, slightly darker than leaves
// ═══════════════════════════════════════════════════════════
const Ground: React.FC = () => (
  <g>
    {/* Main ground — wobble top edge */}
    <path
      d={`M -10,680
          C 200,674 400,678 600,672
          C 900,676 1200,670 1500,675
          C 1700,672 1920,676 1940,674
          L 1940,1100 L -10,1100 Z`}
      fill="#5c8a42"
      stroke={O}
      strokeWidth={3}
    />
    {/* Darker bottom portion */}
    <path
      d={`M -10,760
          C 300,756 700,762 1000,758
          C 1400,755 1700,760 1940,757
          L 1940,1100 L -10,1100 Z`}
      fill="#4e7a38"
    />
  </g>
);

// ═══════════════════════════════════════════════════════════
// TREE — simple trunk + blob leaves
// ═══════════════════════════════════════════════════════════
const TreeSimple: React.FC<{
  x: number; y: number; h?: number; trunkW?: number;
  leafColor?: string; trunkColor?: string; seed?: number; frame: number;
}> = ({ x, y, h = 320, trunkW = 32, leafColor = '#3d7a2e', trunkColor = '#6b4a28', seed = 0, frame }) => {
  const leafSway = Math.sin(frame * 0.018 + seed * 1.3) * 4;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Trunk — slightly uneven vertical */}
      <path
        d={`M ${-trunkW/2 + w(0, `tl${seed}`, 2)},0
            C ${-trunkW/2 + w(0, `tl2${seed}`, 4)},${-h * 0.4}
              ${-trunkW/2 + w(2, `tl3${seed}`, 3)},${-h * 0.7}
              ${-trunkW/3 + w(0, `tl4${seed}`, 2)},${-h * 0.82}
            L ${trunkW/3 + w(0, `tr4${seed}`, 2)},${-h * 0.82}
            C ${trunkW/2 + w(-2, `tr3${seed}`, 3)},${-h * 0.7}
              ${trunkW/2 + w(0, `tr2${seed}`, 4)},${-h * 0.4}
              ${trunkW/2 + w(0, `tr${seed}`, 2)},0 Z`}
        fill={trunkColor}
        stroke={O}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* Branch stubs */}
      <path
        d={`M ${-trunkW/4},${-h * 0.5} C ${-trunkW - 15},${-h * 0.55} ${-trunkW - 25},${-h * 0.52} ${-trunkW - 30},${-h * 0.5}`}
        fill="none" stroke={O} strokeWidth={2.5} strokeLinecap="round"
      />
      <path
        d={`M ${trunkW/4},${-h * 0.65} C ${trunkW + 18},${-h * 0.7} ${trunkW + 28},${-h * 0.68} ${trunkW + 32},${-h * 0.66}`}
        fill="none" stroke={O} strokeWidth={2.5} strokeLinecap="round"
      />

      {/* Leaves — blob cluster */}
      <g transform={`translate(${leafSway}, 0)`}>
        {/* Main canopy blob */}
        <path
          d={`M ${w(-65, `lm1${seed}`)},${-h * 0.72}
              C ${w(-85, `lm2${seed}`)},${-h * 0.85}
                ${w(-55, `lm3${seed}`)},${-h - 20}
                ${w(-20, `lm4${seed}`)},${-h - 35}
              C ${w(5, `lm5${seed}`)},${-h - 48}
                ${w(30, `lm6${seed}`)},${-h - 45}
                ${w(50, `lm7${seed}`)},${-h - 30}
              C ${w(75, `lm8${seed}`)},${-h - 10}
                ${w(85, `lm9${seed}`)},${-h * 0.82}
                ${w(65, `lm10${seed}`)},${-h * 0.72}
              C ${w(35, `lm11${seed}`)},${-h * 0.65}
                ${w(-35, `lm12${seed}`)},${-h * 0.65}
                ${w(-65, `lm1${seed}`)},${-h * 0.72} Z`}
          fill={leafColor}
          stroke={O}
          strokeWidth={3}
        />
        {/* Side blobs */}
        <ellipse cx={w(-50, `lb1${seed}`)} cy={-h * 0.74} rx={28} ry={20}
          fill={leafColor} stroke={O} strokeWidth={2.5} />
        <ellipse cx={w(52, `lb2${seed}`)} cy={-h * 0.76} rx={25} ry={18}
          fill={leafColor} stroke={O} strokeWidth={2.5} />
        {/* Branch leaf blobs */}
        <ellipse cx={-trunkW - 22} cy={-h * 0.52} rx={22} ry={16}
          fill={leafColor} stroke={O} strokeWidth={2.5} />
        <ellipse cx={trunkW + 24} cy={-h * 0.68} rx={20} ry={15}
          fill={leafColor} stroke={O} strokeWidth={2.5} />
      </g>
    </g>
  );
};

// ═══════════════════════════════════════════════════════════
// BUSH — simple dark green blob at ground level
// ═══════════════════════════════════════════════════════════
const BushSimple: React.FC<{ x: number; y: number; w?: number; c?: string; seed?: number }> =
  ({ x, y, w: bw = 100, c = '#3d7a2e', seed = 0 }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path
      d={`M ${-bw/2},0
          C ${-bw/2 - 5},${-bw * 0.22}
            ${-bw * 0.28},${-bw * 0.42}
            ${-bw * 0.08 + random(`b1${seed}`) * 6},${-bw * 0.46}
          C ${bw * 0.05},${-bw * 0.52}
            ${bw * 0.15 + random(`b2${seed}`) * 5},${-bw * 0.44}
            ${bw * 0.28},${-bw * 0.38}
          C ${bw * 0.38},${-bw * 0.32}
            ${bw/2 + 5},${-bw * 0.18}
            ${bw/2},0 Z`}
      fill={c}
      stroke={O}
      strokeWidth={2.5}
    />
  </g>
);

// ═══════════════════════════════════════════════════════════
// LEOPARD — rounded rectangle body, warm yellow-orange,
// black spots, short arms hanging down, deadpan face
// ═══════════════════════════════════════════════════════════
const Leopard: React.FC<{ x: number; y: number; scale?: number; frame: number }> =
  ({ x, y, scale = 1, frame }) => {
  const breathe = 1 + Math.sin(frame * 0.04) * 0.008;
  const tailSwing = Math.sin(frame * 0.07) * 12;
  const blink = frame % 160;
  const isBlinking = blink > 153 && blink < 158;
  const earTwitch = Math.sin(frame * 0.12) * 2;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* ── TAIL ── curved with rounded tip, behind body */}
      <path
        d={`M -30,20
            C ${-50 + tailSwing},10
              ${-65 + tailSwing},-15
              ${-72 + tailSwing},-45
            C ${-76 + tailSwing},-62
              ${-68 + tailSwing},-72
              ${-58 + tailSwing},-68
            C ${-52 + tailSwing},-65
              ${-54 + tailSwing},-55
              ${-56 + tailSwing},-48`}
        fill="none"
        stroke="#e2a82a"
        strokeWidth={14}
        strokeLinecap="round"
      />
      <path
        d={`M -30,20
            C ${-50 + tailSwing},10
              ${-65 + tailSwing},-15
              ${-72 + tailSwing},-45
            C ${-76 + tailSwing},-62
              ${-68 + tailSwing},-72
              ${-58 + tailSwing},-68
            C ${-52 + tailSwing},-65
              ${-54 + tailSwing},-55
              ${-56 + tailSwing},-48`}
        fill="none"
        stroke={O}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      {/* Tail spots */}
      <circle cx={-55 + tailSwing} cy={-10} r={3} fill={O} />
      <circle cx={-64 + tailSwing} cy={-30} r={2.8} fill={O} />
      <circle cx={-70 + tailSwing} cy={-50} r={2.5} fill={O} />

      {/* ── LEGS ── short, simple stumps */}
      {/* Left leg */}
      <path d="M -16,115 L -18,155" stroke="#e2a82a" strokeWidth={18} strokeLinecap="round" fill="none" />
      <path d="M -16,115 L -18,155" stroke={O} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <ellipse cx={-18} cy={158} rx={14} ry={6} fill="#e2a82a" stroke={O} strokeWidth={3} />
      {/* Right leg */}
      <path d="M 20,115 L 22,155" stroke="#e2a82a" strokeWidth={18} strokeLinecap="round" fill="none" />
      <path d="M 20,115 L 22,155" stroke={O} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <ellipse cx={22} cy={158} rx={14} ry={6} fill="#e2a82a" stroke={O} strokeWidth={3} />

      <g transform={`scale(${breathe}, 1)`}>
        {/* ── BODY ── upright rounded rectangle */}
        <path
          d={`M -38,-55
              C -42,-40 -44,-10 -44,20
              C -44,55 -42,85 -38,105
              C -32,118 -16,125 2,126
              C 20,125 36,118 42,105
              C 46,85 48,55 48,20
              C 48,-10 46,-40 42,-55
              C 36,-68 20,-74 2,-75
              C -16,-74 -32,-68 -38,-55 Z`}
          fill="#e8b830"
          stroke={O}
          strokeWidth={3.5}
        />

        {/* ── SPOTS ── random black dots, simple, dense */}
        {[
          // Left column
          [-28, -50, 4.5], [-32, -28, 4], [-30, -5, 4.5], [-34, 18, 4],
          [-28, 38, 4.5], [-32, 58, 4], [-26, 78, 4.5], [-30, 95, 3.5],
          // Inner left
          [-14, -58, 3.5], [-16, -35, 4], [-12, -14, 3.5], [-18, 8, 4],
          [-10, 28, 3.5], [-16, 48, 4], [-8, 68, 3.5], [-14, 88, 3.5],
          // Center
          [2, -62, 3.5], [0, -40, 4], [4, -18, 3.5], [-2, 4, 4],
          [6, 24, 3.5], [0, 44, 4], [4, 64, 3.5], [2, 82, 3.5],
          [-4, 100, 3], [8, 105, 3],
          // Inner right
          [16, -55, 3.5], [20, -32, 4], [14, -10, 3.5], [22, 12, 4],
          [12, 32, 3.5], [20, 52, 4], [14, 72, 3.5], [18, 92, 3.5],
          // Right column
          [32, -48, 4.5], [36, -24, 4], [34, 0, 4.5], [38, 22, 4],
          [30, 42, 4.5], [36, 62, 4], [28, 82, 4], [34, 98, 3.5],
          // Extra scatter
          [-22, -42, 3], [8, -48, 3], [26, -38, 3], [-6, 55, 3],
          [24, -2, 3], [-20, 70, 3], [40, 40, 3.5], [-36, 45, 3.5],
        ].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={O} />
        ))}

        {/* ── ARMS ── short, hanging straight down */}
        {/* Left arm */}
        <path d="M -44,0 C -50,10 -52,28 -50,42"
          stroke={O} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <path d="M -44,0 C -50,10 -52,28 -50,42"
          stroke="#e8b830" strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d="M -44,0 C -50,10 -52,28 -50,42"
          stroke={O} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        {/* Left paw */}
        <ellipse cx={-50} cy={45} rx={8} ry={5} fill="#e8b830" stroke={O} strokeWidth={2.5} />

        {/* Right arm */}
        <path d="M 48,2 C 54,12 56,30 54,44"
          stroke="#e8b830" strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d="M 48,2 C 54,12 56,30 54,44"
          stroke={O} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <ellipse cx={54} cy={47} rx={8} ry={5} fill="#e8b830" stroke={O} strokeWidth={2.5} />

        {/* ═══ HEAD ═══ oval, slightly wider than body */}
        <g transform="translate(2, -82)">
          <path
            d={`M -34,8
                C -40,-6 -38,-22 -30,-32
                C -20,-40 -6,-45 4,-46
                C 14,-45 28,-40 36,-32
                C 44,-22 46,-6 40,8
                C 34,18 22,24 4,25
                C -14,24 -28,18 -34,8 Z`}
            fill="#e8b830"
            stroke={O}
            strokeWidth={3.5}
          />

          {/* Head spots */}
          {[[-18, -16, 3.5], [22, -14, 3.5], [-8, -30, 3], [14, -28, 3],
            [-24, 0, 3], [28, 2, 3], [0, -38, 2.5], [-14, 4, 2.5], [18, 6, 2.5]
          ].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill={O} />
          ))}

          {/* ── EARS ── small rounded bumps */}
          <path d={`M -24,-32 C -28,${-44 + earTwitch} -20,${-50 + earTwitch} -16,-38 Z`}
            fill="#e8b830" stroke={O} strokeWidth={3} />
          <path d={`M -22,-34 C -25,${-42 + earTwitch} -20,${-46 + earTwitch} -18,-37`}
            fill="#d4a020" stroke="none" />
          <path d={`M 28,-32 C 32,${-44 - earTwitch} 24,${-50 - earTwitch} 20,-38 Z`}
            fill="#e8b830" stroke={O} strokeWidth={3} />
          <path d={`M 26,-34 C 29,${-42 - earTwitch} 24,${-46 - earTwitch} 22,-37`}
            fill="#d4a020" stroke="none" />

          {/* ── EYES ── 2 small black dots */}
          {isBlinking ? (
            <>
              <path d="M -12,-10 C -6,-13 0,-10 2,-8" stroke={O} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 12,-10 C 18,-13 24,-10 26,-8" stroke={O} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx={-5} cy={-10} r={4.5} fill={O} />
              <circle cx={19} cy={-10} r={4.5} fill={O} />
            </>
          )}

          {/* ── NOSE ── tiny */}
          <ellipse cx={7} cy={0} rx={3} ry={2.5} fill="#333" />

          {/* ── MOUTH ── straight horizontal line */}
          <path d="M -2,8 C 4,7 10,7 16,8" stroke={O} strokeWidth={3} fill="none" strokeLinecap="round" />

          {/* ── WHISKERS ── */}
          <line x1={-12} y1={2} x2={-36} y2={-2} stroke={O} strokeWidth={2} opacity={0.55} />
          <line x1={-12} y1={6} x2={-36} y2={10} stroke={O} strokeWidth={2} opacity={0.55} />
          <line x1={26} y1={2} x2={50} y2={-2} stroke={O} strokeWidth={2} opacity={0.55} />
          <line x1={26} y1={6} x2={50} y2={10} stroke={O} strokeWidth={2} opacity={0.55} />
        </g>
      </g>
    </g>
  );
};

// ═══════════════════════════════════════════════════════════
// CROCODILE — long horizontal snout, thick body, slightly
// hunched, triangular spikes, olive/muddy green
// ═══════════════════════════════════════════════════════════
const Crocodile: React.FC<{ x: number; y: number; scale?: number; frame: number }> =
  ({ x, y, scale = 1, frame }) => {
  const breathe = 1 + Math.sin(frame * 0.035 + 1) * 0.008;
  const tailWag = Math.sin(frame * 0.055) * 10;
  const blink = frame % 180;
  const isBlinking = blink > 172 && blink < 177;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* ── TAIL ── thick, curves backward (to the left) */}
      <path
        d={`M -30,50
            C ${-55 + tailWag},42
              ${-80 + tailWag},28
              ${-105 + tailWag},10
            C ${-125 + tailWag},-5
              ${-140 + tailWag},-18
              ${-148 + tailWag},-28
            C ${-152 + tailWag},-34
              ${-148 + tailWag},-38
              ${-142 + tailWag},-34
            C ${-136 + tailWag},-28
              ${-130 + tailWag},-18
              ${-120 + tailWag},-8`}
        fill="none"
        stroke="#6e8844"
        strokeWidth={20}
        strokeLinecap="round"
      />
      <path
        d={`M -30,50
            C ${-55 + tailWag},42
              ${-80 + tailWag},28
              ${-105 + tailWag},10
            C ${-125 + tailWag},-5
              ${-140 + tailWag},-18
              ${-148 + tailWag},-28
            C ${-152 + tailWag},-34
              ${-148 + tailWag},-38
              ${-142 + tailWag},-34`}
        fill="none"
        stroke={O}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      {/* Tail spikes */}
      {[-48, -68, -88, -108, -128, -140].map((tx, i) => {
        const ty = interpolate(tx, [-140, -48], [-24, 44]) + tailWag * 0.3;
        return (
          <polygon key={i}
            points={`${tx + tailWag * 0.3 - 4},${ty} ${tx + tailWag * 0.3},${ty - 10 - i} ${tx + tailWag * 0.3 + 4},${ty}`}
            fill="#5a7636" stroke={O} strokeWidth={2}
          />
        );
      })}

      {/* ── LEGS ── short stumpy */}
      <path d="M -14,118 L -16,155" stroke="#6e8844" strokeWidth={20} strokeLinecap="round" fill="none" />
      <path d="M -14,118 L -16,155" stroke={O} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <ellipse cx={-16} cy={158} rx={14} ry={6} fill="#6e8844" stroke={O} strokeWidth={3} />

      <path d="M 22,118 L 24,155" stroke="#6e8844" strokeWidth={20} strokeLinecap="round" fill="none" />
      <path d="M 22,118 L 24,155" stroke={O} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <ellipse cx={24} cy={158} rx={14} ry={6} fill="#6e8844" stroke={O} strokeWidth={3} />

      <g transform={`scale(${breathe}, 1)`}>
        {/* ── BODY ── thick, slightly hunched forward */}
        <path
          d={`M -36,-40
              C -42,-20 -44,10 -44,35
              C -44,65 -42,90 -36,108
              C -28,120 -12,128 6,128
              C 24,128 40,120 46,108
              C 52,90 54,65 54,35
              C 54,10 52,-20 46,-40
              C 38,-54 22,-60 6,-62
              C -12,-60 -28,-54 -36,-40 Z`}
          fill="#7a9650"
          stroke={O}
          strokeWidth={3.5}
        />

        {/* Belly lighter area */}
        <path
          d={`M -16,-25
              C -20,0 -20,30 -18,55
              C -16,75 -10,90 6,95
              C 20,90 26,75 28,55
              C 30,30 30,0 26,-25
              C 20,-32 -10,-32 -16,-25 Z`}
          fill="#8ca862" opacity={0.4}
        />

        {/* Body bumps/texture */}
        {[
          [-30, -20, 8, 6], [34, -15, 7, 5.5], [-32, 10, 8, 6],
          [38, 15, 7, 5.5], [-28, 40, 8, 6], [36, 45, 7, 5.5],
          [-30, 68, 7, 5], [34, 72, 7, 5], [-26, 92, 6, 4.5],
        ].map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
            fill="#5a7636" opacity={0.35} />
        ))}

        {/* ── BACK SPIKES ── triangular, neck to tail connection */}
        {[-55, -40, -25, -10, 5, 20, 35, 50].map((sy, i) => {
          const sx = interpolate(sy, [-55, 50], [-2, 4]);
          const sh = interpolate(sy, [-55, 50], [14, 10]);
          return (
            <polygon key={i}
              points={`${sx - 5},${sy} ${sx},${sy - sh} ${sx + 5},${sy}`}
              fill="#5a7636" stroke={O} strokeWidth={2}
            />
          );
        })}

        {/* ── ARMS ── tiny, hanging */}
        <path d="M -44,15 C -50,24 -52,38 -50,48"
          stroke="#7a9650" strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d="M -44,15 C -50,24 -52,38 -50,48"
          stroke={O} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        {/* claws */}
        <path d="M -50,48 C -54,50 -52,52 -50,52" stroke={O} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <path d="M -50,48 C -48,52 -50,54 -52,53" stroke={O} strokeWidth={2.5} fill="none" strokeLinecap="round" />

        <path d="M 54,18 C 60,27 62,40 60,50"
          stroke="#7a9650" strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d="M 54,18 C 60,27 62,40 60,50"
          stroke={O} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <path d="M 60,50 C 64,52 62,54 60,54" stroke={O} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <path d="M 60,50 C 58,54 60,56 62,55" stroke={O} strokeWidth={2.5} fill="none" strokeLinecap="round" />

        {/* ═══ HEAD ═══ LONG horizontal snout — defining feature */}
        <g transform="translate(5, -72)">
          {/* Back of head — rounded */}
          <path
            d={`M -30,8
                C -38,-6 -36,-24 -28,-34
                C -18,-42 -4,-46 8,-48
                C 20,-46 32,-42 40,-34
                C 48,-24 50,-6 42,8
                C 36,16 20,20 8,22
                C -8,20 -24,16 -30,8 Z`}
            fill="#7a9650"
            stroke={O}
            strokeWidth={3.5}
          />

          {/* ── SNOUT ── long, extending far to the right */}
          <path
            d={`M 36,-18
                C 52,-22 72,-24 92,-22
                C 108,-20 120,-16 126,-10
                C 130,-4 128,4 122,8
                C 114,12 98,14 82,14
                C 66,14 50,12 38,10
                Z`}
            fill="#7a9650"
            stroke={O}
            strokeWidth={3.5}
          />

          {/* Snout bottom (lower jaw) */}
          <path
            d={`M 38,10
                C 54,14 74,16 92,15
                C 108,14 120,12 126,8
                C 128,14 124,20 116,22
                C 104,24 84,24 66,22
                C 50,20 40,16 38,10 Z`}
            fill="#6e8844"
            stroke={O}
            strokeWidth={3}
          />

          {/* Snout line (mouth) — long straight line */}
          <path d="M 38,10 C 55,9 80,8 100,9 C 112,10 122,8 128,6"
            stroke={O} strokeWidth={3} fill="none" strokeLinecap="round" />

          {/* Head bumps on top */}
          {[8, 22, 36].map((sx, i) => (
            <polygon key={i}
              points={`${sx - 4},-34 ${sx},${-42 - i * 2} ${sx + 4},-34`}
              fill="#5a7636" stroke={O} strokeWidth={2}
            />
          ))}

          {/* Head texture patches */}
          <ellipse cx={-10} cy={-18} rx={8} ry={6} fill="#5a7636" opacity={0.3} />
          <ellipse cx={20} cy={-28} rx={7} ry={5} fill="#5a7636" opacity={0.3} />
          <ellipse cx={60} cy={-14} rx={8} ry={5} fill="#5a7636" opacity={0.25} />
          <ellipse cx={90} cy={-12} rx={7} ry={4} fill="#5a7636" opacity={0.25} />

          {/* Nostrils at snout tip */}
          <circle cx={122} cy={-4} r={3.5} fill={O} />
          <circle cx={120} cy={4} r={3} fill={O} />

          {/* ── EYES ── 2 dots, set back on head */}
          {isBlinking ? (
            <>
              <path d="M -6,-12 C 0,-15 6,-12 8,-10" stroke={O} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Yellow-green reptile eye */}
              <circle cx={2} cy={-12} r={8} fill="#c8cc58" stroke={O} strokeWidth={3} />
              <ellipse cx={3} cy={-12} rx={3} ry={5.5} fill={O} />
            </>
          )}
        </g>
      </g>
    </g>
  );
};

// ═══════════════════════════════════════════════════════════
// SNAKE — upright upper body, coiled lower body on ground,
// desaturated green, darker patches, deadpan face
// ═══════════════════════════════════════════════════════════
const SnakeChar: React.FC<{ x: number; y: number; scale?: number; frame: number; flip?: boolean }> =
  ({ x, y, scale = 1, frame, flip = false }) => {
  const sway = Math.sin(frame * 0.04) * 5;
  const headBob = Math.sin(frame * 0.055) * 3;
  const breatheX = 1 + Math.sin(frame * 0.035) * 0.012;
  const blink = frame % 150;
  const isBlinking = blink > 143 && blink < 148;
  const tF = frame % 280;
  const showTongue = tF > 250;
  const tLen = showTongue ? interpolate(tF, [250, 265, 280], [0, 20, 0], { extrapolateRight: 'clamp' }) : 0;

  return (
    <g transform={`translate(${x}, ${y}) scale(${flip ? -scale : scale}, ${scale})`}>

      {/* ── COILED LOWER BODY ── loop shape on ground */}
      {/* Back coil (behind) */}
      <path
        d={`M 40,10
            C 60,5 75,-5 78,-20
            C 80,-32 70,-38 58,-32
            C 48,-25 50,-12 48,0
            C 46,10 42,15 38,12`}
        fill="#95a878"
        stroke={O}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
      {/* Front coil loop */}
      <path
        d={`M -40,8
            C -58,2 -70,-10 -72,-25
            C -74,-36 -62,-42 -50,-34
            C -40,-26 -42,-14 -42,-2
            C -42,8 -38,14 -34,12`}
        fill="#95a878"
        stroke={O}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
      {/* Base body coil */}
      <ellipse cx={0} cy={12} rx={50} ry={18}
        fill="#9db882" stroke={O} strokeWidth={3.5} />
      {/* Coil patches */}
      <ellipse cx={-25} cy={8} rx={10} ry={7} fill="#6e8056" opacity={0.5} />
      <ellipse cx={20} cy={6} rx={12} ry={7} fill="#6e8056" opacity={0.5} />
      <ellipse cx={42} cy={10} rx={8} ry={6} fill="#6e8056" opacity={0.45} />
      {/* Coil belly stripe hint */}
      <path d="M -30,16 C -10,20 10,20 30,16"
        stroke="#7a8c62" strokeWidth={1.5} fill="none" opacity={0.5} />
      <path d="M -25,22 C -5,26 5,26 25,22"
        stroke="#7a8c62" strokeWidth={1.5} fill="none" opacity={0.5} />

      {/* ── UPRIGHT BODY ── tall, WIDE, fat sausage shape */}
      <g transform={`translate(${sway}, 0) scale(${breatheX}, 1)`}>
        <path
          d={`M -38,10
              C -44,-25 -42,-70 -40,-120
              C -38,-170 -36,-220 -32,-265
              C -28,-300 -22,-330 -14,-348
              C -6,-360 6,-360 14,-348
              C 22,-330 28,-300 32,-265
              C 36,-220 38,-170 40,-120
              C 42,-70 44,-25 38,10
              C 32,18 18,22 0,22
              C -18,22 -32,18 -38,10 Z`}
          fill="#9db882"
          stroke={O}
          strokeWidth={3.5}
        />

        {/* ── BELLY ── lighter center strip with horizontal stripes */}
        <path
          d={`M -18,5
              C -20,-30 -20,-75 -18,-130
              C -16,-185 -14,-240 -12,-280
              C -8,-310 -2,-335 0,-345
              C 2,-335 8,-310 12,-280
              C 14,-240 16,-185 18,-130
              C 20,-75 20,-30 18,5
              C 12,10 -12,10 -18,5 Z`}
          fill="#aec896" opacity={0.45}
        />
        {/* Belly stripes */}
        {Array.from({ length: 16 }, (_, i) => {
          const sy = -330 + i * 22;
          const hw = interpolate(sy, [-330, 0], [8, 22], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <path key={i}
              d={`M ${-hw + random(`bs${i}`) * 2},${sy} Q ${random(`bm${i}`) * 3},${sy + 1} ${hw + random(`be${i}`) * 2},${sy}`}
              stroke="#7a8c62" strokeWidth={1.8} fill="none" opacity={0.45}
            />
          );
        })}

        {/* ── PATCHES ── irregular darker blobs */}
        {/* Left side */}
        <path d="M -32,-40 C -38,-55 -28,-68 -20,-58 C -14,-50 -22,-36 -28,-38 Z"
          fill="#6e8056" opacity={0.55} />
        <path d="M -34,-110 C -40,-128 -30,-140 -22,-130 C -16,-122 -24,-106 -30,-108 Z"
          fill="#6e8056" opacity={0.55} />
        <path d="M -30,-185 C -36,-200 -26,-212 -18,-204 C -12,-196 -22,-180 -28,-182 Z"
          fill="#6e8056" opacity={0.55} />
        <path d="M -28,-255 C -34,-268 -24,-278 -16,-270 C -10,-262 -20,-250 -26,-252 Z"
          fill="#6e8056" opacity={0.5} />
        <path d="M -22,-310 C -26,-320 -18,-328 -12,-322 C -8,-316 -16,-306 -20,-308 Z"
          fill="#6e8056" opacity={0.45} />
        {/* Right side */}
        <path d="M 26,-70 C 34,-85 42,-76 38,-65 C 34,-56 22,-60 24,-68 Z"
          fill="#6e8056" opacity={0.55} />
        <path d="M 30,-150 C 36,-165 44,-155 40,-145 C 36,-136 26,-140 28,-148 Z"
          fill="#6e8056" opacity={0.55} />
        <path d="M 26,-225 C 32,-240 40,-230 36,-220 C 32,-212 22,-216 24,-224 Z"
          fill="#6e8056" opacity={0.5} />
        <path d="M 22,-290 C 28,-302 34,-294 32,-285 C 30,-278 18,-282 20,-288 Z"
          fill="#6e8056" opacity={0.45} />
        {/* Center scattered */}
        <path d="M -6,-20 C -10,-30 -2,-36 2,-28 C 6,-22 -2,-16 -6,-20 Z"
          fill="#6e8056" opacity={0.4} />
        <path d="M 8,-145 C 12,-155 20,-150 18,-142 C 16,-136 4,-138 8,-145 Z"
          fill="#6e8056" opacity={0.4} />
        <path d="M -10,-215 C -14,-225 -6,-230 -2,-222 C 2,-216 -6,-210 -10,-215 Z"
          fill="#6e8056" opacity={0.4} />

        {/* ── TINY ARMS ── vestigial, barely visible */}
        <g transform="translate(-38, -180)">
          <path d="M 0,0 C -6,5 -12,14 -14,22"
            stroke={O} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M -14,22 C -16,24 -15,26 -13,26" stroke={O} strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M -14,22 C -12,25 -13,27 -15,27" stroke={O} strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
        <g transform="translate(38, -176)">
          <path d="M 0,0 C 5,6 10,15 12,23"
            stroke={O} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M 12,23 C 14,25 13,27 11,27" stroke={O} strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M 12,23 C 10,26 11,28 13,28" stroke={O} strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>

        {/* ═══ HEAD ═══ wide flat blob, horizontal orientation */}
        <g transform={`translate(0, ${-362 + headBob})`}>
          {/* Head shape — wide, flat snout */}
          <path
            d={`M -28,14
                C -38,4 -40,-10 -34,-22
                C -26,-32 -14,-38 0,-40
                C 18,-40 38,-36 54,-28
                C 66,-20 72,-10 70,0
                C 68,8 62,16 50,20
                C 36,24 18,26 4,26
                C -12,26 -22,22 -28,14 Z`}
            fill="#9db882"
            stroke={O}
            strokeWidth={3.5}
          />

          {/* Head patches */}
          <path d="M -16,-14 C -22,-24 -14,-32 -8,-24 C -4,-18 -10,-10 -14,-12 Z"
            fill="#6e8056" opacity={0.45} />
          <path d="M 28,-26 C 34,-34 42,-28 38,-20 C 34,-14 24,-18 26,-24 Z"
            fill="#6e8056" opacity={0.45} />
          <path d="M 50,-4 C 56,-12 62,-6 58,2 C 54,6 44,2 48,-2 Z"
            fill="#6e8056" opacity={0.4} />

          {/* ── EYES ── 2 small dots, both visible */}
          {isBlinking ? (
            <>
              <path d="M 8,-12 C 12,-14 18,-12 20,-10" stroke={O} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 30,-14 C 34,-16 40,-14 42,-12" stroke={O} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx={14} cy={-12} r={4} fill={O} />
              <circle cx={36} cy={-14} r={3.5} fill={O} />
            </>
          )}

          {/* Nostrils */}
          <circle cx={64} cy={0} r={2.5} fill={O} />
          <circle cx={62} cy={6} r={2} fill={O} />

          {/* ── MOUTH ── straight horizontal line, deadpan */}
          <path d="M 18,10 C 30,8 44,8 58,10"
            stroke={O} strokeWidth={3} fill="none" strokeLinecap="round" />

          {/* ── TONGUE ── fork tongue */}
          {showTongue && tLen > 2 && (
            <g>
              <path d={`M 58,10 C ${58 + tLen * 0.5},11 ${58 + tLen * 0.8},9 ${58 + tLen},8`}
                stroke="#cc3333" strokeWidth={2.5} fill="none" strokeLinecap="round" />
              <path d={`M ${58 + tLen},8 L ${58 + tLen + 6},3`}
                stroke="#cc3333" strokeWidth={2} fill="none" strokeLinecap="round" />
              <path d={`M ${58 + tLen},8 L ${58 + tLen + 6},13`}
                stroke="#cc3333" strokeWidth={2} fill="none" strokeLinecap="round" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

// ═══════════════════════════════════════════════════════════
// SHADOW — subtle under each character
// ═══════════════════════════════════════════════════════════
const Shadow: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w: sw = 90 }) => (
  <ellipse cx={x} cy={y} rx={sw} ry={10} fill="rgba(0,0,0,0.1)" />
);

// ═══════════════════════════════════════════════════════════
// MAIN SCENE COMPOSITION
// ═══════════════════════════════════════════════════════════
const DoodleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry springs
  const leopardY = spring({ frame, fps, from: 400, to: 0, config: { damping: 18, stiffness: 40 }, delay: 5 });
  const crocY = spring({ frame, fps, from: 400, to: 0, config: { damping: 18, stiffness: 40 }, delay: 18 });
  const snakeY = spring({ frame, fps, from: 400, to: 0, config: { damping: 18, stiffness: 40 }, delay: 32 });

  // Subtle camera pan (2-3%)
  const panX = interpolate(frame, [0, 300], [15, -15]);
  const panY = interpolate(frame, [0, 300], [5, -5]);

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', backgroundColor: '#e8e4da' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <g transform={`translate(${panX}, ${panY})`}>
          {/* ══ BACKGROUND LAYER ══ */}
          <Sky />

          {/* Trees — behind characters, simple */}
          <TreeSimple x={120} y={680} h={360} trunkW={36} seed={1} frame={frame} />
          <TreeSimple x={480} y={675} h={400} trunkW={42} leafColor="#357828" seed={2} frame={frame} />
          <TreeSimple x={900} y={678} h={380} trunkW={38} seed={3} frame={frame} />
          <TreeSimple x={1300} y={672} h={420} trunkW={44} leafColor="#357828" seed={4} frame={frame} />
          <TreeSimple x={1700} y={680} h={350} trunkW={34} seed={5} frame={frame} />
          {/* Extra background trees (smaller, further) */}
          <TreeSimple x={300} y={685} h={280} trunkW={28} leafColor="#4a8a3a" trunkColor="#7a5a32" seed={6} frame={frame} />
          <TreeSimple x={1100} y={682} h={300} trunkW={30} leafColor="#4a8a3a" trunkColor="#7a5a32" seed={7} frame={frame} />
          <TreeSimple x={1500} y={685} h={270} trunkW={26} leafColor="#4a8a3a" trunkColor="#7a5a32" seed={8} frame={frame} />

          {/* Bushes at ground level */}
          <BushSimple x={220} y={690} w={130} c="#3d7a2e" seed={1} />
          <BushSimple x={650} y={685} w={150} c="#4a8a3a" seed={2} />
          <BushSimple x={1050} y={688} w={120} c="#3d7a2e" seed={3} />
          <BushSimple x={1420} y={682} w={140} c="#4a8a3a" seed={4} />
          <BushSimple x={1780} y={690} w={110} c="#3d7a2e" seed={5} />

          {/* Ground */}
          <Ground />

          {/* ══ SHADOWS ══ */}
          <Shadow x={400} y={840} w={85} />
          <Shadow x={960} y={840} w={90} />
          <Shadow x={1520} y={840} w={75} />

          {/* ══ CHARACTERS ══ */}

          {/* LEOPARD — left, scale ~3.5 to fill 70-80% height */}
          <g transform={`translate(0, ${leopardY})`}>
            <Leopard x={400} y={670} scale={3.5} frame={frame} />
          </g>

          {/* CROCODILE — middle */}
          <g transform={`translate(0, ${crocY})`}>
            <Crocodile x={960} y={660} scale={3.5} frame={frame} />
          </g>

          {/* SNAKE — right */}
          <g transform={`translate(0, ${snakeY})`}>
            <SnakeChar x={1520} y={810} scale={2.2} frame={frame} />
          </g>

          {/* ══ FOREGROUND GRASS ══ */}
          {Array.from({ length: 16 }, (_, i) => {
            const gx = 40 + i * 125;
            const gy = 1040 + (random(`fy${i}`) - 0.5) * 20;
            return (
              <g key={i} transform={`translate(${gx}, ${gy})`}>
                <path d={`M 0,0 C ${-2 + random(`fg1${i}`) * 2},-10 ${-3 + random(`fg2${i}`) * 3},-22 ${-4 + random(`fg3${i}`) * 4},-32`}
                  stroke="#4a7a28" strokeWidth={2.5} fill="none" strokeLinecap="round" />
                <path d={`M 6,0 C ${5 + random(`fg4${i}`) * 2},-8 ${7 + random(`fg5${i}`) * 3},-20 ${9 + random(`fg6${i}`) * 3},-28`}
                  stroke="#3a6a1a" strokeWidth={2} fill="none" strokeLinecap="round" />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPOSITION EXPORT
// ═══════════════════════════════════════════════════════════
export const DoodleStyleTestComp: React.FC = () => (
  <Composition
    id="DoodleStyleTest"
    component={DoodleScene}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);
