export const EPS = 1e-9;

export function getIntersectionXPoint(segment, xPos, yPos) {
  const dy1 = segment.from.y - yPos;
  const dy2 = yPos - segment.to.y;
  const dy = segment.to.y - segment.from.y;
  if (Math.abs(dy1) < EPS) {
    if (Math.abs(dy) < EPS) {
      if (xPos <= segment.from.x) return segment.from.x;
      if (xPos > segment.to.x) return segment.to.x;
      return xPos;
    }
    return segment.from.x;
  }
  const dx = (segment.to.x - segment.from.x);
  let xOffset;
  if (dy1 >= dy2) {
    xOffset = dy1 * (dx / dy); 
    return (segment.from.x - xOffset);
  } 
  xOffset = dy2 * (dx / dy);
  return (segment.to.x + xOffset);
}

export function angle(dx, dy) {
  const p = dx / (Math.abs(dx) + Math.abs(dy));
  if (dy < 0) return p - 1;
  return 1 - p;
}

export function intersectSegments(a, b) {
  const aStart = a.from, bStart = b.from;
  const p0_x = aStart.x, p0_y = aStart.y,
      p2_x = bStart.x, p2_y = bStart.y;
  const s1_x = a.dx, s1_y = a.dy, s2_x = b.dx, s2_y = b.dy;
  const div = s1_x * s2_y - s2_x * s1_y;
  const s = (s1_y * (p0_x - p2_x) - s1_x * (p0_y - p2_y)) / div;
  if (s < 0 || s > 1) return;
  const t = (s2_x * (p2_y - p0_y) + s2_y * (p0_x - p2_x)) / div;
  if (t >= 0 && t <= 1) {
    return {
      x: p0_x - (t * s1_x),
      y: p0_y - (t * s1_y)
    }
  }
}

export function same(x0, x1, y0, y1) {
  return Math.abs(x0 - x1) < EPS && Math.abs(y0 - y1) < EPS;
}

export function samePoint(a, b) {
  return Math.abs(a.x - b.x) < EPS && Math.abs(a.y - b.y) < EPS;
}
