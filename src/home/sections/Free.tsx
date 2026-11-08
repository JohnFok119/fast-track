// "Free and open source."
import { APP_URL } from '../links';
import { REPO_URL } from '../trust/repo';
import './free.css';

export function Free() {
  return (
    <section className="free-sec dark smooth pad" id="free" aria-label="Free and open source">
      <div className="wrap center">
        <h2 className="disp free-h" data-rv>Free and open source.</h2>
        <div className="free" data-rv>
          <div className="disp">Free</div>
          <ul>
            <li>No account</li>
            <li>Runs in your browser</li>
            <li>MIT license</li>
          </ul>
          <div className="ctas">
            <a className="btn btn-cream" href={APP_URL}>Check your lot</a>
            <a className="btn btn-ghost" href={REPO_URL}>View the code</a>
          </div>
        </div>
      </div>
    </section>
  );
}
