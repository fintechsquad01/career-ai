import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { input_text, detected_type } = await req.json();

    if (!input_text) {
      return new Response(JSON.stringify({ error: "No input provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let prompt: string;

    if (detected_type === "resume") {
      prompt = `Extract structured data from this resume text. Respond ONLY in valid JSON:
{
  "type": "resume",
  "data": {
    "name": "<full name>",
    "title": "<current job title>",
    "company": "<current company>",
    "industry": "<industry>",
    "location": "<location>",
    "years_experience": <number>,
    "email": "<email if present>",
    "skills": ["<skill1>", "<skill2>"],
    "skill_gaps": [],
    "resume_score": <0-100 ATS score estimate>,
    "displacement_score": <0-100 AI displacement risk>
  }
}

RESUME TEXT:
${input_text}`;
    } else {
      prompt = `Extract structured job posting data from this text. Respond ONLY in valid JSON:
{
  "type": "jd",
  "data": {
    "title": "<job title>",
    "company": "<company name>",
    "location": "<location>",
    "salary_range": "<salary range if mentioned>",
    "requirements": [
      {"skill": "<requirement>", "priority": "req|pref", "match": false}
    ],
    "description_text": "<cleaned description>"
  }
}

JOB POSTING TEXT:
${input_text}`;
    }

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!claudeResponse.ok) {
      return new Response(JSON.stringify({ error: "AI_ERROR" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const claudeData = await claudeResponse.json();
    const responseText = claudeData.content[0].text;

    let result;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return new Response(JSON.stringify({ error: "PARSE_FAILED" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
