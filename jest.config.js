module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['<rootDir>/examples/', '<rootDir>/node_modules/', '<rootDir>/dist/'],
    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
    testMatch: ['**/tests/**/*.test.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
