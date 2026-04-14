---
phase: quick
plan: 260414-r7e
subsystem: ui
tags: [nativewind, tailwind, button, hover, web]

requires: []
provides:
  - Open pool button shows green hover state on web via hover:bg-brand/90
affects: [pool-details]

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - src/screens/pool-details/index.tsx

key-decisions:
  - "Added hover:bg-brand/90 alongside existing active:bg-brand/90 to keep hover and press states consistent"

requirements-completed: []

duration: 3min
completed: 2026-04-14
---

# Quick Task 260414-r7e: Fix hover color on Open pool button Summary

**Added `hover:bg-brand/90` to the Open pool button className to override the default variant's near-black `hover:bg-primary/90` with the correct brand green on web**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-14
- **Completed:** 2026-04-14
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Open pool button now shows green (brand/90) on web hover instead of near-black
- Hover state now matches the existing active/press state (`active:bg-brand/90`)
- All 7 pool-details-screen tests continue to pass; lint and type checks clean

## Task Commits

1. **Task 1: Add hover:bg-brand/90 to Open pool button** - `ed57024` (fix)

## Files Created/Modified

- `src/screens/pool-details/index.tsx` - Added `hover:bg-brand/90` to Button className string on line 57

## Decisions Made

None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Fix is self-contained. No follow-up work required.

---
*Phase: quick*
*Completed: 2026-04-14*
