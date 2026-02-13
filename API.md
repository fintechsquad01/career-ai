# AISkillScore — API & Edge Functions

## Overview
- **Next.js API Routes**: Stripe webhooks, OG image generation
- **Supabase Edge Functions**: AI tool execution, resume/JD parsing, headshot generation
- **Supabase Client**: Direct DB queries from client/server components via RLS

---

## Supabase Edge Functions

### `POST /functions/v1/parse-input`
Smart input parser. Auto-detects input type and extracts structured data.

**Request:**
```json
{
  "input_text": "string",          // Raw pasted text or URL
  "detected_type": "url|jd|resume" // Client-side detection hint
}
```

**Response:**
```json
{
  "type": "resume|jd",
  "data": {
    // For resume:
    "name": "Sarah Chen",
    "title": "Senior Marketing Manager",
    "skills": ["SEO", "..."],
    "experience": [...],
    "resume_score": 38,
    "displacement_score": 67
    
    // For JD:
    "title": "Product Marketing Manager",
    "company": "Anthropic",
    "requirements": [...],
    "salary_range": "$140,000–$180,000"
  }
}
```

**Logic:**
1. If URL → fetch page content, extract JD text
2. If resume → extract structured data via Claude
3. If JD → extract requirements, company info via Claude
4. Calculate scores (ATS for resume, fit % for JD if resume exists)
5. Store in `career_profiles` or `job_targets`

---

### `POST /functions/v1/run-tool`
Main AI tool executor. Handles all 11 tools.

**Request:**
```json
{
  "tool_id": "resume|displacement|jd_match|cover_letter|linkedin|headshots|interview|skills_gap|roadmap|salary|entrepreneurship",
  "inputs": {
    // Tool-specific inputs (JD text, tone preference, etc.)
  },
  "job_target_id": "uuid|null"     // Active job target (if applicable)
}
```

**Response (streamed via SSE):**
```
event: progress
data: {"step": 1, "total": 5, "message": "Analyzing your resume..."}

event: progress
data: {"step": 2, "total": 5, "message": "Matching against requirements..."}

...

event: complete
data: {"result_id": "uuid", "result": {...}}
```

**Internal flow:**
1. Validate auth (JWT from Authorization header)
2. Check token balance (via `profiles.token_balance`)
3. Deduct tokens atomically (call `spend_tokens` DB function)
4. Load user's `career_profile` and `job_target` (if applicable)
5. Build prompt from template + user data + tool-specific inputs
6. Call Anthropic Claude API (claude-sonnet-4-5-20250929)
7. Parse response into structured JSONB
8. Store in `tool_results`
9. Stream progress events to client
10. Return final result

---

### `POST /functions/v1/parse-url`
Extracts job description from a URL (LinkedIn, Greenhouse, Lever, Indeed, Workday).

**Request:**
```json
{
  "url": "https://linkedin.com/jobs/view/..."
}
```

**Response:**
```json
{
  "title": "Product Marketing Manager",
  "company": "Anthropic",
  "location": "San Francisco, CA (Hybrid)",
  "description_text": "...",
  "salary_range": "$140,000–$180,000"
}
```

**Logic:**
1. Fetch URL content
2. Detect platform (LinkedIn, Greenhouse, etc.)
3. Platform-specific extraction OR Claude fallback for generic pages
4. Return structured JD data

---

### `POST /functions/v1/generate-headshots`
AI headshot generation pipeline.

**Request:**
```json
{
  "input_images": ["storage-path-1.jpg", "storage-path-2.jpg"],
  "style": "corporate|business_casual|creative|startup",
  "background": "office|outdoor|studio_gradient"
}
```

**Response (async — poll for status):**
```json
{
  "job_id": "uuid",
  "status": "processing|complete|failed",
  "output_images": ["storage-path-out-1.jpg", "..."]  // 40 images
}
```

---

### `POST /functions/v1/capture-email`
Pre-auth email capture from landing page.

**Request:**
```json
{
  "email": "user@example.com",
  "context": "resume_xray|jd_match"
}
```

**Response:**
```json
{ "success": true }
```

Also triggers Resend email with results PDF.

---

### `POST /functions/v1/create-share`
Creates a public share link for viral score pages.

**Request:**
```json
{
  "score_type": "displacement|jd_match|resume",
  "score_value": 67,
  "title": "Senior Marketing Manager",
  "industry": "Technology",
  "detail": {}
}
```

**Response:**
```json
{
  "hash": "abc123",
  "url": "https://aiskillscore.com/share/abc123"
}
```

---

## Next.js API Routes

### `POST /api/webhooks/stripe`
Handles Stripe webhook events.

**Events handled:**
- `checkout.session.completed` → Add tokens to user
- `payment_intent.succeeded` → Backup token credit
- `customer.subscription.created` → Lifetime deal activation

**Logic:**
1. Verify Stripe signature
2. Extract `user_id` from metadata
3. Determine token amount from line items
4. Call `add_tokens()` DB function
5. If lifetime deal → set `profiles.lifetime_deal = true`

---

### `GET /api/og?type=displacement&score=67&title=...`
Dynamic OG image generation for share pages.

Uses `@vercel/og` (Satori) to render a branded card with:
- Score ring visualization
- Title and industry
- AISkillScore branding
- CTA: "What's YOUR score?"

---

## Client-Side Supabase Queries

### Auth
```typescript
// Sign up
supabase.auth.signUp({ email, password, options: { data: { full_name } } })

// Google OAuth
supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })

// Sign in
supabase.auth.signInWithPassword({ email, password })

// Session
supabase.auth.getSession()
supabase.auth.onAuthStateChange(callback)
```

### Profile
```typescript
// Get profile with career data
supabase.from('profiles').select('*, career_profiles(*), job_targets(*)').eq('id', userId).single()

// Update profile
supabase.from('profiles').update({ full_name, onboarding_completed: true }).eq('id', userId)
```

### Tool Results
```typescript
// Get history
supabase.from('tool_results').select('*').eq('user_id', userId).order('created_at', { ascending: false })

// Filter by tool
supabase.from('tool_results').select('*').eq('user_id', userId).eq('tool_id', toolId)
```

### Token Transactions
```typescript
// Get transaction history
supabase.from('token_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false })
```

### Mission Progress
```typescript
// Update mission action
supabase.from('job_targets').update({ 
  mission_actions: { ...current, [actionId]: true } 
}).eq('id', jobTargetId)
```

---

## Stripe Products Configuration

```typescript
// lib/stripe/config.ts
export const STRIPE_PRODUCTS = {
  starter: {
    name: "Starter Pack",
    tokens: 50,
    price_cents: 500,
    stripe_price_id: process.env.STRIPE_PRICE_STARTER,
  },
  pro: {
    name: "Pro Pack",
    tokens: 200,
    price_cents: 1500,
    stripe_price_id: process.env.STRIPE_PRICE_PRO,
  },
  power: {
    name: "Power Pack",
    tokens: 600,
    price_cents: 3900,
    stripe_price_id: process.env.STRIPE_PRICE_POWER,
  },
  lifetime_early: {
    name: "Lifetime Early Bird",
    tokens: null, // Handled by subscription logic
    price_cents: 4900,
    stripe_price_id: process.env.STRIPE_PRICE_LIFETIME_EARLY,
  },
  lifetime_standard: {
    name: "Lifetime Standard",
    tokens: null,
    price_cents: 7900,
    stripe_price_id: process.env.STRIPE_PRICE_LIFETIME,
  },
};
```

---

## Rate Limits

| Endpoint | Limit | Scope |
|----------|-------|-------|
| `parse-input` | 10/min | Per user |
| `run-tool` | 5/min | Per user |
| `parse-url` | 10/min | Per user |
| `capture-email` | 3/min | Per IP |
| `create-share` | 10/min | Per user |
| Stripe webhook | No limit | Stripe IPs only |

---

## Error Codes

| Code | Description |
|------|-------------|
| `INSUFFICIENT_TOKENS` | Token balance < tool cost |
| `TOOL_NOT_FOUND` | Invalid tool_id |
| `PARSE_FAILED` | Could not extract data from input |
| `URL_FETCH_FAILED` | Could not fetch job URL |
| `AI_ERROR` | Claude API error |
| `RATE_LIMITED` | Too many requests |
| `UNAUTHORIZED` | Missing or invalid JWT |
