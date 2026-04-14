---
status: diagnosed
trigger: "axis labels not displayed on mobile despite padding added to CartesianChart"
created: 2026-04-02T00:00:00Z
updated: 2026-04-02T00:00:00Z
---

## Current Focus

hypothesis: useFont returns null asynchronously, causing Victory Native to skip rendering labels entirely
test: examined Victory Native XAxis.js source - labels render only when font is truthy
expecting: font is null on initial render and chart never re-renders with loaded font
next_action: return diagnosis

## Symptoms

expected: X-axis (date) and Y-axis (percentage) labels should display on the chart
actual: Green line renders correctly, but no axis labels visible on mobile
errors: none (silent failure)
reproduction: open pool details screen, observe chart
started: since axis labels were first implemented

## Eliminated

(none - root cause found on first hypothesis)

## Evidence

- timestamp: 2026-04-02
  checked: font file existence
  found: src/assets/fonts/inter-medium.ttf exists (302KB)
  implication: font file is valid and present

- timestamp: 2026-04-02
  checked: Victory Native v41.20.2 XAxis.js line 87
  found: Labels only render when `font && labelWidth && canFitLabelContent` - if font is null, labels are silently skipped
  implication: null font = no labels, no error

- timestamp: 2026-04-02
  checked: Victory Native v41.20.2 YAxis.js line 15
  found: Same pattern - fontSize defaults to 0 when font is null, labels effectively invisible
  implication: Both axes affected

- timestamp: 2026-04-02
  checked: @shopify/react-native-skia useFont implementation
  found: useFont is async - returns null until typeface loads, then returns SkFont via useMemo
  implication: On first render, font is null. CartesianChart renders with null font. If component doesn't re-render after font loads, labels stay invisible.

- timestamp: 2026-04-02
  checked: CartesianChart xAxis/yAxis prop types
  found: Props accept `font?: SkFont | null` - the API usage (xAxis, yAxis, formatXLabel, formatYLabel) is CORRECT
  implication: API usage is not the problem. Font loading timing is the problem.

- timestamp: 2026-04-02
  checked: matchFont from @shopify/react-native-skia
  found: matchFont is SYNCHRONOUS - uses system font manager, never returns null
  implication: matchFont is the correct alternative for Victory Native charts

## Resolution

root_cause: useFont is asynchronous and returns null until the font file loads. Victory Native's XAxis and YAxis components check `font && labelWidth` before rendering labels (XAxis.js:87, YAxis.js line ~24). When font is null, labels are silently skipped. The chart renders once with null font showing the line (which doesn't need font), but axis labels are never shown because by the time the font loads, there may not be a re-render trigger, or the initial null-font render calculates zero-height/zero-width labels that persist.
fix: Replace `useFont(require(...), 12)` with `matchFont({ fontSize: 12 })` from @shopify/react-native-skia. matchFont is synchronous - it uses the system font manager to find a matching font and returns an SkFont immediately (never null). This eliminates the async loading problem entirely.
verification: pending
files_changed: []
