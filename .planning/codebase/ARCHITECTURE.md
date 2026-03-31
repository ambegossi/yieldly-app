# Architecture

**Analysis Date:** 2026-03-30

## Pattern Overview

**Overall:** Clean Architecture with Dependency Injection

**Key Characteristics:**
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

**Key files:**
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

**Key files:**
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

**Key files:**
- `src/app/_layout.tsx` - Root layout: wires `QueryClientProvider`, `RepositoryProvider`, `GestureHandlerRootView`, `PortalHost`
- `src/app/index.tsx` - Home route: wraps `HomeScreen` in `ScreenWrapper`
- `src/screens/home/index.tsx` - Home screen: pool list with filters, dual pagination
- `src/components/screen-wrapper.tsx` - `ScreenWrapper`: combines `QueryErrorResetBoundary`, `ErrorBoundary`, and `Suspense`
- `src/components/header.tsx` - App-level header with logo
- `src/components/core/` - Core UI primitives (Button, Text, Loading, Badge, Icon, DropdownMenu)

## Data Flow

### Pool List (Primary Flow)

1. `src/app/_layout.tsx` initializes `QueryClient`, wraps app in `RepositoryProvider` with `HttpRepositories`
2. `src/app/index.tsx` renders `ScreenWrapper` > `HomeScreen`
3. `ScreenWrapper` provides Suspense boundary (shows `<Loading />`) and ErrorBoundary
4. `HomeScreen` calls `usePoolFindAllSuspense()` which suspends until data loads
5. `usePoolFindAllSuspense()` calls `useRepository()` to get `poolRepo`, passes `poolRepo.findAll()` to `useAppSuspenseQuery`
6. `useAppSuspenseQuery` delegates to React Query's `useSuspenseQuery` with query key `["pools"]`
7. `HttpPoolRepo.findAll()` fetches from DefiLlama API via Axios, maps DTOs through `defiLlamaPoolDTOToPool`
8. Pools return as `Pool[]` to `HomeScreen`, which applies client-side filtering and pagination

### Client-Side Filtering

1. `useFilteredPools(pools)` sorts by APY descending, derives unique network/protocol filter options
2. User selects filters via `FilterDropdown` (desktop) or `FilterBottomSheet` (mobile)
3. `useMemo` recomputes filtered list when filter state changes
4. Both pagination hooks reset when filters change (via `useEffect`)

### Dual Pagination

1. `useDeviceLayout()` determines `isMobile` (width < 768dp)
2. Mobile: `useInfiniteScroll(filteredPools)` loads 24 items at a time via `onEndReached`
3. Desktop/Tablet: `useNumberedPagination(filteredPools)` shows 24 items per page with page controls

**State Management:**
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

Dependencies are wired via React Context:

1. **Interface definition:** `src/domain/repositories.ts` defines the `Repositories` interface with all repository contracts
2. **Context creation:** `src/infra/repositories/repository-provider.tsx` creates `RepositoryContext` and exports `RepositoryProvider` (the `.Provider` component) and `useRepository()` hook
3. **Concrete wiring:** `src/infra/repositories/http-repository/index.ts` creates `HttpRepositories` object that satisfies `Repositories` by instantiating `HttpPoolRepo` with the DefiLlama Axios client
4. **Provider mounting:** `src/app/_layout.tsx` passes `HttpRepositories` as the `value` to `RepositoryProvider`
5. **Consumption:** Any component or hook calls `useRepository()` to get typed access to all repositories

**Adding a new repository:**
1. Define interface in `src/domain/[feature]/[feature]-repo.ts`
2. Add to `Repositories` interface in `src/domain/repositories.ts`
3. Create implementation in `src/infra/repositories/http-repository/[feature]/`
4. Add to `HttpRepositories` in `src/infra/repositories/http-repository/index.ts`

## Entry Points

**App Entry:**
- Location: `src/app/_layout.tsx`
- Triggers: Expo Router loads this as root layout
- Responsibilities: Initialize QueryClient, wire DI, configure navigation stack, provide global error boundary

**Home Route:**
- Location: `src/app/index.tsx`
- Triggers: Default route (`/`)
- Responsibilities: Wrap HomeScreen in ScreenWrapper for Suspense/Error handling

## Error Handling

**Strategy:** Layered error boundaries with Suspense integration

**Patterns:**
- **Route-level:** `ErrorBoundary` export in `src/app/_layout.tsx` catches unhandled errors with retry button
- **Screen-level:** `ScreenWrapper` in `src/components/screen-wrapper.tsx` combines `QueryErrorResetBoundary` + class `ErrorBoundary` + `Suspense` for per-screen error recovery
- **Data fetching:** `useSuspenseQuery` throws errors to nearest ErrorBoundary; retry resets React Query cache and re-mounts
- **HTTP layer:** Axios errors propagate through React Query to ErrorBoundary

## Cross-Cutting Concerns

**Logging:** Not implemented. No logging framework configured.

**Validation:** Environment variables validated at startup in `src/config/env.ts` (throws if `expoConfig.extra` missing).

**Authentication:** Not implemented. No auth layer exists.

**Theming:** HSL-based CSS variable system in `global.css` with light/dark themes defined in `src/lib/theme.ts`. NativeWind v4 processes Tailwind classes.

**Responsive Design:** `useDeviceLayout()` hook at `src/hooks/use-device-layout.ts` provides breakpoints. NativeWind responsive prefixes (`md:`, `lg:`) used in className props.

---

*Architecture analysis: 2026-03-30*
