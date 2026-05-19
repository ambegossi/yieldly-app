# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9.2 (strict mode), React 19.1.0, React Native 0.81.4

**Primary Dependencies**: Expo SDK 54, Expo Router v6, React Query v5 (`@tanstack/react-query`), Axios, NativeWind v4 + Tailwind 3.4, `@shopify/flash-list` v2, `@gorhom/bottom-sheet`, `victory-native` + `@shopify/react-native-skia`, `lucide-react-native`

**Storage**: React Query cache (server state); no client-state library; AsyncStorage / MMKV only if explicitly required by the feature (specify and justify in Complexity Tracking)

**Testing**: Jest 30 + `jest-expo` preset, `@testing-library/react-native` 13; run with `bun run test` (NOT `bun test`)

**Target Platform**: iOS, Android (new architecture enabled), Web (Metro static output)

**Project Type**: Cross-platform mobile app (single module, Clean Architecture three-layer)

**Performance Goals**: [60fps interactions on mid-tier device; list scroll without dropped frames via FlashList; or feature-specific target]

**Constraints**: [API latency budget, bundle size impact, offline behavior, accessibility requirements — fill in per feature]

**Scale/Scope**: [Number of screens/routes added; expected data volume; or feature-specific scope]

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

<!--
  Yieldly is a single-module cross-platform mobile app with Clean Architecture
  (Domain → Infrastructure → Presentation). The tree below is the standard layout
  any new feature follows. List the *specific* paths this feature will add/touch.
-->

```text
src/
├── domain/
│   └── [feature]/
│       ├── [feature].ts                    # Domain entity (e.g. Pool)
│       ├── [feature]-repo.ts               # Repository interface
│       ├── use-cases/
│       │   ├── use-[feature]-find-all.ts          # Non-suspense hook
│       │   ├── use-[feature]-find-all-suspense.ts # Suspense variant
│       │   └── __tests__/
│       └── __tests__/
├── infra/
│   ├── http/clients/
│   │   └── defi-llama-http-client.ts       # (or new client per data source)
│   ├── repositories/
│   │   ├── repository-provider.tsx         # DI provider (extend `Repositories`)
│   │   └── http-repository/
│   │       ├── index.ts                    # Wires `HttpRepositories`
│   │       └── [feature]/
│   │           ├── http-[feature]-repo.ts  # Repo implementation
│   │           ├── [feature]-adapter.ts    # DTO → domain mapping
│   │           ├── [feature]-dto.ts        # External API shape
│   │           └── __tests__/
│   └── use-cases/
│       ├── use-app-query.ts                # (reused — do not duplicate)
│       └── use-app-suspense-query.ts       # (reused — do not duplicate)
├── app/
│   └── [route].tsx                         # Expo Router route — wraps screen in ScreenWrapper
├── screens/
│   └── [feature]/
│       ├── index.tsx                       # Screen entry (default export OK here)
│       ├── components/                     # Screen-local components
│       ├── hooks/                          # Screen-local hooks
│       └── __tests__/
├── components/
│   ├── core/                               # Reusable primitives (Button, Text, Badge…)
│   └── [shared]/                           # Composite shared components (Header, ScreenWrapper…)
├── hooks/                                  # Cross-feature hooks (e.g. use-device-layout)
├── lib/                                    # Utilities (cn, theme, format-apy)
└── config/                                 # Env access via expo-constants
```

**Structure Decision**: Document the exact files this feature will add under each layer (Domain, Infrastructure, Presentation). If the feature touches only some layers, explicitly note which layers are unaffected. Reference real paths, not placeholders.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
