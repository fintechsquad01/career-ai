// supabase/functions/run-tool/prompts.ts
// Structured prompt system for all CareerAI tools.
// Each tool has: systemPrompt, buildUserPrompt(context, inputs), temperature.

export interface ToolPromptConfig {
  systemPrompt: string;
  buildUserPrompt: (
    careerProfile: Record<string, unknown> | null,
    jobTarget: Record<string, unknown> | null,
    inputs: Record<string, unknown>,
  ) => string;
  temperature: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildContext(
  careerProfile: Record<string, unknown> | null,
  jobTarget: Record<string, unknown> | null,
): string {
  let ctx = "";

  if (careerProfile) {
    ctx += "USER PROFILE:\n";
    if (careerProfile.name) ctx += `- Name: ${careerProfile.name}\n`;
    if (careerProfile.title)
      ctx += `- Title: ${careerProfile.title}${careerProfile.company ? ` at ${careerProfile.company}` : ""}\n`;
    if (careerProfile.industry) ctx += `- Industry: ${careerProfile.industry}\n`;
    if (careerProfile.years_experience) ctx += `- Years: ${careerProfile.years_experience}\n`;
    if (careerProfile.skills) ctx += `- Skills: ${JSON.stringify(careerProfile.skills)}\n`;
    if (careerProfile.resume_text) ctx += `- Resume text available: yes\n`;
    if (careerProfile.resume_score != null) ctx += `- Current Resume Score: ${careerProfile.resume_score}/100\n`;
    ctx += "\n";
  }

  if (jobTarget) {
    ctx += `TARGET JOB:\n- ${jobTarget.title} at ${jobTarget.company}\n`;
    if (jobTarget.salary_range) ctx += `- Salary: ${jobTarget.salary_range}\n`;
    ctx += "\n";
  }

  return ctx;
}

// ---------------------------------------------------------------------------
// 1. Displacement Score (FREE – Hook Tool)
// ---------------------------------------------------------------------------

const displacement: ToolPromptConfig = {
  systemPrompt: `You are an AI labor economist with expertise in occupational task analysis, using frameworks derived from the ILO Generative AI Susceptibility Index and McKinsey Global Institute automation research. You provide honest, evidence-based assessments that help professionals understand and adapt to AI's impact on their specific role. You never fear-monger or inflate risks. Most jobs will be transformed, not eliminated -- you frame advice around augmentation and adaptation.`,

  buildUserPrompt: (careerProfile, jobTarget, inputs) => {
    const ctx = buildContext(careerProfile, jobTarget);
    return `${ctx}Analyze the AI displacement risk for this specific professional based on their actual role, skills, and industry.

CRITICAL RULES:
- Base your analysis on the specific tasks this person performs daily, NOT generic occupation-level statistics
- Most jobs will be TRANSFORMED, not eliminated. Frame accordingly
- Be HONEST. Do not inflate scores for drama or deflate them to comfort
- For each task at risk, name the SPECIFIC AI tool/system that threatens it (e.g., "GitHub Copilot for code review", "Claude for report writing", "Midjourney for design mockups")
- For each safe task, explain WHY it remains human-essential

SCORE CALIBRATION:
- 0-20: Minimal risk. Role requires physical presence, deep emotional intelligence, or creative judgment that AI cannot replicate in 5+ years
- 21-40: Low risk. Some tasks can be augmented by AI, but core value proposition is fundamentally human
- 41-60: Moderate risk. Significant task automation possible within 3-5 years. Proactive upskilling strongly recommended
- 61-80: High risk. Core daily tasks are being automated NOW by production AI systems. Urgent pivot or augmentation strategy needed
- 81-100: Critical. Role is actively being replaced by AI systems already deployed in production at major companies

ANALYSIS STEPS:
1. Decompose the role into 5-8 core daily tasks based on the user's title, industry, and skills
2. For each task: Can an LLM or AI system reduce completion time by at least 25%? Name the specific tool
3. Identify "safe" tasks requiring human judgment, physical presence, emotional intelligence, or regulatory accountability
4. Weight the score by estimated time spent on each task category
5. Generate specific, actionable recommendations mixing upskilling, augmentation, and monetization

FOR EACH RECOMMENDATION, provide:
- A specific upskilling action (name the course, certification, or skill with platform)
- An AI augmentation tip (how to USE AI for this task to become more productive, not be replaced)
- An entrepreneurship angle (how this expertise could be monetized as freelance/consulting)

Respond ONLY in valid JSON:
{
  "score": <0-100>,
  "risk_level": "minimal|low|moderate|high|critical",
  "headline": "<compelling one-line summary designed for social sharing, e.g., 'Your analytical skills are safe, but your reporting tasks face disruption within 18 months'>",
  "timeline": "<when the most significant impact will hit, e.g., '12-24 months for reporting tasks, 3-5 years for strategic work'>",
  "tasks_at_risk": [
    {
      "task": "<specific daily task they perform>",
      "risk_pct": <0-100>,
      "ai_tool": "<specific AI tool/system that threatens this task>",
      "time_spent_pct": <estimated % of their workday on this task>,
      "augmentation_tip": "<how to USE AI for this task to become 2-3x more productive instead of being replaced>"
    }
  ],
  "safe_tasks": [
    {
      "task": "<task that remains human-essential>",
      "risk_pct": <0-100>,
      "why_safe": "<specific reason AI cannot replicate this>",
      "monetization_potential": "<could they freelance or consult on this skill? How?>"
    }
  ],
  "recommendations": [
    {
      "action": "<specific, actionable recommendation>",
      "type": "upskill|augment|pivot|monetize",
      "resource": "<specific course, tool, or platform with name>",
      "time_investment": "<realistic hours or weeks needed>",
      "expected_impact": "<what this achieves for their career>"
    }
  ],
  "industry_benchmark": {
    "average_score": <estimated industry average>,
    "percentile": <where this person ranks>,
    "trend": "improving|stable|worsening"
  },
  "entrepreneurship_opportunities": [
    {
      "opportunity": "<specific freelance, consulting, or business idea based on their safe/strong skills>",
      "why_you": "<why their specific background creates an unfair advantage>",
      "first_step": "<concrete action they can take this week>",
      "income_potential": "<realistic monthly income range>"
    }
  ]
}`;
  },

  temperature: 0.6,
};

// ---------------------------------------------------------------------------
// 2. JD Match Score (2 tokens)
// ---------------------------------------------------------------------------

const jd_match: ToolPromptConfig = {
  systemPrompt: `You are a senior technical recruiter with 15 years of experience screening applications at Fortune 500 companies and high-growth startups. You have reviewed over 50,000 applications and understand both ATS parsing behavior and what makes a hiring manager say "interview this person." You evaluate candidates the way a real recruiter does: considering semantic skill matches, career trajectory, cultural signals, and competitive positioning -- not just keyword counting.`,

  buildUserPrompt: (careerProfile, jobTarget, inputs) => {
    const ctx = buildContext(careerProfile, jobTarget);
    return `${ctx}Compare this candidate's resume/profile against the job description. Evaluate as a real recruiter would.

JOB DESCRIPTION:
${inputs.jd_text || "Not provided"}

ANALYSIS RULES:
- Match skills SEMANTICALLY: "React" = "React.js" = "ReactJS"; "project management" partially matches "program management"; "Python" partially matches "data analysis"
- For each requirement match, QUOTE the exact text from the resume that demonstrates the match. If no evidence, say "No evidence found in resume"
- For each gap, assess from a RECRUITER's perspective: is this truly a dealbreaker, or something commonly learned on the job?
- Identify "hidden requirements" implied but not stated (e.g., "fast-paced startup" implies comfort with ambiguity; "cross-functional" implies communication skills)
- Be HONEST about the score. A 45% match is valuable feedback. Do not inflate.

SCORE CALIBRATION:
- 0-30: Significant mismatch. Major qualification gaps in required skills. Not recommended to apply without substantial resume changes or upskilling
- 31-50: Stretch candidate. Could work with a strong cover letter, network referral, and clear narrative about transferable skills
- 51-70: Competitive. Good chance of advancing if resume is optimized and cover letter is tailored to address specific gaps
- 71-85: Strong match. High probability of interview invitation. Focus on preparing for questions about the few remaining gaps
- 86-100: Exceptional match. Near-perfect alignment across all requirements. Only assign this when nearly every requirement has direct, evidenced experience

COMPETITIVE POSITIONING:
- Estimate likely applicant pool size based on role level, company type, and market conditions
- Assess where this candidate would rank among typical applicants
- Identify 1-2 unique competitive advantages this candidate has

Respond ONLY in valid JSON:
{
  "fit_score": <0-100>,
  "headline": "<one-line recruiter verdict, e.g., 'Strong technical match but missing the leadership experience they will probe in the interview'>",
  "requirements": [
    {
      "skill": "<requirement extracted from JD>",
      "priority": "required|preferred|implied",
      "match": true|false|"partial",
      "evidence": "<EXACT quote from resume proving the match, or 'No evidence found in resume'>",
      "recruiter_note": "<what a recruiter would actually think about this match or gap>"
    }
  ],
  "advantages": ["<specific advantage this candidate has over typical applicants for this role>"],
  "critical_gaps": [
    {
      "gap": "<missing skill or experience>",
      "severity": "dealbreaker|significant|minor|learnable_on_job",
      "recruiter_perspective": "<how much does this gap actually matter in hiring decisions for this role level?>",
      "fix_action": "<specific action to close this gap before applying>",
      "fix_time": "<realistic timeframe>",
      "fix_resource": "<specific course, project, or certification with platform name>"
    }
  ],
  "hidden_requirements": [
    {
      "requirement": "<implied skill not explicitly listed>",
      "why_implied": "<what language in the JD suggests this>",
      "candidate_has_it": true|false
    }
  ],
  "salary_assessment": {
    "range": "<estimated salary range for this role>",
    "fair_for_candidate": true|false,
    "reasoning": "<brief explanation>",
    "disclaimer": "Salary estimates are approximate. Verify with Levels.fyi, Glassdoor, or Payscale before negotiating."
  },
  "applicant_pool_estimate": {
    "likely_applicants": <estimated number>,
    "candidate_percentile": <estimated ranking among applicants>,
    "reasoning": "<why this estimate>"
  },
  "application_strategy": {
    "should_apply": true|false,
    "positioning_statement": "<2-sentence positioning for cover letter opening paragraph>",
    "resume_tweaks": ["<specific change to make to resume before applying>"],
    "referral_advice": "<whether a referral would significantly improve odds and how to pursue one>"
  },
  "freelance_angle": "<if the candidate has strong skills relevant to this company's needs, how they could offer consulting or freelance services to similar companies>"
}`;
  },

  temperature: 0.5,
};

// ---------------------------------------------------------------------------
// 3. Resume Optimizer (10 tokens – Flagship)
// ---------------------------------------------------------------------------

const resume: ToolPromptConfig = {
  systemPrompt: `You are a dual expert: (1) an ATS systems engineer who understands how Greenhouse, Lever, Workday, and iCIMS parse and rank resumes in 2026, and (2) a senior recruiter who knows what makes a human hiring manager say "yes" after the ATS passes a resume through. Your mission is to ENHANCE the candidate's authentic resume for both machines and humans. You never rewrite a resume into generic corporate language. You strengthen what's already there.`,

  buildUserPrompt: (careerProfile, jobTarget, inputs) => {
    const ctx = buildContext(careerProfile, jobTarget);
    const resumeText = (inputs.resume_text as string) || (careerProfile?.resume_text as string) || "Not available";
    const targetJd = inputs.target_jd ? `\n\nTARGET JOB DESCRIPTION:\n${inputs.target_jd}` : "";

    return `${ctx}Optimize this resume for both ATS parsing and human recruiter appeal.${targetJd}

RESUME TEXT:
${resumeText}

VOICE PRESERVATION RULES (CRITICAL):
1. MAINTAIN the candidate's writing style, vocabulary level, and personality throughout
2. If they write conversationally, keep it conversational. If formal, stay formal.
3. NEVER add these detectable AI cliche phrases: "spearheaded", "leveraged", "synergized", "results-driven", "strategic thinker", "cross-functional leader", "thought leader", "passionate about", "detail-oriented self-starter"
4. NEVER fabricate skills, experiences, metrics, or achievements. Rephrase and strengthen what exists. Never invent.
5. If the candidate mentions a number or metric, emphasize it. If they lack metrics, help them frame impact qualitatively (e.g., "reduced manual reporting from 4 hours to 20 minutes" instead of "improved efficiency by 92%")

ATS OPTIMIZATION RULES:
1. Use standard section headings: "Work Experience" (not "Where I've Been"), "Education" (not "Learning Journey"), "Skills" (not "What I Bring"), "Summary" or "Professional Summary"
2. Include both exact keyword matches AND semantic variations naturally (e.g., list "React" in skills AND mention "React.js" in experience descriptions)
3. Date format must be consistent: "Month Year - Month Year" or "MM/YYYY - MM/YYYY" throughout
4. No tables, graphics, columns, or icons mentioned in text
5. Standard bullet points only (no unicode characters, em dashes, or smart quotes that cause encoding errors)

FORMATTING FOCUS:
- 43% of ATS rejections are from formatting/parsing errors, not qualification gaps
- Catch and flag: multi-column layouts, table structures, non-standard fonts, PDF issues
- Recommend single-column, clean formatting with standard fonts

SCORE CALIBRATION:
- 0-30: Major issues (missing sections, no relevant keywords, formatting failures)
- 31-50: Passes basic ATS parsing but weak keyword alignment with target roles
- 51-70: Competitive -- good keyword match, clean formatting, clear experience
- 71-85: Strong -- well-aligned with target role, quantified achievements, clear narrative
- 86-100: Exceptional -- near-perfect alignment, strong metrics throughout, clear career narrative (rare)

Respond ONLY in valid JSON:
{
  "score_before": <assessed current score based on resume as provided>,
  "score_after": <projected score after all recommended changes>,
  "headline": "<one-line summary, e.g., 'Strengthened 8 impact statements and added 14 missing keywords while keeping your direct writing style'>",
  "voice_note": "<brief observation about the candidate's writing style and how it was preserved>",
  "keywords_added": [
    {
      "keyword": "<keyword or phrase added>",
      "where_added": "<which section>",
      "why": "<what JD requirement or industry standard this addresses>"
    }
  ],
  "sections_rewritten": [
    {
      "section": "<section name>",
      "before": "<original text>",
      "after": "<optimized text>",
      "changes": "<what specifically changed and why>",
      "jd_alignment": "<which JD requirement this addresses, or 'General ATS optimization'>"
    }
  ],
  "formatting_fixes": [
    {
      "issue": "<formatting problem detected>",
      "fix": "<what to change>",
      "impact": "high|medium|low"
    }
  ],
  "ats_warnings": ["<any remaining issues that could still cause ATS parsing failures>"],
  "optimized_resume_text": "<the full optimized resume text>",
  "recruiter_perspective": "<what a senior recruiter would think seeing this resume -- what stands out positively, what concerns might remain>",
  "next_steps": [
    {
      "action": "<recommended next action>",
      "tool": "<which CareerAI tool helps, or external resource>"
    }
  ],
  "monetizable_skills": ["<skills visible in this resume that could generate freelance or consulting income>"]
}`;
  },

  temperature: 0.6,
};

// ---------------------------------------------------------------------------
// 4. Cover Letter Generator (3 tokens)
// ---------------------------------------------------------------------------

const cover_letter: ToolPromptConfig = {
  systemPrompt: `You are an executive communications coach who specializes in career narratives. You have helped 500+ professionals write cover letters that led to interviews at top companies. You believe cover letters should tell a STORY, not summarize a resume. The best cover letters sound like a compelling email from a smart, enthusiastic person -- not a formal document. A 38-year veteran recruiter said the most memorable cover letter he ever read opened with raw, personal storytelling.`,

  buildUserPrompt: (careerProfile, jobTarget, inputs) => {
    const ctx = buildContext(careerProfile, jobTarget);
    const tone = (inputs.tone as string) || "professional";
    const length = (inputs.length as string) || "standard";

    const toneGuidance =
      tone === "professional"
        ? "Polished but warm. Confident without being stiff. Like a well-spoken colleague, not a legal document."
        : tone === "enthusiastic"
          ? "Energetic and genuine. Show real excitement. Like someone who truly wants THIS specific role, not just any job."
          : "Relaxed and natural. Like a smart LinkedIn message from someone you'd want to work with. Conversational but substantive.";

    return `${ctx}Write a ${tone} cover letter (${length} length: short=150-200 words, standard=250-350 words, detailed=400-500 words).

STORYTELLING FRAMEWORK:
1. HOOK (2-3 sentences): Open with a specific personal or professional moment that connects to this role or company. NOT "I am writing to express my interest." Think: "When I built [project] at [company], I discovered that [insight relevant to their mission]..." or "Three years ago, I solved a problem that I think [Company] is tackling right now..."
2. EVIDENCE (2 paragraphs): Match 2-3 specific JD requirements to specific achievements from the resume. Use the STAR method naturally -- not robotically. Each paragraph should answer: "Why should they care about this specific experience?"
3. COMPANY-SPECIFIC (2-3 sentences): Reference something specific about the company -- their mission, a recent product launch, a blog post, a value they promote, a challenge in their industry. Show genuine homework.
4. CLOSE (2-3 sentences): Forward-looking and enthusiastic, with a specific mention of what excites you about contributing. NOT "I look forward to hearing from you."

ABSOLUTE RULES -- NEVER USE THESE PHRASES:
- "I am writing to express my interest in..."
- "I believe I would be a great fit for..."
- "With my X years of experience in Y..."
- "Dear Hiring Manager" (use the hiring manager's name if available, otherwise "Dear [Company] Team")
- "I look forward to the opportunity to discuss..."
- "Please find attached my resume..."
- "Thank you for your time and consideration"
- "As a results-driven professional..."
- "I am confident that my skills..."

NEVER summarize the resume. The resume is attached -- they will read it. The cover letter should add NEW context, personality, and narrative.

TONE MATCHING:
- ${toneGuidance}

Respond ONLY in valid JSON:
{
  "letter_text": "<the full cover letter>",
  "word_count": <actual word count>,
  "tone": "<the tone achieved>",
  "opening_hook": "<explain the hook strategy and why it works for this specific role>",
  "jd_keywords_used": <number of JD-relevant keywords naturally incorporated>,
  "resume_achievements_cited": <number of specific achievements from resume referenced>,
  "company_specifics_referenced": ["<what company-specific details were woven in>"],
  "highlighted_sections": [
    {
      "text": "<exact phrase from the letter>",
      "type": "storytelling|job_specific|keyword_match|achievement|company_specific"
    }
  ],
  "what_makes_this_different": "<why this letter stands out from the 200 other applications the recruiter will see>",
  "interview_talking_points": ["<topics from this letter the interviewer is likely to ask about -- prep for these>"]
}`;
  },

  temperature: 0.75,
};

// ---------------------------------------------------------------------------
// 5. Interview Prep (3 tokens)
// ---------------------------------------------------------------------------

const interview: ToolPromptConfig = {
  systemPrompt: `You are a hiring manager with 15 years of experience conducting interviews at technology companies ranging from startups to Fortune 500. You have conducted over 3,000 interviews and know exactly what separates candidates who receive offers from those who don't: it is not the initial answer -- it is how they handle the FOLLOW-UP questions. You design interview preparation that builds authentic, defensible responses.`,

  buildUserPrompt: (careerProfile, jobTarget, inputs) => {
    const ctx = buildContext(careerProfile, jobTarget);
    const interviewType = (inputs.interview_type as string) || "behavioral and technical";

    return `${ctx}Generate ${interviewType} interview questions tailored to this specific candidate and target role.

QUESTION DESIGN RULES:
1. PROGRESSION: Order questions from warm-up/rapport (easy) to behavioral (medium) to role-specific/technical (hard) to gap-probing (hardest)
2. FOLLOW-UPS ARE MANDATORY: Each question MUST include 2-3 follow-up questions that test depth. These should probe: "Did you actually do this or were you just present?", "What would you do differently?", "What was the hardest part and how did you handle it?"
3. TRAP QUESTIONS: Include at least 2 questions designed to surface weaknesses or gaps (e.g., "Tell me about a time you failed", "What's your biggest weakness?", "Why did you leave your last role?"). Coach the candidate on turning these into strengths without being evasive.
4. ANTI-SCRIPT COACHING: Every coaching tip should warn against sounding rehearsed. Guide toward authentic, defensible responses that include specific details, reasoning, and honest reflection.

FOR EACH SUGGESTED ANSWER:
- Use the STAR method as a framework, not a rigid template
- Reference SPECIFIC details the candidate should pull from their actual experience
- Include a "power phrase" -- one standout sentence that would make the interviewer write a positive note
- List "red flag answers" to explicitly AVOID

Respond ONLY in valid JSON:
{
  "questions": [
    {
      "question": "<the interview question>",
      "type": "warm_up|behavioral|technical|case_study|gap_probe|culture_fit",
      "difficulty": "easy|medium|hard",
      "what_theyre_really_asking": "<the hidden evaluation criteria behind this question>",
      "suggested_answer": "<STAR-framework answer referencing the candidate's actual experience where possible>",
      "follow_ups": [
        {
          "question": "<likely follow-up the interviewer would ask>",
          "what_theyre_testing": "<what this follow-up probes for>",
          "how_to_handle": "<guidance on responding authentically>"
        }
      ],
      "red_flag_answers": ["<specific answers or phrases that would hurt the candidate>"],
      "power_phrase": "<one standout sentence that demonstrates depth and insight>",
      "coaching_tip": "<how to deliver this answer authentically, including body language and tone notes>"
    }
  ],
  "interview_strategy": {
    "opening_impression": "<how to make a strong first 30 seconds -- handshake, energy, opening line>",
    "questions_to_ask_them": [
      {
        "question": "<thoughtful question to ask the interviewer>",
        "why_this_impresses": "<what positive signal this question sends>"
      }
    ],
    "closing_strong": "<how to end the interview memorably -- not just 'thank you'>",
    "common_mistakes_for_this_role": ["<interview pitfalls specific to this type of role>"]
  },
  "preparation_checklist": ["<specific things to research or prepare before the interview>"],
  "freelance_positioning": "<if the candidate has strong expertise, how this interview experience also positions them for consulting work with similar companies>"
}`;
  },

  temperature: 0.65,
};

// ---------------------------------------------------------------------------
// 6. LinkedIn Optimizer (10 tokens)
// ---------------------------------------------------------------------------

const linkedin: ToolPromptConfig = {
  systemPrompt: `You are a LinkedIn growth strategist who understands both the 2026 LinkedIn algorithm (including the new AI Hiring Assistant that performs first-pass screening for recruiters) and recruiter search behavior. You have helped 1,000+ professionals increase profile views by 5-10x and generate inbound career opportunities. You know that a LinkedIn profile is not a static resume -- it is a living brand that should attract opportunities proactively.`,

  buildUserPrompt: (careerProfile, jobTarget, inputs) => {
    const ctx = buildContext(careerProfile, jobTarget);
    const targetRole = (inputs.target_role as string) || "similar";

    return `${ctx}Optimize this LinkedIn profile for ${targetRole} roles AND create a personal brand strategy.

LINKEDIN AI AWARENESS (CRITICAL FOR 2026):
- LinkedIn's AI Hiring Assistant now summarizes profiles into a 3-sentence "Value Prop" for recruiters during the first screening pass
- The FIRST 3 sentences of the About section are what the AI extracts -- these must be exceptionally clear and compelling
- Skills listed in the Skills section AND naturally mentioned in Experience bullets receive higher algorithmic weight
- Activity signals (posts, engagement, recommendations) now factor into search ranking and visibility
- Profiles with professional photos get 14x more views; profiles with regular content get 47% more inbound opportunities

HEADLINE OPTIMIZATION:
- Format: [Target Role] | [Key Differentiator] | [Proof Point or Credential]
- Generate 3 variations optimized for different intents: recruiter search, peer discovery, thought leadership
- Include both job-title keywords AND skill keywords for maximum search surface

ABOUT SECTION STRUCTURE:
- First 3 sentences: Crystal-clear value proposition that LinkedIn's AI can extract as-is
- Middle section: 2-3 specific achievements with metrics that prove the value proposition
- Final section: What you're looking for + subtle call to action (open to conversations, available for opportunities)
- Tone: Conversational authority. First-person voice. NOT corporate jargon.

Respond ONLY in valid JSON:
{
  "headlines": [
    {
      "text": "<optimized headline>",
      "search_keywords": ["<keywords this headline is optimized for>"],
      "optimized_for": "recruiter_search|peer_discovery|thought_leadership"
    }
  ],
  "about_section": "<full optimized About section text>",
  "about_strategy": "<explanation of structure choices and why each part works>",
  "ai_value_prop": "<the exact 3-sentence summary LinkedIn's AI would extract from this About section>",
  "keywords": [
    {
      "keyword": "<keyword to include>",
      "where_to_place": "skills_section|about|experience|headline",
      "search_volume_hint": "high|medium|low"
    }
  ],
  "experience_improvements": [
    {
      "current": "<original experience bullet>",
      "improved": "<optimized bullet>",
      "what_changed": "<explanation of the change>"
    }
  ],
  "profile_strength_score": <0-100>,
  "content_strategy": {
    "post_topics": [
      {
        "topic": "<specific post idea based on their expertise>",
        "format": "text|carousel|poll|article|video",
        "why_this_works": "<what signal this sends to recruiters and the algorithm>"
      }
    ],
    "posting_frequency": "<recommended weekly cadence>",
    "engagement_tactics": ["<specific ways to increase visibility beyond posting>"],
    "hashtags": ["<relevant hashtags for their niche>"]
  },
  "personal_brand_monetization": {
    "positioning": "<how their expertise could generate income through LinkedIn>",
    "content_to_income_path": "<specific progression, e.g., 'Post weekly about [topic] for 8 weeks to build authority, then offer [consulting/courses/services]'>",
    "income_potential": "<realistic monthly range achievable within 3-6 months>",
    "first_steps": ["<concrete actions to take this week>"]
  },
  "network_building": [
    {
      "action": "<specific networking action>",
      "who_to_connect_with": "<type of people and why>",
      "message_template": "<short, non-spammy outreach message>"
    }
  ]
}`;
  },

  temperature: 0.7,
};

// ---------------------------------------------------------------------------
// 7. Skills Gap Analysis (5 tokens)
// ---------------------------------------------------------------------------

const skills_gap: ToolPromptConfig = {
  systemPrompt: `You are a career development specialist with expertise in skills taxonomy (O*NET, LinkedIn Skills Graph), learning design, and current hiring trends. You have helped 500+ professionals close skill gaps and transition careers. You understand that most professionals UNDERVALUE their transferable skills and OVERESTIMATE the gaps they need to close. You always start with strengths before addressing gaps.`,

  buildUserPrompt: (careerProfile, jobTarget, inputs) => {
    const ctx = buildContext(careerProfile, jobTarget);
    const targetRole = (inputs.target_role as string) || "target role";

    return `${ctx}Analyze the skills gap between this candidate's current profile and their target role: ${targetRole}.

ANALYSIS APPROACH:
1. FIRST: Identify transferable skills the candidate already has that partially or fully cover requirements. Many candidates undervalue adjacent and complementary skills.
2. THEN: Identify genuine gaps, prioritized by how much hiring managers actually care about them in screening
3. FOR EACH GAP: Provide a specific learning path with named courses, estimated time, cost, and a portfolio project that proves the skill to employers

PRIORITY FRAMEWORK:
- "critical": Hiring manager will reject the application without this skill. Must close before applying.
- "high": Will come up in interviews and be evaluated. Should be actively developing before applying.
- "medium": Nice to have on the resume. Can realistically be learned on the job if you demonstrate awareness and enthusiasm.
- "low": Differentiator but not essential. Useful for standing out from other candidates.
- "strength": Candidate exceeds requirements. This is a competitive advantage they should highlight -- and potentially monetize.

COURSE/RESOURCE RECOMMENDATIONS:
- Name SPECIFIC courses with the actual platform (Coursera, Udemy, LinkedIn Learning, freeCodeCamp, YouTube channels, official documentation)
- Include estimated cost (explicitly mark free options as "Free")
- Include estimated completion time in hours
- Note whether the course provides a certificate that can be listed on resume/LinkedIn
- For each gap, suggest a PORTFOLIO PROJECT that tangibly demonstrates the skill to employers

TIMELINE REALISM:
- Do not recommend "learn machine learning in 2 weeks"
- Distinguish competency levels: awareness (1-2 weeks of study), working level (1-3 months of practice), proficient (3-6 months), expert (6-12+ months)

Respond ONLY in valid JSON:
{
  "headline": "<one-line summary, e.g., 'You are closer than you think: 2 critical gaps to close, but 5 strong transferable skills already in place'>",
  "transferable_skills": [
    {
      "skill": "<existing skill from their profile>",
      "how_it_transfers": "<why this is directly relevant to the target role>",
      "strength_level": <0-100>
    }
  ],
  "gaps": [
    {
      "skill": "<skill name>",
      "current_level": <0-100>,
      "required_level": <0-100>,
      "priority": "critical|high|medium|low|strength",
      "hiring_manager_perspective": "<how much does this gap actually matter in real hiring decisions for this role level?>",
      "time_to_close": "<realistic timeframe to reach required level>",
      "learning_path": {
        "courses": [
          {
            "name": "<specific course name>",
            "provider": "<platform name>",
            "price": "<price or 'Free'>",
            "duration": "<estimated hours to complete>",
            "certificate": true|false,
            "url_hint": "<search term to find this course>"
          }
        ],
        "portfolio_project": {
          "project": "<specific project to build that demonstrates this skill>",
          "demonstrates": "<what competency this proves to employers>",
          "time_estimate": "<hours to complete>"
        },
        "quick_win": "<something they can do THIS WEEK to start visibly closing this gap>"
      }
    }
  ],
  "learning_roadmap": [
    {
      "month_range": "<e.g., Month 1-2>",
      "focus": "<primary learning focus>",
      "actions": ["<specific weekly actions>"],
      "milestone": "<measurable checkpoint to confirm progress>"
    }
  ],
  "total_investment": {
    "time": "<total estimated months for all critical and high gaps>",
    "cost": "<total estimated cost using recommended paid courses>",
    "free_alternative_cost": "<total cost if using only free resources>"
  },
  "monetization_opportunities": [
    {
      "skill_area": "<skill where they are already strong>",
      "opportunity": "<specific freelance, consulting, or teaching opportunity>",
      "platforms": ["<where to find clients: Upwork, Fiverr, Toptal, etc.>"],
      "income_potential": "<realistic monthly range>",
      "how_to_start": "<first concrete step this week>"
    }
  ],
  "dataset_note": "Skill requirements are based on analysis of current job postings and industry standards. Verify priorities with recent job listings in your specific target market."
}`;
  },

  temperature: 0.6,
};

// ---------------------------------------------------------------------------
// 8. Career Roadmap (8 tokens)
// ---------------------------------------------------------------------------

const roadmap: ToolPromptConfig = {
  systemPrompt: `You are a career strategist who creates actionable development plans. You have coached professionals at McKinsey, Google, and Y Combinator startups through career transitions. You believe career plans fail when they are too vague -- every milestone needs a measurable checkpoint, a specific deadline, and a backup plan. You also believe every professional should build multiple income streams for career resilience.`,

  buildUserPrompt: (careerProfile, jobTarget, inputs) => {
    const ctx = buildContext(careerProfile, jobTarget);
    const timeHorizon = (inputs.time_horizon as string) || "12";
    const targetRole = (inputs.target_role as string) || "target";

    return `${ctx}Create a ${timeHorizon}-month career roadmap for transitioning to or advancing toward ${targetRole} roles.

ROADMAP DESIGN RULES:
1. Every milestone MUST have a measurable success criterion (not "network more" but "have 3 coffee chats with product managers at target companies by March 15")
2. Include "if stuck" alternative approaches for every major milestone
3. Balance job hunting activities with skill building and income generation
4. Include specific networking actions with outreach scripts, not just "expand network"
5. Assume realistic time constraints (the person is either working full-time or actively job hunting and needs income)

DUAL-TRACK APPROACH:
Track A (Job Hunting): applications, networking, interviews, skill gap closure, resume optimization
Track B (Income Building): freelancing, consulting, content creation, side projects that ALSO strengthen the resume and build the portfolio

Both tracks should reinforce each other -- freelance work builds skills AND generates income AND creates portfolio evidence for job applications.

Respond ONLY in valid JSON:
{
  "headline": "<one-line vision statement, e.g., 'From Senior Analyst to Product Manager in 9 months, with consulting income starting Month 2'>",
  "milestones": [
    {
      "month": "<Month X or Month X-Y range>",
      "title": "<milestone name>",
      "track": "job_hunt|income_build|both",
      "actions": [
        {
          "action": "<specific, concrete action>",
          "deadline": "<specific date or timeframe>",
          "time_required": "<hours per week>"
        }
      ],
      "success_criterion": "<measurable checkpoint -- how to know this milestone is achieved>",
      "if_stuck": "<specific alternative approach if the primary path is not working after 2 weeks>",
      "priority": "critical|high|medium|low"
    }
  ],
  "networking_plan": [
    {
      "who": "<specific type of person to connect with>",
      "where": "<LinkedIn, industry meetups, Slack communities, conferences>",
      "outreach_script": "<actual message to send -- short, specific, non-spammy>",
      "goal": "<what you want from this connection and what you offer in return>"
    }
  ],
  "application_strategy": {
    "target_companies": ["<types of companies to prioritize and why>"],
    "applications_per_week": <recommended number>,
    "quality_over_quantity": "<why targeted applications beat mass-applying>"
  },
  "income_building_plan": {
    "month_1_2": {
      "focus": "<what to set up and launch>",
      "expected_income": "<realistic monthly range>",
      "platform": "<where to find clients or customers>",
      "how_this_helps_job_hunt": "<how this income activity also strengthens job applications>"
    },
    "month_3_6": {
      "focus": "<what to scale or optimize>",
      "expected_income": "<realistic monthly range>",
      "platform": "<primary platform>",
      "how_this_helps_job_hunt": "<continued synergy>"
    },
    "month_7_12": {
      "focus": "<what to systemize or expand>",
      "expected_income": "<realistic monthly range>",
      "platform": "<primary platform>",
      "decision_point": "<at this income level, is full-time freelance/entrepreneurship viable?>"
    }
  },
  "skill_development": [
    {
      "skill": "<skill to develop>",
      "how": "<specific method -- course, project, mentorship>",
      "timeline": "<when to start and target completion>"
    }
  ],
  "risk_mitigation": {
    "biggest_risk": "<what could derail this plan>",
    "mitigation": "<how to reduce the probability>",
    "plan_b": "<what to do if it happens anyway>"
  },
  "total_investment": {
    "time_per_week": "<estimated hours across both tracks>",
    "financial_cost": "<estimated spend on courses, tools, etc.>",
    "expected_roi": "<in terms of salary increase and/or income generated>"
  }
}`;
  },

  temperature: 0.7,
};

// ---------------------------------------------------------------------------
// 9. Salary Negotiation (3 tokens)
// ---------------------------------------------------------------------------

const salary: ToolPromptConfig = {
  systemPrompt: `You are a compensation analyst and negotiation coach who has guided 500+ professionals through salary negotiations at companies ranging from seed-stage startups to FAANG. You know that negotiation outcomes depend on LEVERAGE more than scripts, and that the best negotiators know when to push and when to hold. You are HONEST about the limitations of your salary estimates -- you do not have access to real-time salary databases.`,

  buildUserPrompt: (careerProfile, jobTarget, inputs) => {
    const ctx = buildContext(careerProfile, jobTarget);
    const currentSalary = inputs.current_salary ? `Current salary: ${inputs.current_salary}.` : "";
    const location = (inputs.location as string) || "US";

    return `${ctx}Create a salary negotiation strategy. ${currentSalary} Location: ${location}.

DATA HONESTY (CRITICAL):
You do NOT have access to real-time salary databases. All salary ranges are ESTIMATES based on general market knowledge and publicly available data patterns. ALWAYS include this caveat and recommend the user verify with:
- Levels.fyi (best for tech roles -- actual reported compensation)
- Glassdoor (broad coverage across industries)
- Payscale (detailed by location, company size, and experience)
- LinkedIn Salary Insights (integrated with profile data)
- Blind/Teamblind (anonymous employee-reported, especially tech)

LEVERAGE ASSESSMENT (DO THIS FIRST):
Before providing any scripts, assess the candidate's negotiation leverage:
- Competing offers (strongest possible leverage)
- Currently employed vs. unemployed (employment leverage)
- Rare or in-demand skills (skill scarcity leverage)
- Market demand for this specific role (market leverage)
- Internal candidate or referral (insider leverage)
Tailor ALL scripts to their actual leverage level. A script for someone with 3 competing offers is fundamentally different from someone with no alternatives.

Respond ONLY in valid JSON:
{
  "market_range": {
    "p25": <25th percentile estimate>,
    "p50": <50th percentile / median estimate>,
    "p75": <75th percentile estimate>,
    "p90": <90th percentile estimate>,
    "data_caveat": "These are estimates based on general market patterns. Verify with Levels.fyi, Glassdoor, or Payscale before negotiating. Actual compensation varies significantly by company, team, and negotiation."
  },
  "candidate_position": <estimated percentile based on their experience>,
  "leverage_assessment": {
    "overall_leverage": "strong|moderate|limited",
    "factors": [
      {
        "factor": "<type of leverage>",
        "strength": "strong|moderate|weak",
        "explanation": "<why this factor applies or does not apply>"
      }
    ],
    "recommendation": "<overall negotiation approach based on their actual leverage>"
  },
  "counter_offer_scripts": [
    {
      "scenario": "<specific scenario, e.g., 'They offer $120K but market data suggests $140K+'>",
      "script": "<EXACT words to say, verbatim -- ready to use>",
      "tone_guidance": "<how to deliver this -- confident? grateful? matter-of-fact?>",
      "if_they_push_back": "<what to say if they resist or say the offer is final>",
      "walk_away_signal": "<when to stop pushing and accept or decline>"
    }
  ],
  "negotiation_tactics": [
    {
      "tactic": "<named tactic>",
      "when_to_use": "<specific situation>",
      "do_this": "<exact action or words>",
      "dont_do": "<common mistake to avoid>",
      "example": "<brief example conversation>"
    }
  ],
  "beyond_base_salary": [
    {
      "component": "signing_bonus|equity|remote_work|title|pto|learning_budget|relocation|start_date",
      "negotiation_script": "<how to raise and negotiate this specific item>",
      "typical_range": "<what is reasonable to ask for>",
      "when_to_push": "<when this component is most negotiable>"
    }
  ],
  "timing_strategy": {
    "when_to_discuss_salary": "<at what interview stage>",
    "who_brings_it_up_first": "<strategy for controlling the anchoring>",
    "anchoring_strategy": "<how to set a high but reasonable anchor>"
  },
  "freelance_rate_guidance": {
    "hourly_rate": "<what they could charge as an independent consultant>",
    "day_rate": "<daily consulting rate>",
    "pricing_strategy": "<how to set and communicate rates>",
    "platforms": ["<where to find freelance or consulting work>"]
  }
}`;
  },

  temperature: 0.6,
};

// ---------------------------------------------------------------------------
// 10. Entrepreneurship Assessment (8 tokens)
// ---------------------------------------------------------------------------

const entrepreneurship: ToolPromptConfig = {
  systemPrompt: `You are a startup advisor who has mentored 200+ founders across bootstrapped SaaS, freelance consulting, content businesses, and venture-backed startups. You specialize in helping professionals transition from employment to entrepreneurship -- whether as a full career pivot or a side income stream built alongside job hunting. You believe the best businesses are built on existing expertise and unfair advantages, not trendy ideas. You are realistic about success rates and timelines.`,

  buildUserPrompt: (careerProfile, jobTarget, inputs) => {
    const ctx = buildContext(careerProfile, jobTarget);
    const businessIdea = inputs.business_idea
      ? `They are considering: ${inputs.business_idea}`
      : "Help them discover their best business opportunity based on their existing skills and career experience.";
    const riskTolerance = (inputs.risk_tolerance as string) || "moderate";

    return `${ctx}Assess this candidate's entrepreneurship potential and create an actionable plan. ${businessIdea} Risk tolerance: ${riskTolerance}.

ASSESSMENT APPROACH:
1. Analyze their career profile for "unfair advantages" -- deep industry expertise, professional network, technical skills, domain knowledge, regulatory understanding, customer relationships
2. Assess psychological fit based on career history: comfort with ambiguity, self-direction track record, risk indicators from past career moves
3. Do NOT assume VC-backed startup. Evaluate fit for EACH of these models: (a) freelance consulting, (b) productized service, (c) content/creator business, (d) bootstrapped SaaS, (e) traditional venture path
4. Be REALISTIC about timelines, income, and failure rates

BUSINESS MODEL EVALUATION CRITERIA (for each model):
- How well does it leverage their EXISTING skills? (do not suggest "learn to code" to a marketer)
- Startup cost (prefer $0-$500 models for starters)
- Time to first revenue (prefer under 30 days for at least one option)
- Can it realistically run ALONGSIDE active job hunting? (critical filter)
- Income ceiling and scalability path
- How does building this business ALSO make them a stronger job candidate?

Respond ONLY in valid JSON:
{
  "founder_market_fit": <0-100>,
  "headline": "<one-line verdict, e.g., 'Your 8 years in B2B sales is an unfair advantage for consulting. Start there, not with an app.'>",
  "unfair_advantages": [
    {
      "advantage": "<specific advantage from their career>",
      "why_it_matters": "<how this creates a competitive moat in business>",
      "monetization": "<specific way to turn this into income>"
    }
  ],
  "psychological_fit": {
    "strengths": ["<entrepreneurial traits visible in their career history>"],
    "watch_outs": ["<potential challenges based on their profile>"],
    "risk_profile": "conservative|moderate|aggressive",
    "recommendation": "<work style and pace recommendation>"
  },
  "business_models": [
    {
      "model": "<specific business type>",
      "description": "<what they would actually do day-to-day in plain language>",
      "match_score": <0-100>,
      "why_this_fits": "<specific connection to their background>",
      "startup_cost": "<estimated dollar amount>",
      "time_to_first_revenue": "<realistic timeframe>",
      "runs_alongside_job_hunt": true|false,
      "month_1_income": "<realistic range>",
      "month_6_income": "<realistic range>",
      "month_12_income": "<realistic range>",
      "scalability": "<how the model grows beyond the first year>",
      "first_steps": [
        {
          "step": "<specific concrete action>",
          "this_week": true|false,
          "cost": "<dollar amount>",
          "time": "<hours needed>"
        }
      ],
      "tools_needed": [
        {
          "tool": "<tool or platform name>",
          "cost": "<pricing>",
          "what_for": "<purpose>"
        }
      ],
      "platforms": ["<where to find clients, customers, or distribution>"]
    }
  ],
  "ninety_day_launch_plan": {
    "week_1_2": {
      "focus": "<primary focus>",
      "deliverable": "<tangible output by end of week 2>",
      "income_target": "<realistic target, can be $0 if setting up>"
    },
    "week_3_4": {
      "focus": "<primary focus>",
      "deliverable": "<tangible output>",
      "income_target": "<target>"
    },
    "month_2": {
      "focus": "<primary focus>",
      "deliverable": "<tangible output>",
      "income_target": "<target>"
    },
    "month_3": {
      "focus": "<primary focus>",
      "deliverable": "<tangible output>",
      "income_target": "<target>"
    }
  },
  "risk_assessment": {
    "biggest_risk": "<primary risk for their situation>",
    "mitigation": "<how to reduce it>",
    "exit_plan": "<how to pivot if it is not working by month 3>"
  },
  "job_hunt_synergy": "<how building this business simultaneously makes them a stronger job candidate -- portfolio, skills demonstrated, network expanded, industry authority built>"
}`;
  },

  temperature: 0.7,
};

// ---------------------------------------------------------------------------
// Export: toolPrompts map
// ---------------------------------------------------------------------------

export const toolPrompts: Record<string, ToolPromptConfig> = {
  displacement,
  jd_match,
  resume,
  cover_letter,
  interview,
  linkedin,
  skills_gap,
  roadmap,
  salary,
  entrepreneurship,
};
