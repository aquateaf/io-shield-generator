import { frameFromBounds, marginsFromFrame, portWorldPosition } from '../core/positioning.js';
import { footprintAt } from '../core/geometry/portGeometry.js';

const HANDLE = 9;

export class TopView {
  constructor(canvas, state, change, notify) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.state = state; this.change = change; this.notify = notify;
    this.drag = null; this.geometry = null; this.snapshot = null; this.snapshotKey = ''; this.hover = null;
    canvas.addEventListener('pointerdown', e => this.down(e));
    canvas.addEventListener('pointermove', e => this.move(e));
    canvas.addEventListener('pointerup', e => this.up(e));
    canvas.addEventListener('pointerleave', e => { this.hover = null; this.up(e); this.canvas.style.cursor = 'default'; });
    new ResizeObserver(() => this.draw()).observe(canvas.parentElement);
  }
  setGeometry(geometry) { this.geometry = geometry; this.snapshot = null; this.snapshotKey = ''; this.draw(); }
  beginFrameSelection() {
    if (!this.state.bounds) return this.notify('Сначала загрузите STL.');
    this.state.selectingFrame = true;
    this.state.frameSelected = true;
    this.canvas.classList.add('selecting-frame');
    this.notify('Протяните прямоугольник по снимку модели — это будет рамка шилда.');
    this.draw();
  }
  bounds() { return this.state.bounds; }
  metrics() {
    const b = this.bounds(); const w = this.canvas.clientWidth; const h = this.canvas.clientHeight; const pad = 36;
    const scale = Math.min((w - pad * 2) / Math.max(1, b.max.x - b.min.x), (h - pad * 2) / Math.max(1, b.max.y - b.min.y));
    return { scale, ox: (w - (b.max.x - b.min.x) * scale) / 2 - b.min.x * scale, oy: (h - (b.max.y - b.min.y) * scale) / 2 + b.max.y * scale };
  }
  screen({ x, y }) { const m = this.metrics(); return { x: m.ox + x * m.scale, y: m.oy - y * m.scale }; }
  world(event) { const r = this.canvas.getBoundingClientRect(); const m = this.metrics(); return { x: (event.clientX - r.left - m.ox) / m.scale, y: -(event.clientY - r.top - m.oy) / m.scale }; }
  frame() { const b = this.bounds(); return this.state.frame || frameFromBounds(b, this.state.margins); }
  handles(f) {
    const mx = (f.left + f.right) / 2, my = (f.top + f.bottom) / 2;
    return [
      { key: 'nw', x: f.left, y: f.top, edges: ['left', 'top'], cursor: 'nwse-resize' },
      { key: 'n', x: mx, y: f.top, edges: ['top'], cursor: 'ns-resize' },
      { key: 'ne', x: f.right, y: f.top, edges: ['right', 'top'], cursor: 'nesw-resize' },
      { key: 'e', x: f.right, y: my, edges: ['right'], cursor: 'ew-resize' },
      { key: 'se', x: f.right, y: f.bottom, edges: ['right', 'bottom'], cursor: 'nwse-resize' },
      { key: 's', x: mx, y: f.bottom, edges: ['bottom'], cursor: 'ns-resize' },
      { key: 'sw', x: f.left, y: f.bottom, edges: ['left', 'bottom'], cursor: 'nesw-resize' },
      { key: 'w', x: f.left, y: my, edges: ['left'], cursor: 'ew-resize' }
    ];
  }
  hitHandle(p, f) {
    const px = HANDLE / this.metrics().scale;
    for (const handle of this.handles(f)) {
      if (Math.abs(p.x - handle.x) <= px && Math.abs(p.y - handle.y) <= px) return handle;
    }
    return null;
  }
  hitEdge(p, f) {
    const threshold = 8 / this.metrics().scale;
    const edges = [
      { key: 'left', dist: Math.abs(p.x - f.left), cursor: 'ew-resize', edges: ['left'] },
      { key: 'right', dist: Math.abs(p.x - f.right), cursor: 'ew-resize', edges: ['right'] },
      { key: 'top', dist: Math.abs(p.y - f.top), cursor: 'ns-resize', edges: ['top'] },
      { key: 'bottom', dist: Math.abs(p.y - f.bottom), cursor: 'ns-resize', edges: ['bottom'] }
    ].sort((a, b) => a.dist - b.dist);
    const inside = p.x >= f.left - threshold && p.x <= f.right + threshold && p.y >= f.bottom - threshold && p.y <= f.top + threshold;
    return inside && edges[0].dist < threshold ? edges[0] : null;
  }
  draw() {
    const c = this.canvas; const ratio = devicePixelRatio; const w = c.clientWidth; const h = c.clientHeight; if (!w || !h) return;
    c.width = w * ratio; c.height = h * ratio; this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0); const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#0a1020'; ctx.fillRect(0, 0, w, h);
    if (!this.state.bounds) { ctx.fillStyle = '#9aaccc'; ctx.font = '14px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Загрузите STL, чтобы увидеть вид сверху', w / 2, h / 2); return; }
    const b = this.bounds(); this.drawSnapshot(ctx, w, h);
    const a = this.screen({ x: b.min.x, y: b.max.y }); const d = this.screen({ x: b.max.x, y: b.min.y });
    ctx.strokeStyle = '#7f99bf'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.strokeRect(a.x, a.y, d.x - a.x, d.y - a.y); ctx.setLineDash([]);
    const f = this.frame(); const fa = this.screen({ x: f.left, y: f.top }); const fd = this.screen({ x: f.right, y: f.bottom });
    const fw = fd.x - fa.x, fh = fd.y - fa.y;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.rect(fa.x, fa.y, fw, fh); ctx.fillStyle = 'rgba(6, 10, 18, .55)'; ctx.fill('evenodd');
    ctx.restore();
    const selected = this.state.frameSelected || this.state.selectingFrame;
    ctx.fillStyle = selected ? 'rgba(57, 210, 180, .16)' : 'rgba(57, 210, 180, .08)';
    ctx.fillRect(fa.x, fa.y, fw, fh);
    ctx.strokeStyle = selected ? '#5cffd4' : '#38d5b0';
    ctx.lineWidth = selected ? 3 : 2;
    ctx.shadowColor = selected ? 'rgba(56, 213, 176, .85)' : 'transparent';
    ctx.shadowBlur = selected ? 10 : 0;
    ctx.strokeRect(fa.x, fa.y, fw, fh);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#d8faef'; ctx.font = '12px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('Рамка шилда  (0, 0)', fa.x + 8, fa.y - 10);
    const size = `${(f.right - f.left).toFixed(1)} × ${(f.top - f.bottom).toFixed(1)} мм`;
    ctx.textAlign = 'right'; ctx.fillText(size, fd.x - 6, fd.y + 16);
    for (const handle of this.handles(f)) {
      const s = this.screen(handle);
      ctx.fillStyle = selected || this.hover?.key === handle.key ? '#e8fff8' : '#7ff0d0';
      ctx.strokeStyle = '#0b3d34';
      ctx.lineWidth = 1.5;
      ctx.fillRect(s.x - HANDLE / 2, s.y - HANDLE / 2, HANDLE, HANDLE);
      ctx.strokeRect(s.x - HANDLE / 2, s.y - HANDLE / 2, HANDLE, HANDLE);
    }
    const shapes = new Map(this.state.shapes.map(s => [s.id, s]));
    for (const port of this.state.ports) {
      const shape = shapes.get(port.shapeId); if (!shape) continue;
      if (!Number.isFinite(Number(port.x)) || !Number.isFinite(Number(port.y))) continue;
      const p = portWorldPosition(f, port); const box = footprintAt(shape, p.x, p.y, port.tolerance ?? this.state.tolerance);
      const pa = this.screen({ x: box.minX, y: box.maxY }); const pd = this.screen({ x: box.maxX, y: box.minY });
      ctx.fillStyle = port.id === this.state.selectedPort ? 'rgba(255, 197, 66, .56)' : 'rgba(69, 143, 255, .45)';
      ctx.strokeStyle = port.id === this.state.selectedPort ? '#ffd166' : '#77adff';
      ctx.lineWidth = port.id === this.state.selectedPort ? 2.5 : 1.5;
      ctx.fillRect(pa.x, pa.y, pd.x - pa.x, pd.y - pa.y); ctx.strokeRect(pa.x, pa.y, pd.x - pa.x, pd.y - pa.y);
    }
    if (this.state.selectingFrame && this.selectStart && this.selectionPreview) {
      const start = this.screen(this.selectStart), end = this.screen(this.selectionPreview);
      ctx.fillStyle = 'rgba(255, 209, 102, .16)'; ctx.strokeStyle = '#ffd166'; ctx.setLineDash([5, 4]);
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      ctx.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
      ctx.setLineDash([]);
    }
  }
  drawSnapshot(ctx, w, h) {
    const b = this.bounds(); const key = `${w}x${h}:${this.geometry?.uuid}:${b.min.x},${b.min.y},${b.max.x},${b.max.y}`;
    if (key !== this.snapshotKey) {
      this.snapshotKey = key; const image = document.createElement('canvas'); image.width = w; image.height = h; const ic = image.getContext('2d'); ic.fillStyle = '#344a69';
      if (this.geometry) {
        const p = this.geometry.getAttribute('position'); const zSpan = Math.max(.001, b.max.z - b.min.z);
        for (let i = 0; i < p.count; i += 3) {
          const av = this.screen({ x: p.getX(i), y: p.getY(i) }), bv = this.screen({ x: p.getX(i + 1), y: p.getY(i + 1) }), cv = this.screen({ x: p.getX(i + 2), y: p.getY(i + 2) });
          const z = ((p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3 - b.min.z) / zSpan;
          ic.fillStyle = `rgb(${38 + Math.round(z * 35)}, ${61 + Math.round(z * 45)}, ${91 + Math.round(z * 58)})`;
          ic.beginPath(); ic.moveTo(av.x, av.y); ic.lineTo(bv.x, bv.y); ic.lineTo(cv.x, cv.y); ic.closePath(); ic.fill();
        }
      } else {
        const a = this.screen({ x: b.min.x, y: b.max.y }), d = this.screen({ x: b.max.x, y: b.min.y });
        ic.fillRect(a.x, a.y, d.x - a.x, d.y - a.y);
      }
      this.snapshot = image;
    }
    ctx.drawImage(this.snapshot, 0, 0, w, h);
  }
  down(event) {
    if (!this.state.bounds) return; const p = this.world(event);
    if (this.state.selectingFrame) { this.selectStart = p; this.selectionPreview = p; this.canvas.setPointerCapture(event.pointerId); return; }
    const f = this.frame();
    const handle = this.hitHandle(p, f) || this.hitEdge(p, f);
    if (handle) {
      this.drag = handle.edges;
      this.state.frameSelected = true;
      this.state.selectedPort = null;
      this.canvas.setPointerCapture(event.pointerId);
      this.change();
      return;
    }
    const shapes = new Map(this.state.shapes.map(s => [s.id, s]));
    for (const port of [...this.state.ports].reverse()) {
      const s = shapes.get(port.shapeId); const wp = portWorldPosition(f, port);
      const box = footprintAt(s, wp.x, wp.y, port.tolerance ?? this.state.tolerance);
      if (p.x >= box.minX && p.x <= box.maxX && p.y >= box.minY && p.y <= box.maxY) {
        this.state.selectedPort = port.id; this.state.frameSelected = false; this.change(); return;
      }
    }
    if (!this.state.selectedShape) return this.notify('Выберите форму из библиотеки для размещения.');
    if (p.x < f.left || p.x > f.right || p.y > f.top || p.y < f.bottom) {
      this.state.frameSelected = true;
      this.notify('Клик внутри рамки ставит порт. За край рамки можно потянуть, снаружи — выделить рамку.');
      this.change();
      return;
    }
    this.state.frameSelected = false;
    this.state.ports.push({ id: crypto.randomUUID(), shapeId: this.state.selectedShape, x: +(p.x - f.left).toFixed(2), y: +(f.top - p.y).toFixed(2), tolerance: null });
    this.state.selectedPort = this.state.ports.at(-1).id;
    this.draw();
    this.change();
  }
  move(event) {
    if (!this.state.bounds) return; const p = this.world(event); const f = this.frame();
    if (this.state.selectingFrame && this.selectStart) { this.selectionPreview = p; this.draw(); return; }
    if (!this.drag) {
      const handle = this.hitHandle(p, f) || this.hitEdge(p, f);
      const nextKey = handle?.key || null;
      const prevKey = this.hover?.key || null;
      this.hover = handle;
      this.canvas.style.cursor = this.state.selectingFrame ? 'crosshair' : handle?.cursor || 'crosshair';
      if (nextKey !== prevKey) this.draw();
      return;
    }
    const b = this.bounds(); const next = { ...f };
    if (this.drag.includes('left')) next.left = Math.max(b.min.x, Math.min(p.x, next.right - 1));
    if (this.drag.includes('right')) next.right = Math.min(b.max.x, Math.max(p.x, next.left + 1));
    if (this.drag.includes('top')) next.top = Math.min(b.max.y, Math.max(p.y, next.bottom + 1));
    if (this.drag.includes('bottom')) next.bottom = Math.max(b.min.y, Math.min(p.y, next.top - 1));
    this.state.frame = next; this.state.margins = marginsFromFrame(b, next); this.change();
  }
  up() {
    this.canvas.classList.remove('selecting-frame');
    if (this.state.selectingFrame && this.selectStart && this.selectionPreview) {
      const b = this.bounds();
      const x1 = Math.max(b.min.x, Math.min(this.selectStart.x, this.selectionPreview.x));
      const x2 = Math.min(b.max.x, Math.max(this.selectStart.x, this.selectionPreview.x));
      const y1 = Math.max(b.min.y, Math.min(this.selectStart.y, this.selectionPreview.y));
      const y2 = Math.min(b.max.y, Math.max(this.selectStart.y, this.selectionPreview.y));
      if (x2 - x1 >= 1 && y2 - y1 >= 1) {
        this.state.frame = { left: x1, right: x2, top: y2, bottom: y1 };
        this.state.margins = marginsFromFrame(b, this.state.frame);
        this.state.frameSelected = true;
        this.notify('Рамка шилда выделена. Углы и стороны можно подвинуть мышью.');
      }
      this.state.selectingFrame = false; this.selectStart = null; this.selectionPreview = null; this.change();
    }
    this.drag = null;
  }
}
