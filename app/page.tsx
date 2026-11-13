import Link from 'next/link';
import { headers } from 'next/headers';
import BuyBox, { NotifyButton, StickyBuy } from '@/components/BuyBox';
import Checkout from '@/components/Checkout';
import Gallery from '@/components/Gallery';
import { Boot, Embers, Reveal, TiltLogo } from '@/components/Effects';
import { Price, ShopProvider } from '@/components/Shop';
import { SoundToggle } from '@/components/Sound';

function SecHead({ n, title }: { n: string; title: string }) {
  return (
    <Reveal className="sec-head">
      <span className="sec-num">{n}</span>
      <h2>{title}</h2>
      <span className="sec-line" />
    </Reveal>
  );
}

const FAQ = [
  ['Am I paying anything now?', "No — pre-ordering costs ₹0 / $0. You pay only when your shirt is ready to ship, and we'll message you first to confirm."],
  ['Can I cancel my pre-order?', "Yes, any time before you pay. Just reply to our message. Nothing was charged, so there's nothing to refund."],
  ['Do you ship outside India?', 'We plan to. Your country is saved with your number, and shipping options for it are shown before you pay anything.'],
  ['How does the fit run?', 'Oversized with a dropped shoulder. Take your usual size for the relaxed look, or one size down for a closer fit.'],
  ['Will there be more?', 'This is a small first run. Pre-orders get their size first; if it sells out, you hear about the next one first.'],
];

export default async function Home() {
  // Region: hosts like Vercel / Cloudflare send the visitor's country. Without it the browser decides.
  const h = await headers();
  const serverCountry = (h.get('x-vercel-ip-country') || h.get('cf-ipcountry') || h.get('cloudfront-viewer-country') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);

  return (
    <ShopProvider serverCountry={serverCountry === 'XX' ? '' : serverCountry}>
      <Boot />

      <header className="hud">
        <span className="hud-l"><b>NOTHING PERSONAL</b><i>DROP 001</i></span>
        <span className="hud-r"><SoundToggle /></span>
      </header>

      <main>
        {/* PRODUCT — shop-style, first thing on screen */}
        <section className="pdp" id="top">
          <Gallery />
          <BuyBox />
        </section>

        {/* ITEM STATS */}
        <section className="section" id="fit">
          <SecHead n="01" title="ITEM STATS" />
          <div className="duo">
            <Reveal className="panel">
              <ul className="stats">
                {[['DRIP', 96], ['COMFORT', 90], ['CORRECTNESS', 100]].map(([k, v]) => (
                  <li key={k}><span>{k}</span><div className="bar"><i style={{ '--v': `${v}%` } as React.CSSProperties} /></div><b>{v}</b></li>
                ))}
              </ul>
              <dl className="specs">
                <div><dt>FIT</dt><dd>Oversized, drop shoulder</dd></div>
                <div><dt>SLEEVE</dt><dd>Full sleeve</dd></div>
                <div><dt>COLOUR</dt><dd>Washed black</dd></div>
                <div><dt>PRINT</dt><dd>Front chest + back neck</dd></div>
              </dl>
            </Reveal>
            <Reveal className="panel fit">
              <h3>Fit guide</h3>
              <p><b>Relaxed / oversized look:</b> take your usual size.</p>
              <p><b>Closer fit:</b> go one size down.</p>
              <p className="muted">Exact measurements are shared before you pay.</p>
            </Reveal>
          </div>
        </section>

        {/* QUEST */}
        <section className="section" id="how">
          <SecHead n="02" title="HOW THE DROP WORKS" />
          <div className="quest">
            {[
              ['01', 'Pre-order for ₹0', 'Pick your size, leave your number. 20 seconds.'],
              ['02', 'We print the first run', 'Your size is held. We message you on WhatsApp / email.'],
              ['03', 'Pay & it ships', 'Pay only when it is ready — or cancel free.'],
            ].map(([n, t, d]) => (
              <Reveal className="q" key={n}><span className="q-n">{n}</span><b>{t}</b><p>{d}</p></Reveal>
            ))}
          </div>
        </section>

        {/* BRAND — logo lives here, not first */}
        <section className="brand">
          <Embers />
          <div className="floor" aria-hidden="true" />
          <div className="brand-inner">
            <p className="kicker">{'// THE SHIRT FROM THE REELS'}</p>
            <TiltLogo />
            <p className="brand-line">One design. One small run. From <b><Price /></b>.</p>
            <NotifyButton label="PRE-ORDER NOW" className="btn-xl" />
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq">
          <SecHead n="03" title="FAQ" />
          <Reveal className="faq">
            {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
          </Reveal>
        </section>

        <footer className="foot">
          <img className="orn" src="/assets/ornament.webp" alt="" width={1000} height={380} loading="lazy" />
          <p className="foot-line">NOTHING PERSONAL. I&apos;M JUST CORRECT.</p>
          <nav><Link href="/privacy">Privacy Policy</Link><span>·</span><a href="#top">Back to top</a></nav>
          <p className="muted small">© 2026 Nothing Personal</p>
        </footer>
      </main>

      <StickyBuy />
      <Checkout />
    </ShopProvider>
  );
}
