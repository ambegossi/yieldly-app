# Yieldly — Pool Details Screen

## What This Is

Yieldly is a React Native mobile app that aggregates DeFi yield farming opportunities across chains. Users browse pools on the home screen, drill into a pool details screen to see current APY, project/chain info, a 30-day historical APY line chart, and a CTA to open the pool externally.

## Core Value

Users can quickly evaluate a pool's yield performance over time and decide whether to invest, then open the pool's platform directly.

## Current State

**Shipped:** v1.0 Pool Details Screen (2026-04-02)

- 3 phases, 6 plans, ~60 commits
- 6,897 lines of TypeScript across src/
- Pool details screen fully functional with APY display, navigation, and chart
- Chart axis labels (CHRT-02, CHRT-03) deferred — CartesianChart needs padding prop

## Requirements

### Validated

- ✓ Pool list with filtering and dual pagination — existing (home screen)
- ✓ Clean Architecture with DI via React Context — existing
- ✓ Responsive layout (mobile vs tablet/desktop) — existing
- ✓ Pool details screen with current APY, project name, chain badge — v1.0
- ✓ "Open [Project]" CTA button linking to pool URL — v1.0
- ✓ Navigation from home screen pool tap → details screen (push) — v1.0
- ✓ "Back to all coins" navigation header — v1.0
- ✓ Token symbol icon (reused from home screen) — v1.0
- ✓ Responsive layout: mobile (stacked) vs desktop (wider card, side-by-side) — v1.0
- ✓ `findApyHistory(poolId)` repository method for chart data — v1.0
- ✓ DefiLlama chart API integration — v1.0
- ✓ Loading and error states for chart data — v1.0
- ✓ 30-day historical APY line chart (Victory Native) — v1.0
- ✓ Chart caption "APY history over the last 30 days" — v1.0

### Active

- [ ] Chart Y-axis with percentage labels (CHRT-02 — deferred from v1.0, needs padding prop)
- [ ] Chart X-axis with date labels (CHRT-03 — deferred from v1.0, needs padding prop)

### Out of Scope

- Token full name (e.g., "Tether") — user directed to skip
- Favorite/bookmark pools — future feature
- Share pool functionality — future feature
- TVL, volume, or other financial metrics — not in current design
- Time range selector for chart (7d/90d/1y) — only 30 days for now
- In-app trading/swapping — requires wallet integration
- Push notifications for APY changes — backend infrastructure needed
- User accounts/auth — not needed for yield aggregator

## Context

Shipped v1.0 with 6,897 LOC TypeScript.
Tech stack: Expo SDK 54, React 19.1, React Query v5, NativeWind v4, Victory Native, Skia.
Expo Dev Client required after adding @shopify/react-native-skia (Expo Go no longer works).
133+ tests passing across domain, infrastructure, and presentation layers.

## Constraints

- **Chart library**: Victory Native (user-selected, Skia-based)
- **Architecture**: Clean Architecture pattern (domain → infra → presentation)
- **Styling**: NativeWind v4 with existing Tailwind theme
- **Routing**: Expo Router file-based routing
- **Dev Client**: Required for Skia (no Expo Go)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Victory Native for charts | User preference, Skia-based, good animation support | ✓ Good |
| Separate `findApyHistory` method | Keeps pool list lightweight, chart data fetched on demand | ✓ Good |
| DefiLlama Yields API | Real API available at yields.llama.fi/chart/{pool}, no mock needed | ✓ Good |
| Ignore token full name | User directed to skip this design element | ✓ Good |
| Push navigation (not modal/sheet) | Standard navigation pattern, user selected | ✓ Good |
| useAppQuery (not Suspense) for chart | Chart errors show as UI state, not crash | ✓ Good |
| formatAPY shared utility | Extracted to src/lib/format-apy.ts, shared by PoolListItem and PoolInfoCard | ✓ Good |
| Flat string pool params in URL | Simple serialization, apy deserialized with parseFloat() | ✓ Good |
| onBack callback prop | Keeps PoolDetailsScreen router-agnostic and testable | ✓ Good |
| Mock ApyChart in PoolInfoCard tests | Isolates from Victory Native rendering complexity | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-02 after v1.0 milestone*
