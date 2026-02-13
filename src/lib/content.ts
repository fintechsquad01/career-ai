/**
 * Content data for blog articles, comparison pages, and guides.
 * Static content stored as data for SSG — no CMS needed at this scale.
 */

// ─── Blog Articles ───────────────────────────────────────────────

export interface TArticle {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  category: "guides" | "research" | "tips" | "news";
  readTime: string;
  tags: string[];
  heroEmoji: string;
  /** Sections of the article — each rendered as H2 with body content */
  sections: { heading: string; body: string }[];
  /** Related tool IDs to link at bottom */
  relatedTools: string[];
  /** Key takeaway for AI extraction (first 60 words matter most) */
  tldr: string;
}

export const ARTICLES: TArticle[] = [
  {
    slug: "will-ai-replace-my-job",
    title: "Will AI Replace My Job? How to Measure Your Real Risk in 2026",
    description:
      "1 in 4 roles are exposed to generative AI. Learn how to assess your personal AI displacement risk using ILO 2025 data, and what to do about it.",
    publishedAt: "2026-02-10",
    updatedAt: "2026-02-13",
    author: "AISkillScore Research",
    category: "guides",
    readTime: "8 min read",
    tags: ["AI displacement", "career risk", "automation", "future of work"],
    heroEmoji: "🛡️",
    relatedTools: ["displacement", "skills_gap", "roadmap"],
    tldr: "1 in 4 roles are exposed to generative AI according to ILO 2025 research. Your risk depends not on your job title, but on which specific tasks you perform daily. Tasks involving routine data processing, first-draft writing, and pattern recognition are most automatable. Tasks requiring human judgment, creativity, empathy, and physical dexterity remain safe. Use AISkillScore's free AI Displacement Score to measure your personal risk.",
    sections: [
      {
        heading: "The Real Scale of AI Job Displacement",
        body: "The International Labour Organization (ILO) published landmark research in 2025 showing that 1 in 4 roles globally have significant exposure to generative AI automation. But this doesn't mean 25% of jobs will disappear — it means 25% of roles have tasks that AI can now perform. The distinction matters enormously for your career planning.\n\nMcKinsey Global Institute estimates that by 2030, up to 30% of hours currently worked could be automated by generative AI. Goldman Sachs research suggests 300 million full-time jobs worldwide could be affected. These aren't distant predictions — the displacement is happening now.",
      },
      {
        heading: "What Makes a Job Safe vs. At Risk",
        body: "AI displacement isn't about job titles — it's about task composition. A marketing manager who spends 80% of their time writing first-draft copy has different risk than one who spends 80% of their time in client strategy sessions.\n\n**High-risk tasks** (AI can do these well):\n- Routine data entry and processing\n- First-draft content writing\n- Basic code generation and debugging\n- Pattern recognition in structured data\n- Scheduling and administrative coordination\n- Translation and summarization\n\n**Lower-risk tasks** (AI struggles with these):\n- Complex negotiation and persuasion\n- Physical tasks requiring dexterity\n- Empathetic counseling and care\n- Novel creative direction\n- Cross-functional strategic decisions\n- Building and maintaining trust relationships",
      },
      {
        heading: "How to Measure Your Personal AI Displacement Risk",
        body: "Step 1: List every task you perform in a typical work week.\n\nStep 2: For each task, honestly assess — could a well-prompted AI tool (ChatGPT, Claude, Gemini) perform this task at 70%+ of your quality level?\n\nStep 3: Calculate the percentage of your role that's automatable.\n\nOr skip the manual work: AISkillScore's AI Displacement Score is a free tool that does this analysis automatically. It examines your role against ILO 2025 research data and breaks down exactly which of your tasks are at risk and which aren't. The score ranges from 0-100, with higher numbers indicating higher automation exposure.",
      },
      {
        heading: "What To Do If Your Score Is High",
        body: "A high displacement score isn't a death sentence — it's a wake-up call with a clear action plan:\n\n**1. Lean into human-only skills.** Identify the tasks in your role that AI can't replicate and become exceptional at them. Emotional intelligence, complex problem-solving, and creative leadership are premium skills.\n\n**2. Become AI-augmented, not AI-replaced.** Learn to use AI tools to make yourself 3x more productive. The people who thrive won't be those who ignore AI — they'll be those who master it.\n\n**3. Build transferable skills.** Use a Skills Gap Analysis to identify what's needed in roles with lower displacement risk. Many skills transfer across industries.\n\n**4. Start a side income stream.** Don't put all your eggs in one employer's basket. The Entrepreneurship Assessment can identify business opportunities based on skills you already have.\n\n**5. Future-proof your resume.** Highlight the human-judgment tasks in your experience. An optimized resume that emphasizes these skills performs better in both ATS systems and with human recruiters.",
      },
      {
        heading: "Industries Most Affected by AI in 2026",
        body: "**Highest displacement risk:**\n- Administrative and office support (67% of tasks automatable)\n- Financial services and accounting (54%)\n- Customer service and support (52%)\n- Marketing and content creation (48%)\n- Legal research and paralegal work (45%)\n\n**Moderate displacement risk:**\n- Software development (38% — AI assists but humans architect)\n- Education and training (32%)\n- Healthcare administration (30%)\n\n**Lowest displacement risk:**\n- Skilled trades and construction (12%)\n- Healthcare practitioners (15%)\n- Social work and counseling (18%)\n- Executive leadership (20%)\n\nSource: ILO 2025 Research, McKinsey Global Institute, World Economic Forum Future of Jobs Report 2025.",
      },
    ],
  },
  {
    slug: "resume-ats-optimization-guide",
    title: "ATS Resume Optimization: The Complete 2026 Guide That Actually Works",
    description:
      "43% of ATS rejections are formatting errors. Learn exactly how ATS systems parse resumes, why most advice is wrong, and how to pass every time.",
    publishedAt: "2026-02-11",
    updatedAt: "2026-02-13",
    author: "AISkillScore Research",
    category: "guides",
    readTime: "10 min read",
    tags: ["ATS", "resume optimization", "job applications", "applicant tracking system"],
    heroEmoji: "📄",
    relatedTools: ["resume", "jd_match", "cover_letter"],
    tldr: "43% of ATS rejections are formatting errors, not qualification gaps. Modern ATS systems like Workday, Greenhouse, and Lever use AI-powered parsing that goes beyond keyword matching. To pass ATS in 2026: use standard section headers, avoid tables and columns, match exact keywords from the job description, and quantify achievements. AISkillScore's Resume Optimizer costs 10 tokens (~$0.75) and rewrites your resume to pass ATS while keeping your authentic voice.",
    sections: [
      {
        heading: "How ATS Systems Actually Work in 2026",
        body: "Applicant Tracking Systems have evolved far beyond simple keyword scanners. Modern ATS platforms like Workday, Greenhouse, Lever, and iCIMS use multi-stage processing:\n\n**Stage 1: Parse.** The ATS extracts text from your file, identifying sections (experience, education, skills). This is where formatting errors kill applications — 43% of rejections happen here because the parser can't read the resume correctly.\n\n**Stage 2: Match.** Keywords and phrases are compared against the job description. But it's not just exact matching anymore — semantic matching understands that 'managed a team' and 'team leadership' are related.\n\n**Stage 3: Rank.** Candidates are scored and ranked. The top 20-30% get human review. The rest never reach a recruiter's screen.\n\nThe critical insight: most candidates fail at Stage 1, not Stage 2. They have the right qualifications but the wrong format.",
      },
      {
        heading: "The 7 ATS Formatting Rules That Matter",
        body: "**1. Use standard section headers.** 'Professional Experience' or 'Work Experience' — not 'Where I've Made Impact.' ATS parsers look for standard labels.\n\n**2. Avoid tables, columns, and text boxes.** Most ATS parsers read left-to-right, top-to-bottom. Multi-column layouts scramble your content.\n\n**3. Use a .docx or .pdf file.** PDF is generally safe with modern ATS, but .docx is universally parseable. Avoid images-as-text PDFs.\n\n**4. Standard fonts only.** Arial, Calibri, Times New Roman, Helvetica. Custom fonts can render as garbled characters.\n\n**5. No headers or footers.** Contact info in headers is often invisible to parsers. Put everything in the main body.\n\n**6. Simple bullet points.** Use standard bullet characters (•). Fancy symbols may not parse correctly.\n\n**7. Date format consistency.** Use 'Jan 2024 – Present' or 'January 2024 – Present' — pick one format and stick with it throughout.",
      },
      {
        heading: "Keyword Optimization Beyond Simple Matching",
        body: "The old advice of 'stuff keywords from the job description into your resume' is outdated and can actually hurt you. Modern ATS and recruiter AI look for:\n\n**Contextual keywords.** Don't just list 'Python' in a skills section. Show it in context: 'Built automated data pipeline in Python reducing report generation time by 60%.'\n\n**Exact title matches.** If the JD says 'Senior Product Manager,' your resume should include that exact phrase, not 'Sr. PM' or 'Product Lead.'\n\n**Hard skills over soft skills.** ATS weighs technical terms, certifications, and tool names more heavily. 'Certified Scrum Master' outweighs 'team player' every time.\n\n**Quantified achievements.** Numbers are high-signal for both ATS and human reviewers. '23% revenue increase' is parseable and memorable. 'Significantly improved revenue' is neither.\n\nAISkillScore's JD Match Score (2 tokens) analyzes your resume against a specific job posting and shows exactly which keywords you're missing and where to add them.",
      },
      {
        heading: "Why Most AI Resume Tools Make Things Worse",
        body: "Here's an uncomfortable truth: 25% of resumes are now flagged as AI-generated by recruiters. Tools that rewrite your entire resume using ChatGPT or similar produce detectable patterns:\n\n- Overuse of 'spearheaded,' 'leveraged,' 'synergized'\n- Generic bullet points that could apply to anyone\n- Unnaturally consistent sentence structure\n- Missing specific details and personality\n\nAISkillScore's approach is fundamentally different. Instead of rewriting your resume, we enhance it. Your stories, your achievements, your voice — just optimized for ATS parsing and keyword matching. Our #1 rule: no detectable AI cliches.\n\nThe result reads like a polished version of you, not a template that 50,000 other applicants also used.",
      },
      {
        heading: "The Complete ATS Optimization Checklist",
        body: "Before you submit your next application, verify:\n\n☑ Standard file format (.docx or clean .pdf)\n☑ No tables, columns, text boxes, or graphics\n☑ Standard section headers (Professional Experience, Education, Skills)\n☑ Contact info in main body, not headers/footers\n☑ Job title from JD appears in your resume\n☑ 5+ keyword matches from the job description\n☑ All achievements are quantified with numbers\n☑ Consistent date formatting throughout\n☑ No AI-detectable language patterns\n☑ Tailored for this specific role (not a generic resume)\n\nOr let AISkillScore handle it: the Resume Optimizer (10 tokens, ~$0.75) runs all these checks automatically and rewrites problem areas while keeping your authentic voice. Compare that to Jobscan at $49.95/month for keyword counting alone.",
      },
    ],
  },
  {
    slug: "ai-interview-prep-guide",
    title: "AI Interview Prep: How to Prepare for Follow-Up Questions in 2026",
    description:
      "90% of candidates aren't prepared for follow-up questions — the part that actually decides interviews. A complete guide to AI-powered interview preparation.",
    publishedAt: "2026-02-12",
    updatedAt: "2026-02-13",
    author: "AISkillScore Research",
    category: "guides",
    readTime: "7 min read",
    tags: ["interview prep", "behavioral questions", "follow-up questions", "AI interview"],
    heroEmoji: "💬",
    relatedTools: ["interview", "jd_match", "salary"],
    tldr: "90% of candidates aren't prepared for follow-up questions, yet follow-ups are what actually decide interviews. Interviewers use initial questions to set up deeper probes that test real understanding versus rehearsed answers. AISkillScore's Interview Prep tool (3 tokens) generates likely questions, predicted follow-ups, and coached answers based on the specific job description and your actual experience.",
    sections: [
      {
        heading: "Why Follow-Up Questions Decide Interviews",
        body: "Most interview prep focuses on rehearsing answers to common questions: 'Tell me about yourself,' 'What's your greatest weakness,' 'Why do you want this role?' But experienced interviewers use these as setups — the real evaluation happens in the follow-up.\n\nWhen you give a polished answer about leading a project, the interviewer probes: 'What was the biggest disagreement on that team, and how did you handle it?' or 'If you could redo that project, what would you change?'\n\nThese follow-ups test whether your initial answer was genuine experience or rehearsed talking points. 90% of candidates stumble here because they only prepared the surface-level answers.",
      },
      {
        heading: "The STAR-F Method: Going Beyond STAR",
        body: "The STAR method (Situation, Task, Action, Result) is standard interview advice. But in 2026, you need STAR-F — adding Follow-up readiness:\n\n**Situation:** Set the context briefly (2 sentences max)\n**Task:** What was your specific responsibility?\n**Action:** What did YOU do? (Not 'we' — interviewers want your individual contribution)\n**Result:** Quantified outcome with specific numbers\n**Follow-up readiness:** Prepare for 3 likely follow-up angles:\n- 'What would you do differently?' (Self-awareness probe)\n- 'How did others react?' (Interpersonal probe)\n- 'What did you learn from this?' (Growth probe)\n\nFor each story in your interview bank, prepare all three follow-up angles. This is what separates the top 10% of candidates.",
      },
      {
        heading: "How AI Interview Prep Tools Actually Help",
        body: "Generic interview prep ('practice common questions') wastes time because every job is different. AI-powered interview prep analyzes the specific job description to predict:\n\n**Role-specific questions:** A product manager interview looks nothing like a data engineer interview. AI maps JD requirements to likely question topics.\n\n**Company-specific angles:** If the JD emphasizes 'fast-paced environment' or 'cross-functional collaboration,' expect questions testing those exact qualities.\n\n**Follow-up predictions:** Based on common interviewer patterns and the role level (entry vs. senior vs. executive), AI predicts the most likely follow-up probes.\n\n**Coached answers:** Not scripts to memorize — frameworks that help you structure your real experiences into compelling answers.\n\nAISkillScore's Interview Prep (3 tokens, about $0.23) generates all of this from the actual job description plus your resume. Compare that to FinalRound at $149/month — and they don't even prep follow-up questions.",
      },
      {
        heading: "Technical Interview Preparation in the AI Age",
        body: "Technical interviews are evolving rapidly. With AI coding assistants ubiquitous, interviewers are shifting from 'can you write this algorithm?' to 'can you design this system and explain your trade-offs?'\n\n**What's changing:**\n- Less emphasis on memorized algorithms\n- More system design and architecture questions\n- 'Pair programming with AI' assessments\n- Focus on debugging and code review skills\n- Behavioral questions about AI tool usage\n\n**How to prepare:**\n1. Practice explaining your technical decisions out loud\n2. Prepare stories about debugging complex issues\n3. Be ready to discuss how you use AI tools responsibly\n4. Focus on system design fundamentals\n5. Have opinions about trade-offs (speed vs. quality, build vs. buy)\n\nThe Skills Gap Analysis tool can identify which technical skills to brush up on before your interview.",
      },
      {
        heading: "Salary Negotiation Starts in the Interview",
        body: "Most candidates don't realize that salary negotiation doesn't start when you get the offer — it starts during the interview. Every answer you give either increases or decreases your perceived value.\n\n**Value-increasing signals:**\n- Quantified achievements ('increased conversion by 34%')\n- Evidence of leadership and initiative\n- Market awareness and industry knowledge\n- Enthusiasm calibrated to the role level\n\n**Value-decreasing signals:**\n- Revealing desperation ('I really need this job')\n- Underselling experience ('I just helped with...')\n- Not asking thoughtful questions back\n- Accepting the first number discussed\n\nAISkillScore's Salary Negotiation tool (3 tokens) provides market data and word-for-word scripts. Used together with Interview Prep, you enter every interview knowing your worth and how to communicate it.",
      },
    ],
  },
];

// ─── Comparison Pages ────────────────────────────────────────────

export interface TComparison {
  slug: string;
  competitor: string;
  competitorUrl: string;
  competitorPrice: string;
  title: string;
  description: string;
  updatedAt: string;
  /** What the competitor offers */
  competitorFeatures: string[];
  /** What the competitor lacks */
  competitorMissing: string[];
  /** AISkillScore advantages */
  advantages: { title: string; detail: string }[];
  /** Feature comparison rows */
  features: { name: string; us: boolean | string; them: boolean | string }[];
  /** Verdict paragraph */
  verdict: string;
}

export const COMPARISONS: TComparison[] = [
  {
    slug: "aiskillscore-vs-jobscan",
    competitor: "Jobscan",
    competitorUrl: "https://www.jobscan.co",
    competitorPrice: "$49.95/month",
    title: "AISkillScore vs Jobscan: Complete Comparison (2026)",
    description:
      "Jobscan charges $49.95/month for keyword matching. AISkillScore offers 11 AI tools from free. See the full feature comparison.",
    updatedAt: "2026-02-13",
    competitorFeatures: [
      "ATS keyword matching and scoring",
      "LinkedIn optimization suggestions",
      "Resume formatting checks",
      "Job match rate percentage",
    ],
    competitorMissing: [
      "No interview preparation",
      "No cover letter generation",
      "No AI displacement analysis",
      "No salary negotiation data",
      "No career roadmap planning",
      "No entrepreneurship assessment",
      "Keyword counting only — no evidence-based analysis",
    ],
    advantages: [
      {
        title: "11 tools vs 2",
        detail: "AISkillScore provides resume optimization, cover letters, interview prep, skills gap analysis, career roadmap, salary negotiation, and more — all in one platform.",
      },
      {
        title: "Pay per use vs $49.95/month",
        detail: "Why pay $600/year when you can pay $5-15 for what you actually use? A full JD match scan costs just 2 tokens (~$0.15).",
      },
      {
        title: "Evidence-based vs keyword counting",
        detail: "Jobscan tells you which keywords are missing. AISkillScore shows evidence from your resume explaining why each change matters from a recruiter's perspective.",
      },
      {
        title: "AI voice preservation",
        detail: "Our Resume Optimizer preserves your authentic voice. No 'spearheaded' or 'leveraged' — just a polished version of you.",
      },
    ],
    features: [
      { name: "ATS Resume Optimization", us: true, them: true },
      { name: "JD Keyword Matching", us: true, them: true },
      { name: "Cover Letter Generation", us: true, them: false },
      { name: "Interview Preparation", us: true, them: false },
      { name: "LinkedIn Optimization", us: true, them: "Basic" },
      { name: "AI Displacement Score", us: "Free", them: false },
      { name: "Skills Gap Analysis", us: true, them: false },
      { name: "Career Roadmap", us: true, them: false },
      { name: "Salary Negotiation", us: true, them: false },
      { name: "Entrepreneurship Assessment", us: true, them: false },
      { name: "AI Headshots", us: true, them: false },
      { name: "Daily Free Credits", us: "2/day", them: false },
      { name: "Pay Per Use Option", us: true, them: false },
      { name: "Price", us: "From $5", them: "$49.95/mo" },
    ],
    verdict: "Jobscan is a solid ATS keyword scanner, but at $49.95/month it's expensive for a single-purpose tool. AISkillScore provides the same keyword matching plus 10 additional AI career tools, all at pay-per-use pricing. If you're actively job hunting and need more than just resume scanning — interview prep, cover letters, salary data — AISkillScore delivers significantly more value at a fraction of the cost.",
  },
  {
    slug: "aiskillscore-vs-teal",
    competitor: "Teal",
    competitorUrl: "https://www.tealhq.com",
    competitorPrice: "$29/month",
    title: "AISkillScore vs Teal: Complete Comparison (2026)",
    description:
      "Teal charges $29/month for resume building and job tracking. AISkillScore offers 11 AI tools from free with no subscription.",
    updatedAt: "2026-02-13",
    competitorFeatures: [
      "Resume builder with templates",
      "Job application tracker",
      "LinkedIn profile review",
      "Cover letter templates",
      "Chrome extension for job saving",
    ],
    competitorMissing: [
      "No interview preparation",
      "No AI displacement analysis",
      "No salary negotiation with scripts",
      "No skills gap analysis",
      "No career roadmap",
      "No entrepreneurship assessment",
      "Generic templates that destroy your authentic voice",
    ],
    advantages: [
      {
        title: "Voice preservation vs templates",
        detail: "Teal uses generic templates that make every resume sound the same. AISkillScore enhances YOUR voice — no detectable AI patterns.",
      },
      {
        title: "Pay per use vs $29/month",
        detail: "Teal's $29/month means $348/year whether you use it daily or once. AISkillScore lets you pay only for what you need.",
      },
      {
        title: "AI-powered analysis vs templates",
        detail: "Teal provides templates to fill in. AISkillScore uses Gemini 2.5 Pro to analyze your experience and generate personalized content.",
      },
      {
        title: "11 tools vs 4",
        detail: "Beyond resume and cover letter, get interview prep, salary negotiation, skills gap analysis, career roadmap, and more.",
      },
    ],
    features: [
      { name: "ATS Resume Optimization", us: true, them: true },
      { name: "Cover Letter Generation", us: "AI-personalized", them: "Templates" },
      { name: "Job Application Tracking", us: false, them: true },
      { name: "Interview Preparation", us: true, them: false },
      { name: "LinkedIn Optimization", us: "AI-powered", them: "Basic review" },
      { name: "AI Displacement Score", us: "Free", them: false },
      { name: "Skills Gap Analysis", us: true, them: false },
      { name: "Career Roadmap", us: true, them: false },
      { name: "Salary Negotiation", us: true, them: false },
      { name: "AI Headshots", us: true, them: false },
      { name: "Chrome Extension", us: false, them: true },
      { name: "Daily Free Credits", us: "2/day", them: false },
      { name: "Voice Preservation", us: true, them: false },
      { name: "Price", us: "From $5", them: "$29/mo" },
    ],
    verdict: "Teal excels at job application tracking and provides a solid resume builder with its Chrome extension. However, it relies on templates rather than AI-powered personalization, and its $29/month subscription adds up quickly. AISkillScore is the better choice if you want AI-personalized content that preserves your authentic voice, plus access to interview prep, salary negotiation, and career planning tools — all without a recurring subscription.",
  },
  {
    slug: "aiskillscore-vs-finalround",
    competitor: "FinalRound",
    competitorUrl: "https://www.finalroundai.com",
    competitorPrice: "$149/month",
    title: "AISkillScore vs FinalRound AI: Complete Comparison (2026)",
    description:
      "FinalRound AI charges $149/month for interview prep. AISkillScore provides interview prep plus 10 more tools from $0.23/use.",
    updatedAt: "2026-02-13",
    competitorFeatures: [
      "AI mock interview practice",
      "Real-time interview assistance",
      "Answer suggestions during live interviews",
      "Interview question database",
    ],
    competitorMissing: [
      "No resume optimization",
      "No cover letter generation",
      "No JD matching",
      "No salary negotiation data",
      "No follow-up question preparation",
      "No career planning tools",
      "Ethically questionable real-time assistance during live interviews",
    ],
    advantages: [
      {
        title: "Follow-up prep vs first answers only",
        detail: "FinalRound preps initial answers. AISkillScore preps the follow-up questions too — the part that actually decides interviews. 90% of candidates fail follow-ups.",
      },
      {
        title: "3 tokens vs $149/month",
        detail: "AISkillScore's Interview Prep costs 3 tokens (~$0.23). FinalRound costs $149/month ($1,788/year). That's 7,700x more expensive per interview prep session.",
      },
      {
        title: "Full career toolkit",
        detail: "Interview prep is one step in the process. AISkillScore also optimizes your resume, writes cover letters, analyzes salary data, and plans your career — all in one platform.",
      },
      {
        title: "Ethical approach",
        detail: "We prep you before the interview, not during it. Real-time AI assistance during live interviews is increasingly detected and penalized by employers.",
      },
    ],
    features: [
      { name: "Interview Question Prep", us: true, them: true },
      { name: "Follow-Up Question Prep", us: true, them: false },
      { name: "Real-Time Interview Assist", us: false, them: true },
      { name: "Resume Optimization", us: true, them: false },
      { name: "Cover Letter Generation", us: true, them: false },
      { name: "JD Match Analysis", us: true, them: false },
      { name: "Salary Negotiation Scripts", us: true, them: false },
      { name: "Skills Gap Analysis", us: true, them: false },
      { name: "Career Roadmap", us: true, them: false },
      { name: "AI Displacement Score", us: "Free", them: false },
      { name: "Daily Free Credits", us: "2/day", them: false },
      { name: "Price per interview prep", us: "~$0.23", them: "$149/mo" },
    ],
    verdict: "FinalRound AI is specialized in real-time interview assistance — a niche use case that raises ethical concerns with many employers. At $149/month, it's the most expensive option in the career tools space. AISkillScore provides comprehensive interview preparation including follow-up questions (which FinalRound doesn't cover), plus 10 additional career tools, all at pay-per-use pricing. For genuine interview preparation that makes you a better candidate rather than giving you a hidden earpiece, AISkillScore is the clear choice.",
  },
];

/** Get article by slug */
export function getArticle(slug: string): TArticle | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** Get comparison by slug */
export function getComparison(slug: string): TComparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}
