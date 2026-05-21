# Yieldly Security Constitution

This file defines security rules for the Yieldly mobile client. Scope is **client-side essentials**: secrets, deep links, external links, build/signing, and dependency hygiene. Yieldly today has no user accounts, no authentication, and no PII collection — sections covering those concerns will be added when the relevant features are introduced (see §8).

Governance and amendment process for this file follow the same proposal-based policy as `.specify/memory/architecture_constitution.md` §10.

## 1. Trust Boundaries

Yieldly trusts and distrusts the following:

| Surface                                                         | Trust level              | Why                                                                                                                                                                                               |
| --------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The DefiLlama public API (`EXPO_PUBLIC_DEFILLAMA_BASE_API_URL`) | **Semi-trusted**         | Public, well-known source, but treat its responses as untrusted input: validate shapes via DTO adapters; clamp/sanitize anything rendered in UI; never `eval` or otherwise execute response data. |
| URLs embedded in API responses (e.g., pool platform URLs)       | **Untrusted**            | Always open in `expo-web-browser`, never auto-navigate, never trust the scheme blindly. See §4.                                                                                                   |
| Inbound `yieldly://` deep links                                 | **Untrusted**            | Treat payload as user-controlled input; validate every segment, reject unknown routes, never auto-execute side effects on link receipt. See §4.                                                   |
| Local app state and React Query cache                           | **Trusted** (in-process) | But it is **not** durable secure storage. Nothing requiring confidentiality may be persisted there.                                                                                               |
| The device OS and Expo runtime                                  | **Trusted**              | Standard mobile threat model. App is built on Expo SDK 54 with the new architecture enabled.                                                                                                      |

## 2. Authentication & Authorization Standards

Not applicable today. The app is anonymous and read-only. When auth is introduced, this section will be replaced with concrete rules before any code lands. See §8.

## 3. Secrets & Environment Variables

- **Two-tier env model:**
  - `EXPO_PUBLIC_*` — public, baked into the bundle, **visible to anyone with the IPA/APK**. Use only for non-sensitive values (public API URLs, feature flags). Currently: `EXPO_PUBLIC_DEFILLAMA_BASE_API_URL`.
  - Non-prefixed env vars — accessible to build tooling only, never embedded in the bundle. Use for any future API keys, signing material, or third-party secrets.
- **What MUST NOT be `EXPO_PUBLIC_*`:** API keys for any paid service, third-party tokens, signing certificates, feature flags with security implications, anything that grants elevated access.
- **`.env` files:** `.env` is git-ignored. `.env.example` is committed and lists every required variable with a placeholder value. The example file MUST NOT contain real secrets. Adding a new env var without updating `.env.example` is a review-blocking miss.
- **Reading env vars:** Access only through `src/config/env.ts`, which centralizes `Constants.expoConfig.extra` reads and provides typed access. Do not call `process.env.*` or `Constants.expoConfig.extra.*` from feature code directly.
- **EAS secrets** (build-time): Sensitive build-time values (signing material, store credentials, future API keys) live in EAS Secrets, not in the repo and not in CI logs. The EAS project ID itself (`5a85ba39-4794-462c-91b7-1ddc9b59e1c9`) is non-sensitive and may stay in `app.config.js`.

## 4. Deep Links & External Links

- **URL scheme:** Yieldly registers `yieldly://`. Every inbound deep link MUST go through a single dispatcher that:
  1. Validates the host/path against an allowlist of known routes.
  2. Validates and sanitizes every parameter (e.g., `poolId` must be a string of expected shape).
  3. Rejects unknown routes silently or with a generic in-app fallback — never throw user-visible stack traces.
  4. Performs **no** automatic side effects (no auto-favoriting, no auto-following) on link receipt. Side effects require an explicit user action after navigation.
- **External URLs (e.g., pool platform links):** Open via `expo-web-browser` (`openBrowserAsync`). Do **not** use `Linking.openURL` for arbitrary external URLs — it can launch non-browser handlers. Before opening:
  - Confirm the URL is `https:` (block `http:`, `javascript:`, `data:`, `file:`, and unknown schemes).
  - Display the destination to the user when the URL did not originate from a direct user interaction with that pool (defensive against UI redress).
- **No in-app WebView arbitrary content:** If a future feature must embed remote HTML, it goes through a hardened component reviewed under this section, not ad-hoc.

## 5. Secure-by-Design Patterns

- **Input handling:** Every user-controllable input (route params, deep link payloads, future text inputs) is treated as untrusted and validated at the entry point before reaching domain logic.
- **API response handling:** DTO adapters (`src/infra/repositories/http-repository/**/[feature]-adapter.ts`) are the boundary. Adapters MUST:
  - Default-safe: missing optional fields produce sane defaults, never `undefined`-pollute the domain entity.
  - Never trust a response field as HTML, executable content, or a navigation target without validation.
- **Error messages:** Errors surfaced to users are generic ("Couldn't load pool"). Detailed errors go to console/telemetry only — never echo raw HTTP bodies or stack traces in the UI.
- **No reflective code paths:** Do not use `new Function(...)`, `eval`, or dynamic `import()` with user/API-controlled strings.

## 6. API & Integration Security

- **TLS only:** All HTTP clients in `src/infra/http/clients/` MUST target `https://` URLs. Plain HTTP is rejected at config time (`src/config/env.ts` validates).
- **No client-side secrets in outbound requests:** Since `EXPO_PUBLIC_*` is bundle-visible, never attach an `Authorization` header sourced from a public env var. Authenticated APIs require a server-side proxy or a per-user token obtained at runtime through a documented auth flow (future work).
- **Caching:** React Query caches are in-memory only. Do not persist React Query state to AsyncStorage / MMKV / SecureStore without a confidentiality review.
- **New external API checklist:** Adding a new external API requires:
  1. New entry in `.env.example`.
  2. New HTTP client in `src/infra/http/clients/`.
  3. DTO + adapter + repository pair under `src/infra/repositories/http-repository/`.
  4. Confirmation the API does not require a secret in a public env var.
  5. Confirmation the API returns only data the domain entity wants — no `data:` URLs, executable payloads, or `javascript:` links.

## 7. Audit, Logging & Monitoring

- **Telemetry stance today:** No third-party error reporting or analytics SDK is integrated. Adding one (Sentry, Bugsnag, PostHog, etc.) requires a review under this section.
- **What logs MAY contain:** Generic flow info (`Loading pool`, `Refetching APY`), HTTP status codes, error types. Console logs are acceptable during development.
- **What logs MUST NOT contain:** Full request URLs that include user-supplied search parameters, future auth tokens, future user identifiers, raw DTO payloads in production builds.
- **Future SDK rules:** When an error reporting SDK is added, the scrub list MUST include: URLs, headers, query strings, device identifiers beyond the SDK's default, and any value sourced from a future "user" object.

## 8. Future-State Sections (Apply When Introduced)

These sections are intentionally **placeholders**. Each MUST be written in full before the corresponding feature ships:

- **Authentication & session management.** Login flow, token storage (SecureStore on iOS Keychain / Android Keystore — never AsyncStorage for tokens), refresh strategy, biometric gating.
- **User-identifiable data (PII).** What is collected, where it lives (server-side preferred), retention, deletion path.
- **Favorites / sync.** Where favorites persist (local-only vs cloud), conflict resolution, encryption at rest.
- **Wallet / on-chain interactions.** Signing UX, key custody (never custodial in-app), transaction confirmation patterns, phishing resistance for malicious dApp URLs.

Adding any of these features without first replacing the corresponding placeholder section is a constitution violation.

## 9. Build, Signing & Supply Chain

- **Lockfile:** `bun.lock` is committed and authoritative. Lockfile changes are reviewed.
- **Dependency adds:** Each new dependency is reviewed for: maintenance status, license, supply-chain risk, install-script behavior, new-architecture compatibility. No `curl | sh` install steps.
- **`patch-package` / forks:** Patches live in `patches/` (if introduced) and are reviewed line-by-line. Forking a dependency requires a note in this file or the change set.
- **OTA updates** (EAS Update, if introduced): Treated as code shipping to production. Same review and verification gates as a binary release. Never push experimental code over OTA to production channels.
- **Signing material:** iOS distribution certs and Android keystores are managed by EAS, not stored in the repo or in CI environment variables. Local development uses Expo's managed credentials.
- **Bundle inspection:** Periodic verification (manual is fine at this scale) that the released bundle does not contain unexpected `EXPO_PUBLIC_*` values — i.e., that no developer accidentally promoted a private var to public.

## 10. Incident Response Triggers

If any of the following occur, treat as an incident, halt active feature work, and address before resuming:

- A secret was committed to the repo (even briefly). Rotate immediately, document in commit history that the rotation occurred.
- An `EXPO_PUBLIC_*` value with sensitive data was shipped to a published build. Pull the build from the relevant store, ship a corrected version.
- A deep link or external link allowed a malicious destination to load. Add a regression test or guardrail before re-enabling the path.
- A dependency in `bun.lock` is reported as compromised. Verify, pin or replace, and review what shipped with the compromised version.

**Version**: 1.0.0 | **Ratified**: 2026-05-20 | **Last Amended**: 2026-05-20
