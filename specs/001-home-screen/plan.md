# Implementation Plan: Home Screen

**Branch**: `001-home-screen` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-home-screen/spec.md`

## Summary

Build a responsive home screen that displays stablecoin yield opportunities sorted by APY, with client-side filtering by network and protocol. The implementation uses FlashList for virtualized rendering with device-adaptive pagination (infinite scroll on mobile, numbered pagination on tablet/desktop), @gorhom/bottom-sheet for mobile filter UI, React Suspense for loading states, and follows Clean Architecture principles with proper separation of concerns.

## Technical Context

**Language/Version**: TypeScript 5.9.2 with strict mode enabled
**Primary Dependencies**: Expo SDK 54, React 19.1.0, React Query v5, FlashList, @gorhom/bottom-sheet, NativeWind v4
**Storage**: React Query cache for data persistence (no database needed for MVP)
**Testing**: Jest with jest-expo preset, @testing-library/react-native
**Target Platform**: iOS 15+, Android 5.0+, Web (responsive: mobile 320-428px, tablet 768-1024px, desktop 1280px+)
**Project Type**: Mobile application with web support using Expo Router
**Performance Goals**: 60 FPS during scrolling, <3s Time to Interactive, virtualized rendering for 100+ items
**Constraints**: <200MB memory, offline support with cached data, client-side filtering and pagination only
**Scale/Scope**: Single screen feature with ~5-10 components, 3-5 hooks, filtering logic, pagination implementations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Layer Separation Compliance
✅ **Domain Layer**: Existing `Pool` entity and `PoolRepo` interface are correctly defined in `src/domain/pool/`
✅ **Infrastructure Layer**: Existing HTTP implementation in `src/infra/repositories/http-repository/pool/`
✅ **Presentation Layer**: New home screen will be created in `src/screens/home/` with screen-specific components in `src/screens/home/components/`

### File Naming Compliance
✅ All new files will use kebab-case: `use-filtered-pools.ts`, `pool-list-item.tsx`, `filter-bottom-sheet.tsx`
✅ Component exports use PascalCase, hooks use camelCase as required

### Testing Requirements
✅ Unit tests required for: filtering logic, pagination hooks, data transformation utilities
✅ Hook tests required for: `useFilteredPools`, `usePagination`, `usePoolFindAll` integration
✅ Component tests required for: `PoolListItem`, `FilterButton`, screen-specific components
✅ Integration test required for: home screen with full filter and pagination flow
✅ Coverage must not decrease with new code

### Performance Requirements
✅ FlashList will be used for virtualized rendering (60 FPS requirement)
✅ `useCallback` and `useMemo` for filter functions and computed values
✅ React Query for server state management (no manual useEffect data fetching)
✅ Item components will be memoized with `React.memo`

### UI/UX Consistency
✅ NativeWind v4 with Tailwind CSS for all styling
✅ Theme colors from `global.css` CSS variables
✅ Dark mode support required
✅ Loading states via Suspense boundaries
✅ Error boundaries for error handling

### Development Workflow
✅ TypeScript types check (`bun run types`)
✅ ESLint with zero warnings (`bun run lint`)
✅ All tests pass (`bun test`)
✅ iOS simulator validation with screenshots matching design specs

**Status**: ✅ All gates passed. Ready for Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-home-screen/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - technology research and decisions
├── data-model.md        # Phase 1 output - data structures and transformations
├── quickstart.md        # Phase 1 output - implementation guide
├── contracts/           # Phase 1 output - API contracts and interfaces
└── tasks.md             # Phase 2 output - NOT created by /speckit.plan
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── pool/
│       ├── pool.ts                          # Existing: Pool entity
│       ├── pool-repo.ts                     # Existing: PoolRepo interface
│       └── use-cases/
│           └── use-pool-find-all.ts         # Existing: Hook to fetch all pools
│
├── infra/
│   ├── repositories/
│   │   ├── http-repository/
│   │   │   └── pool/                        # Existing: HTTP implementation
│   │   └── repository-provider.tsx          # Existing: DI context
│   └── use-cases/
│       └── use-app-query.ts                 # Existing: React Query wrapper
│
├── screens/
│   └── home/                                # NEW: Home screen feature
│       ├── index.tsx                        # NEW: Main home screen component
│       ├── components/
│       │   ├── pool-list-item.tsx           # NEW: Individual pool card
│       │   ├── filter-button.tsx            # NEW: Filter trigger button
│       │   ├── filter-bottom-sheet.tsx      # NEW: Mobile filter bottom sheet
│       │   ├── filter-dropdown.tsx          # NEW: Desktop/tablet filter dropdown
│       │   ├── pagination-controls.tsx      # NEW: Numbered pagination for desktop/tablet
│       │   ├── empty-state.tsx              # NEW: No results message
│       │   └── home-header.tsx              # NEW: Title and subtitle section
│       ├── hooks/
│       │   ├── use-filtered-pools.ts        # NEW: Client-side filtering logic
│       │   ├── use-infinite-scroll.ts       # NEW: Infinite scroll pagination
│       │   └── use-numbered-pagination.ts   # NEW: Numbered pagination logic
│       └── __tests__/
│           ├── use-filtered-pools.test.ts
│           ├── use-infinite-scroll.test.ts
│           ├── use-numbered-pagination.test.ts
│           ├── pool-list-item.test.tsx
│           └── home.integration.test.tsx
│
├── components/
│   ├── core/                                # Existing: Core UI primitives
│   ├── bottom-sheet.tsx                     # NEW: Reusable bottom sheet wrapper
│   └── header.tsx                           # NEW: Global app header with logo
│
└── app/
    └── (tabs)/
        └── index.tsx                        # Modified: Route to home screen

tests/                                       # Alternative location if preferred
└── integration/
    └── home-screen.test.tsx                # Integration test
```

**Structure Decision**: Single project structure using existing Expo Router architecture. Home screen components are organized in `src/screens/home/` following the established pattern. Core reusable components (header, bottom sheet wrapper) live in `src/components/`. Screen-specific components remain within `src/screens/home/components/`. Tests are co-located with source code in `__tests__/` directories per project conventions.

## Complexity Tracking

> **No violations requiring justification**

All architectural patterns align with the constitution. The feature adds a new screen following existing patterns, uses established dependency injection via `useRepository()`, and maintains strict layer separation. FlashList and @gorhom/bottom-sheet are production-proven libraries that don't introduce anti-patterns.

---

## Phase 0: Research ✅

**Status**: Complete
**Output**: `research.md`

Key decisions documented:
- FlashList for list virtualization with component recycling
- @gorhom/bottom-sheet v5 for mobile filter UI
- Dual pagination strategies (infinite scroll mobile, numbered desktop/tablet)
- React Suspense + useSuspenseQuery for loading states
- Client-side filtering with useMemo
- Responsive breakpoints: mobile (<768dp), tablet (768-1023dp), desktop (>=1024dp)

All unknowns from Technical Context resolved through Perplexity research.

---

## Phase 1: Design & Contracts ✅

**Status**: Complete
**Outputs**: `data-model.md`, `contracts/components.md`, `quickstart.md`

### Data Model Defined

**Entities**:
- `Pool` (existing): Core domain entity with id, chain, project, symbol, apy, url
- `FilterState`: Tracks active network and protocol filters
- `PaginationState`: Separate interfaces for infinite scroll and numbered pagination
- `FilterOptions`: Extracted unique networks and protocols
- `DeviceLayout`: Device classification for responsive UI

**Transformations**:
- Sort by APY descending
- Filter by network and/or protocol (AND logic)
- Pagination slicing (infinite: 0 to page*24, numbered: start to start+24)
- APY formatting (2 decimals with % symbol)
- Filter option extraction (dedupe and sort)

**State Management**:
- Server state: React Query with useSuspenseQuery
- UI state: Local useState for filters and pagination
- Computed state: useMemo for filtered/sorted/paginated data

### Component Contracts Defined

**Global Components**:
- `Header`: App header with logo and name
- `BottomSheet`: Reusable bottom sheet wrapper

**Home Screen Components**:
- `HomeHeader`: Title and subtitle section
- `PoolListItem`: Individual pool card (memoized)
- `FilterButton`: Filter trigger button
- `FilterBottomSheet`: Mobile filter selection UI
- `FilterDropdown`: Desktop/tablet filter selection UI
- `PaginationControls`: Numbered pagination for desktop/tablet
- `EmptyState`: No results message

**Hooks**:
- `useDeviceLayout`: Device classification
- `useFilteredPools`: Filter management and data filtering
- `useInfiniteScroll`: Infinite scroll pagination for mobile
- `useNumberedPagination`: Numbered pagination for desktop/tablet

All contracts specify props, behavior, styling, accessibility, and testing requirements.

### Implementation Quickstart Created

**Phases Defined**:
1. Dependencies installation (FlashList, @gorhom/bottom-sheet)
2. Core infrastructure (useAppSuspenseQuery wrapper)
3. Reusable components (Header, BottomSheet)
4. Home screen hooks (device layout, filtering, pagination)
5. Home screen components (all UI components)
6. Home screen assembly (main screen integration)
7. Testing (unit, component, integration)
8. Validation (types, lint, iOS simulator, performance)
9. Final checklist

Each phase includes implementation details, validation steps, and troubleshooting guidance.

### Agent Context Updated

**CLAUDE.md updated** with:
- Active technologies: TypeScript 5.9.2, Expo SDK 54, React 19.1.0, React Query v5, FlashList, @gorhom/bottom-sheet, NativeWind v4
- Database: React Query cache (no database needed)

---

## Constitution Re-Check (Post-Design) ✅

### Layer Separation Compliance
✅ **Domain Layer**: No changes to domain layer, existing `Pool` entity and `PoolRepo` used
✅ **Infrastructure Layer**: New `useAppSuspenseQuery` wrapper follows existing `useAppQuery` pattern
✅ **Presentation Layer**: All new components in correct locations (`src/screens/home/`, `src/components/`)

### File Naming Compliance
✅ All planned files use kebab-case:
- `use-filtered-pools.ts`, `use-infinite-scroll.ts`, `use-numbered-pagination.ts`
- `pool-list-item.tsx`, `filter-button.tsx`, `filter-bottom-sheet.tsx`
- `home-header.tsx`, `pagination-controls.tsx`, `empty-state.tsx`

### Testing Requirements
✅ Unit tests planned for all hooks (4 hooks)
✅ Component tests planned for all components (9 components)
✅ Integration test planned for home screen (full flow)
✅ Test files follow naming convention: `*.test.ts` / `*.test.tsx`
✅ Tests co-located in `__tests__/` directories

### Performance Requirements
✅ FlashList with `estimatedItemSize={125}` for 60 FPS scrolling
✅ `React.memo` on `PoolListItem` to prevent unnecessary re-renders
✅ `useCallback` for event handlers passed to items
✅ `useMemo` for all computed values (filtered pools, sorted pools, pagination)
✅ No inline object/array creation in item props
✅ React Query for server state, no manual `useEffect` data fetching

### UI/UX Consistency
✅ NativeWind v4 with Tailwind CSS for all styling
✅ Theme colors from CSS variables (`bg-background`, `text-foreground`, etc.)
✅ Dark mode support via `dark:` classes and CSS variables
✅ Suspense boundaries for loading states
✅ ErrorBoundary with QueryErrorResetBoundary for error handling
✅ Responsive typography (`text-base`, `text-lg`, `text-xl`)
✅ Touch targets minimum 44dp (buttons, list items)

### Development Workflow Compliance
✅ TypeScript strict mode enforced, no `any` types
✅ Path alias `@/*` used for all imports
✅ Components use function declarations with named exports
✅ Hooks use function declarations with named exports and camelCase naming
✅ ESLint and Prettier configured to pass
✅ iOS simulator validation with design reference screenshots

**Status**: ✅ All constitutional requirements satisfied. Design maintains compliance.

---

## Phase 2: Task Generation

**Status**: Not started (this command stops after Phase 1)
**Next Command**: `/speckit.tasks` to generate `tasks.md`

The implementation plan is complete and ready for task breakdown. All design artifacts have been generated and validated against the constitution.

---

## Implementation Readiness

✅ **Research Complete**: All technology decisions made and documented
✅ **Design Complete**: Data model, component contracts, and quickstart guide created
✅ **Constitution Compliant**: All gates passed, no violations
✅ **Agent Context Updated**: New technologies registered in CLAUDE.md
✅ **Ready for Implementation**: Can proceed with `/speckit.implement` or `/speckit.tasks`

The home screen feature is fully planned and ready for implementation execution.
