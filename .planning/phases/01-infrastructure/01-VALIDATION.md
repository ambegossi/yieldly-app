---
phase: 1
slug: infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 30.x via jest-expo 54.x |
| **Config file** | `jest.config.js` |
| **Quick run command** | `bun run test --testPathPatterns infrastructure` |
| **Full suite command** | `bun run test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test --testPathPatterns infrastructure`
- **After every plan wave:** Run `bun run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | INFR-01 | unit | `bun run test --testPathPatterns pool-adapter` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | INFR-02 | unit | `bun run test --testPathPatterns http-pool-repo` | ✅ | ⬜ pending |
| 01-01-03 | 01 | 1 | INFR-03 | unit | `bun run test --testPathPatterns pool-adapter` | ✅ | ⬜ pending |
| 01-01-04 | 01 | 1 | INFR-04 | unit | `bun run test --testPathPatterns use-pool-apy-history` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | INFR-05 | unit | `bun run test --testPathPatterns use-pool-apy-history` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/domain/pool/use-cases/__tests__/use-pool-apy-history.test.tsx` — stubs for INFR-04, INFR-05
- [ ] Update existing mock factories in `use-pool-find-all.test.tsx` and `use-pool-find-all-suspense.test.tsx` to include `findApyHistory: jest.fn()`

*Existing test infrastructure (Jest, RNTL, jest-expo) covers all framework requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Loading indicator visible | INFR-04 | UI behavior in real app | Run app, navigate to pool details, observe spinner during network delay |
| Error message visible | INFR-05 | UI behavior in real app | Disable network, navigate to pool details, observe error state |

*Note: Unit tests verify hook states (isPending, error), but visual rendering is manual.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
