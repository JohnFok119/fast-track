// Plans the dashed curves on the homepage: given two boxes and a direction, returns the SVG path between them.
// Pure numbers, so the geometry is tested without a browser.

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type Direction = 'h' | 'v';
export type Point = readonly [number, number];

export interface Curve {
  /** The SVG path data. */
  d: string;
  /** Where the curve starts and ends, for the dots. */
  ends: readonly [Point, Point];
}

export class CurvePlanner {
  /** A curve from box a to box b, in the coordinates of `container`. 'h' runs side to side, 'v' top to bottom. */
  plan(a: Box, b: Box, container: Box, direction: Direction = 'h'): Curve {
    if (direction === 'v') {
      const x1 = (a.left + a.right) / 2 - container.left;
      const y1 = a.bottom - container.top;
      const x2 = (b.left + b.right) / 2 - container.left;
      const y2 = b.top - container.top;
      const my = (y1 + y2) / 2;
      return { d: `M${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`, ends: [[x1, y1], [x2, y2]] };
    }
    const x1 = a.right - container.left;
    const y1 = (a.top + a.bottom) / 2 - container.top;
    const x2 = b.left - container.left;
    const y2 = (b.top + b.bottom) / 2 - container.top;
    const mx = (x1 + x2) / 2;
    return { d: `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`, ends: [[x1, y1], [x2, y2]] };
  }
}
