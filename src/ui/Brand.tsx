// The app's brand link: the sprout and the name, back to the homepage. Styled by .ft-brand in ft.css.
import { SproutLogo } from '../brand/Logo';

export function AppBrand() {
  return (
    <a className="ft-brand" href="/" aria-label="Fast Track home">
      <SproutLogo size={30} />
      <span>Fast Track</span>
    </a>
  );
}
