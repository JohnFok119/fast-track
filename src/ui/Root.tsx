// Picks the view: the guided flow (one card at a time, the default) or everything on one page. Switching hands the
// build and city over, so the other view opens on the same lot.
import { useState } from 'react';
import { App } from './App';
import type { BuildChoice } from './choice';
import { Guided } from './guided/Guided';

interface View { name: 'guided' | 'all'; from?: BuildChoice }

export function Root() {
  const [view, setView] = useState<View>({ name: 'guided' });
  return view.name === 'guided'
    ? <Guided from={view.from} onSeeAll={(from) => setView({ name: 'all', from })} />
    : <App from={view.from} onGuided={(from) => setView({ name: 'guided', from })} />;
}
