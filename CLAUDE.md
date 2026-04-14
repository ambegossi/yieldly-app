# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yieldly is a React Native mobile application built with Expo SDK 54, using file-based routing via expo-router. The app uses NativeWind v4 for styling (Tailwind CSS), React Query for data fetching, and follows Clean Architecture principles with a clear separation between domain and infrastructure layers.

## Development Commands

### Running the app

- `bun start` - Start Expo development server
- `bun run android` - Run on Android emulator
- `bun run ios` - Run on iOS simulator
- `bun run web` - Run in web browser

### Code quality

- `bun run lint` - Run ESLint (configured with Expo config + Prettier)
- `bun run types` - Check TypeScript types without emitting files

### Package management

This project uses Bun as the package manager (note the `bun.lock` file).

## Architecture

### Clean Architecture Pattern

The codebase follows Clean Architecture with three main layers:

1. **Domain Layer** (`src/domain/`)
   - Contains pure business logic and entities
   - Defines repository interfaces (e.g., `PoolRepo`)
   - Organizes features by domain (e.g., `pool/`)
   - Use cases are located in feature-specific `use-cases/` directories

2. **Infrastructure Layer** (`src/infra/`)
   - Implements domain interfaces with concrete implementations
   - `repositories/repository-provider.tsx` - React Context for dependency injection
   - `use-cases/use-app-query.ts` - Wrapper around React Query for consistent data fetching

3. **Presentation Layer** (`src/app/`)
   - File-based routing using expo-router
   - Components consume repositories via `useRepository()` hook

### Dependency Injection Pattern

Repositories are injected via React Context:

- Domain defines interfaces in `src/domain/repositories.ts`
- Infrastructure provides `RepositoryProvider` and `useRepository()` hook
- Concrete implementations are passed to `RepositoryProvider` at the root level

### Path Aliases

TypeScript path alias `@/*` maps to `./src/*` (configured in tsconfig.json).

### File and Directory Naming Conventions

All files and directories MUST use kebab-case naming:

**Files:**

- Component files: `button.tsx`, `pool-card.tsx`, `home-screen.tsx`
- Hook files: `use-pool-find-all.ts`, `use-app-query.ts`, `use-auth.ts`
- Class/Service files: `http-client.ts`, `pool-adapter.ts`, `http-pool-repo.ts`
- Entity/Interface files: `pool.ts`, `pool-repo.ts`, `repositories.ts`
- DTO files: `pool-dto.ts`, `user-dto.ts`
- Test files: `use-pool-find-all.test.tsx`, `pool-adapter.test.ts`

**Directories:**

- Feature directories: `pool/`, `user/`, `auth/`
- Utility directories: `use-cases/`, `http-repository/`, `core/`

**Code-level naming remains unchanged:**

- Components: PascalCase (`export function Button() {}`)
- Hooks: camelCase (`export function usePoolFindAll() {}`)
- Classes: PascalCase (`export class HttpClient {}`)
- Interfaces: PascalCase (`export interface Pool {}`)

**Rationale:** Consistent kebab-case file naming improves cross-platform compatibility,
reduces case-sensitivity issues in version control, and creates visual distinction
between file names (kebab-case) and code exports (PascalCase/camelCase).

### File Structure & Naming Conventions

**Routes and Screens:**

- `src/app/` directory contains routes and route layouts (Expo Router file-based routing)
- `src/screens/` directory contains screen components
- Each screen is a folder with a kebab-case name (e.g., `home/`, `pool-details/`)
- Each screen folder contains an `index.tsx` file as the main entry point
- Screen-specific components live in a `components/` folder inside the screen folder
  - Example: `src/screens/home/components/pool-card.tsx`

**Component Conventions:**

- Components MUST be created using function declarations with named exports
- Example: `export function Button() { ... }`
- Core components (Button, Text, TextInput, etc.) live in `src/components/core/`
- Composite/shared components live in `src/components/`
- Screen-specific components live in `src/screens/[screenName]/components/`

**JSX Formatting:**

- Sibling JSX components MUST be separated by a blank line.
- Exception: files in `src/components/core/` (react-native-reusables primitives).

**Hook Conventions:**

- Hooks MUST be created using function declarations with named exports
- Hooks MUST use camelCase naming pattern (e.g., `usePoolData`, `useAuth`)
- Example: `export function usePoolData() { ... }`

## Styling System

### NativeWind v4 Configuration

- Uses Tailwind CSS via NativeWind for cross-platform styling
- `global.css` defines CSS variables for theming
- Dark mode support via `darkMode: "class"` in tailwind config
- Custom color system based on HSL CSS variables (--primary, --secondary, --background, etc.)

### UI Components

- Core components (Button, Text, TextInput, etc.) are located in `src/components/core/`
- Other composite components are located in `src/components/`
- Built with react-native-reusables patterns
- Uses `cn()` utility from `src/lib/utils.ts` for className merging
- Theme utilities in `src/lib/theme.ts`
- components.json configures the shadcn-like component system (New York style)

## Key Technologies

- **Expo SDK 54** with new architecture enabled (`newArchEnabled: true`)
- **React 19.1.0** with React Compiler enabled in experiments
- **Expo Router v6** for file-based routing with typed routes
- **React Query (@tanstack/react-query)** for server state management
- **NativeWind v4** with Metro config integration
- **TypeScript** with strict mode enabled
- **ESLint** with Expo config and Prettier integration

## Project Configuration Files

- `app.json` - Expo app configuration (bundle IDs, plugins, experiments)
- `babel.config.js` - Babel preset with NativeWind integration
- `metro.config.js` - Metro bundler with NativeWind support
- `tailwind.config.js` - Tailwind configuration with custom theme extensions
- `.prettierrc` - Prettier with tailwindcss plugin for class sorting
- `components.json` - shadcn-style component configuration

## Development Patterns

### Adding New Features

1. Define domain entities and repository interfaces in `src/domain/[feature]/`
2. Create use cases in `src/domain/[feature]/use-cases/`
3. Implement repository in infrastructure layer
4. Register repository in `src/domain/repositories.ts` interface
5. Provide implementation via `RepositoryProvider` in root layout
6. Use `useRepository()` hook to access repositories in components

### Data Fetching Pattern

Use `useAppQuery` wrapper for consistent React Query integration:

````typescript
const { data, isLoading, error } = useAppQuery({
  queryKey: ["key"],
  fetchData: () => repository.method(),
Use `useAppQuery` wrapper for consistent React Query integration:

```typescript
const { data, isLoading, error } = useAppQuery({
  queryKey: ['key'],
  fetchData: () => repository.method()
});
````

## Important Notes

- Expo Router requires routes to be in `src/app/` directory
- Global styles must be imported in `_layout.tsx`
- Portal components require `<PortalHost />` in root layout (already configured)
- React 19 and React Compiler are experimental features currently enabled

## Testing Standards

### Test Organization

- Tests are co-located with source code in `__tests__/` directories
- Test files use `.test.ts` extension (or `.test.tsx` if the test contains JSX)
- Follow the pattern: `src/[layer]/[feature]/__tests__/[filename].test.{ts,tsx}`
- Example: `src/domain/pool/use-cases/__tests__/use-pool-find-all.test.tsx`

### Testing Framework

- **Jest** with `jest-expo` preset for React Native compatibility
- **React Native Testing Library** (`@testing-library/react-native`) for component and hook testing
- **Testing Library utilities**: `renderHook`, `waitFor`, `render`, `screen`
- Path alias `@/*` supported via Jest module name mapper

### Running Tests

```bash
bun test                    # Run all tests
bun test --watch            # Run in watch mode
bun test [pattern]          # Run tests matching pattern
bun run test:coverage       # Run with coverage report
```

### Testing Custom Hooks

When testing hooks with React Query and repositories:

- Create mock repositories using factory functions with `jest.fn()` and optional overrides
- Create QueryClient with `retry: false`, `gcTime: 0`, `staleTime: 0` for test isolation
- Build wrapper with `QueryClientProvider` and `RepositoryProvider`
- Create fresh QueryClient in `beforeEach`, clean up with `jest.clearAllMocks()` in `afterEach`
- Use `renderHook` with wrapper and `waitFor` for async state changes
- Always call `unmount()` at the end of each test to prevent `act()` warnings

### Test Coverage

Cover success scenarios, loading states, error handling, edge cases, call verification, and query key verification.

### Best Practices

- Create fresh QueryClient in `beforeEach`, clean up in `afterEach` with `jest.clearAllMocks()`
- Always use `waitFor` for async state changes
- Always call `unmount()` at the end of each test to prevent `act()` warnings from React Query updates
- Use descriptive test names and Arrange-Act-Assert pattern
- Verify hooks don't refetch on component re-renders

## MCP Tools

### iOS Simulator Integration

Use the `ios-simulator` MCP tools for mobile-based validation when needed:

- **Visual Validation**: Use `mcp__ios-simulator__screenshot` to capture the current state and compare with design specs
- **UI Inspection**: Use `mcp__ios-simulator__ui_describe_all` to verify accessibility elements and layout structure
- **Interactive Testing**: Use `mcp__ios-simulator__ui_tap`, `mcp__ios-simulator__ui_swipe`, and `mcp__ios-simulator__ui_type` to simulate user interactions
- **Recording**: Use `mcp__ios-simulator__record_video` to capture interaction flows for review

Always validate that the implementation matches the design specifications before considering a feature complete.

### Agent Browser CLI

Use the `agent-browser` skill for browser-based validation when needed:

- **Web Validation**: Use `/agent-browser` to interact with the web version of the app or external services
- **Form & Interaction Testing**: Automate form submissions, button clicks, and navigation flows
- **Screenshot Capture**: Take screenshots of web implementations to compare with design specs
- **Data Extraction**: Scrape and verify data rendered on web pages
- **End-to-End Testing**: Automate complete user journeys in the browser

Use this skill when validating web-facing features, testing API integrations via browser, or when the iOS simulator alone is insufficient.

### Perplexity Research

Use the `perplexity` MCP tools for research when needed:

- **Quick Questions**: Use `mcp__perplexity__perplexity_ask` for conversational queries about React Native, Expo, or libraries
- **Deep Research**: Use `mcp__perplexity__perplexity_research` for comprehensive research with citations on complex topics
- **Technical Reasoning**: Use `mcp__perplexity__perplexity_reason` for well-reasoned responses on architectural decisions
- **Web Search**: Use `mcp__perplexity__perplexity_search` to find up-to-date documentation, best practices, or solutions

Use these tools proactively to stay current with best practices and resolve technical uncertainties.

## Commits

- Use conventional commits specification to write commit messages

## Active Technologies

- TypeScript 5.9.2 with strict mode enabled + Expo SDK 54, React 19.1.0, React Query v5, FlashList, @gorhom/bottom-sheet, NativeWind v4 (001-home-screen)
- React Query cache for data persistence (no database needed for MVP) (001-home-screen)

## Recent Changes

- 001-home-screen: Added TypeScript 5.9.2 with strict mode enabled + Expo SDK 54, React 19.1.0, React Query v5, FlashList, @gorhom/bottom-sheet, NativeWind v4

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Yieldly — Pool Details Screen**

Yieldly is a React Native mobile app that aggregates DeFi yield farming opportunities across chains. Users browse pools on the home screen and drill into a pool details screen to see current APY, project/chain info, a 30-day historical APY line chart, and a CTA to open the pool externally.

**Core Value:** Users can quickly evaluate a pool's yield performance over time and decide whether to invest, then open the pool's platform directly.

### Constraints

- **Chart library**: Victory Native (user-selected)
- **Data**: APY history will use mock data; separate `findApyHistory` method on PoolRepo
- **Architecture**: Must follow existing Clean Architecture pattern (domain → infra → presentation)
- **Styling**: NativeWind v4 with existing Tailwind theme (green palette for APY values)
- **Routing**: Expo Router file-based routing, pool ID as route parameter
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.9.2 - Strict mode enabled, extends `expo/tsconfig.base`
- JavaScript - Configuration files (`babel.config.js`, `metro.config.js`, `tailwind.config.js`, `jest.config.js`, `eslint.config.js`)
## Runtime
- Node.js v24.12.0 (host runtime for tooling)
- React Native 0.81.4 (mobile runtime, new architecture enabled)
- Expo SDK 54 (`expo@~54.0.13`)
- React 19.1.0 with React Compiler enabled (`experiments.reactCompiler: true` in `app.config.js`)
- Bun 1.3.5
- Lockfile: `bun.lock` (present)
## Frameworks
- Expo SDK 54 (`expo@~54.0.13`) - React Native development platform
- Expo Router v6 (`expo-router@~6.0.11`) - File-based routing with typed routes
- React Native 0.81.4 - Cross-platform mobile framework (new architecture enabled via `newArchEnabled: true`)
- React 19.1.0 - UI library with experimental React Compiler
- NativeWind v4 (`nativewind@^4.2.1`) - Tailwind CSS for React Native
- Tailwind CSS 3.4.17 - Utility-first CSS framework (dev dependency, powers NativeWind)
- tailwindcss-animate 1.0.7 - Animation plugin for Tailwind
- React Query v5 (`@tanstack/react-query@^5.90.10`) - Server state management and caching
- Jest 30.2.0 - Test runner
- jest-expo 54.0.16 - Expo-specific Jest preset
- React Native Testing Library 13.3.3 (`@testing-library/react-native`)
- jest-native 5.4.3 (`@testing-library/jest-native`) - Custom matchers
- Metro bundler (configured via `metro.config.js` with NativeWind integration)
- Babel (configured via `babel.config.js` with `babel-preset-expo` and `nativewind/babel`)
- ESLint 9.25.0 with Expo flat config + Prettier integration
- Prettier 3.6.2 with `prettier-plugin-tailwindcss` for class sorting
## Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~54.0.13 | Development platform and build system |
| `expo-router` | ~6.0.11 | File-based routing (entry point: `expo-router/entry`) |
| `react` | 19.1.0 | UI library |
| `react-native` | 0.81.4 | Cross-platform mobile runtime |
| `@tanstack/react-query` | ^5.90.10 | Server state, caching, data fetching |
| `axios` | ^1.13.2 | HTTP client for API requests |
| `nativewind` | ^4.2.1 | Tailwind CSS styling for React Native |
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
| Package | Version | Purpose |
|---------|---------|---------|
| `@react-navigation/native` | ^7.1.8 | Navigation core |
| `@react-navigation/bottom-tabs` | ^7.4.0 | Bottom tab navigator |
| `@react-navigation/elements` | ^2.6.3 | Navigation UI elements |
| `react-native-screens` | ~4.16.0 | Native screen containers |
| `react-native-safe-area-context` | ~5.6.0 | Safe area handling |
| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-reanimated` | ~4.1.1 | Animation library |
| `react-native-gesture-handler` | ~2.28.0 | Gesture system |
| `react-native-worklets` | 0.5.1 | Worklets for Reanimated |
| Package | Version | Purpose |
|---------|---------|---------|
| `class-variance-authority` | ^0.7.1 | Component variant management (shadcn pattern) |
| `clsx` | ^2.1.1 | Conditional className joining |
| `tailwind-merge` | ^3.3.1 | Tailwind class deduplication |
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
- NativeWind integration via `withNativeWind` wrapper
- Input CSS: `./global.css`
- `inlineRem: 16` for consistent rem-to-px conversion
- iOS/Android: Native builds via `expo run:ios` / `expo run:android`
- Web: Static output via Metro (`web.output: "static"` in `app.config.js`)
## Configuration
- Environment variables accessed via `expo-constants` at runtime
- Configuration in `src/config/env.ts` reads from `Constants.expoConfig.extra`
- Variables defined in `app.config.js` under `extra` block
- `.env` file present (not committed), `.env.example` present for reference
- Required: `EXPO_PUBLIC_DEFILLAMA_BASE_API_URL`
- Config: `tsconfig.json` extends `expo/tsconfig.base`
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Includes: `**/*.ts`, `**/*.tsx`, `.expo/types/**/*.ts`, `expo-env.d.ts`, `nativewind-env.d.ts`
- Config: `babel.config.js`
- Preset: `babel-preset-expo` with `jsxImportSource: "nativewind"`
- Additional preset: `nativewind/babel`
- Config: `eslint.config.js` (ESLint 9 flat config format)
- Extends: `eslint-config-expo/flat` + `eslint-plugin-prettier/recommended`
- Import resolver configured for TypeScript path aliases
- Jest globals configured for test files
- Config: `.prettierrc`
- Plugins: `prettier-plugin-tailwindcss` (class sorting)
- Config: `tailwind.config.js`
- Dark mode: `"class"` strategy
- Content: `src/app/`, `src/components/`, `src/screens/`
- Custom theme: HSL CSS variable-based color system (shadcn pattern)
- Brand color: `#00AD69` (green)
- Preset: `nativewind/preset`
- Config: `components.json` (shadcn-style)
- Style: New York
- Aliases: `@/components`, `@/components/core` (ui), `@/lib`, `@/hooks`
## Platform Requirements
- macOS (for iOS development)
- Bun 1.3+ (package manager)
- Node.js 24+ (tooling runtime)
- Xcode (iOS builds)
- Android Studio (Android builds)
- EAS project ID configured: `5a85ba39-4794-462c-91b7-1ddc9b59e1c9`
- iOS (supports tablet via `supportsTablet: true`)
- Android (edge-to-edge enabled)
- Web (Metro bundler, static output)
- iOS Bundle ID: `com.ambegossi.yieldly`
- Android Package: `com.ambegossi.yieldly`
- URL Scheme: `yieldly`
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- All files and directories use **kebab-case**: `pool-list-item.tsx`, `use-pool-find-all.ts`, `http-pool-repo.ts`
- Component files: `button.tsx`, `pool-card.tsx`, `home-header.tsx`
- Hook files: `use-pool-find-all.ts`, `use-app-query.ts`, `use-device-layout.ts`
- Entity/Interface files: `pool.ts`, `pool-repo.ts`, `repositories.ts`
- DTO files: `pool-dto.ts`
- Adapter files: `pool-adapter.ts`
- Test files: `use-pool-find-all.test.tsx`, `pool-adapter.test.ts`
- Test directories: `__tests__/` co-located with source
- Components: PascalCase (`export function PoolListItem()`)
- Hooks: camelCase with `use` prefix (`export function usePoolFindAll()`)
- Interfaces: PascalCase (`export interface Pool {}`)
- Classes: PascalCase (`export class HttpClient {}`)
- Functions: camelCase (`defiLlamaPoolDTOToPool`)
- Constants: camelCase or UPPER_SNAKE_CASE depending on context
## Code Style
- Prettier v3 with `prettier-plugin-tailwindcss` for Tailwind class sorting
- Config: `.prettierrc` - minimal config, relies on Prettier defaults (double quotes, trailing commas)
- ESLint v9 with flat config at `eslint.config.js`
- Extends: `eslint-config-expo/flat` + `eslint-plugin-prettier/recommended`
- Import resolver: `eslint-import-resolver-typescript` for `@/*` path alias
- Custom rule: `eol-last: off`
- Jest globals configured for test files
- Strict mode enabled in `tsconfig.json`
- TypeScript 5.9.2
- Extends `expo/tsconfig.base`
## Component Patterns
- Use **function declarations** with **named exports**: `export function Button() {}`
- Exception: memoized components use `export const X = React.memo(function X() {})` pattern
- Named exports for all components, hooks, and utilities
- Default exports ONLY for screen entry points consumed by expo-router
- Define props as a separate interface above the component: `interface PoolListItemProps { ... }`
- Name convention: `{ComponentName}Props`
- Core reusable components: `src/components/core/` (Button, Text, Badge, etc.)
- Shared composite components: `src/components/` (Header, BottomSheet, ScreenWrapper)
- Screen-specific components: `src/screens/{screen}/components/`
- Screen-specific hooks: `src/screens/{screen}/hooks/`
- Sibling JSX elements MUST be separated by a blank line
- Exception: files in `src/components/core/` (react-native-reusables primitives)
## Import Conventions
- `@/*` maps to `./src/*` (configured in `tsconfig.json`, mirrored in `jest.config.js`)
- Named imports preferred: `import { Pool } from "@/domain/pool/pool"`
- Type imports use inline `type` keyword: `import { type UseQueryOptions } from "@tanstack/react-query"`
## Styling Conventions
- Use `className` prop with Tailwind utility classes directly on components
- Use `cn()` utility from `src/lib/utils.ts` for conditional class merging
- Dark mode via `dark:` prefix: `dark:bg-brand/10`
- Responsive via breakpoints: `md:px-6 lg:px-8`
- Platform-specific via `Platform.select()` in component variants (see `src/components/core/text.tsx`)
- HSL CSS variables defined in `global.css`: `--primary`, `--secondary`, `--background`, `--foreground`, etc.
- Brand green uses Tailwind's `green-*` palette, NOT `--primary` (which is near-black)
- Custom `brand` color mapped in `tailwind.config.js`
## Hook Conventions
- Never use `useQuery` directly from React Query in domain/screen code
## Error Handling
- Suspense-based: screens use `useSuspenseQuery` with React Suspense boundaries for loading states
- Non-suspense: `useAppQuery` returns `{ data, isPending, error }` for manual handling
- Network errors bubble through React Query's error handling
## Git Conventions
- `fix:` for bug fixes
- `feat:` for new features
- `refactor:` for code restructuring
- `docs:` for documentation changes
- Scoped commits supported: `refactor(home): rename HomeHeader component`
## Dependency Injection
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Three-layer separation: Domain, Infrastructure, Presentation
- Domain layer defines interfaces; Infrastructure implements them
- React Context provides dependency injection for repositories
- React Query manages server state with Suspense integration
- Dual pagination strategy: infinite scroll (mobile) and numbered pages (tablet/desktop)
## Layers
### Domain Layer
- Purpose: Define pure business entities and repository interfaces. Contains no framework dependencies.
- Location: `src/domain/`
- Contains: Entity interfaces, repository interfaces, use-case hooks
- Depends on: Nothing (innermost layer)
- Used by: Infrastructure (implements interfaces), Presentation (consumes use cases)
- `src/domain/repositories.ts` - Central `Repositories` interface aggregating all repository contracts
- `src/domain/pool/pool.ts` - `Pool` entity interface
- `src/domain/pool/pool-repo.ts` - `PoolRepo` interface with `findAll(): Promise<Pool[]>`
- `src/domain/pool/use-cases/use-pool-find-all.ts` - Hook wrapping `useAppQuery` for pool fetching
- `src/domain/pool/use-cases/use-pool-find-all-suspense.ts` - Suspense variant using `useAppSuspenseQuery`
### Infrastructure Layer
- Purpose: Implement domain interfaces with concrete HTTP clients, adapters, and framework wrappers
- Location: `src/infra/`
- Contains: HTTP clients, repository implementations, DTO adapters, React Query wrappers
- Depends on: Domain interfaces, Axios, React Query
- Used by: Root layout (wires DI), Domain use-case hooks (via `useAppQuery`)
- `src/infra/http/http-client.ts` - `HttpClient` interface abstracting HTTP methods
- `src/infra/http/clients/defi-llama-http-client.ts` - Axios instance for DefiLlama API
- `src/infra/repositories/repository-provider.tsx` - `RepositoryContext`, `RepositoryProvider`, and `useRepository()` hook
- `src/infra/repositories/http-repository/index.ts` - `HttpRepositories` object wiring all concrete repos
- `src/infra/repositories/http-repository/pool/http-pool-repo.ts` - `HttpPoolRepo` class implementing `PoolRepo`
- `src/infra/repositories/http-repository/pool/pool-adapter.ts` - `defiLlamaPoolDTOToPool()` mapping function
- `src/infra/repositories/http-repository/pool/pool-dto.ts` - `DefiLlamaPoolDTO` and response DTO interfaces
- `src/infra/use-cases/use-app-query.ts` - Generic `useAppQuery<TData>` wrapper around React Query's `useQuery`
- `src/infra/use-cases/use-app-suspense-query.ts` - Generic `useAppSuspenseQuery<TData>` wrapper around `useSuspenseQuery`
### Presentation Layer
- Purpose: Render UI, handle user interaction, manage screen-level state
- Location: `src/app/` (routes), `src/screens/` (screen components), `src/components/` (shared components)
- Contains: Expo Router routes, screen components, shared UI components, screen-local hooks
- Depends on: Domain use cases, Infrastructure (via `useRepository()`), NativeWind, React Native
- Used by: End user
- `src/app/_layout.tsx` - Root layout: wires `QueryClientProvider`, `RepositoryProvider`, `GestureHandlerRootView`, `PortalHost`
- `src/app/index.tsx` - Home route: wraps `HomeScreen` in `ScreenWrapper`
- `src/screens/home/index.tsx` - Home screen: pool list with filters, dual pagination
- `src/components/screen-wrapper.tsx` - `ScreenWrapper`: combines `QueryErrorResetBoundary`, `ErrorBoundary`, and `Suspense`
- `src/components/header.tsx` - App-level header with logo
- `src/components/core/` - Core UI primitives (Button, Text, Loading, Badge, Icon, DropdownMenu)
## Data Flow
### Pool List (Primary Flow)
### Client-Side Filtering
### Dual Pagination
- Server state: React Query (cache, fetching, error states)
- UI state: React `useState` in screen-local hooks (filters, pagination page)
- No global client state store (no Redux, Zustand, etc.)
## Key Abstractions
| Abstraction | Purpose | Location |
|-------------|---------|----------|
| `Repositories` | Central interface for all repository contracts | `src/domain/repositories.ts` |
| `PoolRepo` | Contract for pool data access | `src/domain/pool/pool-repo.ts` |
| `Pool` | Domain entity representing a yield pool | `src/domain/pool/pool.ts` |
| `HttpClient` | Abstraction over HTTP methods (get, post, put, delete) | `src/infra/http/http-client.ts` |
| `useAppQuery` / `useAppSuspenseQuery` | Standardized React Query wrappers | `src/infra/use-cases/use-app-query.ts`, `src/infra/use-cases/use-app-suspense-query.ts` |
| `useRepository()` | Hook to access injected repositories from any component | `src/infra/repositories/repository-provider.tsx` |
| `ScreenWrapper` | Combines Suspense + ErrorBoundary + QueryErrorResetBoundary | `src/components/screen-wrapper.tsx` |
| `useDeviceLayout()` | Responsive breakpoint detection (mobile/tablet/desktop) | `src/hooks/use-device-layout.ts` |
| DTO Adapters | Map external API shapes to domain entities | `src/infra/repositories/http-repository/pool/pool-adapter.ts` |
## Dependency Injection
## Entry Points
- Location: `src/app/_layout.tsx`
- Triggers: Expo Router loads this as root layout
- Responsibilities: Initialize QueryClient, wire DI, configure navigation stack, provide global error boundary
- Location: `src/app/index.tsx`
- Triggers: Default route (`/`)
- Responsibilities: Wrap HomeScreen in ScreenWrapper for Suspense/Error handling
## Error Handling
- **Route-level:** `ErrorBoundary` export in `src/app/_layout.tsx` catches unhandled errors with retry button
- **Screen-level:** `ScreenWrapper` in `src/components/screen-wrapper.tsx` combines `QueryErrorResetBoundary` + class `ErrorBoundary` + `Suspense` for per-screen error recovery
- **Data fetching:** `useSuspenseQuery` throws errors to nearest ErrorBoundary; retry resets React Query cache and re-mounts
- **HTTP layer:** Axios errors propagate through React Query to ErrorBoundary
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
