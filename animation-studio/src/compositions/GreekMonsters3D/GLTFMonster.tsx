import React, { useEffect, useRef, useState, Suspense } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree, useLoader } from '@react-three/fiber';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Composition,
  staticFile,
} from 'remotion';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  EffectComposer,
  Bloom,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { Environment, Sparkles } from '@react-three/drei';

// ============================================================
// APPROACH 3: Load GLTF/GLB 3D Model
// Real 3D model sculpted in professional software
// ============================================================

// ---- Dragon Model Component ----
const TARGET_SIZE = 2.5; // Target size in world units (camera is ~3-4 units away)

const DragonModel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const gltf = useLoader(GLTFLoader, staticFile('models/dragon.glb'));
  const groupRef = useRef<THREE.Group>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!gltf.scene) return;

    // Reset any previous transforms
    gltf.scene.scale.set(1, 1, 1);
    gltf.scene.position.set(0, 0, 0);
    gltf.scene.rotation.set(0, 0, 0);
    gltf.scene.updateMatrixWorld(true);

    // Debug: count meshes and log hierarchy
    let meshCount = 0;
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        meshCount++;
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#ccbbaa'),
          roughness: 0.3,
          metalness: 0.6,
          clearcoat: 0.5,
          clearcoatRoughness: 0.2,
          emissive: new THREE.Color('#3a1a08'),
          emissiveIntensity: 0.2,
        });
      }
    });
    console.log(`[GLTF] Found ${meshCount} meshes`);

    // Compute bounding box AFTER material assignment, with world matrix
    gltf.scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    console.log(`[GLTF] Raw size: ${size.x.toFixed(4)}, ${size.y.toFixed(4)}, ${size.z.toFixed(4)}`);
    console.log(`[GLTF] Center: ${center.x.toFixed(4)}, ${center.y.toFixed(4)}, ${center.z.toFixed(4)}`);
    console.log(`[GLTF] MaxDim: ${maxDim.toFixed(6)}`);

    if (maxDim > 0.0001) {
      // Scale to fit TARGET_SIZE
      const scaleFactor = TARGET_SIZE / maxDim;
      gltf.scene.scale.setScalar(scaleFactor);
      console.log(`[GLTF] Applied scale: ${scaleFactor.toFixed(2)}`);

      // Recompute box after scaling
      gltf.scene.updateMatrixWorld(true);
      const newBox = new THREE.Box3().setFromObject(gltf.scene);
      const newCenter = newBox.getCenter(new THREE.Vector3());

      // Center the model at origin, with bottom at y=0
      const newSize = newBox.getSize(new THREE.Vector3());
      gltf.scene.position.set(
        -newCenter.x,
        -newBox.min.y, // lift so bottom sits at y=0
        -newCenter.z
      );

      console.log(`[GLTF] Final size: ${newSize.x.toFixed(2)}, ${newSize.y.toFixed(2)}, ${newSize.z.toFixed(2)}`);
    } else {
      // Model is essentially zero-sized, try extreme scale
      console.warn('[GLTF] Model has near-zero dimensions, trying scale 10000');
      gltf.scene.scale.setScalar(10000);
    }

    setReady(true);
  }, [gltf]);

  // Slow rotation
  const rotY = interpolate(frame, [0, 300], [0, Math.PI * 0.4]);
  const breathe = 1.0 + Math.sin(time * 2.0) * 0.01;

  return (
    <group ref={groupRef} rotation={[0, rotY, 0]} scale={[breathe, breathe, breathe]}>
      <primitive object={gltf.scene} />
      {/* Debug: visible axes helper */}
      {!ready && <axesHelper args={[2]} />}
    </group>
  );
};

// ---- Scene ----
const GLTFScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cameraRef = useThree((s) => s.camera);
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2('#0a0500', 0.02);
    scene.background = new THREE.Color('#080400');
  }, [scene]);

  // Camera orbit — wider to see the model
  const camAngle = interpolate(frame, [0, 300], [0.5, -0.3]);
  const camY = interpolate(frame, [0, 300], [1.0, 1.8]);
  const camDist = interpolate(frame, [0, 300], [4.0, 3.0]);

  useEffect(() => {
    cameraRef.position.set(
      Math.sin(camAngle) * camDist,
      camY,
      Math.cos(camAngle) * camDist
    );
    cameraRef.lookAt(0, 0.0, 0);
    (cameraRef as THREE.PerspectiveCamera).fov = 45;
    (cameraRef as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [cameraRef, camAngle, camY, camDist]);

  const firePulse = 0.5 + 0.5 * Math.sin(frame * 0.12);

  return (
    <>
      <Environment preset="sunset" environmentIntensity={0.3} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshPhysicalMaterial
          color="#3a1a0a"
          roughness={0.85}
          metalness={0.1}
          emissive="#331100"
          emissiveIntensity={0.1 + firePulse * 0.08}
        />
      </mesh>

      {/* The 3D Model */}
      <Suspense fallback={null}>
        <DragonModel />
      </Suspense>

      {/* Lighting */}
      <ambientLight intensity={0.6} color="#ffddcc" />
      <directionalLight position={[-3, 5, 4]} intensity={3.0} color="#ffbb88" castShadow />
      <directionalLight position={[3, 3, -2]} intensity={1.5} color="#ff9966" />
      <pointLight position={[0, 3, 0]} intensity={2.5} color="#ffcc88" distance={10} decay={1.5} />
      <pointLight position={[0, -0.5, 2]} intensity={2 + firePulse * 2} color="#ff5500" distance={6} decay={2} />
      <pointLight position={[-2, 1, -2]} intensity={2} color="#5566bb" distance={8} decay={2} />

      {/* Sparkles */}
      <Sparkles count={60} scale={4} size={4} speed={0.6} color="#ff6600" opacity={0.7} />
      <Sparkles count={30} scale={3} size={5} speed={0.3} color="#ffaa33" opacity={0.5} />

      {/* Postprocessing */}
      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.4} mipmapBlur kernelSize={KernelSize.MEDIUM} />
        <Vignette offset={0.3} darkness={0.65} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </>
  );
};

// ---- Main ----
const GLTFMonster: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <ThreeCanvas linear width={width} height={height}>
        <GLTFScene />
      </ThreeCanvas>
      <div style={{
        position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center',
      }}>
        <div style={{
          fontSize: 72, fontWeight: 900, fontFamily: 'Georgia, serif',
          color: '#ff7733', letterSpacing: 12, textTransform: 'uppercase',
          textShadow: '0 0 40px #cc5511, 0 0 80px #cc551180',
        }}>
          DRAGON
        </div>
        <div style={{
          fontSize: 24, fontWeight: 300, fontFamily: 'Georgia, serif',
          color: '#ff773399', letterSpacing: 14, textTransform: 'uppercase',
          textShadow: '0 0 20px #cc5511',
          marginTop: 8,
        }}>
          Approach 3: GLTF Model Loading
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const GLTFMonsterComp: React.FC = () => (
  <Composition
    id="GLTFMonster"
    component={GLTFMonster}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default GLTFMonster;
