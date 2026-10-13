import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

/**
 * AnimatedText - Core text component with spring entrance and style guide defaults
 *
 * Enforces minimum sizes from style guide:
 * - hero: 64px min (72px default)
 * - title: 48px min (56px default)
 * - body: 40px min (48px default)
 * - code: 28px min (32px default)
 * - label: 24px min (28px default)
 */

type TextVariant = 'hero' | 'title' | 'body' | 'code' | 'label';

// Style guide minimums and defaults
const TEXT_STYLES: Record<TextVariant, {
  minSize: number;
  defaultSize: number;
  fontFamily: string;
  fontWeight: number;
  lineHeight: number;
}> = {
  hero: {
    minSize: 64,
    defaultSize: 72,
    fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
    fontWeight: 700,
    lineHeight: 1.1,
  },
  title: {
    minSize: 48,
    defaultSize: 56,
    fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  body: {
    minSize: 40,
    defaultSize: 48,
    fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  code: {
    minSize: 28,
    defaultSize: 32,
    fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  label: {
    minSize: 24,
    defaultSize: 28,
    fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
    fontWeight: 500,
    lineHeight: 1.3,
  },
};

// High contrast colors (style guide requirement)
const COLORS = {
  light: '#E5E7EB',      // Primary text on dark
  bright: '#FFFFFF',     // Maximum contrast
  muted: '#9CA3AF',      // Secondary only
  dark: '#1F2937',       // Text on light backgrounds
};

type SpringConfig = {
  damping: number;
  mass: number;
  stiffness: number;
};

const SPRING_PRESETS: Record<string, SpringConfig> = {
  gentle: { damping: 200, mass: 1, stiffness: 100 },
  bouncy: { damping: 12, mass: 0.5, stiffness: 200 },
  snappy: { damping: 20, mass: 0.8, stiffness: 200 },
  slow: { damping: 30, mass: 2, stiffness: 80 },
};

type AnimatedTextProps = {
  children: React.ReactNode;
  variant?: TextVariant;
  size?: number; // Will be clamped to minimum
  color?: 'light' | 'bright' | 'muted' | 'dark' | string;
  align?: 'left' | 'center' | 'right';
  startFrame?: number;
  springPreset?: keyof typeof SPRING_PRESETS;
  springConfig?: SpringConfig;
  entrance?: 'fade' | 'slideUp' | 'slideDown' | 'scale' | 'none';
  style?: React.CSSProperties;
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  variant = 'body',
  size,
  color = 'light',
  align = 'left',
  startFrame = 0,
  springPreset = 'gentle',
  springConfig,
  entrance = 'slideUp',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textStyle = TEXT_STYLES[variant];

  // Enforce minimum sizes from style guide
  const requestedSize = size || textStyle.defaultSize;
  const finalSize = Math.max(requestedSize, textStyle.minSize);

  // Warn in console if size was clamped (helpful for development)
  if (size && size < textStyle.minSize) {
    console.warn(
      `AnimatedText: Size ${size}px is below minimum ${textStyle.minSize}px for variant "${variant}". Using ${textStyle.minSize}px.`
    );
  }

  // Resolve color
  const resolvedColor = color in COLORS ? COLORS[color as keyof typeof COLORS] : color;

  // Spring animation
  const config = springConfig || SPRING_PRESETS[springPreset];
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config,
  });

  // Entrance animation values
  let opacity = 1;
  let transform = 'none';

  if (entrance !== 'none') {
    opacity = interpolate(progress, [0, 1], [0, 1]);

    switch (entrance) {
      case 'slideUp':
        transform = `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`;
        break;
      case 'slideDown':
        transform = `translateY(${interpolate(progress, [0, 1], [-20, 0])}px)`;
        break;
      case 'scale':
        transform = `scale(${interpolate(progress, [0, 1], [0.9, 1])})`;
        break;
      case 'fade':
      default:
        transform = 'none';
    }
  }

  return (
    <div
      style={{
        fontFamily: textStyle.fontFamily,
        fontSize: finalSize,
        fontWeight: textStyle.fontWeight,
        lineHeight: textStyle.lineHeight,
        color: resolvedColor,
        textAlign: align,
        opacity,
        transform,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedText;
