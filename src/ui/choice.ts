import type { City } from '../contract/types';

/** What the two views hand each other when you switch: the build picked and the lot's city. Either may be unset. */
export interface BuildChoice {
  pathId: string | null;
  city: City | null;
}
