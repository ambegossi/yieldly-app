# Yieldly Favorites — Design Document

> **Status:** Approved (brainstorming phase complete). Implementation plan to be created via `superpowers:writing-plans`.

**Source:** Design handoff bundle from Claude Design (`P3qZoIbOccrbEBGrKFzs_Q`). HTML prototype + chat transcript are the canonical intent.

---

## Goal

Let users mark pools as favorites and access a dedicated "Favorites" view with summary stats, persisted across app restarts.

## Scope

**Included** (full design from prototype):

- Star toggle on every pool row (filled when favorited, outline otherwise)
- "Favorites" tab in header (web) and bottom tab bar (mobile), with live count badge
- Banner on Home screen when favorites > 0, linking to Favorites screen
- Favorites screen with three summary cards (count, best APY, avg APY) and pool list sorted by APY desc
- Empty state on Favorites screen
- "Add to favorites / Favorited" pill button on Pool Details header
- Persistence across app restarts (synchronous hydration on first paint)
- "Pop" tap animation on the star button

**Out of scope:**

- Tweaks panel from the prototype (design exploration tool, not a product feature)
- Cross-device sync
- Favorites of non-pool entities

## Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Star icon = Lucide `Star` | Already in deps; same visual; reuses `Icon` wrapper |
| 2 | Persistence = MMKV via Zustand `persist` middleware | Sync API → no loading flicker; works on iOS/Android/web |
| 3 | State management = Zustand store (with selectors) | Per-row re-render isolation; user anticipates more global state |
| 4 | Navigation: header tabs (web ≥md) + bottom tab bar (mobile <md) | Idiomatic per platform; reuses `useDeviceLayout` |
| 5 | Tabs visible on Pool Details (both inactive) | Matches prototype; quick jump from details |
| 6 | TDD strict | Match `superpowers:test-driven-development` and project's existing 133-test discipline |
| 7 | Animation = Reanimated scale sequence | Already in deps; works on web; small implementation |
| 8 | No `FavoritesRepo` interface | `persist` middleware abstracts storage; favorites is client state, not server state |

## Architecture

### Layers

```
src/
  infra/
    state/                              ← NEW: client-side global state
      storage/
        mmkv-storage.ts                 # StateStorage adapter wrapping MMKV
      favorites-store.ts                # Zustand store + persist middleware
  domain/
    favorites/                          ← already exists (empty); fill it
      use-cases/
        use-favorites.ts                # Public hooks: useIsFavorite, useFavoriteToggle, useFavoritesCount, useFavoriteIds
  components/
    favorite-button.tsx                 # NEW
    favorites-banner.tsx                # NEW
    bottom-tab-bar.tsx                  # NEW
    header.tsx                          # MODIFIED: web tabs inline
  app/
    _layout.tsx                         # MODIFIED: render <BottomTabBar/> on mobile
    favorites.tsx                       # NEW route
  screens/
    favorites/                          # NEW screen
      index.tsx
      components/
        favorites-stats.tsx
        favorites-empty-state.tsx
    home/
      index.tsx                         # MODIFIED: render <FavoritesBanner/> when count>0
      components/
        pool-list-item.tsx              # MODIFIED: render <FavoriteButton/>
    pool-details/
      components/
        pool-details-header.tsx         # MODIFIED: render <FavoriteButton variant="pill"/>
```

### Cleanup of premature work

Before implementation begins, undo the AsyncStorage prematurely-installed scaffolding from earlier in this session:

- `bun remove @react-native-async-storage/async-storage`
- Delete `src/domain/favorites/favorites-repo.ts`
- Delete `src/infra/repositories/storage-repository/` (entire directory)
- Revert `src/domain/repositories.ts` to its prior shape (no `favoritesRepo`)

## Data flow

### Store shape

```ts
type FavoritesState = {
  ids: Set<string>;
  toggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
};
```

`toggle` replaces the Set immutably so Zustand's `Object.is` change detection fires for selectors.

### Persistence

- Storage key: `yieldly:favorites:v1`
- `persist` serializes via `replacer/reviver`: `Set<string>` ⇆ `string[]`
- MMKV instance ID: `'yieldly'`
- Sync hydration: store is populated **before** first React render

### Public API (consumed by UI)

```ts
useIsFavorite(id: string): boolean              // selector → row-isolated re-render
useFavoriteToggle(): (id: string) => void       // stable callback
useFavoritesCount(): number                     // re-renders only on count change
useFavoriteIds(): Set<string>                   // for the favorites screen list
```

### Toggle flow

```
User tap star → useFavoriteToggle()(pool.id)
  → Zustand set() replaces ids
  → persist middleware: mmkvStorage.setItem (sync)
  → Selectors re-evaluate:
      • useIsFavorite(thisId)   → row re-renders
      • useFavoritesCount       → header + bottom-tab badges re-render
      • useFavoriteIds          → favorites screen list re-renders (if mounted)
      • Other rows: no re-render (selector value unchanged)
```

## UI components

### `<FavoriteButton />`

| Prop | Type | Default |
|---|---|---|
| `poolId` | `string` | required |
| `variant` | `"icon" \| "pill"` | `"icon"` |
| `size` | `number` | `18` |

- Reads `useIsFavorite(poolId)` and `useFavoriteToggle()`
- Lucide `Star` with `fill` when favorited (brand color), outline (`gray-400`) otherwise
- On press: dispatch toggle + run scale `withSequence(withTiming(1.4, {duration:180}), withSpring(1, {damping:6}))`
- `e.stopPropagation()` so parent row press isn't fired
- `accessibilityRole="button"`, label switches between "Add to favorites" / "Remove from favorites"

### `<Header />` (modified)

- mobile: logo + brand name (current behavior)
- web: logo + brand + two pill tabs ("All pools", "Favorites" with star icon and count badge)
- `usePathname()` drives active state; pool-details path → both inactive but visible

### `<BottomTabBar />` (mobile-only)

- Rendered in `_layout.tsx` outside `<Stack>`, `Platform.select` + `useDeviceLayout` to gate
- Two equal-width buttons (Home, Favorites)
- Safe-area-aware bottom padding
- Active state: brand color icon + label; inactive: muted-foreground
- Favorites tab: count badge same rules as header

### `<FavoritesBanner />` (Home, conditional)

- `bg-brand/10 border-brand/20 rounded-xl px-4 py-2.5 mb-4`
- Filled brand star + "N pools favorited" / "1 pool favorited"
- Right-aligned link "View favorites →" navigates to `/favorites`
- Subtle slide-down on first appearance (`FadeInDown` from Reanimated)

### `<FavoritesScreen />`

- Reuses `<Header />`
- Section title: "Favorites" + subtitle "Your saved pools, sorted by best APY"
- `<FavoritesStats />` (3 cards) when count > 0
- Sorted list (APY desc) using existing `<PoolListItem />`
- `<FavoritesEmptyState />` when count === 0
- Reuses `usePoolFindAllSuspense()` — no new repo method, no new query key

### `<FavoritesEmptyState />`

- Dashed border, muted bg, centered
- Large outline star at 25% opacity
- Title "No favorites yet"
- Body "Tap the star icon on any pool to save it here for quick access."

## Responsive contracts

| Element | mobile (<md) | web (≥md) |
|---|---|---|
| Header tabs | hidden | visible inline |
| `<BottomTabBar />` | visible | hidden |
| Star on list rows | visible | visible (with hover ring) |
| Banner on Home | visible | visible |
| Pool details "Favorited" pill | visible (top-right of details header) | visible (top-right of details header) |

## Edge cases

| Scenario | Behavior |
|---|---|
| Favorited pool no longer in API response | Filtered out of favorites list silently; ID stays in store harmlessly |
| `usePoolFindAllSuspense` errors on Favorites screen | `<ScreenWrapper>` ErrorBoundary catches; favorites store independent |
| Single fav with negative APY | Best/Avg cards in red (consistent with `PoolListItem`) |
| User unfavorites all from Favorites screen | Stats hide, empty state appears in-place |
| MMKV unavailable on web (localStorage disabled) | MMKV's documented in-memory fallback; favorites lost on reload (acceptable degraded behavior) |

## Testing strategy (TDD)

### Unit-by-unit cadence

1. `mmkvStorage` adapter
2. `useFavoritesStore` (raw store + persistence)
3. `useFavorites` selectors (re-render isolation)
4. `<FavoriteButton />`
5. `<FavoritesBanner />`
6. `<BottomTabBar />`
7. `<Header />` extension (web tabs)
8. `<FavoritesStats />`
9. `<FavoritesEmptyState />`
10. `<PoolListItem />` extension
11. `<PoolDetailsHeader />` extension
12. `<FavoritesScreen />` integration
13. Home integration (banner)

### Mocks

- `react-native-mmkv` → in-memory Map shim in `test-utils/`
- Zustand store reset in `beforeEach`
- `useDeviceLayout`, `useRouter`, `usePathname` mocked per test
- `react-native-reanimated/mock` in jest setup
- `FlashList` mocked as `FlatList` (already established)

### Verification gates (before marking done)

- `bun run types` — green
- `bun run lint` — green
- `bun test` — all existing 133+ tests pass + all new tests green
- Manual on iOS sim and web: toggle from list/details, kill+reopen for persistence, exhaust empty state, exercise banner

## Out of scope for this design

- Cross-AI peer review (`gsd:review`)
- Pixel-perfect snapshot tests
- E2E with real MMKV runtime
- Migration of any existing user data (no users yet)

## Next step

Invoke `superpowers:writing-plans` skill to convert this design into an executable implementation plan with explicit task breakdown, file-by-file diffs, and per-task tests.
