---
status: migrated
---

# Implementation Plan: Pool Details

**Branch**: `feature/pool-details` (merged via PR #2 — commit `5d3e990`) | **Date**: 2026-05-18 (retroactive) | **Spec**: [./spec.md](./spec.md)

**Input**: Reverse-engineered from shipped code under `src/screens/pool-details/`, `src/domain/pool/`, and `src/infra/repositories/http-repository/pool/`.

> **Migration note**: This plan was reconstructed by `/speckit-brownfield-migrate` after the feature shipped. It describes the implementation that was actually built, not a forward-looking design. Use it as the baseline for future refinements (`/speckit-refine`) rather than as a record of design discussion.

## Summary

A dedicated pool details screen that lets a user evaluate a yield pool's current APY and 30-day APY history, then open the pool's underlying DefiLlama page. Built as a new Expo Router route + screen + 5 components, with a single new domain use case (`usePoolApyHistory`) and the corresponding infrastructure-layer additions (chart DTO, adapter, repo method).

The feature reuses the existing `Pool` domain entity (from `001-home-screen`) and the existing `HttpPoolRepo` / `defi-llama-http-client.ts` plumbing. It only extends the contract — no architectural changes.

## Technical Context

**Language/Version**: TypeScript 5.9.2 (strict), React 19.1.0, React Native 0.81.4

**Primary Dependencies (this feature)**:

- `victory-native ^41.20.2` — Cartesian chart primitives
- `@shopify/react-native-skia 2.2.12` — Skia renderer powering Victory Native; required by `matchFont` for chart axis labels
- `expo-web-browser ~15.0.8` — opens the DefiLlama URL in-app on iOS/Android (`WebBrowser.openBrowserAsync`)
- `lucide-react-native` — `ArrowLeft`, `ExternalLink` icons
- `react-native-reanimated ~4.1.1` + `react-native-worklets 0.5.1` — required transitively by Victory Native / Skia chart animations
- Reused: `@tanstack/react-query` (via `useAppQuery`), Axios (via existing DefiLlama HTTP client), NativeWind, `react-native-safe-area-context`

**Storage**: React Query cache only — APY history is fetched with `staleTime: 5 * 60 * 1000` (5 minutes); no persistence layer added.

**Testing**: Jest 30 + `jest-expo` preset + `@testing-library/react-native`. 5 test files: 1 screen integration test, 4 component tests. `@shopify/react-native-skia` and `victory-native` are mocked at the chart component level so tests run without a Skia native binary.

**Target Platform**: iOS, Android, Web (with a platform-specific `apy-chart.web.tsx` resolved by Metro)

**Project Type**: Cross-platform mobile app — Presentation feature with thin Domain/Infra extensions

**Performance Goals**: Chart renders and remains responsive without dropped frames on mid-tier devices. Skeleton appears immediately on first render; no flash-of-empty-state.

**Constraints**:

- Chart must not block the rest of the screen on failure (scoped error recovery; see Principle from constitution: ScreenWrapper handles fatal errors, chart handles its own scoped state)
- Y-axis label compaction required because DeFi APY values can legitimately reach 1000%+ (a high-yield pool with token rewards)
- External link MUST use platform-appropriate API (`window.open` web / `WebBrowser` native) — never an in-app WebView for the DefiLlama destination

**Scale/Scope**: 1 new route, 1 screen, 5 components, 1 new domain use case, 1 new repository method, 1 new DTO. ~641 production LOC + ~680 test LOC.

## Constitution Check

_GATE: Verified after-the-fact — feature already shipped._

| Principle                                                                              | Status           | Notes                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Clean Architecture layering                                                         | ✅               | Domain layer extended only with interface + use-case hook; HTTP/DTO concerns stay in `src/infra/`; presentation consumes via `useRepository()` + `usePoolApyHistory`. No layer violations.                                                         |
| II. kebab-case filenames                                                               | ✅               | All 11 new files use kebab-case (`pool-details.tsx`, `pool-info-card.tsx`, `use-pool-apy-history.ts`, etc.)                                                                                                                                        |
| III. Function declarations + named exports (default export only at screen entry point) | ✅               | `src/app/pool-details.tsx` and `src/screens/pool-details/index.tsx` use default exports as allowed; all 5 components use named function-declaration exports.                                                                                       |
| IV. Data fetching via `useAppQuery`                                                    | ✅               | `usePoolApyHistory` wraps `useAppQuery` — no direct React Query hook usage.                                                                                                                                                                        |
| V. Tests co-located in `__tests__/`                                                    | ✅               | 5 test files all in `__tests__/` subdirectories.                                                                                                                                                                                                   |
| VI. Styling: brand green NOT `--primary`                                               | ✅               | APY value uses `text-brand`, chart line color `#00AD69`, identity block uses `bg-brand/10` + `border-brand/20`. No misuse of `--primary`.                                                                                                          |
| VII. Conventional Commits + `feat/*` branch                                            | ✅ (with caveat) | Feature shipped on `feature/pool-details` (legacy form, predates the `feat/*` rule from this constitution). Commits since merge use `feat(pool-details):`, `style(pool-details):`, `fix(pool-details):`, `test(pool-details):` — all Conventional. |

**No violations require justification.** The legacy `feature/*` branch predates the constitution and is not a violation per Principle VII.

## Project Structure

### Documentation (this feature)

```text
specs/002-pool-details/
├── plan.md              # This file
├── spec.md              # Reverse-engineered functional spec
└── tasks.md             # Reverse-engineered task list (all completed)
```

### Source Code (actual paths shipped)

```text
src/
├── domain/pool/
│   ├── pool.ts                                       # Added: ApyDataPoint interface
│   ├── pool-repo.ts                                  # Added: findApyHistory method to PoolRepo
│   └── use-cases/
│       ├── use-pool-apy-history.ts                   # NEW: hook wrapping useAppQuery, staleTime 5min
│       └── __tests__/
│           └── use-pool-apy-history.test.tsx         # NEW
├── infra/repositories/http-repository/pool/
│   ├── pool-dto.ts                                   # Added: DefiLlamaGetChartResponseDTO
│   ├── pool-adapter.ts                               # Added: defiLlamaChartDTOToApyHistory
│   ├── http-pool-repo.ts                             # Added: findApyHistory calling GET /chart/{id}
│   └── __tests__/
│       ├── pool-adapter.test.ts                      # (extended)
│       └── http-pool-repo.test.ts                    # (extended)
├── app/
│   └── pool-details.tsx                              # NEW: route, default export, ScreenWrapper, useLocalSearchParams
└── screens/pool-details/
    ├── index.tsx                                     # NEW: screen entry, default export
    ├── components/
    │   ├── pool-details-header.tsx                   # NEW: back button (44px target)
    │   ├── pool-identity-block.tsx                   # NEW: token icon + symbol heading
    │   ├── pool-info-card.tsx                        # NEW: APY + project + chain + ApyChart
    │   ├── apy-chart.tsx                             # NEW: Victory + Skia chart (iOS/Android)
    │   └── apy-chart.web.tsx                         # NEW: web-only chart implementation
    └── __tests__/
        └── pool-details-screen.test.tsx              # NEW: integration test

```

**Structure Decision**: This feature is a Presentation-layer addition with minor Domain and Infrastructure extensions. It introduces no new top-level directory under `src/`. The platform-specific chart split (`apy-chart.tsx` + `apy-chart.web.tsx`) is the only non-standard pattern in the feature and is resolved by Metro's `.web.tsx` extension rule — see Known Gaps in `spec.md` for the undocumented-decision risk.

## Complexity Tracking

> No constitutional violations — section intentionally minimal.

| Item                                                                                              | Why it's worth noting                                                                            | Could have been simpler?                                                                                                                        |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform-specific `apy-chart.web.tsx`                                                             | Skia doesn't perform well on web; web chart needs DOM-friendly rendering                         | A pure-CSS/SVG single-implementation chart would be simpler but couldn't deliver the same native polish — accepted complexity for visual parity |
| Scoped chart error state (chart-local `error` / `onRetry` instead of bubbling to `ScreenWrapper`) | A failed chart should not blank the whole screen — APY, project, chain, and CTA are still useful | Bubbling to `ScreenWrapper` would be simpler but degrades UX — accepted complexity for resilience                                               |
