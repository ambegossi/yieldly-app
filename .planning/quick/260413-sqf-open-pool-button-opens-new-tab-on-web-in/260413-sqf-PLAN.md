---
phase: quick
plan: 260413-sqf
type: execute
wave: 1
depends_on: []
files_modified:
  - src/screens/pool-details/index.tsx
  - src/screens/pool-details/__tests__/pool-details-screen.test.tsx
autonomous: true
must_haves:
  truths:
    - "On web, pressing Open pool opens a new browser tab (not a popup window)"
    - "On native (iOS/Android), pressing Open pool still opens expo-web-browser in-app browser"
  artifacts:
    - path: "src/screens/pool-details/index.tsx"
      provides: "Platform-branched handleOpenPool"
      contains: "Platform.OS === \"web\""
    - path: "src/screens/pool-details/__tests__/pool-details-screen.test.tsx"
      provides: "Tests for both web and native open-pool behavior"
  key_links:
    - from: "src/screens/pool-details/index.tsx"
      to: "window.open"
      via: "Platform.OS === web branch"
      pattern: "window\\.open.*_blank"
---

<objective>
Fix the "Open pool" button on web to open a new browser tab instead of a popup window.

Purpose: `expo-web-browser`'s `openBrowserAsync` on web calls `window.open` with width/height features, which browsers interpret as a popup. A direct `window.open(url, "_blank", "noopener,noreferrer")` opens a proper tab.

Output: Updated `handleOpenPool` with platform branch; tests covering both paths.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/screens/pool-details/index.tsx
@src/screens/pool-details/__tests__/pool-details-screen.test.tsx
</context>

<interfaces>
<!-- Current handleOpenPool (lines 26-30 of index.tsx): -->
```typescript
const handleOpenPool = useCallback(async () => {
  await WebBrowser.openBrowserAsync(
    `https://defillama.com/yields/pool/${pool.id}`,
  );
}, [pool.id]);
```

<!-- Existing imports to be aware of (line 10): -->
```typescript
import { ScrollView, View } from "react-native";
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add Platform.OS web branch to handleOpenPool</name>
  <files>src/screens/pool-details/index.tsx</files>
  <action>
1. Add `Platform` to the existing `react-native` import on line 10:
   `import { Platform, ScrollView, View } from "react-native";`

2. Replace the `handleOpenPool` callback (lines 26-30) with:

```typescript
const handleOpenPool = useCallback(async () => {
  const url = `https://defillama.com/yields/pool/${pool.id}`;

  if (Platform.OS === "web") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  await WebBrowser.openBrowserAsync(url);
}, [pool.id]);
```

Extract the URL into a local variable to avoid duplication. The web branch calls `window.open` with `_blank` target and `noopener,noreferrer` for security, then returns early. Native platforms fall through to the existing `expo-web-browser` call.

No other changes to the file.
  </action>
  <verify>
    <automated>cd /Users/ambegossi/yieldly/yieldly-app && bun run types 2>&1 | tail -5</automated>
  </verify>
  <done>handleOpenPool uses window.open on web and WebBrowser.openBrowserAsync on native. TypeScript compiles without errors.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Add web-path test and update native-path test</name>
  <files>src/screens/pool-details/__tests__/pool-details-screen.test.tsx</files>
  <behavior>
    - Test (existing, updated): On native (default Platform.OS), pressing CTA calls WebBrowser.openBrowserAsync with the DefiLlama URL and does NOT call window.open
    - Test (new): On web (Platform.OS mocked to "web"), pressing CTA calls window.open with ("https://defillama.com/yields/pool/abc-123", "_blank", "noopener,noreferrer") and does NOT call WebBrowser.openBrowserAsync
  </behavior>
  <action>
1. At the top of the test file (after the existing jest.mock calls, before the `testPool` const), add a `window.open` mock:

```typescript
const mockWindowOpen = jest.fn();
Object.defineProperty(window, "open", {
  value: mockWindowOpen,
  writable: true,
});
```

2. In the `afterEach` block, add `mockWindowOpen.mockClear();` alongside the existing `jest.clearAllMocks()`.

3. Rename the existing CTA test (line 99) from:
   `"pressing CTA button calls openBrowserAsync with constructed DefiLlama url"`
   to:
   `"pressing CTA on native calls openBrowserAsync with DefiLlama url"`

   Keep the test body the same but add an assertion at the end:
   `expect(mockWindowOpen).not.toHaveBeenCalled();`

4. Add a new test immediately after:

```typescript
it("pressing CTA on web calls window.open with new tab params", () => {
  const originalOS = Platform.OS;
  Platform.OS = "web" as typeof Platform.OS;

  const onBack = jest.fn();

  const { unmount } = render(
    <PoolDetailsScreen pool={testPool} onBack={onBack} />,
  );

  fireEvent.press(screen.getByLabelText("Open Aave in external browser"));

  expect(mockWindowOpen).toHaveBeenCalledWith(
    "https://defillama.com/yields/pool/abc-123",
    "_blank",
    "noopener,noreferrer",
  );
  expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();

  Platform.OS = originalOS;
  unmount();
});
```

5. Add `import { Platform } from "react-native";` to the imports at the top of the test file.
  </action>
  <verify>
    <automated>cd /Users/ambegossi/yieldly/yieldly-app && bun run test -- --testPathPatterns="pool-details-screen" 2>&1 | tail -20</automated>
  </verify>
  <done>All pool-details-screen tests pass. Native path asserts openBrowserAsync called and window.open NOT called. Web path asserts window.open called with correct args and openBrowserAsync NOT called.</done>
</task>

</tasks>

<verification>
```bash
cd /Users/ambegossi/yieldly/yieldly-app && bun run types && bun run test -- --testPathPatterns="pool-details-screen" && bun run lint
```
</verification>

<success_criteria>
- TypeScript compiles with no errors
- All pool-details-screen tests pass (including new web-path test)
- Lint passes
- Native behavior unchanged (openBrowserAsync still used on iOS/Android)
- Web behavior opens new tab via window.open with _blank target
</success_criteria>

<output>
After completion, create `.planning/quick/260413-sqf-open-pool-button-opens-new-tab-on-web-in/260413-sqf-SUMMARY.md`
</output>
