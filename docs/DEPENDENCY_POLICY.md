# Dependency Policy

## When to Add a Dependency

Add a dependency only when **all** of the following are true:

1. It solves a non-trivial problem that would take >100 lines to implement correctly in-house.
2. It is actively maintained: last npm publish within 6 months.
3. npm weekly downloads > 10,000 (proves community trust).
4. No unresolved critical/high security advisories on the package.
5. Client-side packages must be under 50KB gzipped (check with `bundlephobia.com`).
6. It does not duplicate functionality already covered by an existing dependency.

## How to Choose

Evaluate candidates on these criteria:

| Criterion | Requirement |
|---|---|
| Maintenance | Active commits in the last 6 months, responsive to issues |
| Bundle size | < 50KB gzipped for client, no limit for server-only |
| License | MIT, Apache-2.0, or ISC only |
| Native binaries | None — Vercel serverless does not support arbitrary native deps |
| TypeScript types | Built-in types or `@types/*` package must exist |
| Peer deps | Must not conflict with existing React 19 / Next.js 16 versions |

When two packages are comparable, prefer the one with fewer transitive dependencies.

## Pinning Strategy

- **Caret `^`** for most dependencies — allows compatible minor/patch updates.
- **Exact pin** for critical infrastructure to prevent surprise breakage:
  - `next`, `react`, `react-dom` — exact versions (e.g., `"19.2.3"`)
  - `@supabase/supabase-js`, `@supabase/ssr` — exact versions
  - `stripe`, `@stripe/stripe-js` — exact versions
- **`package-lock.json` must be committed.** Never `.gitignore` the lock file.
- Run `npm ci` in CI/CD, never `npm install`.

## Update Cadence

| Priority | Action | Timeline |
|---|---|---|
| Critical/high security patch | Update immediately | Same day |
| `npm audit` review | Run and triage | Weekly |
| Minor version updates | Review changelog, test, update | Monthly |
| Major version upgrades | Evaluate breaking changes, create branch, test thoroughly | As needed |

Run `npm audit` weekly. Any `high` or `critical` finding must be resolved before the next deploy.

## Current Inventory

### Production Dependencies

| Package | Purpose |
|---|---|
| `next` (16.1.6) | App framework — App Router, API routes, SSR |
| `react` / `react-dom` (19.2.3) | UI rendering |
| `@supabase/supabase-js` (2.95.3) | Supabase client — auth, database, realtime |
| `@supabase/ssr` (0.8.0) | Supabase cookie-based auth for Next.js SSR |
| `stripe` (20.3.1) | Stripe server SDK — checkout, webhooks |
| `@stripe/stripe-js` (8.7.0) | Stripe client SDK — Elements, redirects |
| `zustand` (5.0.11) | Lightweight client state management |
| `@anthropic-ai/sdk` (0.74.0) | Anthropic Claude API for AI tool execution |
| `lucide-react` (0.563.0) | Icon library (tree-shakeable) |
| `posthog-js` (1.345.5) | Product analytics |
| `pdfjs-dist` (5.4.624) | Client-side PDF text extraction for resume parsing |
| `jszip` (3.10.1) | ZIP file handling for bulk exports |
| `resend` (6.9.2) | Transactional email (currently unused — raw fetch used) |
| `@vercel/og` (0.8.6) | OG image generation at the edge |

### Key Dev Dependencies

| Package | Purpose |
|---|---|
| `typescript` (5.x) | Type checking |
| `eslint` (9.x) / `eslint-config-next` | Linting |
| `tailwindcss` (4.x) / `@tailwindcss/postcss` | Styling |
| `@playwright/test` / `playwright` | E2E testing |
| `tsx` (4.x) | Running TypeScript scripts directly |
