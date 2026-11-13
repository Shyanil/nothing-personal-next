import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Privacy Policy — Nothing Personal' };

const SECTIONS: { id: string; toc?: string; title: string; body: React.ReactNode }[] = [
  {
    id: 'short', title: 'The short version',
    body: <p>You gave us your details so we can tell you when the <b>Nothing Personal</b> drop opens. That&apos;s all we use them for. We don&apos;t sell your data, and you can ask us to delete it any time.</p>,
  },
  {
    id: 'collect', toc: 'What we collect', title: 'What we collect',
    body: <>
      <ul>
        <li><b>Contact details:</b> name, email address, phone number and country code.</li>
        <li><b>Drop preferences:</b> size, quantity, preferred currency, and your answer about the price.</li>
        <li><b>How you found us:</b> the option you pick and campaign tags in the link (e.g. which reel sent you).</li>
        <li><b>Time of signup.</b></li>
      </ul>
      <p>We don&apos;t collect payment details on this page. Nothing is charged.</p>
    </>,
  },
  {
    id: 'use', toc: 'How we use it', title: 'How we use it',
    body: <>
      <ul>
        <li>To confirm your pre-order and contact you by WhatsApp, SMS or email about it — this drop only.</li>
        <li>To plan how many shirts to make in each size.</li>
        <li>To understand which videos bring people here.</li>
      </ul>
      <p>We only message you because you agreed to it when you pre-ordered. Reply <b>STOP</b> or ask us and we&apos;ll stop.</p>
    </>,
  },
  {
    id: 'share', toc: 'Sharing', title: 'Sharing',
    body: <p>We <b>never sell or rent</b> your information. We may use trusted service providers (for example, messaging or email tools, hosting) only to send you drop updates. They can&apos;t use your data for anything else.</p>,
  },
  {
    id: 'keep', toc: 'Retention', title: 'Retention & security',
    body: <p>We keep your details until the drop is over and for up to 12 months afterwards, unless you ask us to delete them sooner. Access is restricted to the small team running the drop.</p>,
  },
  {
    id: 'rights', toc: 'Your rights', title: 'Your rights',
    body: <p>You can ask to see, correct or delete your information, or withdraw consent at any time. We handle requests in line with applicable law, including India&apos;s Digital Personal Data Protection Act, 2023, and, where they apply to you, GDPR and US state privacy laws.</p>,
  },
  {
    id: 'contact', toc: 'Contact', title: 'Contact',
    body: <p>To make a request or ask a question, reply to any message we send you, or message us on Instagram. We aim to respond within 7 days.</p>,
  },
];

export default function Privacy() {
  return (
    <>
      <Link className="back" href="/">← BACK</Link>
      <main className="pp">
        <div className="floor pp-floor" aria-hidden="true" />
        <header className="pp-hero">
          <img src="/assets/logo.webp" alt="Nothing Personal. I'm Just Correct." width={1000} height={774} />
          <h1>PRIVACY POLICY</h1>
          <p>LAST UPDATED · 11 NOV 2026</p>
        </header>

        <nav className="toc" aria-label="Sections">
          {SECTIONS.filter(s => s.toc).map(s => <a key={s.id} href={'#' + s.id}>{s.toc}</a>)}
        </nav>

        {SECTIONS.map((s, i) => (
          <section className="block" id={s.id} key={s.id}>
            <h2><span>{String(i).padStart(2, '0')}</span>{s.title}</h2>
            {s.body}
          </section>
        ))}

        <div className="pp-foot">
          <Link href="/#reserve" className="btn btn-primary">BACK TO THE DROP</Link>
          <p className="muted small" style={{ marginTop: 22 }}>© 2026 Nothing Personal</p>
        </div>
      </main>
    </>
  );
}
