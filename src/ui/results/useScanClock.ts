// Milliseconds since the reading started, ticking about ten times a second until `total`. Stops when not running.
import { useEffect, useState } from 'react';

const TICK_MS = 100;

export function useScanClock(total: number, running: boolean): number {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (!running) return undefined;
    const start = Date.now();
    const id = window.setInterval(() => {
      const t = Date.now() - start;
      setMs(t);
      if (t >= total) window.clearInterval(id);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [total, running]);
  return ms;
}
