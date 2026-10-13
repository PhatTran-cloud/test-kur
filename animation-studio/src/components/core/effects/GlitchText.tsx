/**
 * GlitchText - Frame-based glitch effect for Remotion
 * Adapted from react-bits by @DavidHDev
 * https://github.com/DavidHDev/react-bits
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface GlitchTextProps {
  children: React.ReactNode;
  /** Start frame for the glitch effect */
  startFrame?: number;
  /** Glitch intensity (0-1) */
  intensity?: number;
  /** Speed of glitch animation (lower = faster) */
  speed?: number;
  /** Enable chromatic aberration (red/cyan shadows) */
  enableShadows?: boolean;
  /** Base text color */
  color?: string;
  /** Background color for clip masking */
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  style?: React.CSSProperties;
}

// Glitch clip-path keyframes converted to frame values
const GLITCH_CLIPS = [
  { top: 20, bottom: 50 },
  { top: 10, bottom: 60 },
  { top: 15, bottom: 55 },
  { top: 25, bottom: 35 },
  { top: 30, bottom: 40 },
  { top: 40, bottom: 20 },
  { top: 10, bottom: 60 },
  { top: 15, bottom: 55 },
  { top: 25, bottom: 35 },
  { top: 30, bottom: 40 },
  { top: 20, bottom: 50 },
  { top: 10, bottom: 60 },
  { top: 15, bottom: 55 },
  { top: 25, bottom: 35 },
  { top: 30, bottom: 40 },
  { top: 40, bottom: 20 },
  { top: 20, bottom: 50 },
  { top: 10, bottom: 60 },
  { top: 15, bottom: 55 },
  { top: 25, bottom: 35 },
];

export const GlitchText: React.FC<GlitchTextProps> = ({
  children,
  startFrame = 0,
  intensity = 1,
  speed = 3,
  enableShadows = true,
  color = '#ffffff',
  backgroundColor = '#0a0a0a',
  fontSize = 72,
  fontWeight = 900,
  fontFamily = 'Inter, sans-serif',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = frame - startFrame;
  if (adjustedFrame < 0) {
    return (
      <span
        style={{
          fontSize,
          fontWeight,
          fontFamily,
          color,
          ...style,
        }}
      >
        {children}
      </span>
    );
  }

  // Calculate glitch index based on frame
  const cycleLength = GLITCH_CLIPS.length * speed;
  const glitchIndex = Math.floor((adjustedFrame / speed) % GLITCH_CLIPS.length);
  const glitchClip = GLITCH_CLIPS[glitchIndex];

  // Offset for chromatic layers
  const offset = 10 * intensity;

  // Random jitter for extra glitchiness
  const jitterX = Math.sin(adjustedFrame * 0.5) * 2 * intensity;

  const baseStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
    fontFamily,
    color,
    position: 'relative',
    display: 'inline-block',
    ...style,
  };

  const layerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    color,
    backgroundColor,
    overflow: 'hidden',
  };

  return (
    <span style={baseStyle}>
      {/* Base text */}
      {children}

      {/* Red layer (after pseudo-element) */}
      <span
        style={{
          ...layerStyle,
          left: offset + jitterX,
          textShadow: enableShadows ? `-${offset}px 0 red` : 'none',
          clipPath: `inset(${glitchClip.top}% 0 ${glitchClip.bottom}% 0)`,
        }}
      >
        {children}
      </span>

      {/* Cyan layer (before pseudo-element) */}
      <span
        style={{
          ...layerStyle,
          left: -offset + jitterX,
          textShadow: enableShadows ? `${offset}px 0 cyan` : 'none',
          clipPath: `inset(${100 - glitchClip.bottom}% 0 ${100 - glitchClip.top}% 0)`,
        }}
      >
        {children}
      </span>
    </span>
  );
};

/**
 * Subtle glitch that activates periodically
 */
export const GlitchBurst: React.FC<GlitchTextProps & {
  /** Frames between glitch bursts */
  burstInterval?: number;
  /** Duration of each glitch burst in frames */
  burstDuration?: number;
}> = ({
  children,
  startFrame = 0,
  burstInterval = 90,
  burstDuration = 15,
  ...props
}) => {
  const frame = useCurrentFrame();
  const adjustedFrame = frame - startFrame;

  // Check if we're in a glitch burst
  const cyclePosition = adjustedFrame % burstInterval;
  const isGlitching = cyclePosition < burstDuration && adjustedFrame >= 0;

  if (!isGlitching) {
    return (
      <span
        style={{
          fontSize: props.fontSize ?? 72,
          fontWeight: props.fontWeight ?? 900,
          fontFamily: props.fontFamily ?? 'Inter, sans-serif',
          color: props.color ?? '#ffffff',
          ...props.style,
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <GlitchText
      startFrame={startFrame + (Math.floor(adjustedFrame / burstInterval) * burstInterval)}
      {...props}
    >
      {children}
    </GlitchText>
  );
};

export default GlitchText;
