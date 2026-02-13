/**
 * OpenRouter API client for AISkillScore.
 * Provides a unified interface for calling AI models through OpenRouter
 * with automatic fallback to GPT-4.1-mini on failure.
 *
 * OpenRouter uses the OpenAI-compatible chat/completions format.
 * Docs: https://openrouter.ai/docs
 */

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens: number;
  temperature?: number;
  response_format?: { type: "json_object" };
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

/**
 * Call OpenRouter API with automatic fallback.
 * If the primary model fails, retries with GPT-4.1-mini.
 */
export async function callOpenRouter(options: {
  apiKey: string;
  appUrl?: string;
  model: string;
  fallbackModel?: string;
  messages: OpenRouterMessage[];
  maxTokens: number;
  temperature?: number;
  timeoutMs?: number;
}): Promise<{
  text: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number } | null;
}> {
  const {
    apiKey,
    appUrl = "https://aiskillscore.com",
    model,
    fallbackModel = "openai/gpt-4.1-mini",
    messages,
    maxTokens,
    temperature = 0.7,
    timeoutMs = 60000,
  } = options;

  // Try primary model first
  try {
    const result = await makeRequest({
      apiKey,
      appUrl,
      model,
      messages,
      maxTokens,
      temperature,
      timeoutMs,
    });
    return result;
  } catch (primaryError) {
    console.error(`[OpenRouter] Primary model ${model} failed:`, primaryError);

    // Fallback to GPT-4.1-mini
    if (model !== fallbackModel) {
      console.log(`[OpenRouter] Falling back to ${fallbackModel}`);
      try {
        const result = await makeRequest({
          apiKey,
          appUrl,
          model: fallbackModel,
          messages,
          maxTokens,
          temperature,
          timeoutMs,
        });
        return result;
      } catch (fallbackError) {
        console.error(`[OpenRouter] Fallback model ${fallbackModel} also failed:`, fallbackError);
        throw fallbackError;
      }
    }

    throw primaryError;
  }
}

async function makeRequest(options: {
  apiKey: string;
  appUrl: string;
  model: string;
  messages: OpenRouterMessage[];
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
}): Promise<{
  text: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number } | null;
}> {
  const { apiKey, appUrl, model, messages, maxTokens, temperature, timeoutMs } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(OPENROUTER_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": appUrl,
        "X-Title": "AISkillScore",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("OpenRouter returned no choices");
    }

    const text = data.choices[0].message.content;
    if (!text) {
      throw new Error("OpenRouter returned empty content");
    }

    return {
      text,
      model: data.model || model,
      usage: data.usage
        ? { prompt_tokens: data.usage.prompt_tokens, completion_tokens: data.usage.completion_tokens }
        : null,
    };
  } finally {
    clearTimeout(timeout);
  }
}
