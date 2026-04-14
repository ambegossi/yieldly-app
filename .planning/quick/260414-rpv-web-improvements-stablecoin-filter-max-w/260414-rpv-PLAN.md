---
phase: quick
plan: 260414-rpv
type: execute
wave: 1
depends_on: []
files_modified:
  - src/domain/pool/stablecoin-symbols.ts
  - src/infra/repositories/http-repository/pool/pool-dto.ts
  - src/infra/repositories/http-repository/pool/http-pool-repo.ts
  - src/infra/repositories/http-repository/pool/__tests__/http-pool-repo.test.ts
  - src/screens/home/index.tsx
  - src/screens/home/components/pagination-controls.tsx
autonomous: true
must_haves:
  truths:
    - "Only pools containing well-known stablecoin symbols appear in the listing"
    - "Content does not stretch beyond max-w-7xl on large monitors"
    - "Pagination controls scroll with the list content as a footer"
    - "Active page button renders with brand green background instead of near-black"
  artifacts:
    - path: "src/domain/pool/stablecoin-symbols.ts"
      provides: "Well-known stablecoin symbols constant array"
      contains: "STABLECOIN_SYMBOLS"
    - path: "src/infra/repositories/http-repository/pool/pool-dto.ts"
      provides: "stablecoin boolean field on DefiLlamaPoolDTO"
      contains: "stablecoin: boolean"
    - path: "src/infra/repositories/http-repository/pool/http-pool-repo.ts"
      provides: "Stablecoin filtering logic in findAll()"
      contains: "STABLECOIN_SYMBOLS"
  key_links:
    - from: "src/infra/repositories/http-repository/pool/http-pool-repo.ts"
      to: "src/domain/pool/stablecoin-symbols.ts"
      via: "import STABLECOIN_SYMBOLS"
      pattern: "import.*STABLECOIN_SYMBOLS.*from"
---

<objective>
Four web improvements to the Yieldly home screen: filter API results to well-known stablecoins, limit content max-width, move pagination into list footer, and fix active page button color.

Purpose: Improve data quality (stablecoin filter), visual polish on wide screens (max-width), UX (pagination scrolls with content), and brand consistency (green active page).
Output: Updated pool filtering, home screen layout, and pagination styling.
</objective>

<execution_context>
@.planning/quick/260414-rpv-web-improvements-stablecoin-filter-max-w/260414-rpv-PLAN.md
</execution_context>

<context>
@CLAUDE.md

<interfaces>
<!-- Key types and contracts the executor needs -->

From src/infra/repositories/http-repository/pool/pool-dto.ts:
```typescript
export interface DefiLlamaPoolDTO {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  apy: number;
}
```

From src/infra/repositories/http-repository/pool/http-pool-repo.ts:
```typescript
export class HttpPoolRepo implements PoolRepo {
  constructor(private httpClient: HttpClient) {}
  async findAll(): Promise<Pool[]> {
    const response = await this.httpClient.get<DefiLlamaGetPoolsResponseDTO>("/pools");
    return response.data.data.map(defiLlamaPoolDTOToPool);
  }
}
```

From src/components/core/button.tsx:
```typescript
// Button accepts className prop which is merged via cn() after variant styles
// variant="default" applies bg-primary (near-black hsl(0 0% 9%))
// Button renders Text children via TextClassContext — variant="default" sets text-primary-foreground
```

From src/screens/home/components/pagination-controls.tsx:
```typescript
export function PaginationControls({
  currentPage, totalPages, onPageChange
}: PaginationControlsProps)
// Active page button: variant="default" (line 87)
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add stablecoin filter to pool fetching</name>
  <files>
    src/domain/pool/stablecoin-symbols.ts
    src/infra/repositories/http-repository/pool/pool-dto.ts
    src/infra/repositories/http-repository/pool/http-pool-repo.ts
    src/infra/repositories/http-repository/pool/__tests__/http-pool-repo.test.ts
  </files>
  <behavior>
    - Test: findAll returns only pools where dto.stablecoin === true AND symbol contains a well-known stablecoin
    - Test: Pool with stablecoin=true and symbol "USDC" is included
    - Test: Pool with stablecoin=true and symbol "USDC-WETH" is included (contains USDC)
    - Test: Pool with stablecoin=false is excluded even if symbol contains USDC
    - Test: Pool with stablecoin=true but symbol "WETH" (no stablecoin in symbol) is excluded
    - Test: Pool with stablecoin=true and symbol "USDT0-USDC.E" is included (multi-stablecoin pair)
  </behavior>
  <action>
    1. Create `src/domain/pool/stablecoin-symbols.ts` exporting a `STABLECOIN_SYMBOLS` constant array:
       ```typescript
       export const STABLECOIN_SYMBOLS = [
         "USDC", "USDC.E", "USDBC", "USDT", "USDT0", "DAI", "FRAX", "FRXUSD",
         "USDE", "SUSDE", "CRVUSD", "SCRVUSD", "GHO", "PYUSD", "USDS", "SUSDS",
         "BUSD", "LUSD", "TUSD", "FDUSD", "EURC",
       ] as const;
       ```

    2. Add `stablecoin: boolean` field to `DefiLlamaPoolDTO` in `src/infra/repositories/http-repository/pool/pool-dto.ts`.

    3. In `src/infra/repositories/http-repository/pool/http-pool-repo.ts`, update `findAll()` to filter before mapping:
       - Import `STABLECOIN_SYMBOLS` from `@/domain/pool/stablecoin-symbols`
       - Filter `response.data.data` to only include DTOs where `dto.stablecoin === true`
       - AND where the pool symbol (split by "-") contains at least one token that matches a stablecoin in `STABLECOIN_SYMBOLS`
       - Symbol matching: split `dto.symbol` by "-", trim whitespace, uppercase each token, check if any token is in `STABLECOIN_SYMBOLS`
       - Then map the filtered results with `defiLlamaPoolDTOToPool`

    4. Update existing tests in `http-pool-repo.test.ts`:
       - Add `stablecoin: true` to existing mock DTOs that should pass (they already use USDC and DAI symbols)
       - Add new tests per the <behavior> block above
       - Ensure the empty array test still works (no filtering on empty data)
  </action>
  <verify>
    <automated>cd /Users/ambegossi/yieldly/yieldly-app && bun run test --testPathPatterns="http-pool-repo"</automated>
  </verify>
  <done>
    - STABLECOIN_SYMBOLS constant exported from domain layer
    - DefiLlamaPoolDTO has stablecoin boolean field
    - HttpPoolRepo.findAll() filters to stablecoin pools with known stablecoin symbols
    - All existing and new tests pass
  </done>
</task>

<task type="auto">
  <name>Task 2: Max-width, pagination footer, and active page button</name>
  <files>
    src/screens/home/index.tsx
    src/screens/home/components/pagination-controls.tsx
  </files>
  <action>
    1. **Max-width on content container** (`src/screens/home/index.tsx`, line 97):
       Change `<View className="flex-1 px-4 pt-6 md:px-6 lg:px-8">` to
       `<View className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 md:px-6 lg:px-8">`

    2. **Move pagination into FlashList footer** (`src/screens/home/index.tsx`):
       - Remove the standalone PaginationControls block (lines 189-196) that sits after the FlashList closing tag
       - Add `ListFooterComponent` prop to the FlashList component:
         ```tsx
         ListFooterComponent={
           !isMobile && totalPages > 1 ? (
             <PaginationControls
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={goToPage}
             />
           ) : undefined
         }
         ```

    3. **Active page button brand green** (`src/screens/home/components/pagination-controls.tsx`, line 85-92):
       For the active page button (where `page === currentPage`), change from:
       ```tsx
       <Button
         key={page}
         variant={page === currentPage ? "default" : "outline"}
         ...
       ```
       To always use `variant="outline"` and conditionally apply brand green styling:
       ```tsx
       <Button
         key={page}
         variant={page === currentPage ? "default" : "outline"}
         size="sm"
         className={page === currentPage ? "bg-brand hover:bg-brand/90" : undefined}
         onPress={() => onPageChange(page)}
         accessibilityLabel={`Go to page ${page}`}
         accessibilityState={{ selected: page === currentPage }}
       >
         <Text className={page === currentPage ? "text-white" : undefined}>
           {String(page)}
         </Text>
       </Button>
       ```
       Keep `variant="default"` for the active page (it provides `text-primary-foreground` as base text color which is white), but override the background color with `className="bg-brand hover:bg-brand/90"`. Also explicitly set `text-white` on the Text to ensure it stays white regardless of the variant's text context.
  </action>
  <verify>
    <automated>cd /Users/ambegossi/yieldly/yieldly-app && bun run lint && bun run types</automated>
  </verify>
  <done>
    - Content container has max-w-7xl mx-auto w-full classes
    - PaginationControls renders as FlashList ListFooterComponent (scrolls with content)
    - Active page button has brand green background (bg-brand) with white text
    - No lint or type errors
  </done>
</task>

</tasks>

<verification>
1. `bun run test --testPathPatterns="http-pool-repo"` — all stablecoin filter tests pass
2. `bun run lint` — no lint errors
3. `bun run types` — no type errors
4. Visual check on web: content constrained on wide screens, pagination scrolls with list, active page button is green
</verification>

<success_criteria>
- Only stablecoin pools with recognized symbols appear in the listing
- Home screen content constrained to max-w-7xl on wide viewports
- Pagination controls are part of the list scroll area (ListFooterComponent)
- Active page number button uses brand green (#00AD69) background with white text
- All tests, lint, and type checks pass
</success_criteria>

<output>
After completion, create `.planning/quick/260414-rpv-web-improvements-stablecoin-filter-max-w/260414-rpv-SUMMARY.md`
</output>
