import React, { useEffect, useRef, useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree, useLoader } from '@react-three/fiber';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Composition,
} from 'remotion';
import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { Stars } from '@react-three/drei';

// ============================================================
// Black Hole — R3F + Remotion
// Fixed camera, cinematic accretion disk + event horizon
// ============================================================

const TWO_PI = Math.PI * 2;

// ---- Event Horizon (black sphere with dark edge glow) ----
const EventHorizon: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  // Subtle wobble
  const wobble = 1.0 + Math.sin(time * 0.8) * 0.005;

  return (
    <group>
      {/* Pure black sphere — the singularity */}
      <mesh scale={[wobble, wobble, wobble]}>
        <sphereGeometry args={[1.0, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Photon sphere — faint ring at 1.5x radius */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[1.0, 64, 64]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};

// ---- Accretion Disk ----
const AccretionDisk: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  // Multiple ring layers for depth
  const rings = useMemo(() => [
    { inner: 1.6, outer: 1.9, color: '#ffeecc', emissive: '#ff8833', intensity: 3.0, speed: 0.6, opacity: 0.9 },
    { inner: 1.9, outer: 2.3, color: '#ffaa44', emissive: '#ff6600', intensity: 2.5, speed: 0.45, opacity: 0.8 },
    { inner: 2.3, outer: 2.8, color: '#ff7722', emissive: '#cc4400', intensity: 2.0, speed: 0.3, opacity: 0.6 },
    { inner: 2.8, outer: 3.5, color: '#cc4411', emissive: '#881100', intensity: 1.2, speed: 0.2, opacity: 0.4 },
    { inner: 3.5, outer: 4.5, color: '#661100', emissive: '#440800', intensity: 0.6, speed: 0.12, opacity: 0.2 },
  ], []);

  return (
    <group rotation={[Math.PI * 0.42, 0, 0]}>
      {rings.map((ring, i) => {
        const rot = time * ring.speed;
        const pulse = 1.0 + Math.sin(time * 2.0 + i * 1.2) * 0.08;
        return (
          <mesh key={i} rotation={[0, rot, 0]}>
            <ringGeometry args={[ring.inner, ring.outer, 128]} />
            <meshBasicMaterial
              color={ring.color}
              transparent
              opacity={ring.opacity * pulse}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ---- Accretion Disk Volumetric (toroidal particles for 3D feel) ----
const DiskParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const particles = useMemo(() => {
    const items: { angle: number; radius: number; height: number; size: number; speed: number; color: string }[] = [];
    for (let i = 0; i < 300; i++) {
      const r = 1.8 + Math.random() * 3.0;
      const brightness = Math.max(0, 1.0 - (r - 1.8) / 3.0);
      const colors = ['#ffcc66', '#ff9933', '#ff6611', '#cc4400', '#883300'];
      const ci = Math.min(4, Math.floor((1.0 - brightness) * 5));
      items.push({
        angle: Math.random() * TWO_PI,
        radius: r,
        height: (Math.random() - 0.5) * 0.3 * (r / 5.0),
        size: 0.02 + Math.random() * 0.06 * brightness,
        speed: 0.8 / (r * 0.5), // Keplerian-ish: inner orbits faster
        color: colors[ci],
      });
    }
    return items;
  }, []);

  // Disk tilt to match AccretionDisk
  return (
    <group rotation={[Math.PI * 0.42, 0, 0]}>
      {particles.map((p, i) => {
        const angle = p.angle + time * p.speed;
        const x = Math.cos(angle) * p.radius;
        const z = Math.sin(angle) * p.radius;
        return (
          <mesh key={i} position={[x, p.height, z]}>
            <sphereGeometry args={[p.size, 6, 6]} />
            <meshBasicMaterial color={p.color} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---- Relativistic Jets ----
const RelativisticJet: React.FC<{ direction: 1 | -1 }> = ({ direction }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const jetParticles = useMemo(() => {
    const items: { offset: number; speed: number; size: number; spread: number }[] = [];
    for (let i = 0; i < 80; i++) {
      items.push({
        offset: Math.random() * 8.0,
        speed: 1.5 + Math.random() * 2.0,
        size: 0.03 + Math.random() * 0.05,
        spread: Math.random() * 0.3,
      });
    }
    return items;
  }, []);

  // Tilt jets to match disk normal (perpendicular to disk)
  return (
    <group rotation={[Math.PI * 0.42, 0, 0]}>
      {jetParticles.map((p, i) => {
        const dist = ((time * p.speed + p.offset) % 8.0);
        const y = dist * direction;
        const fadeIn = Math.min(1, dist / 1.0);
        const fadeOut = Math.max(0, 1.0 - dist / 8.0);
        const opacity = fadeIn * fadeOut;
        const spreadAmount = p.spread * (dist / 8.0);
        const angle = i * 2.399; // golden angle
        const sx = Math.cos(angle) * spreadAmount;
        const sz = Math.sin(angle) * spreadAmount;
        return (
          <mesh key={i} position={[sx, y, sz]}>
            <sphereGeometry args={[p.size * opacity, 4, 4]} />
            <meshBasicMaterial
              color={dist < 2 ? '#aaccff' : '#6688cc'}
              transparent
              opacity={opacity * 0.7}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ---- Gravitational Lensing Ring (Einstein Ring approximation) ----
const LensingRing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const pulse = 1.0 + Math.sin(time * 1.5) * 0.03;

  return (
    <group>
      {/* Bright photon ring — thin bright edge at event horizon */}
      <mesh rotation={[Math.PI * 0.42, 0, 0]}>
        <ringGeometry args={[1.02, 1.12, 128]} />
        <meshBasicMaterial
          color="#ffeedd"
          transparent
          opacity={0.95 * pulse}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* Thin secondary photon ring */}
      <mesh rotation={[Math.PI * 0.42, 0, 0]}>
        <ringGeometry args={[1.12, 1.22, 128]} />
        <meshBasicMaterial
          color="#ffaa66"
          transparent
          opacity={0.4 * pulse}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* Back-side lensed disk — the Interstellar halo effect */}
      <mesh rotation={[Math.PI * 0.08, 0, 0]}>
        <ringGeometry args={[1.05, 1.5, 128]} />
        <meshBasicMaterial
          color="#ff8833"
          transparent
          opacity={0.25 * pulse}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

// ---- Scene ----
const BlackHoleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cameraRef = useThree((s) => s.camera);
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color('#010105');
  }, [scene]);

  // Fixed camera — slight breathing only
  useEffect(() => {
    const cam = cameraRef as THREE.PerspectiveCamera;
    const breathe = Math.sin(frame * 0.01) * 0.15;
    cam.position.set(8 + breathe, 4, 10);
    cam.lookAt(0, 0.2, 0);
    cam.fov = 32;
    cam.near = 0.1;
    cam.far = 200;
    cam.updateProjectionMatrix();
  }, [cameraRef, frame]);

  return (
    <>
      {/* Deep space stars */}
      <Stars radius={80} depth={60} count={4000} factor={3} saturation={0.1} fade speed={0} />

      {/* Event Horizon */}
      <EventHorizon />

      {/* Gravitational lensing / photon ring */}
      <LensingRing />

      {/* Accretion disk */}
      <AccretionDisk />
      <DiskParticles />

      {/* Relativistic jets */}
      <RelativisticJet direction={1} />
      <RelativisticJet direction={-1} />

      {/* Lighting — mostly from disk emission, ambient very low */}
      <ambientLight intensity={0.05} color="#223344" />
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#ff8844" distance={3} decay={2} />

      {/* Postprocessing */}
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          mipmapBlur
          kernelSize={KernelSize.LARGE}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.002, 0.002)}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise opacity={0.06} blendFunction={BlendFunction.OVERLAY} />
        <Vignette offset={0.35} darkness={0.8} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </>
  );
};

// ---- Main ----
const BlackHole3DTest: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <ThreeCanvas linear width={width} height={height}>
        <BlackHoleScene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export const BlackHole3DTestComp: React.FC = () => (
  <Composition
    id="BlackHole3DTest"
    component={BlackHole3DTest}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default BlackHole3DTest;
