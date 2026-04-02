# Phase 1: Infrastructure - Research

**Researched:** 2026-04-01
**Domain:** Clean Architecture extension — domain entity, repository method, DTO adapter, use-case hook
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Domain entity `ApyDataPoint` keeps only `timestamp: string` and `apy: number`. Adapter discards `tvlUsd`, `apyBase`, `apyReward`, `il7d`, `apyBase7d`.
- **D-02:** If v2 needs TVL or APY breakdown, add fields then — don't over-fetch now.
- **D-03:** Reuse the existing `defiLlamaHttpClient` (same base URL `yields.llama.fi`). No new HTTP client or env var needed.
- **D-04:** Chart endpoint: `GET /chart/{poolId}` on the existing base URL.
- **D-05:** Use standard `useAppQuery` (NOT Suspense) for APY history. Chart failures must not block pool info display.
- **D-06:** Create `usePoolApyHistory(poolId)` hook following the same pattern as `usePoolFindAll` but with `useAppQuery`.
- **D-07:** `staleTime: 5 * 60 * 1000` (5 minutes) for APY history queries.

### Claude's Discretion

- Query key structure for APY history (e.g., `["pools", poolId, "apy-history"]` or similar)
- 30-day filtering logic in the adapter (Date comparison approach)
- Error types and handling in the repository method

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFR-01 | `findApyHistory(poolId)` method added to PoolRepo interface | Pattern: extend `PoolRepo` interface in `pool-repo.ts`, add return type `Promise<ApyDataPoint[]>` |
| INFR-02 | DefiLlama chart API integrated (`GET /chart/{pool}`) | Confirmed: `GET /chart/{poolId}` on `yields.llama.fi`, reuse `defiLlamaHttpClient` |
| INFR-03 | API response filtered to last 30 days in adapter layer | Pattern: Date arithmetic in adapter; API returns 1000+ daily ISO 8601 points sorted ascending |
| INFR-04 | Loading state shown while chart data fetches | `useAppQuery` returns `isPending` / `isLoading` — consume in hook caller |
| INFR-05 | Error state shown if chart API call fails | `useAppQuery` returns `error` — React Query propagates without ErrorBoundary throw |
</phase_requirements>

---

## Summary

This phase extends the existing Clean Architecture stack with a single data pipeline: a new domain entity (`ApyDataPoint`), a new method on `PoolRepo` (`findApyHistory`), a concrete implementation in `HttpPoolRepo` that calls the DefiLlama `/chart/{poolId}` endpoint, a DTO + adapter pair that filters to the last 30 days, and a `usePoolApyHistory` use-case hook.

All five deliverables follow patterns already established in the codebase. No new libraries, HTTP clients, or DI wiring are required. The primary decision areas are the query key structure and the 30-day filtering logic in the adapter. Both are Claude's discretion per CONTEXT.md.

The DefiLlama chart endpoint is confirmed live and returns daily data points in ISO 8601 format (`"2022-05-03T00:00:00.000Z"`) sorted chronologically ascending, with 700–1000+ points per pool. Filtering to the last 30 days is a simple tail-slice by timestamp comparison.

**Primary recommendation:** Follow the existing `pool-adapter.ts` / `http-pool-repo.ts` / `use-pool-find-all.ts` patterns exactly — this phase is an additive extension, not a redesign.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tanstack/react-query` | ^5.90.10 | Caching, loading/error state for `usePoolApyHistory` | Already used project-wide via `useAppQuery` |
| `axios` | ^1.13.2 | HTTP calls via `defiLlamaHttpClient` | Already configured, same base URL |
| TypeScript | ~5.9.2 | Strict types for entity, DTO, adapter | Project-wide standard |

No new packages are needed for this phase.

**Version verification:** All packages are already installed and locked in `bun.lock`.

---

## Architecture Patterns

### Recommended File Additions

```
src/
├── domain/
│   └── pool/
│       ├── apy-data-point.ts          # New: ApyDataPoint entity
│       ├── pool-repo.ts               # Modified: add findApyHistory method
│       └── use-cases/
│           └── use-pool-apy-history.ts  # New: usePoolApyHistory hook
└── infra/
    └── repositories/
        └── http-repository/
            └── pool/
                ├── pool-dto.ts          # Modified: add chart DTO types
                ├── pool-adapter.ts      # Modified: add chart adapter function
                ├── http-pool-repo.ts    # Modified: add findApyHistory method
                └── __tests__/
                    ├── http-pool-repo.test.ts     # Modified: add findApyHistory tests
                    ├── pool-adapter.test.ts        # Modified: add chart adapter tests
                    └── use-pool-apy-history.test.tsx  # New: hook test
```

### Pattern 1: Domain Entity Definition

The `ApyDataPoint` entity follows the same minimal interface pattern as `Pool`:

```typescript
// src/domain/pool/apy-data-point.ts
// Source: mirrors src/domain/pool/pool.ts pattern
export interface ApyDataPoint {
  timestamp: string;
  apy: number;
}
```

### Pattern 2: Repository Interface Extension

`PoolRepo` is extended by adding the new method — existing consumers are unaffected because TypeScript interfaces are additive for new methods:

```typescript
// src/domain/pool/pool-repo.ts
import { Pool } from "./pool";
import { ApyDataPoint } from "./apy-data-point";

export interface PoolRepo {
  findAll: () => Promise<Pool[]>;
  findApyHistory: (poolId: string) => Promise<ApyDataPoint[]>;
}
```

**Important:** Adding a method to `PoolRepo` means `HttpPoolRepo` must implement it (TypeScript will error until it does). The `createMockPoolRepo` factory in tests must also add `findApyHistory: jest.fn()`.

### Pattern 3: DTO Definition

New chart-specific DTOs added to `pool-dto.ts` — the existing pool DTOs remain unchanged:

```typescript
// Additions to src/infra/repositories/http-repository/pool/pool-dto.ts
export interface DefiLlamaApyDataPointDTO {
  timestamp: string;   // ISO 8601: "2022-05-03T00:00:00.000Z"
  tvlUsd: number;
  apy: number;
  apyBase: number | null;
  apyReward: number | null;
  il7d: number | null;
  apyBase7d: number | null;
}

export interface DefiLlamaGetChartResponseDTO {
  status: string;
  data: DefiLlamaApyDataPointDTO[];
}
```

### Pattern 4: Adapter with 30-Day Filter

The adapter maps the full DTO array to `ApyDataPoint[]`, filtering to the last 30 days. Data arrives sorted ascending by timestamp (oldest first), so filtering is a trailing slice:

```typescript
// Addition to src/infra/repositories/http-repository/pool/pool-adapter.ts
// Source: mirrors defiLlamaPoolDTOToPool pattern
import { ApyDataPoint } from "@/domain/pool/apy-data-point";
import { DefiLlamaApyDataPointDTO } from "./pool-dto";

export function defiLlamaChartDTOToApyHistory(
  dtos: DefiLlamaApyDataPointDTO[],
): ApyDataPoint[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  return dtos
    .filter((dto) => new Date(dto.timestamp) >= cutoff)
    .map((dto) => ({
      timestamp: dto.timestamp,
      apy: dto.apy,
    }));
}
```

**Note:** `new Date(dto.timestamp)` is safe for ISO 8601 strings — confirmed format from live API.

### Pattern 5: Repository Method Implementation

```typescript
// Addition to src/infra/repositories/http-repository/pool/http-pool-repo.ts
async findApyHistory(poolId: string): Promise<ApyDataPoint[]> {
  const response =
    await this.httpClient.get<DefiLlamaGetChartResponseDTO>(`/chart/${poolId}`);

  return defiLlamaChartDTOToApyHistory(response.data.data);
}
```

### Pattern 6: Use-Case Hook

Follows `usePoolFindAll` exactly, adding `staleTime` via the `options` passthrough:

```typescript
// src/domain/pool/use-cases/use-pool-apy-history.ts
// Source: mirrors src/domain/pool/use-cases/use-pool-find-all.ts
import { useRepository } from "@/infra/repositories/repository-provider";
import { useAppQuery } from "@/infra/use-cases/use-app-query";

export function usePoolApyHistory(poolId: string) {
  const { poolRepo } = useRepository();

  return useAppQuery({
    queryKey: ["pools", poolId, "apy-history"],
    fetchData: () => poolRepo.findApyHistory(poolId),
    options: {
      staleTime: 5 * 60 * 1000,
    },
  });
}
```

**Query key rationale:** `["pools", poolId, "apy-history"]` nests under the pool's namespace, enabling future cache invalidation by poolId if needed.

### Anti-Patterns to Avoid

- **Don't add `findApyHistory` directly to `usePoolFindAll`:** Keeps queries independent; chart failure must not block pool info.
- **Don't use `useAppSuspenseQuery`:** D-05 explicitly requires standard `useAppQuery` so error is returned via `error` property, not thrown to ErrorBoundary.
- **Don't filter in the repository:** Filtering belongs in the adapter layer — consistent with how `defiLlamaPoolDTOToPool` handles data transformation.
- **Don't add TVL/breakdown fields to `ApyDataPoint`:** D-02 defers this to v2.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loading/error state management | Custom state machine | `useAppQuery` (React Query) | Handles caching, background refetch, deduplication |
| HTTP timeout/retry logic | Custom fetch wrapper | `defiLlamaHttpClient` (axios with `timeout: 15000`) | Already configured |
| Date arithmetic for 30-day filter | Complex calendar logic | `new Date()` + `setDate(getDate() - 30)` | Standard JS Date API is sufficient for daily-granularity filtering |

**Key insight:** Every pattern in this phase is an additive extension of existing infrastructure. The codebase already solves HTTP, caching, DI, and error propagation — this phase wires a new data path through existing abstractions.

---

## Common Pitfalls

### Pitfall 1: PoolRepo Interface Change Breaks Mock Factories

**What goes wrong:** Adding `findApyHistory` to `PoolRepo` makes TypeScript complain about every `createMockPoolRepo` factory that only has `findAll`. The test for `usePoolFindAll` and the suspense variant will fail to compile.

**Why it happens:** TypeScript enforces that objects implementing an interface must satisfy all methods.

**How to avoid:** Update the `createMockPoolRepo` factory in `use-pool-find-all.test.tsx` and `use-pool-find-all-suspense.test.tsx` to add `findApyHistory: jest.fn()`.

**Warning signs:** TypeScript error "Property 'findApyHistory' is missing in type..."

### Pitfall 2: 30-Day Cutoff Is Evaluated at Query Time, Not Module Load

**What goes wrong:** If the cutoff `new Date()` is called outside the adapter function body (e.g., as a module-level constant), it gets frozen at app start time and drift over hours.

**Why it happens:** Module-level constants are evaluated once.

**How to avoid:** Always compute `new Date()` inside `defiLlamaChartDTOToApyHistory` so it's evaluated at call time.

### Pitfall 3: Adapter Tests Need a Fixed "Now" Reference

**What goes wrong:** Tests that check 30-day filtering against `new Date()` are time-dependent and flaky (a point 29.9 days ago might cross the boundary between test runs).

**Why it happens:** The filter uses wall clock time.

**How to avoid:** In adapter tests, construct timestamps relative to the test's explicit "now" using `jest.useFakeTimers()` / `jest.setSystemTime()`, or generate test data with offsets (e.g., `now - 10 days` should pass, `now - 31 days` should fail).

### Pitfall 4: `null` apy Values in DefiLlama Response

**What goes wrong:** Older or newly-added pools occasionally have `apy: null` in some data points. TypeScript's strict mode will surface this if the DTO types `apy` as `number` — the adapter `map` would return `{ apy: null }` violating `ApyDataPoint.apy: number`.

**Why it happens:** DefiLlama returns null for computed fields when insufficient data exists.

**How to avoid:** Either type `apy` as `number | null` in the DTO and handle in the adapter (filter out nulls), or assert that live data is always non-null. The live API call above showed numeric values — but defensive handling is safer.

**Recommendation:** Filter out data points where `apy` is null in the adapter.

### Pitfall 5: `HttpPoolRepo` Must Satisfy Updated `PoolRepo` Contract at Compile Time

**What goes wrong:** The class won't compile until `findApyHistory` is implemented. If the class is modified in one file but tests run against a cached build, you get false-positive passes.

**Why it happens:** TypeScript enforces interface compliance at compile time.

**How to avoid:** Run `bun run types` after adding the method to the interface to confirm no compile errors before running tests.

---

## Code Examples

### 30-Day Filter with Null Guard

```typescript
// Source: derived from live API response shape (confirmed 2026-04-01)
export function defiLlamaChartDTOToApyHistory(
  dtos: DefiLlamaApyDataPointDTO[],
): ApyDataPoint[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  return dtos
    .filter(
      (dto): dto is DefiLlamaApyDataPointDTO & { apy: number } =>
        dto.apy !== null && new Date(dto.timestamp) >= cutoff,
    )
    .map((dto) => ({
      timestamp: dto.timestamp,
      apy: dto.apy,
    }));
}
```

### Test Setup for Hook with staleTime

```typescript
// Source: mirrors src/domain/pool/use-cases/__tests__/use-pool-find-all.test.tsx
const createMockPoolRepo = (overrides?: Partial<PoolRepo>): PoolRepo => ({
  findAll: jest.fn(),
  findApyHistory: jest.fn(),
  ...overrides,
});

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  });
```

**Note:** `staleTime: 0` in the test QueryClient overrides the hook's `staleTime: 5 * 60 * 1000` — this ensures test isolation so data is always considered stale in tests.

### Adapter Test with Fixed Time

```typescript
// Source: pattern from jest docs
describe("defiLlamaChartDTOToApyHistory", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-30T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should include data points within the last 30 days", () => {
    const dto = { timestamp: "2024-01-15T00:00:00.000Z", apy: 5.0, ... };
    // 2024-01-15 is 15 days before 2024-01-30 — should be included
    expect(defiLlamaChartDTOToApyHistory([dto])).toHaveLength(1);
  });

  it("should exclude data points older than 30 days", () => {
    const dto = { timestamp: "2023-12-01T00:00:00.000Z", apy: 5.0, ... };
    // 2023-12-01 is >30 days before 2024-01-30 — should be excluded
    expect(defiLlamaChartDTOToApyHistory([dto])).toHaveLength(0);
  });
});
```

---

## Environment Availability

Step 2.6: SKIPPED — this phase makes no changes to external dependencies. It reuses existing `defiLlamaHttpClient` and installed packages. No new CLI tools, services, or runtimes are required.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 with jest-expo preset |
| Config file | `jest.config.js` |
| Quick run command | `bun run test --testPathPattern="pool"` |
| Full suite command | `bun run test` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFR-01 | `PoolRepo` interface has `findApyHistory` method | unit (type check) | `bun run types` | ❌ Wave 0 (interface modified) |
| INFR-02 | `HttpPoolRepo.findApyHistory` calls `GET /chart/{poolId}` | unit | `bun run test --testPathPattern="http-pool-repo"` | ❌ Wave 0 (test added) |
| INFR-03 | Adapter filters data to last 30 days | unit | `bun run test --testPathPattern="pool-adapter"` | ❌ Wave 0 (test added) |
| INFR-04 | `usePoolApyHistory` exposes `isPending` / `isLoading` | unit | `bun run test --testPathPattern="use-pool-apy-history"` | ❌ Wave 0 (new file) |
| INFR-05 | `usePoolApyHistory` exposes `error` when API call fails | unit | `bun run test --testPathPattern="use-pool-apy-history"` | ❌ Wave 0 (new file) |

### Sampling Rate

- **Per task commit:** `bun run test --testPathPattern="pool"`
- **Per wave merge:** `bun run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/infra/repositories/http-repository/pool/__tests__/http-pool-repo.test.ts` — add `findApyHistory` tests (INFR-02)
- [ ] `src/infra/repositories/http-repository/pool/__tests__/pool-adapter.test.ts` — add chart adapter tests with fake timers (INFR-03)
- [ ] `src/domain/pool/use-cases/__tests__/use-pool-apy-history.test.tsx` — new file covering INFR-04 and INFR-05

Existing files `use-pool-find-all.test.tsx` and `use-pool-find-all-suspense.test.tsx` require modification to add `findApyHistory: jest.fn()` to mock factory after INFR-01 lands.

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on This Phase |
|-----------|----------------------|
| File naming: kebab-case | `apy-data-point.ts`, `use-pool-apy-history.ts` |
| Components: function declarations with named exports | Hook: `export function usePoolApyHistory(...)` |
| Hooks: camelCase with `use` prefix | `usePoolApyHistory` |
| Tests co-located in `__tests__/` | New test file in `src/domain/pool/use-cases/__tests__/` |
| Use `useAppQuery` wrapper, never raw `useQuery` | Use `useAppQuery` per D-05 and D-06 |
| Package manager: Bun | `bun run test`, not `npm test` |
| Conventional commits | `feat(infra): add findApyHistory to PoolRepo` |
| Sibling JSX elements separated by blank line | Not applicable — this phase has no JSX |
| Default exports only for expo-router screen entry points | Hook and entity use named exports |

---

## Sources

### Primary (HIGH confidence)

- Live API call to `yields.llama.fi/chart/{pool}` — confirmed response shape, ISO 8601 timestamps, field names (2026-04-01)
- `src/infra/repositories/http-repository/pool/http-pool-repo.ts` — exact pattern for new repo method
- `src/domain/pool/use-cases/use-pool-find-all.ts` — exact pattern for new use-case hook
- `src/infra/use-cases/use-app-query.ts` — confirmed `options` passthrough supports `staleTime`
- `src/domain/pool/use-cases/__tests__/use-pool-find-all.test.tsx` — confirmed test factory pattern

### Secondary (MEDIUM confidence)

- DefiLlama API Docs (https://api-docs.defillama.com/) — endpoint path and general structure

### Tertiary (LOW confidence)

None.

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — no new packages, all existing
- Architecture: HIGH — exact file patterns read from codebase
- API shape: HIGH — verified via live API call
- Pitfalls: HIGH — derived from TypeScript mechanics and test patterns in codebase
- 30-day filter: HIGH — standard Date API, confirmed daily ISO 8601 timestamps

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (DefiLlama API is stable; stack dependencies are locked)
