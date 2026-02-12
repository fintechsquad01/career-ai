# CareerAI — Tech Stack & Architecture

## Stack Decision

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14+ (App Router) | SSR for landing/SEO, RSC for dashboard, API routes for backend |
| **Language** | TypeScript | Type safety across full stack |
| **Styling** | Tailwind CSS | Matches prototype exactly (all utility classes) |
| **UI Components** | shadcn/ui + custom | Headless components, accessible, style-compatible |
| **Icons** | lucide-react | Already used in prototype |
| **Database** | Supabase (Postgres) | Auth, DB, Storage, Realtime, Edge Functions |
| **Auth** | Supabase Auth | Google OAuth + email/password, session management |
| **Payments** | Stripe | Token packs, lifetime deals, webhooks |
| **AI/LLM** | Anthropic Claude API (via Supabase Edge Functions) | Resume parsing, JD analysis, all 11 tools |
| **File Processing** | pdf-parse, mammoth | Resume PDF/DOCX extraction |
| **Image Gen** | FLUX.1 Pro (via Replicate) | AI headshots feature |
| **Email** | Resend | Transactional emails, result PDFs |
| **Analytics** | PostHog | Product analytics, funnels, feature flags |
| **Hosting** | Vercel | Edge-optimized, preview deployments |
| **Storage** | Supabase Storage | Resume files, generated headshots |

---

## Project Structure

```
careerai/
├── .cursorrules                    # Cursor IDE rules
├── PRD.md                          # Product requirements
├── TECHSTACK.md                    # This file
├── DATAMODEL.md                    # Database schema
├── PAGES.md                        # Page specs
├── API.md                          # API endpoints
├── CONVENTIONS.md                  # Code conventions
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (Inter font, providers)
│   │   ├── page.tsx                # Landing page (/)
│   │   ├── auth/
│   │   │   └── page.tsx            # Auth page (/auth)
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard (/dashboard)
│   │   ├── mission/
│   │   │   └── page.tsx            # Mission Control (/mission)
│   │   ├── tools/
│   │   │   ├── page.tsx            # Tools Hub (/tools)
│   │   │   └── [toolId]/
│   │   │       └── page.tsx        # Individual tool page (/tools/[toolId])
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── lifetime/
│   │   │   └── page.tsx
│   │   ├── referral/
│   │   │   └── page.tsx
│   │   ├── history/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── share/
│   │   │   └── [hash]/page.tsx     # Public viral share page
│   │   └── api/
│   │       ├── webhooks/
│   │       │   └── stripe/route.ts
│   │       └── og/
│   │           └── route.tsx       # OG image generation
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Nav.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   └── AppShell.tsx        # Wraps authenticated pages
│   │   ├── landing/
│   │   │   ├── SmartInput.tsx      # The unified paste input
│   │   │   ├── Loader.tsx          # Step-by-step analysis loader
│   │   │   ├── XrayResults.tsx     # Resume analysis results
│   │   │   ├── JobResults.tsx      # JD analysis results
│   │   │   └── HeroSection.tsx
│   │   ├── dashboard/
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── MissionCard.tsx
│   │   │   ├── AlertCard.tsx
│   │   │   └── ToolsGrid.tsx
│   │   ├── mission/
│   │   │   ├── MissionHeader.tsx
│   │   │   ├── SkillMatrix.tsx
│   │   │   ├── ActionCard.tsx
│   │   │   └── MissionComplete.tsx
│   │   ├── tools/
│   │   │   ├── ToolShell.tsx       # Shared wrapper (token gate, states)
│   │   │   ├── ToolCard.tsx
│   │   │   ├── Paywall.tsx
│   │   │   ├── displacement/       # Each tool's input + results
│   │   │   ├── jd-match/
│   │   │   ├── resume/
│   │   │   ├── cover-letter/
│   │   │   ├── linkedin/
│   │   │   ├── headshots/
│   │   │   ├── interview/
│   │   │   ├── skills-gap/
│   │   │   ├── roadmap/
│   │   │   ├── salary/
│   │   │   └── entrepreneurship/
│   │   ├── pricing/
│   │   │   ├── PackCard.tsx
│   │   │   ├── TokenGateModal.tsx
│   │   │   └── CompetitorCompare.tsx
│   │   ├── shared/
│   │   │   ├── Ring.tsx            # SVG donut chart
│   │   │   ├── Insight.tsx         # Pain/competitive/data insight cards
│   │   │   ├── Tip.tsx             # Info tooltip
│   │   │   ├── TokBadge.tsx        # Token balance badge
│   │   │   ├── FAQ.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── ShareModal.tsx
│   │   │   └── EmailCapture.tsx
│   │   └── modals/
│   │       ├── WelcomeModal.tsx    # 3-step onboarding
│   │       └── TokenGateModal.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser client
│   │   │   ├── server.ts           # Server client
│   │   │   └── middleware.ts       # Auth middleware
│   │   ├── stripe/
│   │   │   ├── client.ts
│   │   │   └── config.ts           # Products, prices
│   │   ├── ai/
│   │   │   ├── prompts.ts          # All LLM prompts by tool
│   │   │   ├── parsers.ts          # Resume/JD extraction logic
│   │   │   └── client.ts           # Anthropic API client
│   │   ├── detect-input.ts         # Smart input type detection
│   │   └── constants.ts            # Tools config, packs, FAQs
│   │
│   ├── hooks/
│   │   ├── useUser.ts              # Auth state + profile
│   │   ├── useTokens.ts            # Token balance + spend/add
│   │   ├── useTool.ts              # Tool execution state machine
│   │   ├── useMission.ts           # Mission progress
│   │   └── useSmartInput.ts        # Input detection + submission
│   │
│   ├── stores/
│   │   └── app-store.ts            # Zustand global state (minimal)
│   │
│   └── types/
│       ├── database.ts             # Generated Supabase types
│       ├── tools.ts                # Tool configs, results
│       └── index.ts
│
├── supabase/
│   ├── migrations/                 # SQL migration files
│   ├── functions/                  # Edge Functions
│   │   ├── run-tool/index.ts       # Main AI tool executor
│   │   ├── parse-resume/index.ts   # Resume file processing
│   │   ├── parse-jd/index.ts       # JD/URL extraction
│   │   └── generate-headshots/index.ts
│   └── config.toml
│
├── public/
│   └── og/                         # Static OG images
│
└── package.json
```

---

## Architecture Patterns

### State Management
- **Server state**: Supabase queries via React Server Components where possible
- **Client state**: React `useState` + context for UI state (modals, navigation)
- **Global state**: Zustand store for cross-cutting concerns (tokens, user profile, active mission)
- **URL state**: Next.js dynamic routes for tools (`/tools/[toolId]`)

### Authentication Flow
```
Landing (no auth) → Free Analysis → Email Capture → Auth Page
                                                      ↓
                                                Google OAuth or Email/Password
                                                      ↓
                                                Supabase session created
                                                      ↓
                                                Middleware protects /dashboard, /mission, /tools/*
                                                      ↓
                                                Welcome Modal (first-time only)
```

### Tool Execution Pipeline
```
User clicks "Run" → Check token balance
                     ↓ (insufficient)      ↓ (sufficient)
                   TokenGateModal        Deduct tokens (optimistic)
                     ↓                     ↓
                   Purchase flow         Call Edge Function
                     ↓                     ↓
                   Tokens added          Stream AI response
                     ↓                     ↓
                   Auto-retry           Parse & store result
                                          ↓
                                        Display results + history entry
```

### AI Processing (Edge Functions)
- Each tool has a dedicated prompt template in `lib/ai/prompts.ts`
- Edge Function receives: tool_id, user_profile, job_data (if applicable), tool-specific inputs
- Calls Anthropic Claude API with structured output
- Returns typed JSON result
- Result stored in `tool_results` table

### Payment Flow (Stripe)
```
User selects pack → Create Stripe Checkout Session (server)
                     ↓
                   Redirect to Stripe
                     ↓
                   Payment completed
                     ↓
                   Webhook: checkout.session.completed
                     ↓
                   Add tokens to user balance
                     ↓
                   Redirect back with success toast
```

---

## Key Configuration

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# AI
ANTHROPIC_API_KEY=

# Replicate (headshots)
REPLICATE_API_TOKEN=

# Email
RESEND_API_KEY=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

### Font
Inter — loaded via `next/font/google`, applied globally. Matches prototype's `fontFamily:"'Inter',system-ui,-apple-system,sans-serif"`.

### Color System (from prototype)
- Primary: `blue-600` (#2563EB) / `violet-600` (#7C3AED)
- Gradient: `from-blue-600 to-violet-600`
- Danger: `red-500` / `red-600`
- Warning: `amber-500` / `amber-600`
- Success: `green-500` / `green-600`
- Surface: `white`, `gray-50`
- Border: `gray-200`
- Text: `gray-900` (primary), `gray-500` (secondary), `gray-400` (tertiary)

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Landing LCP | < 2.0s |
| FID | < 100ms |
| CLS | < 0.1 |
| Tool result time | < 15s (with streaming progress) |
| Mobile Lighthouse | > 90 |
| Bundle size (landing) | < 150KB gzipped |
