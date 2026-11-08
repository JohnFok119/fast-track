// Which showcase rows are open. Never changes in place: toggle returns the next state.
export class OpenRows {
  private readonly ids: ReadonlySet<string>;

  constructor(ids: Iterable<string>) {
    this.ids = new Set(ids);
  }

  isOpen(id: string): boolean {
    return this.ids.has(id);
  }

  toggle(id: string): OpenRows {
    const next = new Set(this.ids);
    if (!next.delete(id)) next.add(id);
    return new OpenRows(next);
  }
}
