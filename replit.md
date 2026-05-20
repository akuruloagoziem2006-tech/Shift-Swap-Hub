# ShiftSwap

A mobile-first AI shift swap platform for essential workers — nurses, retail, warehouse, and security staff can post shifts they need covered, browse available shifts, apply to cover others, and message each other directly.

## Run & Operate

- `pnpm --filter @workspace/shiftswap run dev` — run the frontend (uses PORT from workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind v4, Wouter, shadcn/ui, @tanstack/react-query
- Auth: Clerk (`@clerk/react`, `@clerk/express`) — Safety Orange theme
- API: Express 5, Zod validation
- DB: PostgreSQL + Drizzle ORM
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Payments: Stripe (optional, uses `STRIPE_SECRET_KEY` — dev mock fallback when absent)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/shiftswap/` — React+Vite frontend (previewPath `/`)
- `artifacts/api-server/` — Express 5 API server (previewPath `/api`)
- `lib/db/` — Drizzle ORM schema + client (composite lib)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod schemas for server-side validation
- DB schema: `lib/db/src/schema/` (profiles, shifts, shift_requests, messages, activity)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed hooks + Zod validators
- Clerk proxy middleware at `/api/__clerk` handles auth on custom/Replit domains
- Auth is cookie-based (no bearer tokens); Clerk middleware on all Express routes
- `requireAuth()` helper in `routes/profiles.ts` — re-exported to other route files
- Stripe checkout with optional key: dev mode returns mock session URL
- Conversation IDs are deterministic: `[userId1, userId2].sort().join("_")`

## Product

- Landing page with hero, how-it-works, stats, testimonials, pricing teaser
- Clerk auth (email + Google OAuth) with custom branded sign-in/sign-up pages
- Dashboard: live stats (active shifts, incoming/outgoing requests, completed swaps)
- Browse shifts with role/type/search filters
- Post a shift form (swap or cover, date/time/pay/notes)
- Shift detail with applicant management (approve/reject)
- My Shifts + My Requests pages
- Real-time messages with per-conversation thread view
- Calendar view showing shifts by date
- Pricing page: Free (3 swaps/month) vs Pro Lifetime ($49) with Stripe checkout

## User preferences

- Mobile-first, Safety Orange (#F97316) as primary color
- No emojis anywhere in the UI
- Employer approval disclaimer shown on all shift-related pages
- Dark mode supported via `.dark` class toggle (persisted in localStorage)

## Gotchas

- Always run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` — the DB lib must be compiled first
- Never call service ports directly — use `localhost:80/<path>` through the shared proxy
- `tailwindcss({ optimize: false })` is required in vite.config.ts for Clerk theme CSS layers to work correctly
- Stripe package is bundled but only activated when `STRIPE_SECRET_KEY` is set; dev mode returns mock checkout URL
- `useListShifts({ mine: true })` returns all statuses for that user; without `mine`, returns only `open` shifts

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `.local/skills/clerk-auth/` for Clerk customization reference
