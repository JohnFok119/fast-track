// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Home } from '../../src/home/Home';

describe('Home', () => {
  it('melts the hero straight into how it works, with nothing in between', () => {
    render(<Home />);
    const hero = screen.getByRole('main').querySelector('.hero');
    expect(hero?.nextElementSibling?.classList.contains('hub-sec')).toBe(true);
  });
});
