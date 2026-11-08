// How much of the street the camera sees. About 11 units of height on wide screens so the houses read as a small
// neighborhood; narrow screens see more height (24 / aspect) so several houses still fit across.

export interface CameraBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
  viewH: number;
  viewW: number;
}

export class ViewFit {
  constructor(private readonly minHeight = 11, private readonly area = 24) {}

  fit(width: number, height: number): CameraBox {
    const aspect = Math.max(width, 1) / Math.max(height, 1);
    const viewH = Math.max(this.minHeight, this.area / aspect);
    const viewW = viewH * aspect;
    return { left: -viewW / 2, right: viewW / 2, top: viewH / 2, bottom: -viewH / 2, viewH, viewW };
  }
}
