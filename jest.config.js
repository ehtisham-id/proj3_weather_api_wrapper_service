/**
 * Jest Configuration for Weather API Tests
 */

export default {
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    testMatch: ['**/?(*.)+(spec|test).js'],
    collectCoverageFrom: [
        'api/**/*.js',
        '!api/index.js',
        '!api/config/**',
        '!api/models/**',
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    testTimeout: 10000,
    forceExit: true,
    detectOpenHandles: true,
    maxWorkers: 1,
};
