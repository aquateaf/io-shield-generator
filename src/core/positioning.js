export function frameFromBounds(bounds, margins) {
  return { left: bounds.min.x + margins.left, right: bounds.max.x - margins.right, top: bounds.max.y - margins.top, bottom: bounds.min.y + margins.bottom };
}

export function portWorldPosition(frame, port) {
  return { x: frame.left + Number(port.x), y: frame.top - Number(port.y) };
}

export function marginsFromFrame(bounds, frame) {
  return { left: frame.left - bounds.min.x, right: bounds.max.x - frame.right, top: bounds.max.y - frame.top, bottom: frame.bottom - bounds.min.y };
}

export function centeredMarginsForSize(bounds, width, height) {
  const modelW = bounds.max.x - bounds.min.x;
  const modelH = bounds.max.y - bounds.min.y;
  const extraW = modelW - width;
  const extraH = modelH - height;
  const round = value => Math.round(value * 10000) / 10000;
  const left = round(Math.max(0, extraW) / 2);
  const top = round(Math.max(0, extraH) / 2);
  return {
    margins: {
      left,
      right: round(Math.max(0, extraW) - left),
      top,
      bottom: round(Math.max(0, extraH) - top)
    },
    modelW,
    modelH,
    extraW,
    extraH,
    fits: extraW >= -0.0001 && extraH >= -0.0001
  };
}
