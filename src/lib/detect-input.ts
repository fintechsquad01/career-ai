export type InputType = "url" | "jd" | "resume" | null;

const URL_PATTERN = /https?:\/\/[^\s]+/i;
const JOB_BOARD_DOMAINS = [
  "linkedin.com",
  "greenhouse.io",
  "lever.co",
  "indeed.com",
  "workday.com",
  "jobs.ashbyhq.com",
  "boards.greenhouse.io",
  "wellfound.com",
];

const JD_SIGNALS = [
  "responsibilities",
  "requirements",
  "qualifications",
  "we are looking for",
  "about the role",
  "about this role",
  "what you'll do",
  "what we're looking for",
  "you will",
  "you'll",
  "must have",
  "nice to have",
  "preferred qualifications",
  "minimum qualifications",
  "job description",
  "position overview",
  "role overview",
  "about the position",
  "apply now",
  "equal opportunity",
];

const RESUME_SIGNALS = [
  "experience",
  "education",
  "skills",
  "objective",
  "summary",
  "professional summary",
  "work history",
  "employment",
  "certifications",
  "achievements",
  "references",
];

export function detectInputType(text: string): InputType {
  if (!text || text.trim().length < 10) return null;

  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // Check for URL first
  if (URL_PATTERN.test(trimmed)) {
    const hasJobDomain = JOB_BOARD_DOMAINS.some((domain) =>
      lower.includes(domain)
    );
    if (hasJobDomain || lower.includes("/jobs/") || lower.includes("/careers/")) {
      return "url";
    }
    // If the text is mostly a URL (short input)
    if (trimmed.split("\n").length <= 3 && URL_PATTERN.test(trimmed)) {
      return "url";
    }
  }

  // Count signals for JD vs Resume
  let jdScore = 0;
  let resumeScore = 0;

  for (const signal of JD_SIGNALS) {
    if (lower.includes(signal)) jdScore++;
  }

  for (const signal of RESUME_SIGNALS) {
    if (lower.includes(signal)) resumeScore++;
  }

  // Check for date patterns common in resumes (2019-2023, Jan 2020, etc.)
  const datePatterns = lower.match(
    /\b(19|20)\d{2}\s*[-–—]\s*(19|20)\d{2}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(19|20)\d{2}\b/gi
  );
  if (datePatterns && datePatterns.length >= 2) {
    resumeScore += 3;
  }

  // Check for email/phone patterns (resume indicator)
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(trimmed);
  const hasPhone = /[\d()+-]{10,}/.test(trimmed);
  if (hasEmail) resumeScore += 2;
  if (hasPhone) resumeScore += 2;

  // Check for company-centric language (JD indicator)
  if (lower.includes("we offer") || lower.includes("our team") || lower.includes("you will")) {
    jdScore += 2;
  }

  if (jdScore > resumeScore && jdScore >= 2) return "jd";
  if (resumeScore > jdScore && resumeScore >= 2) return "resume";
  if (jdScore >= 2) return "jd";
  if (resumeScore >= 2) return "resume";

  return null;
}
