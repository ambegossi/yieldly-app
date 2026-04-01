# Yieldly — Pool Details Screen

## What This Is

Yieldly is a React Native mobile app that aggregates DeFi yield farming opportunities across chains. Users browse pools on the home screen and drill into a pool details screen to see current APY, project/chain info, a 30-day historical APY line chart, and a CTA to open the pool externally.

## Core Value

Users can quickly evaluate a pool's yield performance over time and decide whether to invest, then open the pool's platform directly.

## Requirements

### Validated

- ✓ Pool list with filtering and dual pagination — existing (home screen)
- ✓ Clean Architecture with DI via React Context — existing
- ✓ Responsive layout (mobile vs tablet/desktop) — existing

### Active

- [ ] Pool details screen with current APY, project name, chain badge
- [ ] 30-day historical APY line chart (Victory Native)
- [ ] "Open [Project]" CTA button linking to pool URL
- [ ] Navigation from home screen pool tap → details screen (push)
- [ ] "Back to all coins" navigation header
- [ ] Token symbol icon (reused from home screen)
- [ ] Responsive layout: mobile (stacked) vs desktop (wider card, side-by-side APY/project info)
- [ ] New `findApyHistory(poolId)` repository method for chart data
- [ ] Mock APY history data (no real API yet)

### Out of Scope

- Token full name field (e.g., "Tether") — design element ignored per user direction
- Favorite/bookmark pools — future feature
- Share pool functionality — future feature
- TVL, volume, or other financial metrics — not in current design
- Time range selector for chart (7d/90d/1y) — only 30 days for now

## Context

- Existing home screen has pool list with FlashList, filters, dual pagination
- Pool entity: `{ id, chain, project, symbol, apy, url }`
- Current pool tap triggers `Alert.alert()` placeholder — needs to navigate to details
- App uses Expo Router v6 file-based routing, NativeWind v4 for styling
- React Query v5 with Suspense integration for data fetching
- Design mockups provided showing mobile and desktop layouts

## Constraints

- **Chart library**: Victory Native (user-selected)
- **Data**: APY history will use mock data; separate `findApyHistory` method on PoolRepo
- **Architecture**: Must follow existing Clean Architecture pattern (domain → infra → presentation)
- **Styling**: NativeWind v4 with existing Tailwind theme (green palette for APY values)
- **Routing**: Expo Router file-based routing, pool ID as route parameter

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Victory Native for charts | User preference, Skia-based, good animation support | — Pending |
| Separate `findApyHistory` method | Keeps pool list lightweight, chart data fetched on demand | — Pending |
| Mock APY data | No real API endpoint yet, design for easy swap later | — Pending |
| Ignore token full name | User directed to skip this design element | — Pending |
| Push navigation (not modal/sheet) | Standard navigation pattern, user selected | — Pending |

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
*Last updated: 2026-03-31 after initialization*
