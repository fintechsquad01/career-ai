## Summary
<!-- 1-3 sentences: what changed and why -->

## Branding Rollout Metadata (Required for branded PRs)
<!-- These items must be checked before coordinator approval -->
- [ ] `branding-rollout` label applied
- [ ] One batch label applied: `branding-batch:A` / `branding-batch:B` / `branding-batch:C` / `branding-batch:D`
- [ ] `.github/branding-rollout/merge-state.json` updates only current batch from `false` -> `true`

## Branding Batch Report (Required for branded PRs)
### Changed files
<!-- Exact file list + why each file is in scope -->

### What/why
<!-- Intent and rationale tied to batch scope -->

### Verification status
<!-- Required format per line: [ ]|[x] <item> - PASS: <evidence> OR FAIL: <issue> -->
- [ ] landing - PASS: <evidence> / FAIL: <issue>
- [ ] pricing - PASS: <evidence> / FAIL: <issue>
- [ ] dashboard/nav - PASS: <evidence> / FAIL: <issue>
- [ ] tool run input/loading/result - PASS: <evidence> / FAIL: <issue>
- [ ] mobile nav and spacing - PASS: <evidence> / FAIL: <issue>

### Risks
<!-- Known residual risks + mitigation/rollback notes -->

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Refactor (no behavior change)
- [ ] Breaking change (requires migration)
- [ ] Documentation
- [ ] Dependency update

## No-Break Verification
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Tested on mobile viewport (375px)
- [ ] No new `as any` type assertions
- [ ] No hardcoded secrets or API keys
- [ ] No new `console.log` in production code paths

## Risk Assessment
**Risk level:** Low / Medium / High
**What could break:**
**Affected routes/components:**

## Rollback Plan
<!-- How to undo this change if it causes issues -->

## Screenshots (if UI change)
<!-- Before/after screenshots, especially mobile -->
