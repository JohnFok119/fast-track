import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyThemeFromUrl } from '../theme';
import { Root } from '../ui/Root';
import '../index.css';

applyThemeFromUrl();
window.addEventListener('unhandledrejection', (e) => console.error('[app] unhandled promise rejection', e.reason));

const container = document.getElementById('root');
if (!container) {
  throw new Error('Fast Track could not start: the #root element is missing from app/index.html.');
}

createRoot(container).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
