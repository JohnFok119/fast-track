// The copper wire in the source pane: a curve from the city's words down to the state's answer (Paper prototype).

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface WireShape {
  d: string;
  from: Point;
  to: Point;
}

/** How far in from the right edge each end sits, how far the curve swings out, and its smallest bend. */
const INSET = 8;
const SWING = 22;
const MIN_BEND = 24;

const tenth = (n: number) => Math.round(n * 10) / 10;

/** The curve from the bottom right of `from` to the top right of `to`, in the coordinates of `pane`. */
export function wirePath(from: Box, to: Box, pane: Box): WireShape {
  const x1 = tenth(from.right - pane.left - INSET);
  const y1 = tenth(from.bottom - pane.top);
  const x2 = tenth(to.right - pane.left - INSET);
  const y2 = tenth(to.top - pane.top);
  const bend = tenth(Math.max(MIN_BEND, (y2 - y1) / 2));
  return {
    d: `M${x1} ${y1} C ${tenth(x1 + SWING)} ${tenth(y1 + bend)}, ${tenth(x2 + SWING)} ${tenth(y2 - bend)}, ${x2} ${y2}`,
    from: { x: x1, y: y1 },
    to: { x: x2, y: y2 },
  };
}
