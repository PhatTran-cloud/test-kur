/**
 * Re-export @remotion/transitions for use by build files in output/.
 * Build files can't directly import @remotion/transitions due to
 * the Remotion CLI's internal webpack alias chain.
 *
 * Import from this file instead:
 * import { TransitionSeries, linearTiming, fade } from '../../../../animation-studio/src/lib/transitions';
 */
export { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
export { fade } from '@remotion/transitions/fade';
export { slide } from '@remotion/transitions/slide';
export { wipe } from '@remotion/transitions/wipe';
export { flip } from '@remotion/transitions/flip';
export { clockWipe } from '@remotion/transitions/clock-wipe';
