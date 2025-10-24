// Test setup file for global test configuration
import { vi } from 'vitest'

// Mock chalk to avoid color output in tests
vi.mock('chalk', () => ({
  default: {
    cyan: (text) => text,
    green: (text) => text,
    blue: (text) => text,
    red: (text) => text
  }
}))

// Global test utilities
global.testUtils = {
  createMockPackageJson: (version = '1.0.0') => ({
    name: 'test-package',
    version,
    description: 'Test package',
    main: 'index.js',
    scripts: {},
    dependencies: {},
    devDependencies: {}
  }),

  createMockConfig: (overrides = {}) => ({
    commitMessage: 'chore(release): bump version to {{version}}',
    tagPrefix: 'v',
    push: false,
    updateChangelog: true,
    ...overrides
  })
}
