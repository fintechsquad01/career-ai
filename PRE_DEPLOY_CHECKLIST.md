# AISkillScore — Pre-Deployment Checklist

> Last updated: Feb 14, 2026
> Use this checklist before going live at aiskillscore.com
> Canonical release checklist source: `docs/CODE_HEALTH_CHECKLIST.md`

---

## Closeout Status (2026-02-19)

Release readiness state recorded during merge-state/governance closeout:

- [x] Branding governance terminal state recorded (`.github/branding-rollout/merge-state.json` set to `A/B/C/D=true`)
- [x] Branding rollout gate final-state behavior documented (`docs/BRANDING_ROLLOUT_COORDINATION.md`)
- [ ] Pre-deploy production setup tasks in this checklist are still pending explicit execution evidence

---

## 1. Third-Party Accounts & API Keys

All services below must be set up with **production** (not test) credentials.

| Service | What You Need | Status |
|---------|--------------|--------|
| **Supabase** | Project URL, Anon Key, Service Role Key | ☐ |
| **Stripe** | Live Secret Key, Publishable Key | ☐ |
| **OpenRouter** | API Key (funds loaded for Gemini 2.5 Pro) | ☐ |
| **Resend** | API Key + domain verified for `aiskillscore.com` | ☐ |
| **Vercel** | Project connected to GitHub repo | ☐ |
| **PostHog** (optional) | Project Key + Host URL | ☐ |

### Key budget note
OpenRouter charges per token. With Gemini 2.5 Pro on all tools, estimate ~$0.01-0.05 per tool run. Ensure your OpenRouter account has sufficient funds (recommend $50+ to start).

---

## 2. Supabase Production Setup

### 2.1 Apply Migrations
```bash
supabase link --project-ref znntwsrwhbvtzbkeydfj
supabase db push --project-ref znntwsrwhbvtzbkeydfj
```

Or run each migration manually via SQL Editor (see `DEPLOY_TIER3.md` Task 3.1).

**Verify migrations applied:**
```sql
-- Should return 4 rows
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('award_daily_credits', 'spend_tokens', 'increment_view_count', 'process_referral', 'add_tokens');

-- Should return daily_credits_balance, last_daily_credit_at, notification_preferences
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('daily_credits_balance', 'last_daily_credit_at', 'notification_preferences');
```

### 2.2 Deploy Edge Functions
```bash
supabase functions deploy run-tool --project-ref znntwsrwhbvtzbkeydfj
supabase functions deploy parse-input --project-ref znntwsrwhbvtzbkeydfj
supabase functions deploy parse-url --project-ref znntwsrwhbvtzbkeydfj
supabase functions deploy generate-headshots --project-ref znntwsrwhbvtzbkeydfj
supabase functions deploy create-share --project-ref znntwsrwhbvtzbkeydfj
supabase functions deploy capture-email --project-ref znntwsrwhbvtzbkeydfj
```

### 2.3 Set Edge Function Secrets
```bash
supabase secrets set \
  OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY \
  RESEND_API_KEY=re_YOUR_KEY \
  APP_URL=https://aiskillscore.com \
  --project-ref znntwsrwhbvtzbkeydfj
```

### 2.4 Configure Auth
In Supabase Dashboard → Authentication → Settings:
- ☐ Site URL: `https://aiskillscore.com`
- ☐ Redirect URLs: `https://aiskillscore.com/auth/callback`
- ☐ Enable Google OAuth (if using): Client ID + Secret configured
- ☐ Email templates customized (optional but recommended)

### 2.5 Verify RLS Policies
```sql
-- All tables should have RLS enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('profiles', 'tool_results', 'token_transactions', 'shared_scores', 'referrals', 'captured_emails');
```
All should show `rowsecurity = true`.

---

## 3. Stripe Production Setup

### 3.1 Create Products & Prices
Run the automated setup script or create manually in Stripe Dashboard:

| Product | Price | Metadata: `pack_id` | Metadata: `tokens` |
|---------|-------|---------------------|---------------------|
| Starter Pack | $14.00 one-time | `starter` | `50` |
| Pro Pack | $39.00 one-time | `pro` | `200` |
| Power Pack | $79.00 one-time | `power` | `500` |
| Lifetime Early Bird | Match active pricing config | `lifetime_early` | Match active pricing config |
| Lifetime Standard | Match active pricing config | `lifetime_standard` | Match active pricing config |

### 3.2 Create Webhook
- ☐ Endpoint URL: `https://aiskillscore.com/api/webhooks/stripe`
- ☐ Event: `checkout.session.completed`
- ☐ Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### 3.3 Copy Price IDs
Copy each `price_...` ID into the corresponding Vercel environment variable.

---

## 4. Vercel Environment Variables

Set **all** of these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page (secret) |
| `STRIPE_SECRET_KEY` | Stripe → API Keys (live) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Same page |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → Signing secret |
| `STRIPE_PRICE_STARTER` | Stripe → Products → Starter price ID |
| `STRIPE_PRICE_PRO` | Stripe → Products → Pro price ID |
| `STRIPE_PRICE_POWER` | Stripe → Products → Power price ID |
| `STRIPE_PRICE_LIFETIME_EARLY` | Stripe → Products → Lifetime Early Bird price ID |
| `STRIPE_PRICE_LIFETIME` | Stripe → Products → Lifetime Standard price ID |
| `OPENROUTER_API_KEY` | OpenRouter → Settings → Keys |
| `RESEND_API_KEY` | Resend → API Keys |
| `CRON_SECRET` | Generate: `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | `https://aiskillscore.com` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog (optional) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog (optional) |

After setting vars, **trigger a new deployment** (push a commit or manual redeploy).

---

## 5. Domain & DNS

- ☐ Domain `aiskillscore.com` added in Vercel
- ☐ DNS A/CNAME records pointing to Vercel
- ☐ SSL certificate provisioned (automatic on Vercel)
- ☐ `www.aiskillscore.com` redirects to `aiskillscore.com` (or vice versa)
- ☐ Resend domain verification DNS records added (SPF, DKIM, DMARC)

---

## 6. Post-Deploy Verification

### 6.1 Quick Smoke Test
```bash
# App loads
curl -s -o /dev/null -w "Homepage: %{http_code}\n" https://aiskillscore.com

# Sitemap accessible
curl -s -o /dev/null -w "Sitemap: %{http_code}\n" https://aiskillscore.com/sitemap.xml

# Robots.txt accessible
curl -s -o /dev/null -w "Robots: %{http_code}\n" https://aiskillscore.com/robots.txt

# Edge functions respond (401 = auth required, good; 404 = not deployed, bad)
curl -s -o /dev/null -w "run-tool: %{http_code}\n" -X POST https://znntwsrwhbvtzbkeydfj.supabase.co/functions/v1/run-tool

# Stripe webhook (400 = no payload, good; 404 = broken, bad)
curl -s -o /dev/null -w "Webhook: %{http_code}\n" -X POST https://aiskillscore.com/api/webhooks/stripe
```

### 6.2 Full Feature Test
- ☐ Homepage loads with Smart Input
- ☐ Auth page: signup with email/password works
- ☐ Auth page: Google OAuth works (if configured)
- ☐ New user gets 15 signup tokens
- ☐ Dashboard loads with correct token balance
- ☐ Daily free tokens are awarded on first login of the day
- ☐ Free tool (AI Displacement Score) works without tokens
- ☐ Paid tool (JD Match, 5 tokens) deducts tokens and returns results
- ☐ Paywall appears when tokens insufficient
- ☐ Token purchase flow (Stripe checkout → webhook → balance update)
- ☐ Share result → OG image generates correctly
- ☐ Referral link generates and copies to clipboard
- ☐ Blog pages load (`/blog`, `/blog/will-ai-replace-my-job`)
- ☐ Compare pages load (`/compare`, `/compare/aiskillscore-vs-jobscan`)
- ☐ Pricing page loads with all 3 packs
- ☐ Lifetime deal page loads

### 6.3 SEO Verification
- ☐ `https://aiskillscore.com/sitemap.xml` — returns valid XML with all URLs
- ☐ `https://aiskillscore.com/robots.txt` — shows correct allow/disallow rules
- ☐ `https://aiskillscore.com/llms.txt` — accessible, lists all tools and content
- ☐ `https://aiskillscore.com/ai.txt` — accessible, shows AI policy
- ☐ Google Rich Results Test: paste homepage URL — should show FAQPage, HowTo, Organization
- ☐ OG images render: check `https://aiskillscore.com/api/og` in browser
- ☐ Submit to Google Search Console and verify domain ownership
- ☐ Submit sitemap in Search Console
- ☐ Trigger IndexNow: `curl -X POST https://aiskillscore.com/api/indexnow -H "Authorization: Bearer YOUR_CRON_SECRET" -H "Content-Type: application/json" -d '{}'`

### 6.4 Security Check
- ☐ No `.env.local` or secrets committed to git
- ☐ Service role key only used server-side (not in `NEXT_PUBLIC_` vars)
- ☐ All API routes require auth or have proper guards
- ☐ RLS enabled on all Supabase tables
- ☐ Stripe webhook validates signature
- ☐ CORS headers set correctly (check `vercel.json`)

---

## 7. Post-Launch Immediate Tasks

| Task | When | Priority |
|------|------|----------|
| Submit to Google Search Console | Day 1 | High |
| Submit sitemap to Bing Webmaster Tools | Day 1 | High |
| Trigger IndexNow for all pages | Day 1 | High |
| Test Stripe with a real $5 purchase (refund after) | Day 1 | High |
| Set up PostHog/analytics dashboards | Day 1 | Medium |
| Submit to AI tool directories (Futurepedia, There's an AI For That) | Week 1 | Medium |
| Create Product Hunt listing (draft) | Week 1 | Medium |
| First Reddit post in r/resumes or r/careeradvice | Week 1 | Medium |
| Monitor error logs (Vercel + Supabase) | Daily | High |
| Check OpenRouter spend and model latency | Daily | High |

---

## Quick Reference

| What | URL |
|------|-----|
| Production app | https://aiskillscore.com |
| Supabase Dashboard | https://supabase.com/dashboard/project/znntwsrwhbvtzbkeydfj |
| Stripe Dashboard | https://dashboard.stripe.com |
| Vercel Dashboard | https://vercel.com (your project) |
| OpenRouter Dashboard | https://openrouter.ai/activity |
| Resend Dashboard | https://resend.com |
| Google Search Console | https://search.google.com/search-console |
| Bing Webmaster Tools | https://www.bing.com/webmasters |
