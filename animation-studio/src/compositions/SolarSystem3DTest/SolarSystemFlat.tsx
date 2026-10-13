import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Composition,
} from 'remotion';

// ============================================================
// Solar System — Pure 2D/CSS, no Three.js
// Cinematic flat design with glow, particles, orbits
// ============================================================

const W = 1920;
const H = 1080;
const CX = W / 2;
const CY = H / 2;

const PLANETS = [
  { name: 'Mercury', orbit: 90, size: 10, color: '#b0a090', glow: '#b0a09066', speed: 4.15, moons: [] },
  { name: 'Venus', orbit: 130, size: 16, color: '#e8c880', glow: '#e8c88066', speed: 1.62, moons: [] },
  { name: 'Earth', orbit: 180, size: 18, color: '#4499dd', glow: '#4499dd88', speed: 1.0, moons: [{ dist: 28, size: 5, color: '#aaa', speed: 8 }] },
  { name: 'Mars', orbit: 230, size: 13, color: '#cc6644', glow: '#cc664466', speed: 0.53, moons: [] },
  { name: 'Jupiter', orbit: 310, size: 42, color: '#d4a060', glow: '#d4a06066', speed: 0.084, moons: [
    { dist: 55, size: 6, color: '#ddcc99', speed: 3 },
    { dist: 65, size: 8, color: '#cc8844', speed: 2.2 },
    { dist: 76, size: 7, color: '#aabbcc', speed: 1.6 },
    { dist: 88, size: 5, color: '#bbaa88', speed: 1.1 },
  ]},
  { name: 'Saturn', orbit: 410, size: 36, color: '#d4b870', glow: '#d4b87066', speed: 0.034, ring: true, moons: [] },
  { name: 'Uranus', orbit: 490, size: 24, color: '#88ccdd', glow: '#88ccdd66', speed: 0.012, ring: true, ringColor: '#88ccdd44', moons: [] },
  { name: 'Neptune', orbit: 560, size: 22, color: '#4466cc', glow: '#4466cc66', speed: 0.006, moons: [] },
] as const;

// ---- Starfield Background ----
const Starfield: React.FC = () => {
  const stars = useMemo(() => {
    const s: { x: number; y: number; size: number; opacity: number; twinkleSpeed: number }[] = [];
    for (let i = 0; i < 400; i++) {
      s.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: 0.5 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 1 + Math.random() * 3,
      });
    }
    return s;
  }, []);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  return (
    <>
      {stars.map((s, i) => {
        const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + i);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              backgroundColor: '#fff',
              opacity: s.opacity * twinkle,
              boxShadow: s.size > 1.5 ? `0 0 ${s.size * 3}px ${s.size}px rgba(255,255,255,0.3)` : undefined,
            }}
          />
        );
      })}
    </>
  );
};

// ---- Sun ----
const Sun: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const pulse = 1 + Math.sin(time * 1.5) * 0.03;
  const sunSize = 60;

  return (
    <div
      style={{
        position: 'absolute',
        left: CX - sunSize * pulse,
        top: CY - sunSize * pulse,
        width: sunSize * 2 * pulse,
        height: sunSize * 2 * pulse,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #fff8e0 0%, #ffcc33 30%, #ff8800 60%, #ff440044 80%, transparent 100%)',
        boxShadow: `0 0 60px 20px #ff880088, 0 0 120px 40px #ff660044, 0 0 200px 80px #ff440022`,
      }}
    />
  );
};

// ---- Orbit Ring ----
const OrbitRing: React.FC<{ radius: number }> = ({ radius }) => (
  <div
    style={{
      position: 'absolute',
      left: CX - radius,
      top: CY - radius,
      width: radius * 2,
      height: radius * 2,
      borderRadius: '50%',
      border: '1px solid rgba(255,255,255,0.07)',
    }}
  />
);

// ---- Planet ----
const Planet: React.FC<{
  orbit: number;
  size: number;
  color: string;
  glow: string;
  speed: number;
  name: string;
  ring?: boolean;
  ringColor?: string;
  moons: readonly { dist: number; size: number; color: string; speed: number }[];
  index: number;
}> = ({ orbit, size, color, glow, speed, name, ring, ringColor, moons, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const angle = time * speed * 0.3 + index * 0.8;
  const px = CX + Math.cos(angle) * orbit;
  const py = CY + Math.sin(angle) * orbit;

  return (
    <>
      {/* Planet body */}
      <div
        style={{
          position: 'absolute',
          left: px - size,
          top: py - size,
          width: size * 2,
          height: size * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${color}, ${color}88 70%, ${color}44 100%)`,
          boxShadow: `0 0 ${size}px ${size * 0.5}px ${glow}, inset -${size * 0.3}px -${size * 0.3}px ${size * 0.5}px rgba(0,0,0,0.4)`,
        }}
      />
      {/* Saturn/Uranus ring */}
      {ring && (
        <div
          style={{
            position: 'absolute',
            left: px - size * 2.2,
            top: py - size * 0.3,
            width: size * 4.4,
            height: size * 0.6,
            borderRadius: '50%',
            border: `2px solid ${ringColor || color + '88'}`,
            background: `linear-gradient(transparent 40%, ${ringColor || color + '33'} 50%, transparent 60%)`,
          }}
        />
      )}
      {/* Moons */}
      {moons.map((moon, mi) => {
        const moonAngle = time * moon.speed + mi * 2;
        const mx = px + Math.cos(moonAngle) * moon.dist;
        const my = py + Math.sin(moonAngle) * moon.dist;
        return (
          <div
            key={mi}
            style={{
              position: 'absolute',
              left: mx - moon.size,
              top: my - moon.size,
              width: moon.size * 2,
              height: moon.size * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${moon.color}, ${moon.color}88)`,
              boxShadow: `0 0 ${moon.size * 2}px ${moon.color}44`,
            }}
          />
        );
      })}
      {/* Label */}
      <div
        style={{
          position: 'absolute',
          left: px - 40,
          top: py + size + 6,
          width: 80,
          textAlign: 'center',
          fontSize: 11,
          fontFamily: 'Arial, sans-serif',
          color: color + 'cc',
          letterSpacing: 2,
          textTransform: 'uppercase',
          textShadow: `0 0 8px ${glow}`,
        }}
      >
        {name}
      </div>
    </>
  );
};

// ---- Asteroid Belt ----
const AsteroidBelt: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const asteroids = useMemo(() => {
    const items: { angle: number; radius: number; size: number; speed: number }[] = [];
    for (let i = 0; i < 120; i++) {
      items.push({
        angle: Math.random() * Math.PI * 2,
        radius: 265 + Math.random() * 30,
        size: 1 + Math.random() * 2,
        speed: 0.08 + Math.random() * 0.12,
      });
    }
    return items;
  }, []);

  return (
    <>
      {asteroids.map((a, i) => {
        const ang = a.angle + time * a.speed;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: CX + Math.cos(ang) * a.radius - a.size / 2,
              top: CY + Math.sin(ang) * a.radius - a.size / 2,
              width: a.size,
              height: a.size,
              borderRadius: '50%',
              backgroundColor: '#887766',
              opacity: 0.5,
            }}
          />
        );
      })}
    </>
  );
};

// ---- Ambient Nebula Glow ----
const NebulaGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const drift = Math.sin(time * 0.2) * 30;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: -200 + drift,
          top: -100,
          width: 800,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,10,60,0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -300 - drift,
          bottom: -200,
          width: 900,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,20,50,0.25) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
    </>
  );
};

// ---- Vignette ----
const Vignette: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
      pointerEvents: 'none',
    }}
  />
);

// ---- Main Composition ----
const SolarSystemFlat: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#050510', overflow: 'hidden' }}>
      {/* Background layers */}
      <NebulaGlow />
      <Starfield />

      {/* Orbit rings */}
      {PLANETS.map((p) => (
        <OrbitRing key={`orbit-${p.name}`} radius={p.orbit} />
      ))}

      {/* Asteroid belt */}
      <AsteroidBelt />

      {/* Sun */}
      <Sun />

      {/* Planets */}
      {PLANETS.map((p, i) => (
        <Planet key={p.name} {...p} moons={p.moons} ring={'ring' in p ? (p as any).ring : false} ringColor={'ringColor' in p ? (p as any).ringColor : undefined} index={i} />
      ))}

      {/* Overlay */}
      <Vignette />
    </AbsoluteFill>
  );
};

export const SolarSystemFlatComp: React.FC = () => (
  <Composition
    id="SolarSystemFlat"
    component={SolarSystemFlat}
    durationInFrames={450}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default SolarSystemFlat;
