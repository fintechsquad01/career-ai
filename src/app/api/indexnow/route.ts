import { NextResponse } from "next/server";
import { submitAllPagesToIndexNow, submitToIndexNow } from "@/lib/indexnow";

/**
 * POST /api/indexnow — Submit URLs to IndexNow for instant Bing/Perplexity indexing.
 *
 * Body: { urls?: string[] }
 * - If urls provided, submits those specific URLs
 * - If no urls, submits all public pages
 *
 * Protected by a simple API key check (use CRON_SECRET or similar).
 */
export async function POST(request: Request) {
  // Simple auth check — use the same CRON_SECRET used for other internal APIs
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const urls = body.urls as string[] | undefined;

    const result = urls && urls.length > 0
      ? await submitToIndexNow(urls)
      : await submitAllPagesToIndexNow();

    return NextResponse.json({
      success: result.success,
      statusCode: result.statusCode,
      message: result.success
        ? "URLs submitted to IndexNow successfully"
        : `IndexNow submission failed: ${result.error || "Unknown error"}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
