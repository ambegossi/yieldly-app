---
phase: quick
plan: 260413-she
subsystem: domain-model
tags: [refactor, domain, cleanup, pool-entity]
dependency_graph:
  requires: []
  provides: [clean-pool-entity-without-url]
  affects: [pool-details-screen, home-screen, pool-adapter, pool-dto]
tech_stack:
  added: []
  patterns: [deterministic-url-construction]
key_files:
  modified:
    - src/domain/pool/pool.ts
    - src/infra/repositories/http-repository/pool/pool-dto.ts
    - src/infra/repositories/http-repository/pool/pool-adapter.ts
    - src/screens/pool-details/index.tsx
    - src/app/pool-details.tsx
    - src/screens/home/index.tsx
    - src/infra/repositories/http-repository/pool/__tests__/pool-adapter.test.ts
    - src/infra/repositories/http-repository/pool/__tests__/http-pool-repo.test.ts
    - src/domain/pool/use-cases/__tests__/use-pool-find-all.test.tsx
    - src/domain/pool/use-cases/__tests__/use-pool-find-all-suspense.test.tsx
    - src/screens/pool-details/__tests__/pool-details-screen.test.tsx
    - src/screens/home/__tests__/home.integration.test.tsx
    - src/screens/home/hooks/__tests__/use-infinite-scroll.test.ts
    - src/screens/home/hooks/__tests__/use-numbered-pagination.test.ts
    - src/screens/home/hooks/__tests__/use-filtered-pools.test.ts
    - src/screens/home/components/__tests__/pool-list-item.test.tsx
decisions:
  - "Construct DefiLlama pool URL from pool.id using https://defillama.com/yields/pool/{id} pattern instead of carrying url through domain"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-13T23:36:00Z"
  tasks_completed: 2
  files_modified: 16
---

# Quick Task 260413-she: Remove url Field from Pool Entity and DTO Summary

**One-liner:** Removed `url` field from Pool domain entity and DefiLlamaPoolDTO, replacing direct `pool.url` usage in the pool details CTA with a deterministically constructed DefiLlama URL (`https://defillama.com/yields/pool/${pool.id}`).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Remove url from domain entity, DTO, adapter, and route wiring | dcd6bae | pool.ts, pool-dto.ts, pool-adapter.ts, pool-details/index.tsx, app/pool-details.tsx, home/index.tsx |
| 2 | Update all tests to remove url references | dc2328d | 10 test files |

## Changes Made

### Task 1: Domain and Presentation Layer

- **`src/domain/pool/pool.ts`** — Removed `url: string` from `Pool` interface. Interface now has 5 fields: `id`, `chain`, `project`, `symbol`, `apy`.
- **`src/infra/repositories/http-repository/pool/pool-dto.ts`** — Removed `url: string` from `DefiLlamaPoolDTO`. DTO now has 5 fields: `pool`, `chain`, `project`, `symbol`, `apy`.
- **`src/infra/repositories/http-repository/pool/pool-adapter.ts`** — Removed `url: dto.url` mapping line from `defiLlamaPoolDTOToPool`.
- **`src/screens/pool-details/index.tsx`** — Updated `handleOpenPool` to construct URL: `https://defillama.com/yields/pool/${pool.id}` instead of using `pool.url`. Updated `useCallback` dependency from `pool.url` to `pool.id`.
- **`src/app/pool-details.tsx`** — Removed `url: string` from `useLocalSearchParams` generic type and removed `url: params.url ?? ""` from pool construction object.
- **`src/screens/home/index.tsx`** — Removed `url: pool.url` from `router.push` params in `handlePoolPress`.

### Task 2: Test Updates

Removed all `url` field references from mock Pool and DTO objects across 10 test files. Updated pool-details-screen test to assert `openBrowserAsync` was called with the constructed DefiLlama URL (`https://defillama.com/yields/pool/abc-123`) instead of the old `https://aave.com`.

## Verification Results

- `bun run types`: 0 errors
- `bun run test`: 214 tests passed, 31 suites
- `bun run lint`: 0 errors (16 pre-existing warnings about `require()` in jest.mock callbacks — unavoidable pattern)
- Grep for `pool\.url`, `dto\.url`, `params\.url` in `src/`: zero hits

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `src/domain/pool/pool.ts` — FOUND, contains 5 fields (no url)
- `src/screens/pool-details/index.tsx` — FOUND, contains `defillama.com/yields/pool`
- Commit dcd6bae — FOUND
- Commit dc2328d — FOUND
