-- Migration: set_active_job_target RPC
-- Atomically switches the active job target for a user.
-- Deactivates the current active target and activates the specified one.

CREATE OR REPLACE FUNCTION set_active_job_target(target_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify the target belongs to this user
  IF NOT EXISTS (
    SELECT 1 FROM job_targets WHERE id = target_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Job target not found';
  END IF;

  -- Deactivate all current active targets for this user
  UPDATE job_targets
  SET is_active = FALSE, updated_at = NOW()
  WHERE user_id = v_user_id AND is_active = TRUE;

  -- Activate the specified target
  UPDATE job_targets
  SET is_active = TRUE, updated_at = NOW()
  WHERE id = target_id AND user_id = v_user_id;

  RETURN target_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION set_active_job_target(UUID) TO authenticated;
