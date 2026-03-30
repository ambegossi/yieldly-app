# Coding Conventions

**Analysis Date:** 2026-03-30

## Naming Patterns

**Files and Directories:**
- All files and directories use **kebab-case**: `pool-list-item.tsx`, `use-pool-find-all.ts`, `http-pool-repo.ts`
- Component files: `button.tsx`, `pool-card.tsx`, `home-header.tsx`
- Hook files: `use-pool-find-all.ts`, `use-app-query.ts`, `use-device-layout.ts`
- Entity/Interface files: `pool.ts`, `pool-repo.ts`, `repositories.ts`
- DTO files: `pool-dto.ts`
- Adapter files: `pool-adapter.ts`
- Test files: `use-pool-find-all.test.tsx`, `pool-adapter.test.ts`
- Test directories: `__tests__/` co-located with source

**Code-Level Naming:**
- Components: PascalCase (`export function PoolListItem()`)
- Hooks: camelCase with `use` prefix (`export function usePoolFindAll()`)
- Interfaces: PascalCase (`export interface Pool {}`)
- Classes: PascalCase (`export class HttpClient {}`)
- Functions: camelCase (`defiLlamaPoolDTOToPool`)
- Constants: camelCase or UPPER_SNAKE_CASE depending on context

## Code Style

**Formatter:**
- Prettier v3 with `prettier-plugin-tailwindcss` for Tailwind class sorting
- Config: `.prettierrc` - minimal config, relies on Prettier defaults (double quotes, trailing commas)

**Linter:**
- ESLint v9 with flat config at `eslint.config.js`
- Extends: `eslint-config-expo/flat` + `eslint-plugin-prettier/recommended`
- Import resolver: `eslint-import-resolver-typescript` for `@/*` path alias
- Custom rule: `eol-last: off`
- Jest globals configured for test files

**TypeScript:**
- Strict mode enabled in `tsconfig.json`
- TypeScript 5.9.2
- Extends `expo/tsconfig.base`

## Component Patterns

**Declaration Style:**
- Use **function declarations** with **named exports**: `export function Button() {}`
- Exception: memoized components use `export const X = React.memo(function X() {})` pattern
  - Example: `src/screens/home/components/pool-list-item.tsx`

**Export Style:**
- Named exports for all components, hooks, and utilities
- Default exports ONLY for screen entry points consumed by expo-router
  - Example: `src/screens/home/index.tsx` uses `export default function Home()`

**Props Pattern:**
- Define props as a separate interface above the component: `interface PoolListItemProps { ... }`
- Name convention: `{ComponentName}Props`

**Component Structure:**
- Core reusable components: `src/components/core/` (Button, Text, Badge, etc.)
- Shared composite components: `src/components/` (Header, BottomSheet, ScreenWrapper)
- Screen-specific components: `src/screens/{screen}/components/`
- Screen-specific hooks: `src/screens/{screen}/hooks/`

**JSX Formatting:**
- Sibling JSX elements MUST be separated by a blank line
- Exception: files in `src/components/core/` (react-native-reusables primitives)

## Import Conventions

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`, mirrored in `jest.config.js`)

**Import Order (observed pattern):**
1. Aliased internal imports (`@/components/...`, `@/domain/...`, `@/infra/...`)
2. External library imports (`@tanstack/react-query`, `@shopify/flash-list`, `react`)
3. React Native imports (`react-native`)
4. Relative imports (`./components/...`, `../hooks/...`)

**Import Style:**
- Named imports preferred: `import { Pool } from "@/domain/pool/pool"`
- Type imports use inline `type` keyword: `import { type UseQueryOptions } from "@tanstack/react-query"`

## Styling Conventions

**Framework:** NativeWind v4 (Tailwind CSS for React Native)

**Patterns:**
- Use `className` prop with Tailwind utility classes directly on components
- Use `cn()` utility from `src/lib/utils.ts` for conditional class merging
- Dark mode via `dark:` prefix: `dark:bg-brand/10`
- Responsive via breakpoints: `md:px-6 lg:px-8`
- Platform-specific via `Platform.select()` in component variants (see `src/components/core/text.tsx`)

**Color System:**
- HSL CSS variables defined in `global.css`: `--primary`, `--secondary`, `--background`, `--foreground`, etc.
- Brand green uses Tailwind's `green-*` palette, NOT `--primary` (which is near-black)
- Custom `brand` color mapped in `tailwind.config.js`

## Hook Conventions

**Declaration:** Function declarations with named exports
```typescript
export function usePoolFindAll() {
  const { poolRepo } = useRepository();
  return useAppQuery({
    queryKey: ["pools"],
    fetchData: () => poolRepo.findAll(),
  });
}
```

**Data Fetching:** Always use `useAppQuery` or `useAppSuspenseQuery` wrappers from `src/infra/use-cases/`
- Never use `useQuery` directly from React Query in domain/screen code

**Repository Access:** Always use `useRepository()` hook from `src/infra/repositories/repository-provider.tsx`

## Error Handling

**Patterns:**
- Suspense-based: screens use `useSuspenseQuery` with React Suspense boundaries for loading states
- Non-suspense: `useAppQuery` returns `{ data, isPending, error }` for manual handling
- Network errors bubble through React Query's error handling

## Git Conventions

**Branch Naming:** Feature-based with numeric prefix: `001-home-screen`

**Commit Style:** Conventional commits specification
- `fix:` for bug fixes
- `feat:` for new features
- `refactor:` for code restructuring
- `docs:` for documentation changes
- Scoped commits supported: `refactor(home): rename HomeHeader component`

## Dependency Injection

**Pattern:** React Context-based DI
1. Domain defines interfaces in `src/domain/repositories.ts`
2. `RepositoryProvider` wraps the app in root layout
3. Components access repos via `useRepository()` hook
4. Never import concrete implementations in domain or presentation code

---

*Convention analysis: 2026-03-30*
