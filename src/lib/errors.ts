/**
 * Custom error classes for CareerAI.
 * Import these in API routes and Edge Functions for structured error handling.
 */
export class InsufficientTokensError extends Error {
  constructor(required: number, balance: number) {
    super(`Insufficient tokens: need ${required}, have ${balance}`);
    this.name = "InsufficientTokensError";
  }
}

export class AIError extends Error {
  constructor(message: string = "AI processing failed. Please try again.") {
    super(message);
    this.name = "AIError";
  }
}

export class ParseError extends Error {
  constructor(message: string = "Could not extract data from input.") {
    super(message);
    this.name = "ParseError";
  }
}

export class RateLimitError extends Error {
  public retryAfterMs: number;
  constructor(retryAfterMs: number) {
    super("Too many requests. Please wait and try again.");
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}
