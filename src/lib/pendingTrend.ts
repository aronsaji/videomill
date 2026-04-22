/**
 * pendingTrend — lightweight module-level state for passing a selected Trend
 * from the Trends page to the Bestilling page without React Router or Context.
 *
 * Usage:
 *   Trends page:    setPendingTrend(trend); navigate('bestilling');
 *   Bestilling page: const trend = consumePendingTrend(); // returns null if nothing pending
 */
import type { Trend } from './types';

let _pending: Trend | null = null;

export function setPendingTrend(trend: Trend): void {
  _pending = trend;
}

/** Returns the pending trend and clears it (consume once). */
export function consumePendingTrend(): Trend | null {
  const t = _pending;
  _pending = null;
  return t;
}
