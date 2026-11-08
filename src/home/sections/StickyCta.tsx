// The sticky "Check your lot" button: slides up after the first screen, away again near the bottom of the page.
import { useEffect, useState } from 'react';
import { SproutLogo } from '../../brand/Logo';
import { APP_URL } from '../links';
import { shouldShowSticky } from '../street/stickyRule';
import './stickycta.css';

export function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () =>
      setShow(shouldShowSticky({ scrollY: window.scrollY, innerHeight: window.innerHeight, scrollHeight: document.body.scrollHeight }));
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <a
      className={`btn btn-esp sticky-cta${show ? ' show' : ''}`}
      id="sticky"
      href={APP_URL}
      tabIndex={show ? undefined : -1}
      aria-hidden={show ? undefined : true}
    >
      <SproutLogo size={18} />
      Check your lot →
    </a>
  );
}
