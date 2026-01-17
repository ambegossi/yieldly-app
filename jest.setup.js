import "@testing-library/jest-native/extend-expect";

// Polyfill for structuredClone (required by Expo Winter Runtime)
if (typeof global.structuredClone === "undefined") {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock Expo Winter Runtime
global.__ExpoImportMetaRegistry = {
  registerImportMeta: jest.fn(),
  getImportMeta: jest.fn(() => ({})),
};
