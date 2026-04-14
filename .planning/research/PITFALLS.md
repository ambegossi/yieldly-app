# Pitfalls Research: Pool Details Screen

## 1. Victory Native + Expo New Architecture Compatibility

**Risk:** HIGH
**Warning signs:** Build errors, blank charts, Skia crashes on startup
**Prevention:**
- Verify `victory-native` and `@shopify/react-native-skia` versions are compatible with Expo SDK 54 + new arch
- Test chart rendering on both iOS and Android early
- May need Expo dev client (not Expo Go) for Skia native modules
**Phase:** Chart integration

## 2. Large API Response (1000+ data points)

**Risk:** MEDIUM
**Warning signs:** Slow chart rendering, memory spikes, janky scrolling
**Prevention:**
- Filter to last 30 data points client-side in the adapter layer (not in the component)
- Don't pass 1000+ points to Victory Native
- Memoize filtered data
**Phase:** Infrastructure/adapter

## 3. Chart Re-renders on Navigation

**Risk:** MEDIUM
**Warning signs:** Chart flickers when navigating back and forth, unnecessary API calls
**Prevention:**
- React Query cache will prevent refetching (staleTime)
- Use appropriate `staleTime` for APY history (data is daily, 5-10 min stale is fine)
- Ensure chart component is properly memoized
**Phase:** Use case hook setup

## 4. Pool ID Not Found in Cache

**Risk:** LOW
**Warning signs:** Pool details shows blank/error when accessed directly (deep link)
**Prevention:**
- Don't rely solely on pool list cache for pool details
- Either: fetch pool from list if not cached, or accept loading state
- For v1: assume navigation always comes from home screen (pool is cached)
**Phase:** Screen implementation

## 5. Victory Native Testing in Jest

**Risk:** HIGH
**Warning signs:** Jest crashes on import, "cannot find module" errors for Skia
**Prevention:**
- Mock Victory Native components in tests (similar to FlashList pattern)
- Don't test chart rendering in unit tests — test data transformation instead
- `jest.mock("victory-native", () => ({ CartesianChart: jest.fn(() => null), Line: jest.fn(() => null) }))`
**Phase:** Testing

## 6. Expo Go Incompatibility

**Risk:** HIGH
**Warning signs:** App crashes on launch after adding Skia
**Prevention:**
- `@shopify/react-native-skia` requires native modules — won't work in Expo Go
- Must use Expo Dev Client for development
- Document this in setup instructions
**Phase:** Stack setup (first thing)

## 7. Date Formatting on Chart Axis

**Risk:** LOW
**Warning signs:** Dates overlap, wrong timezone, inconsistent format
**Prevention:**
- Format dates simply (e.g., "Mar 2", "Mar 13")
- Limit number of X-axis labels (5-6 max on mobile, more on desktop)
- Use consistent date formatting utility
**Phase:** Chart component
