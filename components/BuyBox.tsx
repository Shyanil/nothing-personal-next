'use client';
import { SIZES } from '@/lib/shop';
import { Price, ShippingNote, useShop, ZeroDue } from './Shop';
import { sfx } from './Sound';

export function SizePicker({ compact = false }: { compact?: boolean }) {
  const { size, setSize } = useShop();
  return (
    <div className={'sizes' + (compact ? ' compact' : '')} role="radiogroup" aria-label="Size">
      {SIZES.map(s => (
        <button key={s} type="button" role="radio" aria-checked={size === s} className={'size' + (size === s ? ' on' : '')}
          onClick={() => { setSize(s); sfx('select'); navigator.vibrate?.(8); }}>
          {s}
        </button>
      ))}
    </div>
  );
}

export function QtyStepper() {
  const { qty, setQty } = useShop();
  return (
    <div className="qty" aria-label="Quantity">
      <button type="button" aria-label="Decrease quantity" onClick={() => { setQty(qty - 1); sfx('tick'); }} disabled={qty <= 1}>−</button>
      <output aria-live="polite">{qty}</output>
      <button type="button" aria-label="Increase quantity" onClick={() => { setQty(qty + 1); sfx('tick'); }} disabled={qty >= 5}>+</button>
    </div>
  );
}

export function NotifyButton({ label = 'PRE-ORDER', className = '' }: { label?: React.ReactNode; className?: string }) {
  const { openCheckout } = useShop();
  return (
    <button type="button" className={'btn btn-primary ' + className} onClick={() => { sfx('open'); openCheckout(); }}>
      <span>{label}</span>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8z" fill="currentColor" /><path d="M9 8V7a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
    </button>
  );
}

export default function BuyBox() {
  return (
    <div className="buy">
      <div className="buy-tags">
        <span className="tag-rare">★ LIMITED · FIRST RUN</span>
        <span className="tag-live"><i className="dot" /> PRE-ORDER OPEN</span>
      </div>
      <h1 className="buy-title">Nothing Personal Tee</h1>
      <p className="buy-sub">Oversized full-sleeve · Washed black · Front + back print</p>

      <div className="buy-price">
        <span className="from">FROM</span>
        <b><Price /></b>
        <span className="due">Pay <ZeroDue /> today</span>
        <span className="ship"><ShippingNote /></span>
      </div>

      <div className="buy-row">
        <div className="row-head"><span>SELECT SIZE</span><a href="#fit" className="link">Fit guide</a></div>
        <SizePicker />
      </div>

      <div className="buy-row inline">
        <span className="row-label">QUANTITY</span>
        <QtyStepper />
      </div>

      <div id="buy-cta">
        <NotifyButton label={<>PRE-ORDER · PAY <ZeroDue /> NOW</>} className="btn-xl full" />
      </div>
      <p className="buy-note">Reserve yours in 20 seconds. Pay nothing today — you pay only when your shirt is ready to ship. Cancel free anytime before that.</p>

      <ul className="trust">
        <li><span>⚡</span><b>First run</b><small>Your size reserved</small></li>
        <li><span>🛡</span><b>Pay <ZeroDue /> now</b><small>No card needed</small></li>
        <li><span>🌍</span><b>Ships to you</b><small>Confirmed before you pay</small></li>
      </ul>
    </div>
  );
}

/** App-style bottom bar on phones — always visible, like a shop app. */
export function StickyBuy() {
  const { size } = useShop();
  return (
    <div className="sticky">
      <div className="st-info">
        <small>{size ? `SIZE ${size}` : 'FROM'}</small>
        <b><Price /></b>
      </div>
      <NotifyButton />
    </div>
  );
}
