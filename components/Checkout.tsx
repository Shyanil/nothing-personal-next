'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { COUNTRIES } from '@/lib/shop';
import { QtyStepper, SizePicker } from './BuyBox';
import { OrderTotals, Price, ShippingNote, useShop, ZeroDue } from './Shop';
import { sfx } from './Sound';
import { nationalPhoneDigits, validEmail, validName, validNationalPhone, validQty, validSize, type SignupField } from '@/lib/validation';

type Field = 'name' | 'phone' | 'email';
const DONE_KEY = 'np-preordered';

/**
 * Pre-order in 2 short steps (bottom sheet on phones, centred panel on desktop):
 *   1. Pick size (+ qty)   2. Name / WhatsApp / email   → success.
 * Opens by itself 2 s after landing (once per visit, never after a completed pre-order).
 */
export default function Checkout() {
  const { checkout, openCheckout, closeCheckout, size, setSize, qty, setQty, cur, country } = useShop();
  const [step, setStep] = useState<1 | 2>(1);
  const [cc, setCc] = useState('IN');
  const [vals, setVals] = useState<Record<Field, string>>({ name: '', phone: '', email: '' });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [sizeErr, setSizeErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { duplicate: boolean }>(null);
  const [failMsg, setFailMsg] = useState('');
  const panel = useRef<HTMLDivElement>(null);

  // phone code defaults to the visitor's country
  useEffect(() => { if (country && COUNTRIES.some(c => c[0] === country)) setCc(country); }, [country]);

  // auto-open only once BOTH are true: 2 s have passed since the page appeared
  // (boot screen takes ~0.9 s) AND the visitor has scrolled down the page.
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('np-auto') === '1' || localStorage.getItem(DONE_KEY) === '1'; } catch {}
    if (seen) return;
    const SCROLL_PX = 150;
    let timeUp = false, fired = false;
    const tryOpen = () => {
      if (fired || !timeUp || window.scrollY < SCROLL_PX) return;
      if (document.querySelector('.lb')) return; // don't interrupt someone zooming a photo
      fired = true;
      try { sessionStorage.setItem('np-auto', '1'); } catch {}
      removeEventListener('scroll', tryOpen);
      openCheckout();
    };
    const t = setTimeout(() => { timeUp = true; tryOpen(); }, 2900);
    addEventListener('scroll', tryOpen, { passive: true });
    return () => { clearTimeout(t); removeEventListener('scroll', tryOpen); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // on open: lock page scroll, start on the right step
  useEffect(() => {
    if (!checkout) return;
    try { sessionStorage.setItem('np-auto', '1'); } catch {}
    if (!done) setStep(size ? 2 : 1);
    document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    addEventListener('keydown', key);
    return () => { document.body.style.overflow = ''; removeEventListener('keydown', key); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout]);

  useEffect(() => { if (size) setSizeErr(false); }, [size]);
  useEffect(() => { panel.current?.scrollTo({ top: 0 }); }, [step, done]);

  function close() {
    sfx('close');
    closeCheckout();
    if (done) { setDone(null); setSize(''); setQty(1); setVals({ name: '', phone: '', email: '' }); setTouched({}); }
  }

  const next = () => {
    if (!size) { setSizeErr(true); sfx('error'); navigator.vibrate?.([30, 40, 30]); return; }
    sfx('select'); setStep(2);
    setTimeout(() => panel.current?.querySelector<HTMLInputElement>('#co-name')?.focus({ preventScroll: true }), 250);
  };

  const [, flag, dial] = COUNTRIES.find(c => c[0] === cc)!;
  const valid: Record<Field, boolean> = { name: validName(vals.name), phone: validNationalPhone(vals.phone, cc), email: validEmail(vals.email) };
  const errText: Record<Field, string> = {
    name: 'Enter a name with at least 2 characters',
    phone: cc === 'IN' ? 'Enter your 10-digit mobile number (with or without +91)' : 'Enter a valid phone number for the selected country',
    email: 'Enter a valid email, like name@gmail.com',
  };
  const showErr = (f: Field) => touched[f] && !valid[f];
  const filled = (Object.keys(valid) as Field[]).filter(f => valid[f]).length;
  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement>) => setVals(v => ({ ...v, [f]: e.target.value }));
  const blur = (f: Field) => () => setTouched(t => ({ ...t, [f]: true }));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFailMsg('');
    if (!validSize(size) || !validQty(qty)) {
      setSizeErr(!validSize(size));
      setStep(1);
      sfx('error');
      return;
    }
    setTouched({ name: true, phone: true, email: true });
    const bad = (Object.keys(valid) as Field[]).find(f => !valid[f]);
    if (bad) {
      setFailMsg(errText[bad]);
      sfx('error'); navigator.vibrate?.([30, 40, 30]);
      panel.current?.querySelector<HTMLInputElement>(`[name="${bad}"]`)?.focus();
      return;
    }
    const params = new URLSearchParams(location.search);
    setBusy(true);
    try {
      const r = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: vals.name.trim(), email: vals.email.trim(), country: cc, phone: dial + nationalPhoneDigits(vals.phone, cc),
          size, qty, currency: cur, consent: true,
          source: params.get('utm_source') ? 'campaign' : 'direct',
          utm_source: params.get('utm_source') || '', utm_campaign: params.get('utm_campaign') || '',
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (['name', 'phone', 'email'].includes(j.field as SignupField)) {
          const field = j.field as Field;
          setTouched(t => ({ ...t, [field]: true }));
          panel.current?.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus();
        }
        throw new Error(j.error || 'Something went wrong. Try again.');
      }
      try { localStorage.setItem(DONE_KEY, '1'); } catch {}
      setDone({ duplicate: !!j.duplicate });
      sfx('success');
      navigator.vibrate?.([20, 60, 20]);
    } catch (err) {
      const m = err instanceof Error ? err.message : '';
      setFailMsg(!m || m === 'Failed to fetch' || m.includes('NetworkError') ? 'Connection problem — please try again.' : m);
      sfx('error');
    } finally {
      setBusy(false);
    }
  }

  const stepNo = done ? 3 : step;

  return (
    <div className={'co' + (checkout ? ' open' : '')} aria-hidden={!checkout} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="co-panel" ref={panel} role="dialog" aria-modal="true" aria-labelledby="co-title">
        <div className="co-grab" aria-hidden="true" />
        <div className="co-head">
          <span id="co-title">{done ? 'QUEST COMPLETE' : 'PRE-ORDER · DROP 001'}</span>
          <button type="button" className="co-x" onClick={close} aria-label="Close">✕</button>
        </div>

        {/* progress */}
        <ol className="steps" aria-label="Progress">
          {['SIZE', 'DETAILS', 'DONE'].map((l, i) => (
            <li key={l} className={i + 1 < stepNo ? 'past' : i + 1 === stepNo ? 'now' : ''} aria-current={i + 1 === stepNo ? 'step' : undefined}>
              <span>{i + 1 < stepNo ? '✓' : i + 1}</span>{l}
            </li>
          ))}
        </ol>

        {done ? (
          <div className="win">
            <div className="ach-icon">★</div>
            <p className="ach">ACHIEVEMENT UNLOCKED</p>
            <h3>{done.duplicate ? 'Already pre-ordered' : 'Pre-order reserved'}</h3>
            <p className="muted">{done.duplicate ? "This email or phone number already has a pre-order. No new entry was created." : `Size ${size} × ${qty} is held for you. You paid nothing today — we'll message you on WhatsApp / email when it's ready to pay & ship.`} Nothing personal.</p>
            <div className="xp"><i /><span>+100 XP · FIRST RUN SECURED</span></div>
            <button type="button" className="btn btn-primary full" onClick={close}>CONTINUE</button>
          </div>
        ) : step === 1 ? (
          <div className="step1">
            <div className="offer">
              <img src="/assets/tee-front.webp" alt="Nothing Personal tee" />
              <div>
                <p className="offer-kick">THE SHIRT FROM THE REELS</p>
                <h3>Nothing Personal Tee</h3>
                <p className="offer-price"><b><Price /></b> <span><ShippingNote /></span></p>
                <p className="offer-zero">Pre-order today for <b><ZeroDue /></b> · cancel free</p>
              </div>
            </div>

            <div className="co-field">
              <span className="co-label">
                <span><b className="q-no">1</b> PICK YOUR SIZE</span>
                {sizeErr && <em>Tap a size to continue</em>}
              </span>
              <div className={sizeErr ? 'sizes-wrap bad' : 'sizes-wrap'}><SizePicker /></div>
              <p className="hint">Oversized fit — take your usual size.</p>
            </div>

            <div className="co-field qty-row">
              <span className="co-label"><span>HOW MANY?</span></span>
              <QtyStepper />
            </div>

            <button type="button" className="btn btn-primary btn-xl full" onClick={next}>
              <span>{size ? `NEXT · SIZE ${size}` : 'NEXT'}</span><span aria-hidden="true">→</span>
            </button>
            <p className="co-legal">Takes 20 seconds · nothing to pay today</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <button type="button" className="chosen" onClick={() => { sfx('tick'); setStep(1); }}>
              <img src="/assets/tee-front.webp" alt="" />
              <span><b>Size {size} · {qty} {qty > 1 ? 'shirts' : 'shirt'}</b><small><Price times={qty} /></small></span>
              <em>Change</em>
            </button>

            <p className="step2-title"><b className="q-no">2</b> WHERE SHOULD WE CONFIRM YOUR ORDER? <span>{filled}/3</span></p>

            <label className={'co-field' + (showErr('name') ? ' err' : valid.name ? ' ok' : '')}>
              <span className="co-label"><span>YOUR NAME</span>{valid.name && <i className="tick">✓</i>}</span>
              <input name="name" id="co-name" autoComplete="name" enterKeyHint="next" maxLength={80} required aria-describedby="co-name-hint" placeholder="e.g. Rahul Sharma"
                value={vals.name} onChange={set('name')} onBlur={blur('name')} aria-invalid={showErr('name')} />
              <small className="hint" id="co-name-hint">{showErr('name') ? errText.name : 'So we know who the shirt is for'}</small>
            </label>

            <div className={'co-field' + (showErr('phone') ? ' err' : valid.phone ? ' ok' : '')}>
              <label className="co-label" htmlFor="co-phone"><span>WHATSAPP NUMBER</span>{valid.phone && <i className="tick">✓</i>}</label>
              <div className="phone">
                <div className="cc-wrap">
                  <select aria-label="Country code" value={cc} onChange={e => { setCc(e.target.value); sfx('tick'); }}>
                    {COUNTRIES.map(([c, f, code, name]) => <option key={c} value={c}>{`${f} ${name} (${code})`}</option>)}
                  </select>
                  <span className="cc-show" aria-hidden="true">{flag} {dial}</span>
                </div>
                <input id="co-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" enterKeyHint="next" maxLength={24} required aria-describedby="co-phone-hint"
                  placeholder={cc === 'IN' ? '98765 43210' : 'Phone number'} value={vals.phone} onChange={set('phone')} onBlur={blur('phone')} aria-invalid={showErr('phone')} />
              </div>
              <small className="hint" id="co-phone-hint">{showErr('phone') ? errText.phone : "We'll WhatsApp you when it's ready. No spam."}</small>
            </div>

            <label className={'co-field' + (showErr('email') ? ' err' : valid.email ? ' ok' : '')}>
              <span className="co-label"><span>EMAIL</span>{valid.email && <i className="tick">✓</i>}</span>
              <input name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="off" enterKeyHint="done" maxLength={120} required aria-describedby="co-email-hint"
                placeholder="name@gmail.com" value={vals.email} onChange={set('email')} onBlur={blur('email')} aria-invalid={showErr('email')} />
              <small className="hint" id="co-email-hint">{showErr('email') ? errText.email : 'Your pre-order confirmation goes here'}</small>
            </label>

            <div className="co-sum">
              <OrderTotals qty={qty} />
              <div className="now"><span>Pay today</span><b><ZeroDue /></b></div>
            </div>

            <button type="submit" className="btn btn-primary btn-xl full" disabled={busy}>
              <span>{busy ? 'RESERVING…' : <>CONFIRM PRE-ORDER · <ZeroDue /></>}</span>
            </button>
            {failMsg && <p className="co-fail" role="alert">{failMsg}</p>}
            <p className="co-legal">
              Nothing is charged today. We&apos;ll contact you by WhatsApp, SMS or email to confirm and pay when your shirt is ready — cancel free anytime before that. <a href="/privacy">Privacy Policy</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
