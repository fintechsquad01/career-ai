-- Sprint 4: per-target tool_results index + job_targets status column

-- Index for per-target result queries (Mission Control multi-job)
CREATE INDEX IF NOT EXISTS idx_tool_results_target
  ON tool_results(user_id, tool_id, job_target_id);

-- Application status tracker
ALTER TABLE job_targets
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'saved'
    CHECK (status IN ('saved','applied','interviewing','offer','rejected','withdrawn')),
  ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT now();
