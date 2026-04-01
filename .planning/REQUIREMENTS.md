# Requirements: Yieldly — Pool Details Screen

**Defined:** 2026-03-31
**Core Value:** Users can quickly evaluate a pool's yield performance over time and decide whether to invest

## v1 Requirements

Requirements for the pool details screen. Each maps to roadmap phases.

### Display

- [ ] **DISP-01**: User sees current APY displayed prominently in large green text
- [ ] **DISP-02**: User sees the project name (e.g., "Aave") on the details card
- [ ] **DISP-03**: User sees the chain displayed as a badge with green dot (e.g., "Optimism")
- [ ] **DISP-04**: User sees the token symbol icon (reused from home screen)
- [ ] **DISP-05**: Layout is responsive — stacked on mobile, side-by-side APY/project on desktop

### Chart

- [ ] **CHRT-01**: User sees a 30-day historical APY line chart (green line)
- [ ] **CHRT-02**: Chart displays Y-axis with percentage labels
- [ ] **CHRT-03**: Chart displays X-axis with date labels
- [ ] **CHRT-04**: Chart shows caption "APY history over the last 30 days"

### Actions

- [ ] **ACTN-01**: User can tap "Open [Project]" button to open pool URL in external browser
- [ ] **ACTN-02**: Button is full-width green on mobile, left-aligned on desktop

### Navigation

- [ ] **NAVG-01**: User can tap a pool on the home screen to navigate to its details (push)
- [ ] **NAVG-02**: User sees "Back to all coins" header with back arrow
- [ ] **NAVG-03**: User can navigate back to the home screen

### Infrastructure

- [ ] **INFR-01**: `findApyHistory(poolId)` method added to PoolRepo interface
- [ ] **INFR-02**: DefiLlama chart API integrated (`GET /chart/{pool}`)
- [ ] **INFR-03**: API response filtered to last 30 days in adapter layer
- [ ] **INFR-04**: Loading state shown while chart data fetches
- [ ] **INFR-05**: Error state shown if chart API call fails

## v2 Requirements

### Chart Enhancements

- **CHRT-05**: User can switch between time ranges (7d, 30d, 90d, 1y)
- **CHRT-06**: User sees TVL data on the chart
- **CHRT-07**: User sees APY breakdown (base vs reward)

### Actions

- **ACTN-03**: User can favorite/bookmark a pool
- **ACTN-04**: User can share a pool link

### Data

- **DATA-01**: User sees APY predictions/trends
- **DATA-02**: User sees impermanent loss risk indicator

## Out of Scope

| Feature | Reason |
|---------|--------|
| Token full name (e.g., "Tether") | User directed to skip |
| In-app trading/swapping | Requires wallet integration, out of scope |
| Push notifications for APY changes | Backend infrastructure needed |
| User accounts/auth | Not needed for yield aggregator |
| Token price charts | Different domain |
| Compare pools side-by-side | High complexity, defer |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DISP-01 | — | Pending |
| DISP-02 | — | Pending |
| DISP-03 | — | Pending |
| DISP-04 | — | Pending |
| DISP-05 | — | Pending |
| CHRT-01 | — | Pending |
| CHRT-02 | — | Pending |
| CHRT-03 | — | Pending |
| CHRT-04 | — | Pending |
| ACTN-01 | — | Pending |
| ACTN-02 | — | Pending |
| NAVG-01 | — | Pending |
| NAVG-02 | — | Pending |
| NAVG-03 | — | Pending |
| INFR-01 | — | Pending |
| INFR-02 | — | Pending |
| INFR-03 | — | Pending |
| INFR-04 | — | Pending |
| INFR-05 | — | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 0
- Unmapped: 19

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
