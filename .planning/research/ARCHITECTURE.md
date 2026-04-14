# Architecture Research: Pool Details Screen

## Component Boundaries

```
src/app/pool/[id].tsx          — Route (thin wrapper with Suspense)
src/screens/pool-details/
  index.tsx                     — Screen orchestrator
  components/
    pool-header.tsx             — Symbol icon + symbol text
    apy-card.tsx                — Card with APY, project, chain, chart
    apy-chart.tsx               — Victory Native line chart
    chain-badge.tsx             — Green dot + chain name chip
    open-pool-button.tsx        — "Open [Project]" CTA
```

## Data Flow

```
1. Home screen tap → router.push(`/pool/${pool.id}`)
2. Route renders PoolDetailsScreen with `id` param
3. Screen calls two hooks:
   a. usePoolFindAll() → find pool by ID from cached list (already fetched)
   b. usePoolApyHistory(id) → fetch 30-day APY chart data
4. Pool data renders immediately (from cache)
5. Chart data loads async (Suspense or loading state within card)
```

## Domain Layer Changes

```typescript
// New entity
interface ApyDataPoint {
  timestamp: string;
  apy: number;
}

// Extended PoolRepo interface
interface PoolRepo {
  findAll: () => Promise<Pool[]>;
  findApyHistory: (poolId: string) => Promise<ApyDataPoint[]>;
}
```

## Infrastructure Layer Changes

- New method on HttpPoolRepo: `findApyHistory(poolId)` → GET /chart/{pool}
- DTO adapter: map API response, filter to last 30 days, extract `timestamp` + `apy`

## Suggested Build Order

1. **Domain**: Add `ApyDataPoint` entity + `findApyHistory` to PoolRepo interface
2. **Infrastructure**: Implement API call + adapter (filter to 30 days)
3. **Use Case**: Create `usePoolApyHistory` hook
4. **Navigation**: Add dynamic route `src/app/pool/[id].tsx`
5. **Screen**: Build pool details screen with all components
6. **Chart**: Integrate Victory Native line chart
7. **Connect**: Wire home screen tap to navigate to details
8. **Tests**: Unit tests for hooks, adapter, components

## Responsive Layout

- **Mobile**: Full-width card, stacked layout (APY top, project below, chart below)
- **Desktop**: Wider card, APY left + project/chain right, wider chart with more date labels
- Reuse existing `useDeviceLayout()` hook for breakpoint detection
