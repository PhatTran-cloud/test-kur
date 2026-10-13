/**
 * ShinyText - Animated shine sweep effect for Remotion
 * Adapted from react-bits by @DavidHDev
 * https://github.com/DavidHDev/react-bits
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface ShinyTextProps {
  children: string;
  /** Start frame for the shine animation */
  startFrame?: number;
  /** Base text color */
  color?: string;
  /** Shine highlight color */
  shineColor?: string;
  /** Duration of one shine sweep in frames */
  duration?: number;
  /** Pause between shines in frames */
  pauseDuration?: number;
  /** Direction of shine sweep */
  direction?: 'left' | 'right';
  /** Angle of the gradient (degrees) */
  angle?: number;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  style?: React.CSSProperties;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  children,
  startFrame = 0,
  color = '#888888',
  shineColor = '#ffffff',
  duration = 60,
  pauseDuration = 30,
  direction = 'left',
  angle = 120,
  fontSize = 48,
  fontWeight = 600,
  fontFamily = 'Inter, sans-serif',
  style,
}) => {
  const frame = useCurrentFrame();

  const adjustedFrame = frame - startFrame;
  const cycleDuration = duration + pauseDuration;
  const cyclePosition = adjustedFrame % cycleDuration;

  // Calculate shine position (0 to 100)
  let shinePosition: number;
  if (cyclePosition < duration) {
    // During animation
    const progress = cyclePosition / duration;
    shinePosition = direction === 'left'
      ? progress * 200 - 50  // -50 to 150
      : 150 - progress * 200; // 150 to -50
  } else {
    // During pause - keep shine off-screen
    shinePosition = direction === 'left' ? 150 : -50;
  }

  const backgroundImage = `linear-gradient(
    ${angle}deg,
    ${color} 0%,
    ${color} 35%,
    ${shineColor} 50%,
    ${color} 65%,
    ${color} 100%
  )`;

  return (
    <span
      style={{
        fontSize,
        fontWeight,
        fontFamily,
        backgroundImage,
        backgroundSize: '200% auto',
        backgroundPosition: `${shinePosition}% center`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/**
 * GradientText - Animated gradient color shift
 */
interface GradientTextProps {
  children: React.ReactNode;
  /** Start frame for animation */
  startFrame?: number;
  /** Gradient colors */
  colors?: string[];
  /** Duration of one full color cycle in frames */
  duration?: number;
  /** Gradient direction */
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  /** Animate back and forth (yoyo) or continuous */
  yoyo?: boolean;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  style?: React.CSSProperties;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  startFrame = 0,
  colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
  duration = 120,
  direction = 'horizontal',
  yoyo = true,
  fontSize = 48,
  fontWeight = 600,
  fontFamily = 'Inter, sans-serif',
  style,
}) => {
  const frame = useCurrentFrame();

  const adjustedFrame = frame - startFrame;

  let progress: number;
  if (yoyo) {
    // Yoyo: 0 -> 100 -> 0
    const fullCycle = duration * 2;
    const cyclePosition = adjustedFrame % fullCycle;
    if (cyclePosition < duration) {
      progress = (cyclePosition / duration) * 100;
    } else {
      progress = 100 - ((cyclePosition - duration) / duration) * 100;
    }
  } else {
    // Continuous: 0 -> 100 -> 0 -> 100...
    progress = (adjustedFrame / duration) * 100;
  }

  const gradientAngle = direction === 'horizontal'
    ? 'to right'
    : direction === 'vertical'
      ? 'to bottom'
      : 'to bottom right';

  // Duplicate first color for seamless looping
  const gradientColors = [...colors, colors[0]].join(', ');

  const backgroundSize = direction === 'horizontal'
    ? '300% 100%'
    : direction === 'vertical'
      ? '100% 300%'
      : '300% 300%';

  const backgroundPosition = direction === 'horizontal'
    ? `${progress}% 50%`
    : direction === 'vertical'
      ? `50% ${progress}%`
      : `${progress}% 50%`;

  return (
    <span
      style={{
        fontSize,
        fontWeight,
        fontFamily,
        backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
        backgroundSize,
        backgroundPosition,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default ShinyText;
