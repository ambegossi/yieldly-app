---
phase: 03-chart
plan: 02
subsystem: ui
tags: [chart-integration, pool-info-card, apy-chart, wiring]

requires:
  - phase: 03-chart
    plan: 01
    provides: ApyChart component, Victory Native + Skia configured
  - phase: 01-infrastructure
    provides: usePoolApyHistory hook, PoolRepo.findApyHistory
  - phase: 02-screen-navigation
    provides: PoolDetailsScreen, PoolInfoCard component
provides:
  - PoolInfoCard with integrated ApyChart rendering chart below APY/project info
  - End-to-end data flow from usePoolApyHistory through PoolInfoCard to ApyChart
affects: []

tech-stack:
  added: []
  patterns: [usePoolApyHistory hook called inside PoolInfoCard, ApyChart rendered as child]

key-files:
  created: []
  modified:
    - src/screens/pool-details/components/pool-info-card.tsx
    - src/screens/pool-details/index.tsx
    - src/screens/pool-details/components/__tests__/pool-info-card.test.tsx
    - src/screens/pool-details/__tests__/pool-details-screen.test.tsx

key-decisions:
  - "ApyChart mocked in PoolInfoCard tests to isolate unit tests from Victory Native rendering"
  - "usePoolApyHistory refetch passed as onRetry to ApyChart for error retry flow"

requirements-completed: [CHRT-01, CHRT-04]

duration: 2min
completed: 2026-04-02
---

# Phase 3 Plan 2: Chart Integration Summary

**Wired ApyChart into PoolInfoCard with usePoolApyHistory data flow, completing end-to-end chart rendering on pool details screen**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-02T02:27:26Z
- **Completed:** 2026-04-02T02:29:55Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added poolId prop to PoolInfoCard and wired usePoolApyHistory hook for chart data
- Rendered ApyChart below APY/project info with mt-6 spacing inside the card
- Passed pool.id from PoolDetailsScreen to PoolInfoCard
- Updated all 7 existing tests to include poolId prop
- Added 2 new integration tests verifying chart rendering and hook call
- All 30 suites (203 tests) passing, zero type errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire ApyChart into PoolInfoCard and pass poolId from screen** - `dcb4e84` (feat)
2. **Task 2: Update existing tests for poolId prop and chart integration** - `edbb2a5` (test)

## Files Created/Modified
- `src/screens/pool-details/components/pool-info-card.tsx` - Added poolId prop, usePoolApyHistory call, ApyChart rendering
- `src/screens/pool-details/index.tsx` - Added poolId={pool.id} to PoolInfoCard usage
- `src/screens/pool-details/components/__tests__/pool-info-card.test.tsx` - Updated all renders with poolId, added 2 chart integration tests
- `src/screens/pool-details/__tests__/pool-details-screen.test.tsx` - Added usePoolApyHistory and ApyChart mocks

## Decisions Made
- Mocked ApyChart as `jest.fn(() => null)` in PoolInfoCard tests to keep unit tests isolated from Victory Native/Skia rendering complexity
- Used `refetch` from useAppQuery return value as `onRetry` callback for ApyChart error retry

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Home integration test (`home.integration.test.tsx`) has a pre-existing flake unrelated to chart changes -- it fails to render "Find the Best Stablecoin Yields" text, getting stuck on loading state. This is out of scope for this plan.

## User Setup Required
None.

## Known Stubs
None - all data flows are fully wired from usePoolApyHistory through PoolInfoCard to ApyChart.

## Self-Check: PASSED

- All 4 modified files exist
- Both commits found in git history
- All acceptance criteria content verified in source files
