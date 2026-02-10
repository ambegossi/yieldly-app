# Data Model: Home Screen

**Date**: 2026-02-05
**Feature**: Home Screen (001-home-screen)

## Overview

This document defines the data structures, transformations, and state management for the home screen feature. All entities follow TypeScript strict mode with no `any` types except in type guards with runtime validation.

## Domain Entities

### Pool (Existing)

The core entity representing a stablecoin yield opportunity.

**Location**: `src/domain/pool/pool.ts`

```typescript
export interface Pool {
  id: string;          // Unique identifier
  chain: string;       // Network name (e.g., "Optimism", "Polygon", "Ethereum")
  project: string;     // Protocol name (e.g., "Aave", "Spark", "Compound")
  symbol: string;      // Stablecoin symbol (e.g., "USDT", "USDC", "DAI")
  apy: number;         // Annual Percentage Yield (e.g., 5.67)
  url: string;         // External URL to pool details
}
```

**Properties**:
- All fields are required (no optional fields)
- `apy` is a number (not a string), formatted for display in UI layer
- `chain` maps to "network" in UI terminology
- `project` maps to "protocol" in UI terminology

**Validation Rules**:
- `id`: Non-empty string
- `chain`: Non-empty string
- `project`: Non-empty string
- `symbol`: Non-empty string (typically 3-4 uppercase letters)
- `apy`: Non-negative number (can be 0)
- `url`: Valid URL string

**Sorting**:
- Default sort: By `apy` descending (highest first)
- No secondary sort specified, maintains API order for ties

## Presentation Layer Types

### FilterState

Tracks the currently active filters for network and protocol.

**Location**: `src/screens/home/hooks/use-filtered-pools.ts`

```typescript
export interface FilterState {
  network: string | null;   // Selected network, null if no filter active
  protocol: string | null;  // Selected protocol, null if no filter active
}
```

**Usage**:
- `null` indicates "All" (no filter)
- Non-null values are exact string matches against `Pool.chain` or `Pool.project`
- Filters apply with AND logic when both are set

### PaginationState

Tracks pagination state for either infinite scroll or numbered pagination.

**Location**: `src/screens/home/hooks/use-infinite-scroll.ts` and `use-numbered-pagination.ts`

```typescript
// Infinite Scroll Pagination (Mobile)
export interface InfiniteScrollState {
  currentPage: number;    // Current page number (1-indexed)
  itemsPerPage: number;   // Fixed at 24
  isLoadingMore: boolean; // Prevent duplicate requests
  hasMore: boolean;       // Whether more items exist
}

// Numbered Pagination (Tablet/Desktop)
export interface NumberedPaginationState {
  currentPage: number;    // Current page number (1-indexed)
  itemsPerPage: number;   // Fixed at 24
  totalPages: number;     // Computed from total items
}
```

**Calculations**:
```typescript
// Infinite scroll: items to display
const displayedItems = allItems.slice(0, currentPage * itemsPerPage);
const hasMore = displayedItems.length < allItems.length;

// Numbered pagination: items for current page
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const pageItems = allItems.slice(startIndex, endIndex);
const totalPages = Math.ceil(allItems.length / itemsPerPage);
```

### FilterOptions

Available filter values extracted from the pool dataset.

**Location**: `src/screens/home/hooks/use-filtered-pools.ts`

```typescript
export interface FilterOptions {
  networks: string[];   // Unique networks, alphabetically sorted
  protocols: string[];  // Unique protocols, alphabetically sorted
}
```

**Extraction Logic**:
```typescript
const networks = [...new Set(pools.map(p => p.chain))].sort();
const protocols = [...new Set(pools.map(p => p.project))].sort();
```

### DeviceLayout

Device classification for responsive layout selection.

**Location**: `src/screens/home/hooks/use-device-layout.ts`

```typescript
export interface DeviceLayout {
  isMobile: boolean;    // width < 768dp
  isTablet: boolean;    // 768dp <= width < 1024dp
  isDesktop: boolean;   // width >= 1024dp
  width: number;        // Current viewport width
  height: number;       // Current viewport height
}
```

**Usage**:
- Determines which pagination strategy to use
- Determines which filter UI to show (bottom sheet vs dropdown)
- Determines layout spacing and typography scales

## Data Transformations

### 1. Sorting Pools by APY

**Input**: `Pool[]`
**Output**: `Pool[]` (sorted by APY descending)

```typescript
const sortedPools = pools.sort((a, b) => b.apy - a.apy);
```

**Notes**:
- Mutates original array (use spread to avoid if needed)
- Higher APY appears first
- Stable sort maintains original order for equal APY values

### 2. Filtering Pools

**Input**: `Pool[]`, `FilterState`
**Output**: `Pool[]` (filtered subset)

```typescript
function filterPools(pools: Pool[], filters: FilterState): Pool[] {
  let result = pools;

  if (filters.network !== null) {
    result = result.filter(pool => pool.chain === filters.network);
  }

  if (filters.protocol !== null) {
    result = result.filter(pool => pool.project === filters.protocol);
  }

  return result;
}
```

**Notes**:
- AND logic: both filters must match if both are set
- Case-sensitive exact string matching
- Filtering happens after sorting

### 3. Pagination Slicing

**Infinite Scroll**:
```typescript
function getInfiniteScrollItems(pools: Pool[], currentPage: number): Pool[] {
  return pools.slice(0, currentPage * 24);
}
```

**Numbered Pagination**:
```typescript
function getPageItems(pools: Pool[], page: number): Pool[] {
  const startIndex = (page - 1) * 24;
  const endIndex = startIndex + 24;
  return pools.slice(startIndex, endIndex);
}
```

### 4. APY Formatting

**Input**: `number` (e.g., 5.6743)
**Output**: `string` (e.g., "5.67%")

```typescript
function formatAPY(apy: number): string {
  return `${apy.toFixed(2)}%`;
}
```

**Usage**:
- Always 2 decimal places
- Includes % symbol
- Applied in UI layer, not in domain

### 5. Filter Option Extraction

**Input**: `Pool[]`
**Output**: `FilterOptions`

```typescript
function extractFilterOptions(pools: Pool[]): FilterOptions {
  const networks = [...new Set(pools.map(p => p.chain))].sort();
  const protocols = [...new Set(pools.map(p => p.project))].sort();
  return { networks, protocols };
}
```

**Notes**:
- Uses Set to deduplicate
- Alphabetically sorted
- Recomputed when pool data changes

## State Management Strategy

### Server State (React Query)

**Managed By**: `usePoolFindAll` hook with `useSuspenseQuery`

```typescript
// Existing hook in src/domain/pool/use-cases/use-pool-find-all.ts
const { data: pools } = usePoolFindAll(); // Returns Pool[]
```

**Cache Configuration**:
- `queryKey`: `["pools"]`
- `staleTime`: Default (0ms) - refetch on focus
- `cacheTime`: Default (5 minutes)
- `refetchOnMount`: true
- `refetchOnWindowFocus`: true

**Suspense Integration**:
- Hook suspends on initial fetch
- Suspense boundary shows loading state
- Background refetches don't suspend (use `isRefetching` for indicator)

### UI State (Local useState)

**Filter State**:
```typescript
const [networkFilter, setNetworkFilter] = useState<string | null>(null);
const [protocolFilter, setProtocolFilter] = useState<string | null>(null);
```

**Pagination State (Mobile)**:
```typescript
const [currentPage, setCurrentPage] = useState(1);
const [isLoadingMore, setIsLoadingMore] = useState(false);
```

**Pagination State (Desktop/Tablet)**:
```typescript
const [currentPage, setCurrentPage] = useState(1);
```

**Bottom Sheet State (Mobile)**:
```typescript
const [filterType, setFilterType] = useState<'network' | 'protocol' | null>(null);
const bottomSheetRef = useRef<BottomSheetModal>(null);
```

### Computed State (useMemo)

**Filtered Pools**:
```typescript
const filteredPools = useMemo(() => {
  return filterPools(sortedPools, { network: networkFilter, protocol: protocolFilter });
}, [sortedPools, networkFilter, protocolFilter]);
```

**Sorted Pools**:
```typescript
const sortedPools = useMemo(() => {
  return [...pools].sort((a, b) => b.apy - a.apy);
}, [pools]);
```

**Filter Options**:
```typescript
const filterOptions = useMemo(() => {
  return extractFilterOptions(pools);
}, [pools]);
```

**Paginated Items**:
```typescript
// Mobile
const displayedPools = useMemo(() => {
  return filteredPools.slice(0, currentPage * 24);
}, [filteredPools, currentPage]);

// Desktop/Tablet
const pageItems = useMemo(() => {
  const startIndex = (currentPage - 1) * 24;
  return filteredPools.slice(startIndex, startIndex + 24);
}, [filteredPools, currentPage]);
```

**Dependencies**:
- `useMemo` dependencies must include all values used in computation
- Omitting dependencies causes stale closures
- React 19 compiler auto-memoizes, but explicit `useMemo` for clarity

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. API Fetch (usePoolFindAll with useSuspenseQuery)            │
│    - Suspends on initial load                                   │
│    - Returns Pool[] from PoolRepo.findAll()                     │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────────────┐
│ 2. Sort by APY (useMemo)                                        │
│    - sortedPools = [...pools].sort((a,b) => b.apy - a.apy)     │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────────────┐
│ 3. Apply Filters (useMemo)                                      │
│    - filteredPools = filterPools(sortedPools, filterState)     │
│    - Depends on: networkFilter, protocolFilter                  │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────────────┐
│ 4. Pagination (useMemo)                                         │
│    - Mobile: displayedPools = filteredPools.slice(0, page*24)  │
│    - Desktop: pageItems = filteredPools.slice(start, end)      │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────────────┐
│ 5. Render (FlashList)                                           │
│    - data={displayedPools or pageItems}                         │
│    - renderItem={({ item }) => <PoolListItem pool={item} />}   │
│    - estimatedItemSize={125}                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Side Effects on Filter Change**:
1. User changes filter (network or protocol)
2. `setNetworkFilter` or `setProtocolFilter` updates state
3. `filteredPools` recomputes (useMemo dependency triggered)
4. `setCurrentPage(1)` resets pagination
5. `displayedPools` or `pageItems` recomputes
6. FlashList re-renders with new data

**Side Effects on Pagination**:
1. User scrolls to end (mobile) or clicks page number (desktop)
2. `setCurrentPage(currentPage + 1)` or `setCurrentPage(pageNumber)`
3. `displayedPools` or `pageItems` recomputes
4. FlashList re-renders with expanded/different data

## Error States

### Empty Data Set
**Condition**: `pools.length === 0`
**UI**: Empty state component with message "No stablecoin pools available"

### Empty Filtered Results
**Condition**: `filteredPools.length === 0 && pools.length > 0`
**UI**: Empty state component with message "No stablecoins found for selected filters" + button to clear filters

### Network Error
**Condition**: Query throws error (caught by ErrorBoundary)
**UI**: Error boundary displays error message with retry button

### Loading State
**Condition**: Query suspends (initial fetch only)
**UI**: Suspense fallback displays loading spinner

## Validation Rules

### Filter Validation
- Network and protocol values must exist in `filterOptions` arrays
- Setting invalid filter values should throw error or reset to null
- Filter state never contains empty strings (use null instead)

### Pagination Validation
- `currentPage` must be >= 1
- `currentPage` must be <= `totalPages` for numbered pagination
- `itemsPerPage` is constant 24, not user-configurable
- Attempting to paginate beyond last page should no-op

### Pool Data Validation
- All Pool objects must have all required fields
- `apy` must be a valid number (not NaN, not Infinity)
- Empty pool arrays are valid (display empty state)

## Performance Considerations

### Memoization Strategy
- Sort once after fetch (sortedPools)
- Filter on every filter change (filteredPools)
- Paginate on every page change (displayedPools/pageItems)
- Extract filter options once after fetch (filterOptions)

### Re-render Prevention
- Wrap PoolListItem with React.memo
- Use useCallback for event handlers passed to items
- Avoid inline object/array creation in item props
- FlashList recycling handles rest

### Memory Management
- FlashList only renders visible + buffer items
- Full dataset kept in memory (acceptable for <1000 items)
- No need for virtualization beyond FlashList
- React Query cache manages server data lifecycle

## Type Exports

All types should be exported from their respective files for reuse:

```typescript
// src/domain/pool/pool.ts
export interface Pool { ... }

// src/screens/home/hooks/use-filtered-pools.ts
export interface FilterState { ... }
export interface FilterOptions { ... }

// src/screens/home/hooks/use-infinite-scroll.ts
export interface InfiniteScrollState { ... }

// src/screens/home/hooks/use-numbered-pagination.ts
export interface NumberedPaginationState { ... }

// src/screens/home/hooks/use-device-layout.ts
export interface DeviceLayout { ... }
```

## Next Steps

- ✅ Data model defined
- ⏭️ Create component interface contracts
- ⏭️ Create implementation quickstart guide
- ⏭️ Update agent context
