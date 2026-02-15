-- Token Rebalance: Increase signup bonus from 5 to 15 tokens
-- Rationale: 5 tokens is too few for users to reach the "aha!" moment
-- (Resume Optimizer costs 10 tokens alone). 15 tokens allows:
-- Displacement (free) + JD Match (2) + Resume Optimizer (10) = 12, with 3 spare.

-- 1. Change default for new users
ALTER TABLE profiles ALTER COLUMN token_balance SET DEFAULT 15;

-- 2. Update the signup trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    LOWER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8))
  );

  -- Record signup bonus transaction (increased from 5 to 15)
  INSERT INTO public.token_transactions (user_id, amount, balance_after, type, description)
  VALUES (NEW.id, 15, 15, 'signup_bonus', 'Welcome bonus - 15 free tokens');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Credit existing users who haven't spent or purchased tokens
-- (they still have their original 5 signup tokens)
UPDATE profiles
SET token_balance = token_balance + 10,
    updated_at = NOW()
WHERE total_tokens_spent = 0
  AND total_tokens_purchased = 0
  AND token_balance = 5;

-- Log the bonus for affected users
INSERT INTO token_transactions (user_id, amount, balance_after, type, description)
SELECT
  id,
  10,
  15,
  'signup_bonus_adjustment',
  'Signup bonus increased from 5 to 15 tokens'
FROM profiles
WHERE total_tokens_spent = 0
  AND total_tokens_purchased = 0
  AND token_balance = 15;  -- They now have 15 after the UPDATE above
