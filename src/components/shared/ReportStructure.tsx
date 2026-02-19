"use client";

import type { ReactNode } from "react";
import type { ReportSectionKey } from "@/types";

interface ReportFlowProps {
  summary?: ReactNode;
  evidence?: ReactNode;
  actions?: ReactNode;
  nextStep?: ReactNode;
}

interface ReportGroupProps {
  section: ReportSectionKey;
  children: ReactNode;
}

const SECTION_LABELS: Record<ReportSectionKey, string> = {
  summary: "Summary",
  evidence: "Evidence",
  actions: "Actions",
  next_step: "Next Step",
};

export function ReportGroup({ section, children }: ReportGroupProps) {
  return (
    <section className="report-flow-group" data-report-section={section}>
      <p className="report-group-label">{SECTION_LABELS[section]}</p>
      {children}
    </section>
  );
}

export function ReportFlow({ summary, evidence, actions, nextStep }: ReportFlowProps) {
  return (
    <div className="report-shell">
      {summary ? <ReportGroup section="summary">{summary}</ReportGroup> : null}
      {evidence ? <ReportGroup section="evidence">{evidence}</ReportGroup> : null}
      {actions ? <ReportGroup section="actions">{actions}</ReportGroup> : null}
      {nextStep ? <ReportGroup section="next_step">{nextStep}</ReportGroup> : null}
    </div>
  );
}

