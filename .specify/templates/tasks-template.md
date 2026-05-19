---
description: "Task list template for feature implementation (Yieldly Clean Architecture)"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL — only include them if explicitly requested in the feature specification. When included, they follow the Yieldly testing conventions (co-located `__tests__/`, Jest via `bun run test`).

**Organization**: Tasks are grouped first by **Clean Architecture layer** (Yieldly's Constitution Principle I: Domain → Infrastructure → Presentation), then by user story within the Presentation layer when the feature contains multiple user-facing flows.

## Format: `[ID] [P?] [Layer/Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Layer]**: `D` = Domain, `I` = Infrastructure, `P` = Presentation
- **[Story]**: For Presentation tasks, which user story this serves (e.g., US1, US2)
- Include exact file paths from the feature's `plan.md` `Project Structure` section

## Path Conventions (Yieldly)

- **Domain**: `src/domain/[feature]/` (entity, repo interface, use-case hooks, co-located `__tests__/`)
- **Infrastructure**: `src/infra/repositories/http-repository/[feature]/` (DTO, adapter, repo implementation, co-located `__tests__/`)
- **Presentation**: `src/app/[route].tsx` (route), `src/screens/[feature]/` (screen + components + screen-local hooks)
- **Shared**: `src/components/` (composite), `src/components/core/` (primitives), `src/hooks/`, `src/lib/`
- All filenames are **kebab-case** (Constitution Principle II)

## Commands (Yieldly)

- Run tests: `bun run test` (NOT `bun test` — that invokes Bun's own runner and breaks the Jest preset)
- Watch tests: `bun run test:watch`
- Coverage: `bun run test:coverage`
- Lint: `bun run lint`
- Type check: `bun run types`
- iOS dev: `bun run ios` · Android: `bun run android` · Web: `bun run web`

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md (especially the Layer Impact section)
  - Entities from data-model.md
  - Endpoints/contracts from contracts/

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup

**Purpose**: One-time prep work that does not yet touch any architecture layer

- [ ] T001 [P] Add or update any new dependencies in `package.json` (e.g. new icon set, chart library) and run `bun install`
- [ ] T002 [P] If a new env var is needed, add it to `app.config.js` under `extra` and document in `.env.example`; expose it via `src/config/env.ts`
- [ ] T003 Verify baseline `bun run lint && bun run types && bun run test` passes on the feature branch before making changes

---

## Phase 2: Domain Layer

**Purpose**: Define the pure business contract — entities, repository interface, and use-case hooks. **No framework imports.**

**⚠️ Constitution Principle I**: Domain MUST NOT import from `src/infra/` or `src/app/`.

- [ ] T010 [D] Create entity interface in `src/domain/[feature]/[feature].ts` (PascalCase type, kebab-case file)
- [ ] T011 [D] Create repository interface in `src/domain/[feature]/[feature]-repo.ts` (e.g. `findAll`, `findById`, `findApyHistory`)
- [ ] T012 [D] Extend the `Repositories` aggregate interface in `src/domain/repositories.ts` to include the new repo
- [ ] T013 [P] [D] Create use-case hook in `src/domain/[feature]/use-cases/use-[feature]-find-all.ts` wrapping `useAppQuery`
- [ ] T014 [P] [D] Create suspense use-case hook in `src/domain/[feature]/use-cases/use-[feature]-find-all-suspense.ts` wrapping `useAppSuspenseQuery`
- [ ] T015 [P] [D] (Tests, if requested) Add hook tests in `src/domain/[feature]/use-cases/__tests__/use-[feature]-find-all.test.tsx` and `…-suspense.test.tsx` (cover success, loading, error; always `unmount()` at end)

**Checkpoint**: Domain interfaces compile; `bun run types` passes. No infra implementation exists yet — that's intentional.

---

## Phase 3: Infrastructure Layer

**Purpose**: Implement the domain interface with concrete HTTP + DTO + adapter code, and wire it into the DI container.

- [ ] T020 [I] Define external API DTO in `src/infra/repositories/http-repository/[feature]/[feature]-dto.ts` (matches the API response shape, NOT the domain shape)
- [ ] T021 [I] Implement adapter in `src/infra/repositories/http-repository/[feature]/[feature]-adapter.ts` — pure function `[source]DTOto[Feature](dto): [Feature]`
- [ ] T022 [I] Implement repository class in `src/infra/repositories/http-repository/[feature]/http-[feature]-repo.ts` using the existing `HttpClient` abstraction
- [ ] T023 [I] If a new data source is needed, add a client in `src/infra/http/clients/[source]-http-client.ts` (otherwise reuse `defi-llama-http-client.ts`)
- [ ] T024 [I] Wire the concrete repo into `src/infra/repositories/http-repository/index.ts` (`HttpRepositories` object)
- [ ] T025 [P] [I] (Tests, if requested) Add adapter tests in `src/infra/repositories/http-repository/[feature]/__tests__/[feature]-adapter.test.ts` covering happy path + edge cases (nulls, malformed values)
- [ ] T026 [P] [I] (Tests, if requested) Add repo tests in `src/infra/repositories/http-repository/[feature]/__tests__/http-[feature]-repo.test.ts` mocking the HttpClient

**Checkpoint**: `bun run test` passes for new adapter/repo tests; `bun run types` is green. The domain hook now resolves real data when used.

---

## Phase 4: Presentation Layer

**Purpose**: Build the route, screen, components, and screen-local hooks that the user actually sees.

**⚠️ Constitution reminders**:

- Function declarations with named exports everywhere EXCEPT route files (`src/app/`) and screen entry points (`src/screens/[feature]/index.tsx`), which use default exports.
- Sibling JSX elements separated by a blank line (except inside `src/components/core/`).
- Style with NativeWind utility classes; use `cn()` for conditional merging; brand green is `green-*` / `brand`, NOT `--primary`.
- Screens MUST be wrapped in `<ScreenWrapper>` in the route file (Suspense + ErrorBoundary).

### Phase 4a: User Story 1 — [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

- [ ] T030 [P1] Create screen entry in `src/screens/[feature]/index.tsx` (default export; consumes domain use-case via `useRepository()` + suspense hook)
- [ ] T031 [P1] Create the route file in `src/app/[route].tsx` (default export; wraps the screen in `<ScreenWrapper>`)
- [ ] T032 [P] [P1] Create screen-local components in `src/screens/[feature]/components/[component-name].tsx` (named exports, function declarations, `{ComponentName}Props` interface)
- [ ] T033 [P] [P1] Create screen-local hooks in `src/screens/[feature]/hooks/use-[behavior].ts` if needed (filters, pagination, etc.)
- [ ] T034 [P1] Wire navigation params via `useLocalSearchParams<{...}>()` if the route accepts parameters
- [ ] T035 [P] [P1] (Tests, if requested) Add component tests in `src/screens/[feature]/components/__tests__/[component-name].test.tsx` (mock FlashList → FlatList, mock `expo-image` and `@gorhom/bottom-sheet` per existing patterns)
- [ ] T036 [P] [P1] (Tests, if requested) Add integration test in `src/screens/[feature]/__tests__/[feature].integration.test.tsx` covering the happy-path render

**Checkpoint**: Route loads, screen renders real data, Suspense fallback shows during initial fetch, ErrorBoundary recovers from forced errors.

### Phase 4b: User Story 2 — [Title] (Priority: P2)

[Repeat the pattern above for P2 / P3 user stories — only add tasks for stories actually listed in spec.md]

---

## Phase 5: Polish & Cross-Cutting

**Purpose**: Quality work that spans the whole feature

- [ ] T090 [P] Update `CLAUDE.md` "Recent Changes" section if the feature introduces a new convention worth pinning
- [ ] T091 [P] Verify visual output on iOS Simulator via `mcp__ios-simulator__screenshot` and / or `agent-browser` for web
- [ ] T092 Run `bun run lint && bun run types && bun run test` — all must pass before merge
- [ ] T093 Run `bun run test:coverage` and confirm new domain/infra code is covered
- [ ] T094 [P] Manual QA: dark mode, tablet/desktop breakpoint (≥768dp), error retry path, empty state

---

## Dependencies & Execution Order

### Layer Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Domain (Phase 2)**: Depends on Setup
- **Infrastructure (Phase 3)**: Depends on Domain (interfaces must exist first)
- **Presentation (Phase 4)**: Depends on Infrastructure being wired into the DI container
- **Polish (Phase 5)**: Depends on Phase 4 functionally complete

This layered order is **not optional** — it is a direct consequence of the Clean Architecture dependency direction (Constitution Principle I): presentation depends on domain, infra implements domain, so domain must be defined before either can be built.

### Within Each Layer

- Entity before repository interface before use-case hook (Domain)
- DTO before adapter before repository implementation before DI wiring (Infrastructure)
- Screen-local components and hooks can be parallelized; route file requires the screen entry to exist
- Tests (if requested) for a file MUST be written and FAIL before the implementation of that file (TDD discipline — only when tests are explicitly requested in spec.md)

### Parallel Opportunities

- All Phase 1 [P] tasks can run in parallel
- Within Phase 2: T013 / T014 / T015 (use-case hooks + their tests) can run in parallel after T012
- Within Phase 3: T025 / T026 (adapter + repo tests) can run in parallel
- Within Phase 4a: T032 / T033 (screen components + screen-local hooks) can run in parallel after T030
- Different user stories in Phase 4 can be worked on in parallel by different developers once Phase 3 is complete

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (Setup) → Phase 2 (Domain) → Phase 3 (Infrastructure) → Phase 4a (US1)
2. **STOP and VALIDATE**: Verify US1 end-to-end against the acceptance scenarios in spec.md
3. Deploy / demo if ready

### Incremental Delivery

1. Setup + Domain + Infrastructure → backend contract is real
2. Add User Story 1 → independently testable MVP
3. Add User Story 2 → demo
4. Add User Story 3 → demo
5. Phase 5 (Polish) before merge

---

## Notes

- [P] tasks = different files, no dependencies
- `[D]` / `[I]` / `[P]` (layer tags) map tasks to Clean Architecture layers; `[P1]` / `[P2]` map Presentation tasks to user stories
- Verify tests fail before implementing (only when tests are requested)
- Commit after each task or logical group, using Conventional Commits (`feat(<feature>):`, `test(<feature>):`, etc. — Constitution Principle VII)
- Stop at any checkpoint to validate the layer in isolation
- Avoid: domain importing from infra/presentation; default exports outside `src/app/` and `src/screens/[feature]/index.tsx`; React Query hooks bypassing `useAppQuery` / `useAppSuspenseQuery`; `bun test` (use `bun run test`)
