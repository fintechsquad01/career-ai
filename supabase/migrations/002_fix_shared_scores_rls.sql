-- Fix overly permissive RLS policy on shared_scores
-- The original UPDATE policy allowed anyone to update any column.
-- This restricts updates to only incrementing view_count via a dedicated RPC.

-- Drop the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Anyone can update view count" ON shared_scores;

-- Create a secure RPC function for incrementing view count
CREATE OR REPLACE FUNCTION increment_view_count(p_score_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_scores
  SET view_count = view_count + 1
  WHERE id = p_score_id;
END;
$$;

-- No UPDATE policy needed — all view_count updates go through the RPC
-- The RPC uses SECURITY DEFINER so it bypasses RLS

-- Add inputs column to tool_results for headshots (and future tools that need it)
ALTER TABLE tool_results ADD COLUMN IF NOT EXISTS inputs JSONB;
