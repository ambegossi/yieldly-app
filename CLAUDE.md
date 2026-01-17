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

### Package management

This project uses Bun as the package manager (note the `bun.lock` file).

## Architecture

### Clean Architecture Pattern

The codebase follows Clean Architecture with three main layers:

1. **Domain Layer** (`src/domain/`)
   - Contains pure business logic and entities
   - Defines repository interfaces (e.g., `PoolRepo`)
   - Organizes features by domain (e.g., `pool/`)
   - Use cases are located in feature-specific `useCases/` directories

2. **Infrastructure Layer** (`src/infra/`)
   - Implements domain interfaces with concrete implementations
   - `repositories/RepositoryProvider.tsx` - React Context for dependency injection
   - `useCases/useAppQuery.ts` - Wrapper around React Query for consistent data fetching

3. **Presentation Layer** (`src/app/`)
   - File-based routing using expo-router
   - Components consume repositories via `useRepository()` hook

### Dependency Injection Pattern

Repositories are injected via React Context:

- Domain defines interfaces in `src/domain/Repositories.ts`
- Infrastructure provides `RepositoryProvider` and `useRepository()` hook
- Concrete implementations are passed to `RepositoryProvider` at the root level

### Path Aliases

TypeScript path alias `@/*` maps to `./src/*` (configured in tsconfig.json).

## Styling System

### NativeWind v4 Configuration

- Uses Tailwind CSS via NativeWind for cross-platform styling
- `global.css` defines CSS variables for theming
- Dark mode support via `darkMode: "class"` in tailwind config
- Custom color system based on HSL CSS variables (--primary, --secondary, --background, etc.)

### UI Components

- Located in `src/components/ui/`
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
2. Create use cases in `src/domain/[feature]/useCases/`
3. Implement repository in infrastructure layer
4. Register repository in `src/domain/Repositories.ts` interface
5. Provide implementation via `RepositoryProvider` in root layout
6. Use `useRepository()` hook to access repositories in components

### Data Fetching Pattern

Use `useAppQuery` wrapper for consistent React Query integration:

```typescript
const { data, isLoading, error } = useAppQuery({
  queryKey: ['key'],
  fetchData: () => repository.method()
});
```

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
- Example: `src/domain/pool/useCases/__tests__/usePoolFindAll.test.tsx`

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

When testing custom hooks that depend on repositories and React Query:

**1. Mock Repository Factory**

```typescript
const createMockPoolRepo = (overrides?: Partial<PoolRepo>): PoolRepo => {
  return {
    findAll: jest.fn(),
    ...overrides,
  };
};
```

**2. Wrapper Factory for Providers**

```typescript
const createWrapper = (poolRepo: PoolRepo) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,  // Prevent retry for faster, predictable tests
          gcTime: 0,     // Disable cache for test isolation
        },
      },
    });

    return (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider value={{ poolRepo }}>
          {children}
        </RepositoryProvider>
      </QueryClientProvider>
    );
  };
};
```

**3. Test Implementation**

```typescript
const { result } = renderHook(() => usePoolFindAll(), {
  wrapper: createWrapper(mockPoolRepo),
});

await waitFor(() => {
  expect(result.current.isPending).toBe(false);
});
```

### Test Coverage Requirements

Every test suite should cover:

1. **Success scenarios** - Verify expected behavior with valid data
2. **Loading states** - Test `isPending` and `isLoading` transitions
3. **Error handling** - Verify graceful error handling and error state exposure
4. **Edge cases** - Test empty data, null values, boundary conditions
5. **Call verification** - Ensure dependencies are called with correct arguments
6. **Query key verification** - Confirm React Query uses correct cache keys

### Best Practices

- **Isolation**: Create fresh QueryClient per test with retry/cache disabled
- **Async handling**: Always use `waitFor` for async state changes
- **Cleanup**: Use `afterEach(() => jest.clearAllMocks())` to reset mocks
- **Descriptive names**: Use clear test descriptions that explain the scenario
- **AAA Pattern**: Structure tests with Arrange-Act-Assert pattern
- **Mock stability**: Verify hooks don't refetch on component re-renders

## Commits

- Use conventional commits specification to write commit messages
