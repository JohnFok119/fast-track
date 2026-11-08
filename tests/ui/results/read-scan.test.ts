import { describe, expect, it } from 'vitest';
import { ReadScan, SCAN_MS } from '../../../src/ui/results/ReadScan';

// A plain line, the first line of clash 1 (its words are in block 5), a second line of clash 1, a plain line.
const scan = new ReadScan([
  { look: null, pair: null },
  { look: 5, pair: 1 },
  { look: null, pair: 1 },
  { look: null, pair: null },
]);
const { line, look, find, verdict, end } = SCAN_MS;

describe('ReadScan', () => {
  it('takes longer on a line it has to look up, and pauses at the end', () => {
    expect(scan.total).toBe(line + look + line + line + end);
  });

  it('starts on the first line with the state side at the top and nothing found', () => {
    expect(scan.at(0)).toEqual({ line: 0, block: null, read: 0, found: [], done: false });
  });

  it('gives a plain line its verdict partway through it', () => {
    expect(scan.at(verdict - 1).read).toBe(0);
    expect(scan.at(verdict).read).toBe(1);
  });

  it("turns the state side to a clash's words as its line starts, and finds the clash a moment later", () => {
    expect(scan.at(line)).toEqual({ line: 1, block: 5, read: 1, found: [], done: false });
    expect(scan.at(line + find)).toEqual({ line: 1, block: 5, read: 2, found: [1], done: false });
  });

  it('keeps the state side where it was for a line with nothing new to find', () => {
    expect(scan.at(line + look)).toEqual({ line: 2, block: 5, read: 2, found: [1], done: false });
  });

  it('ends with every line read, every clash found, and no line being read', () => {
    const last = { line: null, block: 5, read: 4, found: [1], done: true };
    expect(scan.at(scan.total)).toEqual(last);
    expect(scan.at(scan.total + 5000)).toEqual(last);
    expect(scan.end).toEqual(last);
  });
});
