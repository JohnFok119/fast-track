// Loads the street scene (with three.js, in its own chunk) when the closing section nears the screen, builds the street, and pops it up when
// it is mostly in view. Without WebGL it logs the failure and leaves the space empty: the street is decoration.
import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion } from '../../theme';
import type { StreetScene } from './StreetScene';

export function useStreet(host: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let scene: StreetScene | null = null;
    let cancelled = false;
    let reached = false;
    let loading = false;

    const play = () => {
      if (reached && scene) scene.play();
    };
    const load = async () => {
      if (loading) return;
      loading = true;
      try {
        const { StreetScene: Scene } = await import('./StreetScene');
        if (cancelled) return;
        scene = new Scene(el, prefersReducedMotion());
        play();
      } catch (error) {
        console.error('[street] could not build the houses for the closing section', error);
      }
    };

    const near = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) {
        near.disconnect();
        void load();
      }
    }, { rootMargin: '800px 0px' });
    const inView = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      inView.disconnect();
      reached = true;
      play();
    }, { threshold: 0.35 });
    const resize = new ResizeObserver(() => scene?.resize());
    near.observe(el);
    inView.observe(el);
    resize.observe(el);

    return () => {
      cancelled = true;
      near.disconnect();
      inView.disconnect();
      resize.disconnect();
      scene?.dispose();
    };
  }, [host]);
}
