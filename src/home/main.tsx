import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Home } from './Home';
import '../index.css';
import './home.css';

window.addEventListener('unhandledrejection', (e) => console.error('[home] unhandled promise rejection', e.reason));

const container = document.getElementById('root');
if (!container) {
  throw new Error('Fast Track could not start: the #root element is missing from index.html.');
}

createRoot(container).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
