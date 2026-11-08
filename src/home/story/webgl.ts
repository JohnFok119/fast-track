// Can this browser draw the 3D house? Asks a throwaway canvas for a WebGL context, then frees it.

export type CanvasLike = Pick<HTMLCanvasElement, 'getContext'>;

interface ProbeContext {
  getExtension(name: string): { loseContext(): void } | null;
}

export class WebGLCheck {
  constructor(private readonly makeCanvas: () => CanvasLike = () => document.createElement('canvas')) {}

  available(): boolean {
    try {
      const canvas = this.makeCanvas();
      const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as ProbeContext | null;
      if (!gl) return false;
      // Browsers allow only a few live WebGL contexts: give the probe's back before the real one is made.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return true;
    } catch (error) {
      console.error('[story] the WebGL check failed', error);
      return false;
    }
  }
}
