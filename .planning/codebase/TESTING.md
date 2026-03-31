# Testing Patterns

**Analysis Date:** 2026-03-30

## Test Framework

**Runner:**
- Jest 30 with `jest-expo` preset
- Config: `jest.config.js`
- Setup file: `jest.setup.js` (extends `@testing-library/jest-native`, polyfills `structuredClone`, mocks Expo Winter Runtime)

**Assertion Library:**
- Jest built-in matchers + `@testing-library/jest-native` extended matchers

**Libraries:**
- `@testing-library/react-native` v13 for component and hook testing
- `@testing-library/jest-native` v5 for extended React Native matchers

**Run Commands:**
```bash
bun run test              # Run all tests (uses Jest, NOT Bun's test runner)
bun run test:watch        # Watch mode
bun run test:coverage     # Coverage report
bun run test [pattern]    # Run tests matching pattern
```

**Important:** Use `bun run test` (not `bun test`) to invoke Jest. `bun test` uses Bun's built-in runner instead. Jest 30 uses `--testPathPatterns` (plural).

## Test File Organization

**Location:** Co-located with source code in `__tests__/` directories

**Naming:** `{source-file-name}.test.ts` or `.test.tsx` (use `.tsx` only when test contains JSX)

**Structure:**
```
src/
├── domain/pool/use-cases/
│   ├── use-pool-find-all.ts
│   └── __tests__/
│       ├── use-pool-find-all.test.tsx
│       └── use-pool-find-all-suspense.test.tsx
├── infra/repositories/http-repository/pool/
│   └── __tests__/
│       ├── http-pool-repo.test.ts
│       └── pool-adapter.test.ts
├── screens/home/
│   ├── __tests__/
│   │   └── home.integration.test.tsx
│   ├── components/__tests__/
│   │   ├── pool-list-item.test.tsx
│   │   ├── filter-button.test.tsx
│   │   └── ...
│   └── hooks/__tests__/
│       ├── use-infinite-scroll.test.ts
│       └── use-numbered-pagination.test.ts
├── components/__tests__/
│   ├── header.test.tsx
│   ├── bottom-sheet.test.tsx
│   └── screen-wrapper.test.tsx
├── components/core/__tests__/
│   └── loading.test.tsx
├── hooks/__tests__/
│   └── use-device-layout.test.ts
└── lib/__tests__/
    └── utils.test.ts
```

## Test Categories

| Category | Count | Location | Pattern |
|----------|-------|----------|---------|
| Unit (adapters, utils, pure hooks) | ~14 | Co-located `__tests__/` dirs | Test single function/hook in isolation |
| Component | ~7 | `screens/**/components/__tests__/` and `components/__tests__/` | Render with mocked deps, assert output |
| Hook (with React Query) | ~3 | `domain/**/use-cases/__tests__/` and `infra/use-cases/__tests__/` | `renderHook` with QueryClient wrapper |
| Integration | ~1 | `screens/home/__tests__/` | Full screen render with mocked repos |

**Total:** 23 test files, ~133 test cases across 22 suites

## Test Structure

**Suite Organization:**
```typescript
describe("usePoolFindAll", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch pools successfully", async () => {
    // Arrange
    const mockPoolRepo = createMockPoolRepo({
      findAll: jest.fn().mockResolvedValue(mockPools),
    });

    // Act
    const { result, unmount } = renderHook(() => usePoolFindAll(), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
    expect(result.current.data).toEqual(mockPools);

    unmount();
  });
});
```

**Key Patterns:**
- Arrange-Act-Assert structure with explicit comments (`// Arrange`, `// Act`, `// Assert`)
- Fresh `QueryClient` per test via `beforeEach`
- `jest.clearAllMocks()` in `afterEach`
- **Always call `unmount()` at the end of each test** to prevent `act()` warnings from React Query background updates

## Mocking Patterns

**Mock Repositories (factory function with overrides):**
```typescript
const createMockPoolRepo = (overrides?: Partial<PoolRepo>): PoolRepo => {
  return {
    findAll: jest.fn(),
    ...overrides,
  };
};
```

**React Query Test Client:**
```typescript
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,    // No retries in tests
        gcTime: 0,       // Immediate garbage collection
        staleTime: 0,    // Always stale
      },
    },
  });
};
```

**Test Wrapper (QueryClient + RepositoryProvider):**
```typescript
const createWrapper = (poolRepo: PoolRepo, queryClient: QueryClient) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider value={{ poolRepo }}>{children}</RepositoryProvider>
      </QueryClientProvider>
    );
  };
};
```

**Third-Party Library Mocks (required for Jest compatibility):**
```typescript
// FlashList (ESM module, not in transformIgnorePatterns)
jest.mock("@shopify/flash-list", () => ({
  __esModule: true,
  FlashList: require("react-native").FlatList,
}));

// @gorhom/bottom-sheet
jest.mock("@gorhom/bottom-sheet", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ children }) => <View>{children}</View>),
    BottomSheetBackdrop: jest.fn(() => null),
  };
});

// expo-image
jest.mock("expo-image", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    Image: (props: Record<string, unknown>) => <View testID="expo-image" {...props} />,
  };
});

// react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
```

**Note:** `require()` in `jest.mock` callbacks triggers `@typescript-eslint/no-require-imports` warnings -- this is unavoidable.

## Fixtures and Factories

**Test Data Pattern (inline factory functions):**
```typescript
const createMockPools = (count: number): Pool[] => {
  const chains = ["ethereum", "polygon", "arbitrum", "optimism"];
  const projects = ["Aave", "Compound", "Yearn", "Uniswap"];

  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    chain: chains[i % chains.length],
    project: projects[i % projects.length],
    symbol: `TOKEN${i + 1}`,
    apy: (i + 1) * 1.5,
    url: `https://example.com/pool/${i + 1}`,
  }));
};
```

**Location:** Factory functions are defined at the top of each test file. No shared fixtures directory exists.

## Coverage

**Configuration:** Defined in `jest.config.js` `collectCoverageFrom`

**Included:**
- All `src/**/*.{ts,tsx}` files

**Excluded from coverage:**
- Type definitions: `src/**/*.d.ts`
- Core UI components: `src/components/ui/**` (react-native-reusables, tested upstream)
- Route files: `src/app/**/*.tsx` (UI-focused, integration tested)
- Barrel exports: `src/**/index.ts`
- Config files: `src/config/**`
- Theme constants: `src/lib/theme.ts`
- Pure type/interface files: `src/domain/**/pool.ts`, `src/domain/**/pool-repo.ts`, `src/domain/repositories.ts`
- DTOs: `src/infra/repositories/http-repository/**/pool-dto.ts`
- HTTP client interfaces: `src/infra/http/http-client.ts`
- HTTP client instances: `src/infra/http/clients/*.ts`

**Thresholds:** No minimum thresholds enforced

**View Coverage:**
```bash
bun run test:coverage
```

## Test Types

**Unit Tests:**
- Pure functions (adapters, utils): Direct input/output testing
- Example: `src/infra/repositories/http-repository/pool/__tests__/pool-adapter.test.ts`
- Example: `src/lib/__tests__/utils.test.ts`

**Hook Tests (with React Query):**
- Custom hooks using `renderHook` with QueryClient + RepositoryProvider wrapper
- Test success, loading, error states, empty responses, query keys, call counts, re-render stability
- Example: `src/domain/pool/use-cases/__tests__/use-pool-find-all.test.tsx`

**Component Tests:**
- Render components with mocked dependencies
- Assert UI output, accessibility labels, user interactions
- Example: `src/screens/home/components/__tests__/pool-list-item.test.tsx`

**Integration Tests:**
- Full screen render with mocked repositories and real React Query
- Test complete data flow from fetch to render
- Example: `src/screens/home/__tests__/home.integration.test.tsx`

**E2E Tests:** Not present. Visual validation uses iOS Simulator MCP tools.

## Common Patterns

**Async Testing (hooks with React Query):**
```typescript
const { result, unmount } = renderHook(() => usePoolFindAll(), {
  wrapper: createWrapper(mockPoolRepo, queryClient),
});

// Check initial loading state
expect(result.current.isPending).toBe(true);

// Wait for async resolution
await waitFor(() => {
  expect(result.current.isPending).toBe(false);
});

// Assert final state
expect(result.current.data).toEqual(expectedData);

unmount();
```

**Error Testing:**
```typescript
const mockPoolRepo = createMockPoolRepo({
  findAll: jest.fn().mockRejectedValue(new Error("Network error")),
});

const { result, unmount } = renderHook(() => usePoolFindAll(), {
  wrapper: createWrapper(mockPoolRepo, queryClient),
});

await waitFor(() => {
  expect(result.current.isPending).toBe(false);
});

expect(result.current.error).toEqual(new Error("Network error"));
expect(result.current.data).toBeUndefined();

unmount();
```

**Suspense Query Error Testing:**
```typescript
// useSuspenseQuery errors are caught by ErrorBoundary, not thrown from renderHook
// Check via query cache instead:
const error = queryClient.getQueryCache().getAll()[0].state.error;
expect(error).toEqual(expectedError);
```

**Component Render Testing:**
```typescript
const { unmount } = render(<HomeScreen />, { wrapper: Wrapper });

await waitFor(() => {
  expect(screen.getByText("expected text")).toBeTruthy();
});

queryClient.clear();
unmount();
```

**Accessibility Testing:**
- Use `accessibilityRole` and `accessibilityLabel` props on interactive elements
- Note: `getByRole("progressbar")` does not work in RNTL; use `getByLabelText` instead
- `accessibilityRole: "header"` works; `"banner"` does NOT

## What to Test (Coverage Strategy)

**Always test:**
- Hook success, loading, error, and empty states
- Repository call counts and arguments
- Query key correctness
- Re-render stability (no unnecessary refetches)
- Data transformations (adapters)
- Component rendering with various props
- Edge cases (zero values, negative values, empty arrays)

**Skip testing:**
- Pure type/interface files
- Barrel exports
- UI primitives from react-native-reusables
- Route layout files (tested via integration tests)
- Configuration files

---

*Testing analysis: 2026-03-30*
