// The curved line that joins two quotes in a story step: side to side ('h') or top to bottom ('v'), in the
// coordinates of the box the line is drawn in.

export interface RectLike {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Curve {
  d: string;
  ends: [[number, number], [number, number]];
}

export function curve(box: RectLike, a: RectLike, b: RectLike, dir: 'h' | 'v'): Curve {
  if (dir === 'v') {
    const x1 = a.left + a.width / 2 - box.left;
    const y1 = a.bottom - box.top;
    const x2 = b.left + b.width / 2 - box.left;
    const y2 = b.top - box.top;
    const my = (y1 + y2) / 2;
    return { d: `M${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`, ends: [[x1, y1], [x2, y2]] };
  }
  const x1 = a.right - box.left;
  const y1 = a.top + a.height / 2 - box.top;
  const x2 = b.left - box.left;
  const y2 = b.top + b.height / 2 - box.top;
  const mx = (x1 + x2) / 2;
  return { d: `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`, ends: [[x1, y1], [x2, y2]] };
}
