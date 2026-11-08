// The footer: the brand, the prototype notice and who built it.
import { SproutLogo } from '../../brand/Logo';
import './footer.css';

export function Footer() {
  return (
    <footer className="site-foot" id="footer">
      <div className="wrap">
        <a className="foot-brand" href="#top">
          <SproutLogo size={34} />
          Fast Track
        </a>
        <span>Prototype, not legal advice. Talk to a professional before you act.</span>
        <span>
          Built at <span className="claude-type">Claude Impact Lab</span>: UCI x SoCal Affordable Housing, an independent
          Claude Community event.
        </span>
      </div>
    </footer>
  );
}
