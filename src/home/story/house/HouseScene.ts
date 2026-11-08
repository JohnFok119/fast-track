// The 3D house for the scroll story: renderer, lights, camera and the frame loop. Loaded on demand (with three.js)
// when the story nears the screen; the loop runs only while the canvas is on screen.
import * as THREE from 'three';
import { CameraFit } from '../cameraFit';
import { HouseModel } from './houseModel';
import { PartAnimator } from './partAnimator';
import { TextureKit } from './textures';

function makeRenderer(): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  return renderer;
}

/** Warm sky light and a low sun that casts soft shadows across the whole soil block. */
function makeLights(): THREE.Light[] {
  const sky = new THREE.HemisphereLight(0xfff1df, 0x6b4f36, 1.2);
  const sun = new THREE.DirectionalLight(0xffe2bd, 2.6);
  sun.position.set(-10, 17, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 70 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  return [sky, sun];
}

function disposeTree(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Sprite)) return;
    obj.geometry.dispose();
    const mats: THREE.Material[] = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const m of mats) {
      if ('map' in m && m.map instanceof THREE.Texture) m.map.dispose();
      m.dispose();
    }
  });
}

export class HouseScene {
  private readonly renderer = makeRenderer();
  private readonly scene = new THREE.Scene();
  private readonly fit = new CameraFit();
  private readonly camera = new THREE.PerspectiveCamera(this.fit.fov, 1, 0.1, 300);
  private readonly animator = new PartAnimator();
  private readonly model: HouseModel;
  private readonly sizer: ResizeObserver;
  private readonly watcher: IntersectionObserver;
  private stage = 0;
  private running = false;
  private last = 0;
  private time = 0;
  private frameId = 0;

  constructor(private readonly host: HTMLElement, private readonly reduceMotion: boolean) {
    const kit = new TextureKit(this.renderer.capabilities.getMaxAnisotropy());
    this.model = new HouseModel(kit.materials(), kit, this.animator);
    this.scene.add(...makeLights(), this.model.world);
    host.append(this.renderer.domElement);
    this.sizer = new ResizeObserver(() => this.resize());
    this.sizer.observe(host);
    this.resize();
    this.watcher = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) this.start();
      else this.running = false;
    });
    this.watcher.observe(host);
  }

  setStage(stage: number): void {
    this.stage = stage;
  }

  dispose(): void {
    this.running = false;
    cancelAnimationFrame(this.frameId);
    this.sizer.disconnect();
    this.watcher.disconnect();
    disposeTree(this.scene);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private resize(): void {
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.frameId = requestAnimationFrame(this.frame);
  }

  private readonly frame = (now: number): void => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016);
    this.last = now;
    this.time += dt;
    this.animator.update(this.stage, dt, this.reduceMotion);
    this.model.show(this.stage);
    const p = this.fit.position(this.camera.aspect, this.fit.azimuth(this.time, this.reduceMotion));
    this.camera.position.set(p.x, p.y, p.z);
    this.camera.lookAt(this.fit.look.x, this.fit.look.y, this.fit.look.z);
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.frame);
  };
}
