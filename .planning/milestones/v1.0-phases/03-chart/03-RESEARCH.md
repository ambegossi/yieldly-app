# Phase 3: Chart - Research

**Researched:** 2026-04-01
**Domain:** Victory Native (Skia-based charting) + React Native line chart integration
**Confidence:** HIGH

## Summary

Phase 3 integrates Victory Native into the existing `PoolInfoCard` component to render a 30-day APY line chart. The data pipeline (Phase 1) and screen structure (Phase 2) are complete; this phase is purely a presentation layer concern. The core work is: install `victory-native` + `@shopify/react-native-skia` (Expo-bundled version 2.2.12), add a font asset file for axis labels, build `ApyChart` component with four visual states (loading/error/empty/success), update `PoolInfoCard` to accept `poolId` and render the chart, and configure Jest to support Skia mocking.

The key technical constraint is that Victory Native's CartesianChart **requires a Skia font object** (`useFont` from `@shopify/react-native-skia`) for axis labels to render. Without a font file in the project, axis labels are silently suppressed. A TTF font file must be added to `src/assets/fonts/` and loaded via `useFont`. Since Expo SDK 54 bundles `@shopify/react-native-skia@2.2.12` and includes it in Expo Go, the Expo Dev Client concern in STATE.md may be moot for development — but the CONTEXT.md decision D-14 explicitly requires Dev Client for native testing, so this plan honors that.

For Jest, `@shopify/react-native-skia` requires special setup: `testEnvironment: "@shopify/react-native-skia/jestEnv.js"` and `setupFilesAfterEnv: ["@shopify/react-native-skia/jestSetup.js"]`. Victory Native itself should be mocked in chart component tests to avoid Skia rendering in the test environment.

**Primary recommendation:** Use `CartesianChart` + `Line` from `victory-native` with `useFont` from `@shopify/react-native-skia` for axis label rendering. Add a single TTF font file (e.g., `SpaceMono-Regular.ttf` — already available in many Expo projects, or `inter-medium.ttf`) to `src/assets/fonts/`. Update Jest config with Skia environment and setup. Mock `victory-native` entirely in chart component unit tests.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Green line only, no area fill or gradient underneath the line
- **D-02:** No grid lines — Y-axis percentage labels on left side only, no horizontal lines crossing the chart area
- **D-03:** Responsive X-axis date labels — ~6 labels on desktop, ~3 on mobile to avoid overlap
- **D-04:** Y-axis labels use auto precision — show decimals only when needed (e.g., "7%" but "2.5%")
- **D-05:** Line color is brand green `#00AD69`
- **D-06:** Fixed chart height (~200px mobile, ~250px desktop)
- **D-07:** Chart renders inside the existing `PoolInfoCard` component, below the APY/project/chain info section
- **D-08:** Loading state: skeleton placeholder (pulsing gray rectangle) matching chart dimensions
- **D-09:** Error state: "Failed to load chart" text + "Try again" retry button within chart area; rest of pool details stays visible
- **D-10:** Empty data state: "No data available" centered text — distinct from error (no retry button)
- **D-11:** Caption "APY history over the last 30 days" is always visible in all states
- **D-12:** Static display only — no touch/press interaction, no tooltips, no crosshair
- **D-13:** Victory Native + `@shopify/react-native-skia` installation is part of Phase 3 scope
- **D-14:** Expo Dev Client required for native testing (`npx expo run:ios` / `run:android`)
- **D-15:** Jest testing: mock Victory Native/Skia; test chart component in all states; integration test that PoolInfoCard renders the chart section with data

### Claude's Discretion

- Exact Victory Native component selection (CartesianChart, Line, etc.)
- Metro/Babel configuration changes needed for Skia
- Chart component decomposition (single component vs sub-components)
- Skeleton animation approach (Reanimated, CSS, or simple opacity)
- Retry mechanism implementation (refetch from React Query)
- Y-axis tick count and value calculation algorithm
- X-axis date label formatting (e.g., "Mar 2" vs "3/2")

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHRT-01 | User sees a 30-day historical APY line chart (green line) | CartesianChart + Line from victory-native; `#00AD69` color; data from `usePoolApyHistory` hook |
| CHRT-02 | Chart displays Y-axis with percentage labels | `yAxis={{ font, formatYLabel }}` prop on CartesianChart; requires `useFont` with a TTF file |
| CHRT-03 | Chart displays X-axis with date labels | `xAxis={{ font, tickCount, formatXLabel }}` prop; `ApyDataPoint.timestamp` is a string date |
| CHRT-04 | Chart shows caption "APY history over the last 30 days" | Static `Text` component below chart; always visible in all states per D-11 |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `victory-native` | 41.20.2 (latest) | Line chart rendering via Skia | User-selected; Skia-based for React Native performance |
| `@shopify/react-native-skia` | 2.2.12 (Expo SDK 54 bundled) | Skia graphics engine for Victory Native | Peer dependency; bundled by Expo SDK 54 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-native-reanimated` | ~4.1.1 (already installed) | Victory Native peer dependency for animations | Already in project; no additional install |
| `react-native-gesture-handler` | ~2.28.0 (already installed) | Victory Native peer dependency | Already in project; no additional install |

**Victory Native peer dependency check:**
- `react-native-reanimated >= 3.0.0` — project has 4.1.1 ✓
- `@shopify/react-native-skia >= 1.2.3` — Expo bundles 2.2.12 ✓
- `react-native-gesture-handler >= 2.0.0` — project has 2.28.0 ✓

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `victory-native@41` | `react-native-chart-kit` | User locked on Victory Native — not an alternative |
| `victory-native@41` | `recharts` (web only) | Not applicable for React Native |

**Installation:**
```bash
bun add victory-native
npx expo install @shopify/react-native-skia
```

Note: Use `npx expo install` for Skia to get the Expo SDK 54-compatible version (2.2.12). `bun add @shopify/react-native-skia` would get 2.5.5 which is untested with Expo SDK 54's bundled modules.

Also add to `package.json` `trustedDependencies` for Bun postinstall scripts:
```json
{
  "trustedDependencies": ["@shopify/react-native-skia"]
}
```

**Version verification (as of 2026-04-01):**
- `victory-native`: 41.20.2 (confirmed via npm registry)
- `@shopify/react-native-skia`: 2.2.12 (Expo SDK 54 bundled, confirmed via `bundledNativeModules.json`)

---

## Architecture Patterns

### Recommended Project Structure

```
src/screens/pool-details/
├── components/
│   ├── apy-chart.tsx          # New: chart component (all 4 states)
│   ├── pool-info-card.tsx     # Modified: add poolId prop, render ApyChart
│   ├── pool-details-header.tsx
│   └── pool-identity-block.tsx
├── __tests__/
│   └── pool-details-screen.test.tsx
└── components/__tests__/     # Implied by existing pattern
    ├── apy-chart.test.tsx     # New: unit tests for all 4 chart states
    └── pool-info-card.test.tsx  # Modified: update for poolId + chart integration

src/assets/fonts/
└── inter-medium.ttf           # New: font required by Victory Native axis labels
```

### Pattern 1: CartesianChart with useFont

Victory Native's `CartesianChart` requires a Skia font object for axis labels. Without it, labels are rendered but empty. The font is loaded from a local TTF asset using `useFont` from `@shopify/react-native-skia`.

```typescript
// Source: https://nearform.com/open-source/victory-native/docs/cartesian/cartesian-chart
import { CartesianChart, Line } from "victory-native";
import { useFont } from "@shopify/react-native-skia";

const font = useFont(require("@/assets/fonts/inter-medium.ttf"), 12);

<CartesianChart
  data={data}
  xKey="timestamp"
  yKeys={["apy"]}
  xAxis={{
    font,
    tickCount: isMobile ? 3 : 6,
    formatXLabel: (value) => formatDateLabel(value),
  }}
  yAxis={[{
    font,
    formatYLabel: (value) => formatApyLabel(value),
  }]}
>
  {({ points }) => (
    <Line
      points={points.apy}
      color="#00AD69"
      strokeWidth={2}
      curveType="linear"
    />
  )}
</CartesianChart>
```

**Data format requirement:** `CartesianChart` requires `xKey` to be a `number` or `string`. Since `ApyDataPoint.timestamp` is a string (`"YYYY-MM-DD"`), it can be used directly as `xKey`. However, `yKeys` entries must be `number` type — `ApyDataPoint.apy` is already a number. The chart will need the data typed/mapped accordingly.

**Critical detail:** `xKey` values that are ISO date strings may not sort/scale correctly on the X axis. The data array must already be sorted chronologically. The timestamp string `"YYYY-MM-DD"` is lexicographically sortable, but the X-axis may treat them as categorical strings. For proper linear scaling, consider converting timestamps to numeric values (Unix ms) for the `xKey`, and storing the original string in a separate field for label formatting.

### Pattern 2: Data Transformation for Chart

```typescript
// Transform ApyDataPoint[] to CartesianChart-compatible format
// Source: Victory Native CartesianChart docs + ApyDataPoint interface
interface ChartDataPoint {
  x: number;        // Unix timestamp in ms (for proper linear X scale)
  apy: number;      // Y value
  dateLabel: string; // Original date string for label formatting
}

function toChartData(data: ApyDataPoint[]): ChartDataPoint[] {
  return data.map((point) => ({
    x: new Date(point.timestamp).getTime(),
    apy: point.apy,
    dateLabel: point.timestamp,
  }));
}
```

Then use `xKey="x"` and `yKeys={["apy"]}` in CartesianChart, with `formatXLabel` receiving the numeric timestamp and formatting it as "Mar 2".

### Pattern 3: ApyChart Component States

```typescript
// Source: CONTEXT.md D-08 through D-11 + UI-SPEC.md
interface ApyChartProps {
  data: ApyDataPoint[];
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function ApyChart({ data, isPending, error, onRetry }: ApyChartProps) {
  const { isMobile } = useDeviceLayout();
  const chartHeight = isMobile ? 200 : 250;

  const renderChart = () => {
    if (isPending) { /* skeleton */ }
    if (error) { /* error + retry */ }
    if (data.length === 0) { /* empty */ }
    return /* CartesianChart */;
  };

  return (
    <View>
      <View style={{ height: chartHeight }}>{renderChart()}</View>
      <Text className="text-sm text-muted-foreground text-center mt-2">
        APY history over the last 30 days
      </Text>
    </View>
  );
}
```

### Pattern 4: PoolInfoCard Modification

```typescript
// Modified PoolInfoCard — add poolId, call hook internally, render chart
interface PoolInfoCardProps {
  apy: number;
  project: string;
  chain: string;
  poolId: string;  // New prop
}

export function PoolInfoCard({ apy, project, chain, poolId }: PoolInfoCardProps) {
  const { data, isPending, error, refetch } = usePoolApyHistory(poolId);
  // ...existing APY/project block...
  // Below existing content:
  <View className="mt-6">
    <ApyChart
      data={data ?? []}
      isPending={isPending}
      error={error}
      onRetry={refetch}
    />
  </View>
}
```

`PoolDetailsScreen` must pass `pool.id` to `PoolInfoCard` as `poolId`.

### Anti-Patterns to Avoid

- **Using `axisOptions` (deprecated):** The old `axisOptions` prop was deprecated in favor of separate `xAxis` and `yAxis` props. Use the new API.
- **Passing `font: null` to hide axes:** This suppresses labels but leaves empty axis space. If no font is available, pass `tickCount: 0` or handle font loading asynchronously.
- **Using date strings as X numeric scale without conversion:** ISO date strings as `xKey` will be treated categorically, not on a linear time scale. Convert to Unix timestamps for proper spacing.
- **Mounting CartesianChart with empty `data`:** The library throws an exception when `data` is an empty array. Guard with `data.length === 0` check before rendering the chart.
- **Importing victory-native in Jest without mocking:** Victory Native renders Skia canvas elements that crash in Jest without the Skia test environment. Either use the full Skia Jest environment or mock victory-native entirely.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Line chart rendering | Custom Skia path drawing | `CartesianChart` + `Line` from victory-native | D3 scale management, responsive sizing, edge cases |
| Y-axis tick calculation | Manual min/max/step computation | `yAxis={{ tickCount: 5 }}` on CartesianChart | Victory Native auto-calculates nice tick values via D3 scales |
| Animated skeleton | Custom Reanimated interpolation | `animate-pulse` from `tailwindcss-animate` (already in project) | Already configured, consistent with other skeletons |
| Date formatting | Custom date format logic | Standard `Date` with `toLocaleDateString` options | "Mar 2" = `new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })` |
| Auto-precision APY labels | Custom decimal logic | Simple conditional: `Number.isInteger(v) ? "${v}%" : "${v}%"` | Trivial one-liner, no library needed |

**Key insight:** Victory Native wraps D3's scale, shape, and zoom libraries. All tick/domain/range calculations are handled automatically. The planner should not create tasks for implementing axis math.

---

## Common Pitfalls

### Pitfall 1: Font Requirement for Axis Labels
**What goes wrong:** Axis labels are invisible/empty even though `xAxis` and `yAxis` props are configured correctly.
**Why it happens:** Victory Native silently suppresses labels when no font is provided (font parameter in axis config is required for labels to render).
**How to avoid:** Add a TTF font file to `src/assets/fonts/`, load with `const font = useFont(require("@/assets/fonts/inter-medium.ttf"), 12)`, pass to both `xAxis.font` and `yAxis[0].font`.
**Warning signs:** Chart renders without any axis text; no error thrown.

### Pitfall 2: Empty Data Crash
**What goes wrong:** `CartesianChart` throws an exception when `data` is an empty array `[]`.
**Why it happens:** D3 scale functions inside Victory Native fail with empty domains.
**How to avoid:** Always guard the chart render with `if (data.length === 0) return <EmptyState />` before rendering `CartesianChart`. Never pass `data={[]}` to CartesianChart.
**Warning signs:** Red screen error mentioning D3 scale or "domain" in the error message.

### Pitfall 3: X-Axis Date Strings Not Scaling Linearly
**What goes wrong:** Data points are unevenly spaced on the X axis because ISO date strings are treated as categorical values.
**Why it happens:** Victory Native's X scale for string keys uses categorical/band scale, not time scale.
**How to avoid:** Transform `ApyDataPoint[]` to include a numeric `x` field (Unix timestamp in ms). Use `xKey="x"` (numeric). Use `formatXLabel` to convert the numeric timestamp back to "Mar 2" display format.
**Warning signs:** All data points appear evenly spaced regardless of actual date gaps; weekends/gaps in data collapse.

### Pitfall 4: Jest Skia Environment Not Configured
**What goes wrong:** Tests fail with errors like `Cannot find module '@shopify/react-native-skia'` or canvas/CanvasKit errors.
**Why it happens:** Skia requires a specific Jest environment (loads CanvasKit WASM) and setup file (mocks React Native Skia APIs).
**How to avoid:** Update `jest.config.js`:
  - Add `testEnvironment: "@shopify/react-native-skia/jestEnv.js"`
  - Add `"@shopify/react-native-skia/jestSetup.js"` to `setupFilesAfterEnv`
  - Add `@shopify/react-native-skia` to `transformIgnorePatterns` exclusion list
  - Add `victory-native` to `transformIgnorePatterns` exclusion list
**Warning signs:** Tests that import anything from victory-native fail immediately.

### Pitfall 5: PoolInfoCard Tests Break After poolId Prop Addition
**What goes wrong:** Existing `pool-info-card.test.tsx` fails because `poolId` is now required but not provided in existing test renders, and `usePoolApyHistory` is called inside the component.
**Why it happens:** Adding a required `poolId` prop and a data-fetching hook to an existing component breaks existing tests.
**How to avoid:** Mock `usePoolApyHistory` in pool-info-card tests. Update existing test renders to pass `poolId`. Wrap renders in `QueryClientProvider` + `RepositoryProvider` or mock the hook directly.
**Warning signs:** Existing pool-info-card tests fail with "poolId required" or React Query "No QueryClient" errors.

### Pitfall 6: Bun postinstall Scripts Blocked
**What goes wrong:** `@shopify/react-native-skia` installs but native bindings fail to build because Bun blocked the postinstall script.
**Why it happens:** Bun requires explicit opt-in for package postinstall scripts via `trustedDependencies`.
**How to avoid:** Add `"trustedDependencies": ["@shopify/react-native-skia"]` to `package.json` before running install.
**Warning signs:** No error during install, but native functionality fails at runtime.

---

## Code Examples

Verified patterns from official sources:

### Complete ApyChart (Success State)
```typescript
// Source: https://nearform.com/open-source/victory-native/docs/cartesian/cartesian-chart
import { CartesianChart, Line } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import { ApyDataPoint } from "@/domain/pool/apy-data-point";

interface ChartDataPoint {
  x: number;
  apy: number;
}

function toChartData(points: ApyDataPoint[]): ChartDataPoint[] {
  return points.map((p) => ({
    x: new Date(p.timestamp).getTime(),
    apy: p.apy,
  }));
}

function formatDateLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatApyLabel(value: number): string {
  return Number.isInteger(value) ? `${value}%` : `${value}%`;
}

// Inside component:
const font = useFont(require("@/assets/fonts/inter-medium.ttf"), 12);
const chartData = toChartData(data);

<View style={{ height: chartHeight }}>
  <CartesianChart
    data={chartData}
    xKey="x"
    yKeys={["apy"]}
    xAxis={{
      font,
      tickCount: isMobile ? 3 : 6,
      formatXLabel: formatDateLabel,
      labelColor: "hsl(0 0% 45.1%)",
    }}
    yAxis={[{
      font,
      formatYLabel: formatApyLabel,
      labelColor: "hsl(0 0% 45.1%)",
    }]}
  >
    {({ points }) => (
      <Line
        points={points.apy}
        color="#00AD69"
        strokeWidth={2}
        curveType="linear"
      />
    )}
  </CartesianChart>
</View>
```

### Jest Config Update for Skia
```javascript
// Source: https://shopify.github.io/react-native-skia/docs/getting-started/installation
// jest.config.js additions:
module.exports = {
  // ... existing config ...
  testEnvironment: "@shopify/react-native-skia/jestEnv.js",
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js",
    "@shopify/react-native-skia/jestSetup.js",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@rn-primitives/.*|lucide-react-native|react-navigation|@react-navigation/.*|nativewind|react-native-css-interop|@shopify/react-native-skia|victory-native)",
  ],
};
```

### Mocking Victory Native in Component Tests
```typescript
// Source: Jest manual mock pattern (consistent with existing FlashList mock pattern in project)
jest.mock("victory-native", () => ({
  CartesianChart: jest.fn(() => null),
  Line: jest.fn(() => null),
}));

jest.mock("@shopify/react-native-skia", () => ({
  useFont: jest.fn(() => null),
  // add other used exports as needed
}));
```

### Skeleton Loading State (using tailwindcss-animate)
```typescript
// Source: UI-SPEC.md D-08 + tailwindcss-animate (already in project)
<View
  style={{ height: chartHeight }}
  className="rounded-lg bg-muted animate-pulse"
  accessibilityRole="progressbar"
  accessibilityLabel="Loading chart"
/>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `axisOptions` prop | Separate `xAxis` / `yAxis` props | victory-native v36+ | `axisOptions` deprecated, still works but prefer new API |
| `victory-native-xl` repo name | Published as `victory-native` on npm | v36 rewrite | Package name is `victory-native`, not `victory-native-xl` |

**Deprecated/outdated:**
- `axisOptions` prop: Deprecated in favor of `xAxis` and `yAxis` individual props. Still functional in v41 but new code should use the separate props.

---

## Open Questions

1. **Font file to bundle**
   - What we know: A `.ttf` font file is required for Victory Native axis labels; project has no `assets/fonts/` directory yet
   - What's unclear: Which font file to use — Inter, SpaceMono (common in Expo starters), or system font
   - Recommendation: Use `inter-medium.ttf` (common in Victory Native docs examples). Create `src/assets/fonts/inter-medium.ttf`. Alternatively, check if any .ttf file is already present in the `ios/` or `android/` directories from Expo's default setup.

2. **Expo Go vs Dev Client for Skia**
   - What we know: Expo SDK 54 docs say Skia is "Included in Expo Go" (`inExpoGo: true`). CONTEXT.md D-14 and STATE.md say Expo Dev Client is required.
   - What's unclear: Whether the Expo Go inclusion is for the bundled 2.2.12 version, and whether victory-native's additional native deps cause issues.
   - Recommendation: Follow CONTEXT.md D-14 (locked decision) and use `npx expo run:ios` for testing. The research finding that Skia is in Expo Go is noted but the user decision takes precedence.

3. **`accessibilityRole="progressbar"` for skeleton**
   - What we know: MEMORY.md documents that `getByRole("progressbar")` does not work in RNTL; the test must use `getByLabelText` instead.
   - What's unclear: Whether to still apply `accessibilityRole="progressbar"` for correct semantics or switch to a different role.
   - Recommendation: Keep `accessibilityRole="progressbar"` on the skeleton view for semantic correctness (screen readers), but in tests use `getByLabelText("Loading chart")` to query it (consistent with MEMORY.md finding).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `victory-native` | CHRT-01, CHRT-02, CHRT-03 | ✗ (not yet installed) | — | None — must install |
| `@shopify/react-native-skia` | victory-native peer dep | ✗ (not yet installed) | — | None — must install |
| `react-native-reanimated` | victory-native peer dep | ✓ | ~4.1.1 | — |
| `react-native-gesture-handler` | victory-native peer dep | ✓ | ~2.28.0 | — |
| Font TTF file | CartesianChart axis labels | ✗ (no fonts dir) | — | None — axis labels require font |
| Expo Dev Client / `expo run:ios` | D-14: native testing | ✓ (Xcode present on macOS) | SDK 54 | — |
| Bun | Package installation | ✓ | 1.3.5 | — |

**Missing dependencies with no fallback:**
- `victory-native` — must be installed via `bun add victory-native`
- `@shopify/react-native-skia` — must be installed via `npx expo install @shopify/react-native-skia`
- Font TTF file — must be added to `src/assets/fonts/` before axis labels work

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 with jest-expo preset |
| Config file | `jest.config.js` (requires updates for Skia) |
| Quick run command | `bun run test src/screens/pool-details` |
| Full suite command | `bun run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHRT-01 | ApyChart renders green line chart with data | unit | `bun run test src/screens/pool-details/components/__tests__/apy-chart.test.tsx` | ❌ Wave 0 |
| CHRT-01 | PoolInfoCard renders ApyChart section | integration | `bun run test src/screens/pool-details/components/__tests__/pool-info-card.test.tsx` | ✅ (needs update) |
| CHRT-02 | Y-axis label formatting: integer APY shows "7%", fractional shows "2.5%" | unit | `bun run test src/screens/pool-details/components/__tests__/apy-chart.test.tsx` | ❌ Wave 0 |
| CHRT-03 | X-axis date labels formatted as "Mar 2" | unit | `bun run test src/screens/pool-details/components/__tests__/apy-chart.test.tsx` | ❌ Wave 0 |
| CHRT-04 | Caption "APY history over the last 30 days" visible in all states | unit | `bun run test src/screens/pool-details/components/__tests__/apy-chart.test.tsx` | ❌ Wave 0 |
| CHRT-01 | ApyChart loading state renders skeleton | unit | `bun run test src/screens/pool-details/components/__tests__/apy-chart.test.tsx` | ❌ Wave 0 |
| CHRT-01 | ApyChart error state renders "Failed to load chart" + retry button | unit | `bun run test src/screens/pool-details/components/__tests__/apy-chart.test.tsx` | ❌ Wave 0 |
| CHRT-01 | ApyChart empty state renders "No data available" | unit | `bun run test src/screens/pool-details/components/__tests__/apy-chart.test.tsx` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `bun run test src/screens/pool-details`
- **Per wave merge:** `bun run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/screens/pool-details/components/__tests__/apy-chart.test.tsx` — covers CHRT-01, CHRT-02, CHRT-03, CHRT-04 (all states)
- [ ] Jest config update: `testEnvironment` + `setupFilesAfterEnv` + `transformIgnorePatterns` for `@shopify/react-native-skia` and `victory-native`
- [ ] `src/assets/fonts/inter-medium.ttf` — font asset required by `useFont` for axis labels
- [ ] `package.json` `trustedDependencies` entry for `@shopify/react-native-skia`

---

## Project Constraints (from CLAUDE.md)

| Directive | Constraint |
|-----------|-----------|
| File naming | All files must use kebab-case: `apy-chart.tsx`, `apy-chart.test.tsx` |
| Component pattern | Function declaration with named export: `export function ApyChart() {}` |
| Screen-specific components | Must live in `src/screens/pool-details/components/` |
| Props interface | Define as separate interface above component: `interface ApyChartProps { ... }` |
| Sibling JSX | Sibling elements MUST be separated by blank line |
| Default exports | Screen entry points only — `ApyChart` uses named export |
| Hook naming | camelCase with `use` prefix |
| Package manager | Bun (`bun add`) for most packages; `npx expo install` for Expo-managed packages |
| Testing | Co-located `__tests__/` directory, `.test.tsx` extension, unmount() in all tests |
| `useQuery` direct use | Never use `useQuery` directly — always use `useAppQuery` wrapper |
| Commit messages | Conventional commits: `feat:`, `fix:`, `refactor:`, etc. |
| GSD workflow | All file changes must go through a GSD command |

---

## Sources

### Primary (HIGH confidence)

- `https://nearform.com/open-source/victory-native/docs/cartesian/cartesian-chart` — CartesianChart API, xAxis/yAxis props, data format, font requirement
- `https://nearform.com/open-source/victory-native/docs/cartesian/line` — Line component props (color, strokeWidth, curveType, connectMissingData)
- `https://shopify.github.io/react-native-skia/docs/getting-started/installation` — Jest setup (jestEnv.js, jestSetup.js, transformIgnorePatterns)
- `https://docs.expo.dev/versions/v54.0.0/sdk/skia/` — Expo SDK 54 Skia inclusion confirmed (`inExpoGo: true`), install via `npx expo install`
- `/Users/ambegossi/yieldly/yieldly-app/node_modules/expo/bundledNativeModules.json` — Confirmed `@shopify/react-native-skia: "2.2.12"` in Expo SDK 54 bundle
- `npm view victory-native@41.20.2 peerDependencies` — Confirmed version compatibility with project's existing dependencies

### Secondary (MEDIUM confidence)

- Multiple WebSearch results confirming `useFont(require("@/assets/fonts/font.ttf"), size)` pattern for Expo projects
- WebSearch confirming Bun `trustedDependencies` requirement for Skia postinstall scripts
- `https://spin.atomicobject.com/victory-native-xl/` — Secondary axis usage patterns, confirmed xAxis/yAxis API shape

### Tertiary (LOW confidence)

- WebSearch results on Samsung device `formatXLabel` undefined issue (GitHub issue #185) — edge case, not verified against v41

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via npm registry and Expo bundledNativeModules.json
- Architecture: HIGH — CartesianChart API verified via official docs; data transformation pattern is standard TypeScript
- Pitfalls: HIGH (font requirement, empty data crash) via official docs; MEDIUM (date string scaling) via reasoning + docs review
- Testing: HIGH — Skia Jest setup verified via official Skia installation docs

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (victory-native and Skia are actively developed; verify versions before implementing)
