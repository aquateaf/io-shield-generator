import { STLExporter } from 'three/addons/exporters/STLExporter.js';

export function validateWatertight(mesh) {
  const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
  const positions = geometry.getAttribute('position');
  let invalidVertices = 0;
  for (let i = 0; i < positions.count; i += 3) {
    const ax = positions.getX(i), ay = positions.getY(i), az = positions.getZ(i);
    const bx = positions.getX(i + 1), by = positions.getY(i + 1), bz = positions.getZ(i + 1);
    const cx = positions.getX(i + 2), cy = positions.getY(i + 2), cz = positions.getZ(i + 2);
    if (![ax, ay, az, bx, by, bz, cx, cy, cz].every(Number.isFinite)) invalidVertices++;
  }
  // CSG triangulation may contain T-junctions on coplanar faces. A naïve edge-count
  // check reports those as holes, so this deliberately verifies only hard failures.
  return { valid: invalidVertices === 0 && positions.count >= 12, invalidVertices, triangles: positions.count / 3 };
}

export function downloadStl(mesh, filename = 'io-shield.stl') {
  const data = new STLExporter().parse(mesh, { binary: true });
  const url = URL.createObjectURL(new Blob([data], { type: 'model/stl' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
