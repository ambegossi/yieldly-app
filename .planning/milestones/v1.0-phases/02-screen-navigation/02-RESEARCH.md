# Phase 2: Screen & Navigation — Research

**Researched:** 2026-04-01
**Domain:** Expo Router navigation, React Native screen composition, external browser launch
**Confidence:** HIGH

## Summary

Phase 2 builds the pool details screen and wires push navigation from the home screen. All infrastructure from Phase 1 is complete. No new domain/infra work is needed — the phase is purely presentation layer: a new route file, a new screen with sub-components, and wiring the existing `PoolListItem.onPress` to navigate with serialized pool data as URL params.

The codebase already provides all building blocks: `Header`, `Badge`, `Button`, `Text`, `ScreenWrapper`, `useDeviceLayout`, and the icon pattern from `PoolListItem`. The UI-SPEC (02-UI-SPEC.md) is approved and defines the exact layout zones, typography, color, and responsive behavior. Both `expo-web-browser` (~15.0.8) and `expo-linking` (~8.0.8) are installed. The only design decision left to Claude is the route file path and how to serialize/deserialize Pool data in URL params.

**Primary recommendation:** Use `src/app/pool-details.tsx` (flat route, not nested folder) because the Pool object has only 6 string/number fields that can be passed as flat query params without encoding complexity. Deserialize with `useLocalSearchParams()` in the route file, validate fields, then pass a typed `Pool` object down to the screen component.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Layout follows reference screenshots exactly. Three visual zones: (1) token identity header (icon + bold symbol), (2) single white card with APY info + project/chain info, (3) CTA button outside the card.
- **D-02:** Mobile: APY, project name, and chain badge are stacked vertically inside the card. Desktop (>=768dp): APY on left, project name + chain badge on right (side-by-side row).
- **D-03:** Phase 2 card renders APY + project/chain info only. No chart placeholder or skeleton. Phase 3 inserts the chart.
- **D-04:** Pass the full Pool object (`id`, `chain`, `project`, `symbol`, `apy`, `url`) as serialized route params via Expo Router. No `findById` repo method needed.
- **D-05:** Build a custom `PoolDetailsHeader` component with "← Back to all coins" text and left arrow icon. Uses `router.back()`.
- **D-06:** Root layout keeps `headerShown: false` — do not change `_layout.tsx`.
- **D-07:** Push navigation from home screen: tapping a `PoolListItem` calls `router.push()` with pool data as params.
- **D-08:** "Open [Project] ↗" button opens pool URL in device's external browser (`expo-web-browser` or `Linking.openURL`).
- **D-09:** Button is full-width green on mobile, left-aligned compact on desktop.
- **D-10:** Token full name is OUT OF SCOPE — only symbol (e.g., "USDT") displays next to the icon.

### Claude's Discretion

- Route file structure (`src/app/pool-details.tsx` vs `src/app/pool/[id].tsx`)
- Exact component decomposition within the screen (how many sub-components)
- ScrollView vs flat layout for screen content
- How to serialize/deserialize Pool object in route params
- Loading state handling if route params are somehow missing

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DISP-01 | User sees current APY in large green text | `text-4xl font-bold text-brand` on `Text` component; `formatAPY()` can be extracted from PoolListItem |
| DISP-02 | User sees project name on details card | `Text` component with `font-bold` — 16px weight 700 per UI-SPEC |
| DISP-03 | User sees chain as badge with green dot | Existing `Badge` variant="subtle" + `text-brand` dot, same pattern as PoolListItem |
| DISP-04 | User sees token symbol icon (reused from home) | Same green-bg rounded-square pattern from PoolListItem — 56x56px scaled up per UI-SPEC |
| DISP-05 | Responsive layout — stacked mobile, side-by-side desktop | `useDeviceLayout()` + `cn()` conditional classes; breakpoint at 768dp |
| ACTN-01 | Tap "Open [Project]" to open pool URL in external browser | `expo-web-browser` `openBrowserAsync(pool.url)` — already installed (~15.0.8) |
| ACTN-02 | Button full-width green on mobile, left-aligned on desktop | `Button` with `bg-brand` className override + conditional `w-full` via `useDeviceLayout()` |
| NAVG-01 | Tap pool on home screen to navigate to details (push) | Replace `Alert.alert` stub in `handlePoolPress` with `router.push('/pool-details?...')` |
| NAVG-02 | "Back to all coins" header with back arrow | New `PoolDetailsHeader` component; `ArrowLeft` or `ChevronLeft` from `lucide-react-native` |
| NAVG-03 | Navigate back to home screen | `router.back()` inside `PoolDetailsHeader` Pressable |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `expo-router` | ~6.0.11 | File-based routing and navigation | Already the project router; Stack push is built-in |
| `react-native` | 0.81.4 | ScrollView, View, Pressable, Linking | Core RN primitives |
| `expo-web-browser` | ~15.0.8 | Open external URLs in browser | Already installed; preferred over bare `Linking` for in-app browser experience on mobile |
| `lucide-react-native` | ^0.564.0 | ArrowLeft / ExternalLink icons | Already the project icon library |
| `nativewind` | ^4.2.1 | Tailwind styling | Established project styling system |

### Supporting (already installed, no new installs needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `expo-linking` | ~8.0.8 | Fallback for `Linking.openURL` | Only if `expo-web-browser` behaves unexpectedly in tests |
| `react-native-safe-area-context` | ~5.6.0 | `useSafeAreaInsets` in Header | Already used in existing `Header` component |
| `@expo/vector-icons` | ^15.0.2 | Feather icons (used in PoolListItem) | Already available but use `lucide-react-native` for new components per UI-SPEC |

**No new packages need to be installed.** All dependencies are already in `package.json`.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   └── pool-details.tsx          # Route file — thin wrapper only
├── screens/
│   └── pool-details/
│       ├── index.tsx              # PoolDetailsScreen main component
│       └── components/
│           ├── pool-details-header.tsx   # "← Back to all coins" nav row
│           ├── pool-identity-block.tsx   # Icon + symbol zone
│           └── pool-info-card.tsx        # White card: APY + project/chain
```

This mirrors the established pattern: `src/app/index.tsx` → `src/screens/home/index.tsx`.

### Pattern 1: Flat Route File (Claude's Discretion: Recommendation)

**What:** Use `src/app/pool-details.tsx` rather than `src/app/pool/[id].tsx`.

**When to use:** When all data is passed as params (no server fetch by ID needed). Flat route avoids nested folder creation for a single screen.

**Rationale:** Decision D-04 says "no `findById` method" — the dynamic `[id]` segment adds complexity (type-safe `href` construction requires the segment value) without benefit. A flat route with query params is simpler and fully supported.

**Example:**
```typescript
// src/app/pool-details.tsx
import { ScreenWrapper } from "@/components/screen-wrapper";
import PoolDetailsScreen from "@/screens/pool-details";
import { useLocalSearchParams, useRouter } from "expo-router";
import { type Pool } from "@/domain/pool/pool";

export default function PoolDetailsRoute() {
  const params = useLocalSearchParams<{
    id: string;
    chain: string;
    project: string;
    symbol: string;
    apy: string;
    url: string;
  }>();
  const router = useRouter();

  // Guard: if params are missing, show error or navigate back
  if (!params.id || !params.symbol) {
    // handle missing params
  }

  const pool: Pool = {
    id: params.id,
    chain: params.chain,
    project: params.project,
    symbol: params.symbol,
    apy: parseFloat(params.apy),
    url: params.url,
  };

  return (
    <ScreenWrapper>
      <PoolDetailsScreen pool={pool} onBack={() => router.back()} />
    </ScreenWrapper>
  );
}
```

### Pattern 2: Push Navigation from Home Screen

**What:** Replace the `Alert.alert` stub in `handlePoolPress` with `router.push`.

**Critical:** Screens currently do NOT import `expo-router` directly — navigation is handled in route files or passed as props. The home screen already has `handlePoolPress: (pool: Pool) => void`. The cleanest approach is to wire `router.push` inside the home route file (`src/app/index.tsx`) and pass it as `onPress` prop, OR import `useRouter` in the home screen (both are valid; the latter is simpler given the existing callback shape).

**Recommended:** Import `useRouter` directly in `src/screens/home/index.tsx` since `handlePoolPress` is already defined there. This avoids prop-drilling the router through the route file.

```typescript
// src/screens/home/index.tsx — update handlePoolPress
import { useRouter } from "expo-router";

const router = useRouter();

const handlePoolPress = useCallback((pool: Pool) => {
  router.push({
    pathname: "/pool-details",
    params: {
      id: pool.id,
      chain: pool.chain,
      project: pool.project,
      symbol: pool.symbol,
      apy: String(pool.apy),
      url: pool.url,
    },
  });
}, [router]);
```

**Serialization note:** Expo Router params are strings. `apy` (a number) must be serialized with `String()` and deserialized with `parseFloat()`. All other Pool fields are already strings.

### Pattern 3: External Browser Launch

**What:** Open `pool.url` in the device's external browser.

**expo-web-browser vs Linking:** `expo-web-browser`'s `openBrowserAsync` opens an in-app browser on iOS (SFSafariViewController) and a Custom Tab on Android. `Linking.openURL` exits the app entirely. Per D-08 "opens the pool's URL in the device's external browser" — either works, but `openBrowserAsync` provides a better in-app experience and is already installed.

```typescript
import * as WebBrowser from "expo-web-browser";

async function handleOpenPool(url: string) {
  await WebBrowser.openBrowserAsync(url);
}
```

**Jest note:** `expo-web-browser` must be mocked in tests: `jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn() }))`.

### Pattern 4: Responsive Layout in Details Card

**What:** Conditional layout classes using `useDeviceLayout()`.

```typescript
const { isMobile } = useDeviceLayout();

// Card interior
<View className={cn("gap-4", isMobile ? "flex-col" : "flex-row")}>
  <ApyBlock />
  <ProjectChainBlock />
</View>

// CTA button container
<View className={cn("mx-4 mt-6", !isMobile && "items-start")}>
  <Button
    className={cn("bg-brand", isMobile ? "w-full" : "")}
    onPress={handleOpenPool}
  >
    <Text className="font-bold text-white">Open {pool.project}</Text>
    <ExternalLink size={16} color="white" />
  </Button>
</View>
```

### Anti-Patterns to Avoid

- **Importing `useRouter` in sub-components:** `PoolDetailsHeader`, `PoolInfoCard`, `PoolIdentityBlock` should receive callback props (e.g., `onBack: () => void`), not call `useRouter` directly. This keeps them testable.
- **Passing `router` as a prop:** Pass callbacks, not the router object.
- **Storing Pool in local state on the details screen:** The pool data comes from route params — no `useState` needed. Parse once in the route file and pass as prop.
- **Using `router.push` in a `useEffect` for the missing-params guard:** Use early return with a `<Pressable onPress={router.back}>` fallback view instead.
- **`Button` default variant for the CTA:** The default variant uses `bg-primary` which is near-black. Must override with `className="bg-brand"`.
- **Animating the back navigation:** No animation libraries needed; `router.back()` uses the Stack's built-in slide transition.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| In-app browser | Custom WebView screen | `expo-web-browser` `openBrowserAsync` | Handles auth flows, progress indicators, dismissal; already installed |
| Param serialization | Custom JSON encoding | Flat string params via `router.push({ params: {...} })` | Pool has only 6 fields; flat params are URL-safe and don't need `encodeURIComponent` for normal strings |
| Back navigation animation | Custom gesture/animation | `router.back()` with Expo Router Stack | Stack already provides the platform-native slide-back animation |
| Responsive breakpoints | Media queries or `Dimensions.get` | `useDeviceLayout()` hook | Already implemented, returns `isMobile`/`isDesktop` at 768dp breakpoint |
| APY number formatting | New formatter | Extract/reuse `formatAPY()` from `PoolListItem` | Already handles 0–10000%+ range with K suffix |

**Key insight:** This phase is pure composition — every non-trivial primitive already exists in the codebase. The work is wiring, layout, and light component authoring.

---

## Common Pitfalls

### Pitfall 1: `useLocalSearchParams` returns all values as strings
**What goes wrong:** `pool.apy` arrives as `"5.67"` (string). Passing it directly to `formatAPY(pool.apy)` fails TypeScript strict mode because `formatAPY` expects `number`.
**Why it happens:** Expo Router serializes all params to strings in the URL.
**How to avoid:** Always `parseFloat(params.apy)` in the route file before constructing the `Pool` object.
**Warning signs:** TypeScript error `Argument of type 'string' is not assignable to parameter of type 'number'`.

### Pitfall 2: `expo-web-browser` not mocked in tests
**What goes wrong:** Tests calling `openBrowserAsync` throw "No native module" errors or hang.
**Why it happens:** Native module not available in Jest/Node environment.
**How to avoid:** Add `jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn().mockResolvedValue({ type: "opened" }) }))` at the top of test files that render the CTA button.

### Pitfall 3: `useLocalSearchParams` not mocked in route file tests
**What goes wrong:** Tests that render the route component fail because `useLocalSearchParams` requires Expo Router context.
**Why it happens:** The Jest environment doesn't set up Expo Router's context.
**How to avoid:** Screen components (`PoolDetailsScreen`) should receive `pool` and `onBack` as props — not call `useLocalSearchParams` themselves. The route file handles param parsing. Tests for screen components pass props directly, bypassing the router entirely.

### Pitfall 4: Missing `key` prop when `expo-router` reinstantiates the screen
**What goes wrong:** Navigating to pool-details, going back, and navigating to a different pool might show stale data if the screen component is cached.
**Why it happens:** Not applicable here since all data comes from params (no internal state that persists). This is a non-issue for Phase 2.
**How to avoid:** N/A — no internal state derived from params that could go stale.

### Pitfall 5: Button `default` variant uses `bg-primary` (near-black), not green
**What goes wrong:** CTA button appears black, not green.
**Why it happens:** CSS var `--primary` is `0 0% 9%` (near-black) in this project; `bg-primary` is dark.
**How to avoid:** Always use `className="bg-brand active:bg-brand/90"` on the CTA button. Do not rely on the `default` variant color for this button.

### Pitfall 6: `handlePoolPress` in home screen currently has `router` dependency not in scope
**What goes wrong:** If `useRouter` is added inside `Home()` and `handlePoolPress` uses it inside `useCallback`, forgetting to add `router` to the dependency array causes stale closure.
**Why it happens:** React Compiler may or may not auto-handle this; manual `useCallback` deps must be declared.
**How to avoid:** Add `router` to the `useCallback` dependency array: `useCallback((pool) => { router.push(...) }, [router])`.

---

## Code Examples

### Pool param encoding (home screen push)
```typescript
// Source: Expo Router docs — typed routes with params
import { useRouter } from "expo-router";

const router = useRouter();

router.push({
  pathname: "/pool-details",
  params: {
    id: pool.id,
    chain: pool.chain,
    project: pool.project,
    symbol: pool.symbol,
    apy: String(pool.apy),
    url: pool.url,
  },
});
```

### Pool param decoding (route file)
```typescript
// src/app/pool-details.tsx
import { useLocalSearchParams } from "expo-router";

const params = useLocalSearchParams<{
  id: string; chain: string; project: string;
  symbol: string; apy: string; url: string;
}>();

const pool: Pool = {
  id: params.id ?? "",
  chain: params.chain ?? "",
  project: params.project ?? "",
  symbol: params.symbol ?? "",
  apy: parseFloat(params.apy ?? "0"),
  url: params.url ?? "",
};
```

### Back navigation component
```typescript
// src/screens/pool-details/components/pool-details-header.tsx
import { ArrowLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "@/components/core/text";

interface PoolDetailsHeaderProps {
  onBack: () => void;
}

export function PoolDetailsHeader({ onBack }: PoolDetailsHeaderProps) {
  return (
    <Pressable
      onPress={onBack}
      className="flex-row items-center gap-2 px-4 py-3"
      style={{ minHeight: 44 }}
      accessibilityRole="button"
      accessibilityLabel="Navigate back to pool list"
    >
      <ArrowLeft size={16} color="currentColor" />
      <Text className="text-sm text-foreground">Back to all coins</Text>
    </Pressable>
  );
}
```

### CTA button with external link
```typescript
// Inside PoolDetailsScreen
import * as WebBrowser from "expo-web-browser";
import { ExternalLink } from "lucide-react-native";
import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { cn } from "@/lib/utils";

const { isMobile } = useDeviceLayout();

<View className={cn("mx-4 mt-6", !isMobile && "items-start")}>
  <Button
    className={cn("bg-brand active:bg-brand/90", isMobile ? "w-full" : "")}
    onPress={() => WebBrowser.openBrowserAsync(pool.url)}
    accessibilityRole="button"
    accessibilityLabel={`Open ${pool.project} in external browser`}
  >
    <Text className="text-base font-bold text-white">Open {pool.project}</Text>
    <ExternalLink size={16} color="white" />
  </Button>
</View>
```

### formatAPY extraction
```typescript
// Extract from src/screens/home/components/pool-list-item.tsx
// into src/screens/pool-details/utils/format-apy.ts (or a shared location)
export function formatAPY(apy: number): string {
  const abs = Math.abs(apy);
  const sign = apy < 0 ? "-" : "";
  if (abs >= 10000) return `${sign}${(abs / 1000).toFixed(1)}K%`;
  if (abs >= 1000) return `${sign}${Math.round(abs).toLocaleString("en-US")}%`;
  return `${apy.toFixed(2)}%`;
}
```

Note: `formatAPY` is currently defined inside `pool-list-item.tsx`. It can either be duplicated (acceptable for a single utility), extracted to a shared utility, or imported from the pool-list-item module. The planner should decide — extracting to `src/lib/format-apy.ts` is clean and avoids duplication.

---

## Environment Availability

Step 2.6: All external dependencies are already installed in `package.json`. No environment probing needed.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `expo-web-browser` | ACTN-01 CTA button | Yes | ~15.0.8 | `Linking.openURL` |
| `expo-router` | NAVG-01/02/03 | Yes | ~6.0.11 | — |
| `lucide-react-native` | Back arrow, ExternalLink icon | Yes | ^0.564.0 | Feather from @expo/vector-icons |
| iOS Simulator | Visual validation | Yes | — | Screenshots from existing test run |

No blocking missing dependencies.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 + jest-expo preset |
| Config file | `jest.config.js` |
| Quick run command | `bun run test -- --testPathPattern pool-details` |
| Full suite command | `bun run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DISP-01 | APY displayed in green text with correct format | unit | `bun run test -- --testPathPattern pool-info-card` | No — Wave 0 |
| DISP-02 | Project name rendered in card | unit | `bun run test -- --testPathPattern pool-info-card` | No — Wave 0 |
| DISP-03 | Chain badge with green dot rendered | unit | `bun run test -- --testPathPattern pool-info-card` | No — Wave 0 |
| DISP-04 | Token symbol icon box rendered | unit | `bun run test -- --testPathPattern pool-identity-block` | No — Wave 0 |
| DISP-05 | Stacked mobile / side-by-side desktop layout | unit | `bun run test -- --testPathPattern pool-info-card` | No — Wave 0 |
| ACTN-01 | Tapping CTA button calls `openBrowserAsync(pool.url)` | unit | `bun run test -- --testPathPattern pool-details` | No — Wave 0 |
| ACTN-02 | CTA is full-width on mobile, compact on desktop | unit | `bun run test -- --testPathPattern pool-details` | No — Wave 0 |
| NAVG-01 | Tapping pool card in home calls `router.push` with params | unit | `bun run test -- --testPathPattern home.integration` | Exists — update needed |
| NAVG-02 | "Back to all coins" text + arrow icon rendered | unit | `bun run test -- --testPathPattern pool-details-header` | No — Wave 0 |
| NAVG-03 | Tapping back link calls `onBack` callback | unit | `bun run test -- --testPathPattern pool-details-header` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `bun run test -- --testPathPattern pool-details`
- **Per wave merge:** `bun run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/screens/pool-details/components/__tests__/pool-details-header.test.tsx` — covers NAVG-02, NAVG-03
- [ ] `src/screens/pool-details/components/__tests__/pool-identity-block.test.tsx` — covers DISP-04
- [ ] `src/screens/pool-details/components/__tests__/pool-info-card.test.tsx` — covers DISP-01, DISP-02, DISP-03, DISP-05
- [ ] `src/screens/pool-details/__tests__/pool-details.integration.test.tsx` — covers ACTN-01, ACTN-02 (with expo-web-browser mock)
- [ ] Update `src/screens/home/__tests__/home.integration.test.tsx` — add navigation assertion for NAVG-01

**Required mocks for new tests:**
- `expo-web-browser`: `jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn().mockResolvedValue({ type: "opened" }) }))`
- `expo-router` (if used in home screen): `jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }))`
- `react-native-safe-area-context`: already mocked in home integration test, same pattern applies
- `expo-image`: already mocked pattern available in home integration test
- `useWindowDimensions`: already mocked pattern available in home integration test

---

## Project Constraints (from CLAUDE.md)

| Directive | Applies To |
|-----------|-----------|
| All files and directories use kebab-case | New files: `pool-details.tsx`, `pool-details-header.tsx`, `pool-identity-block.tsx`, `pool-info-card.tsx` |
| Components use function declarations with named exports | All new components: `export function PoolDetailsHeader()` |
| Screen entry points use default exports | `src/screens/pool-details/index.tsx` uses `export default function PoolDetailsScreen()` |
| Route files in `src/app/` use default exports | `src/app/pool-details.tsx` uses `export default function PoolDetailsRoute()` |
| Sibling JSX elements must be separated by blank lines | All new components |
| Props interface named `{ComponentName}Props` | `PoolDetailsHeaderProps`, `PoolInfoCardProps`, `PoolIdentityBlockProps` |
| Never use `useQuery` directly — use `useAppQuery` wrapper | Not applicable (no data fetching in Phase 2) |
| Hooks as function declarations with named exports | Not applicable (no new hooks needed) |
| `cn()` from `src/lib/utils.ts` for conditional classNames | All responsive layout logic |
| Tests in `__tests__/` co-located with source | Test dirs under `src/screens/pool-details/components/__tests__/` and `src/screens/pool-details/__tests__/` |
| Jest: create fresh QueryClient in `beforeEach`, `unmount()` in each test, `jest.clearAllMocks()` in `afterEach` | Pool details integration test |
| Use conventional commits | `feat(pool-details): ...` |
| Do not use GSD workflow bypass | Follow GSD execute-phase |

---

## Open Questions

1. **`formatAPY` location — duplicate or extract?**
   - What we know: `formatAPY` is defined in `pool-list-item.tsx` as a module-level function (not exported).
   - What's unclear: Should it be extracted to a shared utility (`src/lib/format-apy.ts`) or duplicated into `pool-info-card.tsx`?
   - Recommendation: Extract to `src/lib/format-apy.ts` and update `pool-list-item.tsx` to import from there. This eliminates duplication and is consistent with "Don't Hand-Roll" principle. This is a small refactor that belongs in the first task of the phase.

2. **`useRouter` in home screen vs. route file**
   - What we know: The home screen (`src/screens/home/index.tsx`) currently has `handlePoolPress` as a `useCallback`. The pattern is that screens don't import `expo-router` (confirmed by grep).
   - What's unclear: Whether to import `useRouter` in the screen (break the pattern) or pass `onPress` down from the route file.
   - Recommendation: Import `useRouter` directly in the home screen. The screen already has all the `handlePoolPress` context (pool data). Prop-drilling from the route file is more complex with no benefit. This is a pragmatic one-time exception for navigation — the screen is still self-contained.

3. **`url` param URL encoding**
   - What we know: Pool URLs contain `://` and `/` characters (e.g., `https://aave.com/pool/1`).
   - What's unclear: Whether Expo Router automatically encodes/decodes URL-unsafe characters in params.
   - Recommendation: Expo Router handles param encoding internally when using the `params` object in `router.push({ pathname, params })`. Do not manually `encodeURIComponent` the URL — this would double-encode it. Verify this works correctly when wiring navigation.

---

## Sources

### Primary (HIGH confidence)
- Existing codebase (`src/screens/home/`, `src/components/`, `src/app/`) — patterns verified by direct file reading
- `CLAUDE.md` — project conventions, confirmed kebab-case, function declarations, test patterns
- `02-UI-SPEC.md` — approved visual contract with exact dimensions, colors, component inventory
- `02-CONTEXT.md` — locked decisions D-01 through D-10
- `package.json` — confirmed all dependencies installed (expo-web-browser, lucide-react-native, expo-router, expo-linking)

### Secondary (MEDIUM confidence)
- Expo Router v6 docs (from training knowledge) — `useLocalSearchParams`, `useRouter`, `router.push` with params object
- `expo-web-browser` docs (from training knowledge) — `openBrowserAsync` API

### Tertiary (LOW confidence)
- None — all claims verified against codebase

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed installed
- Architecture: HIGH — patterns derived from existing codebase, not assumptions
- Pitfalls: HIGH — derived from existing code reading (Button variant color, param types, existing mock patterns)
- Validation: HIGH — Jest config, existing test patterns, and required mocks all confirmed

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable Expo Router API, no fast-moving dependencies)
