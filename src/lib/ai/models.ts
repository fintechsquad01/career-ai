/**
 * OpenRouter model routing configuration.
 * 3-tier strategy for optimal cost/quality balance:
 *
 * PREMIUM  — Gemini 2.5 Flash ($0.30/$2.50 per M tokens)
 *            User-facing writing: resumes, cover letters, LinkedIn, JD matching
 *
 * STANDARD — DeepSeek V3.2 ($0.25/$0.38 per M tokens)
 *            Analysis & scoring: displacement, interview, salary, roadmap, skills, entrepreneurship
 *
 * LITE     — Gemini 2.5 Flash Lite ($0.10/$0.40 per M tokens)
 *            Extraction: parsing resumes, JDs, URLs
 *
 * FALLBACK — GPT-4.1-mini ($0.40/$1.60 per M tokens)
 *            Auto-retry if primary model fails or is down
 */

export interface ModelConfig {
  model: string;
  maxTokens: number;
  tier: "premium" | "standard" | "lite" | "fallback";
  timeoutMs: number;
}

export const MODEL_CONFIG: Record<string, ModelConfig> = {
  // Tier 1: Premium — user-facing writing (quality-critical)
  resume: { model: "google/gemini-2.5-flash", maxTokens: 4096, tier: "premium", timeoutMs: 60000 },
  cover_letter: { model: "google/gemini-2.5-flash", maxTokens: 4096, tier: "premium", timeoutMs: 60000 },
  linkedin: { model: "google/gemini-2.5-flash", maxTokens: 4096, tier: "premium", timeoutMs: 60000 },
  jd_match: { model: "google/gemini-2.5-flash", maxTokens: 4096, tier: "premium", timeoutMs: 60000 },

  // Tier 2: Standard — analysis and scoring
  skills_gap: { model: "deepseek/deepseek-v3.2", maxTokens: 4096, tier: "standard", timeoutMs: 60000 },
  roadmap: { model: "deepseek/deepseek-v3.2", maxTokens: 4096, tier: "standard", timeoutMs: 60000 },
  entrepreneurship: { model: "deepseek/deepseek-v3.2", maxTokens: 4096, tier: "standard", timeoutMs: 60000 },
  interview: { model: "deepseek/deepseek-v3.2", maxTokens: 4096, tier: "standard", timeoutMs: 60000 },
  salary: { model: "deepseek/deepseek-v3.2", maxTokens: 4096, tier: "standard", timeoutMs: 60000 },
  displacement: { model: "deepseek/deepseek-v3.2", maxTokens: 4096, tier: "standard", timeoutMs: 60000 },

  // Tier 3: Lite — extraction and parsing
  "parse-input": { model: "google/gemini-2.5-flash-lite", maxTokens: 2048, tier: "lite", timeoutMs: 30000 },
  "parse-url": { model: "google/gemini-2.5-flash-lite", maxTokens: 1024, tier: "lite", timeoutMs: 30000 },
};

export const FALLBACK_MODEL: ModelConfig = {
  model: "openai/gpt-4.1-mini",
  maxTokens: 4096,
  tier: "fallback",
  timeoutMs: 60000,
};

export function getModelConfig(toolId: string): ModelConfig {
  return MODEL_CONFIG[toolId] || FALLBACK_MODEL;
}
