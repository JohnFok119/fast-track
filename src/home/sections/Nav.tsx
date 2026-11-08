// The top bar: full width over the hero, a floating pill once you scroll past 40px.
import { useEffect, useState } from 'react';
import { SproutLogo } from '../../brand/Logo';
import { isPill } from '../hero/navPill';
import { APP_URL } from '../links';
import './nav.css';

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#sources', label: 'Sources' },
  { href: '#faq', label: 'FAQ' },
  { href: '#free', label: 'Open source' },
];

export function Nav() {
  const [pill, setPill] = useState(false);
  useEffect(() => {
    const onScroll = () => setPill(isPill(window.scrollY));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-nav${pill ? ' pill' : ''}`} id="nav">
      <a className="brand" href="#top">
        <SproutLogo size={34} />
        Fast Track
      </a>
      <nav className="links" aria-label="Main">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <a className="btn btn-cream" href={APP_URL}>
        Check your lot
      </a>
    </header>
  );
}
