// Browser side of the explain route. Any failure (no dev server, route off, network error) becomes a fallback.
import type { City } from '../contract/types';
import { EXPLAIN_PATH, type ExplainResponse } from './types';

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
