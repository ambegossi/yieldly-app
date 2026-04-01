# Phase 1: Infrastructure - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend the domain layer with an `ApyDataPoint` entity and `findApyHistory` method on `PoolRepo`. Implement the DefiLlama chart API call in `HttpPoolRepo`, with a DTO adapter that filters to the last 30 days. Create a `usePoolApyHistory` use case hook using standard (non-Suspense) React Query. This phase does NOT build any UI — it delivers the data pipeline that Phase 2 and 3 will consume.

</domain>

<decisions>
## Implementation Decisions

### APY History Data Shape
- **D-01:** Domain entity `ApyDataPoint` keeps only `timestamp: string` and `apy: number` — minimal shape. The adapter discards `tvlUsd`, `apyBase`, `apyReward`, `il7d`, `apyBase7d` from the API response.
- **D-02:** If v2 needs TVL or APY breakdown, add fields to the entity then — don't over-fetch now.

### Chart API Integration
- **D-03:** Reuse the existing `defiLlamaHttpClient` (same base URL `yields.llama.fi`). No new HTTP client or env var needed.
- **D-04:** Chart endpoint: `GET /chart/{poolId}` on the existing base URL.

### Loading/Error Strategy
- **D-05:** Use standard `useAppQuery` (NOT Suspense) for APY history. The chart has its own loading/error states inside the card — a chart failure should not block the pool info display.
- **D-06:** Create `usePoolApyHistory(poolId)` hook following the same pattern as `usePoolFindAll` but with `useAppQuery` instead of `useAppSuspenseQuery`.

### Caching
- **D-07:** `staleTime: 5 * 60 * 1000` (5 minutes) for APY history queries. Data is daily granularity, so 5 minutes prevents unnecessary refetches during back/forth navigation.

### Claude's Discretion
- Query key structure for APY history (e.g., `["pools", poolId, "apy-history"]` or similar)
- 30-day filtering logic in the adapter (Date comparison approach)
- Error types and handling in the repository method

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Domain Layer
- `src/domain/pool/pool.ts` — Existing Pool entity (pattern to follow for ApyDataPoint)
- `src/domain/pool/pool-repo.ts` — PoolRepo interface to extend with `findApyHistory`
- `src/domain/repositories.ts` — Repositories interface (no changes needed, PoolRepo already registered)

### Infrastructure Layer
- `src/infra/repositories/http-repository/pool/http-pool-repo.ts` — Existing HttpPoolRepo class to extend
- `src/infra/repositories/http-repository/pool/pool-dto.ts` — DTO pattern to follow
- `src/infra/repositories/http-repository/pool/pool-adapter.ts` — Adapter pattern to follow
- `src/infra/http/clients/defi-llama-http-client.ts` — HTTP client to reuse (same base URL)

### Use Cases
- `src/infra/use-cases/use-app-query.ts` — Query wrapper to use (NOT suspense variant)
- `src/domain/pool/use-cases/use-pool-find-all.ts` — Pattern to follow for `usePoolApyHistory`

### Tests
- `src/infra/repositories/http-repository/pool/__tests__/http-pool-repo.test.ts` — Test pattern for repo
- `src/infra/repositories/http-repository/pool/__tests__/pool-adapter.test.ts` — Test pattern for adapter

### API Reference
- DefiLlama `GET /chart/{pool}` — returns `{ status: string, data: [{ timestamp, apy, tvlUsd, apyBase, apyReward, il7d, apyBase7d }] }`
- Returns ALL history (1000+ points) — adapter must filter to last 30 days

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HttpClient` (axios wrapper) — used by `HttpPoolRepo`, reuse for chart endpoint
- `useAppQuery` — standard React Query wrapper, use for APY history hook
- `defiLlamaHttpClient` — pre-configured axios instance with base URL and timeout

### Established Patterns
- **DTO → Adapter → Entity**: `pool-dto.ts` defines API shape, `pool-adapter.ts` transforms to domain entity
- **Repo implements interface**: `HttpPoolRepo implements PoolRepo`, add new method here
- **Use case hooks**: thin wrappers that call `useAppQuery`/`useAppSuspenseQuery` with repository methods
- **Test co-location**: `__tests__/` directory next to source files

### Integration Points
- `PoolRepo` interface is the contract — extending it automatically flows through DI
- `HttpPoolRepo` constructor already receives `httpClient` — no new DI wiring needed
- `useRepository()` hook already exposes `poolRepo` — consumers just call the new method

</code_context>

<specifics>
## Specific Ideas

No specific requirements — follows established codebase patterns closely.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-infrastructure*
*Context gathered: 2026-04-01*
