---
phase: 3
slug: chart
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 30.x with jest-expo 54 preset |
| **Config file** | `jest.config.js` |
| **Quick run command** | `bun run test --testPathPatterns chart` |
| **Full suite command** | `bun run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test --testPathPatterns chart`
- **After every plan wave:** Run `bun run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | CHRT-01 | unit | `bun run test --testPathPatterns apy-history` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | CHRT-01 | unit | `bun run test --testPathPatterns pool-adapter` | ✅ | ⬜ pending |
| 03-02-01 | 02 | 2 | CHRT-02 | unit | `bun run test --testPathPatterns apy-chart` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | CHRT-03 | unit | `bun run test --testPathPatterns apy-chart` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | CHRT-04 | unit | `bun run test --testPathPatterns apy-chart` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `@shopify/react-native-skia` — install via `npx expo install`
- [ ] `victory-native` — install charting library
- [ ] Font file for Victory Native axis labels (e.g., `inter-medium.ttf`)
- [ ] Jest config updates for Skia test environment
- [ ] `trustedDependencies` entry in `package.json` for Bun + Skia

*Existing test infrastructure (jest, jest-expo, @testing-library/react-native) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Green line chart renders visually | CHRT-02 | Visual rendering requires simulator | Open pool details, verify green line chart appears with 30 data points |
| Axis labels readable at intervals | CHRT-03 | Visual layout verification | Verify Y-axis shows percentages, X-axis shows dates at readable spacing |
| Chart caption visible below chart | CHRT-04 | Visual positioning | Verify "APY history over the last 30 days" text appears below chart |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
