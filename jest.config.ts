import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  collectCoverageFrom: [
    'src/utils/**/*.ts',
    'src/lib/validations.ts',
    'src/lib/api-error.ts',
    'src/lib/feature-flags.ts',
    'src/lib/env.ts',
    'src/backend/middleware/request-log.ts',
    'src/backend/services/booking-service.ts',
    'src/backend/services/tattoo-service.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 60,
      branches: 50,
      functions: 60,
      statements: 60,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts', '<rootDir>/tests/services/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/tests/e2e/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
};

export default config;
