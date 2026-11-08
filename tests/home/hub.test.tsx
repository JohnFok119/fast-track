// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Hub } from '../../src/home/sections/Hub';

describe('Hub', () => {
  it('is the section the nav calls "How it works"', () => {
    const { container } = render(<Hub />);
    expect(container.querySelector('section#how')).not.toBeNull();
    expect(screen.getByText('Cleared to build.')).toBeTruthy();
  });

  it("shows only the documents behind Dana Point's results flowing in", () => {
    const { container } = render(<Hub />);
    const cols = [...container.querySelectorAll('.hub-col')].map((col) => [...col.querySelectorAll('.hub-feed')].map((el) => el.textContent));
    expect(cols).toEqual([['Dana Point Ordinance 22-01'], ['HCD letter, Dana Point', 'ADU Handbook, 2026']]);
  });

  it('shows the list that comes out, with a status on every line', () => {
    const { container } = render(<Hub />);
    expect(screen.getByText('One story')).toBeTruthy();
    expect(screen.getByText("3 lines we haven't checked")).toBeTruthy();
    expect(container.querySelectorAll('.hub-item .chip.conf').length).toBe(4);
    expect(container.querySelectorAll('.hub-item .chip.unk').length).toBe(1);
  });

  it('draws one curve from each source into the core and one from the core to each output', async () => {
    const { container } = render(<Hub />);
    const feeds = container.querySelectorAll('.hub-feed').length;
    const items = container.querySelectorAll('.hub-item').length;
    await waitFor(() => expect(container.querySelectorAll('.hub-flows path').length).toBe(feeds + items));
    expect(container.querySelectorAll('.hub-flows path.outp').length).toBe(items);
  });
});
