/**
 * BlurText - Blur reveal animation for Remotion
 * Adapted from react-bits by @DavidHDev
 * https://github.com/DavidHDev/react-bits
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface BlurTextProps {
  children: string;
  /** Start frame for the animation */
  startFrame?: number;
  /** Animate by words or letters */
  animateBy?: 'words' | 'letters';
  /** Direction of entrance */
  direction?: 'top' | 'bottom' | 'left' | 'right';
  /** Frames between each word/letter */
  staggerDelay?: number;
  /** Maximum blur amount in pixels */
  blurAmount?: number;
  /** Distance to travel during entrance */
  distance?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  style?: React.CSSProperties;
}

export const BlurText: React.FC<BlurTextProps> = ({
  children,
  startFrame = 0,
  animateBy = 'words',
  direction = 'bottom',
  staggerDelay = 4,
  blurAmount = 10,
  distance = 30,
  color = '#ffffff',
  fontSize = 48,
  fontWeight = 600,
  fontFamily = 'Inter, sans-serif',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elements = animateBy === 'words' ? children.split(' ') : children.split('');

  // Calculate direction offset
  const getOffset = (progress: number) => {
    const remaining = interpolate(progress, [0, 1], [distance, 0]);
    switch (direction) {
      case 'top': return { x: 0, y: -remaining };
      case 'bottom': return { x: 0, y: remaining };
      case 'left': return { x: -remaining, y: 0 };
      case 'right': return { x: remaining, y: 0 };
    }
  };

  return (
    <span
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: animateBy === 'words' ? '0.3em' : 0,
        fontSize,
        fontWeight,
        fontFamily,
        color,
        ...style,
      }}
    >
      {elements.map((element, index) => {
        const elementStart = startFrame + index * staggerDelay;
        const progress = spring({
          frame: frame - elementStart,
          fps,
          config: { damping: 25, stiffness: 120, mass: 0.8 },
        });

        const blur = interpolate(progress, [0, 0.5, 1], [blurAmount, blurAmount * 0.3, 0]);
        const opacity = interpolate(progress, [0, 0.3, 1], [0, 0.5, 1]);
        const offset = getOffset(progress);

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              filter: `blur(${blur}px)`,
              opacity,
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              whiteSpace: 'pre',
            }}
          >
            {element === ' ' ? '\u00A0' : element}
          </span>
        );
      })}
    </span>
  );
};

/**
 * FocusBlur - Blur in/out effect to focus attention
 */
interface FocusBlurProps {
  children: React.ReactNode;
  /** Start frame for blur out */
  startFrame?: number;
  /** Frame when element should be sharp/focused */
  focusFrame?: number;
  /** Frame when blur starts again (optional) */
  blurOutFrame?: number;
  /** Maximum blur amount */
  blurAmount?: number;
  style?: React.CSSProperties;
}

export const FocusBlur: React.FC<FocusBlurProps> = ({
  children,
  startFrame = 0,
  focusFrame = 30,
  blurOutFrame,
  blurAmount = 8,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Blur in animation
  const blurInProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 30, stiffness: 100 },
  });

  // Blur out animation (if specified)
  const blurOutProgress = blurOutFrame
    ? spring({
        frame: frame - blurOutFrame,
        fps,
        config: { damping: 30, stiffness: 100 },
      })
    : 0;

  // Calculate blur: start blurred, become sharp, optionally blur out again
  const blurIn = interpolate(blurInProgress, [0, 1], [blurAmount, 0]);
  const blurOut = interpolate(blurOutProgress, [0, 1], [0, blurAmount]);
  const totalBlur = blurIn + blurOut;

  const opacity = interpolate(blurInProgress, [0, 1], [0.3, 1]) - interpolate(blurOutProgress, [0, 1], [0, 0.7]);

  return (
    <div
      style={{
        filter: `blur(${totalBlur}px)`,
        opacity: Math.max(0, opacity),
        transition: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default BlurText;
