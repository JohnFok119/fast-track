// The four walls of the 3D house, with real window openings, frames and glass.
import * as THREE from 'three';
import { HOUSE, OPENINGS } from './geometry';
import type { HouseMaterials } from './textures';

const { width: W, depth: D, height: H, slab: SLAB, wall: T } = HOUSE;
/** Windows run from sill to head at these heights; their centre and height follow. */
const SILL = 1.0;
const HEAD = 2.1;
const MID = (SILL + HEAD) / 2;
const TALL = HEAD - SILL;

type Hole = readonly [number, number, number, number];
const holes = (spans: readonly (readonly [number, number])[]): Hole[] => spans.map(([a, b]) => [a, b, SILL, HEAD]);

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, cast = true): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = true;
  return m;
}

/** A window frame with a centre bar, and its glass, set into a wall at [x0, x1]. */
function windowIn(wall: THREE.Object3D, mats: HouseMaterials, [x0, x1]: readonly [number, number]): void {
  const cx = (x0 + x1) / 2;
  const w = x1 - x0;
  const parts = [
    [cx, MID + TALL / 2 + 0.04, w + 0.16, 0.08],
    [cx, MID - TALL / 2 - 0.04, w + 0.16, 0.08],
    [cx - w / 2 - 0.04, MID, 0.08, TALL],
    [cx + w / 2 + 0.04, MID, 0.08, TALL],
    [cx, MID, 0.05, TALL],
  ] as const;
  for (const [x, y, ww, hh] of parts) {
    const m = mesh(new THREE.BoxGeometry(ww, hh, T + 0.06), mats.trim);
    m.position.set(x, y, T / 2);
    wall.add(m);
  }
  const glass = mesh(new THREE.BoxGeometry(w, TALL, 0.03), mats.glass, false);
  glass.position.set(cx, MID, T / 2);
  wall.add(glass);
}

/** The house's end profile: a wall with a gable, rectangular holes [x0, x1, y0, y1] and, on the front, a door gap. */
export function gable(cuts: readonly Hole[] = [], door = false): THREE.Shape {
  const sh = new THREE.Shape();
  sh.moveTo(-W / 2, 0);
  if (door) {
    const [x0, x1] = OPENINGS.front[0];
    sh.lineTo(x0, 0); sh.lineTo(x0, HEAD); sh.lineTo(x1, HEAD); sh.lineTo(x1, 0);
  }
  sh.lineTo(W / 2, 0); sh.lineTo(W / 2, H); sh.lineTo(0, H + HOUSE.rise); sh.lineTo(-W / 2, H); sh.closePath();
  for (const [x0, x1, y0, y1] of cuts) {
    const p = new THREE.Path();
    p.moveTo(x0, y0); p.lineTo(x1, y0); p.lineTo(x1, y1); p.lineTo(x0, y1); p.closePath();
    sh.holes.push(p);
  }
  return sh;
}

function sideShape(): THREE.Shape {
  const sh = new THREE.Shape();
  const half = D / 2 - T;
  sh.moveTo(-half, 0); sh.lineTo(half, 0); sh.lineTo(half, H); sh.lineTo(-half, H); sh.closePath();
  for (const [x0, x1] of OPENINGS.side) {
    const p = new THREE.Path();
    p.moveTo(x0, SILL); p.lineTo(x1, SILL); p.lineTo(x1, HEAD); p.lineTo(x0, HEAD); p.closePath();
    sh.holes.push(p);
  }
  return sh;
}

function wallFrom(shape: THREE.Shape, mats: HouseMaterials, windows: readonly (readonly [number, number])[]): THREE.Mesh {
  const wall = mesh(new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false }), mats.wall);
  for (const span of windows) windowIn(wall, mats, span);
  return wall;
}

/** Adds the front, back and side walls to world; animate is called for each wall in turn. */
export function addWalls(world: THREE.Object3D, mats: HouseMaterials, animate: (wall: THREE.Group, index: number) => void): void {
  const [, ...frontWindows] = OPENINGS.front;
  const placed: [THREE.Mesh, number, number, number][] = [
    [wallFrom(gable(holes(frontWindows), true), mats, frontWindows), 0, D / 2 - T, 0],
    [wallFrom(gable(holes(OPENINGS.back)), mats, OPENINGS.back), 0, -D / 2, 0],
    [wallFrom(sideShape(), mats, OPENINGS.side), W / 2, 0, -Math.PI / 2],
    [wallFrom(sideShape(), mats, OPENINGS.side), -W / 2, 0, Math.PI / 2],
  ];
  placed.forEach(([wall, x, z, turn], i) => {
    const g = new THREE.Group();
    g.add(wall);
    g.position.set(x, SLAB, z);
    g.rotation.y = turn;
    world.add(g);
    animate(g, i);
  });
}
