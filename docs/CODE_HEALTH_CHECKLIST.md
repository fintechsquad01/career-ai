# Code Health Checklist

## Pre-Push Checklist

Run these before every push to `main`:

- [ ] 1. `npm run typecheck` — zero type errors
- [ ] 2. `npm run lint` — zero warnings or errors
- [ ] 3. `npm run build` — completes without failure
- [ ] 4. Test on mobile viewport (375px width in DevTools)
- [ ] 5. `git diff --cached` — no `.env`, secrets, or service role keys staged
- [ ] 6. No `console.log` left in component or page files
- [ ] 7. New environment variables added to `.env.example`

## Release Checklist

Before deploying to production:

- [ ] 1. Verify all env vars are set in Vercel Dashboard > Settings > Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `ANTHROPIC_API_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- [ ] 2. `npm run build` passes locally against production env vars
- [ ] 3. `/api/webhooks/stripe` returns 400 (bad payload), not 500 (misconfigured)
- [ ] 4. `/api/cron/daily-reminders` returns 401 without `CRON_SECRET` header
- [ ] 5. OG image generation works: visit `/api/og?tool=displacement&score=72`
- [ ] 6. Supabase Edge Functions are deployed: `supabase functions list`
- [ ] 7. Supabase migrations are applied: `supabase db push` or check Dashboard
- [ ] 8. Stripe webhook endpoint is registered and active in Stripe Dashboard

## Quick Smoke Tests

Run these curl commands against production after deploy:

```bash
# Landing page returns 200
curl -s -o /dev/null -w "%{http_code}" https://aiskillscore.com/
# Expected: 200

# Dashboard redirects unauthenticated users
curl -s -o /dev/null -w "%{http_code}" https://aiskillscore.com/dashboard
# Expected: 307 (redirect to /auth)

# Stripe checkout rejects unauthenticated requests
curl -s -o /dev/null -w "%{http_code}" -X POST https://aiskillscore.com/api/checkout
# Expected: 401

# Cron endpoint rejects requests without CRON_SECRET
curl -s -o /dev/null -w "%{http_code}" https://aiskillscore.com/api/cron/daily-reminders
# Expected: 401
```

## Monitoring

### PostHog Events to Watch

| Event | Indicates |
|---|---|
| `tool_run` | Tool usage volume and distribution |
| `tokens_spent` | Token economy health |
| `signup_completed` | Conversion funnel start |
| `paywall_shown` / `paywall_converted` | Monetization conversion |
| `share_created` | Viral growth signal |
| `error_boundary_hit` | Client-side crashes |

### Vercel Function Logs

- Check `/api/webhooks/stripe` for 500s — indicates webhook secret mismatch or unhandled event types.
- Check `/api/cron/*` for failures — indicates missing env vars or Supabase connectivity issues.
- Monitor cold start times for API routes calling Anthropic — set appropriate `maxDuration` in route config.
- Review Edge Function invocation logs in Supabase Dashboard for `run-tool` errors.
