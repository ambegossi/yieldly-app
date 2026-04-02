# Phase 3: Chart - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 03-chart
**Areas discussed:** Chart visual style, Chart loading & error states, Chart interaction, Victory Native setup

---

## Chart Visual Style

### Line Fill
| Option | Description | Selected |
|--------|-------------|----------|
| Line only | Clean green line matching the design screenshots exactly — no fill underneath | ✓ |
| Subtle gradient fill | Green line with a light green-to-transparent gradient underneath — common in finance apps | |

**User's choice:** Line only
**Notes:** Matches the design screenshots exactly.

### Grid Lines
| Option | Description | Selected |
|--------|-------------|----------|
| No grid lines | Clean look — just Y-axis percentage labels on the left, no horizontal lines | ✓ |
| Subtle grid lines | Light gray dashed lines at each Y-axis label for easier value reading | |

**User's choice:** No grid lines
**Notes:** None

### X-axis Date Labels
| Option | Description | Selected |
|--------|-------------|----------|
| Responsive labels | More labels on desktop (~6), fewer on mobile (~3) to avoid overlap | ✓ |
| Fixed 5 labels | Always show 5 evenly-spaced date labels regardless of screen width | |

**User's choice:** Responsive labels
**Notes:** Matches the design screenshots showing different label density per screen size.

### Y-axis Format
| Option | Description | Selected |
|--------|-------------|----------|
| Auto precision | Show decimals only when needed (e.g., "7%" but "2.5%") | ✓ |
| Always 1 decimal | Consistent formatting: "7.0%", "2.5%", "0.8%" | |

**User's choice:** Auto precision
**Notes:** None

### Line Color
| Option | Description | Selected |
|--------|-------------|----------|
| Brand green #00AD69 | Uses the app's brand color — consistent with CTA button and APY text | ✓ |
| Tailwind green-500 | Standard Tailwind green — slightly different shade from brand | |

**User's choice:** Brand green #00AD69
**Notes:** Consistency with the rest of the app.

### Chart Placement
| Option | Description | Selected |
|--------|-------------|----------|
| Inside PoolInfoCard | Add chart below APY/project info within the same card | ✓ |
| Separate chart card | Chart in its own white card below the info card | |

**User's choice:** Inside PoolInfoCard
**Notes:** Matches the design where everything is in one card.

### Chart Height
| Option | Description | Selected |
|--------|-------------|----------|
| Fixed height | Consistent chart height (~200px mobile, ~250px desktop) | ✓ |
| Aspect ratio based | Chart height scales proportionally to width | |

**User's choice:** Fixed height
**Notes:** Predictable layout.

---

## Chart Loading & Error States

### Loading State
| Option | Description | Selected |
|--------|-------------|----------|
| Skeleton placeholder | Pulsing gray rectangle matching chart dimensions | ✓ |
| Spinner in chart area | Centered loading spinner inside the chart's reserved space | |
| Empty with text | "Loading chart..." text centered in the chart area | |

**User's choice:** Skeleton placeholder
**Notes:** None

### Error State
| Option | Description | Selected |
|--------|-------------|----------|
| Inline error with retry | "Failed to load chart" text with "Try again" button, within chart area | ✓ |
| Just error text | "Chart unavailable" text, no retry button | |

**User's choice:** Inline error with retry
**Notes:** Rest of pool details stays visible.

### Caption Visibility
| Option | Description | Selected |
|--------|-------------|----------|
| Always show caption | Caption visible in all states (loading, error, empty, success) | ✓ |
| Only on success | Caption appears only after chart data loads successfully | |

**User's choice:** Always show caption
**Notes:** Provides context for the placeholder area.

### Empty Data State
| Option | Description | Selected |
|--------|-------------|----------|
| "No data available" message | Centered text in chart area — distinct from error (no retry) | ✓ |
| Render empty chart | Show chart axes with no line | |

**User's choice:** "No data available" message
**Notes:** None

---

## Chart Interaction

### Touch Interaction
| Option | Description | Selected |
|--------|-------------|----------|
| Static only | No touch interaction — chart is display-only | ✓ |
| Crosshair + tooltip | Touch and drag to see vertical crosshair with APY value and date | |
| Tap nearest point | Tap anywhere to see nearest data point's value in tooltip | |

**User's choice:** Static only
**Notes:** Keeps Phase 3 focused and avoids Skia gesture complexity.

---

## Victory Native Setup

### Dev Client
| Option | Description | Selected |
|--------|-------------|----------|
| Expo Dev Client | Build custom dev client with `npx expo run:ios` / `run:android` | ✓ |
| Web-only testing first | Test chart in web build initially, tackle native dev client later | |

**User's choice:** Expo Dev Client
**Notes:** Standard approach for native modules.

### Test Scope
| Option | Description | Selected |
|--------|-------------|----------|
| Component + integration | Mock Victory Native, test all states, integration test with PoolInfoCard | ✓ |
| Minimal mocking | Just mock Skia to prevent crashes, no dedicated chart tests | |

**User's choice:** Component + integration
**Notes:** None

### Installation Timing
| Option | Description | Selected |
|--------|-------------|----------|
| Part of Phase 3 | Phase 3 plan includes install, configure, then build chart | ✓ |
| Pre-install separately | Install and verify libraries work before Phase 3 planning | |

**User's choice:** Part of Phase 3
**Notes:** None

---

## Claude's Discretion

- Exact Victory Native component selection (CartesianChart, Line, etc.)
- Metro/Babel configuration changes needed for Skia
- Chart component decomposition
- Skeleton animation approach
- Retry mechanism implementation
- Y-axis tick count and value calculation
- X-axis date label formatting

## Deferred Ideas

None — discussion stayed within phase scope
