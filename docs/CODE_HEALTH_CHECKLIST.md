# Code Health Checklist

This is the canonical release checklist for engineering readiness.
Use this file as the source of truth for release gates; `PRE_DEPLOY_CHECKLIST.md` and `E2E_TEST_CHECKLIST.md` are execution runbooks.

## Closeout Status (2026-02-19)

Evidence-backed release readiness snapshot for governance closeout:

- [x] Branding rollout merge state reflects terminal completion (`A/B/C/D=true`) in `.github/branding-rollout/merge-state.json`
- [x] Branding CI gate terminal-state behavior is documented in `docs/BRANDING_ROLLOUT_COORDINATION.md`
- [ ] Pre-push checks completed for this release candidate (`typecheck`, `lint`, `build`, mobile verification)
- [ ] Production release checks completed (env vars, webhook/cron checks, edge functions, migrations, Stripe webhook)

## Canonical Product Constants (Release Verification)

Use these constants when validating release copy and pricing behavior.
Source of truth: `src/lib/constants.ts`.

- Signup bonus: **15 free tokens**
- Daily login bonus: **2 free tokens/day** (daily balance cap: **14**)

### Tool token costs

| Tool | Tokens |
|---|---:|
| AI Displacement Score | 0 |
| JD Match | 5 |
| Resume Optimizer | 15 |
| Cover Letter | 8 |
| LinkedIn Optimizer | 15 |
| AI Headshots | 25 |
| Interview Prep | 8 |
| Skills Gap Analysis | 8 |
| Career Roadmap | 15 |
| Salary Negotiation | 8 |
| Entrepreneurship | 12 |

### Token packs

| Pack | Tokens | Price |
|---|---:|---:|
| Starter | 50 | $14 |
| Pro | 200 | $39 |
| Power | 500 | $79 |

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
| `landing_variant_view` | Landing exposure denominator for CTR/conversion |
| `landing_analyze` | Brand CTA engagement numerator (CTR signal) |
| `signup_start` and `signup_complete` | Signup funnel progression and conversion |
| `tool_run` and `tool_complete` | Tool completion rate and drop-off signal |
| `paywall_shown` and `token_purchase` | Monetization funnel signal |
| `share_created` | Viral growth signal |

### KPI Governance Cross-Reference

For governance formulas, pass/fail thresholds, and review templates, use:

- `docs/BRAND_QA_SCORECARD.md`
- `docs/BRAND_METRICS_CADENCE.md`
- `docs/BRANDING_ROLLOUT_COORDINATION.md`

### Vercel Function Logs

- Check `/api/webhooks/stripe` for 500s — indicates webhook secret mismatch or unhandled event types.
- Check `/api/cron/*` for failures — indicates missing env vars or Supabase connectivity issues.
- Monitor cold start times for API routes calling Anthropic — set appropriate `maxDuration` in route config.
- Review Edge Function invocation logs in Supabase Dashboard for `run-tool` errors.
