export type ToolId =
  | "displacement"
  | "jd_match"
  | "resume"
  | "cover_letter"
  | "linkedin"
  | "headshots"
  | "interview"
  | "skills_gap"
  | "roadmap"
  | "salary"
  | "entrepreneurship";

export type ToolCategory = "Analyze" | "Build" | "Prepare" | "Grow";

export interface Tool {
  id: ToolId;
  icon: string;
  title: string;
  description: string;
  tokens: number;
  category: ToolCategory;
  phase: number;
  painPoint: string;
  vsCompetitor: string | null;
  route: string;
}

export type ToolState = "input" | "loading" | "result";

export interface ToolProgress {
  step: number;
  total: number;
  message: string;
}

// Result types for each tool
export interface TDisplacementResult {
  score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  timeline: string;
  tasks_at_risk: Array<{
    task: string;
    risk_pct: number;
    ai_tool?: string;
  }>;
  safe_tasks: Array<{
    task: string;
    risk_pct: number;
    why_safe?: string;
  }>;
  recommendations: string[];
  industry_benchmark?: {
    average_score: number;
    percentile: number;
  };
}

export interface TJdMatchResult {
  fit_score: number;
  requirements: Array<{
    skill: string;
    priority: "req" | "pref";
    match: boolean | "partial";
    evidence?: string;
  }>;
  advantages: string[];
  critical_gaps: Array<{
    gap: string;
    severity: "dealbreaker" | "significant" | "minor";
    fix_time?: string;
  }>;
  salary_assessment?: {
    range: string;
    fair_for_candidate: boolean;
    reasoning: string;
  };
  applicant_pool_estimate?: {
    likely_applicants: number;
    candidate_percentile: number;
  };
}

export interface TResumeResult {
  score_before: number;
  score_after: number;
  keywords_added: string[];
  sections_rewritten: Array<{
    section: string;
    before: string;
    after: string;
    changes?: string;
  }>;
  formatting_fixes?: string[];
  optimized_resume_text: string;
}

export interface TCoverLetterResult {
  letter_text: string;
  word_count: number;
  tone: string;
  jd_keywords_used: number;
  resume_achievements_cited: number;
  highlighted_sections: Array<{
    text: string;
    type: "job_specific" | "keyword_match" | "achievement";
  }>;
}

export interface TLinkedInResult {
  headlines: Array<{
    text: string;
    search_keywords: string[];
  }>;
  about_section: string;
  keywords: string[];
  experience_improvements: Array<{
    current: string;
    improved: string;
  }>;
  profile_strength_score: number;
}

export interface TInterviewResult {
  questions: Array<{
    question: string;
    type: "behavioral" | "case_study" | "analytical" | "gap_probe" | "technical";
    suggested_answer: string;
    coaching_tip: string;
    difficulty: "easy" | "medium" | "hard";
  }>;
  company_culture_notes: string;
  interview_format_prediction: string;
}

export interface TSkillsGapResult {
  gaps: Array<{
    skill: string;
    current_level: number;
    required_level: number;
    priority: "critical" | "high" | "medium" | "low" | "strength";
    time_to_close: string;
    course?: {
      name: string;
      provider: string;
      price: string;
      url?: string;
    };
  }>;
  learning_path: Array<{
    month_range: string;
    focus: string;
    actions: string;
  }>;
  dataset_note?: string;
}

export interface TRoadmapResult {
  milestones: Array<{
    month: string;
    title: string;
    actions: string[];
    priority: "critical" | "high" | "medium" | "low";
  }>;
  networking_goals: string[];
  application_targets: string[];
  skill_development: string[];
}

export interface TSalaryResult {
  market_range: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  candidate_position: number;
  counter_offer_scripts: Array<{
    scenario: string;
    script: string;
  }>;
  negotiation_tactics: Array<{
    tactic: string;
    do_this: string;
    dont_do: string;
  }>;
}

export interface TEntrepreneurshipResult {
  founder_market_fit: number;
  business_models: Array<{
    model: string;
    description: string;
    match_score: number;
    first_steps: string[];
  }>;
  risk_assessment: {
    tolerance: string;
    key_risks: string[];
    mitigations: string[];
  };
  competitive_landscape: string;
  recommended_first_steps: string[];
}

export interface THeadshotsResult {
  images: Array<{
    url: string;
    style: string;
    id?: string;
  }>;
}

export type ToolResult =
  | TDisplacementResult
  | TJdMatchResult
  | TResumeResult
  | TCoverLetterResult
  | TLinkedInResult
  | TInterviewResult
  | TSkillsGapResult
  | TRoadmapResult
  | TSalaryResult
  | TEntrepreneurshipResult
  | THeadshotsResult;

export type InsightType = "pain" | "competitive" | "data" | "info";

export interface Pack {
  id: string;
  name: string;
  tokens: number;
  price: number;
  rate: string;
  description: string;
  highlighted?: boolean;
  save?: string;
  vsNote?: string;
}
