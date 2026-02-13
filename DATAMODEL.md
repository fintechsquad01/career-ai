# AISkillScore — Data Model

## Overview
Supabase (PostgreSQL) with Row Level Security (RLS) on all user-facing tables.

---

## Tables

### `profiles`
Extended user profile, synced from Supabase Auth. Created on signup via trigger.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Token economy
  token_balance INTEGER NOT NULL DEFAULT 5,
  total_tokens_purchased INTEGER NOT NULL DEFAULT 0,
  total_tokens_spent INTEGER NOT NULL DEFAULT 0,
  
  -- Subscription
  lifetime_deal BOOLEAN NOT NULL DEFAULT FALSE,
  lifetime_next_refill TIMESTAMPTZ,  -- When next 100 tokens drop
  stripe_customer_id TEXT,
  
  -- Referral
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  referral_count INTEGER NOT NULL DEFAULT 0,
  
  -- Onboarding
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `career_profiles`
Extracted resume data. One per user. Updated when new resume is uploaded.

```sql
CREATE TABLE career_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Extracted fields
  name TEXT,
  title TEXT,
  company TEXT,
  industry TEXT,
  location TEXT,
  years_experience INTEGER,
  email TEXT,
  linkedin_url TEXT,
  
  -- Skills (JSONB arrays)
  skills JSONB DEFAULT '[]',          -- ["SEO", "Content Strategy", ...]
  skill_gaps JSONB DEFAULT '[]',      -- ["AI/ML Tools", ...]
  
  -- Scores
  resume_score INTEGER,               -- 0-100 ATS score
  displacement_score INTEGER,          -- 0-100 AI risk
  
  -- Raw data
  resume_text TEXT,                    -- Full resume text (encrypted at rest)
  resume_file_path TEXT,               -- Supabase Storage path
  
  -- Metadata
  source TEXT,                         -- "paste" | "upload" | "linkedin"
  parsed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)  -- One profile per user
);
```

### `job_targets`
Analyzed job postings. A user can have multiple, but one "active" at a time.

```sql
CREATE TABLE job_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Job details
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  salary_range TEXT,
  posted_date TEXT,
  applicant_count TEXT,
  job_url TEXT,
  
  -- Requirements (JSONB array of objects)
  -- [{skill: "Product Marketing", priority: "req"|"pref", match: true|false|"partial"}]
  requirements JSONB DEFAULT '[]',
  
  -- Scores
  fit_score INTEGER,                   -- 0-100 match percentage
  
  -- Mission state
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  mission_actions JSONB DEFAULT '{}', -- {"optimize": true, "cover": true, ...}
  
  -- Raw data
  jd_text TEXT,                        -- Full JD text
  source TEXT,                         -- "paste" | "url"
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one active job target per user
CREATE UNIQUE INDEX idx_active_job_target ON job_targets(user_id) WHERE is_active = TRUE;
```

### `tool_results`
Every tool execution stored as a result. Powers the history page.

```sql
CREATE TABLE tool_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_target_id UUID REFERENCES job_targets(id) ON DELETE SET NULL,
  
  -- Tool identification
  tool_id TEXT NOT NULL,               -- "displacement", "resume", "jd_match", etc.
  
  -- Token cost
  tokens_spent INTEGER NOT NULL DEFAULT 0,
  
  -- Result data (tool-specific JSONB)
  result JSONB NOT NULL,
  
  -- Summary for history display
  summary TEXT,                        -- "38 → 81 ATS Score"
  metric_value INTEGER,                -- Primary numeric metric (for sorting/display)
  detail TEXT,                         -- "+7 keywords, 3 sections rewritten"
  
  -- AI metadata
  model_used TEXT,                     -- "claude-sonnet-4-5-20250929"
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  latency_ms INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tool_results_user ON tool_results(user_id, created_at DESC);
CREATE INDEX idx_tool_results_tool ON tool_results(user_id, tool_id);
```

### `token_transactions`
Ledger of all token changes. Audit trail.

```sql
CREATE TABLE token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  amount INTEGER NOT NULL,             -- Positive = credit, Negative = debit
  balance_after INTEGER NOT NULL,
  
  type TEXT NOT NULL,                  -- "signup_bonus" | "purchase" | "tool_use" | "referral_bonus" | "lifetime_refill"
  description TEXT,                    -- "Pro pack (200 tokens)" | "Resume Optimizer" | "Referral from Alex"
  
  -- Stripe reference (for purchases)
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Tool reference (for tool_use)
  tool_result_id UUID REFERENCES tool_results(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_token_txn_user ON token_transactions(user_id, created_at DESC);
```

### `email_captures`
Pre-auth email captures from landing page (lead gen).

```sql
CREATE TABLE email_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  context TEXT,                        -- "resume_xray" | "jd_match"
  source_page TEXT,                    -- "landing"
  converted_to_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_email_captures_email ON email_captures(email);
```

### `shared_scores`
Public share links for viral score pages.

```sql
CREATE TABLE shared_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hash TEXT UNIQUE NOT NULL,           -- Short hash for URL (/share/[hash])
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  score_type TEXT NOT NULL,            -- "displacement" | "jd_match" | "resume"
  score_value INTEGER,
  title TEXT,                          -- "Senior Marketing Manager"
  industry TEXT,
  detail JSONB,                        -- Extra data for the share card
  
  view_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Row Level Security (RLS) Policies

```sql
-- profiles: users can only read/update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- career_profiles: users can only CRUD their own
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own career profile" ON career_profiles FOR ALL USING (auth.uid() = user_id);

-- job_targets: users can only CRUD their own
ALTER TABLE job_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own job targets" ON job_targets FOR ALL USING (auth.uid() = user_id);

-- tool_results: users read their own, insert via service role (Edge Functions)
ALTER TABLE tool_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own results" ON tool_results FOR SELECT USING (auth.uid() = user_id);

-- token_transactions: users read their own
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own transactions" ON token_transactions FOR SELECT USING (auth.uid() = user_id);

-- shared_scores: public read, authenticated insert
ALTER TABLE shared_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shared scores" ON shared_scores FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users create shares" ON shared_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- email_captures: insert only (no auth needed, handled by Edge Function)
ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;
```

---

## Database Functions

### `handle_new_user()`
Trigger on `auth.users` insert → creates `profiles` row with default 5 tokens + unique referral code.

### `spend_tokens(user_id, amount, tool_id, tool_result_id)`
Atomic function: deducts tokens, creates transaction record, returns new balance. Fails if insufficient.

### `add_tokens(user_id, amount, type, description, stripe_session_id?)`
Atomic function: adds tokens, creates transaction record. Used by Stripe webhook + referral system.

### `process_referral(referrer_id, new_user_id)`
Called when a referred user runs their first paid tool. Credits both parties.

### `refill_lifetime_tokens()`
Scheduled cron (daily): finds lifetime users due for refill, adds 100 tokens (cap 300), updates next_refill.

---

## JSONB Result Schemas (per tool)

### `displacement` result
```json
{
  "score": 67,
  "risk_level": "high",
  "timeline": "3-5yr",
  "tasks_at_risk": [
    {"task": "Campaign reporting", "risk_pct": 92},
    {"task": "Email copywriting", "risk_pct": 85}
  ],
  "safe_tasks": [
    {"task": "Strategic positioning", "risk_pct": 15},
    {"task": "Cross-functional leadership", "risk_pct": 8}
  ],
  "recommendations": ["...", "..."]
}
```

### `jd_match` result
```json
{
  "fit_score": 54,
  "requirements": [
    {"skill": "Product Marketing", "priority": "req", "match": true},
    {"skill": "AI/ML Industry Knowledge", "priority": "req", "match": false}
  ],
  "advantages": ["Team leadership...", "Budget management..."],
  "gaps": ["AI company experience", "SQL proficiency"],
  "recommendations": ["...", "..."]
}
```

### `resume` result
```json
{
  "score_before": 38,
  "score_after": 81,
  "keywords_added": ["go-to-market strategy", "B2B SaaS"],
  "sections_rewritten": [
    {
      "section": "Professional Summary",
      "before": "Led marketing team campaigns",
      "after": "Product Marketing Manager with 8 years..."
    }
  ],
  "optimized_resume_text": "..."
}
```

### `cover_letter` result
```json
{
  "letter_text": "Dear Hiring Team...",
  "word_count": 320,
  "tone": "professional",
  "jd_keywords_used": 6,
  "resume_achievements_cited": 3,
  "highlighted_sections": [
    {"text": "Product Marketing Manager", "type": "job_specific"},
    {"text": "competitive analysis", "type": "keyword_match"}
  ]
}
```

Similar JSONB schemas exist for all 11 tools. Each tool's result component knows how to render its specific schema.

---

## Storage Buckets (Supabase Storage)

| Bucket | Purpose | Access |
|--------|---------|--------|
| `resumes` | Uploaded resume files (PDF/DOCX) | Private, user-scoped |
| `headshots-input` | Selfie uploads for headshot generation | Private, user-scoped |
| `headshots-output` | Generated AI headshots | Private, user-scoped |
| `exports` | Generated PDF reports | Private, user-scoped, auto-delete 7d |
