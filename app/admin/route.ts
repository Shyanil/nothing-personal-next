import { FIELDS, readRows } from '@/lib/signups';
import { SIZES } from '@/lib/shop';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const e = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Signups dashboard. Requires ADMIN_KEY and SUPABASE_SECRET_KEY on the server. */
export async function GET(req: Request) {
  const key = process.env.ADMIN_KEY;
  const given = new URL(req.url).searchParams.get('key');
  if (!key || given !== key) return new Response('Not found', { status: 404 });

  let rows;
  try { rows = await readRows(); }
  catch (error) {
    console.error('[admin] could not read signups', error);
    return new Response('Signups are unavailable. Configure SUPABASE_SECRET_KEY.', { status: 503 });
  }
  const count = (k: keyof (typeof rows)[number]) => {
    const m = new Map<string, number>();
    rows.forEach(r => m.set(r[k] || '—', (m.get(r[k] || '—') ?? 0) + 1));
    return [...m].sort((a, b) => b[1] - a[1]);
  };
  const sizes = new Map<string, number>();
  rows.forEach(r => sizes.set(r.size, (sizes.get(r.size) ?? 0) + (parseInt(r.qty) || 1)));
  const chips = (list: [string, number][]) => list.map(([k, v]) => `<span class=k><b>${e(k)}</b>: ${v}</span>`).join('');

  const html = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><meta name=robots content=noindex><title>Signups</title>
<style>body{font:14px system-ui;background:#121011;color:#eee;padding:16px}table{border-collapse:collapse;width:100%}.t{overflow-x:auto}
td,th{border:1px solid #333;padding:6px;text-align:left;white-space:nowrap}th{background:#222}.k{display:inline-block;margin:0 16px 8px 0}h3{margin:16px 0 6px;color:#aaa;font-size:12px;letter-spacing:.1em}</style>
<h1>Pre-orders — ${rows.length}</h1>
<h3>SIZES (units)</h3>${chips(SIZES.map(s => [s, sizes.get(s) ?? 0]))}
<h3>PRICE INTENT</h3>${chips(count('intent'))}
<h3>COUNTRY</h3>${chips(count('country'))}
<h3>SOURCE</h3>${chips(count('source'))}
<div class=t><table><tr>${FIELDS.map(f => `<th>${f}</th>`).join('')}</tr>
${rows.map(r => `<tr>${FIELDS.map(f => `<td>${e(r[f] ?? '')}</td>`).join('')}</tr>`).join('')}</table></div>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
