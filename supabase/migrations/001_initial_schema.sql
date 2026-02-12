-- CareerAI Initial Schema Migration
-- Creates all tables, RLS policies, functions, triggers, and storage buckets

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  token_balance INTEGER NOT NULL DEFAULT 5,
  total_tokens_purchased INTEGER NOT NULL DEFAULT 0,
  total_tokens_spent INTEGER NOT NULL DEFAULT 0,
  lifetime_deal BOOLEAN NOT NULL DEFAULT FALSE,
  lifetime_next_refill TIMESTAMPTZ,
  stripe_customer_id TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  referral_count INTEGER NOT NULL DEFAULT 0,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE career_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  title TEXT,
  company TEXT,
  industry TEXT,
  location TEXT,
  years_experience INTEGER,
  email TEXT,
  linkedin_url TEXT,
  skills JSONB DEFAULT '[]',
  skill_gaps JSONB DEFAULT '[]',
  resume_score INTEGER,
  displacement_score INTEGER,
  resume_text TEXT,
  resume_file_path TEXT,
  source TEXT,
  parsed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE job_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  salary_range TEXT,
  posted_date TEXT,
  applicant_count TEXT,
  job_url TEXT,
  requirements JSONB DEFAULT '[]',
  fit_score INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  mission_actions JSONB DEFAULT '{}',
  jd_text TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_active_job_target ON job_targets(user_id) WHERE is_active = TRUE;

CREATE TABLE tool_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_target_id UUID REFERENCES job_targets(id) ON DELETE SET NULL,
  tool_id TEXT NOT NULL,
  tokens_spent INTEGER NOT NULL DEFAULT 0,
  result JSONB NOT NULL,
  summary TEXT,
  metric_value INTEGER,
  detail TEXT,
  model_used TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tool_results_user ON tool_results(user_id, created_at DESC);
CREATE INDEX idx_tool_results_tool ON tool_results(user_id, tool_id);

CREATE TABLE token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  tool_result_id UUID REFERENCES tool_results(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_token_txn_user ON token_transactions(user_id, created_at DESC);

CREATE TABLE email_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  context TEXT,
  source_page TEXT,
  converted_to_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_email_captures_email ON email_captures(email);

CREATE TABLE shared_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hash TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  score_type TEXT NOT NULL,
  score_value INTEGER,
  title TEXT,
  industry TEXT,
  detail JSONB,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own career profile" ON career_profiles FOR ALL USING (auth.uid() = user_id);

ALTER TABLE job_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own job targets" ON job_targets FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tool_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own results" ON tool_results FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own transactions" ON token_transactions FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE shared_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shared scores" ON shared_scores FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users create shares" ON shared_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    LOWER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8))
  );

  -- Record signup bonus transaction
  INSERT INTO token_transactions (user_id, amount, balance_after, type, description)
  VALUES (NEW.id, 5, 5, 'signup_bonus', 'Welcome bonus — 5 free tokens');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Atomic token spending
CREATE OR REPLACE FUNCTION spend_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_tool_id TEXT,
  p_tool_result_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  -- Lock and check balance
  SELECT token_balance INTO v_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_TOKENS';
  END IF;

  -- Deduct
  UPDATE profiles
  SET token_balance = token_balance - p_amount,
      total_tokens_spent = total_tokens_spent + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;

  v_balance := v_balance - p_amount;

  -- Log transaction
  INSERT INTO token_transactions (user_id, amount, balance_after, type, description, tool_result_id)
  VALUES (p_user_id, -p_amount, v_balance, 'tool_use', p_tool_id, p_tool_result_id);

  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic token adding
CREATE OR REPLACE FUNCTION add_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT,
  p_stripe_session_id TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  UPDATE profiles
  SET token_balance = token_balance + p_amount,
      total_tokens_purchased = total_tokens_purchased + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING token_balance INTO v_balance;

  INSERT INTO token_transactions (user_id, amount, balance_after, type, description, stripe_session_id)
  VALUES (p_user_id, p_amount, v_balance, p_type, p_description, p_stripe_session_id);

  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process referral credits
CREATE OR REPLACE FUNCTION process_referral(
  p_referrer_id UUID,
  p_new_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Credit referrer with 10 tokens
  PERFORM add_tokens(p_referrer_id, 10, 'referral_bonus', 'Referral reward');

  -- Credit new user with 5 tokens
  PERFORM add_tokens(p_new_user_id, 5, 'referral_bonus', 'Referral welcome bonus');

  -- Increment referral count
  UPDATE profiles SET referral_count = referral_count + 1 WHERE id = p_referrer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lifetime token refill (run via cron)
CREATE OR REPLACE FUNCTION refill_lifetime_tokens()
RETURNS VOID AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, token_balance
    FROM profiles
    WHERE lifetime_deal = TRUE
      AND lifetime_next_refill IS NOT NULL
      AND lifetime_next_refill <= NOW()
  LOOP
    -- Cap at 300 tokens
    IF r.token_balance < 300 THEN
      PERFORM add_tokens(
        r.id,
        LEAST(100, 300 - r.token_balance),
        'lifetime_refill',
        'Monthly lifetime refill'
      );
    END IF;

    UPDATE profiles
    SET lifetime_next_refill = NOW() + INTERVAL '30 days'
    WHERE id = r.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
