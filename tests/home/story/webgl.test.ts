import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebGLCheck, type CanvasLike } from '../../../src/home/story/webgl';

const canvasWith = (getContext: (kind: string) => unknown): (() => CanvasLike) => () => ({ getContext }) as unknown as CanvasLike;

afterEach(() => vi.restoreAllMocks());

describe('WebGLCheck', () => {
  it('says yes when the browser gives a WebGL2 context, and frees the probe context', () => {
    const loseContext = vi.fn();
    const gl = { getExtension: (name: string) => (name === 'WEBGL_lose_context' ? { loseContext } : null) };
    const check = new WebGLCheck(canvasWith((kind) => (kind === 'webgl2' ? gl : null)));
    expect(check.available()).toBe(true);
    expect(loseContext).toHaveBeenCalledOnce();
  });

  it('falls back to WebGL1 when WebGL2 is missing', () => {
    const check = new WebGLCheck(canvasWith((kind) => (kind === 'webgl' ? { getExtension: () => null } : null)));
    expect(check.available()).toBe(true);
  });

  it('says no when the browser gives no WebGL context', () => {
    expect(new WebGLCheck(canvasWith(() => null)).available()).toBe(false);
  });

  it('says no and logs the error when asking for a context throws', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const check = new WebGLCheck(canvasWith(() => {
      throw new Error('blocked');
    }));
    expect(check.available()).toBe(false);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('[story]'), expect.any(Error));
  });
});
