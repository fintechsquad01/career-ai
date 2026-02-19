# AISkillScore — End-to-End Test Checklist

> Manual test plan covering all critical user flows.  
> Run through each section after deploying changes.  
> Last updated: February 2026
> Canonical release checklist source: `docs/CODE_HEALTH_CHECKLIST.md`

---

## Closeout Status (2026-02-19)

Execution status captured for release-readiness closeout:

- [x] Branding governance closeout is complete (`merge-state.json` terminalized; gate behavior documented)
- [ ] Full E2E test execution for this release has not yet been marked complete in this checklist

---

## Prerequisites

Before testing, ensure these environment variables are configured:

| Variable | Required For |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All auth & data flows |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All auth & data flows |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron, admin queries |
| `RESEND_API_KEY` | Email tests (no-ops if missing) |
| `CRON_SECRET` | Daily reminder cron |
| `OPENROUTER_API_KEY` | All AI tool runs |
| `STRIPE_SECRET_KEY` | Payment tests |
| `NEXT_PUBLIC_APP_URL` | Email CTA links |

---

## 1. Authentication

### 1a. Email/Password Sign Up
- [ ] Navigate to `/auth`
- [ ] Fill in name, email, password → click "Create Account"
- [ ] Verify redirect to `/dashboard`
- [ ] Verify welcome email arrives (check Resend dashboard if using dev domain)
- [ ] Verify profile shows 15 tokens in nav TokBadge
- [ ] Verify `profiles` row created in Supabase with correct `full_name`, `token_balance = 15`

### 1b. Google OAuth Sign Up
- [ ] Navigate to `/auth` → click Google sign-in
- [ ] Complete Google OAuth flow
- [ ] Verify redirect to `/dashboard` (via `/auth/callback`)
- [ ] Verify welcome email arrives (fire-and-forget, check within ~1 minute)
- [ ] Verify profile created with Google display name

### 1c. Sign In (Existing User)
- [ ] Sign out → navigate to `/auth` → switch to "Sign In" mode
- [ ] Enter existing credentials → click "Sign In"
- [ ] Verify redirect to `/dashboard`
- [ ] Verify no welcome email sent (account is > 5 minutes old)

### 1d. Referral Code Pass-Through
- [ ] Navigate to `/auth?ref=TESTCODE`
- [ ] Sign up with new account
- [ ] Verify `localStorage` has `aiskillscore_referral_code = TESTCODE`
- [ ] Verify OAuth redirect preserves `ref` param through callback
- [ ] Verify `/api/apply-referral` is called on dashboard mount (check network tab)

---

## 2. Daily Free Tokens (`daily_credits` backend)

### 2a. First-Load Award
- [ ] Sign in to existing account
- [ ] Verify `award_daily_credits` RPC fires on first page load
- [ ] Verify TokBadge shows updated balance (purchased + daily)
- [ ] Verify `DAILY_CREDITS_AWARDED` analytics event fires (check PostHog or console)

### 2b. Idempotency
- [ ] Refresh the page multiple times
- [ ] Verify daily free tokens are NOT awarded again (already awarded today)
- [ ] Verify `daily_credits_balance` and `last_daily_credit_at` in Supabase are correct

### 2c. Cap at 14
- [ ] Manually set `daily_credits_balance = 13` in Supabase
- [ ] Reload page → verify balance increases to 14 (not 15)
- [ ] Reload again → verify balance stays at 14

---

## 3. Email Flows

### 3a. Welcome Email (Email/Password)
- [ ] Create new account via email/password
- [ ] Verify `POST /api/send-email { type: "welcome" }` is called
- [ ] Verify email arrives with correct template (15 free tokens, 2 daily, tool list, dashboard CTA)
- [ ] Verify "Go to Dashboard" link works

### 3b. Welcome Email (Google OAuth)
- [ ] Create new account via Google OAuth
- [ ] Verify `sendWelcomeEmail()` fires in `/auth/callback` (check server logs)
- [ ] Verify email arrives with same template

### 3c. Email Capture (Landing Page)
- [ ] Navigate to landing page (unauthenticated)
- [ ] Enter email in footer capture section → submit
- [ ] Verify results email sends (check Resend dashboard)

### 3d. Email Capture (Pricing Page)
- [ ] Navigate to `/pricing` (unauthenticated)
- [ ] Enter email in "Not ready to buy?" section → submit
- [ ] Verify email sends

### 3e. Email Capture (JD Tool Results)
- [ ] Run a JD analysis from landing page (unauthenticated)
- [ ] Verify email capture form appears in results
- [ ] Enter email → submit → verify email sends

### 3f. Daily Reminder Cron
- [ ] Set a test user's `last_daily_credit_at` to 3 days ago in Supabase
- [ ] Call `GET /api/cron/daily-reminders` with `Authorization: Bearer <CRON_SECRET>`
- [ ] Verify response shows `sent: 1`
- [ ] Verify reminder email arrives with correct days missed count

### 3g. Notification Preference Opt-Out
- [ ] Set a test user's `notification_preferences` to `{ "product_updates": false }` in Supabase
- [ ] Set their `last_daily_credit_at` to 3 days ago
- [ ] Call `GET /api/cron/daily-reminders` with bearer token
- [ ] Verify response shows `skippedOptOut: 1` and no email sent for that user

### 3h. Cron Auth Rejection
- [ ] Call `GET /api/cron/daily-reminders` without Authorization header
- [ ] Verify 401 Unauthorized response
- [ ] Call with wrong secret → verify 401

---

## 4. Dashboard

### 4a. Recent Activity Links
- [ ] Run at least 2 different tools to generate results
- [ ] Navigate to `/dashboard`
- [ ] Verify recent activity section shows results with tool names, dates
- [ ] Click a result row → verify navigation to `/history?expand={resultId}`
- [ ] Verify the correct result auto-expands on the history page

### 4b. "View All" Link
- [ ] Click "View all" header link in recent activity
- [ ] Verify navigation to `/history`

### 4c. Token Upsell
- [ ] With a user who has low tokens (purchased + daily <= 10)
- [ ] Verify token upsell card appears on dashboard
- [ ] Verify copy mentions daily free tokens

### 4d. Track B Card
- [ ] For user with completed entrepreneurship/roadmap/salary results
- [ ] Verify Track B card dynamically pulls income estimates
- [ ] For user without those results → verify generic fallback copy

---

## 5. History Page

### 5a. Result List
- [ ] Navigate to `/history`
- [ ] Verify results load with correct tool names, dates, preview text
- [ ] Click a result → verify it expands showing full results via HistoryResultRenderer

### 5b. Filter
- [ ] Select a tool filter (e.g., "Resume Optimizer")
- [ ] Verify only matching results show
- [ ] Verify URL updates to `/history?filter=resume`
- [ ] Refresh the page → verify filter persists

### 5c. URL Expand Param
- [ ] Navigate to `/history?expand={resultId}`
- [ ] Verify the specific result auto-expands
- [ ] Verify URL is correct after manual expand/collapse

### 5d. Share from History
- [ ] Expand a result → click Share button
- [ ] Verify share modal opens with share URL
- [ ] Copy URL → open in incognito → verify share page renders

### 5e. Delete with Confirmation
- [ ] Click delete on a result → verify confirmation prompt appears
- [ ] Cancel → verify result remains
- [ ] Confirm delete → verify result removed from list
- [ ] Refresh → verify result is gone

### 5f. Pagination
- [ ] Create 25+ results (or adjust page size for testing)
- [ ] Verify "Load more" button appears after 20 results
- [ ] Click "Load more" → verify next batch loads
- [ ] Verify "Load more" respects active filter

---

## 6. Settings Page

### 6a. Avatar Upload
- [ ] Navigate to `/settings`
- [ ] Upload a new avatar image
- [ ] Verify image appears in settings preview
- [ ] Navigate to another page → verify Nav shows the new avatar (not initials)
- [ ] Verify image stored in `avatars` bucket in Supabase Storage

### 6b. Resume Upload
- [ ] Upload a PDF resume in settings
- [ ] Verify text extraction runs (file-parser.ts parses PDF client-side)
- [ ] Verify `resume_text` and `parsed_at` updated in profile
- [ ] Upload a DOCX resume → verify same behavior

### 6c. Password Change
- [ ] In Account section, enter new password + confirmation
- [ ] Verify min 8 char validation
- [ ] Toggle show/hide password → verify it works
- [ ] Submit → verify success toast
- [ ] Sign out → sign in with new password → verify it works

### 6d. Notification Preferences
- [ ] Toggle "Marketing emails" off → save
- [ ] Toggle "Product updates" off → save
- [ ] Verify `notification_preferences` JSONB in Supabase matches
- [ ] Toggle back on → save → verify

---

## 7. Share / OG Images

### 7a. Share Page Rendering
- [ ] Generate a share link from a tool result (via History or direct share)
- [ ] Open share URL (`/share/{hash}`) → verify page renders with:
  - Correct score and tool label
  - Feature highlights (not hardcoded social proof)
  - CTA to run own analysis

### 7b. OG Image
- [ ] Open `/api/og?type={tool}&score={score}&hash={hash}`
- [ ] Verify image renders at 1200×630 with:
  - Per-tool emoji icon
  - Per-tool gradient background
  - Score ring with correct color (red/amber/green)
  - Footer CTA text

### 7c. All 9 Tool Types
- [ ] Verify OG images render for each: displacement, jd_match, resume, cover_letter, linkedin, skills_gap, roadmap, salary, entrepreneurship

---

## 8. Referral System

### 8a. Referral Link Generation
- [ ] Navigate to `/referral`
- [ ] Verify unique referral link is displayed
- [ ] Verify copy-to-clipboard works

### 8b. Referral Application
- [ ] Open referral link in incognito
- [ ] Sign up via the link
- [ ] Verify `referred_by` set in new user's profile
- [ ] Verify `process_referral` RPC called (both parties credited)
- [ ] Verify idempotency: calling apply-referral again does NOT double-credit

### 8c. Referral History
- [ ] Navigate to `/referral` as the referrer
- [ ] Verify transaction history shows `referral_bonus` entries
- [ ] Verify total earned matches actual credited tokens

---

## 9. Vercel Cron (Production)

### 9a. Cron Configuration
- [ ] Verify `vercel.json` has cron entry: `{ path: "/api/cron/daily-reminders", schedule: "0 10 * * *" }`
- [ ] After deploy, check Vercel Dashboard → Settings → Cron Jobs
- [ ] Verify the cron job appears with schedule "Daily at 10:00 UTC"

### 9b. CRON_SECRET Setup
- [ ] Verify `CRON_SECRET` is set in Vercel Dashboard → Settings → Environment Variables
- [ ] Verify it's at least 16 characters
- [ ] Verify it matches what's used in the route's auth check

### 9c. Manual Trigger
- [ ] In Vercel Dashboard → Cron Jobs, trigger the job manually
- [ ] Check deployment logs for success/error output
- [ ] Verify response includes `sent`, `skippedOptOut`, `total` counts

---

## 10. Tool Runs (Smoke Tests)

For each tool, run with sample data and verify:
- Token deduction (or free for displacement)
- Loading state renders
- Results render without errors
- Share button works
- Result saved to history

| Tool | Cost | Smoke Test Input |
|---|---|---|
| Displacement | Free | Job title: "Software Engineer", industry: "Technology" |
| JD Match | 5 | Paste a real job posting + resume text |
| Resume | 15 | Upload/paste a resume, optionally add target JD |
| Cover Letter | 8 | Resume + JD + tone: "professional" |
| Interview | 8 | Resume + JD + type: "behavioral" |
| LinkedIn | 15 | Resume + target role: "Product Manager" |
| Skills Gap | 8 | Resume + target role |
| Roadmap | 15 | Resume + target role + time horizon: "12" |
| Salary | 8 | Target role + location + optional current salary |
| Entrepreneurship | 12 | Resume + risk tolerance: "moderate" |
| Headshots | 25 | Upload selfie(s) + style: "professional" |

---

## Quick Regression Checks

After any deploy, run through these fast checks:

- [ ] Landing page loads, SmartInput accepts input
- [ ] Auth flow works (sign up or sign in)
- [ ] Dashboard loads with correct token count
- [ ] Run one free tool (displacement) → verify results
- [ ] History page shows the result
- [ ] Nav avatar renders (if set) or initials (if not)
- [ ] Share a result → open share link in incognito
