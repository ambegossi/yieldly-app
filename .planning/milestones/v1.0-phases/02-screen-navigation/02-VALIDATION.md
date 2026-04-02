---
phase: 2
slug: screen-navigation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.x with jest-expo preset |
| **Config file** | `jest.config.js` |
| **Quick run command** | `bun run test --testPathPatterns="02\|pool-details\|format-apy"` |
| **Full suite command** | `bun run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command (phase-related tests)
- **After every plan wave:** Run full suite
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | NAVG-01, NAVG-02 | unit | `bun run test --testPathPatterns="pool-details"` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | DISP-01, DISP-02 | unit | `bun run test --testPathPatterns="pool-details"` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | DISP-03, DISP-04, DISP-05 | unit | `bun run test --testPathPatterns="pool-details"` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | ACTN-01, ACTN-02 | unit | `bun run test --testPathPatterns="pool-details"` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | NAVG-03 | unit | `bun run test --testPathPatterns="pool-details"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test infrastructure already exists — Jest 30, RNTL, jest-expo all configured
- [ ] Mocks for `expo-router` (`useLocalSearchParams`, `useRouter`) needed in test files
- [ ] Mocks for `expo-web-browser` (`openBrowserAsync`) needed in test files

*Existing infrastructure covers all phase requirements. Mocks created inline per test file.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Responsive layout switch at 768dp | DISP-04 | `useDeviceLayout` requires device viewport | Resize simulator/browser window, verify layout switches |
| External browser opens pool URL | ACTN-01 | System browser launch cannot be verified in Jest | Tap "Open [Project]" button, verify browser opens with correct URL |
| Navigation animation (push transition) | NAVG-01 | Visual animation not testable in RNTL | Tap pool card, observe push animation to details screen |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
