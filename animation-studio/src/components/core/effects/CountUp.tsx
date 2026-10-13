/**
 * CountUp - Animated number counting for Remotion
 * Adapted from react-bits by @DavidHDev
 * https://github.com/DavidHDev/react-bits
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface CountUpProps {
  /** Target number to count to */
  to: number;
  /** Starting number */
  from?: number;
  /** Start frame for animation */
  startFrame?: number;
  /** Duration in frames */
  duration?: number;
  /** Count direction */
  direction?: 'up' | 'down';
  /** Number of decimal places */
  decimals?: number;
  /** Thousand separator */
  separator?: string;
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Suffix (e.g., "%", "ms") */
  suffix?: string;
  /** Use spring physics or linear */
  useSpring?: boolean;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  style?: React.CSSProperties;
}

export const CountUp: React.FC<CountUpProps> = ({
  to,
  from = 0,
  startFrame = 0,
  duration = 60,
  direction = 'up',
  decimals = 0,
  separator = ',',
  prefix = '',
  suffix = '',
  useSpring: useSpringPhysics = true,
  color = '#ffffff',
  fontSize = 48,
  fontWeight = 700,
  fontFamily = 'JetBrains Mono, monospace',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = frame - startFrame;

  let progress: number;
  if (useSpringPhysics) {
    progress = spring({
      frame: adjustedFrame,
      fps,
      config: { damping: 30, stiffness: 80, mass: 1 },
    });
  } else {
    // Linear easing
    progress = interpolate(
      adjustedFrame,
      [0, duration],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  }

  // Calculate current value
  const startValue = direction === 'up' ? from : to;
  const endValue = direction === 'up' ? to : from;
  const currentValue = interpolate(progress, [0, 1], [startValue, endValue]);

  // Format number
  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    const intPart = parts[0];
    const decPart = parts[1];

    // Add thousand separators
    const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

    return decPart ? `${withSeparators}.${decPart}` : withSeparators;
  };

  return (
    <span
      style={{
        fontSize,
        fontWeight,
        fontFamily,
        color,
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {prefix}{formatNumber(currentValue)}{suffix}
    </span>
  );
};

/**
 * CountUpWithLabel - CountUp with an animated label
 */
interface CountUpWithLabelProps extends CountUpProps {
  label: string;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  labelColor?: string;
  labelFontSize?: number;
}

export const CountUpWithLabel: React.FC<CountUpWithLabelProps> = ({
  label,
  labelPosition = 'bottom',
  labelColor,
  labelFontSize,
  ...countProps
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelProgress = spring({
    frame: frame - (countProps.startFrame ?? 0) - 15,
    fps,
    config: { damping: 25, stiffness: 150 },
  });

  const labelOpacity = interpolate(labelProgress, [0, 1], [0, 1]);
  const labelY = interpolate(labelProgress, [0, 1], [10, 0]);

  const isVertical = labelPosition === 'top' || labelPosition === 'bottom';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isVertical
          ? (labelPosition === 'top' ? 'column-reverse' : 'column')
          : (labelPosition === 'left' ? 'row-reverse' : 'row'),
        alignItems: 'center',
        gap: isVertical ? 8 : 16,
      }}
    >
      <CountUp {...countProps} />
      <span
        style={{
          opacity: labelOpacity,
          transform: `translateY(${labelY}px)`,
          fontSize: labelFontSize ?? (countProps.fontSize ?? 48) * 0.4,
          fontFamily: 'Inter, sans-serif',
          color: labelColor ?? countProps.color ?? '#888888',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </span>
    </div>
  );
};

/**
 * StatGrid - Multiple CountUp stats in a grid
 */
interface Stat {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

interface StatGridProps {
  stats: Stat[];
  startFrame?: number;
  staggerDelay?: number;
  columns?: number;
  color?: string;
  accentColor?: string;
  fontSize?: number;
}

export const StatGrid: React.FC<StatGridProps> = ({
  stats,
  startFrame = 0,
  staggerDelay = 15,
  columns = 3,
  color = '#ffffff',
  accentColor = '#3b82f6',
  fontSize = 56,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 40,
      }}
    >
      {stats.map((stat, index) => (
        <CountUpWithLabel
          key={index}
          to={stat.value}
          label={stat.label}
          prefix={stat.prefix}
          suffix={stat.suffix}
          decimals={stat.decimals}
          startFrame={startFrame + index * staggerDelay}
          color={accentColor}
          labelColor={color}
          fontSize={fontSize}
        />
      ))}
    </div>
  );
};

export default CountUp;
