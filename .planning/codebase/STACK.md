# Technology Stack

**Analysis Date:** 2026-03-30

## Languages

**Primary:**
- TypeScript 5.9.2 - Strict mode enabled, extends `expo/tsconfig.base`

**Secondary:**
- JavaScript - Configuration files (`babel.config.js`, `metro.config.js`, `tailwind.config.js`, `jest.config.js`, `eslint.config.js`)

## Runtime

**Environment:**
- Node.js v24.12.0 (host runtime for tooling)
- React Native 0.81.4 (mobile runtime, new architecture enabled)
- Expo SDK 54 (`expo@~54.0.13`)
- React 19.1.0 with React Compiler enabled (`experiments.reactCompiler: true` in `app.config.js`)

**Package Manager:**
- Bun 1.3.5
- Lockfile: `bun.lock` (present)

## Frameworks

**Core:**
- Expo SDK 54 (`expo@~54.0.13`) - React Native development platform
- Expo Router v6 (`expo-router@~6.0.11`) - File-based routing with typed routes
- React Native 0.81.4 - Cross-platform mobile framework (new architecture enabled via `newArchEnabled: true`)
- React 19.1.0 - UI library with experimental React Compiler

**Styling:**
- NativeWind v4 (`nativewind@^4.2.1`) - Tailwind CSS for React Native
- Tailwind CSS 3.4.17 - Utility-first CSS framework (dev dependency, powers NativeWind)
- tailwindcss-animate 1.0.7 - Animation plugin for Tailwind

**State & Data:**
- React Query v5 (`@tanstack/react-query@^5.90.10`) - Server state management and caching

**Testing:**
- Jest 30.2.0 - Test runner
- jest-expo 54.0.16 - Expo-specific Jest preset
- React Native Testing Library 13.3.3 (`@testing-library/react-native`)
- jest-native 5.4.3 (`@testing-library/jest-native`) - Custom matchers

**Build/Dev:**
- Metro bundler (configured via `metro.config.js` with NativeWind integration)
- Babel (configured via `babel.config.js` with `babel-preset-expo` and `nativewind/babel`)
- ESLint 9.25.0 with Expo flat config + Prettier integration
- Prettier 3.6.2 with `prettier-plugin-tailwindcss` for class sorting

## Key Dependencies

**Critical (Core App Functionality):**

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~54.0.13 | Development platform and build system |
| `expo-router` | ~6.0.11 | File-based routing (entry point: `expo-router/entry`) |
| `react` | 19.1.0 | UI library |
| `react-native` | 0.81.4 | Cross-platform mobile runtime |
| `@tanstack/react-query` | ^5.90.10 | Server state, caching, data fetching |
| `axios` | ^1.13.2 | HTTP client for API requests |
| `nativewind` | ^4.2.1 | Tailwind CSS styling for React Native |

**UI Components & Navigation:**

| Package | Version | Purpose |
|---------|---------|---------|
| `@shopify/flash-list` | ^2.2.2 | High-performance list rendering (v2, no `estimatedItemSize` needed) |
| `@gorhom/bottom-sheet` | ^5.2.8 | Bottom sheet component (mobile) |
| `@rn-primitives/dropdown-menu` | ^1.2.0 | Dropdown menu primitives |
| `@rn-primitives/portal` | ^1.3.0 | Portal for overlays |
| `@rn-primitives/slot` | ^1.2.0 | Slot pattern for component composition |
| `lucide-react-native` | ^0.564.0 | Icon library |
| `@expo/vector-icons` | ^15.0.2 | Expo vector icons |
| `expo-image` | ~3.0.9 | Optimized image component |

**Navigation:**

| Package | Version | Purpose |
|---------|---------|---------|
| `@react-navigation/native` | ^7.1.8 | Navigation core |
| `@react-navigation/bottom-tabs` | ^7.4.0 | Bottom tab navigator |
| `@react-navigation/elements` | ^2.6.3 | Navigation UI elements |
| `react-native-screens` | ~4.16.0 | Native screen containers |
| `react-native-safe-area-context` | ~5.6.0 | Safe area handling |

**Animation & Gestures:**

| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-reanimated` | ~4.1.1 | Animation library |
| `react-native-gesture-handler` | ~2.28.0 | Gesture system |
| `react-native-worklets` | 0.5.1 | Worklets for Reanimated |

**Utilities:**

| Package | Version | Purpose |
|---------|---------|---------|
| `class-variance-authority` | ^0.7.1 | Component variant management (shadcn pattern) |
| `clsx` | ^2.1.1 | Conditional className joining |
| `tailwind-merge` | ^3.3.1 | Tailwind class deduplication |

**Expo Modules:**

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-constants` | ~18.0.9 | Access app config and env vars at runtime |
| `expo-dev-client` | ~6.0.15 | Development client |
| `expo-font` | ~14.0.9 | Custom font loading |
| `expo-haptics` | ~15.0.7 | Haptic feedback |
| `expo-linking` | ~8.0.8 | Deep linking |
| `expo-splash-screen` | ~31.0.10 | Splash screen management |
| `expo-status-bar` | ~3.0.8 | Status bar control |
| `expo-symbols` | ~1.0.7 | SF Symbols (iOS) |
| `expo-system-ui` | ~6.0.7 | System UI configuration |
| `expo-web-browser` | ~15.0.8 | In-app browser |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ~5.9.2 | Type checking (strict mode) |
| `jest` | ^30.2.0 | Test runner |
| `jest-expo` | ^54.0.16 | Expo-specific Jest preset |
| `@testing-library/react-native` | ^13.3.3 | Component/hook testing utilities |
| `@testing-library/jest-native` | ^5.4.3 | Custom Jest matchers for RN |
| `@types/jest` | ^30.0.0 | Jest type definitions |
| `@types/react` | ~19.1.0 | React type definitions |
| `eslint` | ^9.25.0 | Linting |
| `eslint-config-expo` | ~10.0.0 | Expo ESLint preset (flat config) |
| `eslint-config-prettier` | ^10.1.8 | Disable ESLint rules conflicting with Prettier |
| `eslint-plugin-prettier` | ^5.5.4 | Run Prettier as ESLint rule |
| `eslint-import-resolver-typescript` | ^4.4.4 | Resolve TypeScript path aliases in ESLint |
| `prettier` | ^3.6.2 | Code formatting |
| `prettier-plugin-tailwindcss` | ^0.7.2 | Tailwind class sorting in Prettier |
| `tailwindcss` | ^3.4.17 | Tailwind CSS engine (consumed by NativeWind) |

## Build & Bundle

**Bundler:** Metro (via Expo, configured in `metro.config.js`)
- NativeWind integration via `withNativeWind` wrapper
- Input CSS: `./global.css`
- `inlineRem: 16` for consistent rem-to-px conversion

**Build Commands:**
```bash
bun start              # Start Expo dev server
bun run ios            # Build and run on iOS simulator
bun run android        # Build and run on Android emulator
bun run web            # Start web dev server (Metro, static output)
```

**Type Checking:**
```bash
bun run types          # tsc --noEmit
```

**Linting:**
```bash
bun run lint           # expo lint (ESLint 9 flat config)
```

**Testing:**
```bash
bun run test           # jest
bun run test:watch     # jest --watch
bun run test:coverage  # jest --coverage
```

**Output:**
- iOS/Android: Native builds via `expo run:ios` / `expo run:android`
- Web: Static output via Metro (`web.output: "static"` in `app.config.js`)

## Configuration

**Environment:**
- Environment variables accessed via `expo-constants` at runtime
- Configuration in `src/config/env.ts` reads from `Constants.expoConfig.extra`
- Variables defined in `app.config.js` under `extra` block
- `.env` file present (not committed), `.env.example` present for reference
- Required: `EXPO_PUBLIC_DEFILLAMA_BASE_API_URL`

**TypeScript:**
- Config: `tsconfig.json` extends `expo/tsconfig.base`
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Includes: `**/*.ts`, `**/*.tsx`, `.expo/types/**/*.ts`, `expo-env.d.ts`, `nativewind-env.d.ts`

**Babel:**
- Config: `babel.config.js`
- Preset: `babel-preset-expo` with `jsxImportSource: "nativewind"`
- Additional preset: `nativewind/babel`

**ESLint:**
- Config: `eslint.config.js` (ESLint 9 flat config format)
- Extends: `eslint-config-expo/flat` + `eslint-plugin-prettier/recommended`
- Import resolver configured for TypeScript path aliases
- Jest globals configured for test files

**Prettier:**
- Config: `.prettierrc`
- Plugins: `prettier-plugin-tailwindcss` (class sorting)

**Tailwind/NativeWind:**
- Config: `tailwind.config.js`
- Dark mode: `"class"` strategy
- Content: `src/app/`, `src/components/`, `src/screens/`
- Custom theme: HSL CSS variable-based color system (shadcn pattern)
- Brand color: `#00AD69` (green)
- Preset: `nativewind/preset`

**Component System:**
- Config: `components.json` (shadcn-style)
- Style: New York
- Aliases: `@/components`, `@/components/core` (ui), `@/lib`, `@/hooks`

## Platform Requirements

**Development:**
- macOS (for iOS development)
- Bun 1.3+ (package manager)
- Node.js 24+ (tooling runtime)
- Xcode (iOS builds)
- Android Studio (Android builds)
- EAS project ID configured: `5a85ba39-4794-462c-91b7-1ddc9b59e1c9`

**Target Platforms:**
- iOS (supports tablet via `supportsTablet: true`)
- Android (edge-to-edge enabled)
- Web (Metro bundler, static output)

**App Identifiers:**
- iOS Bundle ID: `com.ambegossi.yieldly`
- Android Package: `com.ambegossi.yieldly`
- URL Scheme: `yieldly`

---

*Stack analysis: 2026-03-30*
