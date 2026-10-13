import React, { useRef, useMemo, useEffect } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
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
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

// ============================================================
// APPROACH 2: Raymarching + SDF (Signed Distance Fields)
// Entire creature rendered in fragment shader — no geometry needed
// Just a fullscreen quad + math
// ============================================================

const SDF_FRAGMENT = /* glsl */ `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_cameraPos;
uniform mat4 u_viewMatrix;

// ---- SDF PRIMITIVES ----
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdEllipsoid(vec3 p, vec3 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}

float sdCappedCylinder(vec3 p, float h, float r) {
  vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdCone(vec3 p, vec2 c, float h) {
  vec2 q = h * vec2(c.x / c.y, -1.0);
  vec2 w = vec2(length(p.xz), p.y);
  vec2 a = w - q * clamp(dot(w, q) / dot(q, q), 0.0, 1.0);
  vec2 b = w - q * vec2(clamp(w.x / q.x, 0.0, 1.0), 1.0);
  float k = sign(q.y);
  float d = min(dot(a, a), dot(b, b));
  float s = max(k * (w.x * q.y - w.y * q.x), k * (w.y - q.y));
  return sqrt(d) * sign(s);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

// Smooth union
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Smooth subtraction
float smax(float a, float b, float k) {
  return -smin(-a, -b, k);
}

// ---- NOISE ----
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0); Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz; vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0); vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0; vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0); vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0; vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1); vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x); vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z); vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x); vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z); vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0); float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z)); float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z)); float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz)); float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110), vec4(n001,n101,n011,n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  return mix(n_yz.x, n_yz.y, fade_xyz.x);
}

// ---- ROTATION HELPERS ----
mat2 rot2D(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// ============================================================
// CERBERUS SDF — Three-headed hellhound
// ============================================================
float cerberusBody(vec3 p) {
  // Main torso — ellipsoid
  float body = sdEllipsoid(p - vec3(0.0, 0.0, 0.0), vec3(0.7, 0.5, 1.0));

  // Organic noise on surface
  float noiseDist = cnoise(p * 2.0 + u_time * 0.2) * 0.08;
  body += noiseDist;

  // Shoulder hump
  float shoulders = sdEllipsoid(p - vec3(0.0, 0.3, 0.4), vec3(0.55, 0.35, 0.4));
  body = smin(body, shoulders, 0.2);

  // Haunches
  float haunches = sdEllipsoid(p - vec3(0.0, 0.1, -0.5), vec3(0.5, 0.4, 0.4));
  body = smin(body, haunches, 0.2);

  return body;
}

float cerberusHead(vec3 p, float headAngle) {
  // Rotate head sideways
  p.xz *= rot2D(headAngle);

  // Skull — elongated sphere
  float skull = sdEllipsoid(p, vec3(0.22, 0.2, 0.28));

  // Snout
  vec3 snoutP = p - vec3(0.0, -0.04, 0.25);
  float snout = sdEllipsoid(snoutP, vec3(0.12, 0.08, 0.18));
  skull = smin(skull, snout, 0.08);

  // Jaw (animated)
  float jawOpen = abs(sin(u_time * 2.0 + headAngle * 3.0)) * 0.06;
  vec3 jawP = p - vec3(0.0, -0.12 - jawOpen, 0.2);
  float jaw = sdEllipsoid(jawP, vec3(0.1, 0.04, 0.15));
  skull = smin(skull, jaw, 0.05);

  // Ears
  vec3 earLP = p - vec3(-0.15, 0.2, -0.05);
  float earL = sdEllipsoid(earLP, vec3(0.04, 0.1, 0.03));
  vec3 earRP = p - vec3(0.15, 0.2, -0.05);
  float earR = sdEllipsoid(earRP, vec3(0.04, 0.1, 0.03));
  skull = smin(skull, earL, 0.03);
  skull = smin(skull, earR, 0.03);

  // Surface noise
  skull += cnoise(p * 5.0 + u_time * 0.3) * 0.02;

  return skull;
}

float cerberusLeg(vec3 p) {
  // Upper leg
  float upper = sdCappedCylinder(p, 0.25, 0.07);
  // Lower leg
  vec3 lowerP = p - vec3(0.0, -0.4, 0.05);
  float lower = sdCappedCylinder(lowerP, 0.2, 0.05);
  // Paw
  vec3 pawP = p - vec3(0.0, -0.6, 0.08);
  float paw = sdSphere(pawP, 0.08);

  float leg = smin(upper, lower, 0.05);
  leg = smin(leg, paw, 0.04);
  return leg;
}

float cerberusTail(vec3 p) {
  // Serpent tail — chain of spheres along curve
  float tail = 1e10;
  for (int i = 0; i < 6; i++) {
    float t = float(i) / 6.0;
    float wave = sin(u_time * 1.5 + t * 5.0) * 0.2 * t;
    vec3 tp = vec3(wave, t * 0.3, -0.8 - t * 0.6);
    float seg = sdSphere(p - tp, 0.07 - t * 0.008);
    tail = smin(tail, seg, 0.06);
  }
  return tail;
}

// ---- MAIN SDF ----
float sceneSDF(vec3 p) {
  // Body
  float d = cerberusBody(p);

  // Three heads
  vec3 neckBase = vec3(0.0, 0.45, 0.6);
  // Center head
  float centerHead = cerberusHead(p - neckBase - vec3(0.0, 0.25, 0.15), 0.0);
  // Left head
  float leftHead = cerberusHead(p - neckBase - vec3(-0.3, 0.15, 0.05), 0.3);
  // Right head
  float rightHead = cerberusHead(p - neckBase - vec3(0.3, 0.15, 0.05), -0.3);

  // Necks (cylinders connecting to heads)
  float neckC = sdCappedCylinder(p - neckBase - vec3(0.0, 0.1, 0.05), 0.15, 0.1);
  float neckL = sdCappedCylinder(p - neckBase - vec3(-0.15, 0.05, 0.0), 0.12, 0.08);
  float neckR = sdCappedCylinder(p - neckBase - vec3(0.15, 0.05, 0.0), 0.12, 0.08);

  d = smin(d, neckC, 0.15);
  d = smin(d, neckL, 0.12);
  d = smin(d, neckR, 0.12);
  d = smin(d, centerHead, 0.08);
  d = smin(d, leftHead, 0.08);
  d = smin(d, rightHead, 0.08);

  // Legs
  float fl = cerberusLeg(p - vec3(-0.35, -0.3, 0.35));
  float fr = cerberusLeg(p - vec3(0.35, -0.3, 0.35));
  float bl = cerberusLeg(p - vec3(-0.35, -0.3, -0.4));
  float br = cerberusLeg(p - vec3(0.35, -0.3, -0.4));
  d = smin(d, fl, 0.1);
  d = smin(d, fr, 0.1);
  d = smin(d, bl, 0.1);
  d = smin(d, br, 0.1);

  // Tail
  float tail = cerberusTail(p);
  d = smin(d, tail, 0.08);

  // Ground plane
  float ground = p.y + 0.9;
  d = min(d, ground);

  return d;
}

// ---- NORMAL ESTIMATION ----
vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    sceneSDF(p + e.xyy) - sceneSDF(p - e.xyy),
    sceneSDF(p + e.yxy) - sceneSDF(p - e.yxy),
    sceneSDF(p + e.yyx) - sceneSDF(p - e.yyx)
  ));
}

// ---- SOFT SHADOW ----
float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
  float res = 1.0;
  float t = mint;
  for (int i = 0; i < 32; i++) {
    float h = sceneSDF(ro + rd * t);
    res = min(res, k * h / t);
    t += clamp(h, 0.02, 0.1);
    if (h < 0.001 || t > maxt) break;
  }
  return clamp(res, 0.0, 1.0);
}

// ---- AMBIENT OCCLUSION ----
float calcAO(vec3 pos, vec3 nor) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.01 + 0.12 * float(i) / 4.0;
    float d = sceneSDF(pos + h * nor);
    occ += (h - d) * sca;
    sca *= 0.95;
  }
  return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}

// ---- RAY MARCH ----
float rayMarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 128; i++) {
    vec3 p = ro + rd * t;
    float d = sceneSDF(p);
    if (d < 0.001) return t;
    if (t > 20.0) break;
    t += d * 0.8; // slightly conservative step
  }
  return -1.0;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

  // Camera setup
  vec3 ro = u_cameraPos;
  vec3 forward = normalize(vec3(0.0, 0.2, 0.0) - ro);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, forward);
  vec3 rd = normalize(forward * 1.5 + right * uv.x + up * uv.y);

  // Background gradient
  vec3 color = mix(vec3(0.02, 0.01, 0.0), vec3(0.08, 0.03, 0.01), uv.y + 0.5);

  // Raymarch
  float t = rayMarch(ro, rd);
  if (t > 0.0) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    float ao = calcAO(p, n);

    // Material — determine if ground or creature
    bool isGround = p.y < -0.85;

    vec3 baseColor;
    if (isGround) {
      // Lava ground
      float lavaPattern = cnoise(p.xz * 3.0 + u_time * 0.1);
      baseColor = mix(vec3(0.15, 0.05, 0.02), vec3(0.4, 0.1, 0.02), smoothstep(-0.2, 0.2, lavaPattern));
      // Lava cracks
      float cracks = smoothstep(0.3, 0.35, abs(lavaPattern));
      baseColor += vec3(1.0, 0.3, 0.0) * (1.0 - cracks) * 0.5;
    } else {
      // Creature — dark reddish-brown with noise variation
      float skinNoise = cnoise(p * 4.0) * 0.15;
      baseColor = vec3(0.35 + skinNoise, 0.18 + skinNoise * 0.5, 0.1);

      // Eye glow detection (approximate eye positions)
      vec3 headCenter = vec3(0.0, 0.7, 0.75);
      vec3 headLeft = vec3(-0.3, 0.6, 0.65);
      vec3 headRight = vec3(0.3, 0.6, 0.65);

      float eyeC = smoothstep(0.15, 0.0, length(p - headCenter - vec3(0.0, 0.02, 0.22)));
      float eyeL = smoothstep(0.12, 0.0, length(p - headLeft - vec3(0.0, 0.02, 0.2)));
      float eyeR = smoothstep(0.12, 0.0, length(p - headRight - vec3(0.0, 0.02, 0.2)));
      float eyeGlow = (eyeC + eyeL + eyeR) * (0.7 + 0.3 * sin(u_time * 4.0));
      baseColor += vec3(2.0, 0.3, 0.0) * eyeGlow;
    }

    // Lighting
    vec3 lightPos = vec3(2.0, 4.0, 3.0);
    vec3 lightDir = normalize(lightPos - p);
    float diff = max(dot(n, lightDir), 0.0);

    // Shadow
    float shadow = softShadow(p + n * 0.01, lightDir, 0.01, 10.0, 8.0);

    // Rim light
    vec3 viewDir = normalize(ro - p);
    float rim = pow(1.0 - max(dot(viewDir, n), 0.0), 3.0);

    // Specular
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(n, halfDir), 0.0), 32.0);

    // Fire underlight
    vec3 fireDir = normalize(vec3(0.0, 1.0, 0.0));
    float fireDiff = max(dot(n, fireDir), 0.0) * 0.3;
    float firePulse = 0.7 + 0.3 * sin(u_time * 6.0);

    // Compose lighting
    color = baseColor * (0.15 + diff * shadow * 0.6) * ao;
    color += baseColor * fireDiff * vec3(1.0, 0.4, 0.1) * firePulse;
    color += vec3(1.0, 0.4, 0.1) * rim * 0.3;
    color += vec3(0.8, 0.6, 0.4) * spec * shadow * 0.4;

    // Atmospheric fog
    float fog = 1.0 - exp(-t * 0.15);
    color = mix(color, vec3(0.05, 0.02, 0.01), fog);
  }

  // Tone mapping (simple Reinhard)
  color = color / (color + vec3(1.0));
  // Gamma
  color = pow(color, vec3(0.4545));

  gl_FragColor = vec4(color, 1.0);
}
`;

const SDF_VERTEX = /* glsl */ `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

// ---- SDF Fullscreen Quad ----
const SDFCerberus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const time = frame / fps;

  // Camera orbit
  const camAngle = interpolate(frame, [0, 300], [0.3, -0.3]);
  const camY = interpolate(frame, [0, 300], [0.8, 1.2]);
  const camDist = interpolate(frame, [0, 300], [3.5, 2.8]);

  const camPos = useMemo(() => new THREE.Vector3(
    Math.sin(camAngle) * camDist,
    camY,
    Math.cos(camAngle) * camDist
  ), [camAngle, camY, camDist]);

  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.u_time.value = time;
      matRef.current.uniforms.u_cameraPos.value = camPos;
    }
  }, [time, camPos]);

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(width, height) },
    u_cameraPos: { value: new THREE.Vector3(0, 0.8, 3.5) },
    u_viewMatrix: { value: new THREE.Matrix4() },
  }), [width, height]);

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={SDF_VERTEX}
        fragmentShader={SDF_FRAGMENT}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

// ---- Scene (SDF renders its own scene, no R3F 3D needed) ----
const SDFMonsterScene: React.FC = () => {
  const cameraRef = useThree((s) => s.camera);

  useEffect(() => {
    // Orthographic-like: position camera to see fullscreen quad
    cameraRef.position.set(0, 0, 1);
    cameraRef.lookAt(0, 0, 0);
  }, [cameraRef]);

  return (
    <>
      <SDFCerberus />
      {/* No postprocessing needed — SDF does its own lighting/shadows */}
    </>
  );
};

// ---- Main component ----
const SDFMonster: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <ThreeCanvas
        orthographic
        linear
        width={width}
        height={height}
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 } as any}
      >
        <SDFMonsterScene />
      </ThreeCanvas>
      {/* Label */}
      <div style={{
        position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center',
        color: '#ff7733', fontSize: 32, fontFamily: 'Georgia, serif',
        letterSpacing: 8, textTransform: 'uppercase',
        textShadow: '0 0 30px #cc5511',
      }}>
        Approach 2: Raymarching SDF
      </div>
    </AbsoluteFill>
  );
};

// Composition registration
export const SDFMonsterComp: React.FC = () => (
  <Composition
    id="SDFMonster"
    component={SDFMonster}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export default SDFMonster;
