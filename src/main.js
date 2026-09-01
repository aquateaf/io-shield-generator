import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { SceneView } from './core/scene.js';
import { TopView } from './ui/topView.js';
import { centeredMarginsForSize, frameFromBounds, portWorldPosition } from './core/positioning.js';
import { bezelPreviewMeshes, footprintAt, shapeBounds } from './core/geometry/portGeometry.js';
import { downloadJson, exportLibrary, importLibrary, loadShapes, saveShapes } from './shapes-library/store.js';
import { bindMmInput, formatMm, isEditingInside, roundMm, writeMm } from './ui/mmInput.js';
import { applyStoredAppearance, bindWorkspace, mountAppearance } from './ui/appearance.js';
import { applyLocale, loadLocale, onLocaleChange, setLocale, t } from './i18n.js';
import './style.css';

loadLocale();
applyStoredAppearance();

const emptyBounds = { min: { x: -45, y: -25, z: 0 }, max: { x: 45, y: 25, z: 1 } };
const state = {
  shapes: loadShapes(), ports: [], selectedShape: 'usb-a', selectedPort: null, selectedEditorShape: 'usb-a',
  tolerance: 0.8, margins: { left: 0, right: 0, top: 0, bottom: 0 }, targetFrame: { width: 158.75, height: 44.45 }, frame: null, bounds: null, modelFile: null, orientation: { x: 0, y: 0, z: 0 }, finalMesh: null, selectingFrame: false, frameSelected: true, exportName: 'io-shield'
};
let scene; let topView; let renderQueued = false;

document.querySelector('#app').innerHTML = `
  <header>
    <div class="brand">
      <div>
        <h1 data-i18n="title">I/O Shield Generator</h1>
        <p data-i18n="subtitle">Make a custom motherboard backplate and download it as STL.</p>
      </div>
      <div class="lang-switch" role="group" aria-label="Language">
        <button type="button" data-lang="en" class="active">EN</button>
        <button type="button" data-lang="ru">RU</button>
      </div>
    </div>
    <div class="header-right"><div id="status" role="status">Load an STL blank to start</div><div id="settings-root"></div></div>
  </header>
  <main>
    <section class="view-section"><div class="section-heading"><h2 data-i18n="preview">Preview</h2><div class="actions"><button class="primary" id="generate" data-i18n="generate">Generate preview</button><div class="export-block"><label><span data-i18n="fileName">File name</span><input id="export-name" type="text" maxlength="80" placeholder="io-shield" value="io-shield" autocomplete="off"></label><button id="download-stl" disabled data-i18n="downloadStl">Download STL</button></div></div></div>
      <div class="view-grid"><div class="viewport" id="three-view"></div>
        <div class="top-wrap">
          <div class="top-toolbar">
            <strong data-i18n="topView">Top view</strong>
            <button class="primary" id="select-frame" data-i18n="selectFrame">Draw frame</button>
            <button id="auto-fit-frame" data-i18n="autoAtx">Fit ATX window</button>
            <button id="reset-frame" data-i18n="resetFrame">Frame = whole model</button>
          </div>
          <canvas id="top-view"></canvas>
        </div></div>
    </section>
    <section class="workspace">
      <nav class="workspace-nav" aria-label="Workspace">
        <button type="button" class="active" data-workspace="project" data-i18n="navProject">Load</button>
        <button type="button" data-workspace="frame" data-i18n="navFrame">Frame</button>
        <button type="button" data-workspace="shapes" data-i18n="navShapes">Shapes</button>
        <button type="button" data-workspace="ports" data-i18n="navPorts">Ports</button>
      </nav>
      <div class="workspace-body">
        <article class="panel active" data-panel="project"><h2 data-i18n="projectHeading">File and project</h2><label class="dropzone" id="dropzone"><input id="stl-input" type="file" accept=".stl,model/stl" hidden><span data-i18n="dropHint">Drop an STL here or choose a file</span><small id="model-name">No model loaded</small></label>
          <div class="row"><label><span data-i18n="tolerance">Clearance, mm</span><span class="mm-wrap"><input id="tolerance" type="text" inputmode="decimal" autocomplete="off" value="0.8"><span class="field-error" hidden></span></span></label></div>
          <div class="rotation"><span data-i18n="orientation">Blank orientation</span><button id="auto-flat" data-i18n="autoFlat">Lay it flat</button><button data-rotate="x:-90">X −90°</button><button data-rotate="x:90">X +90°</button><button data-rotate="y:-90">Y −90°</button><button data-rotate="y:90">Y +90°</button></div>
          <div class="actions stack"><button id="save-project" data-i18n="saveProject">Download project JSON</button><label class="button-like"><span data-i18n="openProject">Open project JSON</span><input id="project-input" type="file" accept="application/json,.json" hidden></label></div>
        </article>
        <article class="panel" data-panel="frame"><h2 data-i18n="frameHeading">Case opening</h2>
          <div class="auto-fit">
            <label><span data-i18n="windowWidth">Opening width, mm</span><span class="mm-wrap"><input id="target-width" type="text" inputmode="decimal" autocomplete="off" value="158.75"><span class="field-error" hidden></span></span></label>
            <label><span data-i18n="windowHeight">Opening height, mm</span><span class="mm-wrap"><input id="target-height" type="text" inputmode="decimal" autocomplete="off" value="44.45"><span class="field-error" hidden></span></span></label>
            <button class="primary" id="auto-fit-frame-panel" type="button" data-i18n="autoScale">Center to size</button>
          </div>
          <p class="note" data-i18n="atxNote">ATX I/O opening is 158.75 × 44.45 mm.</p>
          <div class="quad-inputs">
            <label><span data-i18n="marginLeft">Left, mm</span><span class="mm-wrap"><input data-margin="left" type="text" inputmode="decimal" autocomplete="off" value="0"><span class="field-error" hidden></span></span></label>
            <label><span data-i18n="marginRight">Right, mm</span><span class="mm-wrap"><input data-margin="right" type="text" inputmode="decimal" autocomplete="off" value="0"><span class="field-error" hidden></span></span></label>
            <label><span data-i18n="marginTop">Top, mm</span><span class="mm-wrap"><input data-margin="top" type="text" inputmode="decimal" autocomplete="off" value="0"><span class="field-error" hidden></span></span></label>
            <label><span data-i18n="marginBottom">Bottom, mm</span><span class="mm-wrap"><input data-margin="bottom" type="text" inputmode="decimal" autocomplete="off" value="0"><span class="field-error" hidden></span></span></label>
          </div><p id="frame-size" class="note"></p>
        </article>
        <article class="panel" data-panel="shapes">
          <div class="shapes-layout">
            <div><div class="section-heading"><h2 data-i18n="shapesHeading">Shape library</h2><div class="actions"><button id="new-shape" data-i18n="newShape">New</button><button id="export-library" data-i18n-title="exportLibrary" title="Export library">⇩</button><label class="icon-label" data-i18n-title="importLibrary" title="Import library">⇧<input id="library-input" type="file" accept="application/json,.json" hidden></label></div></div><div id="shape-list" class="shape-list"></div></div>
            <div class="editor"><h2 data-i18n="sketchHeading">Shape sketch</h2><div id="shape-editor"></div></div>
          </div>
        </article>
        <article class="panel ports" data-panel="ports"><h2><span data-i18n="portsHeading">Placed ports</span> <span id="port-count"></span></h2><div id="warnings"></div><div id="ports-table"></div></article>
      </div>
    </section>
  </main>`;

scene = new SceneView(document.querySelector('#three-view'));
topView = new TopView(document.querySelector('#top-view'), state, scheduleRender, setStatus);
mountAppearance({ onChange: () => { scene.syncTheme(); topView.snapshot = null; topView.snapshotKey = ''; scheduleRender(); } });
bindWorkspace();
bindEvents();
applyLocale();
onLocaleChange(() => {
  applyLocale();
  if (!state.modelFile) setStatus(t('statusEmpty'));
  scheduleRender();
});
render();

function bindEvents() {
  const stlInput = document.querySelector('#stl-input'); const dropzone = document.querySelector('#dropzone');
  stlInput.addEventListener('change', e => e.target.files[0] && loadStl(e.target.files[0]));
  ['dragenter', 'dragover'].forEach(type => dropzone.addEventListener(type, e => { e.preventDefault(); dropzone.classList.add('dragging'); }));
  ['dragleave', 'drop'].forEach(type => dropzone.addEventListener(type, e => { e.preventDefault(); dropzone.classList.remove('dragging'); }));
  dropzone.addEventListener('drop', e => { const file = [...e.dataTransfer.files].find(f => f.name.toLowerCase().endsWith('.stl')); if (file) loadStl(file); else setStatus(t('needStl'), true); });
  bindMmInput(document.querySelector('#tolerance'), { min: 0, max: 5, apply: value => { state.tolerance = value; } });
  document.querySelector('#tolerance').addEventListener('mm-commit', scheduleRender);
  document.querySelectorAll('[data-margin]').forEach(el => {
    bindMmInput(el, { min: 0, apply: value => setMargin(el.dataset.margin, value) });
    el.addEventListener('mm-commit', scheduleRender);
  });
  bindMmInput(document.querySelector('#target-width'), { min: 1, apply: value => { state.targetFrame.width = value; } });
  bindMmInput(document.querySelector('#target-height'), { min: 1, apply: value => { state.targetFrame.height = value; } });
  document.querySelector('#target-width').addEventListener('mm-commit', scheduleRender);
  document.querySelector('#target-height').addEventListener('mm-commit', scheduleRender);
  document.querySelector('#generate').addEventListener('click', generate);
  document.querySelector('#select-frame').addEventListener('click', () => topView.beginFrameSelection());
  document.querySelector('#auto-fit-frame').addEventListener('click', autoFitFrame);
  document.querySelector('#auto-fit-frame-panel').addEventListener('click', autoFitFrame);
  document.querySelector('#reset-frame').addEventListener('click', () => {
    if (!state.bounds) return setStatus(t('loadStlFirst'), true);
    state.margins = { left: 0, right: 0, top: 0, bottom: 0 };
    state.frame = frameFromBounds(state.bounds, state.margins);
    state.frameSelected = true;
    scheduleRender();
    setStatus(t('frameMatchesModel'));
  });
  document.querySelector('#export-name').addEventListener('input', e => { state.exportName = e.target.value; });
  document.querySelector('#download-stl').addEventListener('click', async () => { if (state.finalMesh) (await import('./export/stl.js')).downloadStl(state.finalMesh, exportFilename('stl')); });
  document.querySelector('#new-shape').addEventListener('click', newShape);
  document.querySelector('#export-library').addEventListener('click', () => exportLibrary(state.shapes));
  document.querySelector('#library-input').addEventListener('change', async e => { if (!e.target.files[0]) return; try { state.shapes = await importLibrary(e.target.files[0]); saveShapes(state.shapes); state.selectedShape = state.shapes[0].id; state.selectedEditorShape = state.shapes[0].id; scheduleRender(); setStatus(t('libraryImported')); } catch (error) { setStatus(error.message, true); } });
  document.querySelector('#save-project').addEventListener('click', saveProject);
  document.querySelector('#project-input').addEventListener('change', e => e.target.files[0] && loadProject(e.target.files[0]));
  document.querySelectorAll('[data-rotate]').forEach(button => button.addEventListener('click', () => { const [axis, degrees] = button.dataset.rotate.split(':'); rotateModel(axis, Number(degrees)); }));
  document.querySelector('#auto-flat').addEventListener('click', autoFlatten);
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLocale(button.dataset.lang)));
}

async function loadStl(file) {
  try {
    const buffer = await file.arrayBuffer(); state.orientation = { x: 0, y: 0, z: 0 }; state.modelFile = { name: file.name, data: arrayBufferToBase64(buffer), orientation: state.orientation }; loadStlBuffer(buffer); document.querySelector('#model-name').textContent = file.name; setStatus(t('blankLoaded'));
  } catch (error) { setStatus(t('stlOpenFail', { message: error.message }), true); }
}

function loadStlBuffer(buffer) {
  const geometry = new STLLoader().parse(buffer); if (!geometry?.getAttribute('position')?.count) throw new Error(t('stlEmpty'));
  geometry.rotateX(state.orientation.x || 0); geometry.rotateY(state.orientation.y || 0); geometry.rotateZ(state.orientation.z || 0);
  geometry.computeVertexNormals(); geometry.computeBoundingBox(); const box = geometry.boundingBox;
  state.bounds = { min: { x: box.min.x, y: box.min.y, z: box.min.z }, max: { x: box.max.x, y: box.max.y, z: box.max.z } };
  const width = box.max.x - box.min.x, height = box.max.y - box.min.y;
  state.margins.left = Math.min(state.margins.left, Math.max(0, width - state.margins.right - 1));
  state.margins.right = Math.min(state.margins.right, Math.max(0, width - state.margins.left - 1));
  state.margins.top = Math.min(state.margins.top, Math.max(0, height - state.margins.bottom - 1));
  state.margins.bottom = Math.min(state.margins.bottom, Math.max(0, height - state.margins.top - 1));
  state.frame = frameFromBounds(state.bounds, state.margins); state.frameSelected = true; const mesh = new THREE.Mesh(geometry); scene.setBaseMesh(mesh); topView.setGeometry(geometry); state.finalMesh = null;
}

function reloadOrientedModel() { if (!state.modelFile?.data) return setStatus(t('loadStlFirst'), true); try { loadStlBuffer(base64ToArrayBuffer(state.modelFile.data)); state.modelFile.orientation = { ...state.orientation }; setStatus(t('orientationUpdated')); scheduleRender(); } catch (error) { setStatus(t('rotateFail', { message: error.message }), true); } }
function rotateModel(axis, degrees) { if (!state.modelFile) return setStatus(t('loadStlFirst'), true); state.orientation[axis] += THREE.MathUtils.degToRad(degrees); reloadOrientedModel(); }
function autoFlatten() { if (!state.modelFile?.data) return setStatus(t('loadStlFirst'), true); try { const raw = new STLLoader().parse(base64ToArrayBuffer(state.modelFile.data)); raw.computeBoundingBox(); const size = raw.boundingBox.getSize(new THREE.Vector3()); const min = size.x <= size.y && size.x <= size.z ? 'x' : size.y <= size.z ? 'y' : 'z'; state.orientation = { x: min === 'y' ? Math.PI / 2 : 0, y: min === 'x' ? Math.PI / 2 : 0, z: 0 }; reloadOrientedModel(); setStatus(t('autoOrient', { axis: min.toUpperCase() })); } catch (error) { setStatus(t('autoOrientFail', { message: error.message }), true); } }

function scheduleRender() { if (renderQueued) return; renderQueued = true; requestAnimationFrame(() => { renderQueued = false; render(); }); }

function render() {
  writeMm(document.querySelector('#tolerance'), state.tolerance);
  writeMm(document.querySelector('#target-width'), state.targetFrame.width);
  writeMm(document.querySelector('#target-height'), state.targetFrame.height);
  for (const key of Object.keys(state.margins)) writeMm(document.querySelector(`[data-margin="${key}"]`), state.margins[key]);
  if (!state.modelFile) document.querySelector('#model-name').textContent = t('modelNone');
  renderFrameSize();
  if (!isEditingInside('#shape-list')) renderShapeList();
  if (!isEditingInside('#shape-editor')) renderShapeEditor();
  if (!isEditingInside('#ports-table')) renderPorts();
  topView.draw();
  renderPortGuides();
}

function renderPortGuides() {
  if (!scene.baseMesh || !state.frame) { scene.clearGuides(); scene.clearFrameGuide(); return; }
  const box = new THREE.Box3().setFromObject(scene.baseMesh);
  const f = state.frame;
  const thickness = Math.min(.8, Math.max(.25, Math.min(f.right - f.left, f.top - f.bottom) / 35));
  const z = box.max.z + .025;
  const visualHeight = .05;
  const bar = (width, depth, x, y) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, depth, visualHeight), scene.frameMaterial); mesh.position.set(x, y, z); return mesh; };
  scene.setFrameGuide([bar(f.right - f.left, thickness, (f.left + f.right) / 2, f.top - thickness / 2), bar(f.right - f.left, thickness, (f.left + f.right) / 2, f.bottom + thickness / 2), bar(thickness, f.top - f.bottom, f.left + thickness / 2, (f.top + f.bottom) / 2), bar(thickness, f.top - f.bottom, f.right - thickness / 2, (f.top + f.bottom) / 2)]);
  const shapes = new Map(state.shapes.map(s => [s.id, s]));
  const guides = [];
  for (const port of state.ports) {
    const shape = shapes.get(port.shapeId);
    if (!shape) continue;
    const xy = portWorldPosition(f, port);
    guides.push(...bezelPreviewMeshes(shape, { x: xy.x, y: xy.y }, box.max.z, port.tolerance ?? state.tolerance, scene.guideMaterial));
  }
  scene.setPortGuides(guides);
}

function renderFrameSize() {
  const el = document.querySelector('#frame-size');
  if (!state.frame) { el.textContent = t('noFrameYet'); return; }
  const frameW = state.frame.right - state.frame.left;
  const frameH = state.frame.top - state.frame.bottom;
  if (!state.bounds) { el.textContent = t('frameSizeOnly', { w: formatMm(frameW), h: formatMm(frameH) }); return; }
  const modelW = state.bounds.max.x - state.bounds.min.x;
  const modelH = state.bounds.max.y - state.bounds.min.y;
  el.textContent = t('frameSizeFull', { mw: formatMm(modelW), mh: formatMm(modelH), fw: formatMm(frameW), fh: formatMm(frameH), ml: formatMm(state.margins.left), mr: formatMm(state.margins.right), mt: formatMm(state.margins.top), mb: formatMm(state.margins.bottom) });
}

function autoFitFrame() {
  if (!state.bounds) return setStatus(t('loadStlFirst'), true);
  const width = Math.max(1, state.targetFrame.width);
  const height = Math.max(1, state.targetFrame.height);
  const fit = centeredMarginsForSize(state.bounds, width, height);
  if (!fit.fits) {
    return setStatus(t('modelTooSmall', { mw: formatMm(fit.modelW), mh: formatMm(fit.modelH), w: formatMm(width), h: formatMm(height) }), true);
  }
  state.margins = fit.margins;
  state.frame = frameFromBounds(state.bounds, state.margins);
  state.frameSelected = true;
  scheduleRender();
  setStatus(t('frameCentered', { w: formatMm(width), h: formatMm(height), lr: formatMm(state.margins.left), tb: formatMm(state.margins.top) }));
}

function setMargin(key, value) {
  value = Math.max(0, value);
  if (!state.bounds) { state.margins[key] = value; return; }
  const b = state.bounds; const horizontal = key === 'left' || key === 'right'; const span = horizontal ? b.max.x - b.min.x : b.max.y - b.min.y; const opposite = key === 'left' ? 'right' : key === 'right' ? 'left' : key === 'top' ? 'bottom' : 'top';
  state.margins[key] = Math.min(value, Math.max(0, span - state.margins[opposite] - 1)); state.frame = frameFromBounds(b, state.margins);
}

function renderShapeList() {
  const host = document.querySelector('#shape-list'); host.innerHTML = state.shapes.map(s => `<button class="shape-chip ${s.id === state.selectedShape ? 'selected' : ''}" data-shape="${s.id}"><span>${escapeHtml(s.name)}</span><small>${describeShape(s)}</small></button>`).join('');
  host.querySelectorAll('[data-shape]').forEach(b => b.addEventListener('click', () => { state.selectedShape = b.dataset.shape; state.selectedEditorShape = b.dataset.shape; scheduleRender(); }));
}

function renderShapeEditor() {
  const host = document.querySelector('#shape-editor'); const shape = state.shapes.find(s => s.id === state.selectedEditorShape); if (!shape) return;
  host.innerHTML = `<div class="editor-top"><label>${t('shapeName')}<input data-shape-field="name" value="${escapeAttr(shape.name)}"></label><label>${t('bezelHeight')}<input data-shape-field="bezelHeight" type="text" inputmode="decimal" autocomplete="off" value="${formatMm(shape.bezelHeight)}"></label><label>${t('bezelWidth')}<input data-shape-field="bezelWidth" type="text" inputmode="decimal" autocomplete="off" value="${formatMm(shape.bezelWidth)}"></label></div>
    <div class="sketch-area"><svg id="shape-sketch" viewBox="-30 -25 60 50">${shape.primitives.map((p, i) => primitiveSvg(p, i)).join('')}</svg><div class="sketch-actions"><button data-sketch="rect">${t('drawRect')}</button><button data-sketch="circle">${t('drawCircle')}</button></div></div>
    <div class="primitive-list">${shape.primitives.map((p, i) => primitiveFields(p, i)).join('')}</div><div class="actions"><button id="add-polyline">${t('addPolyline')}</button><button id="delete-shape" class="danger">${t('deleteShape')}</button></div>`;
  host.querySelector('[data-shape-field="name"]').addEventListener('input', el => { shape.name = el.target.value; saveShapes(state.shapes); renderShapeList(); });
  host.querySelectorAll('[data-shape-field="bezelHeight"], [data-shape-field="bezelWidth"]').forEach(el => {
    bindMmInput(el, { min: 0.0001, apply: value => { shape[el.dataset.shapeField] = value; saveShapes(state.shapes); } });
    el.addEventListener('mm-commit', refreshViews);
  });
  host.querySelectorAll('[data-primitive]').forEach(el => {
    if (el.dataset.primitive.endsWith(':points')) el.addEventListener('change', () => updatePrimitive(shape, el));
    else {
      const field = el.dataset.primitive.split(':')[1];
      bindMmInput(el, { min: field === 'radius' ? 0 : field === 'width' || field === 'height' ? 0.0001 : undefined, apply: value => { updatePrimitiveValue(shape, el, value); } });
      el.addEventListener('mm-commit', refreshViews);
    }
  });
  host.querySelectorAll('[data-remove-primitive]').forEach(el => el.addEventListener('click', () => { if (shape.primitives.length > 1) { shape.primitives.splice(Number(el.dataset.removePrimitive), 1); saveShapes(state.shapes); scheduleRender(); } else setStatus(t('keepOneContour'), true); }));
  host.querySelector('#add-polyline').addEventListener('click', () => { shape.primitives.push({ type: 'polyline', points: [[-5, -3], [5, -3], [5, 3], [-5, 3]] }); saveShapes(state.shapes); scheduleRender(); });
  host.querySelector('#delete-shape').addEventListener('click', () => { if (state.shapes.length === 1) return setStatus(t('keepOneShape'), true); state.shapes = state.shapes.filter(s => s.id !== shape.id); state.ports = state.ports.filter(p => p.shapeId !== shape.id); state.selectedShape = state.shapes[0].id; state.selectedEditorShape = state.selectedShape; saveShapes(state.shapes); scheduleRender(); });
  setupSketch(host.querySelector('#shape-sketch'), shape);
}

function primitiveSvg(p, i) { if (p.type === 'circle') return `<circle data-index="${i}" cx="${p.x}" cy="${-p.y}" r="${p.radius}"/>`; if (p.type === 'rect') return `<rect data-index="${i}" x="${p.x - p.width / 2}" y="${-p.y - p.height / 2}" width="${p.width}" height="${p.height}" rx="${p.radius || 0}"/>`; return `<polygon data-index="${i}" points="${(p.points || []).map(([x, y]) => `${x},${-y}`).join(' ')}"/>`; }
function primitiveFields(p, i) {
  const mm = (field, value) => `<input data-primitive="${i}:${field}" type="text" inputmode="decimal" autocomplete="off" value="${formatMm(value)}">`;
  if (p.type === 'circle') return `<fieldset><legend>${t('circle', { n: i + 1 })}<button data-remove-primitive="${i}" title="${t('remove')}">×</button></legend><label>X${mm('x', p.x)}</label><label>Y${mm('y', p.y)}</label><label>${t('radius')}${mm('radius', p.radius)}</label></fieldset>`;
  if (p.type === 'rect') return `<fieldset><legend>${t('rect', { n: i + 1 })}<button data-remove-primitive="${i}" title="${t('remove')}">×</button></legend><label>X${mm('x', p.x)}</label><label>Y${mm('y', p.y)}</label><label>${t('width')}${mm('width', p.width)}</label><label>${t('height')}${mm('height', p.height)}</label><label>${t('round')}${mm('radius', p.radius || 0)}</label></fieldset>`;
  return `<fieldset><legend>${t('polyline', { n: i + 1 })}<button data-remove-primitive="${i}" title="${t('remove')}">×</button></legend><label class="wide">${t('points')}<span class="mm-wrap"><input data-primitive="${i}:points" value="${(p.points || []).map(v => v.map(formatMm).join(' ')).join('; ')}"><span class="field-error" hidden></span></span></label></fieldset>`;
}

function updatePrimitiveValue(shape, input, value) {
  const [i, field] = input.dataset.primitive.split(':');
  const primitive = shape.primitives[Number(i)];
  primitive[field] = field === 'radius' ? Math.max(0, value) : value;
  saveShapes(state.shapes);
}

function updatePrimitive(shape, input) {
  const [i, field] = input.dataset.primitive.split(':');
  const p = shape.primitives[Number(i)];
  if (field === 'points') {
    const points = input.value.split(';').map(pair => {
      const parts = pair.trim().split(/[\s/]+/).filter(Boolean).map(part => Number(part.replace(',', '.')));
      return parts.length === 2 && parts.every(Number.isFinite) ? parts : null;
    }).filter(Boolean);
    if (points.length < 3) { setFieldErrorNear(input, t('fieldEmpty')); return; }
    setFieldErrorNear(input, '');
    p.points = points;
  }
  saveShapes(state.shapes);
  scheduleRender();
}

function setFieldErrorNear(input, message) {
  const wrap = input.closest('.mm-wrap') || input.parentElement;
  let error = wrap.querySelector('.field-error');
  if (!error) { error = document.createElement('span'); error.className = 'field-error'; input.insertAdjacentElement('afterend', error); }
  input.classList.toggle('invalid', Boolean(message));
  error.textContent = message || '';
  error.hidden = !message;
}

function setupSketch(svg, shape) { let tool = null; let start = null; svg.parentElement.querySelectorAll('[data-sketch]').forEach(btn => btn.addEventListener('click', () => { tool = btn.dataset.sketch; svg.classList.add('drawing'); })); const point = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  svg.addEventListener('pointerdown', e => { if (!tool) return; start = point(e); svg.setPointerCapture(e.pointerId); }); svg.addEventListener('pointerup', e => { if (!start || !tool) return; const end = point(e); const dx = end.x - start.x, dy = end.y - start.y; if (Math.hypot(dx, dy) > .8) { if (tool === 'rect') shape.primitives.push({ type: 'rect', x: roundMm(start.x + dx / 2), y: roundMm(-(start.y + dy / 2)), width: roundMm(Math.abs(dx)), height: roundMm(Math.abs(dy)), radius: 0 }); else shape.primitives.push({ type: 'circle', x: roundMm(start.x), y: roundMm(-start.y), radius: roundMm(Math.hypot(dx, dy)) }); saveShapes(state.shapes); scheduleRender(); } start = null; tool = null; svg.classList.remove('drawing'); }); }

function renderPorts() {
  const host = document.querySelector('#ports-table'); document.querySelector('#port-count').textContent = `(${state.ports.length})`; const shapes = new Map(state.shapes.map(s => [s.id, s])); const frameWidth = state.frame ? state.frame.right - state.frame.left : 0; const frameSpanY = state.frame ? state.frame.top - state.frame.bottom : 0;
  const mmCell = (attrs, value, placeholder = '') => `<span class="mm-wrap"><input ${attrs} type="text" inputmode="decimal" autocomplete="off" value="${value}" placeholder="${placeholder}"><span class="field-error" hidden></span></span>`;
  host.innerHTML = state.ports.length ? `<table><thead><tr><th>${t('colShape')}</th><th>${t('colLeft')}</th><th>${t('colRight')}</th><th>${t('colTop')}</th><th>${t('colBottom')}</th><th>${t('colTol')}</th><th></th></tr></thead><tbody>${state.ports.map(p => `<tr class="${p.id === state.selectedPort ? 'active' : ''}" data-port-row="${p.id}"><td>${escapeHtml(shapes.get(p.shapeId)?.name || t('deletedShape'))}</td><td>${mmCell(`data-port="${p.id}:x"`, formatMm(p.x))}</td><td>${mmCell(`data-port-edge="${p.id}:right"`, formatMm(frameWidth - p.x))}</td><td>${mmCell(`data-port="${p.id}:y"`, formatMm(p.y))}</td><td>${mmCell(`data-port-edge="${p.id}:bottom"`, formatMm(frameSpanY - p.y))}</td><td>${mmCell(`data-port="${p.id}:tolerance"`, p.tolerance == null ? '' : formatMm(p.tolerance), formatMm(state.tolerance))}</td><td><button data-duplicate="${p.id}" title="${t('duplicate')}">⧉</button><button data-remove-port="${p.id}" class="danger" title="${t('remove')}">×</button></td></tr>`).join('')}</tbody></table>` : `<p class="note">${t('portsEmpty')}</p>`;
  host.querySelectorAll('[data-port]').forEach(el => {
    const [id, key] = el.dataset.port.split(':');
    bindMmInput(el, { optional: key === 'tolerance', apply: value => {
      const port = state.ports.find(p => p.id === id);
      if (!port) return;
      if (key !== 'tolerance' && !Number.isFinite(value)) return;
      port[key] = value;
      const spanX = state.frame ? state.frame.right - state.frame.left : frameWidth;
      const spanY = state.frame ? state.frame.top - state.frame.bottom : frameSpanY;
      if (key === 'x') writeMm(host.querySelector(`[data-port-edge="${id}:right"]`), spanX - value);
      if (key === 'y') writeMm(host.querySelector(`[data-port-edge="${id}:bottom"]`), spanY - value);
    } });
    el.addEventListener('mm-commit', refreshViews);
  });
  host.querySelectorAll('[data-port-edge]').forEach(el => {
    bindMmInput(el, { apply: value => {
      const [id, edge] = el.dataset.portEdge.split(':');
      const port = state.ports.find(p => p.id === id);
      if (!port || !state.frame || !Number.isFinite(value)) return;
      const spanX = state.frame.right - state.frame.left;
      const spanY = state.frame.top - state.frame.bottom;
      if (edge === 'right') { port.x = spanX - value; writeMm(host.querySelector(`[data-port="${id}:x"]`), port.x); }
      else { port.y = spanY - value; writeMm(host.querySelector(`[data-port="${id}:y"]`), port.y); }
    } });
    el.addEventListener('mm-commit', refreshViews);
  });
  host.querySelectorAll('[data-port-row]').forEach(row => row.addEventListener('click', event => { if (event.target.closest('input, button, .mm-wrap')) return; state.selectedPort = row.dataset.portRow; scheduleRender(); }));
  host.querySelectorAll('[data-remove-port]').forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();
    btn.blur();
    state.ports = state.ports.filter(p => p.id !== btn.dataset.removePort);
    if (state.selectedPort === btn.dataset.removePort) state.selectedPort = null;
    scheduleRender();
  }));
  host.querySelectorAll('[data-duplicate]').forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();
    btn.blur();
    const source = state.ports.find(p => p.id === btn.dataset.duplicate);
    state.ports.push({ ...source, id: crypto.randomUUID(), x: source.x + 2, y: source.y + 2 });
    state.selectedPort = state.ports.at(-1).id;
    scheduleRender();
  }));
  renderWarnings(shapes);
}

function refreshViews() {
  renderFrameSize();
  if (!isEditingInside('#shape-list')) renderShapeList();
  topView.draw();
  renderPortGuides();
}

function renderWarnings(shapes) { const warnings = []; if (state.frame) { const f = state.frame; for (let i = 0; i < state.ports.length; i++) { const p = state.ports[i], s = shapes.get(p.shapeId); if (!s) continue; const world = portWorldPosition(f, p), a = footprintAt(s, world.x, world.y, p.tolerance ?? state.tolerance); if (a.minX < f.left || a.maxX > f.right || a.minY < f.bottom || a.maxY > f.top) warnings.push(t('outOfFrame', { name: s.name })); for (let j = 0; j < i; j++) { const q = state.ports[j], other = shapes.get(q.shapeId); if (!other) continue; const wq = portWorldPosition(f, q), b = footprintAt(other, wq.x, wq.y, q.tolerance ?? state.tolerance); if (a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY) warnings.push(t('overlap', { a: s.name, b: other.name })); } } }
  document.querySelector('#warnings').innerHTML = warnings.length ? `<div class="warning">${[...new Set(warnings)].map(escapeHtml).join('<br>')}</div>` : '';
}

async function generate() { if (!scene.baseMesh) return setStatus(t('generateNeedStl'), true); try { setStatus(t('loadingCsg')); document.querySelector('#generate').disabled = true; const { buildFinalShield } = await import('./core/csg/buildShield.js'); const { validateWatertight } = await import('./export/stl.js'); setStatus(t('runningCsg')); await new Promise(requestAnimationFrame); const result = buildFinalShield(scene.baseMesh, state, (i, total) => setStatus(t('csgPort', { i, total }))); scene.setPreview(result); state.finalMesh = result; const validation = validateWatertight(result); document.querySelector('#download-stl').disabled = false; setStatus(validation.valid ? t('generateOk', { n: validation.triangles.toLocaleString(document.documentElement.lang || 'en') }) : t('generateWarn', { n: validation.invalidVertices }), !validation.valid); } catch (error) { console.error(error); setStatus(t('generateFail', { message: error.message }), true); } finally { document.querySelector('#generate').disabled = false; } }

function newShape() { const id = `custom-${crypto.randomUUID().slice(0, 8)}`; state.shapes.push({ id, name: t('newShapeName'), bezelHeight: 1.2, bezelWidth: 1.2, primitives: [{ type: 'rect', x: 0, y: 0, width: 10, height: 5, radius: 0 }] }); state.selectedShape = id; state.selectedEditorShape = id; saveShapes(state.shapes); scheduleRender(); }

function saveProject() { const project = { version: 1, createdAt: new Date().toISOString(), exportName: state.exportName, tolerance: state.tolerance, margins: state.margins, targetFrame: state.targetFrame, shapes: state.shapes, ports: state.ports, model: state.modelFile }; downloadJson(project, exportFilename('json').replace(/\.json$/i, '') + '-project.json'); }
async function loadProject(file) {
  try {
    const p = JSON.parse(await file.text());
    if (!p || !Array.isArray(p.shapes) || !Array.isArray(p.ports)) throw new Error(t('projectBad'));
    state.shapes = p.shapes;
    state.ports = p.ports;
    state.tolerance = safeNumber(p.tolerance, .8);
    state.margins = { ...state.margins, ...p.margins };
    if (p.targetFrame && Number.isFinite(Number(p.targetFrame.width)) && Number.isFinite(Number(p.targetFrame.height))) {
      state.targetFrame = { width: Number(p.targetFrame.width), height: Number(p.targetFrame.height) };
    }
    if (typeof p.exportName === 'string' && p.exportName.trim()) {
      state.exportName = p.exportName;
      document.querySelector('#export-name').value = p.exportName;
    }
    state.modelFile = p.model || null;
    state.orientation = p.model?.orientation || { x: 0, y: 0, z: 0 };
    if (p.model?.data) {
      loadStlBuffer(base64ToArrayBuffer(p.model.data));
      document.querySelector('#model-name').textContent = p.model.name || t('projectModel');
    }
    saveShapes(state.shapes);
    state.selectedShape = state.shapes[0]?.id || null;
    state.selectedEditorShape = state.selectedShape;
    scheduleRender();
    setStatus(t('projectRestored'));
  } catch (error) { setStatus(t('projectFail', { message: error.message }), true); }
}

function setStatus(message, error = false) { const el = document.querySelector('#status'); el.textContent = message; el.classList.toggle('error', error); }
function exportFilename(ext) {
  const raw = String(state.exportName || '').trim() || 'io-shield';
  const stem = raw.replace(/[\\/:*?"<>|]+/g, '-').replace(/\.+$/g, '').replace(/\.(stl|json)$/i, '') || 'io-shield';
  return `${stem}.${ext}`;
}
function describeShape(shape) { const b = shapeBounds(shape); return `${formatMm(b.maxX - b.minX)} × ${formatMm(b.maxY - b.minY)} мм`; }
function safeNumber(value, fallback = 0) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
function escapeAttr(value) { return escapeHtml(value); }
function arrayBufferToBase64(buffer) { let binary = ''; const bytes = new Uint8Array(buffer); const chunk = 0x8000; for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk)); return btoa(binary); }
function base64ToArrayBuffer(base64) { const binary = atob(base64); const bytes = new Uint8Array(binary.length); for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i); return bytes.buffer; }
