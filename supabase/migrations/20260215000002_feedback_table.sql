-- Feedback / NPS table for collecting user satisfaction data
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tool_id TEXT NOT NULL,
  nps_score INTEGER NOT NULL CHECK (nps_score >= 1 AND nps_score <= 10),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own feedback
CREATE POLICY "Users can read own feedback" ON feedback
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Service role can read all (for admin dashboard)
-- (implicitly handled by service role bypassing RLS)

-- Index for admin queries
CREATE INDEX idx_feedback_tool_id ON feedback(tool_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
