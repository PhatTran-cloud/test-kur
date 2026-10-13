export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Convert seconds to frames
export const seconds = (s: number) => Math.round(s * FPS);

// Standard animation durations
export const ANIMATIONS = {
  fadeIn: seconds(0.5),
  fadeOut: seconds(0.5),
  quickFade: seconds(0.33),
  normalFade: seconds(0.67),
  slowFade: seconds(1.5),
  typewriterCharDelay: 2,
  staggerDelay: 3,
  hookDuration: seconds(3),
  closingDuration: seconds(4),
};

// Spring configurations
export const SPRING_CONFIGS = {
  gentle: { damping: 200, mass: 1, stiffness: 100 },
  bouncy: { damping: 12, mass: 0.5, stiffness: 200 },
  snappy: { damping: 20, mass: 0.8, stiffness: 200 },
  slow: { damping: 30, mass: 2, stiffness: 80 },
};

// Layout constants for 16:9 landscape
export const LAYOUT = {
  width: WIDTH,
  height: HEIGHT,
  safeMarginX: 96,
  safeMarginY: 54,
  contentZoneTop: 80,
  contentZoneBottom: 1000,
  contentZoneHeight: 920,
  safePadding: '54px 96px',
};
