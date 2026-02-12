/**
 * Shared parsing utilities for resume and JD extraction.
 * Used by Edge Functions and client-side fallback logic.
 */

import type { JobRequirement } from "@/types/landing";

export interface ParsedResume {
  name: string;
  title: string;
  company?: string;
  industry?: string;
  location?: string;
  yearsExperience?: number;
  email?: string;
  linkedinUrl?: string;
  skills: string[];
  skillGaps?: string[];
  resumeScore?: number;
  displacementScore?: number;
}

export interface ParsedJobDescription {
  title: string;
  company: string;
  location?: string;
  salaryRange?: string;
  postedDate?: string;
  applicantCount?: string;
  requirements: JobRequirement[];
  description?: string;
}

/**
 * Extract structured resume data from Claude's response.
 * Expects a JSON response from the AI.
 */
export function parseResumeResponse(raw: string): ParsedResume {
  try {
    const data = JSON.parse(raw);
    return {
      name: data.name || "",
      title: data.title || "",
      company: data.company,
      industry: data.industry,
      location: data.location,
      yearsExperience: data.years_experience,
      email: data.email,
      linkedinUrl: data.linkedin_url,
      skills: Array.isArray(data.skills) ? data.skills : [],
      skillGaps: Array.isArray(data.skill_gaps) ? data.skill_gaps : [],
      resumeScore: data.resume_score,
      displacementScore: data.displacement_score,
    };
  } catch {
    throw new Error("PARSE_FAILED: Could not parse resume AI response");
  }
}

/**
 * Extract structured JD data from Claude's response.
 */
export function parseJdResponse(raw: string): ParsedJobDescription {
  try {
    const data = JSON.parse(raw);
    return {
      title: data.title || "",
      company: data.company || "",
      location: data.location,
      salaryRange: data.salary_range,
      postedDate: data.posted_date,
      applicantCount: data.applicant_count,
      requirements: Array.isArray(data.requirements)
        ? data.requirements.map((r: Record<string, unknown>) => ({
            skill: String(r.skill || ""),
            priority: r.priority === "pref" ? "pref" : "req",
            match: Boolean(r.match),
          }))
        : [],
      description: data.description,
    };
  } catch {
    throw new Error("PARSE_FAILED: Could not parse JD AI response");
  }
}

/**
 * Extract JSON from AI response that may contain markdown code fences.
 */
export function extractJson(text: string): string {
  // Try to find JSON in code fences
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];

  return text;
}
