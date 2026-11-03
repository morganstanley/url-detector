module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['<rootDir>/examples/', '<rootDir>/node_modules/', '<rootDir>/dist/'],
    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
    testMatch: ['**/tests/**/*.test.ts'],
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                // Node16/NodeNext module kind is used; ts-jest warns unless isolatedModules
                // is set project-wide, so ignore its TS151002 advisory instead.
                diagnostics: { ignoreCodes: [151002] },
            },
        ],
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
