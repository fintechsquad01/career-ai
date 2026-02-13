# AISkillScore — SEO & AI Search Optimization Strategy

> Living document. Last updated: Feb 2026. Reference this for all SEO, GEO, and content decisions.

---

## 1. Core Metrics & Goals

| Metric | Tool | Current | Target (3mo) | Target (6mo) |
|---|---|---|---|---|
| AI Citation Rate | Manual + Otterly.ai | 0 | Top-5 for 3+ queries | Top-3 for 10+ queries |
| Google AI Overview Citations | Search Console | 0 | Appear for 5 queries | Appear for 20+ queries |
| Organic Traffic | GA4 | ~0 | 5K/mo | 25K/mo |
| Core Web Vitals | Lighthouse | TBD | >90 all | >95 all |
| Referring Domains | Ahrefs/Moz | ~0 | 50 | 200 |
| Structured Data Errors | Search Console | TBD | 0 | 0 |

---

## 2. Technical SEO (Implemented)

### 2.1 llms.txt
- File: `/public/llms.txt`
- Purpose: AI crawler discoverability — "robots.txt for LLMs"
- Content: Site overview, all 11 tools with descriptions and links, pricing, how-it-works
- Standard: https://llmstxt.org/

### 2.2 robots.txt AI Crawler Rules
- File: `src/app/robots.ts`
- Explicitly ALLOWS: GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended
- Explicitly BLOCKS: CCBot, Bytespider (training-only, no search traffic)
- Protected paths: /api/, /auth/callback, /dashboard, /settings, /history, /referral, /mission

### 2.3 JSON-LD Structured Data
Root layout (`src/app/layout.tsx`) contains:
- **Organization** — company entity, logo, social profiles, contact
- **WebSite** — site search action, publisher reference
- **SoftwareApplication** — product listing with AggregateOffer (4 pricing tiers)

Page-specific schemas:
- **FAQPage** — Landing page (11 FAQ items), Pricing page
- **HowTo** — Landing page (3-step process)
- **Service** — Each tool page (11 tools)
- **Microdata FAQPage** — FAQ component (itemScope/itemProp attributes)

### 2.4 Metadata Coverage
Every public page has:
- Title (unique, keyword-rich)
- Description (unique, CTA-oriented)
- Canonical URL
- Open Graph (title, description, image, url)
- Twitter Card (summary_large_image)
- Robots directive (index/noindex appropriate)

Auth-required pages set `robots: { index: false, follow: false }`.

### 2.5 Sitemap
- File: `src/app/sitemap.ts`
- Includes: homepage, pricing, lifetime, auth, all 11 tool pages, privacy, terms
- Change frequencies set per page type
- Priority: homepage=1.0, pricing=0.9, lifetime=0.8, tools=0.8

---

## 3. Generative Engine Optimization (GEO)

### Key AI Citation Factors
1. **Semantic clarity** — Clear, unambiguous language; consistent terminology
2. **Structured formatting** — H2/H3 headers, numbered lists, definitions
3. **Answer-first content** — Direct answer in first 1-3 sentences (40-60 words)
4. **Citation density** — Reference authoritative sources (BLS, McKinsey, ILO)
5. **Multi-source verification** — AI requires 2-4 independent domains to verify claims
6. **Freshness** — Pages not updated quarterly lose 3x more AI citations
7. **Entity consistency** — Same name/description everywhere

### Platform-Specific Strategies

**ChatGPT** (47.9% citations from Wikipedia)
- Build toward Wikipedia notability via earned media
- Get brand mentioned in relevant Wikipedia articles
- Structured data helps ChatGPT understand entities

**Perplexity** (46.7% citations from Reddit)
- Active Reddit presence in r/resumes, r/jobs, r/careeradvice
- Bing indexing matters (uses Bing API) — implement IndexNow
- Question-based headers appear in 60% of top results

**Google AI Overviews** (47%+ of US searches)
- FAQ schema pages are 60% more likely to be featured
- 86% of citations from pages ranking in top 100
- Content clusters boost citation probability

**Claude** (conservative citation habits)
- Technical precision, consistent authorship
- Traceable organization, strong factual structure

---

## 4. Content Strategy (To Implement)

### 4.1 Topical Authority Clusters

**Pillar 1: AI Job Displacement**
- Pillar: `/guides/ai-job-displacement`
- Clusters: by industry, by role, by region, coping strategies, reskilling paths

**Pillar 2: Resume Optimization**
- Pillar: `/guides/resume-optimization`
- Clusters: ATS best practices, keyword strategy, formatting, AI detection

**Pillar 3: Interview Preparation**
- Pillar: `/guides/interview-preparation`
- Clusters: behavioral questions, technical interviews, follow-up strategy

**Pillar 4: Skills Gap & Career Development**
- Pillar: `/guides/skills-gap-analysis`
- Clusters: upskilling paths, certifications, transferable skills

**Pillar 5: Salary Negotiation**
- Pillar: `/guides/salary-negotiation`
- Clusters: counter-offer scripts, equity negotiation, remote pay

**Pillar 6: AI Career Tools Comparison**
- Pillar: `/guides/ai-career-tools`
- Clusters: individual comparison pages (vs Jobscan, vs Teal, etc.)

### 4.2 Programmatic SEO Pages
- Comparison: "AISkillScore vs [Competitor]" (Jobscan, Teal, Careerflow, etc.)
- Alternatives: "[Competitor] alternatives 2026"
- Industry: "AI displacement score for [industry]"
- Role: "Resume optimization for [role]"

### 4.3 Original Research (Competitive Moat)
Aggregated, anonymized data from tool results:
- "Average AI Displacement Score by Industry"
- "Top 10 Most-Missed Resume Keywords by Job Category"
- "ATS Pass Rates: Before vs After AI Optimization"
- "Skills Gap Trends: Most In-Demand Skills by Quarter"

---

## 5. Off-Site Authority Building

### Priority Channels
1. **Reddit** — r/resumes, r/jobs, r/careeradvice, r/recruitinghell (3-5 interactions/week)
2. **Product Hunt** — Launch target: Top 5 (200-350 upvotes)
3. **AI Tool Directories** — There's an AI For That, Futurepedia, G2, Capterra, AlternativeTo
4. **Digital PR** — Original research to TechCrunch, Forbes, The Muse
5. **Guest Posts** — Career sites: The Muse, Career Contessa, Work It Daily
6. **Wikipedia** — Long-term: build notability through independent media coverage

### Brand Entity Consistency
- Name: "AISkillScore" (not "AI Skill Score" or "AiSkillScore")
- Category: "AI-powered career intelligence platform"
- Tagline: "Stop guessing. Know exactly where you stand."
- Token language: Always "tokens", never "credits" or "points"

---

## 6. Technical TODO (Remaining)

### Wave 2 ✅ COMPLETED
- [x] Service schema on each tool page
- [x] Expand FAQ content with natural-language AI queries (16 items)
- [x] HowTo schema on landing page
- [x] Product/Offer schema on pricing page (ItemList + Product JSON-LD)
- [x] IndexNow protocol implementation (API route + key file)
- [x] Default OG image generation for non-tool pages (brand, pricing, lifetime, tools)
- [x] Lighthouse optimization pass (font swap, preload, dns-prefetch)
- [x] loading.tsx skeletons for routes (/auth, /referral, /tools, /share/[hash])
- [x] ai.txt file for AI training transparency

### Wave 3 ✅ COMPLETED
- [x] Blog infrastructure (`/blog` route, index page, article template)
- [x] 3 pillar articles: AI Displacement, ATS Resume Optimization, AI Interview Prep
- [x] 3 comparison pages: vs Jobscan, vs Teal, vs FinalRound
- [x] Comparison hub page (`/compare`)
- [x] Article JSON-LD + BreadcrumbList on all content pages
- [x] Internal links from landing page (blog section, footer links)
- [x] Sitemap updated with all blog + comparison URLs
- [x] llms.txt updated with blog + comparison content
- [x] IndexNow utility updated with all new page URLs

### Wave 4 (Ongoing)
- [ ] Reddit community engagement program
- [ ] Directory submissions (10+ sites)
- [ ] Product Hunt launch
- [ ] Digital PR outreach
- [ ] Guest posting program
- [ ] Quarterly content refresh

---

## 7. Key Research References

- Princeton/Georgia Tech: GEO strategies boost AI visibility by 40%
- AI-referred sessions jumped 527% in 5 months (2025)
- Only 12% of AI citations overlap with Google's top 10 results
- FAQ schema: 60% more likely to appear in AI Overviews
- Reddit: 46.7% of Perplexity citations; Wikipedia: 47.9% of ChatGPT citations
- Pages not updated quarterly: 3x more likely to lose AI citations
- Structured data: 2.8x higher citation rates
- 85% of brand mentions originate from third-party pages
