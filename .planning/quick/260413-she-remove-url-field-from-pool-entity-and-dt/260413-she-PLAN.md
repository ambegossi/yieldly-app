---
phase: quick
plan: 260413-she
type: execute
wave: 1
depends_on: []
files_modified:
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
autonomous: true
must_haves:
  truths:
    - "Pool entity no longer has a url field"
    - "DefiLlamaPoolDTO no longer has a url field"
    - "Open pool button opens https://defillama.com/yields/pool/{pool.id} in browser"
    - "No references to pool.url or dto.url remain in src/"
    - "All tests pass with bun run test"
    - "TypeScript compiles cleanly with bun run types"
  artifacts:
    - path: "src/domain/pool/pool.ts"
      provides: "Pool entity without url field"
      contains: "id: string"
    - path: "src/screens/pool-details/index.tsx"
      provides: "Pool details screen using constructed DefiLlama URL"
      contains: "defillama.com/yields/pool"
  key_links:
    - from: "src/screens/pool-details/index.tsx"
      to: "expo-web-browser"
      via: "openBrowserAsync with constructed URL"
      pattern: "defillama\\.com/yields/pool/.*pool\\.id"
---

<objective>
Remove the `url` field from the `Pool` domain entity and `DefiLlamaPoolDTO`. Replace the pool details screen's direct use of `pool.url` with a constructed DefiLlama URL (`https://defillama.com/yields/pool/${pool.id}`). Remove `url` from the route params. Update all affected tests.

Purpose: The `url` field is unnecessary data to carry through the domain since the URL can be deterministically constructed from the pool's `id`. This simplifies the domain entity and removes a field from route params.
Output: Cleaned domain model, updated screen, passing tests.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/domain/pool/pool.ts
@src/infra/repositories/http-repository/pool/pool-dto.ts
@src/infra/repositories/http-repository/pool/pool-adapter.ts
@src/screens/pool-details/index.tsx
@src/app/pool-details.tsx
@src/screens/home/index.tsx

<interfaces>
<!-- Current Pool entity (url field to be removed): -->
From src/domain/pool/pool.ts:
```typescript
export interface Pool {
  id: string;
  chain: string;
  project: string;
  symbol: string;
  apy: number;
  url: string;  // REMOVE THIS
}
```

From src/infra/repositories/http-repository/pool/pool-dto.ts:
```typescript
export interface DefiLlamaPoolDTO {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  apy: number;
  url: string;  // REMOVE THIS
}
```

From src/infra/repositories/http-repository/pool/pool-adapter.ts:
```typescript
export function defiLlamaPoolDTOToPool(dto: DefiLlamaPoolDTO): Pool {
  return {
    id: dto.pool,
    chain: dto.chain,
    project: dto.project,
    symbol: dto.symbol,
    apy: dto.apy,
    url: dto.url,  // REMOVE THIS LINE
  };
}
```

From src/screens/pool-details/index.tsx:
```typescript
// Currently uses pool.url directly:
const handleOpenPool = useCallback(async () => {
  await WebBrowser.openBrowserAsync(pool.url);
}, [pool.url]);
// Change to construct URL: `https://defillama.com/yields/pool/${pool.id}`
```

From src/app/pool-details.tsx:
```typescript
// Route params include url — remove it:
const params = useLocalSearchParams<{
  id: string;
  chain: string;
  project: string;
  symbol: string;
  apy: string;
  url: string;  // REMOVE THIS
}>();
// Pool construction includes url — remove it:
const pool: Pool = {
  ...
  url: params.url ?? "",  // REMOVE THIS LINE
};
```

From src/screens/home/index.tsx (line 69):
```typescript
// Navigation params include url — remove it:
params: {
  ...
  url: pool.url,  // REMOVE THIS LINE
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove url from domain entity, DTO, adapter, and route wiring</name>
  <files>
    src/domain/pool/pool.ts,
    src/infra/repositories/http-repository/pool/pool-dto.ts,
    src/infra/repositories/http-repository/pool/pool-adapter.ts,
    src/app/pool-details.tsx,
    src/screens/home/index.tsx,
    src/screens/pool-details/index.tsx
  </files>
  <action>
    1. **src/domain/pool/pool.ts** — Remove the `url: string;` line from the `Pool` interface. Keep all other fields unchanged.

    2. **src/infra/repositories/http-repository/pool/pool-dto.ts** — Remove the `url: string;` line from the `DefiLlamaPoolDTO` interface. Keep all other interfaces unchanged.

    3. **src/infra/repositories/http-repository/pool/pool-adapter.ts** — Remove the `url: dto.url,` line from the return object in `defiLlamaPoolDTOToPool`. Keep the import and all other mapping unchanged.

    4. **src/screens/pool-details/index.tsx** — Change `handleOpenPool` to construct the URL from pool.id:
       ```typescript
       const handleOpenPool = useCallback(async () => {
         await WebBrowser.openBrowserAsync(
           `https://defillama.com/yields/pool/${pool.id}`,
         );
       }, [pool.id]);
       ```
       No other changes needed. The `Pool` type import and `expo-web-browser` import stay.

    5. **src/app/pool-details.tsx** — Remove `url: string;` from the `useLocalSearchParams` generic type. Remove `url: params.url ?? "",` from the pool construction object.

    6. **src/screens/home/index.tsx** — Remove `url: pool.url,` from the `router.push` params object (around line 69).
  </action>
  <verify>
    <automated>cd /Users/ambegossi/yieldly/yieldly-app && bun run types</automated>
  </verify>
  <done>Pool entity and DTO no longer have url field. Adapter no longer maps url. Pool details screen constructs DefiLlama URL from pool.id. Route no longer passes url param. TypeScript compiles cleanly.</done>
</task>

<task type="auto">
  <name>Task 2: Update all tests to remove url references</name>
  <files>
    src/infra/repositories/http-repository/pool/__tests__/pool-adapter.test.ts,
    src/infra/repositories/http-repository/pool/__tests__/http-pool-repo.test.ts,
    src/domain/pool/use-cases/__tests__/use-pool-find-all.test.tsx,
    src/domain/pool/use-cases/__tests__/use-pool-find-all-suspense.test.tsx,
    src/screens/pool-details/__tests__/pool-details-screen.test.tsx,
    src/screens/home/__tests__/home.integration.test.tsx,
    src/screens/home/hooks/__tests__/use-infinite-scroll.test.ts,
    src/screens/home/hooks/__tests__/use-numbered-pagination.test.ts,
    src/screens/home/hooks/__tests__/use-filtered-pools.test.ts,
    src/screens/home/components/__tests__/pool-list-item.test.tsx
  </files>
  <action>
    Remove every `url: "..."` property from mock Pool objects and mock DTO objects across all test files. Specific changes:

    1. **pool-adapter.test.ts** — Remove `url` from all `DefiLlamaPoolDTO` mock objects (3 instances) and from the `toEqual` assertion object. Remove `expect(result.url).toBe(dto.url);` from the "preserve all other fields" test.

    2. **http-pool-repo.test.ts** — Remove `url` from all mock DTO data objects (2 instances in the response mock) and from the `toEqual` assertion objects (2 instances).

    3. **use-pool-find-all.test.tsx** — Remove `url` from all mock Pool objects (3 instances across the file).

    4. **use-pool-find-all-suspense.test.tsx** — Remove `url` from all mock Pool objects (3 instances).

    5. **pool-details-screen.test.tsx** — Remove `url: "https://aave.com"` from the `testPool` object. Update the "pressing CTA button calls openBrowserAsync" test to assert `openBrowserAsync` was called with `"https://defillama.com/yields/pool/abc-123"` instead of `"https://aave.com"`.

    6. **home.integration.test.tsx** — Remove `url` from all mock Pool objects (many instances throughout).

    7. **use-infinite-scroll.test.ts** — Remove the `url` line from the pool factory function.

    8. **use-numbered-pagination.test.ts** — Remove the `url` line from the pool factory function.

    9. **use-filtered-pools.test.ts** — Remove `url` from all mock Pool objects (many instances throughout).

    10. **pool-list-item.test.tsx** — Remove `url` from the mock pool object.

    After all edits, run a grep across `src/` for `pool\.url` and `"url"` in test pool/DTO objects to confirm no references remain (except `HttpClient` method signatures which use `url` as a parameter name, and CSS/config unrelated references).
  </action>
  <verify>
    <automated>cd /Users/ambegossi/yieldly/yieldly-app && bun run test 2>&1 | tail -20 && bun run types && bun run lint 2>&1 | tail -10</automated>
  </verify>
  <done>All tests pass. No remaining references to pool.url or dto.url in src/. TypeScript compiles. Lint passes. The grep for `\.url` in domain/screen/infra code returns zero hits (HttpClient parameter names excluded).</done>
</task>

</tasks>

<verification>
After both tasks complete:

1. `bun run types` — zero errors
2. `bun run test` — all test suites pass
3. `bun run lint` — no new lint errors
4. Grep confirmation: `grep -rn "\.url" src/domain/ src/screens/ src/infra/repositories/http-repository/pool/pool-adapter.ts src/infra/repositories/http-repository/pool/pool-dto.ts` returns no hits for pool.url or dto.url (HttpClient url param is fine)
</verification>

<success_criteria>
- Pool interface has exactly 5 fields: id, chain, project, symbol, apy (no url)
- DefiLlamaPoolDTO has exactly 5 fields: pool, chain, project, symbol, apy (no url)
- Pool details "Open pool" button opens `https://defillama.com/yields/pool/{pool.id}`
- Route params no longer include url
- All existing tests updated and passing
- Zero TypeScript errors, zero lint errors
</success_criteria>

<output>
After completion, create `.planning/quick/260413-she-remove-url-field-from-pool-entity-and-dt/260413-she-SUMMARY.md`
</output>
