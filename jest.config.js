/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
    collectCoverage: true,
    coverageDirectory: "<rootDir>/coverage",
    coveragePathIgnorePatterns: ["dist", "<rootDir>/src/test"],
    testPathIgnorePatterns: ["dist", "<rootDir>/src/test"],
    preset: "ts-jest",
    testEnvironment: "node",
};
