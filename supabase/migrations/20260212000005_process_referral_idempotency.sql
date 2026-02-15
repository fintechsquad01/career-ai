-- Add idempotency guard to process_referral to prevent double-crediting

CREATE OR REPLACE FUNCTION process_referral(
  p_referrer_id UUID,
  p_new_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Guard: check if this new user already received a referral bonus
  IF EXISTS (
    SELECT 1 FROM public.token_transactions
    WHERE user_id = p_new_user_id AND type = 'referral_bonus'
  ) THEN
    -- Already processed, do nothing
    RETURN;
  END IF;

  -- Credit referrer with 10 tokens
  PERFORM add_tokens(p_referrer_id, 10, 'referral_bonus', 'Referral reward');

  -- Credit new user with 5 tokens
  PERFORM add_tokens(p_new_user_id, 5, 'referral_bonus', 'Referral welcome bonus');

  -- Increment referral count
  UPDATE public.profiles SET referral_count = referral_count + 1 WHERE id = p_referrer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
