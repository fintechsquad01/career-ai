# AISkillScore — Tier 3 Production Deployment Guide

> **Generated:** February 12, 2026
> **Prerequisite:** Tiers 1 & 2 complete and merged (PRs #2, #4, #6, #8, #10)
> **Project ref:** `znntwsrwhbvtzbkeydfj`
> **Estimated time:** ~2 hours total

---

## Pre-flight Checklist

```bash
# Verify CLIs installed
supabase --version   # Should be ≥ 2.75.0
stripe --version     # Should be ≥ 1.35.0

# Authenticate CLIs (interactive — opens browser)
supabase login
stripe login

# Link Supabase project
cd /Users/ok1384/Documents/cursor/careerai
supabase link --project-ref znntwsrwhbvtzbkeydfj
```

---

## Task 3.1 — Apply Supabase Migrations to Production (30 min)

### Option A: Supabase CLI (recommended)

```bash
cd /Users/ok1384/Documents/cursor/careerai

# Push all pending migrations to production
supabase db push --project-ref znntwsrwhbvtzbkeydfj
```

### Option B: Supabase Dashboard SQL Editor

If CLI auth fails, run each migration manually:

1. Go to: https://supabase.com/dashboard/project/znntwsrwhbvtzbkeydfj/sql/new
2. Run each migration file **in order**:

#### Migration 002: Fix Shared Scores RLS

```sql
-- Fix overly permissive RLS policy on shared_scores
DROP POLICY IF EXISTS "Anyone can update view count" ON shared_scores;

CREATE OR REPLACE FUNCTION increment_view_count(p_score_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_scores
  SET view_count = view_count + 1
  WHERE id = p_score_id;
END;
$$;

ALTER TABLE tool_results ADD COLUMN IF NOT EXISTS inputs JSONB;
```

#### Migration 003: Daily Credits System

```sql
-- Add daily credits columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_credits_balance INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_daily_credit_at TIMESTAMPTZ;

-- Award daily credits function
CREATE OR REPLACE FUNCTION award_daily_credits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_last_award TIMESTAMPTZ;
  v_daily_balance INTEGER;
  v_purchased_balance INTEGER;
  v_today DATE := (NOW() AT TIME ZONE 'UTC')::DATE;
  v_awarded BOOLEAN := FALSE;
BEGIN
  SELECT last_daily_credit_at, daily_credits_balance, token_balance
  INTO v_last_award, v_daily_balance, v_purchased_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_last_award IS NULL OR (v_last_award AT TIME ZONE 'UTC')::DATE < v_today THEN
    IF v_daily_balance < 14 THEN
      v_daily_balance := LEAST(v_daily_balance + 2, 14);
      v_awarded := TRUE;

      UPDATE public.profiles
      SET daily_credits_balance = v_daily_balance,
          last_daily_credit_at = NOW(),
          updated_at = NOW()
      WHERE id = p_user_id;

      INSERT INTO public.token_transactions (user_id, amount, balance_after, type, description)
      VALUES (p_user_id, 2, v_purchased_balance + v_daily_balance, 'daily_credit', 'Daily login credit');
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'awarded', v_awarded,
    'daily_balance', v_daily_balance,
    'purchased_balance', v_purchased_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Updated spend_tokens function (daily credits first)
CREATE OR REPLACE FUNCTION spend_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_tool_id TEXT,
  p_tool_result_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_purchased_balance INTEGER;
  v_daily_balance INTEGER;
  v_last_award TIMESTAMPTZ;
  v_total_balance INTEGER;
  v_remaining INTEGER;
  v_daily_spent INTEGER := 0;
  v_purchased_spent INTEGER := 0;
BEGIN
  SELECT token_balance, daily_credits_balance, last_daily_credit_at
  INTO v_purchased_balance, v_daily_balance, v_last_award
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_last_award IS NOT NULL AND v_last_award < NOW() - INTERVAL '7 days' THEN
    v_daily_balance := 0;
  END IF;

  v_total_balance := v_purchased_balance + v_daily_balance;

  IF v_total_balance < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_TOKENS';
  END IF;

  v_remaining := p_amount;

  IF v_daily_balance > 0 AND v_remaining > 0 THEN
    v_daily_spent := LEAST(v_daily_balance, v_remaining);
    v_daily_balance := v_daily_balance - v_daily_spent;
    v_remaining := v_remaining - v_daily_spent;
  END IF;

  IF v_remaining > 0 THEN
    v_purchased_spent := v_remaining;
    v_purchased_balance := v_purchased_balance - v_purchased_spent;
  END IF;

  UPDATE public.profiles
  SET token_balance = v_purchased_balance,
      daily_credits_balance = v_daily_balance,
      total_tokens_spent = total_tokens_spent + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;

  v_total_balance := v_purchased_balance + v_daily_balance;

  INSERT INTO public.token_transactions (user_id, amount, balance_after, type, description, tool_result_id)
  VALUES (p_user_id, -p_amount, v_total_balance, 'tool_use', p_tool_id, p_tool_result_id);

  RETURN v_total_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

#### Migration 004: Settings Enhancements

```sql
-- Avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '/'))[1]
);
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '/'))[1]
);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (
  bucket_id = 'avatars'
);

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{"marketing": true, "product_updates": true}';

CREATE POLICY "Users delete own tool results" ON tool_results
  FOR DELETE USING (auth.uid() = user_id);
```

#### Migration 005: Process Referral Idempotency

```sql
CREATE OR REPLACE FUNCTION process_referral(
  p_referrer_id UUID,
  p_new_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.token_transactions
    WHERE user_id = p_new_user_id AND type = 'referral_bonus'
  ) THEN
    RETURN;
  END IF;

  PERFORM add_tokens(p_referrer_id, 10, 'referral_bonus', 'Referral reward');
  PERFORM add_tokens(p_new_user_id, 5, 'referral_bonus', 'Referral welcome bonus');

  UPDATE public.profiles SET referral_count = referral_count + 1 WHERE id = p_referrer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

### Verify Migrations

Run this in the SQL Editor to confirm:

```sql
-- Check daily_credits_balance column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('daily_credits_balance', 'last_daily_credit_at', 'notification_preferences');

-- Check functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('award_daily_credits', 'spend_tokens', 'increment_view_count', 'process_referral');

-- Check avatars bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check inputs column on tool_results
SELECT column_name FROM information_schema.columns
WHERE table_name = 'tool_results' AND column_name = 'inputs';
```

**Expected:** All queries return rows. 4 functions, 3 profile columns, avatars bucket, inputs column.

---

## Task 3.2 — Deploy Edge Functions to Production (30 min)

### Deploy All 6 Functions

```bash
cd /Users/ok1384/Documents/cursor/careerai

# Deploy all functions at once
supabase functions deploy run-tool --project-ref znntwsrwhbvtzbkeydfj
supabase functions deploy parse-input --project-ref znntwsrwhbvtzbkeydfj
supabase functions deploy parse-url --project-ref znntwsrwhbvtzbkeydfj
supabase functions deploy generate-headshots --project-ref znntwsrwhbvtzbkeydfj
supabase functions deploy create-share --project-ref znntwsrwhbvtzbkeydfj
supabase functions deploy capture-email --project-ref znntwsrwhbvtzbkeydfj
```

### Set Edge Function Secrets

The functions need these secrets (shared across all functions):

```bash
# Set all secrets at once
supabase secrets set \
  OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY \
  REPLICATE_API_TOKEN=r8_YOUR_TOKEN \
  RESEND_API_KEY=re_YOUR_KEY \
  APP_URL=https://aiskillscore.com \
  --project-ref znntwsrwhbvtzbkeydfj
```

> **Note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available
> in Edge Functions — you don't need to set them as secrets.

### Verify Edge Functions

```bash
# Should return 401 (auth required), NOT 404 (function not found)
curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://znntwsrwhbvtzbkeydfj.supabase.co/functions/v1/run-tool

# Should return 400 (missing body), NOT 404
curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://znntwsrwhbvtzbkeydfj.supabase.co/functions/v1/parse-input

# List deployed functions
supabase functions list --project-ref znntwsrwhbvtzbkeydfj
```

**Expected:** `run-tool` → 401, `parse-input` → 400 (no auth needed but needs body), all 6 functions listed.

---

## Task 3.3 — Set Vercel Environment Variables (15 min)

### Option A: Vercel Dashboard (recommended)

Go to: **Vercel Dashboard → [your project] → Settings → Environment Variables**

Add each variable below. Set scope to **Production** (and optionally Preview):

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://znntwsrwhbvtzbkeydfj.supabase.co` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | From Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIs...` | **Secret** — from same page |
| `STRIPE_SECRET_KEY` | `sk_live_...` | From Stripe Dashboard → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | From Stripe Dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Created in Task 3.4 |
| `STRIPE_PRICE_STARTER` | `price_...` | Created in Task 3.4 |
| `STRIPE_PRICE_PRO` | `price_...` | Created in Task 3.4 |
| `STRIPE_PRICE_POWER` | `price_...` | Created in Task 3.4 |
| `STRIPE_PRICE_LIFETIME_EARLY` | `price_...` | Created in Task 3.4 |
| `STRIPE_PRICE_LIFETIME` | `price_...` | Created in Task 3.4 |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | From OpenRouter dashboard |
| `REPLICATE_API_TOKEN` | `r8_...` | From Replicate dashboard |
| `RESEND_API_KEY` | `re_...` | From Resend dashboard |
| `CRON_SECRET` | *(generate below)* | Min 16 chars |
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_...` | From PostHog (optional) |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` | Or eu.i.posthog.com |
| `NEXT_PUBLIC_APP_URL` | `https://aiskillscore.com` | Your production domain |

### Generate CRON_SECRET

```bash
openssl rand -base64 32
# Example output: kJ7x2mNQ8vP3bR5wT1yF9hL4cA6dE0gI+nU/zXs=
```

### Option B: Vercel CLI

```bash
# Install and login
npx vercel login

# Set each variable (will prompt for value)
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
npx vercel env add STRIPE_SECRET_KEY production
npx vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
npx vercel env add STRIPE_WEBHOOK_SECRET production
npx vercel env add STRIPE_PRICE_STARTER production
npx vercel env add STRIPE_PRICE_PRO production
npx vercel env add STRIPE_PRICE_POWER production
npx vercel env add STRIPE_PRICE_LIFETIME_EARLY production
npx vercel env add STRIPE_PRICE_LIFETIME production
npx vercel env add OPENROUTER_API_KEY production
npx vercel env add REPLICATE_API_TOKEN production
npx vercel env add RESEND_API_KEY production
npx vercel env add CRON_SECRET production
npx vercel env add NEXT_PUBLIC_POSTHOG_KEY production
npx vercel env add NEXT_PUBLIC_POSTHOG_HOST production
npx vercel env add NEXT_PUBLIC_APP_URL production
```

> **Important:** After setting env vars, you must **redeploy** for them to take effect.

---

## Task 3.4 — Create Stripe Products and Prices (30 min)

### Option A: Automated Script (recommended)

```bash
cd /Users/ok1384/Documents/cursor/careerai

# With live key:
STRIPE_SECRET_KEY=sk_live_YOUR_KEY npx tsx scripts/setup-stripe-products.ts

# Or with test key first:
STRIPE_SECRET_KEY=sk_test_YOUR_KEY npx tsx scripts/setup-stripe-products.ts
```

The script creates all 5 products and prices, then prints the env vars to copy into Vercel.

### Option B: Stripe Dashboard

Go to: https://dashboard.stripe.com/products

Create 5 products (**one-time payments**, NOT subscriptions):

| Product | Price | Pack ID (metadata) |
|---------|-------|---------------------|
| AISkillScore Starter Pack | $5.00 | `starter` |
| AISkillScore Pro Pack | $15.00 | `pro` |
| AISkillScore Power Pack | $39.00 | `power` |
| AISkillScore Lifetime Deal — Early Bird | $49.00 | `lifetime_early` |
| AISkillScore Lifetime Deal — Standard | $79.00 | `lifetime_standard` |

For each product:
1. Click **+ Add product**
2. Name: (from table above)
3. Description: (see script for descriptions)
4. Price: (from table above), **One time** payment, USD
5. In **Metadata**, add: `pack_id` = (value from table), `tokens` = (token count)
6. **Save product**
7. Copy the **Price ID** (starts with `price_`)

### Set Up Stripe Webhook

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **+ Add endpoint**
3. Endpoint URL: `https://aiskillscore.com/api/webhooks/stripe`
   - (Replace with your actual production domain)
4. Events to listen: **checkout.session.completed**
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Set this as `STRIPE_WEBHOOK_SECRET` in Vercel

### Verify Stripe Setup

```bash
# List products
stripe products list --limit 5

# List prices
stripe prices list --limit 10

# Test webhook (requires stripe CLI logged in)
stripe trigger checkout.session.completed
```

---

## Task 3.5 — Set Up Resend for Production Email (20 min)

### Step 1: Create Resend Account & API Key

1. Go to: https://resend.com
2. Sign up / log in
3. Go to: https://resend.com/api-keys
4. Click **Create API key**
   - Name: `careerai-production`
   - Permission: **Full access**
5. Copy the API key (starts with `re_`)
6. Set as `RESEND_API_KEY` in both:
   - Vercel environment variables
   - Supabase Edge Function secrets

### Step 2: Verify Domain

1. Go to: https://resend.com/domains
2. Click **Add Domain**
3. Enter: `aiskillscore.com` (or your production domain)
4. Add the DNS records Resend provides to your domain's DNS:

| Type | Name | Value |
|------|------|-------|
| TXT | (SPF record) | `v=spf1 include:amazonses.com ~all` |
| CNAME | (DKIM record 1) | *(provided by Resend)* |
| CNAME | (DKIM record 2) | *(provided by Resend)* |
| CNAME | (DKIM record 3) | *(provided by Resend)* |
| TXT | `_dmarc` | `v=DMARC1; p=none;` |

5. Wait for verification (usually < 1 hour)
6. Status should show **Verified** ✅

### Step 3: Verify Email Sending

The app uses `noreply@aiskillscore.com` as the FROM address (see `src/lib/email.ts`).
If your domain is different, update the FROM address:

```typescript
// src/lib/email.ts, line 19
const FROM_ADDRESS = process.env.NODE_ENV === "production"
  ? "AISkillScore <noreply@yourdomain.com>"  // ← Update this
  : "AISkillScore Dev <onboarding@resend.dev>";
```

### Test Email Send

```bash
# Quick test via curl
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "AISkillScore <noreply@aiskillscore.com>",
    "to": "your-email@gmail.com",
    "subject": "AISkillScore Test Email",
    "html": "<h1>It works!</h1><p>Resend is configured correctly.</p>"
  }'
```

---

## Task 3.6 — Verify Cron Job After Deploy (5 min)

### Step 1: Verify Cron Configuration

The cron is already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

This runs daily at 10:00 AM UTC.

### Step 2: Check Vercel Dashboard

1. Go to: **Vercel Dashboard → [your project] → Settings → Cron Jobs**
2. Verify `/api/cron/daily-reminders` appears with schedule `0 10 * * *`
3. Status should show as **Active**

### Step 3: Manual Trigger Test

```bash
# Test the cron endpoint directly (replace with your domain and CRON_SECRET)
curl -X GET https://aiskillscore.com/api/cron/daily-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected response:**

```json
{ "sent": 0, "skippedOptOut": 0, "total": 0 }
```

(Zero is expected — no users have been inactive for 2+ days yet on a fresh deploy)

---

## Post-Deployment Verification Checklist

Run these checks after completing all tasks:

```bash
# 1. Edge Functions respond
curl -s -o /dev/null -w "run-tool: %{http_code}\n" -X POST https://znntwsrwhbvtzbkeydfj.supabase.co/functions/v1/run-tool
curl -s -o /dev/null -w "parse-input: %{http_code}\n" -X POST https://znntwsrwhbvtzbkeydfj.supabase.co/functions/v1/parse-input

# 2. App loads
curl -s -o /dev/null -w "App: %{http_code}\n" https://aiskillscore.com

# 3. Stripe webhook endpoint
curl -s -o /dev/null -w "Webhook: %{http_code}\n" -X POST https://aiskillscore.com/api/webhooks/stripe

# 4. Cron endpoint (should return 401 without secret)
curl -s -o /dev/null -w "Cron: %{http_code}\n" https://aiskillscore.com/api/cron/daily-reminders
```

**Expected:** run-tool→401, parse-input→400, App→200, Webhook→400, Cron→401

---

## Quick Reference: Secrets Summary

| Where | Secret | Source |
|-------|--------|--------|
| **Vercel** | 18 env vars | See Task 3.3 table |
| **Supabase Edge Functions** | `OPENROUTER_API_KEY` | OpenRouter dashboard |
| **Supabase Edge Functions** | `REPLICATE_API_TOKEN` | Replicate dashboard |
| **Supabase Edge Functions** | `RESEND_API_KEY` | Resend dashboard |
| **Supabase Edge Functions** | `APP_URL` | Your production URL |
| **Stripe** | Webhook signing secret | Task 3.4 |
| **Resend** | Domain DNS records | Task 3.5 |
