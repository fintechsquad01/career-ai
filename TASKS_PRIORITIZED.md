# AISkillScore — Prioritized Task Prompt

> Generated from comprehensive audit of: PRD.md, PAGES.md, DATAMODEL.md, API.md,
> CONVENTIONS.md, TECHSTACK.md, SPRINT_NEXT.md, E2E_TEST_CHECKLIST.md, and full
> codebase review. Ranked by LOW EFFORT → HIGH IMPACT.
>
> Date: February 12, 2026
> Build status: 0 TS errors, clean production build, all sprints A-E complete.

---

## How to Use This Document

Execute tasks in tier order. Each tier is self-contained. After completing a tier,
commit, verify the build still passes, then proceed to the next tier.

---

## TIER 1: Quick Wins (< 30 min each, HIGH impact)

### Task 1.1 — Add double-submit guard to ToolShell
**Files:** `src/components/tools/ToolShell.tsx`
**Effort:** 15 min | **Impact:** Prevents wasted tokens, duplicate API calls, and bad UX
**What:** The `handleRun` function in ToolShell has no guard against double-clicks or rapid resubmission. When state is "loading", the button should be disabled but the handler itself has no early-return check.
**Fix:**
- Add an `isRunning` ref (not state, to avoid stale closures) that is set `true` at the start of `handleRun` and `false` in finally/catch.
- Early-return if `isRunning.current === true`.
- Also disable the submit button in Input components when ToolShell state is "loading" (currently some Input components don't receive the state).

### Task 1.2 — Add page-specific metadata to all pages
**Files:** All `src/app/*/page.tsx` files (18 pages)
**Effort:** 20 min | **Impact:** Massive SEO improvement — currently only `/share/[hash]` has page-specific metadata. All other pages inherit the generic root layout title.
**Fix:** Add `export const metadata: Metadata = { title, description }` to each page:

| Page | Title | Description |
|------|-------|-------------|
| `/` (landing) | "AISkillScore — Free AI Career Analysis in 30 Seconds" | "Paste a job posting or resume. Get an honest AI assessment with evidence — not generic keyword scores." |
| `/auth` | "Sign Up — AISkillScore" | "Create a free account. 5 tokens + 2 daily credits. No credit card required." |
| `/dashboard` | "Dashboard — AISkillScore" | "Your career intelligence hub." |
| `/mission` | "Job Mission Control — AISkillScore" | "Step-by-step plan to become the top candidate." |
| `/tools` | "AI Career Tools — AISkillScore" | "11 AI tools to analyze, build, prepare, and grow your career." |
| `/tools/[toolId]` | Use `generateMetadata` to set per-tool title dynamically | Pull from TOOLS_MAP |
| `/history` | "Result History — AISkillScore" | "All your past analyses in one place." |
| `/settings` | "Settings — AISkillScore" | "Manage your profile, account, and privacy." |
| `/pricing` | "Pricing — AISkillScore" | "Pay per use. No subscriptions. Start free." |
| `/lifetime` | "Lifetime Deal — AISkillScore" | "100 tokens/month forever for $49. Limited spots." |
| `/referral` | "Refer & Earn — AISkillScore" | "Give 5 tokens, get 10. Share your referral link." |
| `/privacy` | "Privacy Policy — AISkillScore" | "How we protect your data." |
| `/terms` | "Terms of Service — AISkillScore" | "Terms of use for AISkillScore." |

### Task 1.3 — Create custom 404 page
**Files:** New: `src/app/not-found.tsx`
**Effort:** 10 min | **Impact:** Currently a broken link shows the default Next.js 404. A branded page retains users.
**Fix:** Create a simple not-found page with:
- AISkillScore branding
- "Page not found" message
- "Go to Dashboard" and "Go Home" buttons
- Consistent with app styling (rounded cards, gradient CTA)

### Task 1.4 — Fix email capture to actually send emails
**Files:** `supabase/functions/capture-email/index.ts`, possibly `src/lib/email.ts`
**Effort:** 25 min | **Impact:** Currently email captures save to DB but no email is sent. These are warm leads getting zero follow-up.
**Fix:** After the successful DB insert in the capture-email edge function, call Resend to send:
- For `resume_xray` / `jd_match` context: Send results summary email with CTA to sign up
- For `pricing` / `landing_footer` context: Send welcome email with tool highlights and signup CTA
- Use `RESEND_API_KEY` env var (already defined in .env.example)
- Gracefully skip if RESEND_API_KEY is not set (dev environment)

### Task 1.5 — Fix lifetime deal spots counter
**Files:** `src/app/lifetime/page.tsx`
**Effort:** 15 min | **Impact:** The FOMO mechanic (core monetization per PRD) is completely fake with hardcoded `127`. Damages trust if users notice.
**Fix:**
- Option A (simple): Query `profiles` table counting `WHERE lifetime_deal = true`, subtract from 500.
- Option B (faster): Add a `site_config` table with a `lifetime_spots_claimed` counter (server-side increment on purchase). For now, Option A is fine since user base is small.

### Task 1.6 — Add missing loading.tsx files
**Files:** New: `src/app/tools/[toolId]/loading.tsx`, `src/app/pricing/loading.tsx`, `src/app/lifetime/loading.tsx`
**Effort:** 15 min | **Impact:** These pages can take time to load (server-side data fetching). Without loading.tsx, users see a blank white screen.
**Fix:** Create loading skeletons matching the page layout. Can reuse `Skeleton` component from `src/components/shared/Skeleton.tsx`.

### Task 1.7 — Fix empty alt attributes on avatar images
**Files:** `src/components/layout/Nav.tsx`, `src/components/dashboard/ProfileCard.tsx`
**Effort:** 5 min | **Impact:** Accessibility violation. Screen readers announce nothing for these images.
**Fix:** Change `alt=""` to `alt={profile?.full_name ? \`${profile.full_name}'s avatar\` : "User avatar"}` in both files.

---

## TIER 2: Smart Investments (30 min – 2 hours each, HIGH impact)

### Task 2.1 — Add career profile edit fields to Settings
**Files:** `src/components/settings/SettingsContent.tsx`
**Effort:** 45 min | **Impact:** HIGH — without this, users can only set their career title by uploading a resume, but the resume parser doesn't extract title/industry. The displacement tool (free hook) now has inline fields, but other tools that pull from career profile (JD Match, Resume, LinkedIn, etc.) benefit from having this data pre-filled.
**Fix:** Add an "About Your Career" section in the Profile tab with fields:
- Job Title (text input)
- Company (text input)
- Industry (select dropdown — reuse the same INDUSTRIES list from DisplacementInput)
- Years of Experience (number input)
- Location (text input)
- LinkedIn URL (text input)
Save these to the `career_profiles` table via upsert (same pattern as resume upload).

### Task 2.2 — Add form accessibility across the app
**Files:** Multiple input components, SmartInput, EmailCapture, auth page
**Effort:** 1.5 hours | **Impact:** WCAG AA compliance, better screen reader support, required for enterprise clients
**Fix:**
- Add `aria-label` to SmartInput textarea: "Paste a job description, job URL, or resume text"
- Add `aria-describedby` linking form inputs to their help text
- Add `aria-invalid="true"` on form fields when validation errors exist
- Add `aria-live="polite"` to toast notification container
- Add `role="status"` to loading indicators in ToolShell
- Add descriptive `alt` text to all images (avatars already fixed in 1.7)
- Ensure all form `<label>` elements are properly associated with inputs via `htmlFor`

### Task 2.3 — Improve error states across all tool results
**Files:** All `*Results.tsx` in `src/components/tools/`, `src/components/tools/ToolShell.tsx`
**Effort:** 45 min | **Impact:** Per SPRINT_NEXT Section 3.9, error messages are generic. Better messages reduce support load and improve trust.
**Fix per SPRINT_NEXT.md:**

| Context | Current | New |
|---------|---------|-----|
| Tool result empty | "No results available. Please try again." | "We couldn't generate results this time. This is usually temporary — try again in a moment." |
| Tool execution error | "Something went wrong" | "Analysis didn't complete — most likely a temporary issue. Your tokens were not deducted." |
| Network error | (unhandled) | "Connection lost. Please check your internet and try again. Your tokens are safe." |
| Tool not found | "Tool not found." | "This tool isn't available yet. Check back soon or try one of our 11 other tools." |

### Task 2.4 — Wire up landing page analysis to show real results consistently
**Files:** `src/components/landing/LandingContent.tsx`
**Effort:** 30 min | **Impact:** The landing page falls back to mock data if `parse-input` fails. This means the "free analysis" hook tool may show fake data, which destroys trust.
**Fix:**
- If the edge function call fails, show a clear error: "Analysis unavailable right now. Sign up for 15 free tokens and try from your dashboard."
- Remove mock/demo data fallback for production (keep for dev only via `process.env.NODE_ENV === 'development'`)
- Add retry button: "Try Again" that re-calls the edge function

---

## TIER 3: Production Deployment Blockers (MUST DO before go-live)

### Task 3.1 — Apply Supabase migrations to production
**Effort:** 30 min | **Impact:** CRITICAL — daily credits, referral system, settings enhancements, and RLS fixes don't work without these.
**Steps:**
1. Run migrations 002-005 against production Supabase:
   - `002_fix_shared_scores_rls.sql` — Fixes public access to share pages
   - `003_daily_credits.sql` — Enables daily credit system + updated spend_tokens function
   - `004_settings_enhancements.sql` — Settings page features
   - `005_process_referral_idempotency.sql` — Prevents double referral credits
2. Verify: Run `SELECT * FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'daily_credits_balance'` to confirm migration applied.

### Task 3.2 — Deploy Edge Functions to production Supabase
**Effort:** 30 min | **Impact:** CRITICAL — tools don't work without these.
**Steps:**
1. Deploy all 6 functions: `run-tool`, `parse-input`, `parse-url`, `generate-headshots`, `create-share`, `capture-email`
2. Set Edge Function secrets: `OPENROUTER_API_KEY`, `REPLICATE_API_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL`
3. Verify: `curl -X POST https://<project>.supabase.co/functions/v1/run-tool` should return 401 (not 404).

### Task 3.3 — Set Vercel environment variables
**Effort:** 15 min | **Impact:** CRITICAL — app won't function in production without these.
**Variables to set in Vercel Dashboard → Settings → Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_POWER`, `STRIPE_PRICE_LIFETIME_EARLY`, `STRIPE_PRICE_LIFETIME`
- `OPENROUTER_API_KEY`
- `REPLICATE_API_TOKEN`
- `RESEND_API_KEY`
- `CRON_SECRET` (min 16 chars)
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_APP_URL`

### Task 3.4 — Create Stripe products and prices
**Effort:** 30 min | **Impact:** CRITICAL — token purchases don't work without these.
**Steps:**
1. In Stripe Dashboard, create products: Starter Pack, Pro Pack, Power Pack, Lifetime Early Bird, Lifetime Standard
2. Create prices for each (one-time payments, not recurring)
3. Copy price IDs into Vercel env vars
4. Set up Stripe webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
5. Subscribe to events: `checkout.session.completed`
6. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Task 3.5 — Set up Resend for production email
**Effort:** 20 min | **Impact:** HIGH — welcome emails, daily reminders, email captures won't send.
**Steps:**
1. Verify domain in Resend dashboard (add DNS records)
2. Set sender address (e.g., `hello@aiskillscore.com`)
3. Update `src/lib/email.ts` if the sender address needs changing
4. Test with a real email send

### Task 3.6 — Verify cron job after deploy
**Effort:** 5 min | **Impact:** Daily reminder emails won't send without this.
**Steps:**
1. After Vercel deploy, go to Dashboard → Settings → Cron Jobs
2. Verify `/api/cron/daily-reminders` appears with schedule `0 10 * * *`
3. Trigger manually once to verify it works

---

## TIER 4: Growth & Polish (post-launch, 2-4 hours each)

### Task 4.1 — Performance optimization pass (Lighthouse > 90)
**Effort:** 3 hours | **Impact:** Better SEO rankings, better mobile UX
**Areas to check:**
- Landing page LCP (target < 2s per TECHSTACK.md)
- Image optimization (next/image for all images)
- Font loading strategy (Inter already uses next/font)
- Bundle size analysis (`next build --analyze`)
- Lazy load below-fold sections on landing page
- Preload critical resources

### Task 4.2 — Replace hardcoded social proof with real data
**Effort:** 30 min | **Impact:** Medium — "12,400+ careers analyzed" and "4.8/5 rating" are hardcoded. As real users sign up, these should come from actual data.
**Fix:**
- Query `COUNT(*)` from `tool_results` for "careers analyzed"
- If count < 100, keep showing aspirational number
- If count > 100, show real number with growth

### Task 4.3 — Add affiliate click tracking
**Files:** `src/lib/affiliates.ts`, `src/lib/analytics.ts`
**Effort:** 2 hours | **Impact:** Revenue attribution for course/tool recommendations
**Fix:**
- Wrap affiliate links in a tracking wrapper that fires a PostHog event before redirect
- Track: tool_id, platform, link_url, user_id
- Create a simple dashboard query to see affiliate click volume

### Task 4.4 — Add Sentry or error monitoring
**Effort:** 1 hour | **Impact:** Production visibility into errors users encounter
**Fix:**
- Install `@sentry/nextjs`
- Configure for both client and server
- Add to error boundary
- Set up alerts for elevated error rates

### Task 4.5 — Add robots.txt and enhanced sitemap
**Files:** `src/app/robots.ts` (new), update `src/app/sitemap.ts`
**Effort:** 20 min | **Impact:** SEO — ensure crawlers can discover all public pages
**Fix:**
- Create robots.ts allowing all crawlers, pointing to sitemap
- Update sitemap.ts to include all public routes: `/`, `/auth`, `/pricing`, `/lifetime`, `/privacy`, `/terms`
- Dynamically include `/share/[hash]` pages from the database

### Task 4.6 — Add structured data (JSON-LD)
**Files:** `src/app/layout.tsx` or individual pages
**Effort:** 30 min | **Impact:** Rich search results (SoftwareApplication, FAQPage schemas)
**Fix:**
- Add `SoftwareApplication` schema to landing page
- Add `FAQPage` schema to pricing page (FAQ section)
- Add `Organization` schema to root layout

### Task 4.7 — E2E test automation with Playwright
**Effort:** 4 hours | **Impact:** Confidence in deploys, catch regressions early
**Fix:**
- Set up Playwright
- Automate the Quick Regression Checks from E2E_TEST_CHECKLIST.md:
  - Landing page loads
  - Auth flow works
  - Dashboard loads
  - Run displacement tool
  - Check history
  - Share flow

---

## Execution Order (Recommended)

```
Session 1 (45 min):  Tasks 1.1, 1.2, 1.3, 1.6, 1.7  → commit
Session 2 (40 min):  Tasks 1.4, 1.5                    → commit
Session 3 (2.5 hr):  Tasks 2.1, 2.3, 2.4              → commit
Session 4 (1.5 hr):  Task 2.2                           → commit
Session 5 (2.5 hr):  Tasks 3.1, 3.2, 3.3, 3.4, 3.5, 3.6 → deploy to production
Session 6 (post-launch): Tasks 4.1 through 4.7 as prioritized
```

---

## What's NOT on This List (Already Complete)

- ✅ All 11 tool prompts (Sprint A)
- ✅ All microcopy updates (Sprint B)
- ✅ Daily credits system (Sprint C)
- ✅ Affiliate integration (Sprint D)
- ✅ Track B enhancements (Sprint E)
- ✅ Welcome modal onboarding
- ✅ Delete account flow
- ✅ Password change
- ✅ Notification preferences
- ✅ Avatar upload
- ✅ Resume upload + PDF/DOCX parsing
- ✅ Referral system with idempotency
- ✅ Share pages with OG images for all 9 tool types
- ✅ Cron config for daily reminders
- ✅ Stripe checkout + webhook handler
- ✅ Rate limiting on Edge Functions
- ✅ Input sanitization / prompt injection protection
- ✅ SSE streaming for tool execution
- ✅ Displacement tool inline input fields (Session 7 fix)
- ✅ pdfjs-dist SSR fix (Session 6 fix)
