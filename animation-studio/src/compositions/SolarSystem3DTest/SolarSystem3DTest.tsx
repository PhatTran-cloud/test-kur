import React, { useEffect, useRef, useMemo, Suspense } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree, useFrame, useLoader } from '@react-three/fiber';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Composition,
} from 'remotion';
import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { Environment, Stars, Trail, MeshDistortMaterial } from '@react-three/drei';

// ============================================================
// 3D Solar System — R3F + Remotion Test
// Procedural planets with realistic materials, orbital mechanics
// ============================================================

const TWO_PI = Math.PI * 2;

// Planet data: name, orbitRadius, size, color, orbitSpeed, tilt, ringColor
// Compact orbits so camera can frame the whole system
const PLANETS = [
  { name: 'Mercury', orbit: 2.2, size: 0.18, color: '#b0a090', speed: 4.15, tilt: 0.03, emissive: '#443322', ring: null },
  { name: 'Venus', orbit: 3.0, size: 0.3, color: '#e8c880', speed: 1.62, tilt: 2.64, emissive: '#665533', ring: null },
  { name: 'Earth', orbit: 3.9, size: 0.32, color: '#4488cc', speed: 1.0, tilt: 0.41, emissive: '#112244', ring: null },
  { name: 'Mars', orbit: 4.8, size: 0.24, color: '#cc6644', speed: 0.53, tilt: 0.44, emissive: '#551111', ring: null },
  { name: 'Jupiter', orbit: 6.5, size: 0.8, color: '#d4a060', speed: 0.084, tilt: 0.05, emissive: '#443311', ring: null },
  { name: 'Saturn', orbit: 8.5, size: 0.65, color: '#d4b870', speed: 0.034, tilt: 0.47, emissive: '#443322', ring: '#c4a860' },
  { name: 'Uranus', orbit: 10.5, size: 0.45, color: '#88ccdd', speed: 0.012, tilt: 1.71, emissive: '#224444', ring: '#66aabb' },
  { name: 'Neptune', orbit: 12.5, size: 0.42, color: '#4466cc', speed: 0.006, tilt: 0.49, emissive: '#112255', ring: null },
] as const;

// ---- Sun Component ----
const Sun: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const meshRef = useRef<THREE.Mesh>(null);

  // Pulsing glow
  const pulse = 1.0 + Math.sin(time * 1.5) * 0.05;
  const emissivePulse = 2.0 + Math.sin(time * 2.0) * 0.5;

  return (
    <group>
      {/* Core sun sphere */}
      <mesh ref={meshRef} scale={[pulse, pulse, pulse]}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshPhysicalMaterial
          color="#ffcc44"
          emissive="#ff8800"
          emissiveIntensity={emissivePulse}
          roughness={1}
          metalness={0}
          toneMapped={false}
        />
      </mesh>
      {/* Outer glow shell */}
      <mesh scale={[1.6 * pulse, 1.6 * pulse, 1.6 * pulse]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.15 + Math.sin(time * 3) * 0.05}
          toneMapped={false}
        />
      </mesh>
      {/* Sun light */}
      <pointLight intensity={80} color="#ffdd88" distance={50} decay={1.5} />
      <pointLight intensity={30} color="#ff8844" distance={30} decay={2} />
    </group>
  );
};

// ---- Planet Component ----
const Planet: React.FC<{
  orbit: number;
  size: number;
  color: string;
  speed: number;
  tilt: number;
  emissive: string;
  ring: string | null;
  name: string;
  timeOffset: number;
}> = ({ orbit, size, color, speed, tilt, emissive, ring, name, timeOffset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const meshRef = useRef<THREE.Mesh>(null);

  // Orbital position — speed up time for visible motion
  const angle = (time * speed * 0.3 + timeOffset) * TWO_PI;
  const x = Math.cos(angle) * orbit;
  const z = Math.sin(angle) * orbit;
  // Slight vertical oscillation for 3D feel
  const y = Math.sin(angle * 0.5) * orbit * 0.05;

  // Self-rotation
  const selfRot = time * 0.5 * (1 / (size + 0.1));

  // Moons for Earth and Jupiter
  const hasMoon = name === 'Earth';
  const hasJupiterMoons = name === 'Jupiter';
  const moonAngle = time * 2.5;
  const jupiterMoonAngles = [time * 1.8, time * 1.2, time * 0.8, time * 0.5];

  return (
    <group position={[x, y, z]}>
      <mesh rotation={[tilt, 0, 0]}>
        <mesh ref={meshRef} rotation={[0, selfRot, 0]}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.6}
            metalness={0.2}
            emissive={emissive}
            emissiveIntensity={0.3}
            clearcoat={0.3}
          />
        </mesh>
        {/* Saturn/Uranus rings */}
        {ring && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 1.4, size * 2.2, 64]} />
            <meshPhysicalMaterial
              color={ring}
              roughness={0.7}
              metalness={0.1}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
              emissive={ring}
              emissiveIntensity={0.1}
            />
          </mesh>
        )}
        {/* Earth's Moon */}
        {hasMoon && (
          <mesh position={[
            Math.cos(moonAngle) * size * 2.0,
            0.05,
            Math.sin(moonAngle) * size * 2.0,
          ]}>
            <sphereGeometry args={[size * 0.27, 16, 16]} />
            <meshPhysicalMaterial color="#aaaaaa" roughness={0.8} emissive="#333333" emissiveIntensity={0.2} />
          </mesh>
        )}
        {/* Jupiter's Galilean moons */}
        {hasJupiterMoons && jupiterMoonAngles.map((a, i) => {
          const moonR = size * (1.6 + i * 0.5);
          const moonSize = size * (0.12 - i * 0.015);
          const colors = ['#ddcc99', '#cc8844', '#aabbcc', '#bbaa88'];
          return (
            <mesh key={i} position={[Math.cos(a) * moonR, 0.02, Math.sin(a) * moonR]}>
              <sphereGeometry args={[moonSize, 12, 12]} />
              <meshPhysicalMaterial color={colors[i]} roughness={0.7} emissive="#222211" emissiveIntensity={0.15} />
            </mesh>
          );
        })}
      </mesh>
    </group>
  );
};

// ---- Orbit Lines ----
const OrbitLine: React.FC<{ radius: number }> = ({ radius }) => {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * TWO_PI;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color="#4488ff" transparent opacity={0.15} />
    </line>
  );
};

// ---- Asteroid Belt ----
const AsteroidBelt: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const asteroids = useMemo(() => {
    const items: { angle: number; radius: number; size: number; speed: number; y: number }[] = [];
    for (let i = 0; i < 200; i++) {
      items.push({
        angle: Math.random() * TWO_PI,
        radius: 5.5 + Math.random() * 0.8,
        size: 0.02 + Math.random() * 0.06,
        speed: 0.1 + Math.random() * 0.15,
        y: (Math.random() - 0.5) * 0.4,
      });
    }
    return items;
  }, []);

  return (
    <group>
      {asteroids.map((a, i) => {
        const angle = a.angle + time * a.speed * 0.1;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * a.radius,
              a.y,
              Math.sin(angle) * a.radius,
            ]}
          >
            <dodecahedronGeometry args={[a.size, 0]} />
            <meshStandardMaterial color="#887766" roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---- Scene ----
const SolarSystemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const time = frame / fps;
  const cameraRef = useThree((s) => s.camera);
  const { scene } = useThree();

  // Camera animation — cinematic orbit around the solar system
  const progress = frame / durationInFrames;

  useEffect(() => {
    scene.background = new THREE.Color('#020108');
  }, [scene]);

  useEffect(() => {
    const cam = cameraRef as THREE.PerspectiveCamera;

    // Phase 1 (0-30%): Wide establishing shot, looking down
    // Phase 2 (30-70%): Sweep through inner planets
    // Phase 3 (70-100%): Pull back to wide shot

    // Slow orbit angle
    const camAngle = interpolate(frame, [0, durationInFrames], [0.3, Math.PI * 0.5]);

    let camX: number;
    let camY: number;
    let camZ: number;
    let fov: number;

    if (progress < 0.2) {
      // Phase 1: Top-down overview — camera nearly straight above
      const r = interpolate(frame, [0, durationInFrames * 0.2], [2, 3]);
      camY = interpolate(frame, [0, durationInFrames * 0.2], [22, 20]);
      camX = Math.sin(camAngle) * r;
      camZ = Math.cos(camAngle) * r;
      fov = 60; // Wide FOV to see full system from above
    } else if (progress < 0.45) {
      // Phase 2: Swoop down — camera descends to 45° angle
      const r = interpolate(frame, [durationInFrames * 0.2, durationInFrames * 0.45], [3, 10]);
      camY = interpolate(frame, [durationInFrames * 0.2, durationInFrames * 0.45], [20, 8]);
      camX = Math.sin(camAngle) * r;
      camZ = Math.cos(camAngle) * r;
      fov = interpolate(frame, [durationInFrames * 0.2, durationInFrames * 0.45], [60, 50]);
    } else if (progress < 0.7) {
      // Phase 3: Low sweep through planets — dramatic close angle
      const r = interpolate(frame, [durationInFrames * 0.45, durationInFrames * 0.7], [10, 14]);
      camY = interpolate(frame, [durationInFrames * 0.45, durationInFrames * 0.7], [8, 3]);
      camX = Math.sin(camAngle) * r;
      camZ = Math.cos(camAngle) * r;
      fov = interpolate(frame, [durationInFrames * 0.45, durationInFrames * 0.7], [50, 45]);
    } else {
      // Phase 4: Pull back to elevated wide shot — keep distance moderate
      const r = interpolate(frame, [durationInFrames * 0.7, durationInFrames], [14, 8]);
      camY = interpolate(frame, [durationInFrames * 0.7, durationInFrames], [3, 16]);
      camX = Math.sin(camAngle) * r;
      camZ = Math.cos(camAngle) * r;
      fov = interpolate(frame, [durationInFrames * 0.7, durationInFrames], [45, 55]);
    }

    cam.position.set(camX, camY, camZ);
    cam.lookAt(0, 0, 0);
    cam.fov = fov;
    cam.near = 0.1;
    cam.far = 100;
    cam.updateProjectionMatrix();
  }, [cameraRef, frame, durationInFrames, progress]);

  return (
    <>
      {/* Starfield background */}
      <Stars radius={40} depth={50} count={3000} factor={3} saturation={0.2} fade speed={0} />

      {/* Sun */}
      <Sun />

      {/* Orbit lines */}
      {PLANETS.map((p) => (
        <OrbitLine key={`orbit-${p.name}`} radius={p.orbit} />
      ))}

      {/* Planets */}
      {PLANETS.map((p, i) => (
        <Planet
          key={p.name}
          {...p}
          timeOffset={i * 0.37}
        />
      ))}

      {/* Asteroid belt between Mars and Jupiter */}
      <AsteroidBelt />

      {/* Ambient light so dark side of planets isn't pure black */}
      <ambientLight intensity={0.15} color="#4466aa" />

      {/* Postprocessing */}
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          mipmapBlur
          kernelSize={KernelSize.LARGE}
        />
        <Vignette offset={0.3} darkness={0.7} blendFunction={BlendFunction.NORMAL} />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0008, 0.0008)}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </>
  );
};

// ---- Main ----
const SolarSystem3DTest: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <ThreeCanvas linear width={width} height={height}>
        <SolarSystemScene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export const SolarSystem3DTestComp: React.FC = () => (
  <Composition
    id="SolarSystem3DTest"
    component={SolarSystem3DTest}
    durationInFrames={450}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default SolarSystem3DTest;
