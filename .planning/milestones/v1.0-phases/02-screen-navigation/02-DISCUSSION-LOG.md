# Phase 2: Screen & Navigation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 02-screen-navigation
**Areas discussed:** Screen composition, Pool data strategy, Header & navigation, Chart placeholder

---

## Screen Composition

| Option | Description | Selected |
|--------|-------------|----------|
| Single info card | One card containing symbol icon, APY, project name, chain badge, and CTA button | |
| Separate sections | Distinct visual sections: pool header area, info section, CTA section | |
| Full-page layout | No card wrapper, content fills the screen directly | |
| Reference screenshots | Follow the reference design screenshots exactly | ✓ |

**User's choice:** Follow reference screenshots — three visual zones: token identity header, single white card (APY + project info), CTA button outside card.
**Notes:** User provided 4 screenshots (desktop top/bottom, mobile top/bottom). Design shows stacked on mobile, side-by-side APY/project on desktop.

### Token Full Name Follow-up

| Option | Description | Selected |
|--------|-------------|----------|
| Skip it (as decided) | No subtitle — just bold symbol next to icon | ✓ |
| Include it | Add token full name subtitle | |

**User's choice:** Skip it — stays out of scope per PROJECT.md decision.
**Notes:** Design shows "Tether" subtitle but user confirmed it should be skipped.

---

## Pool Data Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Route params (Recommended) | Pass Pool object as serialized route params, instant display | ✓ |
| Fetch by ID | Add findById repo method, requires loading state | |
| Hybrid | Pass params for instant display, refetch in background | |

**User's choice:** Route params — instant display, no new repo method needed.
**Notes:** None

---

## Header & Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Custom header component (Recommended) | Build custom PoolDetailsHeader matching design exactly | ✓ |
| Stack header customization | Use Expo Router's Stack header, customize title/back button | |

**User's choice:** Custom header component — matches existing headerShown: false pattern.
**Notes:** None

---

## Chart Placeholder

| Option | Description | Selected |
|--------|-------------|----------|
| Empty space in card (Recommended) | Card renders APY + project info only, chart area absent | ✓ |
| Skeleton placeholder | Gray placeholder rectangle with "Chart coming soon" | |
| Full card without chart | Smaller card, Phase 3 expands it | |

**User's choice:** Empty space — no placeholder, Phase 3 adds chart directly.
**Notes:** None

---

## Claude's Discretion

- Route file structure
- Component decomposition within the screen
- ScrollView vs flat layout
- Pool object serialization in route params
- Missing params handling

## Deferred Ideas

None — discussion stayed within phase scope
