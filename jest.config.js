module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  watchPathIgnorePatterns: ["dist"],
  testMatch: ["<rootDir>/src/__tests__/*.ts"]
};
