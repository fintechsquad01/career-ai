# Repository Rules

## Golden Rules

1. **No breaking changes without a migration.** Database schema changes require a numbered SQL migration in `supabase/migrations/`. API changes require a version bump or backward-compatible addition.
2. **No secrets in code.** API keys, tokens, and service role keys live in environment variables only. Commits containing secrets must be reverted immediately.
3. **No `any` types.** TypeScript strict mode is enforced. Use `unknown` and narrow, or define a proper type. Zero exceptions.
4. **Mobile-first always.** Write base Tailwind classes for mobile (375px). Use `sm:` / `md:` / `lg:` breakpoints to scale up. Every interactive element: `min-h-[44px]`.
5. **Typecheck before push.** Run `npm run typecheck` locally. CI will reject type errors.
6. **Build must pass.** Run `npm run build` before pushing to `main`. No "fix later" merges.
7. **One component per file.** No multi-component files. Co-locate test and story files with their component.

## Naming Conventions

| Kind | Convention | Example |
|---|---|---|
| Component files | PascalCase | `ScoreRing.tsx`, `ToolShell.tsx` |
| Hook files | camelCase with `use` prefix | `useTokens.ts`, `useSmartInput.ts` |
| Directories | kebab-case | `src/components/tools/resume-optimizer/` |
| Data types | `T` prefix | `TToolResult`, `TTokenBalance` |
| Component props | No prefix, interface | `interface ScoreRingProps` |
| Route files | Next.js conventions | `page.tsx`, `layout.tsx`, `loading.tsx` |
| Utility files | camelCase | `detectInputType.ts`, `formatTokens.ts` |
| Zustand stores | camelCase with `Store` suffix | `useAuthStore.ts`, `useTokenStore.ts` |
| Supabase Edge Fns | kebab-case | `supabase/functions/run-tool/` |

## Folder Boundaries

```
src/
├── app/              # Next.js App Router — routes, layouts, API routes only
├── components/
│   ├── layout/       # Nav, Sidebar, BottomNav, AppShell
│   ├── shared/       # ScoreRing, InsightCard, TokenBadge, Paywall
│   └── tools/        # Feature-scoped: tools/resume/, tools/displacement/
├── hooks/            # Custom React hooks
├── lib/              # Utilities, Supabase clients, Stripe helpers, constants
├── stores/           # Zustand stores
└── types/            # Shared TypeScript types and database.ts
supabase/
├── functions/        # Deno Edge Functions (run-tool, parse-input, etc.)
└── migrations/       # Numbered SQL migrations
```

- **Route files** (`page.tsx`, `layout.tsx`) must not contain business logic. Delegate to components.
- **Components** must not import from `src/app/` — dependency flows downward only.
- **Stores** must not import from `src/components/` — stores are consumed, not consumers.

## Import Conventions

- Prefer the `@/` path alias for cross-boundary imports: `import { ScoreRing } from '@/components/shared/ScoreRing'`.
- Relative imports are acceptable only for co-located files within the same feature directory.
- Use `import type` for type-only imports: `import type { TToolResult } from '@/types'`.
- Order imports: React/Next → external packages → `@/` aliases → relative → types.
- No barrel files (`index.ts` re-exports). Import from the source file directly.

## PR Definition of Done

- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run build` completes successfully
- [ ] No new `any` types introduced
- [ ] No `console.log` in committed component/page files
- [ ] Mobile viewport (375px) visually tested
- [ ] New env vars documented in `.env.example`
- [ ] Database changes include a migration file
- [ ] PR description explains **why**, not just **what**
