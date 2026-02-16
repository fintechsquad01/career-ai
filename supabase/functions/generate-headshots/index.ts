import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- CORS: Dynamic origin check ---
const ALLOWED_ORIGINS = [
  Deno.env.get("APP_URL") || "https://aiskillscore.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// --- Rate Limiting ---
const rateLimitMap = new Map<string, number[]>();

function checkRate(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];
  const valid = timestamps.filter((t) => now - t < windowMs);
  if (valid.length >= limit) return false;
  valid.push(now);
  rateLimitMap.set(key, valid);
  return true;
}

const VALID_STYLES = ["professional", "casual", "modern"];
const VALID_BACKGROUNDS = ["neutral", "office", "gradient"];

/**
 * Build a detailed prompt for headshot generation based on style and background.
 */
function buildHeadshotPrompt(style: string, background: string): string {
  const stylePrompt =
    style === "casual"
      ? "relaxed professional portrait, natural soft lighting, warm friendly expression, gentle smile, softly blurred background"
      : style === "modern"
        ? "contemporary professional portrait, creative studio lighting with subtle gradient, modern aesthetic, confident expression, clean minimalist background"
        : "corporate business headshot, clean studio lighting, sharp focus, confident subtle smile, straight-on or slight angle, solid neutral background";

  const bgPrompt =
    background === "office"
      ? "softly blurred modern office environment in background"
      : background === "gradient"
        ? "smooth professional gradient background in subtle blue-to-gray tones"
        : "solid light gray or white studio backdrop";

  return `Generate a professional headshot photo based on the person in the uploaded image. Style: ${stylePrompt}, ${bgPrompt}. The result should be 8K resolution, ultra-detailed skin texture, professional DSLR photography quality, Rembrandt lighting with soft fill, natural skin tones, no artifacts. The output should be a LinkedIn-ready professional headshot. Keep the person's likeness, ethnicity, and key facial features accurate. Generate 1 high-quality headshot.`;
}

/**
 * Fetch an image from a URL and return as a base64 data URL.
 */
async function imageUrlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  return `data:${contentType};base64,${base64}`;
}

/**
 * Extract base64 image data from an OpenRouter/OpenAI response content block.
 * Image output can come as:
 *   - { type: "image_url", image_url: { url: "data:image/png;base64,..." } }
 *   - { type: "image", image: { url: "data:..." } } (some providers)
 *   - Inline base64 in text (fallback)
 */
function extractImagesFromResponse(
  content: unknown
): string[] {
  const images: string[] = [];

  if (typeof content === "string") {
    // Text-only response — no images
    return images;
  }

  if (Array.isArray(content)) {
    for (const block of content) {
      if (!block || typeof block !== "object") continue;
      const b = block as Record<string, unknown>;

      // OpenAI-style: { type: "image_url", image_url: { url: "data:..." } }
      if (b.type === "image_url" && b.image_url) {
        const imgUrl = (b.image_url as Record<string, unknown>).url;
        if (typeof imgUrl === "string") images.push(imgUrl);
      }

      // Alternative: { type: "image", image: { url: "data:..." } }
      if (b.type === "image" && b.image) {
        const imgData = b.image as Record<string, unknown>;
        if (typeof imgData.url === "string") images.push(imgData.url);
        if (typeof imgData.data === "string") {
          images.push(`data:image/png;base64,${imgData.data}`);
        }
      }
    }
  }

  return images;
}

/**
 * Upload a base64 data URL to Supabase storage and return the public URL.
 */
async function uploadBase64ToStorage(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  base64DataUrl: string,
  index: number
): Promise<string | null> {
  // Parse the data URL
  const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;

  const contentType = match[1];
  const base64Data = match[2];
  const ext = contentType.includes("png") ? "png" : "jpeg";

  // Decode base64 to Uint8Array
  const binaryStr = atob(base64Data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const filePath = `${userId}/headshot_${Date.now()}_${index}.${ext}`;

  const { error } = await supabase.storage
    .from("headshots-output")
    .upload(filePath, bytes, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error(`Failed to upload headshot ${index}:`, error.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("headshots-output")
    .getPublicUrl(filePath);

  return publicUrlData?.publicUrl || null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Use SERVICE_ROLE_KEY for server-side operations (storage uploads, DB writes)
    // Auth is verified via the user's JWT token separately
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // First, authenticate the user using their JWT
    const authClient = createClient(supabaseUrl, serviceRoleKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    // Create a service role client for all subsequent operations
    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Rate limit by user: 3/min
    if (!checkRate(`generate-headshots:${user.id}`, 3, 60000)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait and try again." }), {
        status: 429,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { image_paths, style, background } = body;

    // Validate inputs
    if (!Array.isArray(image_paths) || image_paths.length === 0 || image_paths.length > 5) {
      return new Response(JSON.stringify({ error: "Provide 1-5 image paths" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    for (const path of image_paths) {
      if (typeof path !== "string" || path.length === 0 || path.length > 500) {
        return new Response(JSON.stringify({ error: "Each image path must be a non-empty string (max 500 chars)" }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }
    if (style && !VALID_STYLES.includes(style)) {
      return new Response(JSON.stringify({ error: `Invalid style. Must be one of: ${VALID_STYLES.join(", ")}` }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    if (background && !VALID_BACKGROUNDS.includes(background)) {
      return new Response(JSON.stringify({ error: `Invalid background. Must be one of: ${VALID_BACKGROUNDS.join(", ")}` }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const COST = 25; // tokens — matches TOOL_COSTS in constants

    // Check balance (don't deduct yet)
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("token_balance")
      .eq("id", user.id)
      .single();

    if (!profile || profile.token_balance < COST) {
      return new Response(JSON.stringify({ error: "Insufficient tokens" }), {
        status: 402,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Get signed URL for the first uploaded image
    const { data: urlData } = await supabaseClient.storage
      .from("headshots-input")
      .createSignedUrl(image_paths[0], 3600);

    if (!urlData?.signedUrl) {
      return new Response(JSON.stringify({ error: "Could not access uploaded image" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Check OpenRouter API key
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterKey) {
      return new Response(JSON.stringify({ error: "Headshot service not configured" }), {
        status: 503,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Convert uploaded image to base64 for the API request
    const imageBase64 = await imageUrlToBase64(urlData.signedUrl);

    const prompt = buildHeadshotPrompt(style || "professional", background || "neutral");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 120s timeout

    try {
      // Call OpenRouter with gpt-5-image-mini
      const apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": Deno.env.get("APP_URL") || "https://aiskillscore.com",
          "X-Title": "AISkillScore Headshots",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "openai/gpt-5-image-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
                {
                  type: "image_url",
                  image_url: { url: imageBase64 },
                },
              ],
            },
          ],
          max_tokens: 4096,
        }),
      });

      if (!apiRes.ok) {
        const errBody = await apiRes.text();
        console.error("OpenRouter API error:", apiRes.status, errBody);
        throw new Error(`Image generation failed (${apiRes.status})`);
      }

      const apiResult = await apiRes.json();
      const choice = apiResult.choices?.[0];

      if (!choice) {
        throw new Error("No response from image generation model");
      }

      // Extract generated images from the response
      const generatedImages = extractImagesFromResponse(choice.message?.content);

      if (generatedImages.length === 0) {
        console.error("No images in response. Content:", JSON.stringify(choice.message?.content).slice(0, 500));
        throw new Error("Model did not generate any images. Please try again.");
      }

      // Upload generated images to Supabase storage
      const uploadedUrls: string[] = [];
      for (let i = 0; i < generatedImages.length; i++) {
        const publicUrl = await uploadBase64ToStorage(
          supabaseClient,
          user.id,
          generatedImages[i],
          i
        );
        if (publicUrl) {
          uploadedUrls.push(publicUrl);
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error("Failed to save generated headshots");
      }

      const toolResult = {
        headshots: uploadedUrls.map((url: string, i: number) => ({
          url,
          style: style || "professional",
          background: background || "neutral",
          index: i,
        })),
        input_count: image_paths.length,
        generated_count: uploadedUrls.length,
        model: "openai/gpt-5-image-mini",
      };

      // Store result first to get the actual result ID
      const { data: insertedResult, error: insertError } = await supabaseClient
        .from("tool_results")
        .insert({
          user_id: user.id,
          tool_id: "headshots",
          inputs: { image_paths, style, background },
          result: toolResult,
          tokens_spent: COST,
        })
        .select("id")
        .single();

      if (insertError || !insertedResult) {
        throw new Error("Failed to store result");
      }

      // SUCCESS — now deduct tokens with actual result ID
      const { error: spendError } = await supabaseClient.rpc("spend_tokens", {
        p_user_id: user.id,
        p_amount: COST,
        p_tool_id: "headshots",
        p_tool_result_id: insertedResult.id,
      });

      if (spendError) {
        throw new Error("Failed to deduct tokens");
      }

      return new Response(
        JSON.stringify({
          result: toolResult,
          result_id: insertedResult.id,
        }),
        {
          status: 200,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        }
      );
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Headshot generation failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
