'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { Currency, fmt, guessCountryFromBrowser, MAX_QTY, PRICE } from '@/lib/shop';

type Shop = {
  country: string; cur: Currency; ready: boolean;
  size: string; setSize: (s: string) => void;
  qty: number; setQty: (n: number) => void;
  checkout: boolean; openCheckout: () => void; closeCheckout: () => void;
};
const Ctx = createContext<Shop | null>(null);

/**
 * Region logic: visitors in India see ₹ only, everyone else sees $ only.
 * Country comes from the host's geo header when available (Vercel / Cloudflare), else the browser.
 */
export function ShopProvider({ serverCountry, children }: { serverCountry: string; children: React.ReactNode }) {
  const [country, setCountry] = useState(serverCountry);
  const [size, setSize] = useState('');
  const [qty, setQtyRaw] = useState(1);
  const [checkout, setCheckout] = useState(false);
  useEffect(() => { if (!serverCountry) setCountry(guessCountryFromBrowser()); }, [serverCountry]);
  const cur: Currency = country === 'IN' ? 'INR' : 'USD';
  return (
    <Ctx.Provider value={{
      country, cur, ready: !!country, size, setSize,
      qty, setQty: n => setQtyRaw(Math.max(1, Math.min(MAX_QTY, n))),
      checkout, openCheckout: () => setCheckout(true), closeCheckout: () => setCheckout(false),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useShop = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error('useShop outside ShopProvider');
  return s;
};

/** Price in the visitor's currency, e.g. ₹1,200 (India) or $14 (elsewhere). */
export function Price({ times = 1 }: { times?: number }) {
  const { cur, ready } = useShop();
  return <span className={'price-val' + (ready ? '' : ' loading')}>{ready ? fmt(cur, PRICE[cur] * times) : '₹0,000'}</span>;
}

/** Shipping amount is not shown yet — it is confirmed with the buyer before they pay. */
export function ShippingNote() {
  return <>+ shipping, confirmed before you pay</>;
}

/** Cart breakdown: shirts total; shipping amount is shared later. */
export function OrderTotals({ qty }: { qty: number }) {
  const { cur, ready } = useShop();
  if (!ready) return null;
  return (
    <>
      <div><span>{qty} × Tee</span><span>{fmt(cur, PRICE[cur] * qty)}</span></div>
      <div><span>Shipping</span><span className="later">Confirmed before you pay</span></div>
    </>
  );
}

export function ZeroDue() {
  const { cur } = useShop();
  return <>{cur === 'INR' ? '₹0' : '$0'}</>;
}
