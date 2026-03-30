# Codebase Concerns

**Analysis Date:** 2026-03-30

## Tech Debt

**`any` types in HttpClient interface:**
- Issue: The `HttpClient` interface uses `any` for `config` and `data` parameters across all methods
- Files: `src/infra/http/http-client.ts`
- Impact: Loses type safety at the HTTP layer boundary; callers can pass arbitrary config/data without type checking
- Fix approach: Replace `any` with proper generic types or typed config interfaces (e.g., `AxiosRequestConfig` or a custom abstraction)

**No-op `onClose` callbacks in FilterBottomSheet usage:**
- Issue: `onClose={() => {}}` passed to both `FilterBottomSheet` instances, indicating the prop may be unnecessary or the close behavior is unhandled
- Files: `src/screens/home/index.tsx` (lines 170, 179)
- Impact: Low - cosmetic/maintenance concern. If close behavior is needed later, it is silently ignored now
- Fix approach: Either make `onClose` optional in `FilterBottomSheet` or implement meaningful close handling

**RepositoryContext initialized with empty cast:**
- Issue: `React.createContext<Repositories>({} as Repositories)` uses an unsafe cast for the default context value
- Files: `src/infra/repositories/repository-provider.tsx` (line 4)
- Impact: If a component uses `useRepository()` outside of `RepositoryProvider`, it gets an empty object with no runtime error until a method is called. Could cause confusing crashes
- Fix approach: Use `null` as default and throw a descriptive error in `useRepository()` when context is null

**`isLoadingMore` hardcoded to `false`:**
- Issue: `useInfiniteScroll` returns `isLoadingMore: false` as a static value - this is a stub
- Files: `src/screens/home/hooks/use-infinite-scroll.ts` (line 32)
- Impact: No loading indicator during infinite scroll pagination. Minor UX issue since data is already loaded client-side
- Fix approach: Remove the property or implement actual loading state when server-side pagination is added

**Pool detail navigation is a stub (Alert):**
- Issue: `handlePoolPress` shows an `Alert.alert("Details coming soon")` instead of navigating to a detail screen
- Files: `src/screens/home/index.tsx` (lines 54-56)
- Impact: Core feature is not implemented; pool detail screen does not exist yet
- Fix approach: Create pool detail screen at `src/screens/pool-details/` and route at `src/app/pool/[id].tsx`

**Client-side filtering on full dataset:**
- Issue: All pools are fetched in a single API call (`findAll`), then filtered and paginated client-side using `useMemo`
- Files: `src/domain/pool/pool-repo.ts`, `src/screens/home/hooks/use-filtered-pools.ts`, `src/screens/home/hooks/use-infinite-scroll.ts`
- Impact: Works for MVP, but will degrade with large datasets. The entire pool list from DefiLlama is loaded into memory and sorted/filtered on every render cycle
- Fix approach: Add server-side filtering/pagination parameters to `PoolRepo.findAll()` when data volume grows

**Env config lacks runtime validation:**
- Issue: `getEnv()` only checks if `extra` exists but does not validate that `EXPO_PUBLIC_DEFILLAMA_BASE_API_URL` is a non-empty string
- Files: `src/config/env.ts`
- Impact: If the env var is missing, the app creates an axios client with `undefined` baseURL, leading to cryptic network errors
- Fix approach: Add validation that required env vars are defined and non-empty, throw descriptive errors

## Known Bugs

No bugs detected in the current codebase.

## Security Considerations

**`.env` not fully gitignored:**
- Risk: `.gitignore` only excludes `.env*.local` files, but `.env` itself is NOT gitignored. The `.env` file exists in the repo root
- Files: `.gitignore` (line 34), `.env`
- Current mitigation: The `.env` currently only contains a public API URL (not a secret)
- Recommendations: Add `.env` to `.gitignore` to prevent accidental secret leaks as the app grows. Use `.env.example` (already exists) for documentation

**No HTTP error interceptor or auth layer:**
- Risk: The axios client has no request/response interceptors. When auth is added, there is no infrastructure for token injection or refresh
- Files: `src/infra/http/clients/defi-llama-http-client.ts`
- Current mitigation: Current API (DefiLlama) is public and requires no auth
- Recommendations: Add interceptor infrastructure before integrating authenticated APIs

**No input sanitization or response validation:**
- Risk: API response DTOs are trusted without runtime validation. Malformed API responses could crash the app
- Files: `src/infra/repositories/http-repository/pool/http-pool-repo.ts`, `src/infra/repositories/http-repository/pool/pool-dto.ts`
- Current mitigation: TypeScript provides compile-time safety but no runtime guarantees
- Recommendations: Add runtime validation with Zod or similar when integrating more APIs

## Performance Concerns

**Full dataset loaded into memory:**
- Problem: `HttpPoolRepo.findAll()` fetches the entire DefiLlama pools response (potentially thousands of records) in one request
- Files: `src/infra/repositories/http-repository/pool/http-pool-repo.ts`
- Cause: No pagination parameters in the API call; entire dataset mapped and held in React Query cache
- Improvement path: Implement cursor-based or offset pagination at the repository level when data grows

**Sorting on every filter change:**
- Problem: `useFilteredPools` creates a sorted copy of the full pool array via `[...pools].sort()` in a `useMemo` that depends on `pools`
- Files: `src/screens/home/hooks/use-filtered-pools.ts` (line 18-20)
- Cause: Re-sorts whenever pools reference changes (e.g., React Query refetch)
- Improvement path: Sort once at the adapter/repository level since APY sort order is the default

## Missing Infrastructure

**No CI/CD pipeline:**
- No `.github/` directory, no GitHub Actions, no CI configuration detected
- Tests, linting, and type-checking exist locally but are not enforced on PRs

**No error tracking or monitoring:**
- No Sentry, Bugsnag, or similar error reporting integration
- Production errors will be invisible

**No logging framework:**
- No `console.log` statements in source code (good), but also no structured logging
- No crash reporting for production builds

**No environment-specific configurations:**
- Single `.env` file with no staging/production differentiation
- No `app.config.ts` dynamic configuration for different environments

**No code coverage enforcement:**
- Coverage script exists (`bun run test:coverage`) but no threshold configured in Jest config
- No CI gate to prevent coverage regression

## Test Coverage Gaps

**No E2E tests:**
- What's not tested: Full user flows from app launch through navigation
- Risk: Integration between screens, routing, and deep linking untested
- Priority: Medium (single-screen app currently)

**No HTTP layer tests with real network mocking:**
- What's not tested: Actual axios behavior, request/response interceptors, timeout handling, network errors
- Files: `src/infra/http/clients/defi-llama-http-client.ts` has no tests
- Risk: HTTP configuration issues (timeout, headers, baseURL) only caught in production
- Priority: Medium

**No config/env tests:**
- What's not tested: `src/config/env.ts` - behavior when env vars are missing or malformed
- Risk: App could fail silently with incorrect configuration
- Priority: Low

## Dependencies at Risk

**`@testing-library/jest-native` v5:**
- Risk: This package is deprecated in favor of built-in matchers in `@testing-library/react-native` v12.4+
- Impact: Will stop receiving updates; migration needed eventually
- Migration plan: Remove `@testing-library/jest-native` and use built-in RNTL matchers

**React 19 + React Compiler (experimental):**
- Risk: React 19 and the React Compiler (`experiments.reactCompiler` in `app.json`) are relatively new; potential for undiscovered bugs
- Impact: Subtle rendering bugs possible, especially with memoization behavior changes
- Migration plan: Monitor React 19 stability; disable compiler if issues arise

**NativeWind v4:**
- Risk: NativeWind v4 is a major rewrite with different internals from v2. Some edge cases may exist
- Impact: Styling inconsistencies across platforms possible
- Migration plan: Stay on v4, report issues upstream

## Upgrade Paths

| Dependency | Current | Notes |
|------------|---------|-------|
| `@testing-library/jest-native` | 5.4.3 | Deprecated - migrate to RNTL built-in matchers |
| `react-native-web` | 0.21.0 | Check compatibility with React 19 |
| `tailwindcss` | 3.4.17 | Tailwind v4 available but NativeWind v4 depends on v3 |

---

*Concerns audit: 2026-03-30*
