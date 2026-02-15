# Security Baseline

## Secrets Handling

- All secrets live in environment variables. **Never hardcode** keys, tokens, or connection strings.
- Local development: `.env.local` (git-ignored). Production: Vercel Dashboard > Settings > Environment Variables.
- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser bundle. Use this prefix exclusively for:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- **`SUPABASE_SERVICE_ROLE_KEY` must never appear in client code.** It bypasses RLS. Use it only in API routes and Edge Functions.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY`, `CRON_SECRET` — server-only, no `NEXT_PUBLIC_` prefix.

## Authentication

- Auth is handled by Supabase Auth via the `@supabase/ssr` package.
- Middleware (`src/middleware.ts`) protects these routes — unauthenticated users are redirected to `/auth`:
  - `/dashboard`, `/mission`, `/tools/*`, `/settings`, `/history`, `/referral`
- In Server Components: use `supabase.auth.getUser()`, **not** `getSession()` — `getUser()` validates the JWT against Supabase, while `getSession()` only reads the local cookie (spoofable).
- In Client Components: use the auth store or `onAuthStateChange` listener.
- Email confirmation is disabled (auto-confirm on signup).

## Authorization

- **Row Level Security (RLS) is enabled on every Supabase table.** No exceptions.
- RLS policies use `auth.uid()` to scope reads/writes to the authenticated user's own data.
- The Supabase service role client (which bypasses RLS) is instantiated only in:
  - Next.js API routes (`src/app/api/`)
  - Supabase Edge Functions (`supabase/functions/`)
- Admin-only routes check `ADMIN_EMAILS` env var against the authenticated user's email.
- Token spending uses the `spend_tokens` RPC function with server-side validation — clients cannot manipulate balances directly.

## API Security

- **Cron jobs:** All `/api/cron/*` routes verify `Authorization: Bearer <CRON_SECRET>`. Requests without a valid secret return 401.
- **Stripe webhooks:** `/api/webhooks/stripe` verifies the `stripe-signature` header using `stripe.webhooks.constructEvent()`. Invalid signatures return 400.
- **Rate limiting:** `checkRateLimit()` is applied to tool execution and auth-sensitive endpoints. Limits are enforced server-side.
- **CORS:** Handled by Vercel and Next.js defaults. No custom CORS headers needed. API routes are same-origin.

## Headers

Security headers are configured in `vercel.json`:

| Header | Value | Scope |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | `/api/*` |
| `X-Frame-Options` | `DENY` | `/api/*` |
| `X-XSS-Protection` | `1; mode=block` | `/api/*` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | All routes |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | All routes |

## Logging

- **No PII in logs.** Never log user emails, names, or full resume text.
- **No secrets in logs.** Never log tokens, API keys, or session cookies.
- Use structured error messages: `{ error: string, code: string, toolId?: string }`.
- Guard `console.log` with `process.env.NODE_ENV !== 'production'` or remove before merging.
- Prefer `console.error` for genuine error conditions that need visibility in Vercel function logs.

## JWT and Cookies

- Supabase manages JWT issuance, refresh, and rotation. Do not implement custom JWT logic.
- `@supabase/ssr` stores auth tokens in `httpOnly` cookies — not accessible to client-side JavaScript.
- Cookie attributes: `SameSite=Lax` (default), `Secure` in production, `Path=/`.
- Access token expiry: 3600 seconds (1 hour). Refresh happens automatically via the Supabase client.
- After JWT key rotation (ES256 as of Feb 2026), the `@supabase/supabase-js` v2.95+ client handles both legacy HS256 and new ES256 tokens transparently.
