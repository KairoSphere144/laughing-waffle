# KairoSphere

Industrial intelligence and trade operations workspace. The initial operating market is Suriname, with an architecture intended to support international trade workflows over time.

## Operating architecture

The target 24/7 operating model, integration boundaries, security controls, phased implementation gates and Digital Explorer infrastructure policy are documented in [docs/OPERATING_ARCHITECTURE.md](docs/OPERATING_ARCHITECTURE.md). The planned participant hiring, engagement, work assignment, compensation approval and payment-record controls are specified in [docs/PARTICIPANT_WORKFORCE_MANAGEMENT.md](docs/PARTICIPANT_WORKFORCE_MANAGEMENT.md). These are architecture and product foundations, not claims that persistent workers, hiring or payouts are already deployed.

## Current build: authenticated foundation

- Responsive operations dashboard with USD and SRD totals kept separate.
- Supabase email/password sign-up and sign-in, email verification, and session restoration.
- Authenticated create, read, update, and delete operations for opportunities.
- Opportunity validation in the shared domain layer.
- Row-level security policies constrain records to their owning account.
- Node.js tests cover domain logic and the Supabase data adapter.

## Requirements

- Node.js 20.19 or later.
- A Supabase project with the `public.opportunities` migration applied.

## Configure and run locally

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` using the Supabase project URL and publishable key from project API settings. Browser code must only use the publishable key; never use a `service_role` or secret key.
3. Enable email/password authentication in Supabase. Add the local Vite URL, usually `http://localhost:5173`, to the allowed redirect URLs for email verification.
4. Run `npm install` and `npm run dev`, then open the local URL Vite prints.
5. Run `npm test` for tests and `npm run build` to produce a production bundle.

The `.env.local` file is ignored by Git. The app uses the Supabase publishable key in browser code and never uses a service-role or secret key. A migration revokes direct execute permission on the internal `rls_auto_enable()` event-trigger function from API roles; the trigger behavior is unchanged.

## GitHub Pages deployment

The Pages workflow builds and tests the Vite app on pushes to `main`. Add the following repository Actions variables under **Settings → Secrets and variables → Actions → Variables** before deployment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Set the Supabase Auth redirect allowlist to include `https://kairosphere144.github.io/laughing-waffle/` and the local Vite URL (`http://localhost:5173/`).

## Structure

```text
.
├── index.html
├── src/
│   ├── app.js
│   ├── domain.js
│   ├── opportunities.js
│   ├── styles.css
│   └── supabase.js
├── supabase/migrations/
├── tests/
│   ├── domain.test.js
│   └── opportunities.test.js
└── package.json
```

Financial functions are recordkeeping and analysis only; the application does not execute financial transactions. Live data must be source-attributed and distinguish verified, estimated, sample, and user-entered values.
