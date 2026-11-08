// Where the camera sits so the whole diorama fits the canvas at any shape, with a slow sway around it.

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export class CameraFit {
  /** Vertical field of view, in degrees. A long lens keeps the model from looking distorted. */
  readonly fov = 24;
  /** How far the view must reach from its centre: about 12 units across and 8.4 up, the soil block with room. */
  readonly halfWidth = 12;
  readonly halfHeight = 8.4;
  /** Camera height above the model, as an angle in radians. */
  readonly elevation = 0.43;
  /** Resting angle around the model, in radians, and how far it sways either side. */
  readonly rest = -0.62;
  readonly sway = 0.13;
  readonly look: Vec3 = { x: 0, y: 0.9, z: 0 };

  /** Distance from the look point: far enough for both the height and, on narrow canvases, the width. */
  distance(aspect: number): number {
    const t = Math.tan((this.fov * Math.PI) / 360);
    return Math.max(this.halfHeight / t, this.halfWidth / (t * aspect));
  }

  /** The angle around the model at a time in seconds. Still when motion is reduced. */
  azimuth(seconds: number, reduceMotion: boolean): number {
    return reduceMotion ? this.rest : this.rest + Math.sin(seconds * 0.22) * this.sway;
  }

  position(aspect: number, azimuth: number): Vec3 {
    const r = this.distance(aspect);
    const flat = Math.cos(this.elevation) * r;
    return {
      x: Math.sin(azimuth) * flat,
      y: Math.sin(this.elevation) * r + this.look.y,
      z: Math.cos(azimuth) * flat,
    };
  }
}
