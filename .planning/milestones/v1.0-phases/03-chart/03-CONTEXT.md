# Phase 3: Chart - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Integrate Victory Native to render a 30-day APY line chart inside the existing pool details screen. The chart displays inside the PoolInfoCard, below the APY/project info. It includes labeled Y-axis (percentage) and X-axis (dates), a caption, and handles loading/error/empty states independently. This phase also covers Victory Native + Skia installation and Expo Dev Client setup.

This phase does NOT add chart interactions (tooltips, crosshair), time range selectors, or any new domain/infra work (data pipeline complete in Phase 1).

</domain>

<decisions>
## Implementation Decisions

### Chart Visual Style
- **D-01:** Green line only, no area fill or gradient underneath the line. Clean look matching the design screenshots.
- **D-02:** No grid lines — just Y-axis percentage labels on the left side, no horizontal lines crossing the chart area.
- **D-03:** Responsive X-axis date labels — more labels on desktop (~6: Mar 2, 5, 8, 11...) and fewer on mobile (~3: Mar 2, 13, 31) to avoid overlap.
- **D-04:** Y-axis labels use auto precision — show decimals only when needed (e.g., "7%" but "2.5%").
- **D-05:** Line color is brand green `#00AD69` — consistent with the CTA button and APY text throughout the app.
- **D-06:** Fixed chart height (~200px mobile, ~250px desktop) rather than aspect-ratio-based scaling.

### Chart Placement
- **D-07:** Chart renders inside the existing `PoolInfoCard` component, below the APY/project/chain info section. Same white card, not a separate card.

### Loading & Error States
- **D-08:** Loading state: skeleton placeholder (pulsing gray rectangle) matching the chart dimensions inside the card.
- **D-09:** Error state: "Failed to load chart" text with a "Try again" retry button, all within the chart area. Rest of pool details stays visible.
- **D-10:** Empty data state: "No data available" centered text in chart area — distinct from error (no retry button).
- **D-11:** Caption "APY history over the last 30 days" is always visible in all states (loading, error, empty, success).

### Chart Interaction
- **D-12:** Static display only — no touch/press interaction, no tooltips, no crosshair. The chart is purely visual.

### Victory Native Setup
- **D-13:** Victory Native + `@shopify/react-native-skia` installation is part of Phase 3 scope (not a pre-step).
- **D-14:** Expo Dev Client required for native testing (`npx expo run:ios` / `run:android`). Expo Go will no longer work after adding Skia.
- **D-15:** Jest testing: mock Victory Native/Skia components. Test chart component in all states (loading, error, empty, success). Integration test that PoolInfoCard renders the chart section with data.

### Claude's Discretion
- Exact Victory Native component selection (CartesianChart, Line, etc.)
- Metro/Babel configuration changes needed for Skia
- Chart component decomposition (single component vs sub-components for axes/line/labels)
- Skeleton animation approach (Reanimated, CSS, or simple opacity)
- Retry mechanism implementation (refetch from React Query)
- Y-axis tick count and value calculation algorithm
- X-axis date label formatting (e.g., "Mar 2" vs "3/2")

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design
- `~/Desktop/Screenshot 2026-03-31 at 20.48.10.png` — Desktop layout: chart inside card with axes and caption
- `~/Desktop/Screenshot 2026-03-31 at 20.49.03.png` — Mobile layout: chart inside card, stacked layout

### Domain Layer (Phase 1 output)
- `src/domain/pool/apy-data-point.ts` — `ApyDataPoint` entity (`{ timestamp: string, apy: number }`)
- `src/domain/pool/pool-repo.ts` — `PoolRepo` interface with `findApyHistory(poolId)` method
- `src/domain/pool/use-cases/use-pool-apy-history.ts` — `usePoolApyHistory(poolId)` hook (non-Suspense, 5min staleTime)

### Presentation Layer (Phase 2 output)
- `src/screens/pool-details/index.tsx` — Pool details screen (chart integrates here)
- `src/screens/pool-details/components/pool-info-card.tsx` — PoolInfoCard component (chart goes inside this)

### Existing Components to Reuse
- `src/components/core/text.tsx` — Text component for caption and axis labels
- `src/hooks/use-device-layout.ts` — Responsive breakpoint hook for chart height and label density

### Prior Phase Context
- `.planning/phases/01-infrastructure/01-CONTEXT.md` — Data pipeline decisions (non-Suspense, caching)
- `.planning/phases/02-screen-navigation/02-CONTEXT.md` — Screen layout decisions (card structure)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `usePoolApyHistory(poolId)` — React Query hook returning `{ data, isPending, error }` for APY history
- `useDeviceLayout()` — returns `isMobile`/`isTablet`/`isDesktop` for responsive chart sizing
- `PoolInfoCard` — existing card component where chart will be added
- `Text` component — for caption and error/empty state messages
- `Button` component — for retry button in error state
- Brand green `#00AD69` available as `brand` in Tailwind config

### Established Patterns
- **Non-Suspense data fetching**: `useAppQuery` returns loading/error/data states for manual handling
- **Responsive layout**: `useDeviceLayout()` + conditional `className` via `cn()`
- **Component co-location**: screen-specific components in `src/screens/pool-details/components/`
- **Test co-location**: tests in `__tests__/` directories next to source

### Integration Points
- `PoolInfoCard` needs to accept `poolId` prop to call `usePoolApyHistory`
- Chart component created in `src/screens/pool-details/components/`
- Victory Native mock needed in Jest setup for all chart-related tests

</code_context>

<specifics>
## Specific Ideas

- Chart matches the clean, minimal design from screenshots — green line on white card background
- Design shows date format as "Mar 2", "Mar 13" etc. (short month + day)
- Y-axis labels are left-aligned outside the chart area in the design
- Caption text is centered below the chart, lighter/smaller text

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-chart*
*Context gathered: 2026-04-01*
