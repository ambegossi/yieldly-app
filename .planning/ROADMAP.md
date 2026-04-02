# Roadmap: Yieldly — Pool Details Screen

## Overview

Starting from the existing home screen (pool list with filtering), this milestone adds the pool details screen. Phase 1 lays the domain and API foundation so the screen has real data to display. Phase 2 builds the full details screen — header, pool info, CTA button, and navigation wired end-to-end. Phase 3 integrates Victory Native to render the 30-day APY chart, which carries the highest technical risk (Skia native modules) and is isolated last to keep earlier phases unblocked.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Infrastructure** - Extend domain and wire DefiLlama chart API (completed 2026-04-01)
- [ ] **Phase 2: Screen & Navigation** - Build details screen and wire home → details navigation
- [ ] **Phase 3: Chart** - Integrate Victory Native 30-day APY line chart

## Phase Details

### Phase 1: Infrastructure
**Goal**: The domain is extended and real APY history data flows from DefiLlama to the app
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01, INFR-02, INFR-03, INFR-04, INFR-05
**Success Criteria** (what must be TRUE):
  1. `PoolRepo` interface has a `findApyHistory(poolId)` method returning `ApyDataPoint[]`
  2. Calling `findApyHistory` with a valid pool UUID triggers a real HTTP call to `yields.llama.fi/chart/{pool}`
  3. The returned data contains only the last 30 days of APY points (adapter filters excess history)
  4. A loading indicator is visible while the chart data request is in flight
  5. An error message is visible if the chart API call fails
**Plans:** 2/2 plans complete
Plans:
- [x] 01-01-PLAN.md — Domain contracts, chart DTO types, adapter with 30-day filter
- [x] 01-02-PLAN.md — HttpPoolRepo.findApyHistory implementation and usePoolApyHistory hook

### Phase 2: Screen & Navigation
**Goal**: Users can navigate from the home screen to a pool's details and see all static pool info and the CTA button
**Depends on**: Phase 1
**Requirements**: DISP-01, DISP-02, DISP-03, DISP-04, DISP-05, ACTN-01, ACTN-02, NAVG-01, NAVG-02, NAVG-03
**Success Criteria** (what must be TRUE):
  1. Tapping a pool card on the home screen pushes the details screen for that pool
  2. The details screen header shows "Back to all coins" with a back arrow, and tapping it returns to the home screen
  3. The details screen shows the pool's current APY in large green text, project name, chain badge with green dot, and token symbol icon
  4. The layout is stacked (single column) on mobile and shows APY/project info side-by-side on desktop (>=768dp)
  5. Tapping "Open [Project]" opens the pool's URL in the device's external browser
**Plans:** 2 plans
Plans:
- [x] 02-01-PLAN.md — Pool details screen components, route file, and formatAPY extraction
- [ ] 02-02-PLAN.md — Home screen navigation wiring and comprehensive test coverage

### Phase 3: Chart
**Goal**: Users see a 30-day APY line chart with labeled axes on the details screen
**Depends on**: Phase 2
**Requirements**: CHRT-01, CHRT-02, CHRT-03, CHRT-04
**Success Criteria** (what must be TRUE):
  1. The details screen renders a green line chart showing APY values over the last 30 days
  2. The Y-axis displays percentage labels (e.g., "5%", "10%")
  3. The X-axis displays date labels at readable intervals
  4. The caption "APY history over the last 30 days" appears below the chart
**Plans:** 2 plans
Plans:
- [ ] 03-01-PLAN.md — Install Victory Native + Skia, configure Jest, build ApyChart component
- [ ] 03-02-PLAN.md — Wire ApyChart into PoolInfoCard and update tests
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure | 2/2 | Complete   | 2026-04-01 |
| 2. Screen & Navigation | 0/2 | Not started | - |
| 3. Chart | 0/2 | Not started | - |
