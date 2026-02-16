# AISkillScore -- Persona Test Scenarios

## Overview

12 test flows (2 per persona): Test A = New User Registration, Test B = Returning User Sign-In. Each test documents exact steps, input data, expected behaviors, and what to record.

**Test Environment:** `http://localhost:3000`
**Date:** February 14, 2026

---

## Persona 1: Sarah Chen -- Career Pivoter

### Test 1A: Sarah -- New User Registration

**Entry point:** Landing page with resume paste

| Step | Action | Input/Data | Expected Behavior | Record |
|------|--------|-----------|-------------------|--------|
| 1 | Navigate to homepage | `http://localhost:3000` | Landing page loads with Smart Input | Page load time, UI state |
| 2 | Paste resume into Smart Input | Sarah's full resume text from PERSONAS.md | Detection badge shows "Resume Detected" | Detection type, speed |
| 3 | Click CTA button | -- | Loading animation, then free analysis results | Analysis results, latency |
| 4 | Review free analysis | -- | Resume X-Ray: ATS score ring, skills, salary benchmark | ATS score, displacement score |
| 5 | Click "Create Account" CTA | -- | Redirect to auth page | Auth page loads |
| 6 | Register with email/password | `sarah.chen.test@gmail.com` / `TestPass123!` | Account created, redirect to dashboard | Token balance (should be 5) |
| 7 | Check Dashboard | -- | Profile card, token balance = 5, tools grid | Dashboard state, token count |
| 8 | Navigate to AI Displacement tool | Click from tools grid or sidebar | Tool page loads with career profile pre-filled | Pre-fill accuracy |
| 9 | Run AI Displacement Score | No additional input needed (uses profile) | Loading state, then results | Full JSON output, latency, score |
| 10 | Navigate to JD Match tool | Click from sidebar or "next tool" suggestion | Tool input page loads | UI state |
| 11 | Paste target JD | Sarah's Nexus AI JD from PERSONAS.md | JD detected, analyze button enabled | Detection |
| 12 | Run JD Match Score (2 tokens) | -- | Token deduction, loading, results | Fit score, gaps, token balance (should be 3) |

### Test 1B: Sarah -- Returning User (Mission Tools)

**Entry point:** Sign in, run remaining tools

| Step | Action | Input/Data | Expected Behavior | Record |
|------|--------|-----------|-------------------|--------|
| 1 | Navigate to auth page | `http://localhost:3000/auth` | Sign-in form loads | Page state |
| 2 | Sign in | `sarah.chen.test@gmail.com` / `TestPass123!` | Redirect to dashboard | Token balance from Test 1A |
| 3 | Check Dashboard | -- | Shows prior displacement + JD match results | History accuracy |
| 4 | Navigate to Resume Optimizer | Via tools grid or sidebar | Input page with resume pre-filled | Pre-fill state |
| 5 | Run Resume Optimizer (10 tokens) | Target JD = Sarah's Nexus AI JD | Token check -- PAYWALL expected (only 3 tokens) | Paywall UI, messaging |
| 6 | Purchase token pack | Select Starter or Pro pack | Stripe checkout (or skip if test mode) | Purchase flow |
| 7 | Run Resume Optimizer (10 tokens) | Target JD = Sarah's Nexus AI JD | Loading, then before/after results | Score before/after, keywords added, full output |
| 8 | Run Cover Letter (3 tokens) | tone="professional", length="standard" | Loading, then letter text | Full letter, word count, JD keyword usage |
| 9 | Run LinkedIn Optimizer (10 tokens) | target_role="AI Product Marketing Manager" | Loading, then headlines + about section | 3 headlines, about section, keywords |
| 10 | Run Skills Gap Analysis (5 tokens) | target_role="AI Product Marketing Manager" | Loading, then gap analysis | Gaps list, learning path, course recommendations |
| 11 | Navigate to History | Via sidebar | All 6 tool results listed | History completeness |
| 12 | Test Share feature | Click share on best result | Share link generated | Share URL, OG preview |

---

## Persona 2: Marcus Johnson -- AI-Anxious Engineer

### Test 2A: Marcus -- New User Registration

**Entry point:** Landing page with resume paste (anxiety-driven visit)

| Step | Action | Input/Data | Expected Behavior | Record |
|------|--------|-----------|-------------------|--------|
| 1 | Navigate to homepage | `http://localhost:3000` | Landing page loads | UI state |
| 2 | Paste resume into Smart Input | Marcus's full resume text | Detection badge shows "Resume Detected" | Detection type |
| 3 | Click CTA button | -- | Loading, then free analysis | Results, latency |
| 4 | Review free analysis | -- | ATS score, displacement preview, skills | Scores |
| 5 | Click "Create Account" | -- | Auth page | -- |
| 6 | Register | `marcus.johnson.test@gmail.com` / `TestPass123!` | Account created, 5 tokens | Token balance |
| 7 | Navigate to AI Displacement Score | Primary tool for this persona | Tool loads with profile | Pre-fill |
| 8 | Run AI Displacement Score | No input needed | Results: SWE displacement analysis | Full output, score, tasks at risk, safe tasks, recommendations |
| 9 | Navigate to JD Match | -- | Tool loads | -- |
| 10 | Paste Stripe JD | Marcus's target JD | JD detected | Detection |
| 11 | Run JD Match (2 tokens) | -- | Results: fit analysis for Stripe | Fit score, requirements match, gaps, token balance (should be 3) |

### Test 2B: Marcus -- Returning User (Interview + Salary)

| Step | Action | Input/Data | Expected Behavior | Record |
|------|--------|-----------|-------------------|--------|
| 1 | Sign in | `marcus.johnson.test@gmail.com` / `TestPass123!` | Dashboard loads | Token balance |
| 2 | Check prior results | -- | Displacement + JD Match visible | History |
| 3 | Navigate to Interview Prep | -- | Tool input page | -- |
| 4 | Run Interview Prep (3 tokens) | interview_type="technical", target JD = Stripe | Token deduction, results | Questions, STAR answers, coaching tips, token balance (should be 0) |
| 5 | Navigate to Salary Negotiation | -- | Tool loads | -- |
| 6 | Run Salary Negotiation (3 tokens) | -- | PAYWALL: 0 tokens remaining | Paywall UI |
| 7 | Purchase Starter pack ($5) | -- | 50 tokens added | New balance |
| 8 | Run Salary Negotiation (3 tokens) | target = Senior SWE at Stripe, Austin | Results: salary data, scripts | Market range, negotiation scripts, counter-offer templates |
| 9 | Navigate to History | -- | All 4 results listed | History completeness |

---

## Persona 3: Priya Patel -- Recent Graduate

### Test 3A: Priya -- New User Registration

**Entry point:** Landing page with JD paste (applying to specific job)

| Step | Action | Input/Data | Expected Behavior | Record |
|------|--------|-----------|-------------------|--------|
| 1 | Navigate to homepage | `http://localhost:3000` | Landing page | -- |
| 2 | Paste target JD into Smart Input | Priya's Datadog JD | Detection: "Job Description Detected" | Detection type |
| 3 | Click CTA button | -- | Loading, then job analysis | Company card, fit indicators |
| 4 | Review free analysis | -- | Job match preview, requirements | Results |
| 5 | Register | `priya.patel.test@gmail.com` / `TestPass123!` | Account created, 5 tokens | Token balance |
| 6 | Navigate to JD Match | -- | Tool loads, JD may be pre-populated | Pre-fill |
| 7 | Paste resume + JD (if not pre-filled) | Priya's resume + Datadog JD | Both detected | -- |
| 8 | Run JD Match (2 tokens) | -- | Results: fit analysis | Fit score, requirements matrix, gaps, token balance (3) |
| 9 | Navigate to Resume Optimizer | -- | Tool loads | -- |
| 10 | Run Resume Optimizer (10 tokens) | Target JD = Datadog | PAYWALL: only 3 tokens | Paywall message, CTA |

### Test 3B: Priya -- Returning User (Resume + Interview + Skills)

| Step | Action | Input/Data | Expected Behavior | Record |
|------|--------|-----------|-------------------|--------|
| 1 | Sign in | `priya.patel.test@gmail.com` / `TestPass123!` | Dashboard | Token balance |
| 2 | Purchase Starter pack ($5) | -- | 50 tokens added (53 total) | Balance |
| 3 | Run Resume Optimizer (10 tokens) | Target JD = Datadog | Before/after ATS score, rewrites | Full output, score improvement |
| 4 | Run Interview Prep (3 tokens) | interview_type="behavioral_case", target = Datadog | Questions + STAR answers | Question quality, relevance to data analyst role |
| 5 | Run Skills Gap Analysis (5 tokens) | target_role="Data Analyst at mid-size tech company" | Gap analysis with courses | Gaps, learning path, course prices |
| 6 | Navigate to History | -- | All 4 results listed | History completeness |
| 7 | Test Share on JD Match result | Click share | Share link generated | URL |

---

## Persona 4: David Kim -- Finance-to-Fintech

### Test 4A: David -- New User Registration

**Entry point:** Landing page with resume paste

| Step | Action | Input/Data | Expected Behavior | Record |
|------|--------|-----------|-------------------|--------|
| 1 | Navigate to homepage | `http://localhost:3000` | Landing page | -- |
| 2 | Paste resume | David's full resume | "Resume Detected" | Detection |
| 3 | Click CTA | -- | Free analysis | Results |
| 4 | Review analysis | -- | ATS score, skills, salary | Scores |
| 5 | Register | `david.kim.test@gmail.com` / `TestPass123!` | 5 tokens | Balance |
| 6 | Run AI Displacement (0 tokens) | -- | Banking/finance AI risk analysis | Score, tasks at risk, timeline |
| 7 | Run JD Match (2 tokens) | David's Ramp PM JD | Fit analysis for banker-to-PM | Fit score, critical gaps (should flag missing PM experience) |
| 8 | Observe token balance | -- | Should be 3 | Balance |

### Test 4B: David -- Returning User (Full Mission)

| Step | Action | Input/Data | Expected Behavior | Record |
|------|--------|-----------|-------------------|--------|
| 1 | Sign in | `david.kim.test@gmail.com` / `TestPass123!` | Dashboard | Balance |
| 2 | Purchase Pro pack ($15) | -- | 200 tokens added | New balance |
| 3 | Run Resume Optimizer (10 tokens) | Target = Ramp PM JD | Resume reframed for PM role | How banking skills are repositioned |
| 4 | Run Cover Letter (3 tokens) | tone="professional", length="standard" | Career transition narrative | Letter quality, transition story |
| 5 | Run Skills Gap Analysis (5 tokens) | target_role="Product Manager at fintech startup" | Finance-to-PM gap analysis | Specific PM skills needed, courses |
| 6 | Run Career Roadmap (8 tokens) | -- | 6-12 month transition plan | Milestones, timeline, actions |
| 7 | Check History | -- | All 6 results | Completeness |

---

## Persona 5: Rachel Torres -- Healthcare Remote Seeker

### Test 5A: Rachel -- New User Registration

**Entry point:** Landing page with JD paste (found specific remote role)

| Step | Action | Input/Data | Expected Behavior | Record |
|------|--------|-----------|-------------------|--------|
| 1 | Navigate to homepage | `http://localhost:3000` | Landing page | -- |
| 2 | Paste Teladoc JD | Rachel's target JD | "Job Description Detected" | Detection |
| 3 | Click CTA | -- | Job analysis results | Company card, requirements |
| 4 | Register | `rachel.torres.test@gmail.com` / `TestPass123!` | 5 tokens | Balance |
| 5 | Run JD Match (2 tokens) | Rachel's resume + Teladoc JD | Healthcare ops to telehealth fit | Fit score, how telehealth pilot is weighted |
| 6 | Check token balance | -- | Should be 3 | Balance |

### Test 5B: Rachel -- Returning User (Resume + Cover + Interview + Salary)

| Step | Action | Input/Data | Expected Behavior | Record |
|------|--------|-----------|-------------------|--------|
| 1 | Sign in | `rachel.torres.test@gmail.com` / `TestPass123!` | Dashboard | Balance |
| 2 | Purchase Pro pack ($15) | -- | 200 tokens added | Balance |
| 3 | Run Resume Optimizer (10 tokens) | Target = Teladoc JD | Healthcare jargon translated for tech | Before/after, keyword changes |
| 4 | Run Cover Letter (3 tokens) | tone="professional", length="standard" | Hospital-to-telehealth narrative | Letter text, remote work positioning |
| 5 | Run Interview Prep (3 tokens) | interview_type="behavioral_case", target = Teladoc | Healthcare-tech hybrid questions | Question relevance, STAR answers |
| 6 | Run Salary Negotiation (3 tokens) | target = Remote Healthcare PM | Salary data for remote health PM | Market range, negotiation scripts |
| 7 | Check History | -- | All 5 results | Completeness |

---

## Persona 6: James O'Brien -- Senior Creative

### Test 6A: James -- New User Registration

**Entry point:** Landing page, curiosity about AI displacement of creative work

| Step | Action | Input/Data | Expected Behavior | Record |
|------|--------|-----------|-------------------|--------|
| 1 | Navigate to homepage | `http://localhost:3000` | Landing page | -- |
| 2 | Paste resume | James's full resume | "Resume Detected" | Detection |
| 3 | Click CTA | -- | Free analysis | ATS score (may be low for creative resume) |
| 4 | Register | `james.obrien.test@gmail.com` / `TestPass123!` | 5 tokens | Balance |
| 5 | Run AI Displacement (0 tokens) | -- | Creative industry AI displacement analysis | Score (should differentiate CD from junior designer) |
| 6 | Check results | -- | Nuanced analysis of creative direction vs. execution tasks | Output quality |

### Test 6B: James -- Returning User (LinkedIn + Roadmap + Entrepreneurship)

| Step | Action | Input/Data | Expected Behavior | Record |
|------|--------|-----------|-------------------|--------|
| 1 | Sign in | `james.obrien.test@gmail.com` / `TestPass123!` | Dashboard | Balance |
| 2 | Purchase Pro pack ($15) | -- | 200 tokens | Balance |
| 3 | Run LinkedIn Optimizer (10 tokens) | target_role="VP of Creative / Creative Director" | Headlines, about section, keywords | Creative industry positioning |
| 4 | Run Career Roadmap (8 tokens) | -- | Agency-to-brand transition plan | Timeline, milestones |
| 5 | Run Entrepreneurship Assessment (8 tokens) | -- | Creative consultancy viability | Business model, founder-market fit, risk |
| 6 | Check History | -- | All 4 results | Completeness |

---

## Global Verification Checks (All Personas)

For every test, verify these cross-cutting concerns:

### Token Economy
- [ ] New account starts with exactly 5 tokens
- [ ] Each tool deduction matches documented cost
- [ ] Paywall appears when balance < tool cost
- [ ] Token balance updates immediately (optimistic UI)
- [ ] Purchase adds correct number of tokens

### Data Persistence
- [ ] Career profile saves after first tool run
- [ ] Job target saves after JD Match
- [ ] All tool results appear in History
- [ ] Results persist across sign-out/sign-in

### Navigation
- [ ] All tools accessible from sidebar
- [ ] All tools accessible from dashboard tools grid
- [ ] "Next recommended tool" suggestion appears after results
- [ ] Back navigation works correctly

### Mobile Responsiveness
- [ ] Landing page Smart Input works on mobile viewport
- [ ] Tool results are readable on mobile
- [ ] Bottom navigation appears on mobile
- [ ] Touch targets meet 44px minimum

### Error Handling
- [ ] Graceful error if AI tool times out
- [ ] Graceful error if network disconnects during tool run
- [ ] No console errors during normal flow
- [ ] Loading states show progress indicators

---

## Test Execution Order

### Round 1: New User Registration (Test A for all 6 personas)
1. Sarah Chen (1A) -- resume paste entry
2. Marcus Johnson (2A) -- resume paste entry
3. Priya Patel (3A) -- JD paste entry
4. David Kim (4A) -- resume paste entry
5. Rachel Torres (5A) -- JD paste entry
6. James O'Brien (6A) -- resume paste entry

### Round 2: Returning User Sign-In (Test B for all 6 personas)
1. Sarah Chen (1B) -- mission tools
2. Marcus Johnson (2B) -- interview + salary
3. Priya Patel (3B) -- resume + interview + skills
4. David Kim (4B) -- full mission
5. Rachel Torres (5B) -- resume + cover + interview + salary
6. James O'Brien (6B) -- linkedin + roadmap + entrepreneurship
