# Implementation Quickstart: Home Screen

**Date**: 2026-02-05
**Feature**: Home Screen (001-home-screen)

## Overview

This guide provides a step-by-step implementation roadmap for building the home screen feature. Follow these phases in order, validating each step before proceeding.

## Prerequisites

- [x] Research complete (`research.md`)
- [x] Data model defined (`data-model.md`)
- [x] Component contracts documented (`contracts/components.md`)
- [ ] Dependencies installed
- [ ] Development environment ready

## Phase 1: Dependencies Installation

### Install Required Packages

```bash
# Navigate to project root
cd /Users/ambegossi/yieldly/yieldly-app

# Install FlashList
bun add @shopify/flash-list

# Install Bottom Sheet
bun add @gorhom/bottom-sheet

# Verify installations
bun run types  # Should pass with no errors
```

### Verify Existing Dependencies

The following are already installed (verify in package.json):
- ✅ `@tanstack/react-query` (v5.90.10)
- ✅ `react-native-reanimated` (v4.1.1)
- ✅ `react-native-gesture-handler` (v2.28.0)
- ✅ `react-native-safe-area-context` (v5.6.0)

### Configure GestureHandlerRootView

Ensure root layout wraps with `GestureHandlerRootView`:

**File**: `src/app/_layout.tsx`

```typescript
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Existing layout content */}
    </GestureHandlerRootView>
  );
}
```

**Validation**: Run `bun start` and verify no gesture handler warnings.

---

## Phase 2: Core Infrastructure

### Step 2.1: Create useAppSuspenseQuery Wrapper

**File**: `src/infra/use-cases/use-app-suspense-query.ts`

**Purpose**: Wrapper around React Query's useSuspenseQuery for consistent integration

**Implementation**:
```typescript
import { useSuspenseQuery, UseSuspenseQueryOptions, DefaultError } from '@tanstack/react-query';

interface UseAppSuspenseQueryOptions<TData> {
  queryKey: unknown[];
  fetchData: () => Promise<TData>;
  options?: Omit<UseSuspenseQueryOptions<TData, DefaultError>, 'queryKey' | 'queryFn'>;
}

export function useAppSuspenseQuery<TData>({
  queryKey,
  fetchData,
  options,
}: UseAppSuspenseQueryOptions<TData>) {
  return useSuspenseQuery({
    queryKey,
    queryFn: fetchData,
    ...options,
  });
}
```

**Validation**:
- TypeScript compiles without errors
- No linting warnings

### Step 2.2: Update usePoolFindAll to Use Suspense (Optional)

**File**: `src/domain/pool/use-cases/use-pool-find-all.ts`

**Current**: Uses `useAppQuery`
**Option**: Create `usePoolFindAllSuspense` variant or modify to accept suspense flag

**Implementation** (create new hook):
```typescript
import { useRepository } from "@/infra/repositories/repository-provider";
import { useAppSuspenseQuery } from "@/infra/use-cases/use-app-suspense-query";

export function usePoolFindAllSuspense() {
  const { poolRepo } = useRepository();

  return useAppSuspenseQuery({
    queryKey: ["pools"],
    fetchData: () => poolRepo.findAll(),
  });
}
```

**Validation**:
- Hook suspends on initial call
- Returns data after fetch completes

---

## Phase 3: Reusable Components

### Step 3.1: Create Global Header Component

**File**: `src/components/header.tsx`

**Implementation**:
```typescript
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '@/components/core/text';

export function Header() {
  return (
    <View className="h-16 flex-row items-center border-b border-border bg-card px-4 md:px-6">
      <Image
        source={require('@/assets/svgs/logo.svg')}
        style={{ width: 40, height: 40 }}
        contentFit="contain"
        alt="Yieldly logo"
      />
      <Text className="ml-3 text-xl font-bold text-foreground">
        Yieldly
      </Text>
    </View>
  );
}
```

**Validation**:
- Logo displays correctly
- Text appears next to logo
- Header has correct height and styling
- Dark mode colors work

**Test**: Create `src/components/__tests__/header.test.tsx`

### Step 3.2: Create Reusable BottomSheet Component

**File**: `src/components/bottom-sheet.tsx`

**Implementation**:
```typescript
import React, { forwardRef } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetProps as RNBottomSheetProps } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

export interface BottomSheetProps extends Partial<RNBottomSheetProps> {
  children: React.ReactNode;
  snapPoints: string[];
  onClose?: () => void;
}

export const BottomSheetComponent = forwardRef<BottomSheet, BottomSheetProps>(
  function BottomSheetComponent({ children, snapPoints, onClose, ...props }, ref) {
    const renderBackdrop = React.useCallback(
      (backdropProps: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          opacity={0.5}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      []
    );

    return (
      <BottomSheet
        ref={ref}
        snapPoints={snapPoints}
        index={-1} // Start closed
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={onClose}
        handleIndicatorStyle={{ backgroundColor: 'hsl(var(--border))' }}
        backgroundStyle={{ backgroundColor: 'hsl(var(--card))' }}
        {...props}
      >
        {children}
      </BottomSheet>
    );
  }
);
```

**Validation**:
- Sheet opens and closes via ref
- Backdrop tap closes sheet
- Swipe down closes sheet
- Keyboard handling works (if text inputs inside)

**Test**: Create `src/components/__tests__/bottom-sheet.test.tsx`

---

## Phase 4: Home Screen Hooks

### Step 4.1: Create useDeviceLayout Hook

**File**: `src/screens/home/hooks/use-device-layout.ts`

**Implementation**:
```typescript
import { useWindowDimensions } from 'react-native';

export interface DeviceLayout {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

export function useDeviceLayout(): DeviceLayout {
  const { width, height } = useWindowDimensions();

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    width,
    height,
  };
}
```

**Validation**:
- Returns correct classifications for different widths
- Updates on orientation change

**Test**: `src/screens/home/hooks/__tests__/use-device-layout.test.ts`

### Step 4.2: Create useFilteredPools Hook

**File**: `src/screens/home/hooks/use-filtered-pools.ts`

**Implementation**: See `contracts/components.md` for detailed spec

**Key Logic**:
```typescript
export function useFilteredPools(pools: Pool[]) {
  const [networkFilter, setNetworkFilter] = useState<string | null>(null);
  const [protocolFilter, setProtocolFilter] = useState<string | null>(null);

  const sortedPools = useMemo(() => {
    return [...pools].sort((a, b) => b.apy - a.apy);
  }, [pools]);

  const filteredPools = useMemo(() => {
    let result = sortedPools;
    if (networkFilter) {
      result = result.filter(p => p.chain === networkFilter);
    }
    if (protocolFilter) {
      result = result.filter(p => p.project === protocolFilter);
    }
    return result;
  }, [sortedPools, networkFilter, protocolFilter]);

  const filterOptions = useMemo(() => ({
    networks: [...new Set(pools.map(p => p.chain))].sort(),
    protocols: [...new Set(pools.map(p => p.project))].sort(),
  }), [pools]);

  const clearFilters = useCallback(() => {
    setNetworkFilter(null);
    setProtocolFilter(null);
  }, []);

  const hasActiveFilters = networkFilter !== null || protocolFilter !== null;

  return {
    filteredPools,
    filterOptions,
    networkFilter,
    protocolFilter,
    setNetworkFilter,
    setProtocolFilter,
    clearFilters,
    hasActiveFilters,
  };
}
```

**Validation**:
- Filters work independently and combined
- Sorting by APY is correct
- Filter options extracted correctly

**Test**: `src/screens/home/hooks/__tests__/use-filtered-pools.test.ts`

### Step 4.3: Create useInfiniteScroll Hook

**File**: `src/screens/home/hooks/use-infinite-scroll.ts`

**Implementation**: See `contracts/components.md` for detailed spec

**Validation**:
- Returns first 24 items initially
- loadMore adds next 24 items
- hasMore is false when all items shown
- reset returns to page 1

**Test**: `src/screens/home/hooks/__tests__/use-infinite-scroll.test.ts`

### Step 4.4: Create useNumberedPagination Hook

**File**: `src/screens/home/hooks/use-numbered-pagination.ts`

**Implementation**: See `contracts/components.md` for detailed spec

**Validation**:
- Returns only current page items
- Navigation works correctly
- Boundary checks prevent invalid pages

**Test**: `src/screens/home/hooks/__tests__/use-numbered-pagination.test.ts`

---

## Phase 5: Home Screen Components

### Step 5.1: Create HomeHeader Component

**File**: `src/screens/home/components/home-header.tsx`

**Implementation**:
```typescript
import { View } from 'react-native';
import { Text } from '@/components/core/text';

export function HomeHeader() {
  return (
    <View className="mb-6 items-center">
      <Text className="text-center text-3xl font-bold text-foreground md:text-4xl">
        Find the Best Stablecoin Yields
      </Text>
      <Text className="mt-2 text-center text-base text-muted-foreground md:text-lg">
        Compare lending rates across DeFi protocols and maximize your returns
      </Text>
    </View>
  );
}
```

**Validation**:
- Text displays correctly
- Typography scales on different devices
- Colors work in dark mode

**Test**: `src/screens/home/components/__tests__/home-header.test.tsx`

### Step 5.2: Create PoolListItem Component

**File**: `src/screens/home/components/pool-list-item.tsx`

**Implementation**: See design references and `contracts/components.md`

**Key Features**:
- Circular stablecoin icon with symbol text
- Protocol name, network (with bullet prefix), APY
- "Best APY" label under APY
- Memoized with `React.memo`
- Pressable with feedback

**Validation**:
- Matches design references (phone.png, tablet.png, desktop.png)
- APY formatted to 2 decimals
- Press feedback works
- Measured height matches estimatedItemSize (~125dp)

**Test**: `src/screens/home/components/__tests__/pool-list-item.test.tsx`

### Step 5.3: Create FilterButton Component

**File**: `src/screens/home/components/filter-button.tsx`

**Implementation**: See `contracts/components.md`

**Validation**:
- Shows active state when filter applied
- Icon and text display correctly

**Test**: `src/screens/home/components/__tests__/filter-button.test.tsx`

### Step 5.4: Create FilterBottomSheet Component

**File**: `src/screens/home/components/filter-bottom-sheet.tsx`

**Implementation**: Uses reusable BottomSheet, displays filter options

**Validation**:
- Opens and closes correctly
- Shows selected option with checkmark
- "All" option clears filter

**Test**: `src/screens/home/components/__tests__/filter-bottom-sheet.test.tsx`

### Step 5.5: Create FilterDropdown Component (Desktop/Tablet)

**File**: `src/screens/home/components/filter-dropdown.tsx`

**Implementation**: Dropdown menu for desktop/tablet

**Validation**:
- Opens on click
- Closes on selection or outside click

**Test**: `src/screens/home/components/__tests__/filter-dropdown.test.tsx`

### Step 5.6: Create PaginationControls Component

**File**: `src/screens/home/components/pagination-controls.tsx`

**Implementation**: See `contracts/components.md`

**Validation**:
- Page numbers display correctly
- Ellipsis logic works
- Navigation calls onPageChange

**Test**: `src/screens/home/components/__tests__/pagination-controls.test.tsx`

### Step 5.7: Create EmptyState Component

**File**: `src/screens/home/components/empty-state.tsx`

**Implementation**: Simple centered message with optional clear button

**Validation**:
- Message displays correctly
- Clear button appears when specified

**Test**: `src/screens/home/components/__tests__/empty-state.test.tsx`

---

## Phase 6: Home Screen Assembly

### Step 6.1: Create Home Screen

**File**: `src/screens/home/index.tsx`

**Structure**:
```typescript
import { Suspense } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

import { usePoolFindAllSuspense } from '@/domain/pool/use-cases/use-pool-find-all';
import { useFilteredPools } from './hooks/use-filtered-pools';
import { useDeviceLayout } from './hooks/use-device-layout';
import { useInfiniteScroll } from './hooks/use-infinite-scroll';
import { useNumberedPagination } from './hooks/use-numbered-pagination';

import { Header } from '@/components/header';
import { Button } from '@/components/core/button';
import { Text } from '@/components/core/text';
import { Loading } from '@/components/core/loading';
import { HomeHeader } from './components/home-header';
import { FilterButton } from './components/filter-button';
import { PoolListItem } from './components/pool-list-item';
import { FilterBottomSheet } from './components/filter-bottom-sheet';
import { FilterDropdown } from './components/filter-dropdown';
import { PaginationControls } from './components/pagination-controls';
import { EmptyState } from './components/empty-state';

function HomeScreenContent() {
  const { data: pools } = usePoolFindAllSuspense();
  const { isMobile } = useDeviceLayout();

  const {
    filteredPools,
    filterOptions,
    networkFilter,
    protocolFilter,
    setNetworkFilter,
    setProtocolFilter,
    clearFilters,
    hasActiveFilters,
  } = useFilteredPools(pools);

  // Mobile: Infinite scroll
  const { displayedItems, loadMore, hasMore } = useInfiniteScroll(filteredPools);

  // Desktop/Tablet: Numbered pagination
  const { pageItems, currentPage, totalPages, goToPage, nextPage, prevPage } =
    useNumberedPagination(filteredPools);

  const itemsToDisplay = isMobile ? displayedItems : pageItems;

  const handlePoolPress = useCallback((pool: Pool) => {
    // Navigate to detail screen (future implementation)
    console.log('Pool pressed:', pool.id);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    if (isMobile) {
      // Reset infinite scroll
    } else {
      goToPage(1);
    }
  }, [networkFilter, protocolFilter, isMobile]);

  return (
    <View className="flex-1 bg-background">
      <Header />

      <View className="flex-1 px-4 pt-6 md:px-6 lg:px-8">
        <HomeHeader />

        {/* Filters */}
        <View className="mb-4 flex-row gap-2">
          <FilterButton
            label="Network"
            activeFilter={networkFilter}
            onPress={() => {/* Open network filter */}}
          />
          <FilterButton
            label="Protocol"
            activeFilter={protocolFilter}
            onPress={() => {/* Open protocol filter */}}
          />
          {hasActiveFilters && (
            <Button onPress={clearFilters} variant="outline" size="sm">
              <Text>Clear all</Text>
            </Button>
          )}
        </View>

        {/* List */}
        {itemsToDisplay.length === 0 ? (
          <EmptyState
            message={pools.length === 0
              ? "No stablecoin pools available"
              : "No stablecoins found for selected filters"
            }
            showClearFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        ) : (
          <FlashList
            data={itemsToDisplay}
            renderItem={({ item }) => (
              <PoolListItem pool={item} onPress={handlePoolPress} />
            )}
            estimatedItemSize={125}
            onEndReached={isMobile ? loadMore : undefined}
            onEndReachedThreshold={0.5}
            keyExtractor={(item) => item.id}
          />
        )}

        {/* Pagination controls for desktop/tablet */}
        {!isMobile && totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}
      </View>

      {/* Filter bottom sheets/dropdowns */}
      {/* Implementation details... */}
    </View>
  );
}

export default function HomeScreen() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <View className="flex-1 items-center justify-center bg-background p-4">
              <Text className="text-lg text-destructive mb-4">
                Something went wrong loading pools
              </Text>
              <Button onPress={resetErrorBoundary}>
                <Text>Retry</Text>
              </Button>
            </View>
          )}
        >
          <Suspense fallback={<Loading />}>
            <HomeScreenContent />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

**Validation**:
- Suspense shows loading on initial load
- Error boundary catches and handles errors
- Filters apply correctly
- Pagination works in both modes
- UI matches design references

### Step 6.2: Update App Route

**File**: `src/app/(tabs)/index.tsx`

**Implementation**:
```typescript
import HomeScreen from '@/screens/home';

export default HomeScreen;
```

**Validation**:
- Route navigates to home screen
- Expo Router recognizes route

---

## Phase 7: Testing

### Step 7.1: Unit Tests

Create tests for all hooks and utility functions:
- ✅ `use-device-layout.test.ts`
- ✅ `use-filtered-pools.test.ts`
- ✅ `use-infinite-scroll.test.ts`
- ✅ `use-numbered-pagination.test.ts`

**Run**: `bun test src/screens/home/hooks`

### Step 7.2: Component Tests

Create tests for all components:
- ✅ `header.test.tsx`
- ✅ `bottom-sheet.test.tsx`
- ✅ `home-header.test.tsx`
- ✅ `pool-list-item.test.tsx`
- ✅ `filter-button.test.tsx`
- ✅ `filter-bottom-sheet.test.tsx`
- ✅ `filter-dropdown.test.tsx`
- ✅ `pagination-controls.test.tsx`
- ✅ `empty-state.test.tsx`

**Run**: `bun test src/screens/home/components`

### Step 7.3: Integration Test

**File**: `src/screens/home/__tests__/home.integration.test.tsx`

**Test Scenarios**:
- Initial load displays pools
- Applying network filter updates list
- Applying protocol filter updates list
- Combining filters works
- Clearing filters restores full list
- Pagination advances correctly
- Empty state shows when no results
- Error boundary catches errors

**Run**: `bun test src/screens/home/__tests__/home.integration.test.tsx`

### Step 7.4: Run All Tests

```bash
bun test
```

**Expected**: All tests pass with no warnings

---

## Phase 8: Validation

### Step 8.1: Type Checking

```bash
bun run types
```

**Expected**: Zero TypeScript errors

### Step 8.2: Linting

```bash
bun run lint
```

**Expected**: Zero ESLint warnings

### Step 8.3: iOS Simulator Testing

**Start App**:
```bash
bun run ios
```

**Validation Tasks**:
1. **Initial Load**: App loads without crashing, shows loading state, then displays pools
2. **Visual Match**: Compare with design references using `mcp__ios-simulator__screenshot`
   - Take screenshot of initial state
   - Compare with `phone.png`
   - Verify layout, colors, typography match
3. **Filter Interaction**:
   - Tap "Network" filter button
   - Bottom sheet opens
   - Select a network
   - List updates to show only that network's pools
   - Compare with `desktop-with-filters.png` for filter chips
4. **Pagination** (if on tablet/desktop simulator):
   - Verify numbered pagination appears
   - Click page 2
   - List updates to show page 2 items
5. **Infinite Scroll** (if on phone simulator):
   - Scroll to bottom
   - Verify more items load
   - Loading indicator appears briefly
6. **Empty State**:
   - Apply filters that return no results
   - Verify empty state message appears
   - Click "Clear Filters" button
   - List restores
7. **Dark Mode**:
   - Toggle device to dark mode
   - Verify colors adapt correctly
   - All text remains readable

**MCP Tools**:
```bash
# Take screenshot
mcp__ios-simulator__screenshot --output_path ~/Downloads/home-screen-test.png

# Inspect UI elements
mcp__ios-simulator__ui_describe_all

# Test interactions
mcp__ios-simulator__ui_tap --x <x> --y <y>
mcp__ios-simulator__ui_swipe --x_start <x> --y_start <y> --x_end <x2> --y_end <y2>
```

### Step 8.4: Performance Profiling

**Tools**: React DevTools Profiler

**Metrics to Check**:
- Initial render time: < 500ms
- Scroll FPS: 60 FPS sustained
- Filter application: < 100ms
- Pagination: < 50ms

**If Issues**:
- Profile with React DevTools
- Check FlashList estimatedItemSize accuracy
- Verify memoization on PoolListItem
- Check for unnecessary re-renders

---

## Phase 9: Final Checklist

- [ ] All dependencies installed
- [ ] All hooks implemented and tested
- [ ] All components implemented and tested
- [ ] Home screen integrated and tested
- [ ] Integration tests pass
- [ ] Type checking passes
- [ ] Linting passes
- [ ] iOS simulator validation complete
- [ ] UI matches design references
- [ ] Performance meets targets
- [ ] Dark mode works correctly
- [ ] Responsive layouts work on mobile/tablet/desktop

---

## Troubleshooting

### FlashList Blank Spaces

**Symptom**: Blank spaces appear during scrolling
**Solution**: Adjust `estimatedItemSize` to match actual measured height

### Bottom Sheet Not Opening

**Symptom**: Bottom sheet doesn't appear when button pressed
**Solution**: Verify `GestureHandlerRootView` wraps app root, check ref usage

### Filters Not Working

**Symptom**: Applying filters doesn't update list
**Solution**: Check `useMemo` dependencies include filter state, verify filter logic

### Pagination Not Resetting

**Symptom**: Pagination stays on page 2 after filter change
**Solution**: Add `useEffect` to reset pagination when filters change

### Performance Issues

**Symptom**: Scrolling is janky, frame drops
**Solution**: Profile with React DevTools, check for keys in item components, verify memoization

---

## Next Steps After Implementation

1. Create GitHub issues from tasks (if using `/speckit.taskstoissues`)
2. Create pull request for review
3. Deploy to staging for QA testing
4. Gather user feedback
5. Plan detail screen feature (out of scope for this spec)

---

## Reference Documents

- [spec.md](./spec.md) - Feature specification
- [research.md](./research.md) - Technology research
- [data-model.md](./data-model.md) - Data structures
- [contracts/components.md](./contracts/components.md) - Component contracts
- Design References:
  - phone.png
  - tablet.png
  - desktop.png
  - desktop-with-filters.png
