/**
 * IndexNow API integration for instant search engine indexing.
 * Notifies Bing, Yandex, Naver, and other IndexNow-compatible engines
 * when pages are created or updated.
 *
 * Perplexity uses Bing's API, so faster Bing indexing = faster Perplexity discovery.
 *
 * Usage:
 *   await submitToIndexNow(["/pricing", "/tools/resume"]);
 */

const INDEXNOW_KEY = "d1f93e3f391cc02fe7ff8f2e923ad29c";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";

interface IndexNowResponse {
  success: boolean;
  statusCode?: number;
  error?: string;
}

/**
 * Submit one or more URLs to IndexNow for immediate indexing.
 * URLs can be full URLs or paths (will be prefixed with APP_URL).
 */
export async function submitToIndexNow(
  urls: string[],
  host?: string
): Promise<IndexNowResponse> {
  const siteHost = host || process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";
  const hostDomain = new URL(siteHost).host;

  // Convert relative paths to full URLs
  const fullUrls = urls.map((url) =>
    url.startsWith("http") ? url : `${siteHost}${url.startsWith("/") ? "" : "/"}${url}`
  );

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: hostDomain,
        key: INDEXNOW_KEY,
        keyLocation: `${siteHost}/${INDEXNOW_KEY}.txt`,
        urlList: fullUrls,
      }),
    });

    return {
      success: response.ok || response.status === 202,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "IndexNow submission failed",
    };
  }
}

/**
 * Submit all public pages to IndexNow. Useful after deployments.
 */
export async function submitAllPagesToIndexNow(): Promise<IndexNowResponse> {
  const toolIds = [
    "displacement", "jd_match", "resume", "cover_letter", "linkedin",
    "headshots", "interview", "skills_gap", "roadmap", "salary", "entrepreneurship",
  ];

  const articleSlugs = [
    "will-ai-replace-my-job",
    "resume-ats-optimization-guide",
    "ai-interview-prep-guide",
  ];

  const comparisonSlugs = [
    "aiskillscore-vs-jobscan",
    "aiskillscore-vs-teal",
    "aiskillscore-vs-finalround",
  ];

  const urls = [
    "/",
    "/pricing",
    "/lifetime",
    "/auth",
    "/privacy",
    "/terms",
    "/blog",
    "/compare",
    ...toolIds.map((id) => `/tools/${id}`),
    ...articleSlugs.map((slug) => `/blog/${slug}`),
    ...comparisonSlugs.map((slug) => `/compare/${slug}`),
  ];

  return submitToIndexNow(urls);
}
