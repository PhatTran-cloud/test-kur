/**
 * SolarSystemSVG10s — 10-second SVG Solar System
 *
 * Bright, colorful, visually stunning SVG solar system
 * with glowing sun, orbiting planets, and cinematic camera zoom.
 */

import React from 'react';
import {
  AbsoluteFill,
  Composition,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

const TWO_PI = Math.PI * 2;
const CX = 960;
const CY = 540;

// ── Planet Data ───────────────────────────────────────
const PLANETS = [
  { name: 'Mercury', orbit: 95,  size: 8,  color: '#B8A89A', glow: '#D4C4B0', speed: 4.2, offset: 0.0 },
  { name: 'Venus',   orbit: 135, size: 14, color: '#F0C860', glow: '#FFE090', speed: 1.6, offset: 2.1 },
  { name: 'Earth',   orbit: 185, size: 16, color: '#4499DD', glow: '#66BBFF', speed: 1.0, offset: 4.2, hasMoon: true },
  { name: 'Mars',    orbit: 240, size: 11, color: '#DD6644', glow: '#FF8866', speed: 0.53, offset: 1.3 },
  { name: 'Jupiter', orbit: 320, size: 36, color: '#D4A060', glow: '#F0C080', speed: 0.084, offset: 3.5 },
  { name: 'Saturn',  orbit: 410, size: 28, color: '#F0D898', glow: '#FFE8B0', speed: 0.034, offset: 5.0, hasRing: true },
  { name: 'Uranus',  orbit: 490, size: 20, color: '#66CCDD', glow: '#88EEFF', speed: 0.012, offset: 0.8 },
  { name: 'Neptune', orbit: 560, size: 19, color: '#5577EE', glow: '#7799FF', speed: 0.006, offset: 3.9 },
];

// ── Stars Layer ───────────────────────────────────────
const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (Math.sin(i * 7.31) * 0.5 + 0.5) * 1920,
  y: (Math.cos(i * 13.17) * 0.5 + 0.5) * 1080,
  r: 0.5 + (Math.sin(i * 3.71) * 0.5 + 0.5) * 1.5,
  twinkleSpeed: 0.03 + (Math.sin(i * 11.3) * 0.5 + 0.5) * 0.06,
  twinkleOffset: i * 0.47,
}));

const StarsLayer: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {STARS.map((s, i) => {
      const opacity = 0.3 + Math.sin(frame * s.twinkleSpeed + s.twinkleOffset) * 0.3;
      return (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#ffffff"
          opacity={opacity}
        />
      );
    })}
  </>
);

// ── Sun Component ─────────────────────────────────────
const SunComponent: React.FC<{ frame: number; fps: number; scale: number }> = ({ frame, fps, scale }) => {
  const t = frame / fps;
  const pulse = 1 + Math.sin(t * 2.5) * 0.03;
  const sunR = 55 * scale * pulse;

  return (
    <g>
      {/* Outer corona glow */}
      <circle cx={CX} cy={CY} r={sunR * 4} fill="url(#sunCorona)" opacity={0.25 + Math.sin(t * 1.8) * 0.08} />
      {/* Mid glow */}
      <circle cx={CX} cy={CY} r={sunR * 2.5} fill="url(#sunMidGlow)" opacity={0.4 + Math.sin(t * 2.2) * 0.1} />
      {/* Inner glow */}
      <circle cx={CX} cy={CY} r={sunR * 1.5} fill="url(#sunInnerGlow)" opacity={0.6} />
      {/* Sun body */}
      <circle cx={CX} cy={CY} r={sunR} fill="url(#sunBody)" />
      {/* Sun highlight */}
      <circle cx={CX - sunR * 0.25} cy={CY - sunR * 0.25} r={sunR * 0.5} fill="url(#sunHighlight)" opacity={0.4} />
      {/* Sun flare rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const a = ((angle + t * 15) * Math.PI) / 180;
        const innerR = sunR * 1.1;
        const outerR = sunR * (1.6 + Math.sin(t * 3 + i * 0.8) * 0.3);
        const x1 = CX + Math.cos(a) * innerR;
        const y1 = CY + Math.sin(a) * innerR;
        const x2 = CX + Math.cos(a) * outerR;
        const y2 = CY + Math.sin(a) * outerR;
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#FFD080"
            strokeWidth={2 * scale}
            opacity={0.15 + Math.sin(t * 4 + i) * 0.1}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

// ── Planet Component ──────────────────────────────────
const PlanetComponent: React.FC<{
  planet: typeof PLANETS[0];
  frame: number;
  fps: number;
  scale: number;
  entrance: number;
}> = ({ planet, frame, fps, scale, entrance }) => {
  const t = frame / fps;
  const angle = (t * planet.speed * 0.4 + planet.offset) * TWO_PI;
  const orbitR = planet.orbit * scale;
  const px = CX + Math.cos(angle) * orbitR;
  const py = CY + Math.sin(angle) * orbitR * 0.35; // Elliptical orbit (perspective)
  const planetR = planet.size * scale * entrance;

  // Z-depth for layering (behind or in front of sun)
  const zDepth = Math.sin(angle);
  const depthScale = 0.85 + zDepth * 0.15;
  const finalR = planetR * depthScale;

  // Planet shadow (opposite side from sun)
  const shadowAngle = Math.atan2(py - CY, px - CX);

  return (
    <g opacity={entrance}>
      {/* Orbit path */}
      <ellipse
        cx={CX} cy={CY}
        rx={orbitR} ry={orbitR * 0.35}
        fill="none"
        stroke="#ffffff"
        strokeWidth={0.5}
        opacity={0.08 * entrance}
        strokeDasharray="4 8"
      />

      {/* Planet glow */}
      <circle
        cx={px} cy={py}
        r={finalR * 2.5}
        fill={planet.glow}
        opacity={0.08}
        filter="url(#planetBlur)"
      />

      {/* Planet body */}
      <circle
        cx={px} cy={py}
        r={finalR}
        fill={`url(#planet-${planet.name})`}
      />

      {/* Planet highlight */}
      <circle
        cx={px - finalR * 0.3} cy={py - finalR * 0.3}
        r={finalR * 0.45}
        fill="#ffffff"
        opacity={0.2}
        filter="url(#planetBlur)"
      />

      {/* Saturn ring */}
      {planet.hasRing && (
        <ellipse
          cx={px} cy={py}
          rx={finalR * 2.2} ry={finalR * 0.5}
          fill="none"
          stroke={planet.color}
          strokeWidth={finalR * 0.35}
          opacity={0.5}
          transform={`rotate(-15, ${px}, ${py})`}
        />
      )}

      {/* Earth moon */}
      {planet.hasMoon && (
        (() => {
          const moonAngle = t * 3.5;
          const moonDist = finalR * 2.5;
          const mx = px + Math.cos(moonAngle) * moonDist;
          const my = py + Math.sin(moonAngle) * moonDist * 0.4;
          return (
            <>
              <circle cx={mx} cy={my} r={finalR * 0.25} fill="#CCCCCC" />
              <circle cx={mx - finalR * 0.08} cy={my - finalR * 0.08} r={finalR * 0.12} fill="#ffffff" opacity={0.3} />
            </>
          );
        })()
      )}

      {/* Planet name label */}
      {finalR > 8 && (
        <text
          x={px}
          y={py + finalR + 14 * scale}
          textAnchor="middle"
          fontSize={10 * scale}
          fill="#ffffff"
          opacity={0.4 * entrance}
          fontFamily="Inter, sans-serif"
          fontWeight={500}
        >
          {planet.name}
        </text>
      )}
    </g>
  );
};

// ── Main Composition ──────────────────────────────────
const SolarSystemSVG10s: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  // Camera zoom effect
  const scale = interpolate(progress, [0, 0.2, 0.8, 1], [0.6, 1.0, 1.0, 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Title entrance/exit
  const titleOpacity = interpolate(progress, [0, 0.05, 0.15, 0.85, 1], [0, 1, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <svg
        viewBox="0 0 1920 1080"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          {/* Background gradient */}
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0A0820" />
            <stop offset="40%" stopColor="#060412" />
            <stop offset="100%" stopColor="#020108" />
          </radialGradient>

          {/* Sun gradients */}
          <radialGradient id="sunBody" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFDE0" />
            <stop offset="30%" stopColor="#FFD040" />
            <stop offset="70%" stopColor="#FF9020" />
            <stop offset="100%" stopColor="#E86010" />
          </radialGradient>
          <radialGradient id="sunHighlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunCorona" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF8830" />
            <stop offset="50%" stopColor="#FF660020" />
            <stop offset="100%" stopColor="#FF660000" />
          </radialGradient>
          <radialGradient id="sunMidGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFAA40" />
            <stop offset="60%" stopColor="#FF880015" />
            <stop offset="100%" stopColor="#FF880000" />
          </radialGradient>
          <radialGradient id="sunInnerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD060" />
            <stop offset="70%" stopColor="#FFA03020" />
            <stop offset="100%" stopColor="#FFA03000" />
          </radialGradient>

          {/* Planet gradients */}
          {PLANETS.map((p) => (
            <radialGradient key={p.name} id={`planet-${p.name}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor={p.glow} />
              <stop offset="50%" stopColor={p.color} />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
            </radialGradient>
          ))}

          {/* Blur filter */}
          <filter id="planetBlur">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="titleGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="1920" height="1080" fill="url(#bgGrad)" />

        {/* Nebula clouds */}
        <ellipse cx="400" cy="300" rx="300" ry="150" fill="#3322AA" opacity={0.03 + Math.sin(frame * 0.01) * 0.01} filter="url(#planetBlur)" />
        <ellipse cx="1500" cy="750" rx="250" ry="120" fill="#AA2255" opacity={0.025 + Math.sin(frame * 0.015 + 1) * 0.01} filter="url(#planetBlur)" />
        <ellipse cx="960" cy="200" rx="400" ry="80" fill="#2244AA" opacity={0.02 + Math.sin(frame * 0.012 + 2) * 0.008} filter="url(#planetBlur)" />

        {/* Stars */}
        <StarsLayer frame={frame} />

        {/* Planets behind sun (negative z) */}
        {PLANETS.map((p, i) => {
          const t = frame / fps;
          const angle = (t * p.speed * 0.4 + p.offset) * TWO_PI;
          const zDepth = Math.sin(angle);
          const entrance = spring({
            frame: Math.max(0, frame - i * 10 - 15),
            fps,
            config: { damping: 15, stiffness: 60 },
          });
          if (zDepth >= 0) return null;
          return <PlanetComponent key={p.name} planet={p} frame={frame} fps={fps} scale={scale} entrance={entrance} />;
        })}

        {/* Sun */}
        <SunComponent frame={frame} fps={fps} scale={scale} />

        {/* Planets in front of sun (positive z) */}
        {PLANETS.map((p, i) => {
          const t = frame / fps;
          const angle = (t * p.speed * 0.4 + p.offset) * TWO_PI;
          const zDepth = Math.sin(angle);
          const entrance = spring({
            frame: Math.max(0, frame - i * 10 - 15),
            fps,
            config: { damping: 15, stiffness: 60 },
          });
          if (zDepth < 0) return null;
          return <PlanetComponent key={p.name} planet={p} frame={frame} fps={fps} scale={scale} entrance={entrance} />;
        })}

        {/* Title */}
        <text
          x={CX}
          y={980}
          textAnchor="middle"
          fontSize={32}
          fill="#ffffff"
          opacity={titleOpacity * 0.6}
          fontFamily="Inter, sans-serif"
          fontWeight={300}
          letterSpacing={8}
          filter="url(#titleGlow)"
        >
          THE SOLAR SYSTEM
        </text>
      </svg>
    </AbsoluteFill>
  );
};

// ── Composition Registration ──────────────────────────
export const SolarSystemSVG10sComp: React.FC = () => (
  <Composition
    id="SolarSystemSVG10s"
    component={SolarSystemSVG10s}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);
