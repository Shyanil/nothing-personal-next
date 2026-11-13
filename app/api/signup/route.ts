import { NextResponse } from 'next/server';
import { addRow } from '@/lib/signups';
import { MAX_QTY } from '@/lib/shop';
import { validEmail, validFullPhone, validName, validQty, validSize, type SignupField } from '@/lib/validation';

const INTENTS = ['instant', 'likely', 'maybe'];

export const runtime = 'nodejs';

const bad = (error: string, status = 400, field?: SignupField) => NextResponse.json({ error, field }, { status });

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 4096) return bad('Too large.', 413);
  let d: Record<string, unknown>;
  try { d = JSON.parse(raw || '{}'); } catch { return bad('Bad request.'); }
  if (!d || typeof d !== 'object' || Array.isArray(d)) return bad('Bad request.');

  const clean = (k: string, m = 120) => String(d[k] ?? '').trim().slice(0, m);
  const phone = clean('phone', 24);
  const qty = d.qty;

  const ist = new Date(Date.now() + 5.5 * 3600e3).toISOString().replace('T', ' ').slice(0, 19);
  const row = {
    timestamp_ist: ist,
    name: clean('name', 81), email: clean('email', 121).toLowerCase(), country: clean('country', 3).toUpperCase(),
    phone, size: clean('size', 5), qty: String(qty),
    currency: clean('currency', 4),
    intent: clean('intent', 10), source: clean('source', 40),
    utm_source: clean('utm_source', 60), utm_campaign: clean('utm_campaign', 60),
  };

  if (!validName(row.name)) return bad('Enter a name with at least 2 characters.', 400, 'name');
  if (!validEmail(row.email)) return bad('Enter a valid email.', 400, 'email');
  if (!/^[A-Z]{2}$/.test(row.country) || !validFullPhone(row.phone, row.country)) return bad('Check your country code and phone number.', 400, 'phone');
  if (!validSize(row.size)) return bad('Pick a size.', 400, 'size');
  if (!validQty(qty)) return bad(`Choose between 1 and ${MAX_QTY} shirts.`, 400, 'qty');
  if (row.currency !== 'USD' && row.currency !== 'INR') return bad('Choose a currency.', 400, 'currency');
  if (row.intent && !(INTENTS as readonly string[]).includes(row.intent)) row.intent = '';
  if (d.consent !== true) return bad('Consent is required.', 400, 'consent');

  try {
    const { duplicate } = await addRow(row);
    if (!duplicate) console.log(`[signup] ${row.name} · ${row.size} x${row.qty} · ${row.country} · ${row.intent}`);
    return NextResponse.json({ ok: true, duplicate });
  } catch (e) {
    console.error('[signup] write failed', e);
    return bad('Could not save right now. Please try again.', 500);
  }
}
