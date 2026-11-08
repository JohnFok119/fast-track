// Wiring for the story: which step is current as the reader scrolls, and the 3D house with its flat fallback.
import { useEffect, useRef, useState, type RefObject } from 'react';
import { prefersReducedMotion } from '../../theme';
import { StagePicker } from './stagePicker';
import { WebGLCheck } from './webgl';

export interface StoryPosition {
  current: number;
  reached: number;
}

/** Watches the .st-step elements inside root and reports the current and furthest reached step. */
export function useStagePicker(root: RefObject<HTMLElement | null>, count: number): StoryPosition {
  const [position, setPosition] = useState<StoryPosition>({ current: 0, reached: 0 });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const steps = [...el.querySelectorAll('.st-step')];
    const picker = new StagePicker(count);
    const phone = window.matchMedia('(max-width: 960px)').matches;
    const io = new IntersectionObserver((entries) => {
      const changed = picker.see(entries.map((e) => ({ index: steps.indexOf(e.target), visible: e.isIntersecting })));
      if (changed) setPosition({ current: picker.current, reached: picker.reached });
    }, { rootMargin: StagePicker.rootMargin(phone) });
    steps.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [root, count]);
  return position;
}

export type HouseMode = 'real' | 'flat';

interface SceneHandle {
  setStage(stage: number): void;
  dispose(): void;
}

/** Starts the 3D house when the section is about a screen away, loading three.js only then. Falls back to the flat
 *  drawing, with the reason in the console, when WebGL is missing or the scene fails to build. */
export function useHouse3d(section: RefObject<Element | null>, host: RefObject<HTMLElement | null>, stage: number): HouseMode {
  const [mode, setMode] = useState<HouseMode>('real');
  const scene = useRef<SceneHandle | null>(null);
  const stageNow = useRef(stage);

  useEffect(() => {
    stageNow.current = stage;
    scene.current?.setStage(stage);
  }, [stage]);

  useEffect(() => {
    const el = section.current;
    const box = host.current;
    if (!el || !box) return;
    let cancelled = false;
    const toFlat = () => {
      if (!cancelled) setMode('flat');
    };
    const begin = () => {
      if (!new WebGLCheck().available()) {
        console.error('[story] WebGL is not available; showing the flat drawing');
        toFlat();
        return;
      }
      import('./house/HouseScene')
        .then(({ HouseScene }) => {
          if (cancelled) return;
          scene.current = new HouseScene(box, prefersReducedMotion());
          scene.current.setStage(stageNow.current);
        })
        .catch((error: unknown) => {
          console.error('[story] could not build the 3D house; showing the flat drawing', error);
          toFlat();
        });
    };
    const near = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      near.disconnect();
      begin();
    }, { rootMargin: '100% 0px' });
    near.observe(el);
    return () => {
      cancelled = true;
      near.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
  }, [section, host]);

  return mode;
}
