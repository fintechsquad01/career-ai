# AISkillScore — Code Conventions

## Component Patterns

### Page Component Template
```tsx
// src/app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, career_profiles(*), job_targets(*)")
    .eq("id", user.id)
    .single();

  return <DashboardContent profile={profile} />;
}
```

### Client Component Template
```tsx
// src/components/dashboard/DashboardContent.tsx
"use client";

import { useState } from "react";
import type { Profile } from "@/types";

interface DashboardContentProps {
  profile: Profile;
}

export function DashboardContent({ profile }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-5 sm:py-8 pb-24 sm:pb-8">
      {/* ... */}
    </div>
  );
}
```

### Tool Page Template
```tsx
// src/app/tools/[toolId]/page.tsx
import { ToolShell } from "@/components/tools/ToolShell";
import { ResumeInput } from "@/components/tools/resume/ResumeInput";
import { ResumeResults } from "@/components/tools/resume/ResumeResults";

export default function ToolPage({ params }: { params: { toolId: string } }) {
  return (
    <ToolShell toolId={params.toolId}>
      {({ state, result, onRun }) => (
        state === "result" 
          ? <ResumeResults result={result} />
          : <ResumeInput onSubmit={onRun} />
      )}
    </ToolShell>
  );
}
```

---

## Hook Patterns

### useTokens
```tsx
export function useTokens() {
  const [balance, setBalance] = useState(0);
  const [animating, setAnimating] = useState(false);

  const spend = async (amount: number, toolId: string): Promise<boolean> => {
    if (balance < amount) return false;
    
    // Optimistic update
    setBalance(prev => prev - amount);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);
    
    // Server call
    const { error } = await supabase.rpc("spend_tokens", { 
      p_amount: amount, 
      p_tool_id: toolId 
    });
    
    if (error) {
      setBalance(prev => prev + amount); // Rollback
      return false;
    }
    return true;
  };

  const add = async (amount: number) => { /* ... */ };

  return { balance, spend, add, animating };
}
```

### useTool
```tsx
type ToolState = "input" | "loading" | "result";

export function useTool(toolId: string) {
  const [state, setState] = useState<ToolState>("input");
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState({ step: 0, total: 0, message: "" });
  const { spend } = useTokens();

  const run = async (inputs: Record<string, any>) => {
    const tool = TOOLS_MAP[toolId];
    
    if (tool.tok > 0) {
      const ok = await spend(tool.tok, toolId);
      if (!ok) return; // Token gate will show
    }
    
    setState("loading");
    
    // Call Edge Function with SSE streaming
    const response = await fetch(`${SUPABASE_URL}/functions/v1/run-tool`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ tool_id: toolId, inputs }),
    });
    
    // Process SSE stream for progress updates
    // ...
    
    setState("result");
    setResult(parsedResult);
  };

  const reset = () => { setState("input"); setResult(null); };

  return { state, result, progress, run, reset };
}
```

---

## Data Constants

### Tools Configuration
```tsx
// src/lib/constants.ts
// Port directly from prototype lines 55-67
export const TOOLS: Tool[] = [
  {
    id: "displacement",
    icon: "ShieldAlert",
    title: "AI Displacement Score",
    description: "How likely is AI to impact your role in 2-5 years?",
    tokens: 0,
    category: "Analyze",
    phase: 1,
    painPoint: "47% of jobs face significant AI disruption by 2030",
    vsCompetitor: null,
    route: "displacement",
  },
  // ... all 11 tools
];

export const TOOL_CATEGORIES = ["Analyze", "Build", "Prepare", "Grow"] as const;

export const PACKS: Pack[] = [
  { name: "Starter", tokens: 50, price: 5, rate: "$0.10", description: "Try 2–3 tools" },
  { name: "Pro", tokens: 200, price: 15, rate: "$0.075", description: "Full career overhaul", highlighted: true, save: "25%", vsNote: "Jobscan = $49.95/mo for just resume scanning" },
  { name: "Power", tokens: 600, price: 39, rate: "$0.065", description: "Career transformation", save: "35%" },
];
```

---

## Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Pages | `kebab-case` directories | `app/tools/[toolId]/page.tsx` |
| Components | `PascalCase` files | `ToolShell.tsx`, `SmartInput.tsx` |
| Hooks | `camelCase` with `use` prefix | `useTokens.ts` |
| Utils/Lib | `camelCase` or `kebab-case` | `detect-input.ts`, `parsers.ts` |
| Types | `PascalCase` | `Profile`, `ToolResult`, `TokenTransaction` |
| Database tables | `snake_case` | `career_profiles`, `tool_results` |
| Edge Functions | `kebab-case` directories | `functions/run-tool/` |
| Environment vars | `SCREAMING_SNAKE_CASE` | `ANTHROPIC_API_KEY` |
| CSS classes | Tailwind utilities only | No custom CSS files |

---

## Error Handling

```tsx
// Consistent error pattern across the app
try {
  const result = await someOperation();
  toast.success("Action completed");
} catch (error) {
  if (error instanceof InsufficientTokensError) {
    // Show token gate modal
  } else if (error instanceof AIError) {
    toast.error("AI processing failed. Please try again.");
  } else {
    toast.error("Something went wrong");
    console.error(error);
  }
}
```

---

## Testing Priorities

1. **Token spend/add operations** — Must be atomic, no double-spend
2. **Smart Input detection** — Correctly identifies URL vs JD vs resume
3. **Auth flow** — Login/signup/logout/session refresh
4. **Stripe webhook** — Correctly credits tokens
5. **Tool execution** — End-to-end from input to stored result
6. **RLS policies** — Users can't access other users' data

---

## Git Conventions

- Branch: `feature/[page-name]` or `fix/[description]`
- Commits: conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`)
- PRs: one feature/page per PR
- No direct pushes to main

---

## Accessibility Requirements

- All images: `alt` text
- All interactive elements: keyboard accessible
- Form inputs: associated labels
- Color contrast: WCAG AA minimum
- Focus indicators on all interactive elements
- Screen reader announcements for toast notifications
- Semantic HTML: `nav`, `main`, `aside`, `section`, `article`
