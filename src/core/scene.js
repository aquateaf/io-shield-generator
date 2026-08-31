import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneView {
  constructor(host) {
    this.host = host;
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x0d1422);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 5000); this.camera.position.set(95, -115, 105);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); host.append(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement); this.controls.enableDamping = true;
    this.hemi = new THREE.HemisphereLight(0xeaf2ff, 0x172033, 2.5); this.scene.add(this.hemi);
    const light = new THREE.DirectionalLight(0xffffff, 2.5); light.position.set(40, -50, 80); this.scene.add(light);
    this.grid = new THREE.GridHelper(180, 18, 0x395073, 0x263852); this.scene.add(this.grid);
    this.modelGroup = new THREE.Group(); this.scene.add(this.modelGroup);
    this.guideGroup = new THREE.Group(); this.scene.add(this.guideGroup);
    this.frameGuideGroup = new THREE.Group(); this.scene.add(this.frameGuideGroup);
    this.guideMaterial = new THREE.MeshStandardMaterial({ color: 0xff9d21, emissive: 0xb24c00, emissiveIntensity: 1.2, transparent: true, opacity: 0.68, metalness: 0.15, roughness: 0.3, side: THREE.DoubleSide });
    this.guideLineMaterial = new THREE.LineBasicMaterial({ color: 0xffec9a, transparent: true, opacity: 0.95 });
    // The frame is a selection volume only; it is never included in CSG/STL export.
    this.frameMaterial = new THREE.MeshStandardMaterial({ color: 0x29d9a4, emissive: 0x08624a, emissiveIntensity: 1, transparent: true, opacity: 0.33, side: THREE.DoubleSide });
    this.frameLineMaterial = new THREE.LineBasicMaterial({ color: 0x75f5d0, transparent: true, opacity: 0.9 });
    this.preview = null; this.baseMesh = null;
    new ResizeObserver(() => this.resize()).observe(host); this.resize();
    this.syncTheme();
    const render = () => { this.controls.update(); this.renderer.render(this.scene, this.camera); requestAnimationFrame(render); }; render();
  }
  resize() { const { clientWidth: w, clientHeight: h } = this.host; if (!w || !h) return; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); }
  setBaseMesh(mesh) { this.clearPreview(); this.modelGroup.clear(); this.clearGuides(); this.clearFrameGuide(); this.baseMesh = mesh; mesh.material = new THREE.MeshStandardMaterial({ color: 0x7185a5, metalness: 0.35, roughness: 0.5, side: THREE.DoubleSide }); this.modelGroup.add(mesh); this.focus(mesh); }
  setPreview(mesh) { this.clearPreview(); this.preview = mesh; this.modelGroup.add(mesh); if (this.baseMesh) this.baseMesh.visible = false; this.guideGroup.visible = false; this.frameGuideGroup.visible = false; }
  clearPreview() { if (!this.preview) return; this.modelGroup.remove(this.preview); this.preview.geometry.dispose(); this.preview = null; if (this.baseMesh) this.baseMesh.visible = true; this.guideGroup.visible = true; this.frameGuideGroup.visible = true; }
  setPortGuides(meshes) { this.clearGuides(); meshes.forEach(mesh => { const outline = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 20), this.guideLineMaterial); this.guideGroup.add(mesh, outline); }); this.guideGroup.visible = !this.preview; }
  clearGuides() {
    this.guideGroup.traverse(object => { if (object.geometry) object.geometry.dispose(); });
    this.guideGroup.clear();
  }
  setFrameGuide(meshes) { this.clearFrameGuide(); meshes.forEach(mesh => { const outline = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), this.frameLineMaterial); this.frameGuideGroup.add(mesh, outline); }); }
  clearFrameGuide() { this.frameGuideGroup.traverse(object => { if (object.geometry) object.geometry.dispose(); }); this.frameGuideGroup.clear(); }
  focus(object) { const box = new THREE.Box3().setFromObject(object); const center = box.getCenter(new THREE.Vector3()); const span = box.getSize(new THREE.Vector3()).length() || 50; this.controls.target.copy(center); this.camera.position.copy(center).add(new THREE.Vector3(span, -span * 1.25, span)); this.camera.near = Math.max(0.01, span / 1000); this.camera.far = span * 30; this.camera.updateProjectionMatrix(); this.controls.update(); }
  syncTheme() {
    const css = getComputedStyle(document.documentElement);
    const read = name => css.getPropertyValue(name).trim();
    const bg = read('--scene-bg');
    if (bg) this.scene.background.set(bg);
    const major = read('--grid-major') || '#395073';
    const minor = read('--grid-minor') || '#263852';
    if (this.grid) this.scene.remove(this.grid);
    this.grid = new THREE.GridHelper(180, 18, major, minor);
    this.scene.add(this.grid);
  }
}
