# Growth Prompt Library

Version: 1.0  
Owner: Growth + Product + Content  
Last updated: 2026-02-20  
Review cadence: Monthly

Purpose: Reusable prompt templates for content, conversion, and monetization copy production.

## 1) Global Prompt Rules

All prompts must enforce:

- AISkillScore brand and lexical compliance
- Claim -> Mechanism -> Evidence for persuasive statements
- No guaranteed outcomes
- Persona-specific pain and objection handling
- AI-search-friendly structure (answer-first + query headers)

## 2) Prompt Template: Landing Hero Copy

### Input

- primary persona
- top pain
- desired action
- trust proof available

### Prompt

"Write homepage hero copy for AISkillScore.
Constraints:
- Category: AI-powered career intelligence platform
- Keep headline <= 10 words
- Keep subhead <= 28 words
- Use 'tokens' language only
- Include one trust line and one low-friction CTA
- Tone: clear, grounded, non-hype
- Return: headline, subhead, trustline, primary_cta, secondary_cta."

## 3) Prompt Template: Comparison Page

### Input

- competitor name
- competitor known strength
- competitor gap
- AISkillScore mechanism advantage
- target persona

### Prompt

"Create comparison page copy for AISkillScore vs {competitor}.
Use this structure:
1) Direct answer summary
2) Where {competitor} is strong
3) Where it breaks for {persona}
4) AISkillScore mechanism + evidence
5) Fair-value pricing close (no cheap language)
6) CTA
Use claim-mechanism-evidence.
No unsupported superlatives."

## 4) Prompt Template: FAQ Block

### Input

- 8-12 user questions
- target funnel stage

### Prompt

"Answer each question in 2-4 sentences.
First sentence must directly answer the question.
Include practical next step in final sentence.
Avoid hype and guarantees.
Keep terms canonical: AISkillScore, tokens, Job Mission Control."

## 5) Prompt Template: Pricing Section Copy

### Input

- pack names
- pack token sizes
- shortfall scenarios
- top-up policy

### Prompt

"Write pricing copy for a pay-per-use token model.
Goals:
- reduce subscription fatigue
- explain top-up and larger-pack choices
- preserve trust and transparency
Output:
- section headline
- three pack card descriptions
- shortfall paywall copy
- reassurance copy
- CTA labels."

## 6) Prompt Template: Paywall Variants

### Input

- tool name
- required tokens
- user balance
- shortfall
- user segment

### Prompt

"Generate 3 paywall variants:
1) mission continuity variant
2) transactional clear variant
3) value-anchored variant
Constraints:
- include exact shortfall math
- include top-up and larger-pack option language
- include trust line about token safety
- no coercive urgency."

## 7) Prompt Template: Lifecycle Email

### Input

- lifecycle stage (new, active, reactivated, power)
- recent user action
- next best action

### Prompt

"Write a lifecycle email with:
- subject line
- preheader
- body copy under 130 words
- one clear CTA
Tone: practical, motivating, not pushy.
Reference mission continuity and concrete next step."

## 8) Prompt Template: Social Snippet

### Input

- content asset
- target channel
- persona

### Prompt

"Create 3 social posts from this asset.
Each must include:
- one pain signal
- one evidence-backed takeaway
- one CTA
Avoid vague inspiration language."

## 9) Output QA Prompt (Self-Audit)

Use after generation:

"Audit the draft for:
1) brand lexical compliance
2) claim-mechanism-evidence integrity
3) persona pain alignment
4) AI-search structure (answer-first, scannable headers)
5) monetization fairness language
Return pass/fail and required revisions."

## 10) Fact Integrity QA Prompt

"Check every explicit factual claim in this copy.
For each claim, return:
- claim text
- evidence/source status (present/missing)
- confidence level
- rewrite if unsupported."
