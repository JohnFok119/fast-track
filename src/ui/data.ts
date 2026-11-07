// Engine results shared by both views. Runs once at load; the engine is deterministic and needs no network.
import { getEscalation, getPaths, runCheck } from '../contract/api';
import { CITIES } from '../contract/types';

export const RUNS = CITIES.map((c) => runCheck(c));
export const PATHS = getPaths();
export const ESCALATION = getEscalation();
