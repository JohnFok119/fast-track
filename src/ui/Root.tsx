// Picks the view: the guided flow (one card at a time, the default) or everything on one page.
import { useState } from 'react';
import { App } from './App';
import { Guided } from './guided/Guided';

export function Root() {
  const [view, setView] = useState<'guided' | 'all'>('guided');
  return view === 'guided' ? <Guided onSeeAll={() => setView('all')} /> : <App onGuided={() => setView('guided')} />;
}
