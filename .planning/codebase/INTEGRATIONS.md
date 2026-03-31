# External Integrations

**Analysis Date:** 2026-03-30

## APIs & External Services

**DeFi Data:**
- **DefiLlama API** - DeFi yield/pool data aggregation
  - SDK/Client: Axios instance (`src/infra/http/clients/defi-llama-http-client.ts`)
  - Base URL env var: `EXPO_PUBLIC_DEFILLAMA_BASE_API_URL`
  - Timeout: 15,000ms
  - Headers: `Content-Type: application/json`
  - Endpoints used: `/pools` (fetches all pool data)

## HTTP Architecture

**Client Interface:**
- `src/infra/http/http-client.ts` defines `HttpClient` interface with `get`, `post`, `put`, `delete` methods
- Concrete clients are Axios instances that satisfy this interface
- Client instances exported from `src/infra/http/clients/index.ts`

**Repository Pattern:**
- `src/infra/repositories/http-repository/pool/http-pool-repo.ts` - `HttpPoolRepo` implements `PoolRepo` domain interface
- Accepts `HttpClient` via constructor injection
- Uses `src/infra/repositories/http-repository/pool/pool-adapter.ts` to transform DTOs to domain entities
- DTO types defined in `src/infra/repositories/http-repository/pool/pool-dto.ts`

**Dependency Injection:**
- `src/infra/repositories/repository-provider.tsx` - React Context provider for all repositories
- Repositories registered in `src/domain/repositories.ts` (currently only `poolRepo: PoolRepo`)
- Consumed via `useRepository()` hook in presentation layer

## Data Storage

**Databases:**
- None. React Query in-memory cache is the sole data persistence layer (MVP approach).

**File Storage:**
- Local assets only (`src/assets/images/`)
- No remote file storage integration

**Caching:**
- React Query v5 in-memory cache
- Configured per-query via `useAppQuery` and `useAppSuspenseQuery` wrappers (`src/infra/use-cases/`)
- No persistent cache (data refetched on app restart)

## Authentication & Identity

**Auth Provider:**
- None. No authentication system implemented.
- No auth-related packages in dependencies
- No auth repository in `src/domain/repositories.ts`

## Monitoring & Observability

**Error Tracking:**
- None. No Sentry, Bugsnag, or similar service integrated.

**Logs:**
- Console only. No structured logging framework.

**Analytics:**
- None. No analytics SDK integrated.

## CI/CD & Deployment

**Hosting:**
- EAS (Expo Application Services) configured
  - Project ID: `5a85ba39-4794-462c-91b7-1ddc9b59e1c9` (in `app.config.js`)
- No `eas.json` detected (EAS Build profiles not yet configured)

**CI Pipeline:**
- Not detected. No GitHub Actions, CircleCI, or similar CI config files found.

## Environment Configuration

**Required env vars:**
- `EXPO_PUBLIC_DEFILLAMA_BASE_API_URL` - Base URL for DefiLlama API

**Env var flow:**
1. Defined in `.env` file (gitignored)
2. Template in `.env.example`
3. Passed through `app.config.js` via `process.env` into `extra` block
4. Read at runtime in `src/config/env.ts` via `expo-constants` (`Constants.expoConfig.extra`)
5. Consumed by HTTP clients (e.g., `src/infra/http/clients/defi-llama-http-client.ts`)

**Secrets location:**
- `.env` file (gitignored, not committed)
- No secrets management service (no Vault, AWS SSM, etc.)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Integration Summary

This is a read-only client application with a single external API integration (DefiLlama). All data flows are:
1. App requests pool data from DefiLlama API via Axios
2. Response DTOs are adapted to domain entities via adapter functions
3. Data is cached in React Query's in-memory store
4. No write operations, authentication, or bidirectional communication

**Adding a new API integration:**
1. Create HTTP client instance in `src/infra/http/clients/` using Axios
2. Add env var to `src/config/env.ts` and `app.config.js`
3. Define domain entity in `src/domain/[feature]/`
4. Define repo interface in `src/domain/[feature]/[feature]-repo.ts`
5. Implement HTTP repo in `src/infra/repositories/http-repository/[feature]/`
6. Create DTO types and adapter in same directory
7. Register in `src/domain/repositories.ts` interface
8. Provide implementation in `RepositoryProvider`

---

*Integration audit: 2026-03-30*
