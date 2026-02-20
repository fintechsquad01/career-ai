export interface TIndustry {
  slug: string;
  name: string;
  description: string;
  displacementContext: string;
  topRoles: string[];
  toolSequence: string[];
  faq: { q: string; a: string }[];
  keywords: string[];
}

export const INDUSTRY_PAGES: TIndustry[] = [
  {
    slug: "technology",
    name: "Technology",
    description: "The technology sector faces the highest AI displacement pressure but also the most opportunity for skill-based differentiation. Engineers, PMs, and designers who demonstrate system-level thinking and cross-functional impact will thrive.",
    displacementContext: "ILO 2025 data shows technology roles have the highest task-level AI exposure, but also the highest adaptation potential. The gap between displaced and adapted professionals is widening fast.",
    topRoles: ["Software Engineer", "Product Manager", "UX Designer", "Data Analyst", "DevOps Engineer"],
    toolSequence: ["displacement", "jd_match", "resume", "interview"],
    faq: [
      { q: "Which tech jobs are most at risk from AI?", a: "Routine coding, basic QA testing, and template-based design tasks face highest displacement. System architecture, complex debugging, and strategic product decisions remain human-essential. Run the free AI Displacement Score to see your specific role breakdown." },
      { q: "How should tech professionals prepare their resumes in 2026?", a: "Lead with system-level impact, not task completion. Quantify business outcomes from technical decisions. AISkillScore's Resume Optimizer restructures tech resumes for both ATS parsing and hiring manager readability." },
    ],
    keywords: ["tech resume optimization 2026", "ai displacement technology jobs", "software engineer career guide", "tech interview prep ai"],
  },
  {
    slug: "finance-banking",
    name: "Finance & Banking",
    description: "Finance professionals transitioning to fintech or modern financial services need to reframe regulatory knowledge and analytical rigor as product and strategy assets. The sector values quantified risk management and compliance expertise.",
    displacementContext: "Financial analysis, compliance reporting, and routine transaction processing face significant AI automation. Strategic advisory, relationship management, and regulatory interpretation remain high-value human skills.",
    topRoles: ["Financial Analyst", "Compliance Officer", "Investment Banker", "Fintech PM", "Risk Manager"],
    toolSequence: ["displacement", "jd_match", "resume", "salary"],
    faq: [
      { q: "How is AI affecting finance careers?", a: "AI is automating routine analysis and reporting but increasing demand for strategic advisory and complex compliance interpretation. The free AI Displacement Score shows which of your specific finance tasks are at risk." },
      { q: "How do I transition from banking to fintech?", a: "Reframe your regulatory and analytical experience as domain expertise for product roles. Job Match Score against fintech postings reveals exactly which skills translate and where to close gaps." },
    ],
    keywords: ["finance resume optimization", "banking career transition 2026", "fintech career guide", "ai in finance jobs"],
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    description: "Healthcare professionals seeking remote or digital health roles must translate clinical and operational experience into tech-company language. The sector is rapidly expanding into telehealth, health tech, and AI-assisted diagnostics.",
    displacementContext: "Administrative healthcare tasks face high AI automation potential. Patient-facing care, clinical judgment, and empathy-driven roles remain strongly human. Digital health operations roles are growing rapidly.",
    topRoles: ["Healthcare Administrator", "Clinical Operations Manager", "Health IT Specialist", "Telehealth Coordinator", "Medical Science Liaison"],
    toolSequence: ["displacement", "jd_match", "resume", "linkedin"],
    faq: [
      { q: "Are healthcare jobs safe from AI?", a: "Patient-facing care roles are among the safest from AI displacement. Administrative and operational roles face more pressure. Run the free AI Displacement Score for your specific healthcare role." },
      { q: "How do I find remote healthcare jobs?", a: "Focus on digital health companies, telehealth platforms, and health tech startups. Use Job Match Score to check your fit against specific remote postings and identify which clinical skills to reframe." },
    ],
    keywords: ["healthcare resume optimization", "remote healthcare jobs 2026", "digital health career", "healthcare ai displacement"],
  },
  {
    slug: "marketing-advertising",
    name: "Marketing & Advertising",
    description: "Marketing professionals face rapid AI tool adoption that changes execution but amplifies strategic value. Data-driven campaign management, brand strategy, and customer insight skills are becoming more valuable, not less.",
    displacementContext: "Content production, basic ad management, and routine analytics face AI automation. Strategic positioning, brand narrative, and customer insight synthesis remain high-value human skills.",
    topRoles: ["Marketing Manager", "Content Strategist", "Growth Marketing Lead", "Brand Manager", "Performance Marketing Analyst"],
    toolSequence: ["displacement", "jd_match", "resume", "interview", "salary"],
    faq: [
      { q: "Will AI replace marketing jobs?", a: "AI will replace marketing execution tasks but increase demand for marketing strategy and insight roles. The professionals who combine strategic thinking with AI tool fluency will be most valuable." },
      { q: "How should marketers optimize their resumes?", a: "Lead every bullet with a quantified business outcome. Use Job Match Score to identify which marketing competencies your target role prioritizes, then Resume Optimizer to restructure accordingly." },
    ],
    keywords: ["marketing resume 2026", "ai in marketing careers", "marketing interview prep", "digital marketing career guide"],
  },
  {
    slug: "education",
    name: "Education",
    description: "Educators transitioning to EdTech, corporate training, or instructional design roles need to translate teaching experience into outcome-based corporate language. The sector values curriculum design, learner analytics, and technology integration.",
    displacementContext: "Routine grading, basic content delivery, and administrative scheduling face AI pressure. Curriculum design, mentorship, and adaptive learning strategy remain human-essential.",
    topRoles: ["Instructional Designer", "EdTech Product Manager", "Corporate Trainer", "Curriculum Developer", "Learning Experience Designer"],
    toolSequence: ["jd_match", "resume", "cover_letter", "interview"],
    faq: [
      { q: "How do I transition from teaching to corporate roles?", a: "Reframe lesson planning as curriculum design, classroom management as stakeholder facilitation, and student outcomes as measurable learning metrics. Job Match Score shows exactly which education skills transfer to your target role." },
    ],
    keywords: ["teacher resume for corporate jobs", "education to edtech transition", "instructional designer resume", "education career change 2026"],
  },
  {
    slug: "consulting",
    name: "Consulting",
    description: "Consultants have highly transferable skills but often struggle with resume formatting that assumes a single employer. The key is demonstrating client impact, methodology expertise, and quantified business outcomes across engagements.",
    displacementContext: "Basic research, slide production, and data gathering face AI automation. Strategic framing, client relationship management, and complex problem structuring remain high-value.",
    topRoles: ["Management Consultant", "Strategy Analyst", "Operations Consultant", "Digital Transformation Lead", "Data Strategy Consultant"],
    toolSequence: ["jd_match", "resume", "interview", "salary"],
    faq: [
      { q: "How do consultants write effective resumes?", a: "Structure each engagement as: client context, your role, methodology applied, and quantified business outcome. Resume Optimizer formats consulting experience for both ATS compatibility and executive readability." },
    ],
    keywords: ["consulting resume optimization", "management consultant interview prep", "consulting career guide", "consultant to industry transition"],
  },
  {
    slug: "media-entertainment",
    name: "Media & Entertainment",
    description: "Creative professionals in media face AI disruption in production workflows but growing demand for creative direction, narrative strategy, and audience insight. Portfolio-driven hiring makes ATS optimization uniquely challenging.",
    displacementContext: "Content production, basic editing, and template-based design face high AI automation. Creative strategy, narrative development, and audience connection remain strongly human.",
    topRoles: ["Creative Director", "Content Producer", "Video Editor", "Social Media Strategist", "UX Writer"],
    toolSequence: ["displacement", "jd_match", "resume", "linkedin"],
    faq: [
      { q: "How do creative professionals optimize resumes for ATS?", a: "Include a structured resume alongside your portfolio link. Lead with business outcomes from creative work. Resume Optimizer preserves your creative voice while adding the structured impact language hiring systems need." },
    ],
    keywords: ["creative resume ats optimization", "media career guide 2026", "entertainment industry ai", "creative director interview prep"],
  },
  {
    slug: "legal",
    name: "Legal",
    description: "Legal professionals are experiencing rapid AI adoption in document review, contract analysis, and legal research. The highest-value differentiation comes from strategic counsel, complex negotiation, and regulatory interpretation.",
    displacementContext: "Document review, basic legal research, and contract clause matching face significant AI automation. Strategic litigation, complex negotiation, and regulatory interpretation remain human-essential.",
    topRoles: ["Corporate Counsel", "Compliance Attorney", "Legal Operations Manager", "Contract Manager", "Regulatory Affairs Specialist"],
    toolSequence: ["displacement", "jd_match", "resume", "interview"],
    faq: [
      { q: "Is AI replacing lawyers?", a: "AI is automating legal research and document review but increasing demand for strategic counsel and complex interpretation. Run the free AI Displacement Score to see which of your legal tasks are at risk." },
    ],
    keywords: ["legal resume optimization", "ai replacing lawyers 2026", "legal career guide", "legal tech career transition"],
  },
];

export function getIndustry(slug: string): TIndustry | undefined {
  return INDUSTRY_PAGES.find((i) => i.slug === slug);
}
