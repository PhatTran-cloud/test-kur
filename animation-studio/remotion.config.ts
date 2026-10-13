import path from 'path';
import {Config} from '@remotion/cli/config';

// ── GPU-Accelerated Rendering ─────────────────────────────────
// Windows: 'angle' (DirectX), Linux: 'egl' (OpenGL)
// Accelerates WebGL, CSS shadows, blur, gradients, Canvas 2D
Config.setChromiumOpenGlRenderer('angle');

// ── Quality Settings ──────────────────────────────────────────
Config.setCrf(18);  // Good quality balance (lower = bigger file, 1=lossless, 18=visually lossless)
Config.setVideoImageFormat('jpeg');  // JPEG for faster frame capture (PNG is lossless but slower)
Config.setJpegQuality(95);  // 95% JPEG quality — nearly lossless
Config.setStillImageFormat('png');
Config.setX264Preset('medium');  // medium = good speed/quality balance (veryslow = best quality, slowest)
Config.setColorSpace('bt709');
Config.setConcurrency(8);  // Use more CPU cores for parallel rendering

// ── Webpack ──────────────────────────────────────────────────
Config.overrideWebpackConfig((config) => {
  const studioRoot = process.cwd();
  const nodeModulesDir = path.resolve(studioRoot, 'node_modules');
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias ?? {}),
        '@': path.resolve(studioRoot, 'src'),
        '@remotion/three': path.resolve(process.cwd(), 'node_modules/@remotion/three/dist/esm/index.mjs'),
        '@react-three/fiber': path.resolve(process.cwd(), 'node_modules/@react-three/fiber'),
        'three': path.resolve(process.cwd(), 'node_modules/three'),
      },
      modules: [
        nodeModulesDir,
        ...(config.resolve?.modules ?? ['node_modules']),
      ],
      fallback: {
        ...(config.resolve?.fallback ?? {}),
      },
      symlinks: true,
    },
  };
});
