// The homepage: presents Fast Track and what it does. The working tool lives on its own page at /app/.
import { useRevealAll } from './reveal';
import { Faq } from './sections/Faq';
import { Final } from './sections/Final';
import { Footer } from './sections/Footer';
import { Free } from './sections/Free';
import { Hero } from './sections/Hero';
import { Hub } from './sections/Hub';
import { Nav } from './sections/Nav';
import { Showcase } from './sections/Showcase';
import { Sources } from './sections/Sources';
import { Steps } from './sections/Steps';
import { StickyCta } from './sections/StickyCta';
import { Ticker } from './sections/Ticker';
import { Trust } from './sections/Trust';
import { Story } from './story/Story';

/** Where every "Check your lot" button goes. */
export const APP_URL = '/app/';

export function Home() {
  useRevealAll();
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <Ticker />
        <Hub />
        <Steps />
        <Story />
        <Showcase />
        <Trust />
        <Sources />
        <Free />
        <Faq />
        <Final />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
