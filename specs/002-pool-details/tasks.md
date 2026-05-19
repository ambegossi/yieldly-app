---
status: migrated
description: "Reverse-engineered task list for Pool Details — all tasks completed before spec-kit adoption"
---

# Tasks: Pool Details

**Input**: Design documents from `/specs/002-pool-details/`

**Prerequisites**: spec.md ✅, plan.md ✅

**Tests**: Test tasks included — actual test files exist in `src/screens/pool-details/__tests__/` and `src/screens/pool-details/components/__tests__/`.

**Organization**: Tasks reflect what was actually built, grouped by Clean Architecture layer (Domain → Infrastructure → Presentation). All implementation tasks are marked completed (`[x]`) because the feature shipped before spec-kit adoption.

> **Migration note**: This is a _retrospective_ task list, not a forward-looking plan. The Setup phase is intentionally light because no project-level setup was needed — the feature reused existing dependencies (`@tanstack/react-query`, NativeWind) and added three new ones (`victory-native`, `@shopify/react-native-skia`, `expo-web-browser`).

## Format: `[ID] [P?] [Layer/Story] Description`

- **[P]**: Could have run in parallel
- **[D]** = Domain, **[I]** = Infrastructure, **[P1/P2/P3]** = Presentation (mapped to user stories in spec.md)

---

## Phase 1: Setup

- [x] T001 [P] Add `victory-native ^41.20.2` and `@shopify/react-native-skia 2.2.12` to `package.json` dependencies; run `bun install`.
- [x] T002 [P] Add `expo-web-browser` (already in deps as `~15.0.8`) — confirmed needed for native external link.
- [x] T003 [P] Add `@shopify/react-native-skia` to `trustedDependencies` in `package.json` (required by Bun for its postinstall step).

**Checkpoint**: Dependencies available; baseline `bun run lint && bun run types && bun run test` passes.

---

## Phase 2: Domain Layer

- [x] T010 [D] Add `ApyDataPoint` interface to `src/domain/pool/pool.ts` (`{ timestamp: string; apy: number }`).
- [x] T011 [D] Extend `PoolRepo` interface in `src/domain/pool/pool-repo.ts` with `findApyHistory(poolId: string): Promise<ApyDataPoint[]>`.
- [x] T012 [D] Create use-case hook `src/domain/pool/use-cases/use-pool-apy-history.ts` wrapping `useAppQuery` with `queryKey: ["pools", poolId, "apy-history"]` and `staleTime: 5 * 60 * 1000` (5 minutes).
- [x] T013 [P] [D] Add hook tests in `src/domain/pool/use-cases/__tests__/use-pool-apy-history.test.tsx` (cover success, loading, error; `unmount()` at end of each test).

**Checkpoint**: Domain types compile; `bun run types` passes. Hook test passes with a mocked repo.

---

## Phase 3: Infrastructure Layer

- [x] T020 [I] Add `DefiLlamaGetChartResponseDTO` and the per-point DTO shape to `src/infra/repositories/http-repository/pool/pool-dto.ts` (matches DefiLlama `/chart/{poolId}` response).
- [x] T021 [I] Add `defiLlamaChartDTOToApyHistory` adapter to `src/infra/repositories/http-repository/pool/pool-adapter.ts` (pure function — DTO array → `ApyDataPoint[]`).
- [x] T022 [I] Implement `findApyHistory(poolId)` on `HttpPoolRepo` in `src/infra/repositories/http-repository/pool/http-pool-repo.ts`, calling `httpClient.get<DefiLlamaGetChartResponseDTO>('/chart/${poolId}')` and applying the adapter.
- [x] T023 [P] [I] Extend `pool-adapter.test.ts` to cover the new chart adapter (happy path + edge cases).
- [x] T024 [P] [I] Extend `http-pool-repo.test.ts` to cover `findApyHistory` mocking the HttpClient.

> No DI wiring needed — `HttpPoolRepo` was already wired into `HttpRepositories` for the home-screen feature; the new method is automatically exposed via the existing `useRepository().poolRepo`.

**Checkpoint**: `bun run test` passes for new adapter and repo tests; the hook now resolves real DefiLlama chart data end-to-end.

---

## Phase 4: Presentation Layer

### Phase 4a: User Story 1 — Evaluate APY (P1) 🎯 MVP

- [x] T030 [P1] Create route file `src/app/pool-details.tsx` — default-export route component that uses `useLocalSearchParams<{ id, chain, project, symbol, apy }>()` to reconstruct a `Pool` and wraps `PoolDetailsScreen` in `<ScreenWrapper>`. Wire `onBack` to `router.back()` from `useRouter()`.
- [x] T031 [P1] Create screen entry `src/screens/pool-details/index.tsx` — default-export `PoolDetailsScreen({ pool, onBack })`; lays out Header → PoolDetailsHeader → PoolIdentityBlock → PoolInfoCard → CTA inside a `ScrollView` with `max-w-7xl` content width.
- [x] T032 [P] [P1] Create `src/screens/pool-details/components/pool-details-header.tsx` — back-button component with `accessibilityRole="button"`, `accessibilityLabel="Navigate back to pool list"`, and a 44px minimum tap target.
- [x] T033 [P] [P1] Create `src/screens/pool-details/components/pool-identity-block.tsx` — token icon (rounded square with brand-tinted border) + symbol heading.
- [x] T034 [P1] Wire "View on DefiLlama" CTA in screen — `Platform.OS === "web"` uses `window.open(url, "_blank", "noopener,noreferrer")`; otherwise `await WebBrowser.openBrowserAsync(url)`. URL is `https://defillama.com/yields/pool/${pool.id}`.
- [x] T035 [P1] Add integration test in `src/screens/pool-details/__tests__/pool-details-screen.test.tsx` covering navigation back, APY display, project/chain rendering, and external-link tap (mocking `WebBrowser` and `window.open`).
- [x] T036 [P] [P1] Add component tests for `pool-details-header.tsx` and `pool-identity-block.tsx` in their respective `__tests__/` folders.

**Checkpoint**: Route loads, screen renders with real pool data, back button returns to home, external link opens correctly on each platform.

### Phase 4b: User Story 2 — Chart (P2)

- [x] T040 [P2] Create `src/screens/pool-details/components/apy-chart.tsx` — Victory Native + Skia implementation. Handles 4 states explicitly: loading (skeleton, `accessibilityRole="progressbar"`), error (message + retry button), empty (`No data available`), success (Cartesian line chart). Y-axis labels compact `>=1M%` / `>=1K%` / raw `%`.
- [x] T041 [P2] Create `src/screens/pool-details/components/apy-chart.web.tsx` — web-only chart implementation (276 LOC; resolved by Metro's platform-extension rule). Same `ApyChartProps` contract.
- [x] T042 [P2] Create `src/screens/pool-details/components/pool-info-card.tsx` — composes the APY block, project/chain block, and `ApyChart`. Calls `usePoolApyHistory(poolId)` and passes `data`, `isPending`, `error`, `refetch` down to the chart. Responsive: column on mobile, row on tablet/desktop.
- [x] T043 [P] [P2] Add component test in `src/screens/pool-details/components/__tests__/apy-chart.test.tsx` covering all four states (with `@shopify/react-native-skia` and `victory-native` mocked).
- [x] T044 [P] [P2] Add component test in `src/screens/pool-details/components/__tests__/pool-info-card.test.tsx`.

**Checkpoint**: Chart renders 30-day history in success state; degrades cleanly to skeleton / empty / error states without affecting the rest of the screen.

### Phase 4c: User Story 3 — External CTA (P3)

> The external-link CTA was implemented as part of T031 + T034 (no separate component). The user story remains as a logical group for traceability; no additional tasks.

---

## Phase 5: Polish & Cross-Cutting

- [x] T090 [P] Verify visual output on iOS Simulator and on web (post-merge polish commits: `2818b27 style(pool-details): card shadow, chain badge alignment, and CTA label`, `c8f7864 fix(pool-details): change Open pool button text weight to font-medium`, `ed57024 fix(pool-details): add hover:bg-brand/90 to Open pool button`).
- [x] T091 `bun run lint`, `bun run types`, `bun run test` — all green at merge.
- [x] T092 Manual QA on mobile and tablet/desktop breakpoints; dark mode visual check.

---

## Known Gaps — RESOLVED 2026-05-18

These four gaps were identified during migration and all four were resolved in the same session. Kept here for historical traceability.

- [x] **G1. Deep-link with missing route params** — Was: `src/app/pool-details.tsx` silently defaulted missing params (`apy: 0`, empty strings) with no test or validation. **Resolved**: new test `src/app/__tests__/pool-details.test.tsx` (5 cases) pins the fallback contract. No runtime guard added — the fallback is now an explicitly tested behavior.
- [x] **G2. Platform-specific chart split was undocumented** — Was: `apy-chart.tsx` (Skia) and `apy-chart.web.tsx` (web) coexisted via Metro's platform-extension resolution with no ADR or comment. **Resolved**: header comments added to both files explaining the split, the Metro resolution rule, and the requirement to keep `ApyChartProps` in sync.
- [x] **G3. Chart-local error scope was intentional but undocumented** — Was: `ApyChart` handles its own `error` / `onRetry` instead of bubbling to `ScreenWrapper`; a future refactor could unwind this by accident. **Resolved**: inline comment in `pool-info-card.tsx` next to the `usePoolApyHistory` call pins the "do NOT bubble to ScreenWrapper" intent.
- [x] **G4. CLAUDE.md design intent diverged from implementation** — Was: `CLAUDE.md` § "Yieldly — Pool Details Screen" said "APY history will use mock data" but the shipped code hits the real DefiLlama API. **Resolved**: `CLAUDE.md:300` rewritten to describe the real `/chart/{poolId}` endpoint + 5-min React Query cache.

### Bonus: G5 (newly found during gap-fix work)

- [x] **G5. 5/7 tests in `pool-details-screen.test.tsx` were failing on `main`** — Discovered while prepping G1's test. Source CTA label was changed from "Open Aave" to "View on DefiLlama" in commit `2818b27` ("style(pool-details): card shadow, chain badge alignment, and CTA label") but the test assertions were not updated. **Resolved**: assertions updated to match the source. Test suite now 7/7 passing; full repo at 225/225.

## Dependencies & Execution Order _(retrospective)_

The actual implementation followed: Setup → Domain → Infrastructure → Presentation P1 → Presentation P2 → polish commits over ~3 PRs (`5d3e990 Create pool details (#2)` plus follow-ups `2818b27`, `c8f7864`, `ed57024`, `982f773`, `f413564`, `12e1ec1`).

Domain interface (`findApyHistory` on `PoolRepo`) had to land before the infrastructure implementation could be written; both had to land before `pool-info-card.tsx` could consume `usePoolApyHistory`. The chart component (T040 / T041) and the CTA / back-button work (T032 / T034) ran in parallel within Phase 4 because they touch independent files.

---

## Notes

- All tasks `[x]` because feature is shipped and on `main` (as of commit `919ade0`).
- Tests included in tasks because they exist in the repo — not because tests were planned upfront (this was a brownfield feature).
- Conventional Commit prefixes used during the feature: `feat(pool-details):`, `style(pool-details):`, `fix(pool-details):`, `test(pool-details):` — fully aligned with Constitution Principle VII.
- Future refinements to this feature should use `/speckit-refine` and update both this `tasks.md` and `spec.md` rather than creating a new spec.
