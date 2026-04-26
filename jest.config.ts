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
    'src/lib/totp.ts',
    'src/lib/signed-upload.ts',
    'src/lib/av-scan.ts',
    'src/lib/sentry.ts',
    'src/backend/middleware/request-log.ts',
    'src/backend/services/booking-service.ts',
    'src/backend/services/tattoo-service.ts',
    'src/backend/services/post-service.ts',
    'src/backend/services/comment-service.ts',
    'src/backend/services/follow-service.ts',
    'src/backend/services/notification-service.ts',
    'src/backend/services/ar-preview-service.ts',
    'src/backend/services/audit-log-service.ts',
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
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/tests/unit/**/*.test.tsx',
    '<rootDir>/tests/services/**/*.test.ts',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/tests/e2e/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
};

export default config;
