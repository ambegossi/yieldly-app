---
status: migrated
---

# Feature Specification: Pool Details

**Feature Branch**: `feature/pool-details` (merged via PR #2 — commit `5d3e990`)

**Created**: 2026-05-18 (retroactive — reverse-engineered from existing code)

**Status**: Migrated

**Input**: Reverse-engineered from shipped code. Original intent captured in `CLAUDE.md` § "Yieldly — Pool Details Screen". No original natural-language spec existed.

> **Migration note**: This spec was created by `/speckit-brownfield-migrate` from working code in `src/screens/pool-details/`, `src/domain/pool/use-cases/use-pool-apy-history.ts`, and related infrastructure. Every requirement below cites a specific source file. See **Known Gaps & Divergences** for items where shipped behavior diverges from the original design intent recorded in `CLAUDE.md`.

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Evaluate a pool's current APY and yield over time (Priority: P1) 🎯 MVP

A user browsing the home pool list taps a pool to drill into its dedicated details screen. The screen shows the pool's identity (symbol + token icon), its current APY, its project + chain, a 30-day APY history chart, and a CTA to open the pool on DefiLlama.

**Why this priority**: This is the core value of the feature — without the details screen, users cannot evaluate a pool beyond the row-level summary shown on the home screen.

**Independent Test**: Navigate from the home list to any pool. Verify symbol, APY, project, chain badge, and chart all render. Verify "View on DefiLlama" CTA is present.

**Acceptance Scenarios**:

1. **Given** a user on the home screen, **When** they tap a pool row, **Then** the pool details screen displays with that pool's symbol, APY, project, and chain.
2. **Given** the pool details screen is open, **When** the APY history finishes loading, **Then** a 30-day line chart of historical APY values is rendered using the brand green color (`#00AD69`).
3. **Given** the pool details screen is open, **When** the user taps the back affordance ("Back to all coins"), **Then** they are returned to the home screen.

---

### User Story 2 — Recover gracefully when the APY chart fails to load (Priority: P2)

When the chart data fails to load, the user sees a clear error message with a one-tap retry, without losing the rest of the screen.

**Why this priority**: The chart is one zone among several. The screen is still useful (APY, project, chain, CTA) even if the chart errors. A scoped error-recovery UX prevents the whole screen from failing because of a single network call.

**Independent Test**: Force `usePoolApyHistory` to reject. Verify the "Failed to load chart" message and "Try again" button render in the chart zone only; the rest of the screen remains interactive.

**Acceptance Scenarios**:

1. **Given** the pool details screen is open, **When** the APY history request fails, **Then** the chart zone shows "Failed to load chart" with a "Try again" button.
2. **Given** the chart error is showing, **When** the user taps "Try again", **Then** the chart re-fetches and renders on success.
3. **Given** the API returns an empty array, **When** the chart zone resolves, **Then** it shows "No data available" instead of an empty chart.
4. **Given** the chart is still loading, **When** the screen first renders, **Then** the chart zone shows a pulsing skeleton with `accessibilityRole="progressbar"`.

---

### User Story 3 — Open the pool's full DefiLlama page externally (Priority: P3)

After evaluating the APY history, the user can launch the underlying DefiLlama pool page to take action (deposit, read deeper analytics).

**Why this priority**: Yieldly is an aggregator; the actual deposit flow lives on the source protocol's page. This CTA is the bridge to that flow but is not part of the evaluation experience itself.

**Independent Test**: Tap "View on DefiLlama". On web a new tab opens to `https://defillama.com/yields/pool/{id}`; on iOS/Android the in-app `WebBrowser` opens to the same URL.

**Acceptance Scenarios**:

1. **Given** the user is on the pool details screen, **When** they tap "View on DefiLlama" on the web, **Then** a new tab opens to `https://defillama.com/yields/pool/{pool.id}` with `noopener,noreferrer`.
2. **Given** the user is on the pool details screen, **When** they tap "View on DefiLlama" on iOS or Android, **Then** `expo-web-browser` opens the same URL inside the app.

---

### Edge Cases

- **Deep-link with missing params**: The route reads `id`, `chain`, `project`, `symbol`, `apy` from `useLocalSearchParams`. If any param is missing, defaults are used (empty strings, `0` for APY). Contract pinned by `src/app/__tests__/pool-details.test.tsx`; see **Known Gaps & Divergences** § 2 for migration history.
- **Very large or very small APY values**: Chart Y-axis labels format `>=1M` as `M%`, `>=1K` as `K%`, otherwise raw `%`.
- **Mobile vs. tablet/desktop layout**: APY block and project/chain block stack as column on mobile (<768dp) and lay out as row with project/chain right-aligned on tablet/desktop. CTA button is full-width on mobile and fit-content on tablet/desktop.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST expose a route at `/pool-details` that accepts `id`, `chain`, `project`, `symbol`, and `apy` as query parameters and reconstructs a `Pool` object from them. _(Source: `src/app/pool-details.tsx`)_
- **FR-002**: The pool details screen MUST display the pool's `symbol` in both an icon block (token badge style) and as a heading. _(Source: `src/screens/pool-details/components/pool-identity-block.tsx`)_
- **FR-003**: The pool details screen MUST display the pool's current APY formatted via `formatAPY()`, labeled "Current APY", in brand green color. _(Source: `src/screens/pool-details/components/pool-info-card.tsx:43`)_
- **FR-004**: The pool details screen MUST display the pool's `project` name and its `chain` name in a subtle badge. _(Source: `src/screens/pool-details/components/pool-info-card.tsx:48–56`)_
- **FR-005**: The pool details screen MUST fetch APY history via the `PoolRepo.findApyHistory(poolId)` use case, with a 5-minute stale time. _(Source: `src/domain/pool/use-cases/use-pool-apy-history.ts`)_
- **FR-006**: The APY history chart MUST display a 30-day historical line chart of APY values, with caption "APY history over the last 30 days". _(Source: `src/screens/pool-details/components/apy-chart.tsx:168–170`)_
- **FR-007**: The chart MUST handle four states explicitly: loading (skeleton with `accessibilityRole="progressbar"`), error (message + retry), empty (`No data available`), and success (line chart). _(Source: `apy-chart.tsx:75–125`)_
- **FR-008**: The chart Y-axis labels MUST compact values: `>=1_000_000` → `{n}M%`, `>=1_000` → `{n}K%`, else `{n}%`. _(Source: `apy-chart.tsx:49–57`)_
- **FR-009**: The screen MUST provide a back affordance labeled "Back to all coins" with `accessibilityLabel="Navigate back to pool list"` and a minimum tap target of 44px. _(Source: `pool-details-header.tsx`)_
- **FR-010**: The "View on DefiLlama" CTA MUST open `https://defillama.com/yields/pool/{pool.id}` — `window.open(..., "_blank", "noopener,noreferrer")` on web; `WebBrowser.openBrowserAsync` on iOS/Android. _(Source: `pool-details/index.tsx:26–35`)_
- **FR-011**: Layout MUST be responsive: APY/project blocks stack as column on mobile (<768dp) and lay out as row on tablet/desktop; chart height is `200px` on mobile, `250px` on tablet/desktop; CTA is full-width on mobile and fit-content on tablet/desktop. _(Source: `pool-info-card.tsx:29–34`, `apy-chart.tsx:72`, `pool-details/index.tsx:55–60`)_
- **FR-012**: The screen MUST be wrapped in `<ScreenWrapper>` (Suspense + ErrorBoundary + QueryErrorResetBoundary). _(Source: `src/app/pool-details.tsx:20`)_

### Key Entities

- **Pool** _(domain entity, pre-existing from home-screen feature)_: `{ id: string, chain: string, project: string, symbol: string, apy: number }` — `src/domain/pool/pool.ts:1–7`
- **ApyDataPoint** _(domain entity, added for this feature)_: `{ timestamp: string, apy: number }` — `src/domain/pool/pool.ts:9–12`. Represents one point in the 30-day APY history series.
- **PoolRepo** _(extended for this feature)_: added `findApyHistory(poolId: string): Promise<ApyDataPoint[]>` — `src/domain/pool/pool-repo.ts:5`

### Layer Impact

- **Domain** (`src/domain/pool/`): added `ApyDataPoint` type; added `findApyHistory` to `PoolRepo` interface; added `usePoolApyHistory` use-case hook in `src/domain/pool/use-cases/use-pool-apy-history.ts`.
- **Infrastructure** (`src/infra/repositories/http-repository/pool/`): added `DefiLlamaGetChartResponseDTO` to `pool-dto.ts`; added `defiLlamaChartDTOToApyHistory` to `pool-adapter.ts`; implemented `findApyHistory` on `HttpPoolRepo` calling `GET /chart/{poolId}`.
- **Presentation**: added route at `src/app/pool-details.tsx`; added screen at `src/screens/pool-details/index.tsx`; added 5 screen-local components (`pool-details-header`, `pool-identity-block`, `pool-info-card`, `apy-chart`, `apy-chart.web`).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can navigate from the home pool list to a pool's details screen in a single tap.
- **SC-002**: The pool details screen presents APY, project, chain, and a 30-day APY chart without requiring the user to scroll on a typical mobile device (when the chart is in success or loading state).
- **SC-003**: Chart errors do not break the rest of the screen: APY, project, chain, and the "View on DefiLlama" CTA remain interactive and the user can retry the chart in place.
- **SC-004**: External link to DefiLlama opens in the platform-appropriate context (new browser tab on web, in-app browser on native) for 100% of taps.

## Assumptions

- The `Pool` object passed through `useLocalSearchParams` is trusted to be well-formed because the only producer is Yieldly's home screen, which gets it from the typed `PoolRepo.findAll()` result. Direct deep-links from outside the app are not a supported flow; the fallback behavior is pinned by `src/app/__tests__/pool-details.test.tsx`.
- The DefiLlama pool URL pattern `https://defillama.com/yields/pool/{id}` is stable.
- The DefiLlama `/chart/{poolId}` endpoint returns a 30-day history (no client-side windowing or pagination is done).

## Known Gaps & Divergences _(migration-only section)_

These items surfaced during reverse-engineering. All four were resolved on **2026-05-18** in the same session as the migration. Preserved here for historical traceability and to keep this spec accurate as a snapshot of what the migration found.

1. ✅ **RESOLVED — APY history is real, not mocked.** Original gap: `CLAUDE.md` § "Yieldly — Pool Details Screen" said "APY history will use mock data" but the shipped implementation hits the real DefiLlama `/chart/{poolId}` endpoint via `HttpPoolRepo.findApyHistory`. **Fix**: `CLAUDE.md:300` rewritten to describe the real API + 5-minute React Query cache, with a note that the mock-data approach was abandoned during implementation.
2. ✅ **RESOLVED — Deep-link with missing route params now has test coverage.** Original gap: `src/app/pool-details.tsx:18–24` silently falls back to empty strings and `0` if a query param is missing; no test, spec, or telemetry covered this case. **Fix**: new test file `src/app/__tests__/pool-details.test.tsx` (5 cases — complete params, all-missing, float parse, partial params, `onBack` wiring) pins the current fallback behavior. No runtime validation/redirect was added — the fallback is now an explicitly tested contract rather than implicit behavior.
3. ✅ **RESOLVED — Platform-specific chart split is documented.** Original gap: `apy-chart.tsx` (Skia/`victory-native`) and `apy-chart.web.tsx` coexist via Metro's platform-extension resolution with no comment or doc. **Fix**: 3-line header comments added to both files explaining the split, why Skia doesn't fit the web, and the requirement to keep the `ApyChartProps` contract in sync between the two implementations.
4. ✅ **RESOLVED — Chart-local error scope is documented.** Original gap: `ApyChart` receives `error` / `onRetry` props and handles errors in-zone, intentionally bypassing the screen-wide `ScreenWrapper` ErrorBoundary — but this design decision was not documented. **Fix**: inline comment added in `src/screens/pool-details/components/pool-info-card.tsx` next to the `usePoolApyHistory` call, pinning the "do NOT bubble to ScreenWrapper" intent so a future refactor does not undo it by accident.
