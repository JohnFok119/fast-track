// Builds one house or tree out of three.js boxes. Four kinds of home: one story, two story, a backyard home (ADU)
// and a duplex. Colors and details come from the piece's seed, so a given piece always looks the same.
import type * as T from 'three';
import { seededRandom, type StreetPiece } from './StreetLayout';

export type ThreeModule = typeof T;

export class HouseBuilder {
  private readonly walls: T.MeshStandardMaterial[];
  private readonly roofs: T.MeshStandardMaterial[];
  private readonly doors: T.MeshStandardMaterial[];
  private readonly leaves: T.MeshStandardMaterial[];
  private readonly trim: T.MeshStandardMaterial;
  private readonly glass: T.MeshStandardMaterial;
  private readonly trunk: T.MeshStandardMaterial;
  private readonly path: T.MeshStandardMaterial;

  constructor(private readonly three: ThreeModule) {
    const std = (o: T.MeshStandardMaterialParameters) => new three.MeshStandardMaterial({ roughness: 0.85, ...o });
    this.walls = [0xf2ede5, 0xe8dccb, 0xd9c7ae, 0xf7f3ec, 0xcdb79c].map((c) => std({ color: c }));
    this.roofs = [0x3a3633, 0x2f2a26, 0x7a4a32, 0x5a544e].map((c) => std({ color: c, roughness: 0.6, metalness: 0.15 }));
    this.doors = [0x9e542f, 0x5e8f45, 0x2a2622].map((c) => std({ color: c, roughness: 0.6 }));
    this.trim = std({ color: 0x2a2622, roughness: 0.5 });
    this.glass = std({ color: 0x9fb3bd, roughness: 0.15, metalness: 0.1, emissive: 0xffc46b, emissiveIntensity: 0.3 });
    this.trunk = std({ color: 0x6b4f36, roughness: 1 });
    this.leaves = [0x7fa95d, 0x5e8f45, 0x8db86b].map((c) => std({ color: c, roughness: 0.9, flatShading: true }));
    this.path = std({ color: 0xe3d3bf, roughness: 1 });
  }

  build(piece: StreetPiece): T.Group {
    const g = piece.type === 'tree' ? this.tree(piece.seed) : this.house(piece);
    g.position.set(piece.x, 0, piece.z);
    g.rotation.y = piece.rotY;
    return g;
  }

  /** Free the shared materials. */
  dispose(): void {
    const all = [...this.walls, ...this.roofs, ...this.doors, ...this.leaves, this.trim, this.glass, this.trunk, this.path];
    all.forEach((m) => m.dispose());
  }

  private mesh(geo: T.BufferGeometry, mat: T.Material, cast = true): T.Mesh {
    const m = new this.three.Mesh(geo, mat);
    m.castShadow = cast;
    m.receiveShadow = true;
    return m;
  }

  private gable(w: number, r: number, d: number): T.ExtrudeGeometry {
    const sh = new this.three.Shape();
    sh.moveTo(-w / 2, 0);
    sh.lineTo(w / 2, 0);
    sh.lineTo(0, r);
    sh.closePath();
    const g = new this.three.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false });
    g.translate(0, 0, -d / 2);
    return g;
  }

  private windowAt(g: T.Group, x: number, y: number, z: number): void {
    const f = this.mesh(new this.three.BoxGeometry(0.5, 0.56, 0.05), this.trim, false);
    f.position.set(x, y, z);
    const gl = this.mesh(new this.three.BoxGeometry(0.4, 0.46, 0.06), this.glass, false);
    gl.position.set(x, y, z + 0.004);
    g.add(f, gl);
  }

  private house(piece: StreetPiece): T.Group {
    const { kind, width: w } = piece;
    const rnd = seededRandom(piece.seed);
    const pick = <V,>(a: V[]): V => a[Math.floor(rnd() * a.length)] as V;
    const g = new this.three.Group();
    const h = kind === 'two' ? 2.3 : kind === 'adu' ? 1.1 : 1.3;
    const d = kind === 'adu' ? 1.5 : 2.1;
    const roof = pick(this.roofs);
    const r = w * 0.3;
    const front = d / 2 + 0.02;
    const body = this.mesh(new this.three.BoxGeometry(w, h, d), pick(this.walls));
    body.position.y = h / 2;
    const rf = this.mesh(this.gable(w + 0.36, r, d + 0.3), roof);
    rf.position.y = h;
    g.add(body, rf);
    const doors = kind === 'duplex' ? [-w / 4, w / 4] : [kind === 'adu' ? 0 : -w * 0.2];
    doors.forEach((x) => {
      const dr = this.mesh(new this.three.BoxGeometry(0.36, 0.72, 0.05), pick(this.doors), false);
      dr.position.set(x, 0.36, front);
      g.add(dr);
      const p = this.mesh(new this.three.BoxGeometry(0.42, 0.02, 0.9), this.path, false);
      p.position.set(x, 0.01, front + 0.45);
      g.add(p);
    });
    if (kind === 'duplex') [-w * 0.42, w * 0.42].forEach((x) => this.windowAt(g, x, 0.78, front));
    else if (kind !== 'adu') this.windowAt(g, w * 0.22, 0.78, front);
    if (kind === 'two') [-w * 0.2, w * 0.22].forEach((x) => this.windowAt(g, x, 1.78, front));
    const side = this.mesh(new this.three.BoxGeometry(0.05, 0.46, 0.4), this.glass, false);
    side.position.set(w / 2 + 0.02, h * 0.58, 0);
    g.add(side);
    if (rnd() < 0.45) {
      const c = this.mesh(new this.three.BoxGeometry(0.28, 0.7, 0.28), roof);
      c.position.set(w * 0.24, h + r * 0.5, -d * 0.18);
      g.add(c);
    }
    return g;
  }

  private tree(seed: number): T.Group {
    const rnd = seededRandom(seed);
    const g = new this.three.Group();
    const s = 0.75 + rnd() * 0.5;
    const leaf = this.leaves[Math.floor(rnd() * this.leaves.length)] as T.MeshStandardMaterial;
    const t = this.mesh(new this.three.CylinderGeometry(0.06, 0.08, 0.7 * s, 6), this.trunk);
    t.position.y = 0.35 * s;
    const c = this.mesh(new this.three.IcosahedronGeometry(0.5 * s, 1), leaf);
    c.position.y = 0.95 * s;
    g.add(t, c);
    if (rnd() < 0.5) {
      const c2 = this.mesh(new this.three.IcosahedronGeometry(0.34 * s, 1), leaf);
      c2.position.set(0.25 * s, 1.25 * s, 0.05);
      g.add(c2);
    }
    return g;
  }
}
