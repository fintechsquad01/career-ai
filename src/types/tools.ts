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
  beta?: boolean;
}

export type ToolState = "input" | "loading" | "result";

export interface ToolProgress {
  step: number;
  total: number;
  message: string;
}

// Result types for each tool — expanded for Sprint A prompt overhaul

export interface TDisplacementResult {
  score: number;
  risk_level: "minimal" | "low" | "moderate" | "high" | "critical";
  headline?: string;
  timeline: string;
  tasks_at_risk: Array<{
    task: string;
    risk_pct: number;
    ai_tool?: string;
    time_spent_pct?: number;
    augmentation_tip?: string;
  }>;
  safe_tasks: Array<{
    task: string;
    risk_pct: number;
    why_safe?: string;
    monetization_potential?: string;
  }>;
  recommendations: Array<
    | string
    | {
        action: string;
        type?: "upskill" | "augment" | "pivot" | "monetize";
        resource?: string;
        time_investment?: string;
        expected_impact?: string;
      }
  >;
  industry_benchmark?: {
    average_score: number;
    percentile: number;
    trend?: "improving" | "stable" | "worsening";
  };
  entrepreneurship_opportunities?: Array<{
    opportunity: string;
    why_you?: string;
    first_step?: string;
    income_potential?: string;
  }>;
}

export interface TJdMatchResult {
  fit_score: number;
  headline?: string;
  requirements: Array<{
    skill: string;
    priority: "req" | "pref" | "required" | "preferred" | "implied";
    match: boolean | "partial";
    evidence?: string;
    recruiter_note?: string;
  }>;
  advantages: string[];
  critical_gaps: Array<{
    gap: string;
    severity: "dealbreaker" | "significant" | "minor" | "learnable_on_job";
    recruiter_perspective?: string;
    fix_action?: string;
    fix_time?: string;
    fix_resource?: string;
  }>;
  hidden_requirements?: Array<{
    requirement: string;
    why_implied?: string;
    candidate_has_it?: boolean;
  }>;
  salary_assessment?: {
    range: string;
    fair_for_candidate: boolean;
    reasoning: string;
    disclaimer?: string;
  };
  applicant_pool_estimate?: {
    likely_applicants: number;
    candidate_percentile: number;
    reasoning?: string;
  };
  application_strategy?: {
    should_apply: boolean;
    positioning_statement?: string;
    resume_tweaks?: string[];
    referral_advice?: string;
  };
  freelance_angle?: string;
}

export interface TResumeResult {
  score_before: number;
  score_after: number;
  headline?: string;
  voice_note?: string;
  keywords_added: Array<
    | string
    | {
        keyword: string;
        where_added?: string;
        why?: string;
      }
  >;
  sections_rewritten: Array<{
    section: string;
    before: string;
    after: string;
    changes?: string;
    jd_alignment?: string;
  }>;
  formatting_fixes?: Array<
    | string
    | {
        issue: string;
        fix: string;
        impact?: "high" | "medium" | "low";
      }
  >;
  ats_warnings?: string[];
  optimized_resume_text: string;
  recruiter_perspective?: string;
  next_steps?: Array<{
    action: string;
    tool?: string;
  }>;
  monetizable_skills?: string[];
}

export interface TCoverLetterResult {
  letter_text: string;
  word_count: number;
  tone: string;
  opening_hook?: string;
  jd_keywords_used: number;
  resume_achievements_cited: number;
  company_specifics_referenced?: string[];
  highlighted_sections: Array<{
    text: string;
    type: "job_specific" | "keyword_match" | "achievement" | "storytelling" | "company_specific";
  }>;
  what_makes_this_different?: string;
  interview_talking_points?: string[];
}

export interface TLinkedInResult {
  headlines: Array<{
    text: string;
    search_keywords: string[];
    optimized_for?: "recruiter_search" | "peer_discovery" | "thought_leadership";
  }>;
  about_section: string;
  about_strategy?: string;
  ai_value_prop?: string;
  keywords: Array<
    | string
    | {
        keyword: string;
        where_to_place?: string;
        search_volume_hint?: "high" | "medium" | "low";
      }
  >;
  experience_improvements: Array<{
    current: string;
    improved: string;
    what_changed?: string;
  }>;
  profile_strength_score: number;
  content_strategy?: {
    post_topics?: Array<{
      topic: string;
      format?: string;
      why_this_works?: string;
    }>;
    posting_frequency?: string;
    engagement_tactics?: string[];
    hashtags?: string[];
  };
  personal_brand_monetization?: {
    positioning?: string;
    content_to_income_path?: string;
    income_potential?: string;
    first_steps?: string[];
  };
  network_building?: Array<{
    action: string;
    who_to_connect_with?: string;
    message_template?: string;
  }>;
}

export interface TInterviewResult {
  questions: Array<{
    question: string;
    type: "warm_up" | "behavioral" | "technical" | "case_study" | "gap_probe" | "culture_fit" | "analytical";
    suggested_answer: string;
    coaching_tip: string;
    difficulty: "easy" | "medium" | "hard";
    what_theyre_really_asking?: string;
    follow_ups?: Array<{
      question: string;
      what_theyre_testing?: string;
      how_to_handle?: string;
    }>;
    red_flag_answers?: string[];
    power_phrase?: string;
  }>;
  company_culture_notes?: string;
  interview_format_prediction?: string;
  interview_strategy?: {
    opening_impression?: string;
    questions_to_ask_them?: Array<{
      question: string;
      why_this_impresses?: string;
    }>;
    closing_strong?: string;
    common_mistakes_for_this_role?: string[];
  };
  preparation_checklist?: string[];
  freelance_positioning?: string;
}

export interface TSkillsGapResult {
  headline?: string;
  transferable_skills?: Array<{
    skill: string;
    how_it_transfers?: string;
    strength_level?: number;
  }>;
  gaps: Array<{
    skill: string;
    current_level: number;
    required_level: number;
    priority: "critical" | "high" | "medium" | "low" | "strength";
    hiring_manager_perspective?: string;
    time_to_close: string;
    course?: {
      name: string;
      provider: string;
      price: string;
      url?: string;
    };
    learning_path?: {
      courses?: Array<{
        name: string;
        provider: string;
        price?: string;
        duration?: string;
        certificate?: boolean;
        url_hint?: string;
      }>;
      portfolio_project?: {
        project: string;
        demonstrates?: string;
        time_estimate?: string;
      };
      quick_win?: string;
    };
  }>;
  learning_path?: Array<{
    month_range: string;
    focus: string;
    actions: string | string[];
    milestone?: string;
  }>;
  learning_roadmap?: Array<{
    month_range: string;
    focus: string;
    actions: string[];
    milestone?: string;
  }>;
  total_investment?: {
    time?: string;
    cost?: string;
    free_alternative_cost?: string;
  };
  monetization_opportunities?: Array<{
    skill_area: string;
    opportunity?: string;
    platforms?: string[];
    income_potential?: string;
    how_to_start?: string;
  }>;
  dataset_note?: string;
}

export interface TRoadmapResult {
  headline?: string;
  milestones: Array<{
    month: string;
    title: string;
    track?: "job_hunt" | "income_build" | "both";
    actions: Array<
      | string
      | {
          action: string;
          deadline?: string;
          time_required?: string;
        }
    >;
    success_criterion?: string;
    if_stuck?: string;
    priority: "critical" | "high" | "medium" | "low";
  }>;
  networking_goals?: string[];
  networking_plan?: Array<{
    who: string;
    where?: string;
    outreach_script?: string;
    goal?: string;
  }>;
  application_targets?: string[];
  application_strategy?: {
    target_companies?: string[];
    applications_per_week?: number;
    quality_over_quantity?: string;
  };
  skill_development?: Array<
    | string
    | {
        skill: string;
        how?: string;
        timeline?: string;
      }
  >;
  income_building_plan?: {
    month_1_2?: {
      focus?: string;
      expected_income?: string;
      platform?: string;
      how_this_helps_job_hunt?: string;
    };
    month_3_6?: {
      focus?: string;
      expected_income?: string;
      platform?: string;
      how_this_helps_job_hunt?: string;
    };
    month_7_12?: {
      focus?: string;
      expected_income?: string;
      platform?: string;
      decision_point?: string;
    };
  };
  risk_mitigation?: {
    biggest_risk?: string;
    mitigation?: string;
    plan_b?: string;
  };
  total_investment?: {
    time_per_week?: string;
    financial_cost?: string;
    expected_roi?: string;
  };
}

export interface TSalaryResult {
  market_range: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    data_caveat?: string;
  };
  candidate_position: number;
  leverage_assessment?: {
    overall_leverage?: "strong" | "moderate" | "limited";
    factors?: Array<{
      factor: string;
      strength?: "strong" | "moderate" | "weak";
      explanation?: string;
    }>;
    recommendation?: string;
  };
  counter_offer_scripts: Array<{
    scenario: string;
    script: string;
    tone_guidance?: string;
    if_they_push_back?: string;
    walk_away_signal?: string;
  }>;
  negotiation_tactics: Array<{
    tactic: string;
    when_to_use?: string;
    do_this: string;
    dont_do: string;
    example?: string;
  }>;
  beyond_base_salary?: Array<{
    component: string;
    negotiation_script?: string;
    typical_range?: string;
    when_to_push?: string;
  }>;
  timing_strategy?: {
    when_to_discuss_salary?: string;
    who_brings_it_up_first?: string;
    anchoring_strategy?: string;
  };
  freelance_rate_guidance?: {
    hourly_rate?: string;
    day_rate?: string;
    pricing_strategy?: string;
    platforms?: string[];
  };
}

export interface TEntrepreneurshipResult {
  founder_market_fit: number;
  headline?: string;
  unfair_advantages?: Array<{
    advantage: string;
    why_it_matters?: string;
    monetization?: string;
  }>;
  psychological_fit?: {
    strengths?: string[];
    watch_outs?: string[];
    risk_profile?: "conservative" | "moderate" | "aggressive";
    recommendation?: string;
  };
  business_models: Array<{
    model: string;
    description: string;
    match_score: number;
    why_this_fits?: string;
    startup_cost?: string;
    time_to_first_revenue?: string;
    runs_alongside_job_hunt?: boolean;
    month_1_income?: string;
    month_6_income?: string;
    month_12_income?: string;
    scalability?: string;
    first_steps: Array<
      | string
      | {
          step: string;
          this_week?: boolean;
          cost?: string;
          time?: string;
        }
    >;
    tools_needed?: Array<{
      tool: string;
      cost?: string;
      what_for?: string;
    }>;
    platforms?: string[];
  }>;
  ninety_day_launch_plan?: {
    week_1_2?: { focus?: string; deliverable?: string; income_target?: string };
    week_3_4?: { focus?: string; deliverable?: string; income_target?: string };
    month_2?: { focus?: string; deliverable?: string; income_target?: string };
    month_3?: { focus?: string; deliverable?: string; income_target?: string };
  };
  risk_assessment: {
    tolerance?: string;
    biggest_risk?: string;
    mitigation?: string;
    exit_plan?: string;
    key_risks?: string[];
    mitigations?: string[];
  };
  competitive_landscape?: string;
  recommended_first_steps?: string[];
  job_hunt_synergy?: string;
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
