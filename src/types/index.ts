export type { Database, Json } from "./database";
export type {
  ResumeAnalysisData,
  JobAnalysisData,
  JobRequirement,
  ParseInputResult,
} from "./landing";
export type {
  ToolId,
  ToolCategory,
  Tool,
  ToolState,
  ReportSectionKey,
  ToolProgress,
  TDisplacementResult,
  TJdMatchResult,
  TResumeResult,
  TCoverLetterResult,
  TLinkedInResult,
  TInterviewResult,
  TSkillsGapResult,
  TRoadmapResult,
  TSalaryResult,
  TEntrepreneurshipResult,
  THeadshotsResult,
  ToolResult,
  InsightType,
  Pack,
} from "./tools";

import type { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type CareerProfile = Database["public"]["Tables"]["career_profiles"]["Row"];
export type JobTarget = Database["public"]["Tables"]["job_targets"]["Row"];
export type ToolResultRow = Database["public"]["Tables"]["tool_results"]["Row"];
export type TokenTransaction = Database["public"]["Tables"]["token_transactions"]["Row"];
export type EmailCapture = Database["public"]["Tables"]["email_captures"]["Row"];
export type SharedScore = Database["public"]["Tables"]["shared_scores"]["Row"];
export type ResumeVariant = Database["public"]["Tables"]["resume_variants"]["Row"];

export type JobTargetStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected" | "withdrawn";

export interface UserWithProfile {
  user: {
    id: string;
    email: string;
  };
  profile: Profile | null;
  careerProfile: CareerProfile | null;
  activeJobTarget: JobTarget | null;
}
