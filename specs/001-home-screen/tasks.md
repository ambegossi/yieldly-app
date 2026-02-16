# Tasks: Home Screen

**Input**: Design documents from `/specs/001-home-screen/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are included per project constitution requirements

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

Project uses single project structure with `src/` at repository root following Expo Router architecture.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure project infrastructure

- [x] T001 Install @shopify/flash-list dependency via bun
- [x] T002 Install @gorhom/bottom-sheet dependency via bun
- [x] T003 Verify GestureHandlerRootView wraps app in src/app/_layout.tsx
- [x] T004 Run bun run types to verify dependencies installed correctly

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create useAppSuspenseQuery wrapper in src/infra/use-cases/use-app-suspense-query.ts
- [x] T006 Create usePoolFindAllSuspense hook in src/domain/pool/use-cases/use-pool-find-all-suspense.ts
- [x] T007 Create useDeviceLayout hook in src/screens/home/hooks/use-device-layout.ts
- [x] T007a Create Loading core component in src/components/core/loading.tsx following react-native-reusables patterns
- [x] T007b Create test for Loading component in src/components/core/__tests__/loading.test.tsx
- [x] T008 [P] Create test for useAppSuspenseQuery in src/infra/use-cases/__tests__/use-app-suspense-query.test.tsx
- [x] T009 [P] Create test for usePoolFindAllSuspense in src/domain/pool/use-cases/__tests__/use-pool-find-all-suspense.test.tsx
- [x] T010 [P] Create test for useDeviceLayout in src/screens/home/hooks/__tests__/use-device-layout.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 4 - App Branding (Priority: P1) 🎯 MVP Foundation

**Goal**: Display Yieldly branding in app header to establish trust and identity

**Independent Test**: Open the app and verify the header displays the Yieldly logo and name

### Implementation for User Story 4

- [x] T010a [US4] Verify Yieldly logo asset exists at src/assets/svgs/logo.svg or create placeholder SVG with green circle and white "Y"
- [x] T011 [US4] Create Header component in src/components/header.tsx
- [x] T012 [US4] Create test for Header component in src/components/__tests__/header.test.tsx
- [x] T013 [US4] Create reusable BottomSheet wrapper component in src/components/bottom-sheet.tsx
- [x] T014 [US4] Create test for BottomSheet component in src/components/__tests__/bottom-sheet.test.tsx

**Checkpoint**: App header displays correctly with branding

---

## Phase 4: User Story 1 - View Best Stablecoin Yields (Priority: P1) 🎯 MVP Core

**Goal**: Display a ranked list of stablecoin yield opportunities sorted by APY

**Independent Test**: Launch the app and verify a list of stablecoins appears sorted by APY (highest first), with each item showing symbol, protocol, network, and APY percentage

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T015 [P] [US1] Create test for useFilteredPools hook in src/screens/home/hooks/__tests__/use-filtered-pools.test.ts
- [x] T016 [P] [US1] Create test for useInfiniteScroll hook in src/screens/home/hooks/__tests__/use-infinite-scroll.test.ts
- [x] T017 [P] [US1] Create test for useNumberedPagination hook in src/screens/home/hooks/__tests__/use-numbered-pagination.test.ts
- [x] T018 [P] [US1] Create test for HomeHeader component in src/screens/home/components/__tests__/home-header.test.tsx
- [x] T019 [P] [US1] Create test for PoolListItem component in src/screens/home/components/__tests__/pool-list-item.test.tsx
- [x] T019a [P] [US1] Add test case to PoolListItem test verifying APY typography is prominent (larger font, bold, green color per FR-027)
- [x] T020 [P] [US1] Create test for EmptyState component in src/screens/home/components/__tests__/empty-state.test.tsx

### Implementation for User Story 1

- [x] T021 [P] [US1] Create useFilteredPools hook in src/screens/home/hooks/use-filtered-pools.ts
- [x] T022 [P] [US1] Create useInfiniteScroll hook in src/screens/home/hooks/use-infinite-scroll.ts
- [x] T023 [P] [US1] Create useNumberedPagination hook in src/screens/home/hooks/use-numbered-pagination.ts
- [x] T024 [P] [US1] Create HomeHeader component in src/screens/home/components/home-header.tsx
- [x] T025 [P] [US1] Create PoolListItem component with React.memo in src/screens/home/components/pool-list-item.tsx
- [x] T026 [P] [US1] Create EmptyState component in src/screens/home/components/empty-state.tsx
- [x] T027 [P] [US1] Create PaginationControls component in src/screens/home/components/pagination-controls.tsx
- [x] T028 [P] [US1] Create test for PaginationControls component in src/screens/home/components/__tests__/pagination-controls.test.tsx
- [x] T029 [US1] Create HomeScreen main component with Suspense and ErrorBoundary in src/screens/home/index.tsx
- [x] T030 [US1] Update app route to use HomeScreen in src/app/index.tsx
- [x] T031 [US1] Run bun run types and bun run lint to validate implementation
- [x] T032 [US1] Take iOS simulator screenshot and compare with phone.png design reference using mcp__ios-simulator__screenshot
- [x] T033 [US1] Test scrolling performance and verify FlashList virtualization works correctly

**Checkpoint**: User Story 1 fully functional - app displays pools sorted by APY with pagination

---

## Phase 5: User Story 2 - Filter by Network (Priority: P2)

**Goal**: Allow users to filter the stablecoin list by blockchain network

**Independent Test**: Tap the "Network" filter button and select a network (e.g., "Optimism"), then verify only stablecoins on that network appear in the list

### Tests for User Story 2

- [x] T034 [P] [US2] Create test for FilterButton component in src/screens/home/components/__tests__/filter-button.test.tsx
- [x] T035 [P] [US2] Create test for FilterBottomSheet component in src/screens/home/components/__tests__/filter-bottom-sheet.test.tsx
- [x] T036 [P] [US2] Create test for FilterDropdown component in src/screens/home/components/__tests__/filter-dropdown.test.tsx

### Implementation for User Story 2

- [x] T037 [P] [US2] Create FilterButton component in src/screens/home/components/filter-button.tsx
- [x] T038 [P] [US2] Create FilterBottomSheet component (mobile) in src/screens/home/components/filter-bottom-sheet.tsx
- [x] T039 [P] [US2] Create FilterDropdown component (desktop/tablet) in src/screens/home/components/filter-dropdown.tsx
- [x] T040 [US2] Integrate network filter into HomeScreen component in src/screens/home/index.tsx
- [x] T041 [US2] Add filter reset logic when pagination changes in src/screens/home/index.tsx
- [x] T042 [US2] Test network filter with iOS simulator using mcp__ios-simulator__ui_tap to select filters
- [x] T043 [US2] Verify empty state appears when no results match network filter

**Checkpoint**: Network filtering works independently and can be tested without protocol filter

---

## Phase 6: User Story 3 - Filter by Protocol (Priority: P2)

**Goal**: Allow users to filter the stablecoin list by DeFi protocol

**Independent Test**: Tap the "Protocol" filter button and select a protocol (e.g., "Aave"), then verify only stablecoins on that protocol appear in the list

### Implementation for User Story 3

- [x] T044 [US3] Add protocol filter to HomeScreen component using existing FilterButton and filter UI components in src/screens/home/index.tsx
- [x] T045 [US3] Test protocol filter independently with iOS simulator
- [x] T046 [US3] Verify both filters (network and protocol) work independently without interference

**Checkpoint**: Protocol filtering works independently of network filter

---

## Phase 7: User Story 5 - Combine Multiple Filters (Priority: P3)

**Goal**: Allow users to apply both network and protocol filters simultaneously with AND logic

**Independent Test**: Select both a network filter (e.g., "Polygon") and protocol filter (e.g., "Aave"), then verify only items matching both criteria appear

### Implementation for User Story 5

- [x] T047 [US5] Verify AND logic in useFilteredPools correctly combines network and protocol filters in src/screens/home/hooks/use-filtered-pools.ts
- [x] T048 [US5] Add "Clear all filters" button to HomeScreen when multiple filters active in src/screens/home/index.tsx
- [x] T049 [US5] Test combined filters with iOS simulator
- [x] T050 [US5] Verify empty state shows correct message when no results match combined filters
- [x] T051 [US5] Test clearing individual filters and "Clear all" button

**Checkpoint**: All user stories (US1-US5) work together correctly

---

## Phase 8: Integration Testing & Validation

**Purpose**: End-to-end validation across all user stories

- [x] T052 [P] Create integration test for home screen full flow in src/screens/home/__tests__/home.integration.test.tsx
- [x] T053 Run all tests with bun test and verify 100% pass
- [x] T054 Run bun run types and verify zero TypeScript errors
- [x] T055 Run bun run lint and verify zero ESLint warnings (only unavoidable require() warnings in jest mocks)
- [x] T056 Test responsive layouts on iOS simulator: phone (375px), tablet (768px), desktop (1280px) using mcp__ios-simulator__ui_view
- [x] T056a Test header visibility during scroll on all breakpoints - verify header remains visible per FR-061
- [x] T057 Take screenshots of all breakpoints and compare with design references (phone.png, tablet.png, desktop.png, desktop-with-filters.png)
- [x] T058 Test dark mode by toggling device settings and verify colors adapt correctly
- [x] T059 Profile performance with React DevTools Profiler and verify scrolling maintains <16.67ms per frame (60 FPS target)
- [x] T059a Measure Time to Interactive with React DevTools Profiler on WiFi with cached data (target: <3s on iPhone 12)
- [x] T059b Measure filter response time from state update to re-render using React DevTools (target: <100ms)
- [x] T059c Verify loading indicator render time from query initiation to Suspense fallback display (target: <100ms)
- [x] T060 Test all edge cases from spec.md: API failures, 0% APY, negative APY, empty results, long text truncation, slow network
- [x] T060a Test cached data display when background refresh fails (cached data remains visible with error indicator)
- [x] T060b Verify "Details coming soon" toast appears when tapping pool list item

**Checkpoint**: All features validated, tests pass, performance meets requirements

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and documentation

- [x] T061 [P] Review FlashList estimatedItemSize accuracy by measuring actual item heights (N/A: FlashList v2 auto-measures)
- [x] T062 [P] Add error logging for query failures (ErrorBoundary + QueryErrorResetBoundary handles errors)
- [x] T063 [P] Optimize memoization and useCallback usage for performance (React.memo on PoolListItem, useCallback/useMemo throughout)
- [x] T064 Run quickstart.md validation steps to ensure guide is accurate (fixed @gorhom package name)
- [x] T065 Update CLAUDE.md with final implementation notes if needed
- [x] T066 Create commit following conventional commits specification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 4 (Phase 3)**: Depends on Foundational - Creates header infrastructure
- **User Story 1 (Phase 4)**: Depends on Foundational and US4 - Core list functionality
- **User Story 2 (Phase 5)**: Depends on Foundational and US1 - Adds network filtering
- **User Story 3 (Phase 6)**: Depends on Foundational, US1, US2 - Adds protocol filtering (uses same filter components)
- **User Story 5 (Phase 7)**: Depends on US2 and US3 - Combines both filters
- **Integration Testing (Phase 8)**: Depends on all user stories being complete
- **Polish (Phase 9)**: Depends on successful integration testing

### User Story Dependencies

- **User Story 4 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 1 (P1)**: Can start after US4 (needs Header) - MVP core functionality
- **User Story 2 (P2)**: Depends on US1 (integrates with existing list)
- **User Story 3 (P2)**: Depends on US1 and US2 (reuses filter components from US2)
- **User Story 5 (P3)**: Depends on US2 and US3 (combines both filter types)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Hooks before components that use them
- Components before screen integration
- Screen integration before iOS simulator validation
- Core implementation before edge case handling

### Parallel Opportunities

- All Setup tasks (T001-T004) can run in sequential batch (dependencies installations)
- All Foundational tests (T008-T010) can run in parallel
- Within US1:
  - Tests T015-T020 can run in parallel (different test files)
  - Hooks T021-T023 can run in parallel (different files)
  - Components T024-T027 can run in parallel (different files)
- Within US2:
  - Tests T034-T036 can run in parallel
  - Components T037-T039 can run in parallel
- Within Phase 9:
  - Polish tasks T061-T063 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create test for useFilteredPools hook in src/screens/home/hooks/__tests__/use-filtered-pools.test.ts"
Task: "Create test for useInfiniteScroll hook in src/screens/home/hooks/__tests__/use-infinite-scroll.test.ts"
Task: "Create test for useNumberedPagination hook in src/screens/home/hooks/__tests__/use-numbered-pagination.test.ts"
Task: "Create test for HomeHeader component in src/screens/home/components/__tests__/home-header.test.tsx"
Task: "Create test for PoolListItem component in src/screens/home/components/__tests__/pool-list-item.test.tsx"
Task: "Create test for EmptyState component in src/screens/home/components/__tests__/empty-state.test.tsx"

# Launch all hooks for User Story 1 together:
Task: "Create useFilteredPools hook in src/screens/home/hooks/use-filtered-pools.ts"
Task: "Create useInfiniteScroll hook in src/screens/home/hooks/use-infinite-scroll.ts"
Task: "Create useNumberedPagination hook in src/screens/home/hooks/use-numbered-pagination.ts"

# Launch all components for User Story 1 together:
Task: "Create HomeHeader component in src/screens/home/components/home-header.tsx"
Task: "Create PoolListItem component with React.memo in src/screens/home/components/pool-list-item.tsx"
Task: "Create EmptyState component in src/screens/home/components/empty-state.tsx"
Task: "Create PaginationControls component in src/screens/home/components/pagination-controls.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 4 + User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 4 (App header with branding)
4. Complete Phase 4: User Story 1 (Core pool list functionality)
5. **STOP and VALIDATE**: Test US4 + US1 independently
6. Deploy/demo if ready - this is the MVP!

**Why this MVP?**: US4 (branding) + US1 (view yields) delivers the core value proposition: users can see and compare stablecoin yields. Filtering can be added incrementally.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 4 → Test independently → Header works
3. Add User Story 1 → Test independently → MVP ready! (Can view yields sorted by APY)
4. Add User Story 2 → Test independently → Network filtering works
5. Add User Story 3 → Test independently → Protocol filtering works
6. Add User Story 5 → Test independently → Combined filtering works
7. Each story adds value without breaking previous stories

### Sequential Team Strategy (Single Developer)

With one developer, follow this order:

1. Phase 1: Setup (1 hour)
2. Phase 2: Foundational (3-4 hours)
3. Phase 3: User Story 4 (2 hours)
4. Phase 4: User Story 1 (8-10 hours) ← MVP complete here!
5. Phase 5: User Story 2 (4-5 hours)
6. Phase 6: User Story 3 (2-3 hours)
7. Phase 7: User Story 5 (1-2 hours)
8. Phase 8: Integration Testing (3-4 hours)
9. Phase 9: Polish (2-3 hours)

**Total estimate**: ~26-36 hours for full feature

---

## Task Summary

- **Total Tasks**: 75 (updated with performance measurement, coverage tasks, and core components)
- **Setup Tasks**: 4 (Phase 1)
- **Foundational Tasks**: 8 (Phase 2) - includes Loading core component
- **User Story 4 Tasks**: 5 (Phase 3) - includes logo verification
- **User Story 1 Tasks**: 20 (Phase 4) ← MVP core - includes APY prominence test
- **User Story 2 Tasks**: 10 (Phase 5)
- **User Story 3 Tasks**: 3 (Phase 6)
- **User Story 5 Tasks**: 5 (Phase 7)
- **Integration Testing Tasks**: 15 (Phase 8) - includes performance measurement and additional edge case tests
- **Polish Tasks**: 6 (Phase 9)

**Parallel Opportunities**: 28 tasks marked [P] can run in parallel within their phases

**MVP Scope**: Phases 1-4 (37 tasks) = US4 + US1 = Header + Pool list with sorting and pagination

**Full Feature Scope**: All 75 tasks = US4 + US1 + US2 + US3 + US5 = Complete home screen with all filtering

---

## Notes

- [P] tasks = different files, no dependencies within same phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach per project constitution)
- Commit after each logical group of tasks
- Stop at any checkpoint to validate story independently
- Use iOS simulator MCP tools proactively for visual validation
- All tasks follow project conventions: kebab-case files, PascalCase components, camelCase hooks
