// The top bar floats as a pill once you scroll past this many pixels.
export const PILL_AFTER_PX = 40;

export function isPill(scrollY: number): boolean {
  return scrollY > PILL_AFTER_PX;
}
