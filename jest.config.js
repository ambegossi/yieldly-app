/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{ts,tsx}",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",

    // Exclude type definitions
    "!src/**/*.d.ts",

    // Exclude UI components (react-native-reusables, already tested upstream)
    "!src/components/ui/**/*.{ts,tsx}",

    // Exclude app screens and layouts (UI-focused, integration tested)
    "!src/app/**/*.tsx",

    // Exclude barrel exports (no logic)
    "!src/**/index.ts",

    // Exclude configuration files
    "!src/config/**/*.ts",

    // Exclude theme constants
    "!src/lib/theme.ts",

    // Exclude pure type/interface files in domain layer
    "!src/domain/**/Pool.ts",
    "!src/domain/**/PoolRepo.ts",
    "!src/domain/Repositories.ts",

    // Exclude DTOs (pure types)
    "!src/infra/repositories/HttpRepository/**/PoolDTO.ts",

    // Exclude HTTP client interfaces (no implementation)
    "!src/infra/http/HttpClient.ts",

    // Exclude HTTP client instances (configuration only)
    "!src/infra/http/clients/*.ts",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@rn-primitives/.*|react-navigation|@react-navigation/.*|nativewind|react-native-css-interop)",
  ],
};
