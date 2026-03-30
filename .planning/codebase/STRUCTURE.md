# Codebase Structure

**Analysis Date:** 2026-03-30

## Directory Layout

```
yieldly-app/
├── src/
│   ├── @types/                  # Global TypeScript declarations
│   ├── app/                     # Expo Router file-based routes
│   │   ├── _layout.tsx          # Root layout (providers, nav stack)
│   │   └── index.tsx            # Home route (/)
│   ├── assets/
│   │   ├── images/              # App icons, splash, static images
│   │   └── svgs/                # SVG assets (logo)
│   ├── components/
│   │   ├── core/                # Primitive UI components (Button, Text, etc.)
│   │   │   └── __tests__/       # Core component tests
│   │   ├── __tests__/           # Shared component tests
│   │   ├── bottom-sheet.tsx     # Reusable BottomSheet wrapper
│   │   ├── header.tsx           # App-level header with logo
│   │   └── screen-wrapper.tsx   # Suspense + ErrorBoundary wrapper
│   ├── config/
│   │   └── env.ts               # Environment variable access
│   ├── domain/
│   │   ├── repositories.ts      # Central Repositories interface
│   │   └── pool/
│   │       ├── pool.ts          # Pool entity interface
│   │       ├── pool-repo.ts     # PoolRepo interface
│   │       └── use-cases/
│   │           ├── __tests__/   # Use case tests
│   │           ├── use-pool-find-all.ts
│   │           └── use-pool-find-all-suspense.ts
│   ├── hooks/
│   │   ├── __tests__/           # Shared hook tests
│   │   └── use-device-layout.ts # Responsive breakpoint hook
│   ├── infra/
│   │   ├── http/
│   │   │   ├── http-client.ts   # HttpClient interface
│   │   │   └── clients/
│   │   │       ├── index.ts     # Client barrel export
│   │   │       └── defi-llama-http-client.ts  # Axios instance
│   │   ├── repositories/
│   │   │   ├── __tests__/       # Repository provider tests
│   │   │   ├── repository-provider.tsx  # DI context + hook
│   │   │   └── http-repository/
│   │   │       ├── index.ts     # HttpRepositories wiring
│   │   │       └── pool/
│   │   │           ├── __tests__/        # Repo + adapter tests
│   │   │           ├── http-pool-repo.ts # PoolRepo implementation
│   │   │           ├── pool-adapter.ts   # DTO-to-entity mapper
│   │   │           └── pool-dto.ts       # DefiLlama DTOs
│   │   └── use-cases/
│   │       ├── __tests__/                # Query wrapper tests
│   │       ├── use-app-query.ts          # useQuery wrapper
│   │       └── use-app-suspense-query.ts # useSuspenseQuery wrapper
│   ├── lib/
│   │   ├── __tests__/           # Utility tests
│   │   ├── theme.ts             # Theme color definitions
│   │   └── utils.ts             # cn() className utility
│   └── screens/
│       └── home/
│           ├── __tests__/       # Integration tests
│           ├── index.tsx        # Home screen component
│           ├── components/
│           │   ├── __tests__/   # Component tests
│           │   ├── empty-state.tsx
│           │   ├── filter-bottom-sheet.tsx
│           │   ├── filter-button.tsx
│           │   ├── filter-dropdown.tsx
│           │   ├── header.tsx
│           │   ├── pagination-controls.tsx
│           │   └── pool-list-item.tsx
│           └── hooks/
│               ├── __tests__/   # Hook tests
│               ├── use-filtered-pools.ts
│               ├── use-infinite-scroll.ts
│               └── use-numbered-pagination.ts
├── android/                     # Native Android project (generated)
├── ios/                         # Native iOS project (generated)
├── specs/                       # Feature specifications
├── coverage/                    # Test coverage reports (generated)
├── global.css                   # Tailwind/NativeWind global styles
├── app.config.js                # Expo app configuration
├── babel.config.js              # Babel with NativeWind preset
├── metro.config.js              # Metro bundler with NativeWind
├── tailwind.config.js           # Tailwind theme extensions
├── tsconfig.json                # TypeScript config (strict, @/* alias)
├── jest.config.js               # Jest configuration
├── jest.setup.js                # Jest setup file
├── eslint.config.js             # ESLint flat config
├── components.json              # shadcn-style component config
├── package.json                 # Dependencies and scripts
└── bun.lock                     # Bun lockfile
```

## Directory Purposes

**`src/app/`:**
- Purpose: Expo Router file-based routes and layouts
- Contains: Route files (`index.tsx`) and layout files (`_layout.tsx`)
- Key files: `_layout.tsx` (root layout with all providers), `index.tsx` (home route)
- Note: Route files should be thin wrappers that delegate to `src/screens/`

**`src/screens/`:**
- Purpose: Screen-level components containing full screen implementations
- Contains: One folder per screen with `index.tsx`, `components/`, and `hooks/` subdirectories
- Key files: `home/index.tsx` (home screen)
- Pattern: Each screen is self-contained with its own components and hooks

**`src/components/`:**
- Purpose: Shared components used across multiple screens
- Contains: Reusable UI components and wrappers
- Key files: `screen-wrapper.tsx`, `header.tsx`, `bottom-sheet.tsx`

**`src/components/core/`:**
- Purpose: Primitive UI components (shadcn/react-native-reusables style)
- Contains: Button, Text, Loading, Badge, Icon, DropdownMenu, NativeOnlyAnimatedView
- Note: These follow react-native-reusables patterns and are exempt from JSX blank-line rule

**`src/domain/`:**
- Purpose: Pure business logic layer with no framework dependencies
- Contains: Entity interfaces, repository interfaces, use-case hooks
- Key files: `repositories.ts` (central interface), `pool/pool.ts`, `pool/pool-repo.ts`
- Pattern: Organized by feature (e.g., `pool/`)

**`src/infra/`:**
- Purpose: Infrastructure implementations bridging domain to external services
- Contains: HTTP clients, repository implementations, DTOs, adapters, React Query wrappers
- Key files: `repositories/repository-provider.tsx`, `http/http-client.ts`
- Pattern: `http-repository/[feature]/` for each domain feature's HTTP implementation

**`src/hooks/`:**
- Purpose: Shared hooks used across multiple screens
- Contains: App-wide utility hooks
- Key files: `use-device-layout.ts`

**`src/lib/`:**
- Purpose: Utility functions and configuration
- Contains: Theme definitions, className utilities
- Key files: `utils.ts` (`cn()` function), `theme.ts` (color system)

**`src/config/`:**
- Purpose: Application configuration
- Contains: Environment variable access
- Key files: `env.ts`

## Key File Locations

**Entry Points:**
- `src/app/_layout.tsx`: Root layout, provider tree, global error boundary
- `src/app/index.tsx`: Home route entry point

**Configuration:**
- `app.config.js`: Expo app config (bundle IDs, plugins, experiments)
- `tsconfig.json`: TypeScript with strict mode, `@/*` path alias
- `tailwind.config.js`: Tailwind theme extensions
- `metro.config.js`: Metro bundler with NativeWind
- `babel.config.js`: Babel preset with NativeWind
- `jest.config.js`: Jest with jest-expo preset
- `eslint.config.js`: ESLint flat config
- `components.json`: shadcn component system config
- `src/config/env.ts`: Runtime environment variable access

**Core Logic:**
- `src/domain/repositories.ts`: All repository contracts
- `src/infra/repositories/repository-provider.tsx`: DI system
- `src/infra/repositories/http-repository/index.ts`: Concrete repository wiring
- `src/infra/use-cases/use-app-query.ts`: Standard data fetching wrapper
- `src/infra/use-cases/use-app-suspense-query.ts`: Suspense data fetching wrapper

**Testing:**
- `jest.config.js`: Test runner configuration
- `jest.setup.js`: Global test setup
- Tests co-located in `__tests__/` directories alongside source

## Naming Conventions

**Files:**
- All files and directories use kebab-case: `pool-list-item.tsx`, `use-filtered-pools.ts`
- Component files: `[name].tsx` (e.g., `filter-button.tsx`)
- Hook files: `use-[name].ts` (e.g., `use-device-layout.ts`)
- Test files: `[name].test.ts` or `[name].test.tsx` (if JSX)
- Entity/interface files: `[name].ts` (e.g., `pool.ts`, `pool-repo.ts`)
- DTO files: `[name]-dto.ts` (e.g., `pool-dto.ts`)
- Adapter files: `[name]-adapter.ts` (e.g., `pool-adapter.ts`)

**Directories:**
- Feature directories: lowercase singular (`pool/`, `home/`)
- Utility directories: kebab-case (`use-cases/`, `http-repository/`)
- Test directories: `__tests__/`

## Where to Add New Code

**New Domain Feature (e.g., "token"):**
- Entity: `src/domain/token/token.ts`
- Repo interface: `src/domain/token/token-repo.ts`
- Use cases: `src/domain/token/use-cases/use-token-find-all.ts`
- Tests: `src/domain/token/use-cases/__tests__/use-token-find-all.test.tsx`
- Register in: `src/domain/repositories.ts` (add to `Repositories` interface)

**New Infrastructure Implementation:**
- HTTP repo: `src/infra/repositories/http-repository/token/http-token-repo.ts`
- DTO: `src/infra/repositories/http-repository/token/token-dto.ts`
- Adapter: `src/infra/repositories/http-repository/token/token-adapter.ts`
- Wire in: `src/infra/repositories/http-repository/index.ts` (add to `HttpRepositories`)

**New Screen:**
- Route: `src/app/[route-name].tsx` (thin wrapper calling ScreenWrapper + screen component)
- Screen: `src/screens/[screen-name]/index.tsx`
- Screen components: `src/screens/[screen-name]/components/[name].tsx`
- Screen hooks: `src/screens/[screen-name]/hooks/use-[name].ts`

**New Shared Component:**
- Primitive/core: `src/components/core/[name].tsx`
- Composite/shared: `src/components/[name].tsx`
- Tests: `src/components/__tests__/[name].test.tsx` or `src/components/core/__tests__/[name].test.tsx`

**New Shared Hook:**
- Implementation: `src/hooks/use-[name].ts`
- Tests: `src/hooks/__tests__/use-[name].test.ts`

**New Utility:**
- Implementation: `src/lib/[name].ts`
- Tests: `src/lib/__tests__/[name].test.ts`

**New HTTP Client:**
- Client: `src/infra/http/clients/[service]-http-client.ts`
- Export from: `src/infra/http/clients/index.ts`

## Special Directories

**`android/`:**
- Purpose: Native Android project files
- Generated: Yes (via `expo prebuild`)
- Committed: Yes

**`ios/`:**
- Purpose: Native iOS project files
- Generated: Yes (via `expo prebuild`)
- Committed: Yes

**`coverage/`:**
- Purpose: Jest test coverage reports
- Generated: Yes (via `bun run test:coverage`)
- Committed: No (should be in `.gitignore`)

**`.expo/`:**
- Purpose: Expo cache and generated types
- Generated: Yes
- Committed: Partially (types are committed)

**`specs/`:**
- Purpose: Feature specification documents
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-03-30*
