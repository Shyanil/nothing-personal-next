# Nothing Personal — Drop 001 (Next.js)

# nothing-personal-next

## Run
    npm install          # first time only
    npm run build && npm start      # production, http://localhost:3000
    npm run dev                     # while editing (auto-reload)

## Where things are
- Price (₹ / $): `lib/shop.ts` → `PRICE`; shipping → `SHIPPING`
- Public address (mmayara.com subdomain): `SITE_URL` in `.env.local`
- Landing page: `app/page.tsx` · form: `components/Checkout.tsx`
- Privacy page: `app/privacy/page.tsx`
- Styles: `app/globals.css` · images: `public/assets/`
- Signups saved to Supabase table `nothing_personal` through `/api/signup`.
- Run `supabase/nothing_personal.sql` in the Supabase SQL Editor before taking submissions. It creates the table, enables RLS, and allows anonymous inserts only.
- `.env` contains the Supabase URL and publishable key. Restart the server after changing environment variables.
- Supabase is the only signup store. Anonymous visitors can insert but cannot read the table.
- The optional `/admin?key=<ADMIN_KEY>` dashboard reads Supabase and requires server-side `SUPABASE_SECRET_KEY` plus `ADMIN_KEY`. Never put the secret key in `wrangler.jsonc` or a public environment variable.

## Cloudflare Workers with GitHub
- Connect this repository as a **Worker** named `nothing-personal-next`, not a static Pages project. The app has dynamic Next.js routes; the Worker name must match `wrangler.jsonc`.
- Production branch: `main`; root directory: `/`.
- Build command: `npm run cf:build`.
- Deploy command: `npm run cf:deploy`.
- The public Supabase URL and publishable key are in `wrangler.jsonc`; its publishable key has only the insert permission granted by `supabase/nothing_personal.sql`.
- If using `/admin`, set `ADMIN_KEY` and `SUPABASE_SECRET_KEY` as Worker secrets in the Cloudflare dashboard. The signup form does not need these secrets.
- The `.env` file is for local development and is not committed.
