---
phase: 01-infrastructure
plan: 02
subsystem: infra
tags: [react-query, http, defi-llama, repository-pattern, tdd]

# Dependency graph
requires:
  - phase: 01-infrastructure plan 01
    provides: ApyDataPoint entity, PoolRepo.findApyHistory interface, defiLlamaChartDTOToApyHistory adapter, DefiLlamaGetChartResponseDTO DTO types

provides:
  - HttpPoolRepo.findApyHistory: calls GET /chart/{poolId} and transforms response through adapter
  - usePoolApyHistory hook: returns { data, isPending, error } via useAppQuery with staleTime 300000ms

affects:
  - phase-02-presentation
  - phase-03-chart

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useAppQuery (not Suspense) for chart data — error exposed as property, not thrown to ErrorBoundary
    - staleTime: 5 * 60 * 1000 for chart hook to reduce unnecessary refetches
    - afterEach jest.useRealTimers() for fake timer cleanup in repo tests

key-files:
  created:
    - src/domain/pool/use-cases/use-pool-apy-history.ts
    - src/domain/pool/use-cases/__tests__/use-pool-apy-history.test.tsx
  modified:
    - src/infra/repositories/http-repository/pool/http-pool-repo.ts
    - src/infra/repositories/http-repository/pool/__tests__/http-pool-repo.test.ts

key-decisions:
  - "useAppQuery (not useAppSuspenseQuery) for chart hook — chart errors show as UI state, not crash"
  - "afterEach jest.useRealTimers() in repo tests prevents timer leakage between test suites"

patterns-established:
  - "TDD pattern: write failing tests first, confirm RED, then implement GREEN"
  - "useAppQuery with staleTime option for non-critical data that can tolerate 5-min staleness"

requirements-completed: [INFR-02, INFR-04, INFR-05]

# Metrics
duration: 4min
completed: 2026-04-01
---

# Phase 01 Plan 02: Infrastructure — Repo Method and Hook Summary

**HttpPoolRepo.findApyHistory calling DefiLlama GET /chart/{poolId} with usePoolApyHistory hook returning non-Suspense { data, isPending, error } and staleTime 300s**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-01T23:48:46Z
- **Completed:** 2026-04-01T23:52:50Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Implemented `HttpPoolRepo.findApyHistory` calling `GET /chart/{poolId}` and piping through `defiLlamaChartDTOToApyHistory` adapter (30-day filter + null guard)
- Created `usePoolApyHistory(poolId)` hook using `useAppQuery` with query key `["pools", poolId, "apy-history"]` and `staleTime: 300000`
- Added 12 new tests (4 repo + 8 hook) covering success, loading, error, empty, query key, call count, re-render stability, and staleTime verification — full suite 166/166 green

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement HttpPoolRepo.findApyHistory with tests** - `a3445a6` (feat)
2. **Task 2: Create usePoolApyHistory hook with tests** - `701efc9` (feat)

_Note: TDD tasks — RED phase (failing tests) then GREEN phase (implementation) in each commit_

## Files Created/Modified

- `src/infra/repositories/http-repository/pool/http-pool-repo.ts` — Added `findApyHistory` method; now fully satisfies `PoolRepo` interface
- `src/infra/repositories/http-repository/pool/__tests__/http-pool-repo.test.ts` — Added `describe("findApyHistory")` with 4 tests; added `afterEach jest.useRealTimers()` for cleanup
- `src/domain/pool/use-cases/use-pool-apy-history.ts` — New hook wrapping `useAppQuery` with poolId param, query key, staleTime
- `src/domain/pool/use-cases/__tests__/use-pool-apy-history.test.tsx` — 8 tests: success, loading, error, empty, query key, call count, re-render, staleTime

## Decisions Made

- Used `useAppQuery` (not `useAppSuspenseQuery`) per plan decision D-05/D-06: chart errors surface as `error` property so the screen can show a fallback chart message without crashing the entire screen via ErrorBoundary
- Added `afterEach(() => jest.useRealTimers())` at `HttpPoolRepo` describe block level: fake timers in the "mapped APY data points" test were leaking into unrelated tests in the full suite run, causing flaky failures in `home.integration.test.tsx`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed fake timer leakage causing full-suite test failures**

- **Found during:** Task 1 verification (full `bun run test` run)
- **Issue:** `jest.useRealTimers()` was called inline after assertions; if assertions threw, cleanup never ran, leaving fake timers active for subsequent test suites
- **Fix:** Added `afterEach(() => jest.useRealTimers())` at the `describe("HttpPoolRepo")` level to guarantee cleanup
- **Files modified:** `src/infra/repositories/http-repository/pool/__tests__/http-pool-repo.test.ts`
- **Verification:** Full suite passes 166/166 with no flaky failures
- **Committed in:** `701efc9` (Task 2 commit, Prettier formatting also included)

**2. [Rule 1 - Bug] Fixed TypeScript error in staleTime test**

- **Issue:** `queries[0].options.staleTime` — `staleTime` not typed on `QueryOptions` in React Query's public types
- **Fix:** Cast to `any` with `eslint-disable` comment: `(queries[0].options as any).staleTime`
- **Files modified:** `src/domain/pool/use-cases/__tests__/use-pool-apy-history.test.tsx`
- **Verification:** `bun run types` exits 0
- **Committed in:** `701efc9` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 - bugs)
**Impact on plan:** Both fixes necessary for test correctness. No scope creep.

## Issues Encountered

None beyond the two auto-fixed deviations above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `usePoolApyHistory(poolId)` is ready for consumption in Phase 2 (pool details screen) and Phase 3 (chart component)
- `HttpPoolRepo` now fully satisfies the `PoolRepo` interface — no TypeScript errors
- Full test suite green (166/166)
- Blocker: Expo Dev Client required in Phase 3 when Victory Native / Skia is added (Expo Go will break)

---
*Phase: 01-infrastructure*
*Completed: 2026-04-01*
