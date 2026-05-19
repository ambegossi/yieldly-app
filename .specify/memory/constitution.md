# Yieldly Constitution

Yieldly is a cross-platform React Native app (iOS, Android, Web) built on Expo SDK 54 that aggregates DeFi yield farming opportunities across chains. Users browse pools and drill into pool details to evaluate APY performance over time.

This constitution encodes the non-negotiable rules that govern how features are designed, implemented, tested, and shipped. It is derived from existing project conventions (see `CLAUDE.md` for runtime development guidance and the full technology reference).

## Core Principles

### I. Clean Architecture Layering (NON-NEGOTIABLE)

The codebase is organized into three layers with strict directional dependencies:

- **Domain** (`src/domain/`) — Pure business entities, repository interfaces, and use-case hooks. Contains **zero framework dependencies** (no React Native, no Axios, no React Query types beyond the wrapper boundary).
- **Infrastructure** (`src/infra/`) — Concrete implementations: HTTP clients, repository implementations, DTO adapters, and React Query wrappers (`useAppQuery`, `useAppSuspenseQuery`).
- **Presentation** (`src/app/` routes + `src/screens/` + `src/components/`) — UI, screen-level state, user interaction. Consumes domain use cases via the `useRepository()` hook.

Dependency direction: **presentation → domain ← infrastructure**. The domain layer never imports from `src/infra/` or `src/app/`. New features add an entity + repo interface in `src/domain/[feature]/`, an implementation in `src/infra/repositories/http-repository/[feature]/`, and screens/components in `src/screens/[feature]/`.

### II. File and Identifier Naming

- **Files and directories**: `kebab-case` mandatory (`pool-list-item.tsx`, `use-pool-find-all.ts`, `http-pool-repo.ts`). Test directories are `__tests__/`.
- **Code identifiers**: Components and classes/interfaces are `PascalCase`; hooks and functions are `camelCase`; hooks always begin with `use`.
- **Rationale**: Consistent kebab-case file naming improves cross-platform compatibility, reduces case-sensitivity issues in version control, and creates visual distinction between file names and code exports.

### III. Components and Hooks: Function Declarations with Named Exports

- Components and hooks use **function declarations with named exports**: `export function Button() {}`, `export function usePoolFindAll() {}`.
- Memoized components use `export const X = React.memo(function X() {})`.
- **Default exports are forbidden** except at screen entry points consumed by Expo Router. The codebase uses a two-level pattern: thin route files in `src/app/**/*.tsx` (default export of a route component that wraps the screen in `ScreenWrapper`) and the screen itself in `src/screens/[feature]/index.tsx` (default export so the route can `import HomeScreen from "@/screens/home"`). Both are allowed; everywhere else, named exports only.
- Props are defined as a separate interface above the component: `interface PoolListItemProps { ... }`.
- Sibling JSX elements MUST be separated by a blank line. Exception: files in `src/components/core/` (react-native-reusables primitives).

### IV. Data Fetching Discipline (NON-NEGOTIABLE)

- **Never** use React Query hooks (`useQuery`, `useSuspenseQuery`, `useInfiniteQuery`) directly in domain or screen code. Always go through `useAppQuery` or `useAppSuspenseQuery` from `src/infra/use-cases/`.
- Screens render data fetched via Suspense and are wrapped in `ScreenWrapper`, which combines `QueryErrorResetBoundary`, an `ErrorBoundary`, and `Suspense`.
- Repositories are accessed via `useRepository()`; concrete implementations are wired once in `src/app/_layout.tsx` through `RepositoryProvider`.

### V. Test Co-location and Tooling

- Tests live in `__tests__/` directories co-located with source code, following `src/[layer]/[feature]/__tests__/[filename].test.{ts,tsx}`.
- Test runner is **Jest via `bun run test`** (NOT `bun test`, which invokes Bun's own runner and breaks the Jest preset). Use `bun run test:watch` and `bun run test:coverage` for watch/coverage modes.
- Hook tests using React Query MUST: create a fresh `QueryClient` (with `retry: false`, `gcTime: 0`, `staleTime: 0`) per test, wrap with `QueryClientProvider` and `RepositoryProvider`, use `waitFor` for async assertions, and call `unmount()` at the end of every test to prevent `act()` warnings.
- FlashList and `expo-image` must be mocked in component/integration tests (see existing `__tests__/` for the working pattern).

### VI. Styling: NativeWind with the Tailwind Theme

- Style with NativeWind utility classes via the `className` prop; merge conditional classes with `cn()` from `src/lib/utils.ts`.
- Dark mode uses the `dark:` prefix; responsive layout uses Tailwind breakpoints; platform-specific styling uses `Platform.select()` inside component variants.
- **The `--primary` CSS variable is near-black (HSL `0 0% 9%`), NOT brand green.** Brand green (`#00AD69`) is mapped to Tailwind's `green-*` palette and the custom `brand` color. Reach for `green-*` / `brand`, not `primary`, for APY and brand-positive visuals.

### VII. Conventional Commits and Branching

- Commit messages follow **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `style:`, `test:`. Scoped form is allowed and preferred for feature work: `feat(favorites): add pin toggle`.
- All branches use one of three prefixes paired with a kebab-case slug: **`feat/<slug>`** for features, **`fix/<slug>`** for bug fixes, **`chore/<slug>`** for refactors / dependency bumps / tooling / docs-only changes. Examples: `feat/favorites`, `fix/deep-link-fallback`, `chore/upgrade-expo-55`.
- The numbered form (`002-pool-details`) is reserved for **spec-kit artifact directories under `specs/`** (where it provides natural ordering and matches `/speckit-specify` defaults). It is **not** a branch naming convention — a spec-kit feature whose artifacts live at `specs/002-pool-details/` is still developed on `feat/pool-details`.

## Technology Constraints

- **Runtime**: Expo SDK 54, React Native 0.81.4 (new architecture enabled), React 19.1.0 with React Compiler (experimental).
- **Routing**: Expo Router v6 file-based routing with typed routes; routes live in `src/app/`.
- **Styling**: NativeWind v4 + Tailwind 3.4; theme tokens in `global.css` and `tailwind.config.js`.
- **Data**: React Query v5 for server state; Axios HTTP client; no global client-state library (no Redux/Zustand).
- **Lists**: `@shopify/flash-list` v2 — does **not** accept `estimatedItemSize` (auto-measures).
- **Bottom sheets**: `@gorhom/bottom-sheet` (NOT `@gorhom/react-native-bottom-sheet`).
- **Package manager**: Bun (`bun.lock` is the source of truth). Node 24+ for tooling.
- **TypeScript**: 5.9.2 strict mode; path alias `@/*` → `./src/*`. Type-only imports use inline `import { type X }` syntax.

## Quality Gates

Before merging any change, the following MUST pass locally and in any future CI:

| Gate                     | Command         |
| ------------------------ | --------------- |
| Lint                     | `bun run lint`  |
| Type check               | `bun run types` |
| Unit + integration tests | `bun run test`  |

Additional expectations:

- New features that add a repository method also add tests for the adapter (DTO → domain mapping) and the repository implementation.
- New hooks that fetch data also add a hook test covering success, loading, and error states.
- Screens or visible UI changes are verified against the iOS Simulator (`mcp__ios-simulator__*`) or `agent-browser` (for web) before being declared complete.
- Direct repo edits outside a GSD workflow are not permitted unless the user explicitly bypasses it (see `CLAUDE.md` → GSD Workflow Enforcement).

## Governance

- This constitution supersedes ad-hoc conventions. When `CLAUDE.md` and this file disagree on a rule, this file wins; `CLAUDE.md` should then be updated to match.
- Amendments require: (a) updating this file, (b) bumping the version below per semver (MAJOR for principle changes, MINOR for new principles, PATCH for wording/clarification), (c) updating the Last Amended date.
- Spec-kit artifacts (`.specify/templates/`, generated specs and plans) must remain consistent with these principles. The `/speckit-brownfield-validate` command verifies that.
- Complexity that violates these principles requires explicit justification in the `Complexity Tracking` section of the relevant plan.

**Version**: 1.1.0 | **Ratified**: 2026-05-18 | **Last Amended**: 2026-05-18
