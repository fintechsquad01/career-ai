-- Sprint 4: Resume variants table for per-job-target resume management

CREATE TABLE IF NOT EXISTS resume_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_target_id UUID REFERENCES job_targets(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  resume_text TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  tool_result_id UUID REFERENCES tool_results(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE resume_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own resume variants"
  ON resume_variants FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_resume_variants_user ON resume_variants(user_id);
CREATE INDEX idx_resume_variants_target ON resume_variants(user_id, job_target_id);
