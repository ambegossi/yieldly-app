---
phase: quick
plan: 260414-rpv
subsystem: home-screen
tags: [stablecoin-filter, layout, pagination, brand-color]
dependency_graph:
  requires: []
  provides: [stablecoin-filtering, max-width-layout, pagination-footer, active-page-brand-color]
  affects: [src/domain/pool, src/infra/repositories/http-repository/pool, src/screens/home]
tech_stack:
  added: []
  patterns: [domain-constant, dto-field-addition, flashlist-footer, tailwind-conditional-class]
key_files:
  created:
    - src/domain/pool/stablecoin-symbols.ts
  modified:
    - src/infra/repositories/http-repository/pool/pool-dto.ts
    - src/infra/repositories/http-repository/pool/http-pool-repo.ts
    - src/infra/repositories/http-repository/pool/__tests__/http-pool-repo.test.ts
    - src/infra/repositories/http-repository/pool/__tests__/pool-adapter.test.ts
    - src/screens/home/index.tsx
    - src/screens/home/components/pagination-controls.tsx
decisions:
  - Split by "-" and uppercase each token for stablecoin symbol matching to handle compound pairs like USDC-WETH and USDT0-USDC.E
  - Keep variant="default" on active page button but override background with bg-brand className (Tailwind class wins over inline variant style)
  - Use ListFooterComponent on FlashList instead of sibling View so pagination scrolls with content on desktop/tablet
metrics:
  duration: ~15 minutes
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_changed: 7
---

# Quick Task 260414-rpv: Web Improvements — Stablecoin Filter, Max-Width, Pagination Footer, Active Page Color Summary

**One-liner:** Stablecoin symbol filtering in HTTP repo, max-w-7xl content constraint, FlashList footer pagination, and brand-green active page button.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add stablecoin filter to pool fetching | b84cc33 | stablecoin-symbols.ts, pool-dto.ts, http-pool-repo.ts, http-pool-repo.test.ts |
| 2 | Max-width, pagination footer, and active page button | d459603 | home/index.tsx, pagination-controls.tsx, pool-adapter.test.ts |

## What Was Built

### Task 1: Stablecoin Filter (TDD)

- Created `src/domain/pool/stablecoin-symbols.ts` exporting `STABLECOIN_SYMBOLS` — a typed `as const` array of 21 well-known stablecoin token symbols (USDC, USDT, DAI, FRAX, USDE, GHO, etc.)
- Added `stablecoin: boolean` field to `DefiLlamaPoolDTO` in `pool-dto.ts`
- Updated `HttpPoolRepo.findAll()` to filter before mapping: only pools where `dto.stablecoin === true` AND the symbol (split by `-`) contains at least one token matching `STABLECOIN_SYMBOLS`
- Added 5 new tests covering all filter permutations; all 12 tests pass

### Task 2: Layout and UX Improvements

- Added `mx-auto w-full max-w-7xl` to the home screen content container — constrains content to 1280px on wide monitors
- Moved `PaginationControls` from a sibling `View` after the `FlashList` into `ListFooterComponent` — pagination now scrolls with the list content on desktop/tablet
- Active page button: added `className="bg-brand hover:bg-brand/90"` and `<Text className="text-white">` — overrides the near-black `variant="default"` background with the brand green (#00AD69)

## Verification

- `bun run test --testPathPatterns="http-pool-repo"`: 12/12 pass
- `bun run test`: 220/220 pass across 31 suites
- `bun run lint`: 0 errors (16 pre-existing warnings from jest.mock require() calls)
- `bun run types`: 0 errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed missing stablecoin field in pool-adapter.test.ts DTOs**
- **Found during:** Task 2 type check (`bun run types`)
- **Issue:** Adding `stablecoin: boolean` as a required field to `DefiLlamaPoolDTO` caused TypeScript errors in `pool-adapter.test.ts` where existing test DTOs didn't include the new field
- **Fix:** Added `stablecoin: true` to all three `DefiLlamaPoolDTO` objects in `pool-adapter.test.ts`
- **Files modified:** `src/infra/repositories/http-repository/pool/__tests__/pool-adapter.test.ts`
- **Commit:** d459603

**2. [Rule 1 - Bug] Fixed Prettier formatting in http-pool-repo.ts and pagination-controls.tsx**
- **Found during:** Task 2 lint check
- **Issue:** Prettier required multi-line formatting for long `.filter()` callback and `className` ternary expression
- **Fix:** Reformatted both expressions to Prettier's expected multi-line style
- **Files modified:** `http-pool-repo.ts`, `pagination-controls.tsx`
- **Commit:** d459603

## Known Stubs

None.

## Self-Check: PASSED
