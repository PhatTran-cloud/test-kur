/**
 * SolarSystem10s — 10-second 3D Solar System Demo
 *
 * Cinematic camera orbit around a glowing sun with 8 planets.
 * Uses @remotion/three + postprocessing for production quality.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  AbsoluteFill,
  Composition,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

const TWO_PI = Math.PI * 2;

// ── Planet Data ───────────────────────────────────────
const PLANETS = [
  { name: 'Mercury', orbit: 2.8, size: 0.15, color: '#B0A090', speed: 4.15, tilt: 0.03 },
  { name: 'Venus',   orbit: 3.8, size: 0.35, color: '#E8C070', speed: 1.62, tilt: 177.4 },
  { name: 'Earth',   orbit: 5.0, size: 0.38, color: '#4488CC', speed: 1.0,  tilt: 23.4 },
  { name: 'Mars',    orbit: 6.5, size: 0.20, color: '#CC6644', speed: 0.53, tilt: 25.2 },
  { name: 'Jupiter', orbit: 9.0, size: 0.90, color: '#D4A060', speed: 0.084, tilt: 3.1 },
  { name: 'Saturn',  orbit: 12.0, size: 0.75, color: '#E8D098', speed: 0.034, tilt: 26.7, hasRing: true },
  { name: 'Uranus',  orbit: 15.0, size: 0.50, color: '#88CCDD', speed: 0.012, tilt: 97.8 },
  { name: 'Neptune', orbit: 18.0, size: 0.48, color: '#4466DD', speed: 0.006, tilt: 28.3 },
];

// ── Sun ───────────────────────────────────────────────
const Sun: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const pulse = 1.0 + Math.sin(t * 2.0) * 0.03;
  const emissive = 2.5 + Math.sin(t * 1.5) * 0.5;

  return (
    <group>
      {/* Core */}
      <mesh scale={[pulse, pulse, pulse]}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial
          color="#FFA030"
          emissive="#FF6600"
          emissiveIntensity={emissive}
          roughness={0.2}
        />
      </mesh>
      {/* Corona glow */}
      <mesh scale={[pulse * 1.8, pulse * 1.8, pulse * 1.8]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#FF8800" transparent opacity={0.08} />
      </mesh>
      {/* Outer glow */}
      <mesh scale={[pulse * 3.0, pulse * 3.0, pulse * 3.0]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial color="#FF6600" transparent opacity={0.03} />
      </mesh>
      {/* Point light from sun */}
      <pointLight color="#FFAA44" intensity={3} distance={50} decay={2} />
    </group>
  );
};

// ── Planet ─────────────────────────────────────────────
const Planet: React.FC<{
  orbit: number;
  size: number;
  color: string;
  speed: number;
  tilt: number;
  hasRing?: boolean;
  index: number;
}> = ({ orbit, size, color, speed, tilt, hasRing, index }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;

  // Staggered entrance
  const entrance = spring({
    frame: Math.max(0, frame - index * 8),
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Orbit position
  const timeOffset = index * 0.7;
  const angle = (t * speed * 0.3 + timeOffset) * TWO_PI;
  const x = Math.cos(angle) * orbit;
  const z = Math.sin(angle) * orbit;
  const y = Math.sin(angle * 0.5) * 0.3; // Slight vertical wobble

  // Self rotation
  const selfRotation = t * (2 + index * 0.5);
  const tiltRad = (tilt * Math.PI) / 180;

  return (
    <group position={[x, y, z]} scale={[entrance, entrance, entrance]}>
      {/* Orbit trail */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-x, -y, -z]}>
        <ringGeometry args={[orbit - 0.02, orbit + 0.02, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>

      {/* Planet body */}
      <mesh rotation={[tiltRad, selfRotation, 0]}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.6}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Saturn ring */}
      {hasRing && (
        <mesh rotation={[tiltRad + 0.3, selfRotation * 0.1, 0]}>
          <ringGeometry args={[size * 1.4, size * 2.2, 64]} />
          <meshStandardMaterial
            color="#D4C090"
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
            roughness={0.8}
          />
        </mesh>
      )}
    </group>
  );
};

// ── Stars Background ──────────────────────────────────
const Stars: React.FC = () => {
  const starsRef = useRef<THREE.Points>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const positions = React.useMemo(() => {
    const count = 2000;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * TWO_PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 30 + Math.random() * 40;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const sizes = React.useMemo(() => {
    const count = 2000;
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = 0.05 + Math.random() * 0.15;
    }
    return arr;
  }, []);

  // Slow rotation
  useEffect(() => {
    if (starsRef.current) {
      const t = frame / fps;
      starsRef.current.rotation.y = t * 0.01;
      starsRef.current.rotation.x = t * 0.005;
    }
  }, [frame, fps]);

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.12}
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  );
};

// ── Scene ─────────────────────────────────────────────
const SolarScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera);
  const { scene } = useThree();

  // Set background
  useEffect(() => {
    scene.background = new THREE.Color('#020108');
  }, [scene]);

  // Cinematic camera orbit
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const progress = frame / durationInFrames;
    const t = frame / fps;

    // Start far, zoom in, then orbit
    const zoomIn = interpolate(progress, [0, 0.15, 1], [35, 22, 18], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    // Orbit angle
    const orbitAngle = interpolate(progress, [0, 1], [0, Math.PI * 0.6], {
      extrapolateRight: 'clamp',
    });

    // Camera height
    const camHeight = interpolate(progress, [0, 0.3, 0.7, 1], [12, 8, 6, 10], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    const camX = Math.cos(orbitAngle) * zoomIn;
    const camZ = Math.sin(orbitAngle) * zoomIn;

    cam.position.set(camX, camHeight, camZ);
    cam.lookAt(0, 0, 0);
    cam.fov = 50;
    cam.near = 0.1;
    cam.far = 200;
    cam.updateProjectionMatrix();
  }, [camera, frame, fps, durationInFrames]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.08} />

      {/* Stars */}
      <Stars />

      {/* Sun */}
      <Sun />

      {/* Planets */}
      {PLANETS.map((p, i) => (
        <Planet key={p.name} index={i} {...p} />
      ))}

      {/* Postprocessing */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
          kernelSize={KernelSize.LARGE}
        />
        <Vignette offset={0.3} darkness={0.6} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </>
  );
};

// ── Main Component ────────────────────────────────────
const SolarSystem10s: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <ThreeCanvas linear width={width} height={height}>
        <SolarScene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ── Composition Registration ──────────────────────────
export const SolarSystem10sComp: React.FC = () => (
  <Composition
    id="SolarSystem10s"
    component={SolarSystem10s}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);
