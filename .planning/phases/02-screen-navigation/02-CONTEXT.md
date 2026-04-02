# Phase 2: Screen & Navigation - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the pool details screen and wire home-to-details push navigation. The screen shows pool identity (icon + symbol), current APY, project name, chain badge, and an "Open [Project]" CTA button. The card also reserves space for the chart (Phase 3). Navigation uses Expo Router push with pool data passed as route params.

This phase does NOT include the Victory Native chart (Phase 3) or any new domain/infra work (Phase 1 complete).

</domain>

<decisions>
## Implementation Decisions

### Screen Composition
- **D-01:** Layout follows the reference screenshots exactly. Three visual zones: (1) token identity header (icon + bold symbol), (2) single white card with APY info + project/chain info, (3) CTA button outside the card.
- **D-02:** On mobile: APY, project name, and chain badge are stacked vertically inside the card. On desktop (>=768dp): APY on the left, project name + chain badge on the right (side-by-side row).
- **D-03:** The card in Phase 2 renders APY + project/chain info only. The chart area is absent — Phase 3 adds the chart component into the card. No placeholder or skeleton.

### Pool Data Strategy
- **D-04:** Pass the full Pool object (`id`, `chain`, `project`, `symbol`, `apy`, `url`) as serialized route params via Expo Router. No `findById` repo method needed. The details screen displays instantly from params.

### Header & Navigation
- **D-05:** Build a custom `PoolDetailsHeader` component with "← Back to all coins" text and a left arrow icon. Uses `router.back()` for navigation.
- **D-06:** Root layout keeps `headerShown: false` — custom headers are the established pattern (home screen already uses a custom `Header` component).
- **D-07:** Push navigation from home screen: tapping a `PoolListItem` calls `router.push()` with pool data as params.

### CTA Button
- **D-08:** "Open [Project] ↗" button opens the pool's URL in the device's external browser (via `expo-web-browser` or `Linking.openURL`).
- **D-09:** Button is full-width green on mobile, left-aligned compact green on desktop (matching the reference screenshots).

### Token Identity
- **D-10:** Token full name (e.g., "Tether") is OUT OF SCOPE — only the symbol (e.g., "USDT") displays next to the icon. Confirmed: skip subtitle per PROJECT.md decision.

### Claude's Discretion
- Route file structure (e.g., `src/app/pool/[id].tsx` or `src/app/pool-details.tsx`)
- Exact component decomposition within the screen (how many sub-components)
- ScrollView vs flat layout for the screen content
- How to serialize/deserialize Pool object in route params
- Loading state handling if route params are somehow missing

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design
- `~/Desktop/Screenshot 2026-03-31 at 20.47.42.png` — Desktop layout: top half (header, token identity, card with APY/project)
- `~/Desktop/Screenshot 2026-03-31 at 20.48.10.png` — Desktop layout: bottom half (chart, CTA button)
- `~/Desktop/Screenshot 2026-03-31 at 20.48.56.png` — Mobile layout: top half (header, token identity, card with stacked APY/project)
- `~/Desktop/Screenshot 2026-03-31 at 20.49.03.png` — Mobile layout: bottom half (chart, full-width CTA button)

### Domain Layer
- `src/domain/pool/pool.ts` — Pool entity interface (fields to display)
- `src/domain/pool/pool-repo.ts` — PoolRepo interface (already has findApyHistory from Phase 1)

### Existing Components to Reuse/Follow
- `src/screens/home/components/pool-list-item.tsx` — Navigation trigger, symbol icon pattern to reuse
- `src/components/header.tsx` — Existing app header pattern
- `src/components/screen-wrapper.tsx` — Suspense + ErrorBoundary wrapper
- `src/components/core/badge.tsx` — Chain badge component (reuse for "● Optimism")
- `src/components/core/button.tsx` — CTA button base
- `src/components/core/text.tsx` — Text component with platform variants

### Infrastructure
- `src/app/_layout.tsx` — Root layout (Stack with headerShown: false, provider tree)
- `src/app/index.tsx` — Home route pattern to follow for details route
- `src/screens/home/index.tsx` — Home screen (where pool tap currently lives)

### Hooks
- `src/hooks/use-device-layout.ts` — Responsive breakpoint hook (mobile vs desktop)

### Phase 1 Context
- `.planning/phases/01-infrastructure/01-CONTEXT.md` — Prior decisions (data pipeline, caching, query patterns)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PoolListItem` symbol icon pattern (green bg box with symbol text) — reuse exact same component or extract shared icon
- `Badge` component — already used for chain display with green dot pattern
- `Button` component — core button with variants, use for CTA
- `Text` component — platform-aware text with size variants
- `useDeviceLayout()` hook — returns `isMobile`/`isTablet`/`isDesktop` for responsive layout
- `ScreenWrapper` — Suspense + ErrorBoundary wrapper for route screens
- `Header` component — app-level header with Yieldly logo (stays at top in screenshots)

### Established Patterns
- **Screen structure**: Route in `src/app/` (thin wrapper) + screen in `src/screens/` (full implementation) + screen-local `components/` and `hooks/`
- **Responsive layout**: `useDeviceLayout()` hook with conditional className via `cn()`
- **Navigation**: Expo Router `Stack` — currently only one route (`/`), details screen will be the second
- **Styling**: NativeWind v4 with `className` prop, `cn()` for conditional classes, CSS variables for theming

### Integration Points
- `PoolListItem.onPress` currently receives `(pool: Pool)` — wire to `router.push()` with pool params
- `src/app/` needs a new route file for the details screen
- `src/screens/` needs a new `pool-details/` directory with screen component

</code_context>

<specifics>
## Specific Ideas

- Reference screenshots show the Yieldly header persists at the top of the details screen (same as home)
- The "← Back to all coins" is NOT in the Yieldly header — it's below it, as a standalone navigation link
- The token icon uses the same green-bg rounded-square style as the home screen list items
- The white card has subtle shadow/border (same card style as home screen list items but larger)
- "Open Aave ↗" button uses an external link icon (arrow pointing up-right)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-screen-navigation*
*Context gathered: 2026-04-01*
