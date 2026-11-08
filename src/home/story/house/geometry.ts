// Sizes and placements of the 3D house, as plain numbers (world units, y up), so they can be checked without WebGL.
// Rafters and joists are cut short enough to stay hidden under the roof; the soft shadow is sized to stay on canvas.

export interface Point2 {
  x: number;
  y: number;
}

export interface Point3 extends Point2 {
  z: number;
}

/** A box seen in the house's cross-section (x across, y up), turned about its centre by rot radians. */
export interface Box2 {
  cx: number;
  cy: number;
  w: number;
  h: number;
  rot: number;
}

export const HOUSE = { width: 8, depth: 6, height: 2.8, rise: 1.8, slab: 0.3, wall: 0.2 } as const;
export const SOIL = { width: 16, depth: 12, topsoil: 0.55, subsoil: 1.1 } as const;
/** The soft contact shadow under the soil block: its gradient fades out at the plane's edge. */
export const SHADOW = { width: 22, depth: 17, y: -1.7 } as const;
export const LOT = { halfX: 6.5, halfZ: 5 } as const;
/** The roof panels sit `lift` above the slope line, measured square to the slope. */
export const ROOF = { thickness: 0.14, lift: 0.11, overhang: 0.45, depth: HOUSE.depth + 0.8 } as const;
export const CHIMNEY = { x: 2, z: -1.6, size: 0.6, height: 1.5 } as const;
/** Door and window openings along each wall, where no stud goes. */
export const OPENINGS = {
  front: [[-0.5, 0.5], [-3.0, -1.8], [1.8, 3.0]],
  back: [[-2.6, -1.4], [1.4, 2.6]],
  side: [[-0.6, 0.6]],
} as const;
export const TREES = [
  { x: -6, z: 2.6, s: 1 },
  { x: 5.9, z: -2.2, s: 1.15 },
  { x: -5.4, z: -3.8, s: 0.8 },
] as const;
/** Each tree's crown: three leaf balls as [dx, dy, dz, radius], scaled by the tree's size. */
export const CROWN = [[0, 1.9, 0, 1], [0.35, 2.5, 0.1, 0.75], [-0.3, 2.35, -0.2, 0.7]] as const;

const PITCH = Math.atan2(HOUSE.rise, HOUSE.width / 2);
const WALL_TOP = HOUSE.slab + HOUSE.height;
const RIDGE = WALL_TOP + HOUSE.rise;
const RAFTER_RUN = HOUSE.width / 2 + 0.12;

export const pitch = (): number => PITCH;
export const ridgeY = (): number => RIDGE;

export function boxCorners(b: Box2): Point2[] {
  const c = Math.cos(b.rot);
  const s = Math.sin(b.rot);
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u = 0, v = 0]) => {
    const lx = (u * b.w) / 2;
    const ly = (v * b.h) / 2;
    return { x: b.cx + lx * c - ly * s, y: b.cy + lx * s + ly * c };
  });
}

/** Left then right roof panel, each running from the ridge past the wall by the overhang. */
export function roofPanels(): Box2[] {
  const len = Math.hypot(HOUSE.width / 2, HOUSE.rise) + ROOF.overhang;
  const half = len / 2;
  return [-1, 1].map((sgn) => ({
    cx: sgn * (Math.cos(PITCH) * half + Math.sin(PITCH) * ROOF.lift),
    cy: RIDGE - Math.sin(PITCH) * half + Math.cos(PITCH) * ROOF.lift,
    w: len,
    h: ROOF.thickness,
    rot: -sgn * PITCH,
  }));
}

/** Rafters run from the ridge to just past the wall, top face on the slope line, so the roof hides their ends. */
export function rafterBoxes(): Box2[] {
  const len = RAFTER_RUN / Math.cos(PITCH);
  return [-1, 1].map((sgn) => ({
    cx: (sgn * RAFTER_RUN) / 2,
    cy: RIDGE - (Math.tan(PITCH) * RAFTER_RUN) / 2 - 0.08 / Math.cos(PITCH),
    w: len,
    h: 0.16,
    rot: -sgn * PITCH,
  }));
}

/** The ceiling joist, stopped short of the walls' outer faces. */
export function joistBox(): Box2 {
  return { cx: 0, cy: WALL_TOP + 0.1, w: HOUSE.width - 0.2, h: 0.1, rot: 0 };
}

/** Top plates in cross-section: the front and back plates span the width; the side plates sit just inside. */
export function plateBoxes(): Box2[] {
  const y = WALL_TOP + 0.05;
  const side = HOUSE.width / 2 - 0.1;
  return [
    { cx: 0, cy: y, w: HOUSE.width, h: 0.1, rot: 0 },
    { cx: -side, cy: y, w: 0.14, h: 0.1, rot: 0 },
    { cx: side, cy: y, w: 0.14, h: 0.1, rot: 0 },
  ];
}

/** Where each truss (two rafters and a joist) stands along the house's depth. */
export function trussZs(): number[] {
  const first = -HOUSE.depth / 2 + 0.1;
  const step = (HOUSE.depth - 0.2) / 8;
  return Array.from({ length: 9 }, (_, j) => first + j * step);
}

const round = (v: number) => Math.round(v * 100) / 100;
const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.floor((to - from) / step + 1e-6) + 1 }, (_, k) => round(from + k * step));
const clear = (list: readonly (readonly [number, number])[]) => (v: number) => !list.some(([a, b]) => v > a + 0.05 && v < b - 0.05);

/** Stud positions every 0.6 units: x along the front and back walls, z along each side wall. */
export function studLayout(): { front: number[]; back: number[]; side: number[] } {
  const across = range(-3.8, 3.8, 0.6);
  return {
    front: across.filter(clear(OPENINGS.front)),
    back: across.filter(clear(OPENINGS.back)),
    side: range(-2.4, 2.4, 0.6).filter(clear(OPENINGS.side)),
  };
}

/** Points that bound everything drawn: the soil block, the chimney, the roof's eaves and the tree crowns. */
export function sceneCorners(): Point3[] {
  const points: Point3[] = [];
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) points.push({ x, y, z });
  };
  box(-SOIL.width / 2, SOIL.width / 2, -(SOIL.topsoil + SOIL.subsoil), 0, -SOIL.depth / 2, SOIL.depth / 2);
  const ch = CHIMNEY.size / 2;
  box(CHIMNEY.x - ch, CHIMNEY.x + ch, RIDGE, RIDGE - 0.2 + CHIMNEY.height / 2, CHIMNEY.z - ch, CHIMNEY.z + ch);
  const eave = Math.max(...roofPanels().flatMap((p) => boxCorners(p).map((c) => Math.abs(c.x))));
  box(-eave, eave, WALL_TOP, RIDGE + 0.25, -ROOF.depth / 2, ROOF.depth / 2);
  for (const t of TREES) box(t.x - 1.0 * t.s, t.x + 1.1 * t.s, 0, 3.25 * t.s, t.z - 0.9 * t.s, t.z + 0.85 * t.s);
  return points;
}
