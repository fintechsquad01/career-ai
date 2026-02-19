-- Allow users to rename their own history entries by updating tool_results.summary.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tool_results'
      AND policyname = 'Users update own tool results'
  ) THEN
    CREATE POLICY "Users update own tool results" ON tool_results
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
