# AISkillScore — Product Requirements Document (PRD)

## One-liner
AI-powered career intelligence platform that analyzes resumes and job postings, then guides users through a mission-based workflow to become the top candidate — priced per-use via tokens instead of subscriptions.

## Problem
- 75% of resumes are auto-rejected by ATS before a human sees them
- Job seekers waste time applying to roles they're unqualified for
- Existing tools (Jobscan $49.95/mo, Teal $29/mo) are subscription-based and single-purpose
- 47% of jobs face significant AI disruption by 2030 and most workers don't know their risk

## Solution
A unified career platform with 11 AI tools, gated by a token economy (no subscriptions). Users paste a resume or job posting → AI auto-detects the type → runs analysis → unlocks a "Mission Control" workflow to systematically prepare for the target job.

## Target User
Mid-career professionals (5-10 years experience) actively job searching or exploring career transitions. Primary persona: "Sarah Chen" — Senior Marketing Manager, 8 years, wants to transition into AI product marketing.

---

## Core User Flows

### Flow 1: Landing → Free Analysis (No Auth Required)
1. User lands on homepage
2. Pastes content into "Smart Input" textarea
3. AI auto-detects: `url` | `jd` (job description) | `resume`
4. Detection badge appears in real-time
5. CTA button adapts text/color based on detected type
6. Click → animated loading stepper (5-7 steps, ~3s total)
7. Results displayed inline (X-Ray for resume, Job Match for JD)
8. Email capture prompt (save results as PDF)
9. CTA to sign up (preserves analysis context)

### Flow 2: Auth → Dashboard → Mission Control
1. Sign up (Google OAuth or email/password) → 15 free tokens
2. Welcome modal (3-step onboarding carousel)
3. Dashboard shows: profile card, scores (ATS/AI Risk/Tokens), active mission, alerts, all tools grid
4. If JD was analyzed pre-auth → "Job Mission Control" auto-activates
5. Mission Control = 5 sequential actions (Optimize Resume → Cover Letter → Skills Gap → Interview Prep → Salary Negotiation)
6. Each action costs tokens, shows loading state, then reveals results
7. Progress bar tracks completion
8. Mission Complete state shows before/after scores + "Apply Now" CTA

### Flow 3: Individual Tool Usage
1. Navigate to any tool from Dashboard, Sidebar, or Tools Hub
2. ToolShell wrapper handles: token check → paywall if insufficient → input form → loading → results → share/next suggestions
3. Results include: actionable output, copy/download buttons, data-backed insights, competitive comparisons

### Flow 4: Token Purchase
1. Triggered by: token gate on tool run, pricing page, low-token nudges
2. Three packs: Starter (50/$5), Pro (200/$15), Power (600/$39)
3. Purchase animation → tokens added → auto-continues blocked action
4. Lifetime deal: $49 early bird for 100 tokens/month forever

---

## Pages & Routes

| Route | Page | Auth Required | Description |
|-------|------|--------------|-------------|
| `landing` | Landing | No | Hero + Smart Input + social proof + tools preview |
| `auth` | Auth | No | Sign up / Sign in (Google OAuth + email) |
| `dashboard` | Dashboard | Yes | Profile, scores, mission card, tools grid, activity |
| `mission` | Mission Control | Yes | Job-specific 5-step action plan |
| `tools` | Tools Hub | Yes | All 11 tools in categorized grid |
| `displacement` | AI Displacement | Yes | Free tool — AI risk score |
| `jd_match` | JD Match | Yes | 2 tokens — fit % against job posting |
| `resume` | Resume Optimizer | Yes | 10 tokens — ATS rewrite |
| `cover_letter` | Cover Letter | Yes | 3 tokens — tailored letter |
| `linkedin` | LinkedIn Optimizer | Yes | 10 tokens — headline/about/keywords |
| `headshots` | AI Headshots | Yes | 20 tokens — professional photos |
| `interview` | Interview Prep | Yes | 3 tokens — company-specific Qs |
| `skills_gap` | Skills Gap | Yes | 5 tokens — gap analysis + learning path |
| `roadmap` | Career Roadmap | Yes | 8 tokens — 6-12 month plan |
| `salary` | Salary Negotiation | Yes | 3 tokens — market data + scripts |
| `entrepreneurship` | Entrepreneur Assessment | Yes | 8 tokens — founder-market fit |
| `pricing` | Pricing | No | Token packs + competitor comparison |
| `lifetime` | Lifetime Deal | Yes | $49 early bird offer |
| `referral` | Refer & Earn | Yes | Referral link, stats, share buttons |
| `history` | Result History | Yes | All past tool results, filterable |
| `share_score` | Share Score | No | Public viral share page (OG card) |
| `settings` | Settings | Yes | Tabs: Profile, Account, Privacy |

---

## 11 AI Tools

| ID | Tool | Tokens | Category | Phase |
|----|------|--------|----------|-------|
| `displacement` | AI Displacement Score | 0 (Free) | Analyze | 1 |
| `jd_match` | JD Match Score | 2 | Analyze | 1 |
| `resume` | Resume Optimizer | 10 | Build | 1 |
| `cover_letter` | Cover Letter Generator | 3 | Build | 2 |
| `linkedin` | LinkedIn Optimizer | 10 | Build | 2 |
| `headshots` | AI Pro Headshots | 20 | Build | 2 |
| `interview` | Interview Prep | 3 | Prepare | 3 |
| `skills_gap` | Skills Gap Analysis | 5 | Grow | 3 |
| `roadmap` | Career Roadmap | 8 | Grow | 3 |
| `salary` | Salary Negotiation | 3 | Prepare | 3 |
| `entrepreneurship` | Entrepreneurship Assessment | 8 | Grow | 4 |

Categories: `Analyze` → `Build` → `Prepare` → `Grow`

---

## Token Economy

| Pack | Tokens | Price | Per-Token | Savings |
|------|--------|-------|-----------|---------|
| Starter | 50 | $5 | $0.10 | — |
| Pro | 200 | $15 | $0.075 | 25% |
| Power | 600 | $39 | $0.065 | 35% |
| Lifetime | 100/mo | $49 one-time | $0.041 | 59% |

- New users get 15 free tokens on signup
- Tokens never expire (except Lifetime unused tokens cap at 300)
- Referral: Give 5, Get 10 tokens

---

## Monetization Hooks

1. **Token Gate**: Tool pages show paywall when balance < cost
2. **Inline upsell**: "Pro pack covers ~10 full job applications"
3. **Competitive anchoring**: Every tool shows competitor pricing (e.g., "Jobscan = $49.95/mo for less")
4. **Mission urgency**: Progress bar + "become top candidate" framing
5. **Lifetime FOMO**: Counter showing spots left (e.g., "127 of 500 spots left")
6. **Post-result upsell**: "Recommended next" tool suggestions after each result

---

## Key UI Patterns

### Smart Input (Landing Page)
- Single textarea accepting: resume text, job description text, or job URL
- Real-time type detection with animated badge
- Demo quick-paste chips for sample data
- Adaptive CTA button (changes text, color, icon based on detected type)
- File upload support (drag & drop)

### ToolShell (Shared Tool Wrapper)
- Handles: token checking, paywall, input → loading → results state machine
- Pre-loads resume context ("Pre-loaded from your resume: ...")
- Shows job targeting context if JD analyzed
- Post-result: share, run again, next tool suggestions
- Competitive pricing insight on every tool

### Scoring Visuals
- Ring/donut SVG component for scores (ATS, Displacement, Fit %)
- Color-coded: red (<40), amber (40-69), green (70+)
- Before/after comparisons with animated transitions

### Mobile-First Patterns
- Bottom nav bar (Dashboard, Mission, Tools, Tokens, Profile)
- 44px minimum touch targets
- Sheet-style modals (slide up from bottom on mobile, centered on desktop)
- Sticky CTA sections

---

## Non-Functional Requirements

- **Mobile-first**: Primary use case is mobile web
- **Performance**: Landing page LCP < 2s, tool results < 15s
- **Privacy**: AES-256 encryption at rest, auto-delete after 90 days, GDPR export/delete
- **AI Processing**: Via API (e.g., OpenRouter, Anthropic) with no data retention
- **Auth**: Google OAuth + email/password
- **Payments**: Stripe for token packs and lifetime deals
