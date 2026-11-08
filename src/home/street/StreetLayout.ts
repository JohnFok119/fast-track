// Where the houses and trees of the closing street go. Pure and seeded: the same width gives the same street.
// Two staggered rows fill outward from a middle home; each piece pops up in order of its distance from the middle.

export type HouseKind = 'one' | 'two' | 'adu' | 'duplex';

export interface StreetPiece {
  type: 'house' | 'tree';
  /** Only for houses. */
  kind?: HouseKind;
  x: number;
  z: number;
  rotY: number;
  /** Width of a house in scene units (a tree has 0). */
  width: number;
  /** Seed for the details of this piece, so building it is repeatable. */
  seed: number;
  /** Seconds after the street is reached before this piece starts to pop. */
  delay: number;
}

const KINDS: HouseKind[] = ['one', 'two', 'adu', 'one', 'duplex', 'two', 'one', 'adu'];
const BASE_ROT = -0.42;
const DELAY_PER_UNIT = 0.045;

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export class StreetLayout {
  private readonly rnd: () => number;

  /** halfWidth: how far each side of the middle the street reaches, in scene units. */
  constructor(private readonly halfWidth: number, seed = 23) {
    this.rnd = seededRandom(seed);
  }

  plan(): StreetPiece[] {
    return [...this.row(0, 0, 'duplex'), ...this.row(-4.2, 0.35, 'two')];
  }

  private row(z: number, startDelay: number, centerKind: HouseKind): StreetPiece[] {
    const mid = this.house(centerKind, 0, z, BASE_ROT, startDelay);
    const out: StreetPiece[] = [mid];
    for (const sign of [1, -1]) {
      let x = mid.width / 2 + 0.9;
      while (x < this.halfWidth) {
        if (this.rnd() < 0.55) {
          out.push(this.tree(sign * (x + 0.1), z + 1.2 + this.rnd() * 0.4, startDelay + x * DELAY_PER_UNIT + 0.08));
          x += 0.5;
        }
        const kind = KINDS[Math.floor(this.rnd() * KINDS.length)] ?? 'one';
        const width = this.width(kind);
        const cx = sign * (x + width / 2);
        const dz = (this.rnd() - 0.5) * 0.5;
        const rot = BASE_ROT + (this.rnd() - 0.5) * 0.24;
        out.push(this.house(kind, cx, z + dz, rot, startDelay + Math.abs(cx) * DELAY_PER_UNIT, width));
        x += width + 0.8 + this.rnd() * 0.5;
      }
    }
    return out;
  }

  private width(kind: HouseKind): number {
    if (kind === 'adu') return 1.5;
    if (kind === 'duplex') return 3.4;
    return 2.2 + this.rnd() * 0.5;
  }

  private house(kind: HouseKind, x: number, z: number, rotY: number, delay: number, width = this.width(kind)): StreetPiece {
    return { type: 'house', kind, x, z, rotY, width, seed: this.seed(), delay };
  }

  private tree(x: number, z: number, delay: number): StreetPiece {
    return { type: 'tree', x, z, rotY: 0, width: 0, seed: this.seed(), delay };
  }

  private seed(): number {
    return 1 + Math.floor(this.rnd() * 2147483000);
  }
}
