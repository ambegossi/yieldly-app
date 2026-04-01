# Research Summary: Pool Details Screen

## Stack

- **Victory Native** + `@shopify/react-native-skia` for line charts (user-selected, Skia-based, 60fps)
- **DefiLlama Yields API** — `GET https://yields.llama.fi/chart/{pool}` for historical APY data
- **Expo Router** dynamic route `src/app/pool/[id].tsx` for navigation
- **Expo Dev Client required** — Skia native modules won't work in Expo Go

## Key API Details

- Chart endpoint returns ALL history (1000+ points) — filter to last 30 days in adapter
- Response: `{ status, data: [{ timestamp, apy, tvlUsd, apyBase, apyReward }] }`
- Pool ID is UUID format from DefiLlama

## Table Stakes (v1)

1. Current APY display (large green text)
2. Project name + chain badge
3. Token symbol icon (reused from home)
4. 30-day APY line chart
5. "Open [Project]" external link button
6. Back navigation
7. Responsive layout (mobile/desktop)
8. Loading + error states

## Architecture

- Extend `PoolRepo` with `findApyHistory(poolId): Promise<ApyDataPoint[]>`
- New `ApyDataPoint` entity: `{ timestamp: string, apy: number }`
- Screen at `src/screens/pool-details/` with components: pool-header, apy-card, apy-chart, chain-badge, open-pool-button
- Data flow: pool from React Query cache + chart data from new API call

## Critical Pitfalls

1. **Expo Go won't work** — need dev client after adding Skia (HIGH risk)
2. **Victory Native + Jest** — must mock chart components (HIGH risk)
3. **1000+ API data points** — filter in adapter, not component (MEDIUM risk)
4. **Chart re-renders** — use proper staleTime + memoization (MEDIUM risk)

## Build Order

1. Domain entities + repo interface
2. Infrastructure (API call + adapter with 30-day filter)
3. Use case hook (`usePoolApyHistory`)
4. Dynamic route + navigation
5. Screen components + layout
6. Victory Native chart integration
7. Wire home screen → details navigation
8. Tests
