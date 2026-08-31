import * as THREE from 'three';
import { ADDITION, Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { portPrimitiveMeshes } from '../geometry/portGeometry.js';
import { portWorldPosition } from '../positioning.js';

// three-bvh-csg uses BVH acceleration and is substantially more suitable here than
// polygon-splitting CSG: all boolean work runs locally and is invoked only on demand.
const material = new THREE.MeshStandardMaterial({ color: 0x2c6bed, roughness: 0.55, metalness: 0.2 });

function ensureCsgAttributes(geometry) {
  geometry.clearGroups();
  const position = geometry.getAttribute('position');
  if (!position) throw new Error('Геометрия без координат.');
  const normal = geometry.getAttribute('normal');
  if (!normal || normal.count !== position.count) geometry.computeVertexNormals();
  const uv = geometry.getAttribute('uv');
  if (!uv || uv.count !== position.count) {
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(position.count * 2), 2));
  }
  return geometry;
}

function brushFrom(mesh) {
  mesh.updateMatrixWorld(true);
  const geometry = ensureCsgAttributes(mergeVertices(mesh.geometry.clone(), 1e-4));
  const brush = new Brush(geometry, mesh.material);
  brush.applyMatrix4(mesh.matrixWorld);
  brush.updateMatrixWorld(true);
  return brush;
}

function combineBrushes(evaluator, brushes) {
  let result = brushes[0];
  for (let i = 1; i < brushes.length; i++) result = evaluator.evaluate(result, brushes[i], ADDITION);
  return result;
}

export function buildFinalShield(baseMesh, state, onProgress = () => {}) {
  if (!baseMesh) throw new Error('Сначала загрузите STL-заготовку.');
  const evaluator = new Evaluator();
  evaluator.useGroups = false;
  evaluator.useCDTClipping = true;
  evaluator.attributes = ['position', 'normal', 'uv'];
  let result = brushFrom(baseMesh);
  const zBox = new THREE.Box3().setFromObject(baseMesh);
  const depth = Math.max(8, zBox.max.z - zBox.min.z + 4);
  const frame = state.frame;
  const shapeById = new Map(state.shapes.map(s => [s.id, s]));

  for (let index = 0; index < state.ports.length; index++) {
    const port = state.ports[index];
    const shape = shapeById.get(port.shapeId);
    if (!shape) continue;
    const xy = portWorldPosition(frame, port);
    const tolerance = port.tolerance ?? state.tolerance;
    const cutters = portPrimitiveMeshes(shape, { ...xy, z: zBox.min.z - 2 }, tolerance, depth, material);
    const cutterBrush = combineBrushes(evaluator, cutters.map(brushFrom));
    result = evaluator.evaluate(result, cutterBrush, SUBTRACTION);
    cutters.forEach(mesh => mesh.geometry.dispose());
    onProgress(index + 1, state.ports.length);
  }
  result.geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(result.geometry, material);
  mesh.name = 'io-shield-final';
  return mesh;
}
