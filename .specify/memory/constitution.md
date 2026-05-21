# Yieldly Constitution

Yieldly is a cross-platform React Native app (iOS, Android, web) built on Expo SDK 54 that aggregates DeFi yield farming opportunities across chains. Users browse pools and drill into pool details to evaluate APY performance over time.

This constitution encodes the **engineering governance** rules: how we work, name things, test, style, and commit. **Architectural rules** (layer boundaries, data-access patterns, P0 violations, framework-specific patterns) live in `.specify/memory/architecture_constitution.md`. **Security rules** (secrets, deep links, build/signing, supply chain) live in `.specify/memory/security_constitution.md`. Runtime development guidance (commands, MCP tools, repo conventions) lives in `CLAUDE.md`.

When two files disagree on a rule, this resolution order applies: architecture → security → governance → CLAUDE.md. Architecture and security files are authoritative within their scope; this file defers to them and avoids duplicating their content.

## Core Principles

### I. Architecture Discipline (NON-NEGOTIABLE)

The codebase follows a layered Clean Architecture (Domain ← Infra → Presentation) with a strict dependency direction and a defined set of P0 violations (domain importing infra, direct React Query primitives, presentation importing concrete repositories, DTO leakage, screens without `ScreenWrapper`, default exports outside route/screen entry files).

The complete set of layer boundaries, data-access rules, contract rules, framework-specific patterns, P0 violation list, and architecture evolution policy is defined in `.specify/memory/architecture_constitution.md`. That file is authoritative; this principle exists to make architecture compliance an explicit governance gate.

### II. File and Identifier Naming

- **Files and directories**: `kebab-case` mandatory (`pool-list-item.tsx`, `use-pool-find-all.ts`, `http-pool-repo.ts`). Test directories are `__tests__/`.
- **Code identifiers**: Components and classes/interfaces are `PascalCase`; hooks and functions are `camelCase`; hooks always begin with `use`.
- **Rationale**: Consistent kebab-case file naming improves cross-platform compatibility, reduces case-sensitivity issues in version control, and creates visual distinction between file names and code exports.

### III. Test Co-location and Tooling

- Tests live in `__tests__/` directories co-located with source code, following `src/[layer]/[feature]/__tests__/[filename].test.{ts,tsx}`.
- Test runner is **Jest via `bun run test`** (NOT `bun test`, which invokes Bun's own runner and breaks the Jest preset). Use `bun run test:watch` and `bun run test:coverage` for watch/coverage modes.
- Hook tests using React Query MUST: create a fresh `QueryClient` (with `retry: false`, `gcTime: 0`, `staleTime: 0`) per test, wrap with `QueryClientProvider` and `RepositoryProvider`, use `waitFor` for async assertions, and call `unmount()` at the end of every test to prevent `act()` warnings.
- FlashList and `expo-image` must be mocked in component/integration tests (see existing `__tests__/` for the working pattern).
- New features that add a repository method also add tests for the adapter (DTO → domain mapping) and the repository implementation. New hooks that fetch data also add a hook test covering success, loading, and error states.

### IV. Styling Conventions

- Style with NativeWind utility classes via the `className` prop; merge conditional classes with `cn()` from `src/lib/utils.ts`.
- Dark mode uses the `dark:` prefix; responsive layout uses Tailwind breakpoints; platform-specific styling uses `Platform.select()` inside component variants.
- **The `--primary` CSS variable is near-black (HSL `0 0% 9%`), NOT brand green.** Brand green (`#00AD69`) is mapped to Tailwind's `green-*` palette and the custom `brand` color. Reach for `green-*` / `brand`, not `primary`, for APY and brand-positive visuals.
- The architectural rule that NativeWind is the _only_ visual styling mechanism (no `StyleSheet.create`, no inline `style` for visual properties) is enforced by `.specify/memory/architecture_constitution.md` §8.

### V. Conventional Commits and Branching

- Commit messages follow **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `style:`, `test:`. Scoped form is allowed and preferred for feature work: `feat(favorites): add pin toggle`.
- **Non-spec-kit work** uses one of three prefixes paired with a kebab-case slug: **`feat/<slug>`** for features, **`fix/<slug>`** for bug fixes, **`chore/<slug>`** for refactors / dependency bumps / tooling / docs-only changes. Examples: `feat/favorites`, `fix/deep-link-fallback`, `chore/upgrade-expo-55`.
- **Spec-kit features** (anything created via `/speckit-specify` or related commands) use spec-kit's native **`<NNN>-<slug>`** form for **both the branch and the spec directory**, kept identical. Examples: branch `003-pool-details` paired with `specs/003-pool-details/`. This matches `/speckit-specify`'s defaults — no script customization required.
- Rationale for the split: spec-kit's tooling, hooks, and templates all assume the `<NNN>-<slug>` shape. Patching it locally created enough surface area to fall out of sync on upgrades, so we let spec-kit own its own convention end-to-end. Day-to-day non-spec-kit branches keep the human-friendly type prefix.

## Technology Constraints

- **Runtime**: Expo SDK 54, React Native 0.81.4 (new architecture enabled), React 19.1.0 with React Compiler (experimental).
- **Routing**: Expo Router v6 file-based routing with typed routes; routes live in `src/app/`.
- **Styling**: NativeWind v4 + Tailwind 3.4; theme tokens in `global.css` and `tailwind.config.js`.
- **Data**: React Query v5 for server state; Axios HTTP client; no global client-state library (no Redux/Zustand).
- **Lists**: `@shopify/flash-list` v2 — does **not** accept `estimatedItemSize` (auto-measures).
- **Bottom sheets**: `@gorhom/bottom-sheet` (NOT `@gorhom/react-native-bottom-sheet`).
- **Package manager**: Bun (`bun.lock` is the source of truth). Node 24+ for tooling.
- **TypeScript**: 5.9.2 strict mode; path alias `@/*` → `./src/*`. Type-only imports use inline `import { type X }` syntax.

Architectural implications of these choices (e.g., React Compiler compatibility, FlashList vs FlatList thresholds, the `useAppQuery` wrapper requirement) are codified in `.specify/memory/architecture_constitution.md`.

## Quality Gates

Before merging any change, the following MUST pass locally and in any future CI:

| Gate                     | Command         |
| ------------------------ | --------------- |
| Lint                     | `bun run lint`  |
| Type check               | `bun run types` |
| Unit + integration tests | `bun run test`  |

Additional expectations:

- Screens or visible UI changes are verified against the iOS Simulator (`mcp__ios-simulator__*`) or `agent-browser` (for web) before being declared complete.
- Direct repo edits outside a GSD workflow are not permitted unless the user explicitly bypasses it (see `CLAUDE.md` → GSD Workflow Enforcement).
- P0 architecture violations (per `.specify/memory/architecture_constitution.md` §9) block merge regardless of whether mechanical lint/type tooling catches them.

## Governance

- This constitution supersedes ad-hoc conventions. When `CLAUDE.md` and this file disagree on a rule, this file wins; `CLAUDE.md` should then be updated to match. Within their scope, `architecture_constitution.md` and `security_constitution.md` win over this file.
- Amendments require: (a) updating the relevant file, (b) bumping that file's version below per semver (MAJOR for principle removals or reversals, MINOR for new principles or structural additions, PATCH for wording/clarification), (c) updating its Last Amended date. The proposal rules in `architecture_constitution.md` §10 apply to amendments of any of the three constitution files.
- Spec-kit artifacts (`.specify/templates/`, generated specs and plans) must remain consistent with these principles. The `/speckit-brownfield-validate` command verifies that.
- Complexity that violates these principles requires explicit justification in the `Complexity Tracking` section of the relevant plan.

**Version**: 1.3.0 | **Ratified**: 2026-05-18 | **Last Amended**: 2026-05-20
