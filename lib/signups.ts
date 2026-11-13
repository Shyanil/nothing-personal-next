export const FIELDS = [
  'timestamp_ist', 'name', 'email', 'country', 'phone', 'size', 'qty',
  'currency', 'intent', 'source', 'utm_source', 'utm_campaign',
] as const;
export type Row = Record<(typeof FIELDS)[number], string>;

const endpoint = () => {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error('SUPABASE_URL is missing.');
  return `${url.replace(/\/$/, '')}/rest/v1/nothing_personal`;
};

export async function addRow(row: Row): Promise<{ duplicate: boolean }> {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!key) throw new Error('SUPABASE_PUBLISHABLE_KEY is missing.');

  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ ...row, qty: Number(row.qty) }),
    cache: 'no-store',
  });
  if (response.ok) return { duplicate: false };

  const error = await response.json().catch(() => ({})) as { code?: string; message?: string };
  if (response.status === 409 && error.code === '23505') return { duplicate: true };
  throw new Error(`Supabase insert failed (${response.status}): ${error.code ?? error.message ?? 'unknown error'}`);
}

// Used only by the protected admin route. A server-side Supabase secret is required.
export async function readRows(): Promise<Row[]> {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error('SUPABASE_SECRET_KEY is missing.');
  const url = `${endpoint()}?select=${FIELDS.join(',')}&order=created_at.desc&limit=1000`;
  const response = await fetch(url, { headers: { apikey: key }, cache: 'no-store' });
  if (!response.ok) throw new Error(`Supabase read failed (${response.status}).`);
  const rows = await response.json() as Record<string, unknown>[];
  return rows.map(row => Object.fromEntries(FIELDS.map(field => [field, String(row[field] ?? '')])) as Row);
}
