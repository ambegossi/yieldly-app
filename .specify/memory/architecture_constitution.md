# Yieldly Architecture Constitution

This file defines enforceable architectural standards for the Yieldly mobile app. It is the source of truth for layer boundaries, contracts, data access, and what counts as a blocking violation. Governance, testing, styling, and commit conventions live in `.specify/memory/constitution.md`; security concerns live in `.specify/memory/security_constitution.md`. Avoid duplicating rules across files — if it lives here, reference it from there.

## 1. Architecture Style

Yieldly is a **single-app, layered Clean Architecture** mobile client built on Expo SDK 54 and React Native 0.81.4. It is **not** a modular monolith with hard feature-module isolation; folders under `src/domain/` and `src/screens/` are organizational, not bounded contexts.

- **App type:** Cross-platform mobile client (iOS, Android, web). Read-only consumer of the public DefiLlama API. No backend in this repo; no authenticated user model today.
- **Layers:** Three, with strict dependency direction.
- **Style flavor:** Clean Architecture vocabulary (Entity, Repository, Use Case) applied to a React Native + React Query codebase.

## 2. Layer Boundaries

The three layers and their allowed dependencies:

| Layer              | Location                                                                | May depend on                                                                                           | Must NOT depend on                                                                                        |
| ------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Domain**         | `src/domain/`                                                           | Nothing inside `src/` (only standard TypeScript + abstract React Query types via the wrapper interface) | `src/infra/**`, `src/app/**`, `src/screens/**`, `src/components/**`, Axios, React Native, Expo modules    |
| **Infrastructure** | `src/infra/`                                                            | `src/domain/` interfaces, Axios, React Query, environment config                                        | `src/app/**`, `src/screens/**`, `src/components/**`                                                       |
| **Presentation**   | `src/app/`, `src/screens/`, `src/components/`, `src/hooks/`, `src/lib/` | `src/domain/` (entities, repo interfaces, use-case hooks), shared `src/lib/` and `src/components/core/` | Concrete classes from `src/infra/` (e.g., `HttpPoolRepo`, raw Axios clients), DTO types from `src/infra/` |

**Dependency direction:** `presentation → domain ← infrastructure`. The domain is the innermost ring and has zero framework imports.

**Routes vs screens (hard rule):**

- `src/app/**/*.tsx` files are **routing only**. A route file is a thin wrapper: it imports a screen from `src/screens/[feature]/` and renders it inside `ScreenWrapper`. Route files are the only place a `default export` is allowed in the presentation layer alongside screen `index.tsx` files.
- `src/screens/[feature]/index.tsx` is the **screen body**. It holds composition, screen-local state, and use-case wiring. Screens own their `components/` and `hooks/` folders.
- Trivial redirect-only routes are still expected to wrap their body in `ScreenWrapper` if they fetch anything at all.

## 3. Business Logic Placement

- Business logic lives in **domain use-case hooks** under `src/domain/[feature]/use-cases/` (e.g., `use-pool-find-all.ts`, `use-pool-find-apy-history.ts`). Use cases are pure orchestration of repository calls and React Query wrappers — no React Native, no fetch logic, no view code.
- Screens are **composition + interaction**. They render data, manage local UI state (filters, pagination, selection), and trigger use-case hooks. Screens do not contain reusable business rules.
- Components are **presentational**. They receive props, render JSX, and may use shared hooks (`useDeviceLayout`, etc.) but never call repositories directly.
- Pure helpers (date formatting, number formatting, filter math) live in `src/lib/` or screen-local `hooks/` if scoped to one screen. Helpers must not import from `src/infra/`.

## 4. Contracts & Validation

External API shapes never reach the domain or presentation untransformed. Every external source has three artifacts:

1. **DTO interface** — `src/infra/repositories/http-repository/[feature]/[feature]-dto.ts`. Mirrors the wire shape exactly.
2. **Adapter function** — `[feature]-adapter.ts`. Maps DTO → domain entity (e.g., `defiLlamaPoolDTOToPool`). Adapters are pure and unit-tested.
3. **Repository implementation** — `http-[feature]-repo.ts`. Calls the HTTP client, runs the adapter, returns domain entities.

**Validation strategy:** TypeScript types at compile time + DTO adapter at runtime. **Runtime schema validation (Zod, valibot, etc.) is not required** — silent API drift is an accepted risk. If a future external source proves unreliable, introduce schema validation at its adapter boundary only; do not retrofit project-wide.

**DTO ownership (P0):** DTO types are infrastructure-only. They MUST NOT be imported from `src/domain/` or `src/screens/`/`src/app/`/`src/components/`. Domain entities are the only types that cross the infra→domain seam.

**Suspense + ErrorBoundary contract:** Every screen renders its body inside `ScreenWrapper` (`src/components/screen-wrapper.tsx`), which composes `QueryErrorResetBoundary` + `ErrorBoundary` + `Suspense`. Screens fetch data via `useAppSuspenseQuery`; non-screen contexts (e.g., headers, popovers) use `useAppQuery` and handle states manually.

## 5. Data Access Rules

- All data access goes through a **repository interface** defined in `src/domain/[feature]/[feature]-repo.ts`. Repository interfaces describe _what_ (`findAll(): Promise<Pool[]>`), never _how_.
- Concrete repositories live in `src/infra/repositories/http-repository/[feature]/`. They are wired once into `HttpRepositories` and provided via `RepositoryProvider` in `src/app/_layout.tsx`.
- Presentation accesses repositories **only via `useRepository()`**. Direct imports of concrete repository classes from presentation are P0 violations.
- React Query usage is mediated through `useAppQuery` / `useAppSuspenseQuery` in `src/infra/use-cases/`. Direct calls to `useQuery`, `useSuspenseQuery`, or `useInfiniteQuery` from domain or presentation code are P0 violations.
- Per-query stale time, cache time, and key shape are decided inside the **domain use-case hook** (e.g., 5-minute stale for APY history). React Query primitives stay inside the wrappers; tuning surfaces through the wrappers' options.
- The HTTP client is abstracted via the `HttpClient` interface (`src/infra/http/http-client.ts`). Concrete clients (e.g., `defi-llama-http-client.ts`) configure Axios in one place; repositories depend on the interface, not Axios directly.

## 6. Async & Integration Rules

- All asynchronous data flows through React Query via the `useAppQuery` / `useAppSuspenseQuery` wrappers. There is no background worker, no message queue, and no offline-first persistence layer in scope today.
- No business operation runs on the JS thread in a way that blocks rendering. Long-running work (chart computations, heavy filtering) belongs in `useMemo` or behind interaction (`onPress` handlers), not in render bodies.
- External link handling goes through `expo-web-browser` — never `Linking.openURL` for arbitrary URLs. See the security constitution for trust rules on external URLs and deep links.
- Adding a new external API requires a new HTTP client (or reuse of an existing one), a DTO, an adapter, and a repository implementation. Skipping the DTO/adapter and returning raw HTTP responses to the domain is a P0 violation.

## 7. Module Boundaries

Feature folders (`src/domain/pool/`, future `src/domain/<feature>/`) are **organizational, not enforced boundaries**. Cross-feature imports inside the domain are allowed and unrestricted.

The same holds for `src/screens/`: screens may share components and hooks freely. If a piece of UI or logic is reused across two screens, lift it to `src/components/` or `src/hooks/` rather than importing across screen folders.

If feature isolation ever becomes necessary (multiple teams, divergent domains, lifecycle splits), promote it through the evolution policy in §10 — do not introduce ad-hoc `index.ts` barrels or import-restriction lint rules without an explicit amendment to this file.

## 8. Framework-Specific Architecture Rules (Expo / React Native)

- **Expo Router**: Routes live exclusively in `src/app/`. File-based routing conventions (group folders, dynamic segments) are the only routing mechanism. No imperative navigators outside the router.
- **React Compiler** (experimental, enabled): Code MUST be compatible with React Compiler. Do not pre-memoize with `useMemo`/`useCallback` defensively; rely on the compiler. Memoize only when a profiled regression demonstrates need.
- **New Architecture** (enabled): Native modules and third-party libraries must be Fabric/TurboModule compatible. When choosing a library, prefer one with new-arch support; otherwise document the constraint at the import site.
- **NativeWind v4**: Styling is the only allowed mechanism for visual design. No `StyleSheet.create` and no inline `style={}` for visual properties — `style` is reserved for animated values (Reanimated) and `Platform.select` variants inside core components.
- **FlashList v2**: `@shopify/flash-list` v2 does not accept `estimatedItemSize`; do not add it back. Lists at scale (>50 items) use FlashList, not FlatList.
- **`@gorhom/bottom-sheet`** is the canonical bottom sheet on native. `FilterDropdown` and similar overlays are **web-only**; mobile uses the bottom sheet pattern.
- **Components & hooks**: Function declarations with named exports (`export function X() {}`). Default exports allowed only on route files (`src/app/**/*.tsx`) and screen index files (`src/screens/[feature]/index.tsx`).
- **Props**: Defined as a separate interface above the component, named `{ComponentName}Props`.
- **JSX**: Sibling JSX elements separated by a blank line. Exception: `src/components/core/` (react-native-reusables primitives).
- **Type-only imports** use inline syntax: `import { type Pool } from "@/domain/pool/pool"`.

## 9. Blocking Architecture Violations (P0)

A P0 violation blocks merge. The current set:

1. **Domain depends on infra or presentation.** Any import in `src/domain/**` that resolves to `src/infra/**`, `src/app/**`, `src/screens/**`, or `src/components/**` (other than `src/components/core/` _types_ used only as TS types).
2. **Direct React Query primitives outside the wrappers.** Any call to `useQuery`, `useSuspenseQuery`, `useInfiniteQuery`, or `useMutation` from `src/domain/` or presentation that does not flow through `src/infra/use-cases/use-app-query.ts` / `use-app-suspense-query.ts`.
3. **Presentation imports a concrete repository.** A screen, component, or route imports a class from `src/infra/repositories/http-repository/**` instead of accessing it via `useRepository()`.
4. **DTO leakage.** A type defined in `src/infra/repositories/http-repository/**/*-dto.ts` is imported from `src/domain/**`, `src/app/**`, `src/screens/**`, or `src/components/**`.
5. **Screen without `ScreenWrapper`.** A screen that fetches data renders its body outside `ScreenWrapper`, or a screen bypasses `useAppSuspenseQuery` while still relying on suspense semantics.
6. **Default export outside allowed paths.** A `default export` exists somewhere other than `src/app/**/*.tsx` route files or `src/screens/[feature]/index.tsx` screen entries.

P0 violations are caught in code review and, where mechanically detectable, by `bun run lint` / `bun run types`. Mechanical detection coverage is best-effort; reviewer judgment is authoritative.

## 10. Architecture Evolution Policy

Architecture rules evolve through **in-repo proposals**, not silent drift.

- **Proposing a change:** Open a commit (or PR) that updates this file. The change MUST include:
  - The rule being added, removed, or modified, with diff-level precision.
  - A **Why** paragraph: the concrete pain, opportunity, or constraint that motivated the change.
  - A **Migration** note: what existing code is now out of compliance, and the rough plan to bring it back (or an explicit grandfathering decision).
  - A version bump per the rules in §11.
- **Review:** Treated like a code change. At least one human reviewer (or solo author's deliberate "next-day reread" if there is no other reviewer) sign-off before merge.
- **No silent precedent.** A new pattern landing in code does NOT implicitly amend this file. If the new pattern conflicts with the constitution, either the code or the constitution must change before the next commit on top.
- **Refactor backlog:** When a violation is discovered after the fact, prefer fixing the code over rewriting the rule. Rewrite the rule only when the rule itself is wrong, not when it is inconvenient.

## 11. Refactor & Drift Handling

- **Versioning:** This file follows semantic versioning. **MAJOR** for principle removals or reversals (e.g., dropping the layered architecture). **MINOR** for new principles or expansions (e.g., adding a new P0). **PATCH** for clarifications, examples, or rewording that does not change the rule.
- **Drift detection:** Architecture Guard skill (`speckit-architecture-guard-violation-detection`) is the primary mechanism. Periodic manual review is encouraged when adding a major feature.
- **Refactor tasks:** Non-blocking drift (P1) is filed via `speckit-architecture-guard-refactor-generator` and tracked as ordinary tasks. P0 drift blocks merge and is addressed in the same change.
- **Grandfathering:** When a P0 rule is newly introduced, existing violations are listed in this file as exceptions with a target removal date. No new exceptions may be added without an amendment.

**Current grandfathered exceptions:** None.

**Version**: 1.0.0 | **Ratified**: 2026-05-20 | **Last Amended**: 2026-05-20
