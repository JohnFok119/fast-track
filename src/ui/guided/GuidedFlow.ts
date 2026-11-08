// The guided flow's state: which card you are on, what you picked, and which steps you can jump to.
// Immutable: every move returns a new flow, so the component only holds one value.
import type { City, Pathway } from '../../contract/types';
import type { BuildChoice } from '../choice';

interface FlowRun { city: City; pathway: Pathway }

export interface FlowData<R extends FlowRun = FlowRun> {
  paths: readonly { id: string; pathway: Pathway }[];
  runs: readonly R[];
}

export type FlowDirection = 'fwd' | 'back';

export class GuidedFlow<R extends FlowRun = FlowRun> {
  private constructor(
    private readonly data: FlowData<R>,
    readonly step: number,
    readonly dir: FlowDirection,
    readonly pathId: string | null,
    readonly city: City | null,
  ) {}

  static start<R extends FlowRun>(data: FlowData<R>): GuidedFlow<R> {
    return new GuidedFlow<R>(data, 0, 'fwd', null, null);
  }

  /** Picks up a choice made in the one-page view: on the clash step when it has a saved check, else as far as it goes. */
  static resume<R extends FlowRun>(data: FlowData<R>, from: BuildChoice): GuidedFlow<R> {
    let flow = GuidedFlow.start(data);
    if (from.pathId) flow = flow.pickPath(from.pathId);
    if (from.city) flow = flow.pickCity(from.city);
    return flow.go(flow.run ? 3 : flow.pathId ? 2 : 0);
  }

  get pathway(): Pathway | undefined {
    return this.data.paths.find((p) => p.id === this.pathId)?.pathway;
  }

  /** The saved check for the picked city and build, if there is one. */
  get run(): R | undefined {
    return this.data.runs.find((r) => r.city === this.city && r.pathway === this.pathway);
  }

  /** The highest step you may jump to: 1 at the start, 2 once a build is picked, 6 once a saved check exists. */
  get reachable(): number {
    return this.run ? 6 : this.pathId ? 2 : 1;
  }

  go(n: number): GuidedFlow<R> {
    const target = Math.max(0, Math.min(n, this.reachable));
    return new GuidedFlow<R>(this.data, target, target >= this.step ? 'fwd' : 'back', this.pathId, this.city);
  }

  pickPath(id: string): GuidedFlow<R> {
    const pathway = this.data.paths.find((p) => p.id === id)?.pathway;
    if (!pathway) return this;
    const keep = this.city !== null && this.data.runs.some((r) => r.city === this.city && r.pathway === pathway);
    return new GuidedFlow<R>(this.data, this.step, this.dir, id, keep ? this.city : null);
  }

  pickCity(city: City): GuidedFlow<R> {
    if (!this.data.runs.some((r) => r.city === city && r.pathway === this.pathway)) return this;
    return new GuidedFlow<R>(this.data, this.step, this.dir, this.pathId, city);
  }

  restart(): GuidedFlow<R> {
    return new GuidedFlow<R>(this.data, 0, 'back', null, null);
  }
}
