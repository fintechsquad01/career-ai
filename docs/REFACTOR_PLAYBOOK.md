# Refactor Playbook

Rules for safe, reversible refactors in the AISkillScore codebase.

## Before You Start

1. Verify the baseline is green:
   ```bash
   tsc --noEmit && npm run lint && npm run build
   ```
2. Commit all current work — no uncommitted changes.
3. Create a dedicated branch: `refactor/<description>`. Never mix refactors with feature work.

## Safe File Move

1. Create the new file at the destination path.
2. Copy the full content into it.
3. Add a re-export shim at the **old** path:
   ```ts
   /** @deprecated Moved to @/new/path — update your imports. */
   export * from '@/new/path';
   ```
4. Run `npm run build` — must pass with zero errors.
5. Update imports in consuming files **one file at a time**.
6. Run `npm run build` after each file change.
7. Remove the shim only after every import is updated and the build passes.

## Safe Rename

1. Rename the symbol in its defining module.
2. Add a re-export alias at the old name:
   ```ts
   /** @deprecated Use NewName instead. */
   export const OldName = NewName;
   ```
3. Find all references: `grep -r 'OldName' src/`.
4. Update consumers **one file at a time**, verifying the build after each.
5. Remove the alias after all consumers are migrated and the build passes.

## Consolidating Duplicates

1. Create the **canonical** module with the authoritative implementation.
2. Turn old duplicate modules into thin wrappers that re-export from canonical:
   ```ts
   /** @deprecated Use @/lib/canonical instead. */
   export { thing } from '@/lib/canonical';
   ```
3. Migrate consumers one at a time, verifying the build after each.
4. Remove wrapper modules only after all consumers point to the canonical module.

## Deprecation Policy

1. Add `@deprecated` JSDoc to the symbol with a migration path:
   ```ts
   /** @deprecated Use `createServerClient` from @/lib/supabase/server instead. Removal: Sprint 12. */
   ```
2. In development only, add a runtime warning:
   ```ts
   if (process.env.NODE_ENV === 'development') {
     console.warn('Deprecated: OldThing — use NewThing instead.');
   }
   ```
3. Set a removal window of **2 sprints or releases**.
4. Track all active deprecations in a `DEPRECATED.md` file or a GitHub issue labeled `deprecation`.

## Rollback Strategy

- Every refactor commit **must** be revertable with `git revert <sha>`.
- Prefer **atomic commits**: one commit per file move/rename/change.
- Never squash refactor commits with unrelated feature commits.
- If a refactor spans multiple PRs, each PR must leave the build green and be independently revertable.
- If something breaks after merge, revert first, investigate second.
