---
phase: quick
plan: 260413-sqf
subsystem: pool-details
tags: [web, platform-branch, window-open, expo-web-browser, testing]
dependency_graph:
  requires: []
  provides: [web-tab-open-behavior]
  affects: [pool-details-screen]
tech_stack:
  added: []
  patterns: [platform-branch-via-Platform.OS]
key_files:
  created: []
  modified:
    - src/screens/pool-details/index.tsx
    - src/screens/pool-details/__tests__/pool-details-screen.test.tsx
decisions:
  - Use window.open with _blank and noopener,noreferrer on web for security and correct tab behavior
  - Keep WebBrowser.openBrowserAsync for native (iOS/Android) paths unchanged
metrics:
  duration: "~5 minutes"
  completed: "2026-04-13"
  tasks_completed: 2
  files_modified: 2
---

# Phase quick Plan 260413-sqf: Open Pool Button Opens New Tab on Web Summary

**One-liner:** Platform-branched handleOpenPool: window.open(_blank) on web, WebBrowser.openBrowserAsync on native.

## What Was Done

Fixed the "Open pool" CTA button on web to open a proper new browser tab instead of a popup window. `expo-web-browser`'s `openBrowserAsync` calls `window.open` with width/height features on web, which browsers block as a popup. The fix adds a `Platform.OS === "web"` branch to call `window.open(url, "_blank", "noopener,noreferrer")` directly, while native platforms continue using `WebBrowser.openBrowserAsync`.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Add Platform.OS web branch to handleOpenPool | 12e1ec1 | src/screens/pool-details/index.tsx |
| 2 | Add web-path test and update native-path test | 982f773 | src/screens/pool-details/__tests__/pool-details-screen.test.tsx |

## Verification

- `bun run types` — passes (0 errors)
- `bun run test -- --testPathPatterns="pool-details-screen"` — 7/7 tests pass
- `bun run lint` — 0 errors (16 pre-existing warnings in unrelated test files)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `src/screens/pool-details/index.tsx` — FOUND (contains `Platform.OS === "web"` branch)
- `src/screens/pool-details/__tests__/pool-details-screen.test.tsx` — FOUND (contains web and native path tests)
- Commit 12e1ec1 — FOUND
- Commit 982f773 — FOUND
