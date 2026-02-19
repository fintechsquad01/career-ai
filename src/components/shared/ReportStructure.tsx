"use client";

import type { ReactNode } from "react";
import type { ReportSectionKey } from "@/types";

type ReportPriority = "primary" | "secondary" | "detail";

interface ReportFlowProps {
  summary?: ReactNode;
  evidence?: ReactNode;
  actions?: ReactNode;
  nextStep?: ReactNode;
  summaryPriority?: ReportPriority;
  evidencePriority?: ReportPriority;
  actionsPriority?: ReportPriority;
  nextStepPriority?: ReportPriority;
  actionRail?: ReactNode;
}

interface ReportGroupProps {
  section: ReportSectionKey;
  priority?: ReportPriority;
  children: ReactNode;
}

const SECTION_LABELS: Record<ReportSectionKey, string> = {
  summary: "Verdict",
  evidence: "Why this verdict",
  actions: "Actions",
  next_step: "Next Step",
};

const SECTION_PRIORITY: Record<ReportSectionKey, ReportPriority> = {
  summary: "primary",
  next_step: "primary",
  evidence: "secondary",
  actions: "secondary",
};

export function ReportGroup({ section, priority, children }: ReportGroupProps) {
  const resolvedPriority = priority || SECTION_PRIORITY[section];
  const isDetail = resolvedPriority === "detail";

  if (isDetail) {
    return (
      <details className="report-flow-group" data-report-section={section} data-report-priority={resolvedPriority}>
        <summary className="report-group-label cursor-pointer">{SECTION_LABELS[section]}</summary>
        <div className="mt-2">{children}</div>
      </details>
    );
  }

  return (
    <section className="report-flow-group" data-report-section={section} data-report-priority={resolvedPriority}>
      <p className="report-group-label">{SECTION_LABELS[section]}</p>
      {children}
    </section>
  );
}

export function ReportFlow({
  summary,
  evidence,
  actions,
  nextStep,
  summaryPriority,
  evidencePriority,
  actionsPriority,
  nextStepPriority,
  actionRail,
}: ReportFlowProps) {
  return (
    <div className="report-shell">
      {summary ? <ReportGroup section="summary" priority={summaryPriority}>{summary}</ReportGroup> : null}
      {nextStep ? <ReportGroup section="next_step" priority={nextStepPriority}>{nextStep}</ReportGroup> : null}
      {evidence ? <ReportGroup section="evidence" priority={evidencePriority}>{evidence}</ReportGroup> : null}
      {actions ? <ReportGroup section="actions" priority={actionsPriority}>{actions}</ReportGroup> : null}
      {actionRail ? (
        <div className="sticky bottom-20 sm:bottom-4 z-20 rounded-xl border border-gray-200 bg-white/95 backdrop-blur p-2">
          {actionRail}
        </div>
      ) : null}
    </div>
  );
}

