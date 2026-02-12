"use client";

import { DisplacementResults } from "@/components/tools/displacement/DisplacementResults";
import { JdMatchResults } from "@/components/tools/jd-match/JdMatchResults";
import { ResumeResults } from "@/components/tools/resume/ResumeResults";
import { CoverLetterResults } from "@/components/tools/cover-letter/CoverLetterResults";
import { LinkedInResults } from "@/components/tools/linkedin/LinkedInResults";
import { InterviewResults } from "@/components/tools/interview/InterviewResults";
import { SkillsGapResults } from "@/components/tools/skills-gap/SkillsGapResults";
import { RoadmapResults } from "@/components/tools/roadmap/RoadmapResults";
import { SalaryResults } from "@/components/tools/salary/SalaryResults";
import { EntrepreneurshipResults } from "@/components/tools/entrepreneurship/EntrepreneurshipResults";
import { HeadshotsResults } from "@/components/tools/headshots/HeadshotsResults";
import type { ToolResult } from "@/types/tools";

interface HistoryResultRendererProps {
  toolId: string;
  result: ToolResult | null;
}

export function HistoryResultRenderer({ toolId, result }: HistoryResultRendererProps) {
  if (!result) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No result data available for this entry.
      </div>
    );
  }

  switch (toolId) {
    case "displacement":
      return <DisplacementResults result={result} />;
    case "jd_match":
      return <JdMatchResults result={result} />;
    case "resume":
      return <ResumeResults result={result} />;
    case "cover_letter":
      return <CoverLetterResults result={result} />;
    case "linkedin":
      return <LinkedInResults result={result} />;
    case "interview":
      return <InterviewResults result={result} />;
    case "skills_gap":
      return <SkillsGapResults result={result} />;
    case "roadmap":
      return <RoadmapResults result={result} />;
    case "salary":
      return <SalaryResults result={result} />;
    case "entrepreneurship":
      return <EntrepreneurshipResults result={result} />;
    case "headshots":
      return <HeadshotsResults result={result} />;
    default:
      return (
        <div className="text-center py-8 text-gray-500 text-sm">
          Result renderer not available for this tool type.
        </div>
      );
  }
}
