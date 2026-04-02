# Phase 02 — UI Review

**Audited:** 2026-04-01
**Baseline:** 02-UI-SPEC.md (approved design contract)
**Screenshots:** Not captured (no dev server detected on ports 3000, 5173, 8080 — code-only audit)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | All contract copy present; error/empty states from ScreenWrapper deviate from spec |
| 2. Visuals | 4/4 | All 5 zones implemented per spec; hierarchy, touch targets, and icon patterns correct |
| 3. Color | 4/4 | Brand accent used exactly on the 4 declared elements; no hardcoded hex/rgb values |
| 4. Typography | 4/4 | All 4 declared sizes in use; only font-bold weight used (matches 400/700 contract) |
| 5. Spacing | 4/4 | All spacing follows declared scale; no arbitrary px/rem values found |
| 6. Experience Design | 3/4 | ScreenWrapper covers loading/error; empty params state and spec error copy not implemented |

**Overall: 22/24**

---

## Top 3 Priority Fixes

1. **Missing empty/invalid params state** — If a user navigates to `/pool-details` directly without URL params (e.g. deep link or bookmark), all fields silently fall back to empty strings and `apy` becomes `0`. The UI-SPEC declares explicit copy: "Pool data unavailable. Go back and select a pool." — Add a guard in `src/app/pool-details.tsx` that checks for a missing `params.id` and renders an error view before constructing the pool object.

2. **Error boundary copy deviates from spec** — `ScreenWrapper` displays "Something went wrong" + "Retry" button, but UI-SPEC Copywriting Contract requires "Could not load pool details" (heading) and "Something went wrong. Go back and try again." (body). Update `src/components/screen-wrapper.tsx` or add a screen-specific error boundary variant for the pool details route to match the contract.

3. **CTA button icon uses hardcoded `color="white"` prop** — `src/screens/pool-details/index.tsx:60` passes `color="white"` as a string prop to `ExternalLink` rather than using a CSS variable. This is correct for the light theme, but is the only color value in the screen that does not use the NativeWind token system (`text-white` class on the sibling Text element is the correct pattern). No functional impact on the current design, but inconsistent with the project's token convention.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**What matches the contract:**

- Back navigation: "Back to all coins" — `pool-details-header.tsx:20` — exact match
- APY label: "Current APY" — `pool-info-card.tsx:28` — exact match
- CTA label: "Open {project}" with dynamic project name — `pool-details/index.tsx:57` — exact match
- Accessibility label — back link: "Navigate back to pool list" — `pool-details-header.tsx:16` — exact match
- Accessibility label — APY value: "Current APY: {formattedAPY}" — `pool-info-card.tsx:32` — exact match
- Accessibility label — CTA button: "Open {project} in external browser" — `pool-details/index.tsx:54` — exact match
- Accessibility label — token icon: "{symbol} token icon" — `pool-identity-block.tsx:13` — exact match

**Gaps vs spec:**

- Error heading "Could not load pool details" and body "Something went wrong. Go back and try again." are not implemented. `ScreenWrapper` shows "Something went wrong" + "Retry" — deviates from spec copy.
- Empty/missing params state "Pool data unavailable. Go back and select a pool." has no implementation. The route file at `pool-details.tsx:17-24` silently constructs a Pool with empty strings and `apy: 0` when params are absent — no user-facing message is shown.

Score rationale: All interactive copy matches the contract exactly. The two deviations are error and edge-case states (non-primary path), which the spec explicitly declared.

---

### Pillar 2: Visuals (4/4)

**Zone compliance (per UI-SPEC Screen Zones):**

- Zone 1 — App Header: `<Header />` reused unchanged at top of screen — `pool-details/index.tsx:33`. Correct.
- Zone 2 — Navigation Link: `PoolDetailsHeader` is a full-row `Pressable` with ArrowLeft icon (16px) and "Back to all coins" text. `style={{ minHeight: 44 }}` ensures the 44px touch target. No visual card or border — matches spec exactly — `pool-details-header.tsx`.
- Zone 3 — Token Identity Block: 56x56px icon box (`h-14 w-14`) with rounded-2xl corners, brand/10 background, brand/20 border, symbol text inside; large 28px bold symbol text to the right — `pool-identity-block.tsx`. Correct.
- Zone 4 — Details Card: white card with `bg-card`, `border border-border`, `rounded-2xl`, `shadow-sm shadow-black/5`, `mx-4 mt-2 p-4`. Responsive layout via `useDeviceLayout()` — mobile: `flex-col`, desktop: `flex-row justify-between` — `pool-info-card.tsx`. Correct.
- Zone 5 — CTA Button: outside the card at `mx-4 mt-6`, full-width on mobile (`w-full`), left-aligned container on desktop (`items-start`) — `pool-details/index.tsx:46-62`. ExternalLink icon present. Correct.

**Primary focal point:** APY value is `text-4xl font-bold text-brand` — the largest text element on screen in accent color. Correct per spec designation.

No icon-only buttons without accessible labels. Visual hierarchy follows size + weight + color differentiation as specified.

---

### Pillar 3: Color (4/4)

**Accent (`brand` / #00AD69) usage — exactly the 4 declared elements:**

1. APY value text: `text-brand` — `pool-info-card.tsx:31`
2. Green dot in chain badge: `text-brand dark:text-brand` — `pool-info-card.tsx:43`
3. Token symbol icon box: `bg-brand/10` background and `border-brand/20` border — `pool-identity-block.tsx:12`
4. Symbol text inside icon box: `text-brand` — `pool-identity-block.tsx:16`
5. CTA button background: `bg-brand` with `active:bg-brand/90` press state — `pool-details/index.tsx:49`

That is 5 usage sites across 4 declared purposes — all within spec. No accent usage on decorative elements, general borders, or non-data text.

**Hardcoded color values:** None found in pool-details component files (grep returned no results for `#[hex]` or `rgb(`). The one potential concern is `color="white"` on the ExternalLink icon at `pool-details/index.tsx:60` — this is a prop value passed to the lucide icon, not a CSS class, and is functionally equivalent to `text-white`, but does not use the token system.

**Dark mode:** CSS variables shift via `global.css`. Brand green stays `#00AD69` in both modes. The `dark:text-brand` redundant class on the badge dot (`pool-info-card.tsx:43`) is harmless but unnecessary since `text-brand` resolves to the same value in both modes.

---

### Pillar 4: Typography (4/4)

**Font sizes in use across pool-details components:**

| Size class | Pixel equiv | Usage |
|------------|-------------|-------|
| `text-sm` | 14px | "Back to all coins" nav link; "Current APY" label; symbol in icon box |
| `text-base` | 16px | Project name in card; CTA button text |
| `text-3xl` | 28px (approx 30px in RN) | Token symbol large text |
| `text-4xl` | 36px (approx 36px in RN) | APY display value |

4 distinct sizes — matches the 4 declared roles in the UI-SPEC Typography table exactly. No undeclared sizes.

**Font weights in use:**

| Weight class | Usage |
|--------------|-------|
| `font-bold` (700) | APY value, token symbol (both), project name, CTA button text |
| (default/400) | "Back to all coins", "Current APY" label, chain text, no explicit weight class = regular |

Only 2 weight levels used: 400 (implicit default) and 700 (`font-bold`). No `font-medium`, `font-semibold`, or other intermediate weights. Matches spec: "No intermediate weights."

---

### Pillar 5: Spacing (4/4)

**Spacing classes found:**

| Class | Location | Spec mapping |
|-------|----------|--------------|
| `px-4 py-3` | PoolDetailsHeader pressable row | md (16px) horizontal, 12px vertical — 44px min-height via style prop |
| `gap-2` | PoolDetailsHeader icon+text gap | sm (8px) — matches spec "gap between icon and text" |
| `px-4 py-4` | PoolIdentityBlock row | md (16px) |
| `gap-3` | PoolIdentityBlock icon+text gap | 12px — close to md; not a declared token but within 4px grid |
| `gap-1` | Project/chain vertical stack | xs (4px) — matches spec "4px gap" for mobile stacked |
| `gap-4` | APY/project-chain layout gap | 16px — md |
| `mx-4 mt-2 p-4` | PoolInfoCard card | md (16px) — matches spec "mx-4 horizontal, mt-2 top, p-4 internal" |
| `mx-4 mt-6` | CTA button container | 16px horizontal, 24px top — matches spec lg (24px) for section spacing |

**Arbitrary values:** None found. All spacing uses standard Tailwind scale tokens. The `gap-3` (12px) in PoolIdentityBlock is not explicitly declared in the spacing scale table but is on the 4px grid and consistent with the icon-gap usage pattern from the home screen's PoolListItem.

No `[Npx]` or `[Nrem]` arbitrary values in any pool-details file.

---

### Pillar 6: Experience Design (3/4)

**State coverage:**

- Loading state: Handled by `ScreenWrapper` in `pool-details.tsx` — wraps screen in `<Suspense fallback={<Loading />}>`. Spinning indicator displays while data loads. Correct.
- Error state: Handled by `ErrorBoundary` in `ScreenWrapper`. Renders a retry button. Functional, but copy deviates from spec (see Copywriting findings).
- Empty/missing params state: Not handled. `pool-details.tsx:17-24` constructs a Pool object with empty string fallbacks for all fields when params are absent. The screen would render with blank symbol, empty project name, 0.00% APY, and a non-functional "Open " CTA button with no URL. No user feedback.
- Press feedback: CTA button has `active:bg-brand/90` for press visual feedback. Back navigation uses `Pressable` with default ripple/opacity feedback on Android/iOS.
- Disabled states: No async loading on the CTA press — `handleOpenPool` is async but no loading/disabled state during the `openBrowserAsync` call. For a URL that takes time to open, users could double-tap. Low risk but worth noting.
- Destructive actions: None in this phase — no confirmation dialogs required.
- Accessibility roles: All interactive and semantic elements have correct `accessibilityRole` values.

**What is well done:** The `ScreenWrapper` pattern provides consistent Suspense + error recovery without custom per-screen boilerplate. The `useCallback` + `pool.url` dependency on `handleOpenPool` is correct.

---

## Registry Audit

Registry audit: No third-party registries declared in UI-SPEC.md. All components (Badge, Button, Text) are from shadcn official (react-native-reusables), already installed in the codebase. No audit required.

---

## Files Audited

- `src/screens/pool-details/index.tsx`
- `src/screens/pool-details/components/pool-details-header.tsx`
- `src/screens/pool-details/components/pool-identity-block.tsx`
- `src/screens/pool-details/components/pool-info-card.tsx`
- `src/app/pool-details.tsx`
- `src/lib/format-apy.ts`
- `src/screens/home/index.tsx` (navigation wire-up)
- `src/components/screen-wrapper.tsx` (error/loading state baseline)
- `.planning/phases/02-screen-navigation/02-UI-SPEC.md` (audit baseline)
