---
status: investigating
trigger: "APY line chart renders on mobile but date labels (X-axis) and percentage labels (Y-axis) are not displayed"
created: 2026-04-02T00:00:00Z
updated: 2026-04-02T00:00:00Z
---

## Current Focus

hypothesis: CartesianChart has no `padding` prop, so chartBounds fills the entire container (0 to width, 0 to height). Axis labels render in "outset" position (default) which places them OUTSIDE chartBounds -- below bottom edge for X-axis, left of left edge for Y-axis. The parent View clips them.
test: Check Victory Native XAxis source to confirm outset label positioning relative to chartBounds
expecting: Labels positioned at chartBounds.bottom + offset (beyond container) when padding is 0
next_action: Confirm root cause and recommend fix with padding prop

## Symptoms

expected: X-axis date labels and Y-axis percentage labels visible on the chart
actual: Chart line renders (green line visible) but no axis tick labels shown
errors: None (no crash or error, labels simply missing)
reproduction: Open pool details screen on mobile (<768dp), observe APY chart
started: Since chart was implemented

## Eliminated

(none)

## Evidence

- timestamp: 2026-04-02T00:01:00Z
  checked: Victory Native XAxis.js source (node_modules/victory-native/dist/cartesian/components/XAxis.js)
  found: Line 87-93 shows labels only render when `font && labelWidth && canFitLabelContent`. Line 38-39 shows bottom/outset label Y position = `chartBounds.bottom + labelOffset + fontSize`. This places labels BELOW the chart area.
  implication: With no padding, chartBounds.bottom equals container height, so labels render outside visible area.

- timestamp: 2026-04-02T00:02:00Z
  checked: CartesianChart.js outputWindow calculation (lines 116-119)
  found: outputWindow uses padding values (defaults to 0 via valueFromSidedNumber). With padding=undefined, xMin=0, xMax=width, yMin=0, yMax=height -- chart content fills entire container.
  implication: No room left for axis labels in outset position.

- timestamp: 2026-04-02T00:03:00Z
  checked: apy-chart.tsx component (line 107-123)
  found: CartesianChart has xAxis and yAxis props with font, formatters, and labelColor configured correctly. But NO `padding` prop is set.
  implication: Root cause confirmed -- missing padding prop.

## Resolution

root_cause: The CartesianChart component in apy-chart.tsx has no `padding` prop. Victory Native's default label position is "outset" (labels rendered outside the chart bounds). Without padding, chartBounds spans the entire container (0,0 to width,height), so outset labels are rendered beyond the container edges and get clipped by the parent View. The font, formatters, and colors are all correctly configured -- the labels ARE being rendered, just outside the visible area.
fix: Add padding prop to CartesianChart to reserve space for axis labels
verification:
files_changed: []
