import { DEFAULT_SHAPES } from './defaults.js';

const KEY = 'io-shield-generator.shapes.v1';
const clone = value => JSON.parse(JSON.stringify(value));

export function loadShapes() {
  const defaults = clone(DEFAULT_SHAPES);
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(stored) && stored.length) {
      const valid = stored.filter(isShape);
      const byId = new Map(valid.map(shape => [shape.id, shape]));
      for (const shape of defaults) {
        if (!byId.has(shape.id)) byId.set(shape.id, shape);
      }
      const defaultIds = new Set(defaults.map(shape => shape.id));
      const merged = [
        ...defaults.map(shape => byId.get(shape.id)),
        ...valid.filter(shape => !defaultIds.has(shape.id))
      ];
      localStorage.setItem(KEY, JSON.stringify(merged));
      return merged;
    }
  } catch { /* restore defaults */ }
  localStorage.setItem(KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveShapes(shapes) {
  localStorage.setItem(KEY, JSON.stringify(shapes));
}

export function exportLibrary(shapes) {
  downloadJson({ version: 1, shapes }, 'io-shield-library.json');
}

export function downloadJson(data, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const anchor = Object.assign(document.createElement('a'), { href: url, download: filename });
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importLibrary(file) {
  const parsed = JSON.parse(await file.text());
  const shapes = Array.isArray(parsed) ? parsed : parsed.shapes;
  if (!Array.isArray(shapes) || !shapes.every(isShape)) throw new Error('Файл библиотеки не содержит допустимых форм.');
  return shapes;
}

export function isShape(shape) {
  return shape && typeof shape.id === 'string' && typeof shape.name === 'string' &&
    Array.isArray(shape.primitives) && shape.primitives.length > 0 &&
    shape.primitives.every(p => ['rect', 'circle', 'polyline'].includes(p.type));
}
