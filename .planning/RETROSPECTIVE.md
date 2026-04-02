# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Pool Details Screen

**Shipped:** 2026-04-02
**Phases:** 3 | **Plans:** 6 | **Tasks:** 11

### What Was Built
- Domain layer extended with ApyDataPoint entity and findApyHistory repository method
- DefiLlama chart API integration with 30-day filter adapter
- Pool details screen with APY display, project/chain info, token icon, and external CTA
- Home-to-details push navigation with full test coverage
- Victory Native ApyChart component with 4 visual states (loading, error, empty, success)
- End-to-end chart data flow from API through presentation layer

### What Worked
- TDD approach caught adapter edge cases early (null guards, date filtering)
- Clean Architecture kept phases independent — chart work didn't touch navigation code
- Separating chart hook as non-Suspense prevented error cascading to whole screen
- Co-locating screen-specific components in screen folders kept imports clean
- formatAPY extraction to shared utility eliminated duplication between screens

### What Was Inefficient
- Victory Native Jest mocking required significant iteration (displayName, css-interop errors)
- TTF font asset handling in Jest needed a dedicated mock file
- CartesianChart padding prop issue for axis labels wasn't caught until UAT — could have been caught earlier with device testing
- Expo Dev Client requirement after Skia installation wasn't anticipated upfront

### Patterns Established
- Victory Native mock pattern with displayName property for NativeWind compatibility
- jest.font-mock.js for TTF asset resolution in Jest
- onBack callback prop pattern for router-agnostic screen testing
- ApyChart mocking in parent component tests to isolate Skia rendering

### Key Lessons
1. Native module dependencies (Skia) should trigger immediate Dev Client build — don't wait for UAT to discover Expo Go breaks
2. Chart axis labels require CartesianChart padding prop — needs fixing in next milestone
3. Flat string serialization for router params is simple but requires parseFloat() deserialization — document the pattern
4. Mock displayName is required when NativeWind css-interop wraps mocked components

### Cost Observations
- Timeline: 2 days for 3 phases, 6 plans
- Compact milestone — domain extension + screen + chart in rapid succession
- Phase isolation worked well for parallel context management

---

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Phases | 3 |
| Plans | 6 |
| Tasks | 11 |
| Timeline | 2 days |
| LOC (TypeScript) | 6,897 |
| Known gaps | 2 (CHRT-02, CHRT-03) |
