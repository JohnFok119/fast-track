// Reveal on scroll for the homepage. useRevealAll marks every [data-rv] element with .in once it is a quarter on
// screen; useInView runs a callback once for one element (for sections that start an animation when reached).
import { useEffect, type RefObject } from 'react';

const THRESHOLD = 0.25;

export function useRevealAll(): void {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }, { threshold: THRESHOLD });
    document.querySelectorAll('[data-rv]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function useInView(ref: RefObject<Element | null>, onEnter: () => void, threshold = THRESHOLD): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      onEnter();
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, onEnter, threshold]);
}
