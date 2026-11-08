// What the all-on-one-page view remembers: the picked path, city, status filter and line, and whether the letter
// sheet is open. Immutable: each change returns a new PageState, so React can hold it in one useState.
import type { BuildPath, City, CityRun, Pathway, Status } from '../../contract/types';
import { groupItems, type Item } from '../model';

interface Choice {
  pathId: string;
  city: City | null;
  filter: Status | null;
  selected: string | null;
  letterOpen: boolean;
}

export class PageState {
  readonly items: Item[];
  readonly run: CityRun | undefined;

  private constructor(
    private readonly runs: CityRun[],
    private readonly paths: BuildPath[],
    private readonly pick: Choice,
  ) {
    this.run = runs.find((r) => r.city === pick.city && r.pathway === this.pathway);
    this.items = this.run ? groupItems(this.run) : [];
  }

  static initial(runs: CityRun[], paths: BuildPath[], city: City | null = 'irvine'): PageState {
    return new PageState(runs, paths, { pathId: paths[0]?.id ?? '', city, filter: null, selected: null, letterOpen: false });
  }

  get pathId(): string { return this.pick.pathId; }
  get city(): City | null { return this.pick.city; }
  get filter(): Status | null { return this.pick.filter; }
  get selected(): string | null { return this.pick.selected; }
  get letterOpen(): boolean { return this.pick.letterOpen; }

  get pathway(): Pathway {
    return this.paths.find((p) => p.id === this.pick.pathId)?.pathway ?? 'ADU';
  }

  /** The lines to list: all of them, or only those with the picked status. */
  get shown(): Item[] {
    const { filter } = this.pick;
    return filter ? this.items.filter((it) => it.statuses.includes(filter)) : this.items;
  }

  /** The line whose detail is open: the picked one, else the first that needs attention, else the first shown. */
  get current(): Item | undefined {
    return this.items.find((it) => it.itemId === this.pick.selected) ?? this.shown.find((it) => it.needsAttention) ?? this.shown[0];
  }

  /** How many lines need a push back or an updated law number. */
  get attention(): number {
    return this.items.filter((it) => it.needsAttention).length;
  }

  choosePath(id: string): PageState {
    const pathway = this.paths.find((p) => p.id === id)?.pathway;
    const keeps = this.runs.some((r) => r.city === this.pick.city && r.pathway === pathway);
    const city = keeps ? this.pick.city : (this.runs.find((r) => r.pathway === pathway)?.city ?? null);
    return this.next({ pathId: id, city, filter: null, selected: null });
  }

  chooseCity(city: City): PageState {
    return this.next({ city, filter: null, selected: null });
  }

  /** Picking the status that is already picked clears it. */
  setFilter(status: Status | null): PageState {
    return this.next({ filter: this.pick.filter === status ? null : status });
  }

  select(itemId: string): PageState { return this.next({ selected: itemId }); }
  openLetter(): PageState { return this.next({ letterOpen: true }); }
  closeLetter(): PageState { return this.next({ letterOpen: false }); }

  private next(change: Partial<Choice>): PageState {
    return new PageState(this.runs, this.paths, { ...this.pick, ...change });
  }
}
