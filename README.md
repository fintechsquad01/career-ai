# CareerAI — Cursor IDE Context Documents

## How to Use These Docs

Drop these files in your project root. Cursor will index them automatically and use them as context when you're coding.

### Quick Start
1. Copy all `.md` files + `.cursorrules` to your project root
2. Copy `prototype-v5.jsx` to your project root as reference
3. Start building in the order defined in `.cursorrules` → "Implementation Priorities"

---

## Document Map

| File | Purpose | When to Reference |
|------|---------|-------------------|
| **`.cursorrules`** | Cursor IDE behavioral rules | Always active (auto-loaded by Cursor) |
| **`PRD.md`** | Product requirements, user flows, pricing, tools | Before building any feature |
| **`TECHSTACK.md`** | Architecture, project structure, stack decisions | Project setup, architecture questions |
| **`DATAMODEL.md`** | Database schema, RLS, JSONB result schemas | Database work, API development |
| **`API.md`** | Edge Functions, API routes, Stripe config | Backend development |
| **`PAGES.md`** | Page-by-page specs, component breakdown, states | Building any page/component |
| **`CONVENTIONS.md`** | Code style, patterns, naming, testing | Code review, new files |
| **`AI_PROMPTS.md`** | LLM prompt templates, output schemas, model config | Building tool execution pipeline |
| **`prototype-v5.jsx`** | Visual/UX source of truth (2,495 lines) | UI implementation, copy, interactions |

---

## Architecture at a Glance

```
User → Next.js (Vercel) → Supabase Auth
                        → Supabase Postgres (profiles, tools, tokens)
                        → Supabase Edge Functions → Claude API (tool execution)
                        → Supabase Storage (resumes, headshots)
                        → Stripe (payments → webhook → token credit)
```

---

## Key Design Decisions

1. **Token economy, not subscriptions** — Users buy token packs ($5-$39) or a lifetime deal ($49). No monthly billing. Tokens never expire.

2. **Mobile-first** — Primary UX is mobile web. Bottom nav, 44px touch targets, sheet modals, `pb-24` for bottom nav clearance.

3. **Smart Input** — Single textarea on landing that auto-detects resume vs JD vs URL. This IS the product's onboarding — paste anything, get value instantly.

4. **Mission Control** — When a user analyzes a JD, the app creates a 5-step "mission" to become the top candidate. This drives tool usage and token spend.

5. **ToolShell pattern** — All 11 tools share a wrapper component that handles token gating, loading states, result display, sharing, and next-step suggestions.

6. **Competitive anchoring everywhere** — Every tool page shows what competitors charge (Jobscan $49.95/mo, Teal $29/mo, FinalRound $149/mo) vs our per-use price.

7. **Viral share pages** — Scores (displacement, ATS, fit) generate shareable OG cards that link back to the landing page as a growth loop.

---

## Build Order (recommended)

### Sprint 1 (Days 1-3): Shell
- [ ] Next.js + Tailwind + Inter font setup
- [ ] Supabase project + auth config
- [ ] Database migrations (all tables from DATAMODEL.md)
- [ ] Layout: Nav, Sidebar, BottomNav
- [ ] Auth page (Google OAuth + email)
- [ ] Landing page (static, no AI yet)

### Sprint 2 (Days 4-7): Core Loop
- [ ] Smart Input with type detection
- [ ] Dashboard page
- [ ] ToolShell component
- [ ] Token system (useTokens hook + DB functions)
- [ ] First Edge Function: `run-tool` scaffolding
- [ ] AI Displacement Score (free tool, simplest)

### Sprint 3 (Days 8-12): Tools + Mission
- [ ] JD Match tool (first paid tool)
- [ ] Resume Optimizer
- [ ] Mission Control page
- [ ] Cover Letter Generator
- [ ] Interview Prep

### Sprint 4 (Days 13-17): Monetization
- [ ] Stripe integration
- [ ] Pricing page
- [ ] Token gate / paywall
- [ ] Lifetime deal page
- [ ] Remaining tools (LinkedIn, Skills Gap, Roadmap, Salary, Entrepreneurship)

### Sprint 5 (Days 18-21): Growth
- [ ] Share/viral pages + OG images
- [ ] Referral system
- [ ] History page
- [ ] Settings page
- [ ] Email capture + Resend setup
- [ ] Polish + mobile testing
