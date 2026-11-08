// The camera must show the whole diorama, and its soft shadow, at any canvas shape and at both ends of its sway.
import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { CameraFit } from '../../../src/home/story/cameraFit';
import { SHADOW, sceneCorners } from '../../../src/home/story/house/geometry';

const fit = new CameraFit();
const ASPECTS = { wide: 2.4, desktop: 560 / 440, square: 1, phone: 350 / 190, tall: 0.6 };
const SWAY = [fit.azimuth(0, true) - fit.sway, fit.azimuth(0, true), fit.azimuth(0, true) + fit.sway];

function cameraAt(aspect: number, azimuth: number): PerspectiveCamera {
  const camera = new PerspectiveCamera(fit.fov, aspect, 0.1, 300);
  const p = fit.position(aspect, azimuth);
  camera.position.set(p.x, p.y, p.z);
  camera.lookAt(fit.look.x, fit.look.y, fit.look.z);
  camera.updateMatrixWorld();
  return camera;
}

/** The furthest any point lands from the centre of the canvas, in screen units where the edge is 1. */
function worstEdge(points: Vector3[], camera: PerspectiveCamera): number {
  return Math.max(...points.map((p) => {
    const ndc = p.clone().project(camera);
    return Math.max(Math.abs(ndc.x), Math.abs(ndc.y));
  }));
}

const shadowRim = Array.from({ length: 72 }, (_, i) => {
  const a = (i / 72) * Math.PI * 2;
  return new Vector3((Math.cos(a) * SHADOW.width) / 2, SHADOW.y, (Math.sin(a) * SHADOW.depth) / 2);
});
const corners = sceneCorners().map((c) => new Vector3(c.x, c.y, c.z));

describe('CameraFit', () => {
  it('backs off further on narrow canvases and never closer than the height needs', () => {
    expect(fit.distance(0.6)).toBeGreaterThan(fit.distance(1));
    expect(fit.distance(2.4)).toBe(fit.distance(3));
    expect(fit.distance(1)).toBeGreaterThan(0);
  });

  it('sways gently around its resting angle, and holds still when motion is reduced', () => {
    expect(fit.azimuth(123, true)).toBe(fit.azimuth(0, true));
    expect(Math.abs(fit.azimuth(7, false) - fit.azimuth(0, true))).toBeLessThanOrEqual(fit.sway);
  });

  for (const [name, aspect] of Object.entries(ASPECTS)) {
    it(`keeps the whole house and soil block on screen at a ${name} aspect (${aspect.toFixed(2)})`, () => {
      for (const az of SWAY) expect(worstEdge(corners, cameraAt(aspect, az))).toBeLessThan(0.98);
    });

    it(`keeps the soft shadow inside the canvas at a ${name} aspect`, () => {
      for (const az of SWAY) expect(worstEdge(shadowRim, cameraAt(aspect, az))).toBeLessThan(1);
    });
  }
});
