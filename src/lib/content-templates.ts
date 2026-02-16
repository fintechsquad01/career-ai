/**
 * Content templates for organic growth on Reddit and LinkedIn.
 * These are NOT automated — they're copy-paste templates for manual posting.
 * 
 * Usage: Import and render in an admin page, or export as JSON for the marketing team.
 */

export const REDDIT_POST_TEMPLATES = [
  {
    subreddit: "r/careerguidance",
    title: "I analyzed 500+ roles for AI displacement risk — here's what I found",
    body: `I've been building an AI career analysis tool and wanted to share some interesting patterns from our data.

**Key findings:**

1. **Data entry & transcription roles** have the highest displacement risk (80+/100)
2. **Management roles** are surprisingly safe (30-40/100) — AI augments but doesn't replace leadership
3. **Healthcare practitioners** (nurses, therapists) are among the safest (20-30/100)
4. The biggest surprise: **copywriters** score higher risk (70+) than most expect, while **sales engineers** score very low

**The nuance people miss:** It's not about entire jobs being replaced. It's about specific *tasks within roles* being automated. A marketing manager might have 60% safe tasks and 40% at-risk tasks.

The tool is free to try if anyone's curious about their own role: [link]

Happy to answer questions about any specific role or industry.`,
    bestTimeToPost: "Tuesday or Wednesday, 10-11 AM EST",
    engagementTip: "Reply to every comment within the first 2 hours",
  },
  {
    subreddit: "r/cscareerquestions",
    title: "Built a free tool to check if AI is coming for your developer job — data from ILO 2025",
    body: `Fellow developers — I built an AI displacement risk analyzer based on ILO 2025 research data. It breaks down which of your daily tasks AI can handle and which require human judgment.

Some things I learned building it:

- Frontend devs score lower risk than backend devs (UI/UX intuition is harder to automate)
- DevOps/SRE roles score surprisingly high due to infrastructure-as-code trends
- Senior+ engineers are significantly safer than juniors — the "why" behind decisions matters more than the code itself

It's completely free, takes 30 seconds. No signup needed for the displacement score.

[link]

Would love feedback from this community — especially if your score surprises you.`,
    bestTimeToPost: "Monday or Thursday, 9-10 AM EST",
    engagementTip: "Lead with data, not marketing. Respond technically to questions.",
  },
  {
    subreddit: "r/jobs",
    title: "Applying to 50+ jobs with no callbacks? The problem might be ATS formatting, not your qualifications",
    body: `Quick data point that changed how I think about job applications:

**43% of ATS rejections are formatting errors, not qualification gaps.**

That means nearly half the time you're getting rejected, it's not because you're not qualified — it's because the robot reading your resume can't parse it properly.

Common ATS killers:
- Tables and columns (most ATS break these)
- Headers/footers with contact info (often stripped)
- Graphics, icons, or fancy formatting
- Non-standard section headers

I built a tool that scores your resume against ATS requirements and shows exactly what's wrong. The JD Match feature is 5 tokens (~$0.98) and the full Resume Optimizer is 15 tokens (~$2.93). 

You get 15 free tokens on signup, which covers a full resume optimization + several JD matches.

[link]

Not trying to spam — genuinely think this data point alone (check your formatting!) could help people who are frustrated with the application black hole.`,
    bestTimeToPost: "Any weekday, 11 AM - 1 PM EST",
    engagementTip: "Lead with the free value (43% stat), link is secondary",
  },
];

export const LINKEDIN_CONTENT_TEMPLATES = [
  {
    type: "infographic_post" as const,
    title: "2026 AI Displacement Index by Role",
    hook: "Which jobs are most at risk from AI? I analyzed the data.\n\n",
    body: `Here's the AI Displacement Risk Index for 2026, based on ILO research data:\n\n🔴 HIGH RISK (60-85/100):\n• Data Entry Specialists\n• Basic Copywriters\n• Bookkeepers\n• Customer Service Reps\n\n🟡 MODERATE (40-59/100):\n• Financial Analysts\n• Software Developers (junior)\n• Paralegals\n• Marketing Coordinators\n\n🟢 LOW RISK (15-39/100):\n• Engineering Managers\n• Nurses & Therapists\n• Sales Engineers\n• Teachers\n\nThe key insight: It's not about entire jobs being eliminated. It's about specific TASKS within roles being automated.\n\nThe professionals who thrive will be those who lean into the tasks AI can't do — leadership, creativity, empathy, complex problem-solving.\n\nWant to check your own score? Link in comments (free, 30 seconds).\n\n#AI #CareerDevelopment #FutureOfWork #AISkillScore`,
    engagementTip: "Pin a comment with the tool link. Engage with every comment.",
  },
  {
    type: "personal_story" as const,
    title: "Career Change Data Story",
    hook: "53% of professionals plan to switch careers by end of 2026.\n\nBut most don't have a plan. Here's what the data says about those who succeed:\n\n",
    body: `The ones who successfully pivot have 3 things in common:\n\n1. They QUANTIFY their transferable skills (not just list them)\n2. They address skill gaps BEFORE applying (not during interviews)\n3. They negotiate salary based on DATA, not hope\n\nI built a tool that does all three. It maps your current skills to target roles, identifies specific gaps, and provides market salary data.\n\nThe AI Displacement Score is free — it shows which of your skills are future-proof and which need upgrading.\n\n#CareerChange #JobSearch #AI`,
    engagementTip: "Share a specific number or data point in the first line to stop scrollers",
  },
];
