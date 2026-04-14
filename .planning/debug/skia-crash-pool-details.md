---
status: diagnosed
trigger: "Two errors on pool-details screen: missing default export warning + RNSkiaModule TurboModule crash"
created: 2026-04-02T00:00:00Z
updated: 2026-04-02T00:10:00Z
---

## Current Focus

hypothesis: CONFIRMED - Skia native module not linked in iOS build; missing default export is cascade from crash at import time
test: Checked Podfile.lock for Skia pods
expecting: Skia pods absent
next_action: Report diagnosis

## Symptoms

expected: Pool details screen opens showing APY chart
actual: Crash with TurboModuleRegistry error for RNSkiaModule; also warning about missing default export
errors: "WARN Route ./pool-details.tsx is missing the required default export" and "ERROR Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'RNSkiaModule' could not be found"
reproduction: Navigate to pool-details screen
started: After adding victory-native chart implementation

## Eliminated

- hypothesis: Missing default export in pool-details.tsx route file
  evidence: File has `export default function PoolDetailsRoute()` at line 6. Warning is a cascade effect -- when apy-chart.tsx crashes at import time (line 2-3), the entire module tree for pool-details fails to load, so expo-router sees no default export.
  timestamp: 2026-04-02T00:02:00Z

- hypothesis: Wrong version of @shopify/react-native-skia for Expo SDK 54
  evidence: expo install --check does not flag skia version as incompatible. Version 2.2.12 is in the compatible range for SDK 54.
  timestamp: 2026-04-02T00:05:00Z

## Evidence

- timestamp: 2026-04-02T00:01:00Z
  checked: src/app/pool-details.tsx
  found: File HAS a default export (line 6)
  implication: Missing export warning is a cascade from import failure, not the real bug

- timestamp: 2026-04-02T00:01:00Z
  checked: package.json dependencies
  found: @shopify/react-native-skia@2.2.12 and victory-native@^41.20.2 are installed as JS deps
  implication: JS packages present but native module linking is separate

- timestamp: 2026-04-02T00:03:00Z
  checked: ios/Podfile.lock for "skia" or "Skia"
  found: ZERO matches -- Skia pods are not installed in the iOS native build
  implication: npm install added JS code but pod install was never run after adding Skia

- timestamp: 2026-04-02T00:03:00Z
  checked: ios/Podfile for "skia" or "Skia"
  found: ZERO matches -- no explicit pod reference
  implication: Skia relies on autolinking; pods must be reinstalled

- timestamp: 2026-04-02T00:04:00Z
  checked: app.config.js plugins array
  found: No Skia-related plugin configured (only expo-router and expo-splash-screen)
  implication: Skia doesn't need a plugin, but native rebuild IS required

- timestamp: 2026-04-02T00:05:00Z
  checked: ios/ directory existence
  found: Full ios/ directory with Podfile, Podfile.lock, xcworkspace -- project uses dev client, not Expo Go
  implication: Dev client was built BEFORE Skia was added; native binary doesn't include Skia TurboModule

- timestamp: 2026-04-02T00:06:00Z
  checked: Import chain causing crash
  found: pool-info-card.tsx (line 8) imports ApyChart from apy-chart.tsx, which imports from victory-native (line 2) and @shopify/react-native-skia (line 3)
  implication: Even though PoolDetailsScreen doesn't directly import the chart, PoolInfoCard does, triggering the crash

## Resolution

root_cause: The native Skia module (RNSkiaModule) is not present in the iOS dev client build. When @shopify/react-native-skia was added to package.json, only the JS dependencies were installed (bun install). The iOS native binary was never rebuilt (no `npx expo prebuild` + `pod install` or `npx expo run:ios`). Victory-native and the direct useFont import both require the Skia native module at runtime. The "missing default export" warning is a cascade -- the import crash prevents the route module from loading.
fix:
verification:
files_changed: []
