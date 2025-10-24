import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { 
  updateVersionInFiles, 
  updatePackageJsonVersion, 
  getCurrentVersion 
} from '../src/version-updater.js';

// Mock fs module
vi.mock('fs');
const mockFs = vi.mocked(fs);

describe('version-updater', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('updatePackageJsonVersion', () => {
    it('should update version in package.json', () => {
      const packageContent = JSON.stringify({
        name: 'test-package',
        version: '1.0.0',
        description: 'Test package'
      }, null, 2);

      mockFs.readFileSync.mockReturnValue(packageContent);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = updatePackageJsonVersion('1.1.0', './package.json');

      expect(result).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        './package.json',
        expect.stringContaining('"version": "1.1.0"')
      );
    });

    it('should return false if version is already the same', () => {
      const packageContent = JSON.stringify({
        name: 'test-package',
        version: '1.1.0'
      }, null, 2);

      mockFs.readFileSync.mockReturnValue(packageContent);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = updatePackageJsonVersion('1.1.0', './package.json');

      expect(result).toBe(false);
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should throw error if package.json is invalid', () => {
      mockFs.readFileSync.mockReturnValue('invalid json');
      mockFs.writeFileSync.mockImplementation(() => {});

      expect(() => {
        updatePackageJsonVersion('1.1.0', './package.json');
      }).toThrow('Failed to update package.json');
    });
  });

  describe('getCurrentVersion', () => {
    it('should return current version from package.json', () => {
      const packageContent = JSON.stringify({
        name: 'test-package',
        version: '1.2.3'
      }, null, 2);

      mockFs.readFileSync.mockReturnValue(packageContent);

      const version = getCurrentVersion('./package.json');

      expect(version).toBe('1.2.3');
    });

    it('should throw error if package.json cannot be read', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      expect(() => {
        getCurrentVersion('./package.json');
      }).toThrow('Failed to read package.json');
    });
  });

  describe('updateVersionInFiles', () => {
    beforeEach(() => {
      // Mock readdirSync and statSync for file discovery
      mockFs.readdirSync.mockImplementation((dir) => {
        if (dir === process.cwd()) {
          return ['README.md', 'package.json', 'src'];
        }
        if (dir.endsWith('src')) {
          return ['bump.js', 'changelog.js'];
        }
        return [];
      });

      mockFs.statSync.mockImplementation((filePath) => {
        const isDir = filePath.endsWith('src') || filePath === process.cwd();
        return {
          isDirectory: () => isDir,
          isFile: () => !isDir
        };
      });
    });

    it('should update version references in files', () => {
      const readmeContent = `# Test Project
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]
## 1.0.0 - 2024-01-01
Some content`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(readmeContent);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = updateVersionInFiles('1.0.0', '1.1.0', {
        files: ['README.md'],
        dryRun: false
      });

      expect(result.updated).toHaveLength(1);
      expect(result.updated[0].file).toBe('README.md');
      expect(result.updated[0].changes).toBeGreaterThan(0);
      expect(result.totalChanges).toBeGreaterThan(0);
    });

    it('should handle dry run mode', () => {
      const readmeContent = `# Test Project
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(readmeContent);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = updateVersionInFiles('1.0.0', '1.1.0', {
        files: ['README.md'],
        dryRun: true
      });

      expect(result.updated).toHaveLength(1);
      expect(result.totalChanges).toBeGreaterThan(0);
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should handle files that do not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = updateVersionInFiles('1.0.0', '1.1.0', {
        files: ['nonexistent.md'],
        dryRun: false
      });

      expect(result.updated).toHaveLength(0);
      expect(result.skipped).toHaveLength(0);
      // Files that don't exist are skipped, not added to errors
      expect(result.errors).toHaveLength(0);
    });

    it('should handle read errors gracefully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = updateVersionInFiles('1.0.0', '1.1.0', {
        files: ['README.md'],
        dryRun: false
      });

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('Permission denied');
    });

    it('should skip files with no version references', () => {
      const content = `# Test Project
This file has no version references.`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(content);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = updateVersionInFiles('1.0.0', '1.1.0', {
        files: ['README.md'],
        dryRun: false
      });

      expect(result.updated).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toBe('README.md');
    });

    it('should use custom patterns', () => {
      const content = `VERSION = "1.0.0"`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(content);
      mockFs.writeFileSync.mockImplementation(() => {});

      const customPatterns = [
        {
          pattern: /(VERSION\s*=\s*")([0-9]+\.[0-9]+\.[0-9]+)(")/g,
          replacement: '$1${newVersion}$3'
        }
      ];

      const result = updateVersionInFiles('1.0.0', '1.1.0', {
        files: ['config.js'],
        patterns: customPatterns,
        dryRun: false
      });

      expect(result.updated).toHaveLength(1);
      expect(result.totalChanges).toBe(1);
    });

    it('should handle glob patterns', () => {
      const content = `# Test Project
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(content);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = updateVersionInFiles('1.0.0', '1.1.0', {
        files: ['*.md'],
        dryRun: false
      });

      expect(result.updated.length).toBeGreaterThan(0);
    });
  });
});
