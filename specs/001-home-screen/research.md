# Research: Home Screen Technologies

**Date**: 2026-02-05
**Feature**: Home Screen (001-home-screen)

## Overview

This document consolidates research findings for implementing the home screen with FlashList virtualization, @gorhom/bottom-sheet filtering, client-side pagination, React Suspense integration, and responsive design patterns.

## Key Technology Decisions

### 1. FlashList for List Virtualization

**Decision**: Use `@shopify/flash-list` for rendering the stablecoin list

**Rationale**:
- Superior performance over FlatList through component recycling mechanism
- Reduces JavaScript bridge overhead by recycling component instances instead of destroying/recreating
- Achieves 60 FPS scrolling for large lists (100+ items)
- Proven production use at scale (Shopify, Amazon)
- Native support in React Native ecosystem

**Implementation Requirements**:
- Install: `bun add @shopify/flash-list`
- Remove all `key` props from item components to enable recycling
- Provide accurate `estimatedItemSize` based on measured item heights
- Wrap item components with `React.memo` to prevent unnecessary re-renders
- Use `useCallback` for event handlers passed to items
- Avoid inline object/array creation in render for props

**Estimated Item Size Calculation**:
Based on design references, each pool card contains:
- Stablecoin icon/badge: ~60dp circular
- Text content (symbol, protocol, network): ~40dp height
- APY percentage: ~24dp height (larger font)
- Padding: 16dp vertical (8dp top + 8dp bottom)
- Separator: 1dp
- Total: ~125dp per item on mobile, ~100dp on tablet/desktop (more horizontal space)

**Alternatives Considered**:
- FlatList: Standard but worse performance for large lists, no recycling
- VirtualizedList: Lower-level API, more complex to configure
- ScrollView with map: No virtualization, poor performance for >50 items

### 2. @gorhom/bottom-sheet for Mobile Filters

**Decision**: Use `@gorhom/bottom-sheet` v5 for mobile filter UI

**Rationale**:
- Native gesture-driven UX matching iOS/Android platform conventions
- Built on React Native Reanimated v3 and Gesture Handler v2 (compatible with Expo SDK 54)
- Smooth 60 FPS animations running on the native thread
- Supports keyboard handling for text inputs within sheets
- Production-proven, actively maintained

**Implementation Requirements**:
- Install: `bun add @gorhom/react-native-bottom-sheet`
- Wrap app root with `GestureHandlerRootView` from `react-native-gesture-handler`
- Add `PortalHost` to root layout (already configured in project)
- Create reusable `BottomSheet` wrapper component in `src/components/bottom-sheet.tsx`
- Use `BottomSheetScrollView` or `BottomSheetFlashList` for scrollable content within sheet
- Configure snap points (e.g., `["25%", "50%", "90%"]`) for different sheet heights
- Set `keyboardBehavior="interactive"` for text input support
- Use `keyboardBlurBehavior="restore"` to return to previous snap point

**Gesture Handling**:
- Gesture Handler v2's `Exclusive` composition prevents conflicts between sheet pan and internal scroll
- Bottom sheet pan gesture only activates when not scrolling internal content
- Smooth dismissal via swipe down gesture

**Alternatives Considered**:
- Modal component: Less native feel, no gesture-driven interaction
- Custom animated implementation: Reinventing wheel, performance concerns
- React Native Modal + PanResponder: Legacy API, worse performance

### 3. Client-Side Pagination Strategies

**Decision**: Implement dual pagination strategies based on device type:
- Mobile (width < 768dp): Infinite scroll with FlashList `onEndReached`
- Tablet/Desktop (width >= 768dp): Numbered pagination with page controls

**Rationale**:
- Mobile users expect continuous scrolling, minimal interaction
- Desktop/tablet users prefer direct page navigation, overview of total pages
- API doesn't support server-side pagination, all filtering/pagination must be client-side
- 24 items per page matches design spec and provides good UX balance

**Mobile Infinite Scroll Implementation**:
- Use `onEndReached` callback with `onEndReachedThreshold={0.5}`
- Maintain pagination state: `currentPage`, `isLoadingMore`, `hasMore`
- Slice data array to show items 0 to (currentPage * 24)
- Show loading indicator at list bottom when fetching next page
- Prevent duplicate requests by checking `isLoadingMore` flag
- Reset to page 1 when filters change

**Desktop/Tablet Numbered Pagination Implementation**:
- Calculate total pages: `Math.ceil(filteredItems.length / 24)`
- Display page numbers with Previous/Next buttons
- Slice data array: `filteredItems.slice((currentPage - 1) * 24, currentPage * 24)`
- Use `scrollToIndex` or `scrollToOffset` to return to top when page changes
- Show pagination controls below list
- Reset to page 1 when filters change

**Responsive Detection**:
- Use `useWindowDimensions()` hook to get viewport width
- Define breakpoint: `isMobile = width < 768`
- Re-evaluate on orientation change (automatic with hook)

**Alternatives Considered**:
- Single pagination strategy for all devices: Poor UX, doesn't match platform expectations
- Cursor-based pagination: Unnecessary complexity for client-side implementation
- Server-side pagination: Not supported by API, out of scope

### 4. React Suspense + React Query Integration

**Decision**: Use React Query's `useSuspenseQuery` with Suspense boundaries for loading states

**Rationale**:
- React 19.1.0 has mature Suspense support
- Declarative loading states reduce boilerplate
- Automatic error boundary integration
- React Query v5 provides dedicated `useSuspenseQuery` hook
- Consistent with project's use of `useAppQuery` wrapper

**Implementation Pattern**:
1. Create `useAppSuspenseQuery` wrapper in `src/infra/use-cases/use-app-suspense-query.ts`
2. Wrap home screen content with `<Suspense fallback={<LoadingSpinner />}>`
3. Use `QueryErrorResetBoundary` + `ErrorBoundary` for error handling
4. Initial data fetch suspends and shows loading state
5. Background refetches don't suspend (use `isRefetching` for subtle indicator)

**React 19 Considerations**:
- React 19 renders siblings sequentially within Suspense boundaries
- To avoid waterfalls, prefetch data before rendering if needed
- For this feature, single query for all pools, so no waterfall concern
- Filter/sort operations happen synchronously on client after fetch completes

**Loading States Strategy**:
- Initial load: Full-screen Suspense boundary with loading indicator
- Filter changes: No suspension, immediate client-side update
- Pagination: No suspension for infinite scroll, immediate slicing
- Background refresh: Subtle indicator in header, don't disrupt viewing

**Alternatives Considered**:
- Manual loading states with `useQuery`: More boilerplate, less declarative
- No Suspense, always show loading flags: Inconsistent UX, more conditional rendering
- `useSuspenseInfiniteQuery`: Not needed, pagination is client-side

### 5. Client-Side Filtering Implementation

**Decision**: Implement filtering with `useMemo` for computed filtered results

**Rationale**:
- All pool data fetched once, filtering applies in memory
- `useMemo` prevents recomputation on unrelated renders
- Dependency array `[pools, networkFilter, protocolFilter]` ensures recomputation only when needed
- Filters use simple array `.filter()` with AND logic for multiple filters

**Filter Logic**:
```typescript
const filteredPools = useMemo(() => {
  let result = pools;

  if (networkFilter) {
    result = result.filter(pool => pool.chain === networkFilter);
  }

  if (protocolFilter) {
    result = result.filter(pool => pool.project === protocolFilter);
  }

  return result;
}, [pools, networkFilter, protocolFilter]);
```

**Filter Options Extraction**:
- Extract unique networks: `[...new Set(pools.map(p => p.chain))].sort()`
- Extract unique protocols: `[...new Set(pools.map(p => p.project))].sort()`
- Compute once in `useMemo` to avoid recomputation

**Filter State Management**:
- Local `useState` for `networkFilter` and `protocolFilter` (values are strings or null)
- Reset pagination to page 1 when filters change
- Clear individual filters or all filters at once

**Alternatives Considered**:
- Query key composition with React Query: Unnecessary complexity for client-side filtering
- Multiple queries with different filters: Wasteful, defeats purpose of client-side filtering
- Context API for filter state: Overkill, local state sufficient

### 6. Responsive Design Patterns

**Decision**: Use `useWindowDimensions` + conditional rendering for device-specific layouts

**Rationale**:
- React Native's Flexbox provides foundation for adaptive layouts
- `useWindowDimensions` gives runtime viewport dimensions
- Breakpoints match common device categories
- Platform-specific adjustments with `Platform.OS` when needed

**Breakpoints**:
- Mobile: width < 768dp (iPhone, Android phones)
- Tablet: 768dp <= width < 1024dp (iPad, Android tablets)
- Desktop: width >= 1024dp (larger tablets, web)

**Layout Adaptations**:
- **Header**: Full width, responsive padding (16dp mobile, 24dp tablet, 32dp desktop)
- **Filters**: Bottom sheet on mobile, dropdown menus on tablet/desktop
- **List**: Single column all devices, but item width constrained on desktop (max-width: 800dp centered)
- **Pagination**: Infinite scroll mobile, numbered pagination tablet/desktop
- **Typography**: Responsive font scaling via NativeWind (text-base, text-lg, text-xl)

**Implementation**:
```typescript
const { width } = useWindowDimensions();
const isMobile = width < 768;
const isTablet = width >= 768 && width < 1024;
const isDesktop = width >= 1024;
```

**Alternatives Considered**:
- Fixed layouts: Poor UX, doesn't adapt to devices
- CSS media queries: Not available in React Native (web only)
- Separate codebases per platform: Wasteful, defeats cross-platform purpose

## Design Reference Images

The following images are design references for visual validation:

- `phone.png`: Mobile layout (320-428px width) - infinite scroll, bottom sheet filters
- `tablet.png`: Tablet layout (768-1024px width) - numbered pagination, dropdown filters
- `desktop.png`: Desktop layout (1280px+ width) - numbered pagination, expanded controls
- `desktop-with-filters.png`: Desktop with active filters showing filter chips and clear button

These images should be used during implementation and iOS simulator testing to validate the UI matches the intended design.

## Implementation Risks and Mitigations

### Risk 1: FlashList Performance Degradation
**Risk**: Incorrect `estimatedItemSize` or item keys cause performance issues
**Mitigation**:
- Measure actual rendered item height on reference device
- Remove all keys from item components
- Profile with React DevTools in production build
- Use `React.memo` on item components

### Risk 2: Bottom Sheet Gesture Conflicts
**Risk**: Scroll gestures within bottom sheet conflict with sheet pan gesture
**Mitigation**:
- Use `BottomSheetScrollView` or `BottomSheetFlashList` (handles gesture composition)
- Ensure `GestureHandlerRootView` wraps entire app
- Test on physical devices (gestures behave differently than simulator)

### Risk 3: React 19 Suspense Waterfalls
**Risk**: Sequential rendering causes delayed data fetching
**Mitigation**:
- Single query for all pools (no parallel query concern)
- Prefetch on navigation if waterfalls appear
- Monitor with React DevTools Profiler

### Risk 4: Client-Side Filtering Performance
**Risk**: Filtering 100+ items on every render causes frame drops
**Mitigation**:
- Use `useMemo` with proper dependencies
- Profile filtering performance with large datasets
- Consider Web Workers for heavy filtering (future optimization if needed)

### Risk 5: Pagination State Bugs
**Risk**: Pagination state out of sync with filters, causing incorrect data display
**Mitigation**:
- Reset pagination to page 1 whenever filters change
- Comprehensive unit tests for pagination hooks
- Integration tests covering filter + pagination interaction

## Technology Versions

**Confirmed Compatibility Matrix**:

| Package | Version | Notes |
|---------|---------|-------|
| Expo SDK | 54.0.13 | Current project version |
| React | 19.1.0 | React 19 stable, Suspense mature |
| React Native | 0.81.4 | Bundled with Expo SDK 54 |
| @tanstack/react-query | 5.90.10 | Already installed, v5 supports React 19 |
| @shopify/flash-list | Latest (3.x) | Need to install |
| @gorhom/react-native-bottom-sheet | Latest (5.x) | Need to install, Reanimated v3 compatible |
| react-native-reanimated | 4.1.1 | Already installed |
| react-native-gesture-handler | 2.28.0 | Already installed |

**Installation Commands**:
```bash
bun add @shopify/flash-list
bun add @gorhom/react-native-bottom-sheet
```

## Next Steps (Phase 1)

1. ✅ Research complete
2. ⏭️ Define data model and transformations (`data-model.md`)
3. ⏭️ Document component interfaces (`contracts/`)
4. ⏭️ Create implementation quickstart guide (`quickstart.md`)
5. ⏭️ Update agent context with new technologies
6. ⏭️ Re-check constitution compliance post-design

## References

- FlashList Documentation: https://shopify.github.io/flash-list/
- @gorhom/bottom-sheet Documentation: https://gorhom.github.io/react-native-bottom-sheet/
- TanStack Query Suspense Guide: https://tanstack.com/query/v5/docs/react/guides/suspense
- React 19 Suspense Changes: https://tkdodo.eu/blog/react-19-and-suspense-a-drama-in-3-acts
- Expo SDK 54 Changelog: https://expo.dev/changelog/sdk-54
- Perplexity Research Output: Stored in planning session context
