/** Absolute-frame execution primitives. Direction remains in the typed packet. */
export type Vec3 = readonly [number, number, number];
export type TrackValue = number | Vec3;
export type Channel = 'position' | 'rotation' | 'scale' | 'opacity' | 'emission' | 'progress';
export type Keyframe = {frame: number; value: TrackValue};
export type Track = {channel: Channel; keyframes: Keyframe[]};
export type Interval = {start_frame: number; end_frame: number};
export type Action = {
  action_id: string;
  instance_id: string;
  time: Interval;
  from_state: string;
  to_state: string;
  tracks: Track[];
};
export type Instance = {instance_id: string; asset_id: string; state_in: string; state_out: string};
export type Shot = {
  shot_id: string;
  scene_id: string;
  time: Interval;
  instances: Instance[];
  actions: Action[];
  transition_in: string | null;
  transition_out: string | null;
};
export type Manifest = {film_id: string; fps: number; shots: Shot[]};
export type EvaluatedInstance = {
  instanceId: string;
  assetId: string;
  state: string;
  channels: Partial<Record<Channel, TrackValue>>;
};
export type ShotContext = {
  frame: number;
  localFrame: number;
  shot: Shot;
  instances: Record<string, EvaluatedInstance>;
};

function finite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label}: finite value required`);
}

/** Linear tracks are a base executor; authored rigs may use bounded custom evaluators. */
export function sampleTrack(track: Track, frame: number): TrackValue {
  finite(frame, 'frame');
  const keys = track.keyframes;
  if (keys.length < 2) throw new Error('A track requires at least two keyframes');
  for (let i = 0; i < keys.length; i++) {
    finite(keys[i].frame, 'keyframe');
    if (i && keys[i].frame <= keys[i - 1].frame) throw new Error('Keyframes must be strictly increasing');
  }
  const dimensionality = typeof keys[0].value === 'number' ? 1 : 3;
  for (const key of keys) {
    if ((typeof key.value === 'number' ? 1 : key.value.length) !== dimensionality) throw new Error('Track dimensions differ');
    for (const value of typeof key.value === 'number' ? [key.value] : key.value) finite(value, 'track value');
  }
  if (frame <= keys[0].frame) return keys[0].value;
  if (frame >= keys[keys.length - 1].frame) return keys[keys.length - 1].value;
  const end = keys.findIndex((key) => key.frame >= frame);
  const a = keys[end - 1]; const b = keys[end];
  const progress = (frame - a.frame) / (b.frame - a.frame);
  if (typeof a.value === 'number' && typeof b.value === 'number') return a.value + (b.value - a.value) * progress;
  if (typeof a.value === 'number' || typeof b.value === 'number') throw new Error('Track dimensions differ');
  return a.value.map((value, i) => value + ((b.value as Vec3)[i] - value) * progress) as unknown as Vec3;
}

export function activeShot(manifest: Manifest, frame: number): Shot | null {
  finite(frame, 'frame');
  return manifest.shots.find((shot) => frame >= shot.time.start_frame && frame < shot.time.end_frame) ?? null;
}

/** Reconstruct from all authored actions up to T, never from prior playback/mount state. */
export function evaluateFrame(manifest: Manifest, frame: number): ShotContext | null {
  const shot = activeShot(manifest, frame);
  if (!shot) return null;
  const instances: Record<string, EvaluatedInstance> = {};
  const previousShots = manifest.shots.filter((candidate) => candidate.time.start_frame <= frame)
    .sort((a, b) => a.time.start_frame - b.time.start_frame);
  for (const candidate of previousShots) {
    for (const instance of candidate.instances) {
      const previous = instances[instance.instance_id];
      if (previous && previous.assetId !== instance.asset_id) throw new Error('Canonical instance identity changed');
      instances[instance.instance_id] = previous ?? {instanceId: instance.instance_id, assetId: instance.asset_id, state: instance.state_in, channels: {}};
    }
    for (const action of [...candidate.actions].sort((a, b) => a.time.start_frame - b.time.start_frame)) {
      if (frame < action.time.start_frame) continue;
      const instance = instances[action.instance_id];
      if (!instance) throw new Error(`Missing actor for ${action.action_id}`);
      for (const track of action.tracks) instance.channels[track.channel] = sampleTrack(track, frame);
      instance.state = frame >= action.time.end_frame ? action.to_state : action.from_state;
    }
  }
  const visible = Object.fromEntries(shot.instances.map((instance) => [instance.instance_id, instances[instance.instance_id]]));
  return {frame, localFrame: frame - shot.time.start_frame, shot, instances: visible};
}

/** Seeded hash noise for authored variation; never use Math.random/Date for state. */
export function seededValue(seed: number, index: number): number {
  let value = (seed ^ Math.imul(index + 1, 0x9e3779b1)) | 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x85ebca6b);
  value ^= value >>> 13;
  value = Math.imul(value, 0xc2b2ae35);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

/** No fallback noun/kind scene: every canonical shot must have an implementation. */
export function executeShot<T>(manifest: Manifest, frame: number, bindings: Record<string, (context: ShotContext) => T>): T | null {
  const context = evaluateFrame(manifest, frame);
  if (!context) return null;
  const execute = bindings[context.shot.shot_id];
  if (!execute) throw new Error(`Unimplemented shot: ${context.shot.shot_id}`);
  return execute(context);
}
