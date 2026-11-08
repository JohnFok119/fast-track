// Materials for the realistic 3D house, painted on small canvases at load (no image files): soil, siding, a standing
// seam roof, concrete and pavers, plus the clash badges and the soft contact shadow.
import * as THREE from 'three';

type Draw = (g: CanvasRenderingContext2D, n: number) => void;

export interface HouseMaterials {
  soilTop: THREE.MeshStandardMaterial;
  soilSide: THREE.MeshStandardMaterial;
  subsoil: THREE.MeshStandardMaterial;
  slab: THREE.MeshStandardMaterial;
  timber: THREE.MeshStandardMaterial;
  wall: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  door: THREE.MeshStandardMaterial;
  trunk: THREE.MeshStandardMaterial;
  leaf: THREE.MeshStandardMaterial;
  leaf2: THREE.MeshStandardMaterial;
  path: THREE.MeshStandardMaterial;
  stake: THREE.MeshStandardMaterial;
  flag: THREE.MeshStandardMaterial;
}

function paint(size: number, draw: Draw): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  if (!g) throw new Error('a 2D canvas is not available to paint the house textures');
  draw(g, size);
  return canvas;
}

export class TextureKit {
  private seed = 11;

  constructor(private readonly anisotropy: number) {}

  materials(): HouseMaterials {
    const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
    return {
      soilTop: std({ map: this.tiled((g, n) => this.specks(g, n, '#8a6849', ['#6d4f34', '#a3825d', '#7b5c3f', '#5f452f'], 2, 1100), 5, 4), roughness: 1 }),
      soilSide: std({ map: this.tiled((g, n) => this.strata(g, n, '#4c3524', '#6c4e36', ['#3a281a', '#8a6a4a']), 5, 1), roughness: 1 }),
      subsoil: std({ map: this.tiled((g, n) => this.subsoil(g, n), 5, 1), roughness: 1 }),
      slab: std({ map: this.tiled((g, n) => this.specks(g, n, '#bfb9b0', ['#a9a298', '#d2ccc4'], 1.1, 1400), 2, 2), roughness: 0.9 }),
      timber: std({ color: 0xcf9f66, roughness: 0.8 }),
      wall: std({ map: this.tiled(siding, 0.5, 0.5), roughness: 0.85 }),
      trim: std({ color: 0x2a2622, roughness: 0.55 }),
      glass: std({ color: 0x9fb3bd, roughness: 0.12, metalness: 0.15, emissive: 0xffc46b, emissiveIntensity: 0 }),
      roof: std({ map: this.tiled(seams, 1, 2.5), roughness: 0.55, metalness: 0.25 }),
      door: std({ color: 0x9e542f, roughness: 0.6 }),
      trunk: std({ color: 0x6b4f36, roughness: 1 }),
      leaf: std({ color: 0x7fa95d, roughness: 0.9, flatShading: true }),
      leaf2: std({ color: 0x5e8f45, roughness: 0.9, flatShading: true }),
      path: std({ map: this.tiled(pavers, 1, 3), roughness: 0.95 }),
      stake: std({ color: 0xcf9f66 }),
      flag: std({ color: 0x6e9f4f, side: THREE.DoubleSide }),
    };
  }

  /** A round badge for the clash marks: a red cross, or a green check once fixed. */
  badge(fill: string, glyph: string): THREE.SpriteMaterial {
    const canvas = paint(128, (g) => {
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill();
      g.fillStyle = fill;
      g.beginPath(); g.arc(64, 64, 50, 0, 7); g.fill();
      g.fillStyle = '#ffffff';
      g.font = 'bold 60px "Inter Variable", system-ui, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(glyph, 64, 68);
    });
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return new THREE.SpriteMaterial({ map, depthWrite: false });
  }

  /** A soft round shadow that fades to nothing at the canvas edge. */
  shadow(): THREE.CanvasTexture {
    return new THREE.CanvasTexture(paint(128, (g) => {
      const rg = g.createRadialGradient(64, 64, 10, 64, 64, 64);
      rg.addColorStop(0, 'rgba(40,30,21,.45)');
      rg.addColorStop(1, 'rgba(40,30,21,0)');
      g.fillStyle = rg;
      g.fillRect(0, 0, 128, 128);
    }));
  }

  private rnd(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }

  private tiled(draw: Draw, rx: number, ry: number): THREE.CanvasTexture {
    const t = new THREE.CanvasTexture(paint(256, draw));
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = this.anisotropy;
    return t;
  }

  private specks(g: CanvasRenderingContext2D, n: number, base: string, cols: string[], rmax: number, count: number): void {
    g.fillStyle = base;
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < count; i++) {
      g.globalAlpha = 0.25 + this.rnd() * 0.5;
      g.fillStyle = cols[i % cols.length] ?? base;
      g.beginPath(); g.arc(this.rnd() * n, this.rnd() * n, 0.4 + this.rnd() * rmax, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  }

  private strata(g: CanvasRenderingContext2D, n: number, top: string, bottom: string, grit: string[]): void {
    const gr = g.createLinearGradient(0, 0, 0, n);
    gr.addColorStop(0, top);
    gr.addColorStop(1, bottom);
    g.fillStyle = gr;
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 700; i++) {
      g.globalAlpha = 0.18 + this.rnd() * 0.4;
      g.fillStyle = grit[i % grit.length] ?? top;
      g.fillRect(this.rnd() * n, this.rnd() * n, 1 + this.rnd() * 3, 1 + this.rnd() * 2);
    }
    g.globalAlpha = 1;
  }

  /** Lighter subsoil with pebbles. */
  private subsoil(g: CanvasRenderingContext2D, n: number): void {
    this.strata(g, n, '#7a5c41', '#9a7b5a', ['#5f4530', '#b89c78']);
    for (let i = 0; i < 40; i++) {
      g.fillStyle = this.rnd() > 0.5 ? '#b5a088' : '#8f7a63';
      g.beginPath(); g.ellipse(this.rnd() * n, this.rnd() * n, 2 + this.rnd() * 5, 1.5 + this.rnd() * 3, this.rnd() * 3, 0, 7); g.fill();
    }
  }
}

function siding(g: CanvasRenderingContext2D, n: number): void {
  g.fillStyle = '#f2ede5';
  g.fillRect(0, 0, n, n);
  for (let y = 0; y < n; y += 16) {
    g.fillStyle = 'rgba(110,90,70,.22)'; g.fillRect(0, y, n, 2);
    g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, y + 2, n, 1);
  }
}

function seams(g: CanvasRenderingContext2D, n: number): void {
  g.fillStyle = '#3a3633';
  g.fillRect(0, 0, n, n);
  for (let y = 0; y < n; y += 32) {
    g.fillStyle = 'rgba(0,0,0,.38)'; g.fillRect(0, y, n, 3);
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(0, y + 3, n, 2);
  }
}

function pavers(g: CanvasRenderingContext2D, n: number): void {
  g.fillStyle = '#d9cdb9';
  g.fillRect(0, 0, n, n);
  g.strokeStyle = 'rgba(90,70,50,.28)';
  g.lineWidth = 3;
  for (let y = 0; y <= n; y += 64) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(n, y); g.stroke();
    for (let x = (y / 64) % 2 ? 32 : 0; x <= n; x += 64) {
      g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke();
    }
  }
}
