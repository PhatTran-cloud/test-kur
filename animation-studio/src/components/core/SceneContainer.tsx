import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

/**
 * SceneContainer - Base container with safe margins and background
 *
 * Style guide requirements:
 * - 5% minimum safe margin (96px at 1920 width)
 * - 8% recommended margin (154px at 1920 width)
 * - Consistent background colors
 */

// Base colors
const BACKGROUNDS = {
  dark: '#0A0A0F',         // Standard dark
  surface: '#12121A',       // Slightly lighter
  warm: '#1A1814',          // Sepia-tinted (historical)
  cosmic: '#0F0A1A',        // Purple-tinted (quantum)
  light: '#F9FAFB',         // Light mode
};

type BackgroundType = keyof typeof BACKGROUNDS | string;

type SceneContainerProps = {
  children: React.ReactNode;
  background?: BackgroundType;
  safeMargin?: 'minimum' | 'recommended' | 'none' | number;
  fadeIn?: boolean;
  fadeInDuration?: number;
  fadeOut?: boolean;
  fadeOutStart?: number;
  fadeOutDuration?: number;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
};

export const SceneContainer: React.FC<SceneContainerProps> = ({
  children,
  background = 'dark',
  safeMargin = 'recommended',
  fadeIn = false,
  fadeInDuration = 30,
  fadeOut = false,
  fadeOutStart = 0,
  fadeOutDuration = 30,
  style,
  contentStyle,
}) => {
  const frame = useCurrentFrame();

  // Resolve background color
  const bgColor = background in BACKGROUNDS
    ? BACKGROUNDS[background as keyof typeof BACKGROUNDS]
    : background;

  // Calculate margin based on type
  let marginPercent: number;
  switch (safeMargin) {
    case 'minimum':
      marginPercent = 5;
      break;
    case 'recommended':
      marginPercent = 8;
      break;
    case 'none':
      marginPercent = 0;
      break;
    default:
      marginPercent = safeMargin;
  }

  // Fade animations
  let opacity = 1;

  if (fadeIn) {
    const fadeInOpacity = interpolate(
      frame,
      [0, fadeInDuration],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    opacity *= fadeInOpacity;
  }

  if (fadeOut && fadeOutStart > 0) {
    const fadeOutOpacity = interpolate(
      frame,
      [fadeOutStart, fadeOutStart + fadeOutDuration],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    opacity *= fadeOutOpacity;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: `${marginPercent}%`,
          left: `${marginPercent}%`,
          right: `${marginPercent}%`,
          bottom: `${marginPercent}%`,
          display: 'flex',
          flexDirection: 'column',
          opacity,
          ...contentStyle,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/**
 * SafeArea - Visual guide for safe margins (development only)
 * Shows the safe area boundaries
 */
export const SafeAreaGuide: React.FC<{ margin?: number }> = ({ margin = 8 }) => {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${margin}%`,
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          borderBottom: '1px dashed rgba(255, 0, 0, 0.3)',
        }}
      />
      {/* Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${margin}%`,
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          borderTop: '1px dashed rgba(255, 0, 0, 0.3)',
        }}
      />
      {/* Left */}
      <div
        style={{
          position: 'absolute',
          top: `${margin}%`,
          left: 0,
          bottom: `${margin}%`,
          width: `${margin}%`,
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          borderRight: '1px dashed rgba(255, 0, 0, 0.3)',
        }}
      />
      {/* Right */}
      <div
        style={{
          position: 'absolute',
          top: `${margin}%`,
          right: 0,
          bottom: `${margin}%`,
          width: `${margin}%`,
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          borderLeft: '1px dashed rgba(255, 0, 0, 0.3)',
        }}
      />
    </AbsoluteFill>
  );
};

export default SceneContainer;
