// Browser side of the explain route. Any failure (no dev server, route off, network error) becomes a fallback.
import type { City } from '../contract/types';
import { EXPLAIN_PATH, PLAN_PATH, type ExplainResponse, type PlanResponse } from './types';

export async function explain(city: City, itemId: string, signal?: AbortSignal): Promise<ExplainResponse> {
  try {
    const res = await fetch(EXPLAIN_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, itemId }),
      signal,
    });
    if (!res.ok) return { fallback: true };
    const body = (await res.json()) as ExplainResponse;
    if (body.fallback === false && Array.isArray(body.points)) return body;
    return { fallback: true };
  } catch (err) {
    console.warn(`[explain] ${city}:${itemId} request failed, showing the engine's text`, err);
    return { fallback: true };
  }
}

/** The whole-city plan. Fallback means: show the plain dashboard data. The first call after the server starts may
 * wait for the warm-up; later calls return at once. */
export async function getPlan(city: City, signal?: AbortSignal): Promise<PlanResponse> {
  try {
    const res = await fetch(PLAN_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city }),
      signal,
    });
    if (!res.ok) return { fallback: true };
    const body = (await res.json()) as PlanResponse;
    if (body.fallback === false && Array.isArray(body.actions)) return body;
    return { fallback: true };
  } catch (err) {
    console.warn(`[plan] ${city} request failed, showing the plain data`, err);
    return { fallback: true };
  }
}
