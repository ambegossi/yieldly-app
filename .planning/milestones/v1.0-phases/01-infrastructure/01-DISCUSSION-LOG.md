# Phase 1: Infrastructure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 01-infrastructure
**Areas discussed:** APY history data shape, Chart API base URL, Loading/error strategy, Caching behavior

---

## APY History Data Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal: timestamp + apy only | Simplest — only what the chart needs now. Add fields later if v2 needs TVL/breakdown | ✓ |
| Future-ready: timestamp + apy + tvlUsd | Includes TVL so a v2 TVL chart doesn't need API changes | |
| Full: all fields | Keep everything the API returns — maximum flexibility | |

**User's choice:** Minimal: timestamp + apy only
**Notes:** Keep it simple, extend later if needed.

---

## Chart API Base URL

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse existing client | Same base URL (yields.llama.fi), just call /chart/{pool}. No new client needed | ✓ |
| Separate env var + client | New EXPO_PUBLIC_DEFILLAMA_CHART_API_URL for flexibility to change endpoints independently | |

**User's choice:** Reuse existing client
**Notes:** Both endpoints are on the same yields.llama.fi host.

---

## Loading/Error Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Standard useAppQuery | Chart has its own loading/error states inside the card. Pool info shows immediately, chart loads separately | ✓ |
| Suspense like pool list | Whole screen waits for chart data. Simpler but blocks pool info display | |

**User's choice:** Standard useAppQuery
**Notes:** Chart error should not block pool info display.

---

## Caching Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| 5 minutes | Good balance — fresh enough for navigation back/forth, won't refetch constantly | ✓ |
| 30 minutes | More aggressive caching — daily data doesn't change often | |
| You decide | Claude picks a sensible default based on the use case | |

**User's choice:** 5 minutes
**Notes:** Data is daily granularity, 5 minutes is sufficient.

## Claude's Discretion

- Query key structure for APY history
- 30-day filtering logic in adapter
- Error types and handling

## Deferred Ideas

None — discussion stayed within phase scope.
