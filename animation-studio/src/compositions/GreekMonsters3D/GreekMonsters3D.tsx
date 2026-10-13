import React, { useEffect, useMemo, useRef } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree, useFrame } from '@react-three/fiber';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from 'remotion';
import * as THREE from 'three';

// drei — advanced materials, helpers, effects
import {
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Environment,
  Sparkles,
  Float,
  GradientTexture,
} from '@react-three/drei';

// Postprocessing — cinematic effects
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  ChromaticAberration,
  Noise,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

// ============================================================
// GREEK MONSTERS 3D — FULL POWER VERSION
// Uses: MeshDistortMaterial, MeshPhysicalMaterial, Bloom,
//       DOF, Vignette, ChromaticAberration, Sparkles, Environment
// ============================================================

const FPS = 30;
const DURATION = 20 * FPS;

// ---- Sync drei materials with Remotion frame ----
// drei materials use internal clock; we override with Remotion time
const useSyncTime = (ref: React.RefObject<any>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  useEffect(() => {
    if (ref.current && 'time' in ref.current) {
      ref.current.time = frame / fps;
    }
  }, [frame, fps, ref]);
};

// ============================================================
// MEDUSA SCENE — The Gorgon Queen
// ============================================================
const MedusaScene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cameraRef = useThree((s) => s.camera);
  const { scene } = useThree();

  // Refs for syncing material time
  const bodyMatRef = useRef<any>(null);
  const snakeMatRefs = useRef<any[]>([]);
  useSyncTime(bodyMatRef);

  useEffect(() => {
    scene.fog = new THREE.FogExp2('#061208', 0.02);
    scene.background = new THREE.Color('#050e05');
  }, [scene]);

  // Camera: tight on Medusa, slow orbit
  const camAngle = interpolate(frame, [0, 300], [0, Math.PI * 0.25]);
  const camY = interpolate(frame, [0, 300], [0.7, 1.1]);
  const camDist = interpolate(frame, [0, 300], [1.5, 1.2]);

  useEffect(() => {
    cameraRef.position.set(
      Math.sin(camAngle) * camDist,
      camY,
      Math.cos(camAngle) * camDist
    );
    cameraRef.lookAt(0, 0.55, 0);
    cameraRef.near = 0.1;
    cameraRef.far = 50;
    (cameraRef as THREE.PerspectiveCamera).fov = 45;
    (cameraRef as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [cameraRef, camAngle, camY, camDist]);

  const entrance = spring({ frame, fps, config: { damping: 80, mass: 2 } });
  const fadeScale = interpolate(entrance, [0, 1], [0.5, 2.0]); // Scale UP 2x
  const breathe = Math.sin(frame * 0.04) * 0.015;
  const eyePulse = 0.5 + 0.5 * Math.sin(frame * 0.08);
  const time = frame / fps;

  // Sync all snake material times
  useEffect(() => {
    snakeMatRefs.current.forEach((ref) => {
      if (ref && 'time' in ref) {
        ref.time = time;
      }
    });
  }, [time]);

  // Snake hair data
  const snakeData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const len = 0.35 + (i % 5) * 0.1;
      const radius = 0.16 + (i % 3) * 0.025;
      const layer = Math.floor(i / 8); // 3 layers
      return { angle, len, radius, i, layer };
    });
  }, []);

  return (
    <group scale={[fadeScale, fadeScale, fadeScale]}>
      {/* HDR Environment for realistic lighting */}
      <Environment preset="forest" environmentIntensity={0.3} />

      {/* Ground — dark mossy stone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshPhysicalMaterial
          color="#1a2a1a"
          roughness={0.92}
          metalness={0.05}
          clearcoat={0.1}
          clearcoatRoughness={0.9}
        />
      </mesh>

      {/* Temple pillars with physical material */}
      {[-1.2, -0.5, 0.5, 1.2].map((x, i) => {
        const h = 2.0 + (i % 2) * 0.4;
        return (
          <group key={`pillar-${i}`} position={[x, h / 2 - 0.15, -1.4 + (i % 2) * 0.15]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.09, h, 16]} />
              <meshPhysicalMaterial
                color="#4a5a4a"
                roughness={0.85}
                metalness={0.08}
                clearcoat={0.05}
              />
            </mesh>
          </group>
        );
      })}

      {/* ===== MEDUSA BODY — MeshDistortMaterial for organic feel ===== */}
      <group position={[0, 0, 0]}>
        {/* Torso — distorting organic shape */}
        <mesh position={[0, 0.35, 0]} castShadow scale={[0.35, 0.55, 0.3]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            ref={bodyMatRef}
            color="#4a9a5a"
            roughness={0.35}
            metalness={0.4}
            distort={0.15}
            speed={1.5}
            emissive="#1a5a2a"
            emissiveIntensity={0.2}
          >
            <GradientTexture
              attach="map"
              stops={[0, 0.4, 0.7, 1]}
              colors={['#2a6a3a', '#4a9a5a', '#3a8a4a', '#2a5a35']}
            />
          </MeshDistortMaterial>
        </mesh>

        {/* Lower body / skirt — flowing shape */}
        <mesh position={[0, -0.05, 0]} castShadow scale={[0.4, 0.45, 0.35]}>
          <sphereGeometry args={[1, 24, 24]} />
          <MeshDistortMaterial
            color="#3a7a45"
            roughness={0.4}
            metalness={0.3}
            distort={0.1}
            speed={1.0}
            emissive="#1a4a25"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Shoulders */}
        {[-0.28, 0.28].map((x, si) => (
          <mesh key={`shoulder-${si}`} position={[x, 0.7, 0]} castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshPhysicalMaterial
              color="#5aaa6a"
              roughness={0.3}
              metalness={0.35}
              clearcoat={0.3}
              clearcoatRoughness={0.4}
            />
          </mesh>
        ))}

        {/* Arms */}
        {[-1, 1].map((side) => (
          <group key={`arm-${side}`}>
            <mesh position={[side * 0.32, 0.55, 0.08]} rotation={[0.3, 0, side * 0.5]} castShadow>
              <cylinderGeometry args={[0.05, 0.04, 0.35, 10]} />
              <meshPhysicalMaterial
                color="#5aaa6a"
                roughness={0.35}
                metalness={0.3}
                clearcoat={0.2}
              />
            </mesh>
            {/* Forearm */}
            <mesh position={[side * 0.42, 0.35, 0.2]} rotation={[0.8, 0, side * 0.3]} castShadow>
              <cylinderGeometry args={[0.04, 0.03, 0.28, 8]} />
              <meshPhysicalMaterial
                color="#5aaa6a"
                roughness={0.35}
                metalness={0.3}
              />
            </mesh>
          </group>
        ))}

        {/* Neck */}
        <mesh position={[0, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.08, 0.15, 12]} />
          <meshPhysicalMaterial
            color="#5aaa6a"
            roughness={0.3}
            metalness={0.3}
            clearcoat={0.3}
          />
        </mesh>

        {/* ===== HEAD ===== */}
        <group position={[0, 1.0 + breathe, 0]}>
          {/* Head — organic distorted sphere */}
          <mesh castShadow scale={[1, 1.15, 1]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshPhysicalMaterial
              color="#6abb7a"
              roughness={0.25}
              metalness={0.3}
              clearcoat={0.5}
              clearcoatRoughness={0.3}
              emissive="#2a6a3a"
              emissiveIntensity={0.15}
            />
          </mesh>

          {/* Face — nose/brow */}
          <mesh position={[0, 0, 0.17]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshPhysicalMaterial
              color="#6abb7a"
              roughness={0.3}
              metalness={0.25}
              clearcoat={0.4}
            />
          </mesh>

          {/* Brow ridge */}
          <mesh position={[0, 0.08, 0.14]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.2, 0.025, 0.05]} />
            <meshPhysicalMaterial color="#5aaa6a" roughness={0.4} />
          </mesh>

          {/* ===== EYES — key glow source for Bloom ===== */}
          {[[-0.06, 0.04, 0.17], [0.06, 0.04, 0.17]].map((pos, ei) => (
            <group key={`eye-${ei}`}>
              {/* Eye socket */}
              <mesh position={pos as any}>
                <sphereGeometry args={[0.022, 10, 10]} />
                <meshStandardMaterial color="#002200" roughness={0.9} />
              </mesh>
              {/* Iris — BRIGHT emissive for Bloom to pick up */}
              <mesh position={[pos[0], pos[1], pos[2] + 0.012] as any}>
                <sphereGeometry args={[0.016, 10, 10]} />
                <meshStandardMaterial
                  color="#00ff55"
                  emissive="#00ff55"
                  emissiveIntensity={8 + eyePulse * 12}
                  toneMapped={false}
                />
              </mesh>
              {/* Eye point light */}
              <pointLight
                position={[pos[0], pos[1], pos[2] + 0.08] as any}
                color="#00ff44"
                intensity={2 + eyePulse * 4}
                distance={3}
                decay={2}
              />
            </group>
          ))}

          {/* Mouth with fangs */}
          <mesh position={[0, -0.08, 0.16]}>
            <boxGeometry args={[0.06, 0.012, 0.03]} />
            <meshStandardMaterial color="#1a0808" roughness={0.9} />
          </mesh>
          {[-0.018, 0.018].map((x, fi) => (
            <mesh key={`fang-${fi}`} position={[x, -0.095, 0.17]}>
              <coneGeometry args={[0.005, 0.025, 4]} />
              <meshPhysicalMaterial color="#eeddcc" roughness={0.3} metalness={0.15} clearcoat={0.5} />
            </mesh>
          ))}

          {/* ===== SNAKE HAIR — MeshWobbleMaterial tubes ===== */}
          {snakeData.map((s) => {
            const wave1 = Math.sin(time * 2.5 + s.i * 0.8) * 0.18;
            const wave2 = Math.cos(time * 1.8 + s.i * 1.3) * 0.12;
            const vertWave = Math.sin(time * 2.0 + s.i * 0.5) * 0.08;

            const baseX = Math.sin(s.angle) * s.radius;
            const baseZ = Math.cos(s.angle) * s.radius;
            const tipX = Math.sin(s.angle + wave1 + wave2 * 0.5) * (s.radius + s.len);
            const tipZ = Math.cos(s.angle + wave1 + wave2 * 0.5) * (s.radius + s.len);
            const tipY = 0.15 + s.len * 0.4 + vertWave + s.layer * 0.06;

            // Each snake is a stretched wobbling sphere
            const midX = (baseX + tipX) / 2;
            const midZ = (baseZ + tipZ) / 2;
            const midY = (0.15 + tipY) / 2;
            const snakeLen = Math.sqrt((tipX - baseX) ** 2 + (tipY - 0.15) ** 2 + (tipZ - baseZ) ** 2);
            const lookDir = new THREE.Vector3(tipX - baseX, tipY - 0.15, tipZ - baseZ).normalize();
            const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), lookDir);
            const euler = new THREE.Euler().setFromQuaternion(quat);

            const hue = s.i % 4 === 0 ? '#5abb6a' : s.i % 4 === 1 ? '#4aaa5a' : s.i % 4 === 2 ? '#6acc7a' : '#3a9a4a';

            return (
              <group key={`snake-${s.i}`}>
                {/* Snake body — wobbling cylinder */}
                <mesh
                  position={[midX, midY + 0.15, midZ]}
                  rotation={[euler.x, euler.y, euler.z]}
                  scale={[1, snakeLen / 0.4, 1]}
                >
                  <cylinderGeometry args={[0.012 + (s.i % 3) * 0.003, 0.008, 0.4, 8]} />
                  <MeshWobbleMaterial
                    ref={(el: any) => { if (el) snakeMatRefs.current[s.i] = el; }}
                    color={hue}
                    factor={0.3}
                    speed={2 + s.i * 0.1}
                    roughness={0.3}
                    metalness={0.45}
                    emissive="#1a5a2a"
                    emissiveIntensity={0.3}
                  />
                </mesh>
                {/* Snake head — small glowing sphere */}
                <mesh position={[tipX, tipY + 0.15, tipZ]}>
                  <sphereGeometry args={[0.02 + (s.i % 3) * 0.004, 10, 10]} />
                  <meshPhysicalMaterial
                    color="#55dd77"
                    emissive="#44cc66"
                    emissiveIntensity={1.5 + Math.sin(time * 3 + s.i) * 0.8}
                    roughness={0.2}
                    metalness={0.5}
                    clearcoat={0.6}
                    toneMapped={false}
                  />
                </mesh>
                {/* Tiny snake eyes */}
                <mesh position={[tipX + 0.006, tipY + 0.165, tipZ + 0.012]}>
                  <sphereGeometry args={[0.004, 4, 4]} />
                  <meshStandardMaterial
                    color="#aaffaa"
                    emissive="#aaffaa"
                    emissiveIntensity={5}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      </group>

      {/* Petrified victims */}
      {[
        { x: -0.8, z: 0.5, ry: 0.4, sc: 0.35 },
        { x: 0.7, z: 0.6, ry: -0.5, sc: 0.3 },
      ].map((v, i) => (
        <group key={`victim-${i}`} position={[v.x, 0.1, v.z]} rotation={[0, v.ry, 0]} scale={[v.sc, v.sc, v.sc]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.18, 1.0, 8]} />
            <meshPhysicalMaterial color="#7a7a75" roughness={0.9} metalness={0.02} clearcoat={0.05} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshPhysicalMaterial color="#757570" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* ===== LIGHTING ===== */}
      <ambientLight intensity={0.8} color="#cceecc" />
      <directionalLight position={[-2, 4, 4]} intensity={3.5} color="#bbffcc" castShadow />
      <directionalLight position={[3, 3, 2]} intensity={2.0} color="#99ddbb" />
      <pointLight position={[0, 4, 0]} intensity={3.0} color="#aaffaa" distance={10} decay={1.5} />
      <pointLight position={[0, 3, -3]} intensity={2.0} color="#6688cc" distance={10} decay={2} />
      <pointLight position={[0, 0.2, 0.5]} intensity={2.5} color="#33ff66" distance={5} decay={2} />

      {/* Sparkles — magical green particles */}
      <Sparkles
        count={80}
        scale={4}
        size={3}
        speed={0.4}
        color="#44ff66"
        opacity={0.7}
      />
      <Sparkles
        count={40}
        scale={3}
        size={5}
        speed={0.2}
        color="#88ffaa"
        opacity={0.5}
      />

      {/* ===== POSTPROCESSING ===== */}
      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.3}
          mipmapBlur
          kernelSize={KernelSize.MEDIUM}
        />
        <Vignette
          offset={0.3}
          darkness={0.7}
          blendFunction={BlendFunction.NORMAL}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0008, 0.0008) as any}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise
          opacity={0.04}
          blendFunction={BlendFunction.OVERLAY}
        />
      </EffectComposer>
    </group>
  );
};

// ============================================================
// CERBERUS SCENE — Three-Headed Guardian of Hades
// ============================================================
const CerberusScene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cameraRef = useThree((s) => s.camera);
  const { scene } = useThree();

  const bodyMatRef = useRef<any>(null);
  useSyncTime(bodyMatRef);

  useEffect(() => {
    scene.fog = new THREE.FogExp2('#100800', 0.018);
    scene.background = new THREE.Color('#080400');
  }, [scene]);

  // Camera: tight low angle on Cerberus
  const camAngle = interpolate(frame, [0, 300], [-0.1, 0.2]);
  const camY = interpolate(frame, [0, 300], [0.1, 0.6]);
  const camDist = interpolate(frame, [0, 300], [1.6, 1.3]);

  useEffect(() => {
    cameraRef.position.set(
      Math.sin(camAngle) * camDist,
      camY,
      Math.cos(camAngle) * camDist
    );
    cameraRef.lookAt(0, 0.45, 0);
    cameraRef.near = 0.1;
    cameraRef.far = 50;
    (cameraRef as THREE.PerspectiveCamera).fov = 45;
    (cameraRef as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [cameraRef, camAngle, camY, camDist]);

  const entrance = spring({ frame, fps, config: { damping: 80, mass: 2.5 } });
  const fadeScale = interpolate(entrance, [0, 1], [0.4, 2.0]); // Scale UP 2x
  const breatheF = (offset: number) => Math.sin(frame * 0.03 + offset) * 0.025;
  const jawF = (offset: number) => Math.abs(Math.sin(frame * 0.04 + offset)) * 0.04;
  const firePulse = 0.5 + 0.5 * Math.sin(frame * 0.12);
  const time = frame / fps;

  return (
    <group scale={[fadeScale, fadeScale, fadeScale]}>
      {/* Environment — warm sunset for infernal feel */}
      <Environment preset="sunset" environmentIntensity={0.25} />

      {/* Lava ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshPhysicalMaterial
          color="#5a2a12"
          roughness={0.8}
          metalness={0.1}
          emissive="#551500"
          emissiveIntensity={0.2 + firePulse * 0.15}
          clearcoat={0.08}
        />
      </mesh>

      {/* Lava cracks — emissive lines */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = (i - 4) * 0.6 + Math.sin(i * 2.3) * 0.3;
        const z = Math.cos(i * 1.7) * 1.5;
        return (
          <mesh key={`lava-${i}`} position={[x, -0.43, z]} rotation={[-Math.PI / 2, 0, i * 0.8]}>
            <planeGeometry args={[0.03, 0.6 + (i % 3) * 0.3]} />
            <meshStandardMaterial
              color="#ff6600"
              emissive="#ff4400"
              emissiveIntensity={2 + firePulse * 3}
              toneMapped={false}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {/* Gates of Hades */}
      <group position={[0, 0, -1.8]}>
        {[-1.1, 1.1].map((x, i) => (
          <mesh key={`gp-${i}`} position={[x, 1.0, 0]} castShadow>
            <boxGeometry args={[0.3, 2.5, 0.3]} />
            <meshPhysicalMaterial color="#6a5545" roughness={0.85} metalness={0.1} clearcoat={0.05} />
          </mesh>
        ))}
        <mesh position={[0, 2.3, 0]} castShadow>
          <boxGeometry args={[2.6, 0.2, 0.3]} />
          <meshPhysicalMaterial color="#6a5545" roughness={0.85} metalness={0.1} />
        </mesh>
        <mesh position={[0, 2.0, 0]}>
          <torusGeometry args={[1.1, 0.1, 8, 24, Math.PI]} />
          <meshPhysicalMaterial color="#6a5545" roughness={0.8} />
        </mesh>
      </group>

      {/* ===== CERBERUS BODY — massive distorted organic mass ===== */}
      <group position={[0, 0, 0]}>
        {/* Main torso — MeshDistortMaterial */}
        <mesh position={[0, 0.15, -0.05]} castShadow scale={[0.55, 0.45, 0.7]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            ref={bodyMatRef}
            color="#8a6048"
            roughness={0.55}
            metalness={0.2}
            distort={0.12}
            speed={1.0}
            emissive="#3a1a08"
            emissiveIntensity={0.1}
          >
            <GradientTexture
              attach="map"
              stops={[0, 0.3, 0.7, 1]}
              colors={['#5a3a28', '#8a6048', '#7a5038', '#4a2a18']}
            />
          </MeshDistortMaterial>
        </mesh>

        {/* Chest/shoulder hump */}
        <mesh position={[0, 0.45, 0.15]} castShadow scale={[0.45, 0.35, 0.35]}>
          <sphereGeometry args={[1, 24, 24]} />
          <MeshDistortMaterial
            color="#8a6048"
            roughness={0.55}
            metalness={0.2}
            distort={0.08}
            speed={0.8}
          />
        </mesh>

        {/* Front legs — thick muscular */}
        {[-0.3, 0.3].map((x, i) => (
          <group key={`fleg-${i}`}>
            <mesh position={[x, -0.15, 0.25]} rotation={[0.12, 0, i === 0 ? 0.08 : -0.08]} castShadow>
              <cylinderGeometry args={[0.075, 0.06, 0.5, 12]} />
              <meshPhysicalMaterial
                color="#7a5538"
                roughness={0.6}
                metalness={0.15}
                clearcoat={0.1}
              />
            </mesh>
            {/* Paw */}
            <mesh position={[x, -0.4, 0.28]}>
              <sphereGeometry args={[0.06, 10, 8]} />
              <meshPhysicalMaterial color="#6a4530" roughness={0.75} />
            </mesh>
            {/* Claws — shiny */}
            {[-0.02, 0, 0.02].map((cx, ci) => (
              <mesh key={`claw-${i}-${ci}`} position={[x + cx, -0.46, 0.32]} rotation={[0.3, 0, 0]}>
                <coneGeometry args={[0.006, 0.03, 4]} />
                <meshPhysicalMaterial color="#ddccbb" roughness={0.3} metalness={0.3} clearcoat={0.8} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Back legs */}
        {[-0.32, 0.32].map((x, i) => (
          <group key={`bleg-${i}`}>
            <mesh position={[x, -0.1, -0.35]} rotation={[-0.15, 0, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.055, 0.5, 10]} />
              <meshPhysicalMaterial color="#7a5538" roughness={0.6} metalness={0.15} />
            </mesh>
            <mesh position={[x, -0.35, -0.3]}>
              <sphereGeometry args={[0.055, 8, 6]} />
              <meshPhysicalMaterial color="#6a4530" roughness={0.75} />
            </mesh>
          </group>
        ))}

        {/* Serpent tail — wobbling tube */}
        {Array.from({ length: 7 }, (_, i) => {
          const t = i / 7;
          const tailWave = Math.sin(time * 1.5 + t * 5) * 0.2 * t;
          const tailUp = Math.sin(time * 1.8 + t * 3) * 0.1 * t;
          return (
            <mesh key={`tail-${i}`} position={[tailWave, 0.12 + t * 0.25 + tailUp, -0.35 - t * 0.55]}>
              <sphereGeometry args={[0.055 - t * 0.005, 10, 8]} />
              <meshPhysicalMaterial
                color={i < 5 ? '#7a5538' : '#5a8a4a'}
                roughness={0.5}
                metalness={0.25}
                clearcoat={0.2}
                emissive={i >= 5 ? '#1a3a0a' : '#000'}
                emissiveIntensity={i >= 5 ? 0.3 : 0}
              />
            </mesh>
          );
        })}
        {/* Snake head at tail end */}
        {(() => {
          const tw = Math.sin(time * 1.5 + 5) * 0.2;
          return (
            <mesh position={[tw, 0.45, -0.9]}>
              <sphereGeometry args={[0.04, 10, 10]} />
              <meshPhysicalMaterial
                color="#6aaa5a"
                roughness={0.3}
                metalness={0.4}
                emissive="#2a5a1a"
                emissiveIntensity={0.5}
                clearcoat={0.5}
              />
            </mesh>
          );
        })()}

        {/* ===== THREE HEADS ===== */}
        <CerberusHead3D frame={frame} time={time} position={[-0.38, 0.7 + breatheF(0), 0.3]} rotation={[0, 0.3, 0]} jawOpen={jawF(0)} eyeOffset={0} scale={0.85} />
        <CerberusHead3D frame={frame} time={time} position={[0, 0.9 + breatheF(2), 0.42]} rotation={[0, 0, 0]} jawOpen={jawF(2)} eyeOffset={1} scale={1.0} />
        <CerberusHead3D frame={frame} time={time} position={[0.38, 0.7 + breatheF(4), 0.3]} rotation={[0, -0.3, 0]} jawOpen={jawF(4)} eyeOffset={2} scale={0.85} />

        {/* Spine ridge bumps */}
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={`spine-${i}`} position={[0, 0.42 - i * 0.02, 0.05 - i * 0.1]}>
            <sphereGeometry args={[0.04 - i * 0.003, 8, 8]} />
            <meshPhysicalMaterial color="#6a4a35" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* ===== LIGHTING ===== */}
      <ambientLight intensity={0.7} color="#ffddcc" />
      <directionalLight position={[-2, 4, 4]} intensity={3.5} color="#ffbb77" castShadow />
      <directionalLight position={[3, 3, 2]} intensity={2.0} color="#ffaa66" />
      <pointLight position={[0, 4, 0]} intensity={3.0} color="#ffcc88" distance={10} decay={1.5} />
      <pointLight position={[0, -0.3, 1]} intensity={4 + firePulse * 3} color="#ff6600" distance={8} decay={2} />
      <pointLight position={[0, -0.45, 0]} intensity={2.5 + firePulse * 1.5} color="#ff8800" distance={6} decay={2} />
      <pointLight position={[0, 3.5, -2]} intensity={2.5} color="#5566bb" distance={12} decay={2} />

      {/* Sparkles — fire embers */}
      <Sparkles count={100} scale={4} size={4} speed={0.8} color="#ff6600" opacity={0.8} />
      <Sparkles count={50} scale={3} size={6} speed={0.4} color="#ffaa33" opacity={0.6} />
      <Sparkles count={30} scale={2} size={3} speed={1.2} color="#ff3300" opacity={0.5} />

      {/* ===== POSTPROCESSING ===== */}
      <EffectComposer>
        <Bloom
          intensity={1.0}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.3}
          mipmapBlur
          kernelSize={KernelSize.MEDIUM}
        />
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.05}
          bokehScale={3}
        />
        <Vignette
          offset={0.25}
          darkness={0.75}
          blendFunction={BlendFunction.NORMAL}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.001, 0.001) as any}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise
          opacity={0.05}
          blendFunction={BlendFunction.OVERLAY}
        />
      </EffectComposer>
    </group>
  );
};

// ============================================================
// CERBERUS HEAD — detailed wolf head with physical material
// ============================================================
const CerberusHead3D: React.FC<{
  frame: number;
  time: number;
  position: [number, number, number];
  rotation: [number, number, number];
  jawOpen: number;
  eyeOffset: number;
  scale: number;
}> = ({ frame, time, position, rotation, jawOpen, eyeOffset, scale }) => {
  const eyePulse = 0.6 + 0.4 * Math.sin(time * 5 + eyeOffset * 2);

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Skull — distorted sphere for organic look */}
      <mesh castShadow scale={[1, 1.1, 1.2]}>
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshPhysicalMaterial
          color="#8a6048"
          roughness={0.5}
          metalness={0.2}
          clearcoat={0.15}
          clearcoatRoughness={0.6}
        />
      </mesh>

      {/* Snout — upper */}
      <mesh position={[0, -0.02, 0.2]} castShadow scale={[1, 0.7, 1.3]}>
        <boxGeometry args={[0.12, 0.08, 0.14]} />
        <meshPhysicalMaterial color="#8a6048" roughness={0.55} metalness={0.15} clearcoat={0.1} />
      </mesh>

      {/* Nose — dark wet */}
      <mesh position={[0, 0.01, 0.28]}>
        <sphereGeometry args={[0.025, 10, 10]} />
        <meshPhysicalMaterial color="#1a1010" roughness={0.2} metalness={0.3} clearcoat={0.9} />
      </mesh>

      {/* Lower jaw — animated */}
      <mesh position={[0, -0.08 - jawOpen * 0.5, 0.18]} rotation={[-jawOpen * 1.5, 0, 0]}>
        <boxGeometry args={[0.1, 0.04, 0.12]} />
        <meshPhysicalMaterial color="#7a5538" roughness={0.55} metalness={0.15} />
      </mesh>

      {/* Inside mouth — dark red when open */}
      {jawOpen > 0.01 && (
        <mesh position={[0, -0.04, 0.17]}>
          <boxGeometry args={[0.08, 0.03, 0.1]} />
          <meshStandardMaterial
            color="#330000"
            emissive="#440000"
            emissiveIntensity={1}
          />
        </mesh>
      )}

      {/* Teeth — upper row with clearcoat */}
      {[-0.035, -0.012, 0.012, 0.035].map((x, i) => (
        <mesh key={`ut-${i}`} position={[x, -0.05, 0.24]} rotation={[0.1, 0, 0]}>
          <coneGeometry args={[0.007, 0.035, 4]} />
          <meshPhysicalMaterial color="#eeeecc" roughness={0.25} metalness={0.15} clearcoat={0.7} />
        </mesh>
      ))}

      {/* Canine fangs — big and prominent */}
      {[-0.05, 0.05].map((x, fi) => (
        <mesh key={`fang-${fi}`} position={[x, -0.055, 0.21]}>
          <coneGeometry args={[0.009, 0.05, 4]} />
          <meshPhysicalMaterial color="#ffffdd" roughness={0.2} metalness={0.2} clearcoat={0.8} />
        </mesh>
      ))}

      {/* Lower teeth */}
      {[-0.025, 0, 0.025].map((x, i) => (
        <mesh key={`lt-${i}`} position={[x, -0.1 - jawOpen * 0.5, 0.22]} rotation={[Math.PI + jawOpen, 0, 0]}>
          <coneGeometry args={[0.006, 0.03, 4]} />
          <meshPhysicalMaterial color="#ddddbb" roughness={0.3} clearcoat={0.6} />
        </mesh>
      ))}

      {/* Eyes — BURNING with high emissive for Bloom */}
      {[[-0.065, 0.06, 0.13], [0.065, 0.06, 0.13]].map((pos, ei) => (
        <group key={`eye-${ei}`}>
          <mesh position={pos as any}>
            <sphereGeometry args={[0.018, 10, 10]} />
            <meshStandardMaterial color="#110000" roughness={0.9} />
          </mesh>
          <mesh position={[pos[0], pos[1], pos[2] + 0.008] as any}>
            <sphereGeometry args={[0.013, 10, 10]} />
            <meshStandardMaterial
              color="#ff4400"
              emissive="#ff3300"
              emissiveIntensity={8 + eyePulse * 15}
              toneMapped={false}
            />
          </mesh>
          <pointLight
            position={[pos[0], pos[1], pos[2] + 0.06] as any}
            color="#ff4400"
            intensity={1.0 + eyePulse * 2}
            distance={2}
            decay={2}
          />
        </group>
      ))}

      {/* Ears — pointed wolf ears */}
      {[-1, 1].map((side) => (
        <mesh key={`ear-${side}`} position={[side * 0.11, 0.18, -0.02]} rotation={[-0.15, 0, side * 0.3]}>
          <coneGeometry args={[0.035, 0.09, 4]} />
          <meshPhysicalMaterial color="#6a4530" roughness={0.7} />
        </mesh>
      ))}

      {/* Brow ridge — menacing */}
      <mesh position={[0, 0.1, 0.1]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.16, 0.02, 0.04]} />
        <meshPhysicalMaterial color="#6a4530" roughness={0.65} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, -0.08, -0.1]} rotation={[0.25, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.2, 10]} />
        <meshPhysicalMaterial color="#7a5538" roughness={0.6} metalness={0.12} />
      </mesh>

      {/* Drool */}
      {jawOpen > 0.015 && (
        <mesh position={[0, -0.12 - jawOpen * 2, 0.2]}>
          <sphereGeometry args={[0.005, 4, 4]} />
          <meshPhysicalMaterial color="#ccaa77" transparent opacity={0.4} clearcoat={1} />
        </mesh>
      )}
    </group>
  );
};

// ============================================================
// TITLE OVERLAY (2D cinematic on top of 3D)
// ============================================================
const TitleOverlay: React.FC<{
  title: string;
  subtitle: string;
  color: string;
  glowColor: string;
}> = ({ title, subtitle, color, glowColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame: frame - 30, fps, config: { damping: 15, mass: 0.8 } });
  const subIn = spring({ frame: frame - 50, fps, config: { damping: 15, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 10 }}>
      {/* Cinematic letterbox */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom, #000, transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top, #000, transparent)' }} />

      {/* Title text */}
      <div style={{ position: 'absolute', bottom: 100, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{
          fontSize: 84, fontWeight: 900, fontFamily: 'Georgia, serif',
          color, letterSpacing: 14, textTransform: 'uppercase',
          textShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}, 0 0 120px ${glowColor}40, 0 4px 20px rgba(0,0,0,0.9)`,
          opacity: titleIn, transform: `translateY(${(1 - titleIn) * 30}px)`,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 28, fontWeight: 300, fontFamily: 'Georgia, serif',
          color: `${color}bb`, letterSpacing: 18, textTransform: 'uppercase',
          textShadow: `0 0 20px ${glowColor}`,
          marginTop: 12, opacity: subIn, transform: `translateY(${(1 - subIn) * 20}px)`,
        }}>
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPOSITION
// ============================================================
export const GreekMonsters3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const SCENE_DUR = DURATION / 2;

  const scene1Op = interpolate(frame, [SCENE_DUR - 25, SCENE_DUR], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scene2Op = interpolate(frame, [SCENE_DUR - 25, SCENE_DUR], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Scene 1: Medusa */}
      {frame < SCENE_DUR + 25 && (
        <Sequence from={0} durationInFrames={SCENE_DUR + 25}>
          <AbsoluteFill style={{ opacity: scene1Op }}>
            <ThreeCanvas linear width={width} height={height}>
              <MedusaScene3D />
            </ThreeCanvas>
            <TitleOverlay
              title="MEDUSA"
              subtitle="The Gorgon Queen"
              color="#44ee66"
              glowColor="#22bb44"
            />
          </AbsoluteFill>
        </Sequence>
      )}

      {/* Scene 2: Cerberus */}
      {frame >= SCENE_DUR - 25 && (
        <Sequence from={SCENE_DUR - 25} durationInFrames={SCENE_DUR + 25}>
          <AbsoluteFill style={{ opacity: scene2Op }}>
            <ThreeCanvas linear width={width} height={height}>
              <CerberusScene3D />
            </ThreeCanvas>
            <TitleOverlay
              title="CERBERUS"
              subtitle="Three-Headed Guardian of Hades"
              color="#ff7733"
              glowColor="#cc5511"
            />
          </AbsoluteFill>
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
