# AISkillScore — Page Specs

## Design System Constants

```typescript
// All pages use these patterns from the prototype
const DESIGN = {
  font: "Inter",
  maxWidth: {
    landing: "max-w-4xl",       // Hero
    input: "max-w-xl",          // Smart input
    app: "max-w-5xl",           // Dashboard
    tool: "max-w-3xl",          // Tool pages
    narrow: "max-w-2xl",        // Settings, Referral
    share: "max-w-lg",          // Share pages
  },
  card: "bg-white rounded-2xl border border-gray-200",
  cardSm: "bg-white rounded-xl border border-gray-200",
  gradient: "bg-gradient-to-r from-blue-600 to-violet-600",
  gradientBr: "bg-gradient-to-br from-blue-600 to-violet-600",
  button: {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20",
    secondary: "border border-gray-200 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-gray-500 hover:text-gray-900",
  },
  minTouch: "min-h-[44px]",      // 44px touch targets on all interactive elements
  minButton: "min-h-[48px]",     // 48px for primary CTAs
  padding: {
    page: "px-4 py-5 sm:py-8 pb-24 sm:pb-8",  // pb-24 for bottom nav mobile
    section: "px-4",
  },
};
```

---

## Global Layout Components

### Nav (sticky top)
- Height: 56px mobile (`h-14`), 64px desktop (`sm:h-16`)
- Logo: 28x28 gradient square with Brain icon + "AISkillScore" text
- **Logged out**: Pricing, Sign In, "Get Started — Free" button
- **Logged in (desktop)**: Dashboard, Job Mission (with red dot badge if incomplete), Tokens, TokBadge, avatar circle
- **Logged in (mobile)**: TokBadge + hamburger menu → full mobile menu overlay

### Sidebar (desktop only, `hidden md:flex`)
- Width: `w-56`, sticky below nav
- Sections: Core nav (Dashboard, All Tools, Job Mission) → Tools by category → Get Tokens, History, Lifetime Deal, Refer & Earn, Settings → Token balance card at bottom
- Active state: `bg-blue-50 text-blue-700 font-medium`

### Bottom Nav (mobile only, logged in)
- Fixed bottom, 5 items: Dashboard, Mission, Tools, Tokens, Profile
- Active item: blue icon + text, inactive: gray
- Each item: icon + label, `min-h-[48px]`

### Toast
- Fixed top center, below nav
- Dark background (`bg-gray-900`), white text, CheckCircle icon
- Auto-dismiss after 3 seconds

---

## Page: Landing (`/`)

### Sections (in order):

1. **Hero**
   - Badge: "Free instant analysis · No signup" with Sparkles icon
   - H1: "Stop guessing. / Know exactly where you stand." (gradient on second line)
   - Subtitle: "Paste a job posting, job URL, or your resume..."

2. **Smart Input** (the core interactive element)
   - Card container with rounded-2xl
   - Demo chips when empty: "📋 Sample job posting", "🔗 LinkedIn URL", "📄 Sample resume"
   - Textarea: 4-6 rows, placeholder with bullet points
   - Detection badge (bottom-left): animates in based on detected type
     - URL: blue badge with Link icon
     - JD: blue badge with Crosshair icon
     - Resume: violet badge with FileText icon
   - Bottom-right: "Clear" + "or drop a file"
   - CTA button: adapts text/color/icon per detected type
   - Below: supported platforms chips + privacy line

3. **Analysis Loading** (replaces Smart Input when running)
   - Loader component with step-by-step progress
   - Resume: 6 steps (parsing, scoring, displacement, salary, gaps, insights)
   - JD: 5 steps (extracting, skills, culture, salary, fit)
   - Each step: spinner → checkmark animation

4. **Analysis Results** (replaces loading)
   - **Resume X-Ray**: ATS score ring, displacement ring, salary benchmark, top skills, skill gaps, "Save results" email capture, "Sign up to unlock all tools" CTA
   - **Job Match**: Company card, fit score ring, requirements matrix (✓/✗/partial), salary range, "Start mission" CTA

5. **Below-fold** (only visible when no analysis running)
   - Social proof bar: "12,400+ careers analyzed · 4.8/5 rating"
   - How it works (3 steps): Paste → Analyze → Act
   - Tool previews grid (2x2 mobile, 4-col desktop)
   - Testimonials
   - Pricing preview
   - Final CTA: "Your career is worth 30 seconds"
   - FAQ accordion
   - Footer

### States:
- Default: Smart Input visible
- Analyzing: Loader visible (Smart Input hidden)
- Results: Results visible (Smart Input hidden, below-fold hidden)

---

## Page: Auth (`/auth`)

- Mode toggle: `signup` | `signin`
- Google OAuth button (full width, white bg, Google logo SVG)
- Divider: "or"
- Form: Full name (signup only), Email, Password
- Submit button: "Create Account — 15 Free Tokens" or "Sign In"
- Toggle link: "Have an account? Sign in" / "New? Sign up free"
- On success: redirect to `/mission` (if JD analyzed) or `/dashboard`

---

## Page: Dashboard (`/dashboard`)

### Components:
1. **ProfileCard**: Avatar circle, name, title + score badges (ATS, AI Risk, Tokens)
2. **Profile completeness bar**: Percentage + progress bar + hint text
3. **Active Mission Card** (if JD analyzed): Gradient card, job title, fit %, progress bar → clicks to Mission
4. **No-mission prompt** (if no JD): "Found a job you want?" → analyze job CTA
5. **Critical Alert**: Red card, ATS score warning, "Fix" button
6. **All Tools Grid**: Categorized (Analyze/Build/Prepare/Grow), 2-col mobile, 3-col desktop
7. **Insights**: Pain, competitive, info insight cards
8. **Recent Activity**: List of recent tool runs with icons and scores
9. **Token CTA**: Gradient upsell card when tokens ≤ 10
10. **Referral + Lifetime**: 2-col grid of nudge cards

---

## Page: Mission Control (`/mission`)

### Components:
1. **Back button** → Dashboard
2. **Mission Header Card**: Gradient top bar "Job Mission Control", job details (title, company, location, salary, applicants), fit % badge, requirements matched badge, progress bar
3. **Skill Matrix**: Grid of all requirements with match status (✓ green / ✗ red / ~ amber)
4. **Competitive Advantage**: Green card, 3 bullet points with ArrowUpRight icons
5. **Resume Upload Prompt** (if no resume)
6. **Action Cards** (5 sequential):
   - Each: icon, title, description, token cost, impact badge, priority badge (Critical/High/Medium/Low)
   - States: locked → available → loading → completed (expanded with results)
   - Color coding: red (critical), amber (high), blue (medium), gray (low)
7. **Token Gate Modal**: Appears when insufficient tokens, shows packs inline
8. **Mission Complete**: Trophy icon, before/after scores, completed checklist, "Apply Now" + "Next Job" buttons

---

## Page: Tool Page (`/tools/[toolId]`)

All tool pages use the **ToolShell** wrapper:

### ToolShell Structure:
1. Back button → Dashboard
2. Tool header: Icon, title, token cost badge (or "Free"), category badge
3. Description text
4. Pain point insight (data-backed stat)
5. Competitive comparison insight (vs. Jobscan, Teal, etc.)
6. Resume context: "Pre-loaded from your resume: [title] · [skills]"
7. Job targeting context (if JD analyzed): "Targeting: [job] at [company]"
8. **Input state**: Tool-specific form + "Run — X tokens" button
9. **Loading state**: Spinning loader, "Running [tool]... Usually 5-15 seconds"
10. **Result state**: Tool-specific results + Run Again + Share + Mission Control buttons + "Recommended next" tool suggestions

### Tool-Specific Results:

**Displacement**: Task risk table, safe tasks list, risk timeline, recommendations
**JD Match**: Fit score ring, requirements matrix, gap highlights, advantage cards
**Resume Optimizer**: Before/after ATS score, keywords added chips, section rewrites (before→after), Copy/Download
**Cover Letter**: Full letter text with blue/green keyword highlights, word count, Copy/Download
**LinkedIn Optimizer**: 3 headline rewrites, About section, keywords to add
**AI Headshots**: 4x2 grid of placeholder photos with style labels, Download All/Share
**Interview Prep**: Collapsible question cards (Behavioral/Case Study/Analytical/Gap Probe), each with suggested STAR answer + coaching tip
**Skills Gap**: Ranked list with progress bars, priority badges, course recommendations with provider/price, learning path timeline
**Career Roadmap**: 6-12 month timeline with milestones, checkpoints, priority actions
**Salary Negotiation**: Market data range, percentile position, counter-offer scripts, negotiation tactics
**Entrepreneurship**: Business model matches, risk tolerance assessment, founder-market fit score

---

## Page: Pricing (`/pricing`)

1. Section header: "Pay per use. No subscriptions."
2. Comparison row: competitors' monthly costs vs. our per-use costs
3. **3 Pack Cards**: Starter, Pro (highlighted with "Most Popular" + save badge), Power
   - Each: name, tokens, price, per-token rate, description, "Get [Pack]" button
4. "What can you do with X tokens?" grid
5. Competitive teardown table (AISkillScore vs Jobscan vs Teal vs FinalRound)
6. FAQ accordion

---

## Page: Lifetime Deal (`/lifetime`)

1. Back button
2. Urgency header: "Early Bird Lifetime Deal" + spots counter
3. Price comparison: Early Bird $119 vs Standard $179 vs VIP $279
4. ROI Calculator: monthly token value breakdown (120tk/mo for Early Bird/Standard, 180tk/mo for VIP)
5. Lifetime vs Pay-as-you-go comparison table
6. "What 120-180 tokens covers monthly" grid
7. 30-day guarantee card
8. CTA: Gradient card with "Lock in your lifetime deal"
9. FAQ

---

## Page: Settings (`/settings`)

3 tabs: Profile | Account | Privacy

**Profile tab**: Avatar, name, email, resume management (upload/replace/delete), target role
**Account tab**: Token balance, purchase history, usage breakdown, lifetime deal upsell
**Privacy tab**: Data inventory, Export Data (JSON), Delete Account, Privacy highlights (AES-256, GDPR, etc.)

---

## Page: Share Score (`/share/[hash]`)

Public page (no auth). Designed for OG card rendering.

1. Branded card: AISkillScore logo, score type, large Ring score, title/industry
2. Key findings: risk tasks, safe tasks
3. CTA: "What's YOUR score?" → links to landing
4. Social proof: scores generated, avg rating, action rate

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| `< 768px (mobile)` | Bottom nav, no sidebar, single-column layouts, sheet modals from bottom |
| `≥ 768px (md)` | Sidebar visible, no bottom nav, 2-3 column grids, centered modals |
| `≥ 1024px (lg)` | Wider card layouts, more horizontal space |

---

## Animation Patterns (from prototype)

- **Page transitions**: 120ms opacity fade (`transition-opacity duration-150`)
- **Token spend**: 600ms scale pulse (`scale-110`)
- **Detection badges**: fade-in (`animate-in`)
- **Loader steps**: 420-450ms per step with sequential setTimeout
- **Progress bars**: `transition-all duration-700` on width
- **Modals**: backdrop blur + slide up on mobile
- **Hover states**: color transitions on all interactive elements
