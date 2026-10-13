import React, { useRef, useMemo, useEffect } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
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
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { Environment } from '@react-three/drei';

// ============================================================
// APPROACH 1: Custom GLSL Vertex Shader + Perlin Noise Displacement
// Takes a simple sphere → deforms into organic creature
// ============================================================

// Perlin noise GLSL (classic 3D noise)
const NOISE_GLSL = /* glsl */ `
// Classic Perlin 3D Noise by Stefan Gustavson
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec3 P){
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000), dot(g010,g010), dot(g100,g100), dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001), dot(g011,g011), dot(g101,g101), dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}
`;

// ---- Organic Medusa Head ----
const OrganicMedusaHead: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const time = frame / fps;

  // Update time uniform every frame
  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.u_time.value = time;
    }
  }, [time]);

  const { vertexShader, fragmentShader, uniforms } = useMemo(() => ({
    uniforms: {
      u_time: { value: 0 },
      u_noiseScale: { value: 1.8 },
      u_noiseStrength: { value: 0.25 },
      u_color1: { value: new THREE.Color('#2a7a3a') },
      u_color2: { value: new THREE.Color('#44dd66') },
      u_color3: { value: new THREE.Color('#0a3a15') },
      u_eyeGlow: { value: new THREE.Color('#00ff55') },
    },
    vertexShader: /* glsl */ `
      ${NOISE_GLSL}
      uniform float u_time;
      uniform float u_noiseScale;
      uniform float u_noiseStrength;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDisplacement;
      varying vec3 vWorldPosition;

      void main() {
        vNormal = normal;
        vPosition = position;

        // Multi-octave noise displacement
        float noise1 = cnoise(position * u_noiseScale + u_time * 0.3);
        float noise2 = cnoise(position * u_noiseScale * 2.0 + u_time * 0.5) * 0.5;
        float noise3 = cnoise(position * u_noiseScale * 4.0 + u_time * 0.8) * 0.25;
        float displacement = (noise1 + noise2 + noise3) * u_noiseStrength;

        // Extra displacement for "snake hair" on top of head
        float topMask = smoothstep(0.3, 0.8, position.y); // more displacement on top
        float snakeNoise = cnoise(position * 3.0 + vec3(0.0, u_time * 0.6, 0.0));
        displacement += topMask * snakeNoise * 0.3;

        // Pulse/breathe
        float breathe = sin(u_time * 2.0) * 0.02;
        displacement += breathe;

        vec3 newPosition = position + normal * displacement;
        vDisplacement = displacement;
        vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float u_time;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform vec3 u_eyeGlow;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDisplacement;
      varying vec3 vWorldPosition;

      void main() {
        // Base color mix based on displacement
        vec3 color = mix(u_color1, u_color2, vDisplacement * 2.0 + 0.5);
        color = mix(color, u_color3, smoothstep(-0.1, -0.3, vDisplacement));

        // Fake rim lighting
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
        rim = pow(rim, 3.0);
        color += u_eyeGlow * rim * 0.4;

        // Eye glow zones (two spots on front face)
        float frontFace = max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
        float leftEye = smoothstep(0.06, 0.0, length(vPosition.xy - vec2(-0.15, 0.1)));
        float rightEye = smoothstep(0.06, 0.0, length(vPosition.xy - vec2(0.15, 0.1)));
        float eyeMask = (leftEye + rightEye) * frontFace;
        float eyePulse = 0.7 + 0.3 * sin(u_time * 4.0);
        color += u_eyeGlow * eyeMask * eyePulse * 3.0;

        // Vein-like pattern
        float veins = abs(sin(vPosition.y * 20.0 + vDisplacement * 10.0 + u_time)) * 0.15;
        color += vec3(0.0, veins * 0.5, veins * 0.2);

        // Simple lighting
        vec3 lightDir = normalize(vec3(1.0, 2.0, 3.0));
        float diffuse = max(dot(vNormal, lightDir), 0.0) * 0.6 + 0.4;
        color *= diffuse;

        // Specular
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
        color += vec3(0.1, 0.3, 0.15) * spec;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  }), []);

  return (
    <mesh scale={[1.5, 1.5, 1.5]}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

// ---- Snake tendrils (cylinder with noise displacement) ----
const SnakeTendril: React.FC<{
  angle: number;
  length: number;
  index: number;
}> = ({ angle, length, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const time = frame / fps;

  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.u_time.value = time;
    }
  }, [time]);

  const { vertexShader, fragmentShader, uniforms } = useMemo(() => ({
    uniforms: {
      u_time: { value: 0 },
      u_index: { value: index },
    },
    vertexShader: /* glsl */ `
      ${NOISE_GLSL}
      uniform float u_time;
      uniform float u_index;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vHeight;

      void main() {
        vNormal = normal;
        vPosition = position;
        vHeight = (position.y + 0.5); // 0 to 1 along cylinder

        // Wave displacement increases with height
        float wave = sin(vHeight * 6.0 + u_time * 3.0 + u_index * 1.7) * 0.08 * vHeight;
        float wave2 = cos(vHeight * 4.0 + u_time * 2.0 + u_index * 2.3) * 0.06 * vHeight;
        float noise = cnoise(vec3(position.x * 4.0, position.y * 2.0 + u_time * 0.5, u_index)) * 0.04;

        vec3 newPos = position;
        newPos.x += wave + noise;
        newPos.z += wave2;
        // Thicken base, thin tip
        float taper = 1.0 - vHeight * 0.6;
        newPos.x *= taper;
        newPos.z *= taper;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float u_time;
      uniform float u_index;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vHeight;

      void main() {
        // Green scales pattern
        vec3 baseColor = vec3(0.15 + vHeight * 0.1, 0.45 + vHeight * 0.2, 0.2);
        float scales = abs(sin(vPosition.y * 30.0 + u_index * 2.0)) * 0.15;
        baseColor += vec3(0.0, scales, scales * 0.5);

        // Glow at tip (snake head)
        float tipGlow = smoothstep(0.8, 1.0, vHeight);
        baseColor += vec3(0.1, 0.8, 0.3) * tipGlow * (0.7 + 0.3 * sin(u_time * 5.0 + u_index));

        // Simple lighting
        vec3 lightDir = normalize(vec3(1.0, 2.0, 2.0));
        float diff = max(dot(vNormal, lightDir), 0.0) * 0.6 + 0.4;
        baseColor *= diff;

        gl_FragColor = vec4(baseColor, 1.0);
      }
    `,
  }), [index]);

  const x = Math.sin(angle) * 0.6;
  const z = Math.cos(angle) * 0.6;

  return (
    <mesh
      position={[x, 1.2, z]}
      rotation={[
        Math.cos(angle) * 0.6,
        0,
        -Math.sin(angle) * 0.6,
      ]}
    >
      <cylinderGeometry args={[0.04, 0.08, length, 16, 32]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

// ---- Scene setup ----
const ShaderMonsterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cameraRef = useThree((s) => s.camera);
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2('#050e05', 0.15);
    scene.background = new THREE.Color('#050e05');
  }, [scene]);

  const camAngle = interpolate(frame, [0, 300], [0, Math.PI * 0.3]);
  const camDist = interpolate(frame, [0, 300], [3.5, 2.8]);
  const camY = interpolate(frame, [0, 300], [0.5, 1.0]);

  useEffect(() => {
    cameraRef.position.set(
      Math.sin(camAngle) * camDist,
      camY,
      Math.cos(camAngle) * camDist
    );
    cameraRef.lookAt(0, 0.3, 0);
    (cameraRef as THREE.PerspectiveCamera).fov = 40;
    (cameraRef as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [cameraRef, camAngle, camDist, camY]);

  const snakes = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      angle: (i / 16) * Math.PI * 2,
      length: 0.8 + (i % 4) * 0.25,
      index: i,
    })), []);

  return (
    <>
      <Environment preset="forest" environmentIntensity={0.4} />

      {/* Organic Medusa head */}
      <OrganicMedusaHead />

      {/* Snake hair tendrils */}
      {snakes.map((s) => (
        <SnakeTendril key={s.index} angle={s.angle} length={s.length} index={s.index} />
      ))}

      {/* Body below head */}
      <mesh position={[0, -1.2, 0]} scale={[0.8, 1.2, 0.6]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          color="#2a6a3a"
          roughness={0.4}
          metalness={0.3}
          clearcoat={0.3}
          emissive="#0a3a15"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.5} color="#aaddbb" />
      <directionalLight position={[-2, 4, 4]} intensity={2.5} color="#bbffcc" />
      <pointLight position={[0, 2, 2]} intensity={2} color="#44ff66" distance={8} decay={2} />
      <pointLight position={[0, -1, 1]} intensity={1.5} color="#22aa44" distance={5} decay={2} />
      <pointLight position={[2, 0, -2]} intensity={1.5} color="#5577bb" distance={8} decay={2} />

      <EffectComposer>
        <Bloom intensity={0.6} luminanceThreshold={0.4} mipmapBlur kernelSize={KernelSize.MEDIUM} />
        <Vignette offset={0.3} darkness={0.6} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </>
  );
};

// ---- Main component ----
const ShaderMonster: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <ThreeCanvas linear width={width} height={height}>
        <ShaderMonsterScene />
      </ThreeCanvas>
      {/* Label */}
      <div style={{
        position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center',
        color: '#44ee66', fontSize: 32, fontFamily: 'Georgia, serif',
        letterSpacing: 8, textTransform: 'uppercase',
        textShadow: '0 0 30px #22bb44',
      }}>
        Approach 1: GLSL Noise Displacement
      </div>
    </AbsoluteFill>
  );
};

// Composition registration
export const ShaderMonsterComp: React.FC = () => (
  <Composition
    id="ShaderMonster"
    component={ShaderMonster}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default ShaderMonster;
