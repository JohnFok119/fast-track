// The 3D street: an orthographic camera looking slightly down at two rows of houses along the bottom of the closing
// section. Throws if WebGL is missing; the caller logs it and leaves the space empty.
import * as THREE from 'three';
import { HouseBuilder } from './HouseBuilder';
import { PopTimeline } from './PopTimeline';
import { StreetLayout } from './StreetLayout';
import { ViewFit } from './ViewFit';

const REACH = 60;
const PITCH = (17 * Math.PI) / 180;

export class StreetScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.OrthographicCamera;
  private readonly builder: HouseBuilder;
  private readonly timeline: PopTimeline;
  private readonly objects: THREE.Group[];
  private readonly dir: THREE.Vector3;
  private readonly up: THREE.Vector3;
  private readonly fitter = new ViewFit();
  private clock = 0;
  private last = 0;
  private running = false;
  private frameId = 0;
  private disposed = false;

  constructor(private readonly host: HTMLElement, reduce: boolean) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
    this.dir = new THREE.Vector3(0, -Math.sin(PITCH), -Math.cos(PITCH));
    this.up = new THREE.Vector3(0, Math.cos(PITCH), -Math.sin(PITCH));
    this.addLights();
    this.builder = new HouseBuilder();
    const pieces = new StreetLayout(REACH).plan();
    this.timeline = new PopTimeline(pieces.map((p) => p.delay), reduce);
    this.objects = pieces.map((p) => this.builder.build(p));
    this.objects.forEach((o) => this.scene.add(o));
    this.apply();
    host.append(this.renderer.domElement);
    this.resize();
  }

  /** Match the camera to the host's size and draw once. */
  resize(): void {
    if (this.disposed) return;
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    const box = this.fitter.fit(w, h);
    Object.assign(this.camera, { left: box.left, right: box.right, top: box.top, bottom: box.bottom });
    this.camera.updateProjectionMatrix();
    // The front row's ground line sits at about 82% of the height.
    const target = this.up.clone().multiplyScalar(0.32 * box.viewH);
    this.camera.position.copy(target).addScaledVector(this.dir, -60);
    this.camera.up.copy(this.up);
    this.camera.lookAt(target);
    if (!this.running) this.renderer.render(this.scene, this.camera);
  }

  /** Pop the houses up from the middle outward (already standing when motion is reduced). */
  play(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.last = performance.now();
    this.frameId = requestAnimationFrame(this.step);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    this.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).geometry.dispose();
    });
    this.builder.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private readonly step = (now: number): void => {
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016);
    this.last = now;
    this.clock += dt;
    this.apply();
    this.renderer.render(this.scene, this.camera);
    if (this.timeline.busy(this.clock)) this.frameId = requestAnimationFrame(this.step);
    else this.running = false;
  };

  private apply(): void {
    this.objects.forEach((o, i) => {
      o.visible = this.timeline.visible(i, this.clock);
      const s = this.timeline.scale(i, this.clock);
      o.scale.set(s, s, s);
    });
  }

  private addLights(): void {
        this.scene.add(new THREE.HemisphereLight(0xfff1df, 0x8a6849, 1.25));
    const sun = new THREE.DirectionalLight(0xffe2bd, 2.5);
    sun.position.set(-9, 15, 11);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 1024);
    Object.assign(sun.shadow.camera, { left: -64, right: 64, top: 14, bottom: -14, near: 1, far: 80 });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    this.scene.add(sun);
    // Only the shadows show on the ground, so the street sits right on the page color.
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 40), new THREE.ShadowMaterial({ color: 0x281e15, opacity: 0.22 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }
}
