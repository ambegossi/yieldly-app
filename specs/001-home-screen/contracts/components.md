# Component Contracts: Home Screen

**Date**: 2026-02-05
**Feature**: Home Screen (001-home-screen)

## Overview

This document defines the interface contracts for all components in the home screen feature. Each contract specifies props, behavior, styling requirements, and testing expectations.

## Screen Component

### HomeScreen

**Location**: `src/screens/home/index.tsx`

**Purpose**: Root component orchestrating the entire home screen feature

**Props**: None (route component)

**Internal State**:
- Filter state (network, protocol)
- Pagination state (current page)
- Bottom sheet state (mobile only)

**Children**:
- `<Header />` - Global app header
- `<HomeHeader />` - Title and subtitle
- `<FilterButton />` (2x) - Network and Protocol filters
- `<FlashList />` - Pool list with `<PoolListItem />`
- `<PaginationControls />` (desktop/tablet) or infinite scroll trigger
- `<FilterBottomSheet />` (mobile) or `<FilterDropdown />` (desktop/tablet)
- `<EmptyState />` when no results

**Behavior**:
- Fetches pool data via `usePoolFindAll()`
- Suspends on initial load
- Manages filter state and pagination
- Adapts UI based on device layout
- Resets pagination when filters change

**Styling**:
- Full screen flex container
- Background color: `bg-background`
- Responsive padding (16dp mobile, 24dp tablet, 32dp desktop)

**Testing**:
- Integration test covering full user flow
- Filter application and clearing
- Pagination in both modes
- Empty states
- Error boundary handling

---

## Global Components

### Header

**Location**: `src/components/header.tsx`

**Purpose**: Global app header with Yieldly logo and name

**Props**:
```typescript
interface HeaderProps {
  // No props - static header
}
```

**Behavior**:
- Displays logo from `src/assets/svgs/logo.svg`
- Shows "Yieldly" text next to logo
- Sticky at top of screen on web

**Styling**:
- Height: 64dp
- Horizontal padding: 16dp (mobile), 24dp (desktop)
- Background: `bg-card`
- Border bottom: 1dp solid `border`
- Flexbox row layout, items centered vertically

**Accessibility**:
- Logo has alt text "Yieldly logo"
- Header has role="banner"

**Testing**:
- Renders logo and name
- Responsive padding adjusts

---

### BottomSheet

**Location**: `src/components/bottom-sheet.tsx`

**Purpose**: Reusable bottom sheet wrapper component

**Props**:
```typescript
interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints: string[];          // e.g., ["50%", "90%"]
  onClose: () => void;
  index?: number;                 // Initial snap point index
  enablePanDownToClose?: boolean; // Default true
}
```

**Behavior**:
- Wraps @gorhom/bottom-sheet's BottomSheetModal
- Handles backdrop tap to close
- Keyboard-aware (moves up when keyboard appears)
- Gesture-driven dismiss via swipe

**Styling**:
- Background: `bg-card`
- Handle bar: `bg-border` centered at top
- Border radius: 16dp top corners
- Shadow/elevation for depth

**Accessibility**:
- Role="dialog"
- Announce when opened/closed
- Focus trap when open

**Testing**:
- Opens and closes correctly
- Keyboard handling works
- Gesture dismissal works

---

## Home Screen Components

### HomeHeader

**Location**: `src/screens/home/components/home-header.tsx`

**Purpose**: Title and subtitle section for home screen

**Props**:
```typescript
interface HomeHeaderProps {
  // No props - static content
}
```

**Content**:
- Title: "Find the Best Stablecoin Yields"
- Subtitle: "Compare lending rates across DeFi protocols and maximize your returns"

**Behavior**:
- Static text display
- Responsive typography

**Styling**:
- Title: `text-3xl` (mobile), `text-4xl` (desktop), `font-bold`, `text-foreground`
- Subtitle: `text-base` (mobile), `text-lg` (desktop), `text-muted-foreground`
- Vertical spacing: 8dp between title and subtitle
- Margin bottom: 24dp
- Text centered

**Accessibility**:
- Title has heading level 1
- Subtitle has appropriate semantic tag

**Testing**:
- Renders correct text
- Typography scales responsively

---

### PoolListItem

**Location**: `src/screens/home/components/pool-list-item.tsx`

**Purpose**: Individual pool card in the list

**Props**:
```typescript
interface PoolListItemProps {
  pool: Pool;
  onPress: (pool: Pool) => void;
}
```

**Behavior**:
- Displays pool information (symbol, protocol, network, APY)
- Tappable - calls `onPress` when tapped
- Visual press feedback
- Wrapped with `React.memo` for performance

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ [Icon]  Symbol       Protocol      APY%         │
│         • Network    Network       "Best APY"   │
└─────────────────────────────────────────────────┘
```

**Styling**:
- Height: ~125dp (measured for estimatedItemSize)
- Padding: 16dp horizontal, 12dp vertical
- Background: `bg-card`
- Border radius: 8dp
- Shadow: Small elevation
- Margin bottom: 8dp (separator)
- Press state: `bg-accent` overlay

**Icon**:
- Size: 60dp circular
- Background: `bg-primary/10` (light green tint)
- Symbol text: `text-primary`, `text-lg`, `font-semibold`

**Typography**:
- Protocol: `text-lg`, `font-semibold`, `text-foreground`
- Network: `text-sm`, `text-muted-foreground`, bullet prefix
- APY: `text-2xl`, `font-bold`, `text-green-600`
- "Best APY": `text-xs`, `text-muted-foreground`

**Accessibility**:
- Role="button"
- Label: "{symbol} on {protocol} via {network}, {apy}% APY"
- Minimum touch target: 44dp

**Testing**:
- Renders pool data correctly
- Formats APY to 2 decimals
- Calls onPress when tapped
- Re-renders only when pool prop changes (memo test)

---

### FilterButton

**Location**: `src/screens/home/components/filter-button.tsx`

**Purpose**: Button to open filter selection UI

**Implementation**: Uses core `Button` component from `@/components/core/button` with custom variant styling

**Props**:
```typescript
interface FilterButtonProps {
  label: 'Network' | 'Protocol';
  activeFilter: string | null;    // Current filter value or null
  onPress: () => void;
  count?: number;                  // Optional: number of active filters
}
```

**Behavior**:
- Wraps core Button component with filter-specific logic
- Shows filter label with filter icon
- Indicates if filter is active (visual state via variant)
- Opens filter UI when pressed
- Shows count badge if provided (desktop multi-select future)

**Styling**:
- Uses Button component with custom className
- Height: 40dp
- Padding: 12dp horizontal
- Background: `bg-card` (inactive), `bg-primary` (active)
- Border: 1dp solid `border` (inactive), none (active)
- Border radius: 20dp (pill shape)
- Icon: Filter icon from lucide-react-native, `text-foreground` (inactive), `text-primary-foreground` (active)
- Text: Uses core Text component, `text-sm`, same colors as icon

**Active State**:
- Apply different className when activeFilter is not null
- Background changes to `bg-primary`
- Text changes to `text-primary-foreground`
- Count badge shows if count > 0

**Accessibility**:
- Inherited from core Button (role="button")
- accessibilityLabel: "{label} filter" + (active: ", {activeFilter} selected")
- Minimum touch target: 44dp (enforced by Button)

**Testing**:
- Renders label correctly
- Shows active state when filter applied
- Calls onPress when tapped
- Uses core Button component

---

### FilterBottomSheet

**Location**: `src/screens/home/components/filter-bottom-sheet.tsx`

**Purpose**: Bottom sheet for selecting filters on mobile

**Props**:
```typescript
interface FilterBottomSheetProps {
  filterType: 'network' | 'protocol';
  options: string[];               // Available filter options
  selectedValue: string | null;    // Currently selected filter
  onSelect: (value: string | null) => void;
  onClose: () => void;
}
```

**Behavior**:
- Displays list of filter options
- Shows checkmark next to selected option
- Tapping option selects it and closes sheet
- "All" option to clear filter
- Uses reusable `<BottomSheet />` wrapper

**Layout**:
- Snap points: ["50%", "75%"]
- Scrollable list of options
- "All" option always at top
- Options sorted alphabetically

**Styling**:
- Option height: 48dp
- Option padding: 16dp horizontal
- Option background: transparent, `bg-accent` when pressed
- Selected option: Checkmark icon, `text-primary`
- Text: `text-base`, `text-foreground`

**Accessibility**:
- Role="menu"
- Each option: role="menuitemradio", checked state
- Keyboard navigation support

**Testing**:
- Displays all options
- Shows selected option with checkmark
- Calls onSelect with correct value
- "All" option clears filter
- Closes after selection

---

### FilterDropdown

**Location**: `src/screens/home/components/filter-dropdown.tsx`

**Purpose**: Dropdown menu for selecting filters on desktop/tablet

**Props**:
```typescript
interface FilterDropdownProps {
  label: 'Network' | 'Protocol';
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
}
```

**Behavior**:
- Displays trigger button (like FilterButton)
- Opens dropdown menu on click
- Shows list of options with "All" at top
- Closes on selection or outside click

**Layout**:
- Dropdown positioned below trigger
- Max height: 300dp (scrollable if needed)
- Width matches trigger button or wider

**Styling**:
- Dropdown background: `bg-card`
- Border: 1dp solid `border`
- Border radius: 8dp
- Shadow: Medium elevation
- Option styling same as FilterBottomSheet

**Accessibility**:
- Role="combobox"
- aria-expanded state
- Keyboard navigation (arrow keys, Enter, Escape)

**Testing**:
- Opens on click
- Displays options
- Selects value on click
- Closes after selection

---

### PaginationControls

**Location**: `src/screens/home/components/pagination-controls.tsx`

**Purpose**: Numbered pagination controls for desktop/tablet

**Implementation**: Uses core `Button` and `Text` components

**Props**:
```typescript
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

**Behavior**:
- Shows page numbers (max 7 visible: 1 ... 4 5 6 ... 10)
- Previous/Next buttons using core Button component
- Disabled state when on first/last page
- Clicking page number jumps to that page

**Layout**:
```
[<] [1] ... [4] [5] [6] ... [10] [>]
```

**Styling**:
- All buttons use core Button component with custom className
- Height: 40dp per button
- Padding: 8dp horizontal per number
- Background: `bg-card` (inactive), `bg-primary` (current page)
- Border radius: 4dp
- Text: Uses core Text component, `text-sm`, `text-foreground` (inactive), `text-primary-foreground` (current)
- Disabled: `disabled` prop on Button, `opacity-50` applied automatically

**Ellipsis Logic**:
- Show first page always
- Show last page always
- Show current page and ±1 pages around it
- Show ellipsis (...) rendered as core Text (not button)

**Accessibility**:
- Container: accessibilityRole="navigation", accessibilityLabel="Pagination"
- Each button: Inherited from core Button, accessibilityLabel="Go to page {n}"
- Current page: aria-current="page" or accessibilityState={{ selected: true }}
- Disabled buttons: Inherited disabled state from core Button

**Testing**:
- Renders correct page numbers
- Ellipsis appears correctly
- Calls onPageChange with correct page
- Disables Previous on page 1
- Disables Next on last page
- All buttons use core Button component

---

### EmptyState

**Location**: `src/screens/home/components/empty-state.tsx`

**Purpose**: Message displayed when no results are available

**Implementation**: Uses core `Text` and `Button` components

**Props**:
```typescript
interface EmptyStateProps {
  message: string;
  showClearFilters?: boolean;
  onClearFilters?: () => void;
}
```

**Behavior**:
- Displays centered message using core Text component
- Optionally shows "Clear Filters" button using core Button component
- Calls onClearFilters when button pressed

**Messages**:
- No data: "No stablecoin pools available"
- No filtered results: "No stablecoins found for selected filters"

**Styling**:
- Centered in container (flex center)
- Icon: Large filter/search icon from lucide-react-native, `text-muted-foreground`
- Message: Uses core Text component with `text-lg`, `text-muted-foreground`, centered
- Button: Uses core Button component with default variant (primary style)

**Accessibility**:
- Container: accessibilityRole="status"
- Text: Uses core Text accessibility
- Button: Inherited from core Button (role="button"), accessibilityLabel="Clear filters"

**Testing**:
- Renders message
- Shows button when showClearFilters=true
- Calls onClearFilters when button clicked

---

## Hook Contracts

### useFilteredPools

**Location**: `src/screens/home/hooks/use-filtered-pools.ts`

**Purpose**: Manages filter state and returns filtered pool data

**Interface**:
```typescript
export function useFilteredPools(pools: Pool[]) {
  return {
    filteredPools: Pool[];
    filterOptions: FilterOptions;
    networkFilter: string | null;
    protocolFilter: string | null;
    setNetworkFilter: (value: string | null) => void;
    setProtocolFilter: (value: string | null) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
  };
}
```

**Behavior**:
- Extracts unique networks and protocols from pools
- Applies filters with AND logic
- Sorts filtered results by APY descending
- Memoizes computations

**Testing**:
- Filters by network correctly
- Filters by protocol correctly
- Combines filters with AND logic
- Clears filters correctly
- Returns correct filter options

---

### useInfiniteScroll

**Location**: `src/screens/home/hooks/use-infinite-scroll.ts`

**Purpose**: Manages infinite scroll pagination state for mobile

**Interface**:
```typescript
export function useInfiniteScroll(items: Pool[], itemsPerPage: number = 24) {
  return {
    displayedItems: Pool[];
    currentPage: number;
    hasMore: boolean;
    isLoadingMore: boolean;
    loadMore: () => void;
    reset: () => void;
  };
}
```

**Behavior**:
- Returns items 0 to (currentPage * itemsPerPage)
- `loadMore` increments page
- `hasMore` indicates if more items available
- `isLoadingMore` prevents duplicate calls
- `reset` returns to page 1

**Testing**:
- Initial state shows first 24 items
- loadMore adds next 24 items
- hasMore is false at end
- reset returns to page 1
- Prevents duplicate loadMore calls

---

### useNumberedPagination

**Location**: `src/screens/home/hooks/use-numbered-pagination.ts`

**Purpose**: Manages numbered pagination state for desktop/tablet

**Interface**:
```typescript
export function useNumberedPagination(items: Pool[], itemsPerPage: number = 24) {
  return {
    pageItems: Pool[];
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    canGoNext: boolean;
    canGoPrev: boolean;
  };
}
```

**Behavior**:
- Returns items for current page only
- Validates page number (1 to totalPages)
- Calculates totalPages from items length
- Prevents going beyond bounds

**Testing**:
- Returns correct page items
- Calculates totalPages correctly
- goToPage changes page
- nextPage/prevPage navigate correctly
- canGoNext/canGoPrev reflect boundaries
- Invalid page numbers handled gracefully

---

### useDeviceLayout

**Location**: `src/screens/home/hooks/use-device-layout.ts`

**Purpose**: Determines device layout classification

**Interface**:
```typescript
export function useDeviceLayout() {
  return {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    width: number;
    height: number;
  };
}
```

**Behavior**:
- Uses `useWindowDimensions()` hook
- Classifies based on width breakpoints
- Updates on orientation change

**Testing**:
- Classifies mobile correctly (< 768)
- Classifies tablet correctly (768-1023)
- Classifies desktop correctly (>= 1024)
- Updates when dimensions change

---

## Reusable Component Patterns

### Memoization Pattern
```typescript
export const PoolListItem = React.memo(function PoolListItem({ pool, onPress }: PoolListItemProps) {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if pool.id changes
  return prevProps.pool.id === nextProps.pool.id;
});
```

### Callback Stabilization Pattern
```typescript
const handlePress = useCallback((pool: Pool) => {
  // Navigate to detail screen (future)
  console.log('Pool pressed:', pool.id);
}, []); // Empty deps if no external values needed
```

### Computed Value Pattern
```typescript
const displayedPools = useMemo(() => {
  return filteredPools.slice(0, currentPage * 24);
}, [filteredPools, currentPage]);
```

## Core Components

### Loading

**Location**: `src/components/core/loading.tsx`

**Purpose**: Reusable loading spinner component following react-native-reusables patterns

**Props**:
```typescript
interface LoadingProps {
  size?: 'small' | 'large';  // Default 'large'
  className?: string;         // Optional styling
}
```

**Behavior**:
- Displays centered ActivityIndicator with consistent styling
- Wraps ActivityIndicator with themed colors
- Used in Suspense fallbacks and loading states

**Styling**:
- Centered in container (flex-1, justify-center, items-center)
- Background: `bg-background`
- Spinner color: `text-primary` (uses theme color)
- Size: 'small' (20dp) or 'large' (36dp)

**Accessibility**:
- accessibilityLabel: "Loading"
- accessibilityRole: "progressbar"

**Testing**:
- Renders correctly
- Respects size prop
- Uses theme colors

---

## Error Boundary Integration

### ErrorBoundary Wrapper

**Location**: Root of HomeScreen

**Behavior**:
- Catches errors from child components
- Displays error UI with retry button
- Uses React Query's `QueryErrorResetBoundary`

**Error UI**:
- Message: "Something went wrong loading pools"
- Retry button: Resets query and retries fetch
- Fallback for network errors, API errors

**Testing**:
- Catches rendering errors
- Catches query errors
- Retry button works

---

## Next Steps

- ✅ Component contracts defined
- ⏭️ Create implementation quickstart guide
- ⏭️ Update agent context
