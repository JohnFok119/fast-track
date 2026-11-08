// "Clear the way. Then build." with a street of 3D houses that pops up along the bottom when it is reached.
import { useRef } from 'react';
import { APP_URL } from '../links';
import { useStreet } from '../street/useStreet';
import './final.css';

export function Final() {
  const street = useRef<HTMLDivElement>(null);
  useStreet(street);
  return (
    <section className="pad final" id="final" style={{ paddingTop: 40 }}>
      <div className="wrap center">
        <h2 className="disp" data-rv>
          Clear the way.
          <br />
          Then build.
        </h2>
        <p style={{ marginTop: 36 }} data-rv>
          <a className="btn btn-esp" href={APP_URL}>
            Check your lot →
          </a>
        </p>
      </div>
      <div className="street" ref={street} aria-hidden="true" />
    </section>
  );
}
