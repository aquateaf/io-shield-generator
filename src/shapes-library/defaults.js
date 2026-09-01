const rect = (width, height, radius = 0, x = 0, y = 0) => ({ type: 'rect', x, y, width, height, radius });
const circle = (radius, x = 0, y = 0) => ({ type: 'circle', x, y, radius });
const screws = (spacing, radius = 1.6) => [circle(radius, -spacing / 2, 0), circle(radius, spacing / 2, 0)];

// Nominal ATX I/O openings in mm. Verify against the particular connector before printing.
export const DEFAULT_SHAPES = [
  { id: 'usb-a', name: 'USB-A', bezelHeight: 1.2, bezelWidth: 1.2, primitives: [rect(14.0, 6.7, 0.55)] },
  { id: 'usb-a-3', name: 'USB 3.0 Type-A', bezelHeight: 1.2, bezelWidth: 1.2, primitives: [rect(14.5, 7.2, 0.55)] },
  { id: 'usb-a-dual', name: 'USB-A ×2 (stacked)', bezelHeight: 1.3, bezelWidth: 1.2, primitives: [rect(14.5, 15.8, 0.55)] },
  { id: 'usb-c', name: 'USB Type-C', bezelHeight: 1.2, bezelWidth: 1.1, primitives: [rect(9.2, 3.4, 1.35)] },
  { id: 'thunderbolt', name: 'Thunderbolt / USB4', bezelHeight: 1.2, bezelWidth: 1.1, primitives: [rect(9.2, 3.4, 1.35)] },
  { id: 'hdmi', name: 'HDMI', bezelHeight: 1.2, bezelWidth: 1.2, primitives: [rect(14.0, 4.7, 0.55)] },
  { id: 'hdmi-mini', name: 'Mini HDMI', bezelHeight: 1.1, bezelWidth: 1.1, primitives: [rect(11.2, 3.2, 0.4)] },
  { id: 'displayport', name: 'DisplayPort', bezelHeight: 1.2, bezelWidth: 1.2, primitives: [rect(16.1, 5.1, 0.5)] },
  { id: 'mini-displayport', name: 'Mini DisplayPort', bezelHeight: 1.1, bezelWidth: 1.1, primitives: [rect(8.3, 5.4, 0.4)] },
  { id: 'dvi', name: 'DVI', bezelHeight: 1.2, bezelWidth: 1.2, primitives: [rect(24.0, 8.0, 0.75), ...screws(28, 1.75)] },
  { id: 'vga', name: 'VGA', bezelHeight: 1.2, bezelWidth: 1.2, primitives: [rect(18.5, 9.5, 0.8), ...screws(25, 1.6)] },
  { id: 'rj45', name: 'RJ45 / Ethernet', bezelHeight: 1.4, bezelWidth: 1.3, primitives: [rect(16.1, 13.6, 0.7)] },
  { id: 'rj11', name: 'RJ11 / modem', bezelHeight: 1.2, bezelWidth: 1.2, primitives: [rect(12.5, 11.5, 0.5)] },
  { id: 'audio', name: 'Audio 3.5 mm', bezelHeight: 1.1, bezelWidth: 1.1, primitives: [circle(3.25)] },
  { id: 'optical-spdif', name: 'S/PDIF Toslink', bezelHeight: 1.1, bezelWidth: 1.1, primitives: [rect(10.0, 10.0, 0.8)] },
  { id: 'rca', name: 'RCA / coaxial', bezelHeight: 1.1, bezelWidth: 1.1, primitives: [circle(4.5)] },
  { id: 'ps2', name: 'PS/2', bezelHeight: 1.2, bezelWidth: 1.2, primitives: [circle(6.0)] },
  { id: 'esata', name: 'eSATA', bezelHeight: 1.2, bezelWidth: 1.2, primitives: [rect(14.5, 6.6, 0.4)] },
  { id: 'firewire', name: 'FireWire 400', bezelHeight: 1.2, bezelWidth: 1.2, primitives: [rect(11.7, 5.4, 0.4)] },
  { id: 'serial-com', name: 'COM / Serial DB9', bezelHeight: 1.2, bezelWidth: 1.2, primitives: [rect(17.8, 9.2, 0.6), ...screws(25, 1.6)] },
  { id: 'parallel-lpt', name: 'LPT / Parallel DB25', bezelHeight: 1.2, bezelWidth: 1.2, primitives: [rect(40.0, 9.5, 0.8), ...screws(47, 1.6)] },
  { id: 'sma-antenna', name: 'SMA / Wi-Fi antenna', bezelHeight: 1.0, bezelWidth: 1.0, primitives: [circle(3.25)] },
  { id: 'cmos', name: 'Clear CMOS', bezelHeight: 1.0, bezelWidth: 1.0, primitives: [circle(1.5)] },
  { id: 'reset', name: 'Reset', bezelHeight: 1.0, bezelWidth: 1.0, primitives: [circle(2.0)] },
  { id: 'power-sw', name: 'Power', bezelHeight: 1.0, bezelWidth: 1.0, primitives: [circle(2.0)] },
  { id: 'led', name: 'LED', bezelHeight: 0.8, bezelWidth: 0.8, primitives: [circle(1.5)] }
];
