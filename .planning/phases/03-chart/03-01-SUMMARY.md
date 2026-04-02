---
phase: 03-chart
plan: 01
subsystem: ui
tags: [victory-native, skia, react-native-skia, chart, line-chart, tdd]

requires:
  - phase: 01-infrastructure
    provides: ApyDataPoint entity, usePoolApyHistory hook
  - phase: 02-screen-navigation
    provides: Pool details screen structure, PoolInfoCard component
provides:
  - ApyChart component with 4 visual states (loading, error, empty, success)
  - Victory Native + Skia installation and Jest configuration
  - Font asset for chart axis labels
  - Helper functions (formatDateLabel, formatApyLabel, toChartData)
affects: [03-chart-plan-02]

tech-stack:
  added: [victory-native@41.20.2, "@shopify/react-native-skia@2.2.12"]
  patterns: [Victory Native CartesianChart + Line, Skia useFont for axis labels, jest.mock for Victory Native in tests]

key-files:
  created:
    - src/screens/pool-details/components/apy-chart.tsx
    - src/screens/pool-details/components/__tests__/apy-chart.test.tsx
    - src/assets/fonts/inter-medium.ttf
    - jest.font-mock.js
  modified:
    - package.json
    - jest.config.js

key-decisions:
  - "Mock Victory Native with displayName on mock components to avoid react-native-css-interop displayName errors in Jest"
  - "Use jest.font-mock.js for TTF file module mapping instead of inline moduleNameMapper"
  - "Export formatDateLabel, formatApyLabel, toChartData for direct unit testing alongside component tests"
  - "Use index signature on ChartDataPoint interface for Victory Native Record<string, unknown> compatibility"

patterns-established:
  - "Victory Native mock pattern: define named functions with displayName inside jest.mock factory, avoid JSX in factory"
  - "Font file mock: moduleNameMapper maps *.ttf to jest.font-mock.js returning a string"

requirements-completed: [CHRT-01, CHRT-02, CHRT-03, CHRT-04]

duration: 11min
completed: 2026-04-02
---

# Phase 3 Plan 1: Chart Foundation Summary

**Victory Native ApyChart component with CartesianChart green line, labeled axes, and 4 visual states (loading skeleton, error retry, empty, success)**

## Performance

- **Duration:** 11 min
- **Started:** 2026-04-02T02:08:20Z
- **Completed:** 2026-04-02T02:19:38Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Installed victory-native@41.20.2 and @shopify/react-native-skia@2.2.12 with trustedDependencies
- Built ApyChart component with all 4 states: loading skeleton, error with retry, empty, success chart
- Full TDD cycle: 14 new tests all passing, 210 total suite green
- Jest configured for Skia (jestSetup.js, transformIgnorePatterns, font mock)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Victory Native + Skia, add font, configure Jest** - `c3531c4` (chore)
2. **Task 2 RED: Add failing tests for ApyChart** - `21dff52` (test)
3. **Task 2 GREEN: Implement ApyChart component** - `0180e81` (feat)

## Files Created/Modified
- `src/screens/pool-details/components/apy-chart.tsx` - ApyChart component with 4 visual states, CartesianChart + Line rendering
- `src/screens/pool-details/components/__tests__/apy-chart.test.tsx` - 14 unit tests covering all states and helper functions
- `src/assets/fonts/inter-medium.ttf` - Inter Medium font for Victory Native axis labels
- `jest.font-mock.js` - Module mock for TTF font imports in Jest
- `package.json` - Added victory-native, @shopify/react-native-skia, trustedDependencies
- `jest.config.js` - Added Skia setupFilesAfterEnv, transformIgnorePatterns, font moduleNameMapper

## Decisions Made
- Used `displayName` on mock components inside jest.mock factory to prevent react-native-css-interop errors when NativeWind wraps JSX elements
- Added `jest.font-mock.js` file for TTF module mapping since require() of font files is not handled by default Jest/Babel
- Added index signature `[key: string]: unknown` to ChartDataPoint interface to satisfy Victory Native's `Record<string, unknown>[]` data type requirement
- Created wrapper functions `formatXLabel`/`formatYLabel` with `(label: unknown) => string` signatures to satisfy Victory Native axis prop types while keeping the exported helpers typed as `(value: number) => string`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added jest.font-mock.js for TTF module resolution**
- **Found during:** Task 2 (ApyChart implementation)
- **Issue:** Jest cannot resolve `.ttf` font file imports via `require()`, causing module not found errors
- **Fix:** Created `jest.font-mock.js` returning a mock string, mapped `\\.(ttf|otf|woff|woff2)$` in jest.config.js moduleNameMapper
- **Files modified:** jest.config.js, jest.font-mock.js
- **Verification:** All tests pass with font mock in place
- **Committed in:** 0180e81

**2. [Rule 3 - Blocking] Added displayName to Victory Native mock components**
- **Found during:** Task 2 (ApyChart tests)
- **Issue:** react-native-css-interop (NativeWind) reads `displayName` on components during JSX wrapping; mock functions without displayName caused `Cannot read properties of undefined` errors
- **Fix:** Defined named functions with `.displayName` property inside the jest.mock factory, avoiding JSX rendering inside the factory
- **Files modified:** apy-chart.test.tsx
- **Verification:** All 14 ApyChart tests pass
- **Committed in:** 0180e81

**3. [Rule 1 - Bug] Fixed Victory Native TypeScript type mismatches**
- **Found during:** Task 2 (TypeScript type checking)
- **Issue:** Victory Native's CartesianChart types expect `never` for xKey/yKeys, `(label: unknown) => string` for formatters, and `Record<string, unknown>[]` for data
- **Fix:** Used `as never` casts for xKey/yKeys/points, created wrapper formatXLabel/formatYLabel functions with unknown param types, added index signature to ChartDataPoint
- **Files modified:** apy-chart.tsx
- **Verification:** `bun run types` passes with zero errors
- **Committed in:** 0180e81

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All auto-fixes necessary for correct Jest and TypeScript operation. No scope creep.

## Issues Encountered
- Victory Native mock inside jest.mock factory cannot use JSX or require("react-native") due to Babel's out-of-scope variable restriction from NativeWind's CSS interop transform. Resolved by returning null from mock and tracking calls via external array.
- Date formatting test initially failed due to UTC timezone offset when using `new Date("2024-03-02")` -- fixed by using noon timestamp `new Date("2024-03-02T12:00:00")`

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all data flows are wired (component accepts data/isPending/error props from parent).

## Next Phase Readiness
- ApyChart component ready for integration into PoolInfoCard (Plan 02 scope)
- Plan 02 needs to: add poolId prop to PoolInfoCard, call usePoolApyHistory hook, pass data to ApyChart
- Victory Native and Skia fully configured for Jest testing

## Self-Check: PASSED

- All 4 created files exist
- All 3 commits found in git history
- All acceptance criteria content verified in source files

---
*Phase: 03-chart*
*Completed: 2026-04-02*
