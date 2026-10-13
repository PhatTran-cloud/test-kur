/**
 * Re-export getAudioDurationInSeconds from @remotion/media-utils
 *
 * Remotion's CLI bundler aliases @remotion/media-utils to a non-existent
 * internal path (cli/dist/node_modules/…).  We bypass that alias by importing
 * directly from the real package entry point via a relative path.
 */
export { getAudioDurationInSeconds } from '../../node_modules/@remotion/media-utils/dist/index';
