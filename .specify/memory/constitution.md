<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.1 → 1.0.2
Modified principles:
  - III. User Experience Consistency: Updated component folder structure (ui → core)
Added sections: None
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md - ✅ compatible
  - .specify/templates/spec-template.md - ✅ compatible
  - .specify/templates/tasks-template.md - ✅ compatible
Follow-up TODOs: None
-->

# Yieldly Constitution

## Core Principles

### I. Clean Architecture & Code Quality

All code MUST follow Clean Architecture with strict layer separation:

- **Domain Layer** (`src/domain/`): Pure business logic, entities, repository interfaces,
  and use cases. MUST NOT import from infrastructure or presentation layers.
- **Infrastructure Layer** (`src/infra/`): Concrete implementations of domain interfaces.
  MUST NOT contain business logic.
- **Presentation Layer** (`src/app/`): UI components and routing. MUST access domain
  through infrastructure's dependency injection via `useRepository()` hook.

Non-negotiable rules:
- TypeScript strict mode MUST remain enabled; `any` type is prohibited except in
  type guards with explicit runtime validation.
- Path alias `@/*` MUST be used for all imports from `src/`.
- New features MUST define domain interfaces before infrastructure implementations.
- ESLint and Prettier MUST pass with zero warnings before merge.

**Rationale**: Layer separation ensures testability, maintainability, and prevents
coupling that would make future changes expensive.

### II. Testing Standards

All production code MUST have corresponding tests following these standards:

- Tests MUST be co-located with source code in `__tests__/` directories.
- Test files MUST use `.test.ts` extension (`.test.tsx` only when JSX is required).
- Custom hooks MUST be tested using `renderHook` with fresh `QueryClient` per test.
- Tests MUST call `unmount()` at the end to prevent `act()` warnings.
- Coverage MUST NOT decrease; new code MUST maintain or improve coverage percentage.

Test categories required:
- **Unit tests**: All domain use cases and pure utility functions.
- **Hook tests**: All custom React hooks with loading, success, and error scenarios.
- **Component tests**: Interactive components with user event simulation.

Non-negotiable rules:
- `jest.clearAllMocks()` MUST be called in `afterEach`.
- `waitFor` MUST be used for all async state assertions.
- Mock repositories MUST use factory functions with `jest.fn()`.
- Tests MUST NOT depend on execution order.

**Rationale**: Consistent testing patterns reduce debugging time and ensure
refactoring safety across the codebase.

### III. User Experience Consistency

All UI MUST follow the established design system to ensure visual and behavioral
consistency:

- NativeWind v4 with Tailwind CSS MUST be used for all styling.
- Theme colors MUST use CSS variables defined in `global.css` (e.g., `--primary`,
  `--background`).
- Dark mode MUST be supported via the `darkMode: "class"` configuration.
- Core UI components (Button, Text, TextInput, etc.) in `src/components/core/` MUST be
  created using react-native-reusables patterns and primitives.
- Composite components that use core components MUST reside in `src/components/`.
- The `cn()` utility from `src/lib/utils.ts` MUST be used for className merging.

Non-negotiable rules:
- Hardcoded colors are prohibited; use theme variables exclusively.
- New components MUST support both light and dark modes.
- Touch targets MUST be minimum 44x44 points for accessibility.
- Loading states MUST be shown for all async operations.
- Error states MUST be user-friendly with actionable guidance.

**Rationale**: Design system consistency reduces cognitive load for users and
development overhead for the team.

### IV. Performance Requirements

The application MUST meet these performance targets on supported devices:

- **Frame rate**: UI MUST maintain 60 FPS during normal operation; drops below
  30 FPS are unacceptable.
- **Time to Interactive**: App MUST be interactive within 3 seconds on cold start.
- **Memory**: App MUST NOT exceed 200MB memory under normal usage patterns.
- **List rendering**: Lists with 100+ items MUST use virtualization (FlashList
  or equivalent).
- **Image loading**: Images MUST be lazy-loaded with appropriate placeholders.

Non-negotiable rules:
- `useCallback` and `useMemo` MUST be used for expensive computations passed as props.
- Inline object/array creation in render is prohibited for components receiving
  those as props.
- React Query MUST be used for all server state; manual `useEffect` data fetching
  is prohibited.
- Console statements MUST be removed before merge (use structured logging instead).

**Rationale**: Mobile users have lower tolerance for performance issues; poor
performance directly impacts user retention and app store ratings.

## Technology Constraints

**Runtime Environment**:
- Expo SDK 54 with new architecture enabled
- React 19.1.0 with React Compiler
- React Native with Hermes engine

**Package Management**:
- Bun MUST be used as the package manager
- Dependencies MUST be added via `bun add`
- Lock file (`bun.lock`) MUST be committed

**Routing**:
- Expo Router v6 with typed routes MUST be used
- All routes MUST reside in `src/app/` directory

**Data Fetching**:
- React Query (`@tanstack/react-query`) MUST be used for server state
- `useAppQuery` wrapper MUST be used for consistent patterns

## Development Workflow

**Before Implementation**:
1. Read existing code in the affected area before proposing changes.
2. Verify Clean Architecture compliance of the proposed design.
3. Identify affected test files.

**During Implementation**:
1. Run `bun run lint` frequently to catch issues early.
2. Write/update tests alongside implementation.
3. Use conventional commits for all commits.

**Before Merge**:
1. All tests MUST pass (`bun test`).
2. Lint MUST pass with zero warnings (`bun run lint`).
3. No `TODO` comments without linked issue numbers.
4. Coverage MUST NOT decrease.

## Governance

This constitution supersedes all other practices when conflicts arise.

**Amendment Process**:
1. Propose amendment with rationale in a pull request.
2. Amendment MUST include migration plan for existing code if applicable.
3. Team review required; breaking changes require explicit approval.
4. Version increment follows semantic versioning:
   - MAJOR: Principle removal or redefinition
   - MINOR: New principle or expanded guidance
   - PATCH: Clarifications and typo fixes

**Compliance**:
- All pull requests MUST verify compliance with these principles.
- Code reviews MUST flag constitution violations.
- Complexity exceptions MUST be documented with justification.

**Version**: 1.0.2 | **Ratified**: 2026-01-24 | **Last Amended**: 2026-01-27
