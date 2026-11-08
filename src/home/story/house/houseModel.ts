// Builds the diorama: a cut block of soil with a house that goes up stage by stage, as the build plan says.
// Sizes come from ./geometry; each part registers with the animator for the stage it belongs to.
import * as THREE from 'three';
import { BuildPlan, type PartName } from '../buildPlan';
import {
  CHIMNEY, CROWN, HOUSE, LOT, ROOF, SHADOW, SOIL, TREES,
  joistBox, plateBoxes, rafterBoxes, ridgeY, roofPanels, studLayout, trussZs,
} from './geometry';
import type { PartAnimator, PartHandle } from './partAnimator';
import type { HouseMaterials, TextureKit } from './textures';
import { addWalls, gable } from './walls';

const { width: W, depth: D, height: H, slab: SLAB } = HOUSE;
type Mat = THREE.Material | THREE.Material[];

export class HouseModel {
  readonly world = new THREE.Group();
  private readonly plan = new BuildPlan();
  private readonly markers: THREE.Sprite[] = [];
  private readonly badgeX: THREE.SpriteMaterial;
  private readonly badgeOk: THREE.SpriteMaterial;
  private readonly lights: PartHandle;

  constructor(private readonly mats: HouseMaterials, private readonly kit: TextureKit, private readonly animator: PartAnimator) {
    this.badgeX = kit.badge('#b8432c', '✕');
    this.badgeOk = kit.badge('#4c7a32', '✓');
    this.ground();
    this.lot();
    this.outline();
    this.slab();
    this.frame();
    addWalls(this.world, mats, (obj, i) => animator.add(obj, { ...this.at('walls'), kind: 'grow', delay: i * 0.12 }));
    this.clashMarks();
    this.roof();
    this.finish();
    this.lights = animator.addValue({ ...this.at('lights'), delay: 0.3 });
  }

  /** Per frame, after the animator: the badges turn to checks at Fix, and the windows glow at Keys. */
  show(stage: number): void {
    const badge = this.plan.fixed(stage) ? this.badgeOk : this.badgeX;
    for (const m of this.markers) m.material = badge;
    this.mats.glass.emissiveIntensity = this.lights.t * 1.6;
  }

  private at(part: PartName): { from: number; until: number } {
    return this.plan.window(part);
  }

  private mesh(geo: THREE.BufferGeometry, mat: Mat, cast = true): THREE.Mesh {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = cast;
    m.receiveShadow = true;
    return m;
  }

  /** Topsoil over subsoil, and a soft shadow under the block. */
  private ground(): void {
    const { soilTop: top, soilSide: side, subsoil } = this.mats;
    const topsoil = this.mesh(new THREE.BoxGeometry(SOIL.width, SOIL.topsoil, SOIL.depth), [side, side, top, side, side, side], false);
    topsoil.position.y = -SOIL.topsoil / 2;
    const sub = this.mesh(new THREE.BoxGeometry(SOIL.width, SOIL.subsoil, SOIL.depth), subsoil, false);
    sub.position.y = -(SOIL.topsoil + SOIL.subsoil / 2);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(SHADOW.width, SHADOW.depth),
      new THREE.MeshBasicMaterial({ map: this.kit.shadow(), transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = SHADOW.y;
    this.world.add(topsoil, sub, shadow);
  }

  /** The dashed lot line and a survey stake with a flag at each corner. */
  private lot(): void {
    const corners = [[-LOT.halfX, -LOT.halfZ], [LOT.halfX, -LOT.halfZ], [LOT.halfX, LOT.halfZ], [-LOT.halfX, LOT.halfZ]] as const;
    const pts = [...corners, corners[0]].map(([x, z]) => new THREE.Vector3(x, 0.02, z));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0xc9773f, dashSize: 0.35, gapSize: 0.25 }));
    line.computeLineDistances();
    this.world.add(line);
    corners.forEach(([x, z], i) => {
      const stake = this.mesh(new THREE.CylinderGeometry(0.04, 0.05, 1, 8), this.mats.stake);
      stake.position.y = 0.5;
      const flag = this.mesh(new THREE.PlaneGeometry(0.42, 0.26), this.mats.flag);
      flag.position.set(0.22, 0.86, 0);
      const g = new THREE.Group();
      g.add(stake, flag);
      g.position.set(x, 0, z);
      this.world.add(g);
      this.animator.add(g, { ...this.at('stakes'), kind: 'pop', delay: i * 0.08 });
    });
  }

  /** The dashed outline of the house to come. */
  private outline(): void {
    const geo = new THREE.EdgesGeometry(new THREE.ExtrudeGeometry(gable(), { depth: D, bevelEnabled: false }));
    const ghost = new THREE.LineSegments(geo, new THREE.LineDashedMaterial({ color: 0xc9773f, dashSize: 0.25, gapSize: 0.18, transparent: true, opacity: 0.6 }));
    ghost.computeLineDistances();
    ghost.position.set(0, SLAB, -D / 2);
    this.world.add(ghost);
    this.animator.addFade(ghost, { ...this.at('outline'), max: 0.6 });
  }

  /** The slab pours up out of the soil. */
  private slab(): void {
    const slab = this.mesh(new THREE.BoxGeometry(W + 0.4, SLAB, D + 0.4), this.mats.slab);
    slab.position.y = SLAB / 2;
    this.world.add(slab);
    this.animator.add(slab, { ...this.at('slab'), kind: 'rise', dy: 0.7 });
  }

  /** Studs grow up, the top plates drop on, then the trusses one after another. */
  private frame(): void {
    const studGeo = new THREE.BoxGeometry(0.09, H, 0.14);
    studGeo.translate(0, H / 2, 0);
    const { front, back, side } = studLayout();
    const spots = [
      ...front.map((x) => [x, D / 2 - 0.1]),
      ...back.map((x) => [x, -D / 2 + 0.1]),
      ...side.flatMap((z) => [[W / 2 - 0.1, z], [-W / 2 + 0.1, z]]),
    ];
    spots.forEach(([x = 0, z = 0], i) => {
      const stud = this.mesh(studGeo, this.mats.timber);
      stud.position.set(x, SLAB, z);
      this.world.add(stud);
      this.animator.add(stud, { ...this.at('frame'), kind: 'grow', delay: i * 0.012 });
    });
    this.plates();
    this.trusses();
  }

  private plates(): void {
    const plates = new THREE.Group();
    const [long, ...sides] = plateBoxes();
    if (long) for (const z of [D / 2 - 0.1, -D / 2 + 0.1]) plates.add(this.timberAt(long.w, long.h, 0.14, long.cx, long.cy, z));
    for (const b of sides) plates.add(this.timberAt(b.w, b.h, D - 0.4, b.cx, b.cy, 0));
    this.world.add(plates);
    this.animator.add(plates, { ...this.at('frame'), kind: 'drop', dy: 0.8, delay: 0.55 });
  }

  private trusses(): void {
    const joist = joistBox();
    trussZs().forEach((z, j) => {
      const truss = new THREE.Group();
      for (const r of rafterBoxes()) {
        const rafter = this.timberAt(r.w, r.h, 0.07, r.cx, r.cy, 0);
        rafter.rotation.z = r.rot;
        truss.add(rafter);
      }
      truss.add(this.timberAt(joist.w, joist.h, 0.07, joist.cx, joist.cy, 0));
      truss.position.z = z;
      this.world.add(truss);
      this.animator.add(truss, { ...this.at('frame'), kind: 'drop', dy: 1.6, delay: 0.75 + j * 0.06 });
    });
  }

  private timberAt(w: number, h: number, d: number, x: number, y: number, z: number): THREE.Mesh {
    const m = this.mesh(new THREE.BoxGeometry(w, h, d), this.mats.timber);
    m.position.set(x, y, z);
    return m;
  }

  /** Red badges on the front wall at Clash, turned to green checks at Fix (see show). */
  private clashMarks(): void {
    const spots = [[-1.15, SLAB + 1.45], [1.15, SLAB + 1.45], [0, SLAB + 3.75]] as const;
    spots.forEach(([x, y], i) => {
      const sprite = new THREE.Sprite(this.badgeX);
      sprite.scale.setScalar(0.62);
      sprite.renderOrder = 10;
      const g = new THREE.Group();
      g.position.set(x, y, D / 2 + 0.35);
      g.add(sprite);
      this.world.add(g);
      this.markers.push(sprite);
      this.animator.add(g, { ...this.at('marks'), kind: 'pop', delay: 0.45 + i * 0.15 });
    });
  }

  /** The roof drops on, with a ridge cap and a chimney. */
  private roof(): void {
    const roof = new THREE.Group();
    for (const p of roofPanels()) {
      const panel = this.mesh(new THREE.BoxGeometry(p.w, p.h, ROOF.depth), this.mats.roof);
      panel.position.set(p.cx, p.cy, 0);
      panel.rotation.z = p.rot;
      roof.add(panel);
    }
    const ridge = this.mesh(new THREE.BoxGeometry(0.36, 0.1, D + 0.84), this.mats.trim);
    ridge.position.y = ridgeY() + 0.15;
    const chimney = this.mesh(new THREE.BoxGeometry(CHIMNEY.size, CHIMNEY.height, CHIMNEY.size), this.mats.roof);
    chimney.position.set(CHIMNEY.x, ridgeY() - 0.2, CHIMNEY.z);
    roof.add(ridge, chimney);
    this.world.add(roof);
    this.animator.add(roof, { ...this.at('roof'), kind: 'drop', dy: 4.5 });
  }

  /** The door, a paver path, trees and shrubs. */
  private finish(): void {
    const at = this.at('finish');
    const doorGeo = new THREE.BoxGeometry(0.96, 2.06, 0.06);
    doorGeo.translate(0, 1.03, 0);
    const door = this.mesh(doorGeo, this.mats.door);
    door.position.set(0, SLAB, D / 2 - 0.08);
    const knob = this.mesh(new THREE.SphereGeometry(0.05, 12, 12), this.mats.trim);
    knob.position.set(0.32, 1, 0.06);
    door.add(knob);
    const path = this.mesh(new THREE.BoxGeometry(1.2, 0.05, 2.2), this.mats.path, false);
    path.position.set(0, 0.025, D / 2 + 1.3);
    this.world.add(door, path);
    this.animator.add(door, { ...at, kind: 'grow' });
    this.animator.add(path, { ...at, kind: 'pop', delay: 0.1 });
    TREES.forEach((t, k) => this.animator.add(this.tree(t.x, t.z, t.s), { ...at, kind: 'pop', delay: 0.2 + k * 0.12 }));
    [[-2.4, 3.55], [2.4, 3.55], [-3.4, 3.45], [3.4, 3.45]].forEach(([x = 0, z = 0], i) => {
      const shrub = this.mesh(new THREE.IcosahedronGeometry(0.34, 1), i % 2 ? this.mats.leaf2 : this.mats.leaf);
      shrub.position.set(x, 0.3, z);
      this.world.add(shrub);
      this.animator.add(shrub, { ...at, kind: 'pop', delay: 0.35 + i * 0.07 });
    });
  }

  private tree(x: number, z: number, s: number): THREE.Group {
    const g = new THREE.Group();
    const trunk = this.mesh(new THREE.CylinderGeometry(0.11 * s, 0.16 * s, 1.5 * s, 8), this.mats.trunk);
    trunk.position.y = 0.75 * s;
    g.add(trunk);
    CROWN.forEach(([dx, dy, dz, r], i) => {
      const ball = this.mesh(new THREE.IcosahedronGeometry(r * s, 1), i ? this.mats.leaf2 : this.mats.leaf);
      ball.position.set(dx * s, dy * s, dz * s);
      g.add(ball);
    });
    g.position.set(x, 0, z);
    this.world.add(g);
    return g;
  }
}
