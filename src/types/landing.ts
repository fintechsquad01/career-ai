/** Resume analysis result from parse-input */
export interface ResumeAnalysisData {
  name: string;
  title: string;
  company?: string;
  industry?: string;
  resume_score: number;
  displacement_score: number;
  skills: string[];
  skill_gaps?: string[];
  salary_benchmark?: string;
}

/** Job requirement from JD analysis */
export interface JobRequirement {
  skill: string;
  priority: "req" | "pref";
  match: boolean;
}

/** Job description analysis result from parse-input */
export interface JobAnalysisData {
  title: string;
  company: string;
  location?: string;
  salary_range?: string;
  requirements: JobRequirement[];
}

/** Parsed input result from parse-input edge function */
export type ParseInputResult =
  | { type: "resume"; data: ResumeAnalysisData }
  | { type: "jd"; data: JobAnalysisData };
