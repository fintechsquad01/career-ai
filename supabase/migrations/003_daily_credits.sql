-- Daily Credits System
-- Adds daily credit columns, award function, and updated spend logic

-- ============================================
-- SCHEMA CHANGES
-- ============================================

-- Add daily credits columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_credits_balance INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_daily_credit_at TIMESTAMPTZ;

-- ============================================
-- DAILY CREDIT AWARD FUNCTION
-- ============================================

-- Awards 2 daily credits if not yet awarded today (UTC).
-- Max accumulation from daily credits: 14 (1-week buffer).
-- Returns JSON: { awarded: boolean, daily_balance: number, purchased_balance: number }
CREATE OR REPLACE FUNCTION award_daily_credits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_last_award TIMESTAMPTZ;
  v_daily_balance INTEGER;
  v_purchased_balance INTEGER;
  v_today DATE := (NOW() AT TIME ZONE 'UTC')::DATE;
  v_awarded BOOLEAN := FALSE;
BEGIN
  -- Lock row
  SELECT last_daily_credit_at, daily_credits_balance, token_balance
  INTO v_last_award, v_daily_balance, v_purchased_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if already awarded today
  IF v_last_award IS NULL OR (v_last_award AT TIME ZONE 'UTC')::DATE < v_today THEN
    -- Award 2 credits, cap at 14
    IF v_daily_balance < 14 THEN
      v_daily_balance := LEAST(v_daily_balance + 2, 14);
      v_awarded := TRUE;

      UPDATE public.profiles
      SET daily_credits_balance = v_daily_balance,
          last_daily_credit_at = NOW(),
          updated_at = NOW()
      WHERE id = p_user_id;

      -- Log transaction
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

-- ============================================
-- UPDATED SPEND FUNCTION (daily credits first)
-- ============================================

-- Spend daily credits first (oldest first via FIFO — daily expire in 7 days),
-- then purchased tokens. Daily credits older than 7 days are expired before spending.
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
  -- Lock and read balances
  SELECT token_balance, daily_credits_balance, last_daily_credit_at
  INTO v_purchased_balance, v_daily_balance, v_last_award
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Expire daily credits older than 7 days
  IF v_last_award IS NOT NULL AND v_last_award < NOW() - INTERVAL '7 days' THEN
    v_daily_balance := 0;
  END IF;

  v_total_balance := v_purchased_balance + v_daily_balance;

  IF v_total_balance < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_TOKENS';
  END IF;

  -- Spend daily credits first
  v_remaining := p_amount;

  IF v_daily_balance > 0 AND v_remaining > 0 THEN
    v_daily_spent := LEAST(v_daily_balance, v_remaining);
    v_daily_balance := v_daily_balance - v_daily_spent;
    v_remaining := v_remaining - v_daily_spent;
  END IF;

  -- Then spend purchased tokens
  IF v_remaining > 0 THEN
    v_purchased_spent := v_remaining;
    v_purchased_balance := v_purchased_balance - v_purchased_spent;
  END IF;

  -- Update profile
  UPDATE public.profiles
  SET token_balance = v_purchased_balance,
      daily_credits_balance = v_daily_balance,
      total_tokens_spent = total_tokens_spent + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;

  v_total_balance := v_purchased_balance + v_daily_balance;

  -- Log transaction
  INSERT INTO public.token_transactions (user_id, amount, balance_after, type, description, tool_result_id)
  VALUES (p_user_id, -p_amount, v_total_balance, 'tool_use', p_tool_id, p_tool_result_id);

  RETURN v_total_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
