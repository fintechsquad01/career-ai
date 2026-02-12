"use client";

import { ToolShell } from "./ToolShell";
import { DisplacementInput } from "./displacement/DisplacementInput";
import { DisplacementResults } from "./displacement/DisplacementResults";
import { JdMatchInput } from "./jd-match/JdMatchInput";
import { JdMatchResults } from "./jd-match/JdMatchResults";
import { ResumeInput } from "./resume/ResumeInput";
import { ResumeResults } from "./resume/ResumeResults";
import { CoverLetterInput } from "./cover-letter/CoverLetterInput";
import { CoverLetterResults } from "./cover-letter/CoverLetterResults";
import { InterviewInput } from "./interview/InterviewInput";
import { InterviewResults } from "./interview/InterviewResults";
import { LinkedInInput } from "./linkedin/LinkedInInput";
import { LinkedInResults } from "./linkedin/LinkedInResults";
import { SkillsGapInput } from "./skills-gap/SkillsGapInput";
import { SkillsGapResults } from "./skills-gap/SkillsGapResults";
import { RoadmapInput } from "./roadmap/RoadmapInput";
import { RoadmapResults } from "./roadmap/RoadmapResults";
import { SalaryInput } from "./salary/SalaryInput";
import { SalaryResults } from "./salary/SalaryResults";
import { EntrepreneurshipInput } from "./entrepreneurship/EntrepreneurshipInput";
import { EntrepreneurshipResults } from "./entrepreneurship/EntrepreneurshipResults";
import { HeadshotsInput } from "./headshots/HeadshotsInput";
import { HeadshotsResults } from "./headshots/HeadshotsResults";
import type { ToolResult } from "@/types";

const TOOL_COMPONENTS: Record<
  string,
  {
    Input: React.ComponentType<{ onSubmit: (inputs: Record<string, unknown>) => void }>;
    Results: React.ComponentType<{ result: ToolResult | null }>;
  }
> = {
  displacement: { Input: DisplacementInput, Results: DisplacementResults },
  jd_match: { Input: JdMatchInput, Results: JdMatchResults },
  resume: { Input: ResumeInput, Results: ResumeResults },
  cover_letter: { Input: CoverLetterInput, Results: CoverLetterResults },
  interview: { Input: InterviewInput, Results: InterviewResults },
  linkedin: { Input: LinkedInInput, Results: LinkedInResults },
  skills_gap: { Input: SkillsGapInput, Results: SkillsGapResults },
  roadmap: { Input: RoadmapInput, Results: RoadmapResults },
  salary: { Input: SalaryInput, Results: SalaryResults },
  entrepreneurship: { Input: EntrepreneurshipInput, Results: EntrepreneurshipResults },
  headshots: { Input: HeadshotsInput, Results: HeadshotsResults },
};

interface ToolPageContentProps {
  toolId: string;
}

export function ToolPageContent({ toolId }: ToolPageContentProps) {
  const components = TOOL_COMPONENTS[toolId];

  if (!components) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Tool &quot;{toolId}&quot; is not yet available.</p>
      </div>
    );
  }

  const { Input, Results } = components;

  return (
    <ToolShell toolId={toolId}>
      {({ state, result, onRun }) =>
        state === "result" ? (
          <Results result={result} />
        ) : (
          <Input onSubmit={onRun} />
        )
      }
    </ToolShell>
  );
}
