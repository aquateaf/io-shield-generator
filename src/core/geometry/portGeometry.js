import * as THREE from 'three';

const SEGMENTS = 20;

export function shapeBounds(shape) {
  let bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  for (const p of shape.primitives) {
    if (p.type === 'circle') add(p.x - p.radius, p.x + p.radius, p.y - p.radius, p.y + p.radius);
    if (p.type === 'rect') add(p.x - p.width / 2, p.x + p.width / 2, p.y - p.height / 2, p.y + p.height / 2);
    if (p.type === 'polyline' && p.points?.length > 2) p.points.forEach(([x, y]) => add(x, x, y, y));
  }
  function add(minX, maxX, minY, maxY) {
    bounds.minX = Math.min(bounds.minX, minX); bounds.maxX = Math.max(bounds.maxX, maxX);
    bounds.minY = Math.min(bounds.minY, minY); bounds.maxY = Math.max(bounds.maxY, maxY);
  }
  return bounds;
}

export function primitiveShape(primitive, tolerance = 0) {
  const shape = new THREE.Shape();
  if (primitive.type === 'circle') {
    shape.absarc(primitive.x, primitive.y, Math.max(0.05, primitive.radius + tolerance), 0, Math.PI * 2);
  } else if (primitive.type === 'rect') {
    const w = Math.max(0.05, primitive.width + tolerance * 2);
    const h = Math.max(0.05, primitive.height + tolerance * 2);
    const r = Math.min(Math.max(0, primitive.radius || 0) + tolerance, w / 2, h / 2);
    roundedRect(shape, primitive.x - w / 2, primitive.y - h / 2, w, h, r);
  } else if (primitive.type === 'polyline') {
    const points = primitive.points || [];
    if (points.length < 3) throw new Error('Полилиния должна иметь хотя бы три точки.');
    shape.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
    shape.closePath();
  } else throw new Error('Неизвестный примитив.');
  return shape;
}

function roundedRect(shape, x, y, w, h, r) {
  if (r < 0.001) { shape.moveTo(x, y); shape.lineTo(x + w, y); shape.lineTo(x + w, y + h); shape.lineTo(x, y + h); shape.closePath(); return; }
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y); shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r); shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h); shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y); shape.closePath();
}

export function portPrimitiveMeshes(shape, position, tolerance, depth, material) {
  return shape.primitives.map((primitive) => {
    const geometry = new THREE.ExtrudeGeometry(primitiveShape(primitive, tolerance), { depth, bevelEnabled: false, curveSegments: SEGMENTS });
    geometry.translate(position.x, position.y, position.z);
    return new THREE.Mesh(geometry, material);
  });
}

export function bezelMeshes(shape, position, baseZ, material, holeTolerance = 0) {
  const outerTolerance = Math.max(0.25, shape.bezelWidth || 1);
  const height = Math.max(0.1, shape.bezelHeight || 1);
  return shape.primitives.flatMap((primitive) => {
    // The ring overlaps the shield by 0.2 mm. Coplanar-only contact produces an
    // unreliable union, especially in imported STL meshes.
    const ringShape = primitiveShape(primitive, outerTolerance + holeTolerance);
    ringShape.holes.push(primitiveShape(primitive, holeTolerance));
    const outer = new THREE.ExtrudeGeometry(ringShape, { depth: height + 0.2, bevelEnabled: false, curveSegments: SEGMENTS });
    outer.translate(position.x, position.y, baseZ - 0.2);
    return [{ outer: new THREE.Mesh(outer, material), inner: null }];
  });
}

// Lightweight visual-only rings for the interactive viewport. Unlike the CSG path,
// this creates no booleans, so a changed coordinate is visible immediately.
export function bezelPreviewMeshes(shape, position, baseZ, holeTolerance, material) {
  const outerTolerance = Math.max(0.25, shape.bezelWidth || 1) + holeTolerance;
  const height = Math.max(0.1, shape.bezelHeight || 1);
  return shape.primitives.map((primitive) => {
    const outer = primitiveShape(primitive, outerTolerance);
    outer.holes.push(primitiveShape(primitive, holeTolerance));
    const geometry = new THREE.ExtrudeGeometry(outer, { depth: height, bevelEnabled: false, curveSegments: SEGMENTS });
    geometry.translate(position.x, position.y, baseZ);
    return new THREE.Mesh(geometry, material);
  });
}

export function footprintAt(shape, x, y, tolerance = 0) {
  const b = shapeBounds(shape);
  return { minX: x + b.minX - tolerance, maxX: x + b.maxX + tolerance, minY: y + b.minY - tolerance, maxY: y + b.maxY + tolerance };
}
