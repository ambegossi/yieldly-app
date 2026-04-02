---
status: investigating
trigger: "tapping pool item on home screen does nothing, no navigation to pool details"
created: 2026-04-01T22:00:00-03:00
updated: 2026-04-01T22:00:00-03:00
---

## Current Focus

hypothesis: The absoluteFill View containing two GorhomBottomSheet components (lines 201-221 in home/index.tsx) intercepts touch events on mobile, preventing Pressable taps on PoolListItem from reaching the JS responder system. The bottom sheet's BottomSheetBackdrop renders with a GestureDetector(Gesture.Tap()) over a full-screen animated view, and its pointerEvents state initializes as 'auto' before the animated reaction flips it to 'none'.
test: Remove the absoluteFill bottom sheet wrapper or conditionally render bottom sheets only when opened
expecting: Pool items become tappable after removing the overlay
next_action: Propose fix to conditionally render or restructure bottom sheet overlay

## Symptoms

expected: Tapping a pool item navigates to pool-details screen via router.push
actual: Tapping does nothing - no navigation occurs
errors: None visible (no crash, no error boundary)
reproduction: Tap any pool item on home screen (mobile)
started: After replacing Alert.alert stub with router.push (commit dd6d712)

## Eliminated

- hypothesis: Component wiring is broken (onPress not passed to PoolListItem)
  evidence: Code trace confirms handlePoolPress -> onPress prop -> handlePress -> Pressable onPress chain is correct. PoolListItem test confirms press works in isolation.
  timestamp: 2026-04-01T22:00:00

- hypothesis: React.memo custom comparator prevents onPress updates
  evidence: handlePoolPress is wrapped in useCallback([router]), and useRouter() returns a stable singleton (imperative_api_1.router). The callback identity never changes, so memo comparator not checking onPress is irrelevant.
  timestamp: 2026-04-01T22:00:00

- hypothesis: Expo Router route is misconfigured
  evidence: pool-details.tsx exists in src/app/, typed routes include /pool-details, _layout.tsx uses Stack which auto-discovers routes.
  timestamp: 2026-04-01T22:00:00

- hypothesis: TypeScript or import errors prevent compilation
  evidence: tsc --noEmit passes clean. ESLint shows 0 errors. All 196 tests pass.
  timestamp: 2026-04-01T22:00:00

- hypothesis: Pool details screen crashes on mount silently
  evidence: ScreenWrapper ErrorBoundary would show "Something went wrong" UI, user would see screen transition even if error occurred.
  timestamp: 2026-04-01T22:00:00

## Evidence

- timestamp: 2026-04-01T22:00:00
  checked: handlePoolPress wiring in home/index.tsx
  found: Correctly defined as useCallback that calls router.push({pathname:"/pool-details", params:{...}}), passed as onPress to PoolListItem via FlashList renderItem
  implication: Handler code is correct

- timestamp: 2026-04-01T22:00:00
  checked: PoolListItem Pressable in pool-list-item.tsx
  found: Pressable wraps entire item with onPress={handlePress}, handlePress calls onPress(pool)
  implication: Touch handling code is correct

- timestamp: 2026-04-01T22:00:00
  checked: Mobile bottom sheet overlay (lines 201-221 of home/index.tsx)
  found: View with StyleSheet.absoluteFill and pointerEvents="box-none" wraps two GorhomBottomSheet instances. Rendered AFTER FlashList (higher z-order). Only on mobile (isMobile && ...).
  implication: Full-screen overlay sits on top of the pool list

- timestamp: 2026-04-01T22:00:00
  checked: @gorhom/bottom-sheet backdrop implementation
  found: BottomSheetBackdrop renders GestureDetector(Gesture.Tap()) over absoluteFillObject view. pointerEvents state initializes as 'auto', then animated reaction sets it to 'none' when closed. Native gesture handlers may operate independently of RN pointerEvents prop.
  implication: Backdrop gesture handlers could intercept taps before Pressable receives them

- timestamp: 2026-04-01T22:00:00
  checked: useRouter() stability in expo-router
  found: Returns module-level singleton (imperative_api_1.router), referentially stable across renders
  implication: handlePoolPress callback is stable, memo comparator irrelevant

- timestamp: 2026-04-01T22:00:00
  checked: Git diff of commit dd6d712 (wire pool press)
  found: Only change was replacing Alert.alert with router.push and adding useRouter import. The absoluteFill bottom sheet overlay existed before this commit.
  implication: The overlay was always there but was masked by Alert.alert working (Alert uses native dialog, not navigation)

## Resolution

root_cause: The absoluteFill View wrapping two GorhomBottomSheet instances (home/index.tsx lines 201-221) sits on top of the FlashList in the view hierarchy. While pointerEvents="box-none" is set on the wrapper View, the @gorhom/bottom-sheet library renders its own absoluteFillObject containers with GestureDetector handlers (Gesture.Tap on backdrop, Gesture.Pan on draggable view). These native gesture handlers can intercept touches before the JS-based Pressable in PoolListItem receives them. The previous Alert.alert implementation worked because Alert uses native OS dialogs that don't require navigation — the touch interception was always present but invisible.
fix:
verification:
files_changed: []
