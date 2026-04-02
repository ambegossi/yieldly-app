---
phase: 01-infrastructure
plan: 01
subsystem: domain-infra
tags: [domain, adapter, tdd, apy-history, pool-repo]
dependency_graph:
  requires: []
  provides:
    - ApyDataPoint domain entity
    - Extended PoolRepo interface with findApyHistory
    - DefiLlama chart DTO types
    - defiLlamaChartDTOToApyHistory adapter
  affects:
    - src/domain/pool/pool-repo.ts
    - src/infra/repositories/http-repository/pool/pool-adapter.ts
    - src/infra/repositories/http-repository/pool/pool-dto.ts
tech_stack:
  added: []
  patterns:
    - TDD (RED-GREEN) for adapter function
    - Type predicate for null guard in filter
    - Cutoff date computed inside function for testability
key_files:
  created:
    - src/domain/pool/apy-data-point.ts
  modified:
    - src/domain/pool/pool-repo.ts
    - src/infra/repositories/http-repository/pool/pool-dto.ts
    - src/infra/repositories/http-repository/pool/pool-adapter.ts
    - src/infra/repositories/http-repository/pool/__tests__/pool-adapter.test.ts
    - src/domain/pool/use-cases/__tests__/use-pool-find-all.test.tsx
    - src/domain/pool/use-cases/__tests__/use-pool-find-all-suspense.test.tsx
    - src/infra/repositories/__tests__/repository-provider.test.tsx
    - src/screens/home/__tests__/home.integration.test.tsx
decisions:
  - "cutoff = new Date() inside function body ensures date is fresh on each invocation, enabling jest.useFakeTimers() in tests"
  - "Type predicate (dto): dto is DefiLlamaApyDataPointDTO & { apy: number } used to satisfy TypeScript narrowing for null guard"
metrics:
  duration: 3 minutes
  completed: 2026-04-01
  tasks_completed: 3
  files_modified: 8
  files_created: 1
---

# Phase 01 Plan 01: APY History Domain Contracts and Chart Adapter Summary

**One-liner:** ApyDataPoint entity, extended PoolRepo interface with findApyHistory, and defiLlamaChartDTOToApyHistory adapter with 30-day filter and null apy guard using TDD.

## What Was Built

Established the data shape contracts for APY history and implemented the adapter that transforms raw DefiLlama chart API responses into filtered domain entities ready for the pool details chart.

### Key artifacts:
- `src/domain/pool/apy-data-point.ts` — `ApyDataPoint { timestamp: string; apy: number }` domain entity
- `src/domain/pool/pool-repo.ts` — Extended with `findApyHistory(poolId: string): Promise<ApyDataPoint[]>`
- `src/infra/repositories/http-repository/pool/pool-dto.ts` — Added `DefiLlamaApyDataPointDTO` and `DefiLlamaGetChartResponseDTO`
- `src/infra/repositories/http-repository/pool/pool-adapter.ts` — Added `defiLlamaChartDTOToApyHistory` that filters to last 30 days and discards null apy entries

## Tasks Completed

| Task | Name | Commits | Status |
|------|------|---------|--------|
| 1 | Define ApyDataPoint entity, extend PoolRepo, add chart DTO types | 5c36b82 | Done |
| 2 (RED) | Add failing tests for defiLlamaChartDTOToApyHistory | 06cc6c9 | Done |
| 2 (GREEN) | Implement defiLlamaChartDTOToApyHistory adapter | 5307507 | Done |
| 3 | Update existing mock factories (done in Task 1) | 5c36b82 | Done |

## Verification Results

- `bun run test --testPathPatterns pool-adapter` — 9 tests pass (3 existing + 6 new)
- `bun run test --testPathPatterns use-pool-find-all` — 13 tests pass across 2 suites
- `bun run lint` — 0 errors (18 pre-existing warnings in unrelated files)
- `bun run types` — Only expected error: `HttpPoolRepo` missing `findApyHistory` (to be fixed in Plan 02)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Updated additional mock factories not listed in plan**

- **Found during:** Task 1 type checking
- **Issue:** `bun run types` revealed 3 additional files with mock `PoolRepo` objects missing `findApyHistory`: `repository-provider.test.tsx`, `home.integration.test.tsx` (2 instances). These caused TypeScript errors beyond the expected `HttpPoolRepo` error.
- **Fix:** Added `findApyHistory: jest.fn()` to all mock factories across all affected test files.
- **Files modified:** `src/infra/repositories/__tests__/repository-provider.test.tsx`, `src/screens/home/__tests__/home.integration.test.tsx`
- **Commit:** 5c36b82

**2. [Rule 1 - Bug] Fixed Prettier formatting violation in test file**

- **Found during:** Task 2 lint verification
- **Issue:** Inline `toEqual({ timestamp: "...", apy: 5.0 })` violated Prettier's line length rule.
- **Fix:** Reformatted to multi-line object.
- **Files modified:** `src/infra/repositories/http-repository/pool/__tests__/pool-adapter.test.ts`
- **Commit:** ad92c02

## Decisions Made

1. **`cutoff = new Date()` inside function body** — ensures the cutoff date is computed at call time, not at module load time. This is critical for `jest.useFakeTimers()` to work correctly in tests.
2. **Type predicate for null guard** — `(dto): dto is DefiLlamaApyDataPointDTO & { apy: number }` satisfies TypeScript strict null checks, allowing `.apy` to be used as `number` after the filter.
3. **Task 3 merged into Task 1** — Mock factory updates were performed in Task 1 to resolve type errors discovered during type checking, rather than waiting for the designated Task 3 step.

## Known Stubs

None — all contracts defined, adapter function fully implemented and tested.

## Self-Check: PASSED
