import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Root } from './ui/Root';
import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Fast Track could not start: the #root element is missing from index.html.');
}

createRoot(container).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
