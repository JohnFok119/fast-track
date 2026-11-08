// The one real run the homepage illustrates (the prototype shows Dana Point), plus the lists that go with it.
import { getPaths, runCheck } from '../../contract/api';
import sourcesRaw from '../../../data/sources/index.json';
import type { SourceEntry } from './HubModel';

export const HOME_RUN = runCheck('dana-point');
export const HOME_PATHS = getPaths();
export const HOME_SOURCES = sourcesRaw as SourceEntry[];
