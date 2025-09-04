module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts',
    '**/src/**/*.test.ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/docs/**',
    '!src/infra/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^\\.\\./\\.\\./config/prisma$': '<rootDir>/tests/__mocks__/prisma.ts',
    '^\\.\\./\\.\\./\\.\\./config/prisma$': '<rootDir>/tests/__mocks__/prisma.ts',
    '^\\.\\./\\.\\./middleware/features/count-request$': '<rootDir>/tests/__mocks__/count-request.ts',
    '^\\.\\./\\.\\./\\.\\./middleware/features/count-request$': '<rootDir>/tests/__mocks__/count-request.ts'
  },

  testTimeout: 10000
};
