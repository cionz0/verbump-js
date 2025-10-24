# Test Suite for verbump-js

This directory contains comprehensive tests for the verbump-js CLI tool.

## Test Structure

- `bump.test.js` - Tests for the core version bumping functionality
- `changelog.test.js` - Tests for changelog generation and updates
- `git.test.js` - Tests for Git operations (commit, tag, push)
- `cli.test.js` - Integration tests for CLI functionality
- `setup.js` - Global test setup and utilities

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The test suite covers:

- ✅ Version bumping (patch, minor, major)
- ✅ Configuration file handling
- ✅ Changelog generation and updates
- ✅ Git operations (add, commit, tag, push)
- ✅ Error handling and edge cases
- ✅ CLI argument parsing
- ✅ File system operations
- ✅ Mocking and isolation

## Test Utilities

The `setup.js` file provides:
- Global test utilities
- Mock configurations for chalk (no color output)
- Helper functions for creating mock data

## Mocking Strategy

Tests use comprehensive mocking to:
- Isolate units under test
- Avoid side effects (file system, git operations)
- Ensure consistent test results
- Test error conditions safely
