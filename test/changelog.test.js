import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs'
import { execSync } from 'child_process'
import { updateChangelog } from '../src/changelog.js'

// Mock dependencies
vi.mock('fs')
vi.mock('child_process')

describe('updateChangelog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console.log to avoid output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    // Mock execSync for git commands
    execSync.mockImplementation(() => '')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create new changelog file when it does not exist', () => {
    const version = '1.0.1'
    const file = 'CHANGELOG.md'
    
    fs.existsSync.mockReturnValue(false)
    fs.writeFileSync.mockImplementation(() => {})
    
    updateChangelog(version, file)
    
    expect(fs.existsSync).toHaveBeenCalledWith(file)
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      file,
      expect.stringContaining(`# ${version}`)
    )
  })

  it('should append to existing changelog file', () => {
    const version = '1.0.1'
    const file = 'CHANGELOG.md'
    const existingContent = '# Changelog\n\n## 1.0.0 - 2023-01-01\n\n- Initial release\n'
    
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(existingContent)
    fs.writeFileSync.mockImplementation(() => {})
    
    updateChangelog(version, file)
    
    expect(fs.readFileSync).toHaveBeenCalledWith(file, 'utf8')
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      file,
      expect.stringContaining(`# ${version}`)
    )
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      file,
      expect.stringContaining(existingContent)
    )
  })

  it('should include correct date format', () => {
    const version = '1.0.1'
    const file = 'CHANGELOG.md'
    
    fs.existsSync.mockReturnValue(false)
    fs.writeFileSync.mockImplementation(() => {})
    
    updateChangelog(version, file)
    
    // Check that the date is on next line in human format within brackets
    const writtenContent = fs.writeFileSync.mock.calls[0][1]
    const headerMatch = writtenContent.match(/# 1\.0\.1\n\[(.+?)\]/)
    expect(headerMatch).toBeTruthy()
    // e.g. 16 October 2025
    expect(headerMatch[1]).toMatch(/^\d{1,2} [A-Za-z]+ \d{4}$/)
  })

  it('should include default changelog entry', () => {
    const version = '1.0.1'
    const file = 'CHANGELOG.md'
    
    fs.existsSync.mockReturnValue(false)
    fs.writeFileSync.mockImplementation(() => {})
    
    updateChangelog(version, file)
    
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      file,
      expect.stringContaining('- Automatic version update.')
    )
  })

  it('should log success message', () => {
    const version = '1.0.1'
    const file = 'CHANGELOG.md'
    const consoleSpy = vi.spyOn(console, 'log')
    
    fs.existsSync.mockReturnValue(false)
    fs.writeFileSync.mockImplementation(() => {})
    
    updateChangelog(version, file)
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('📝 Changelog updated: CHANGELOG.md')
    )
  })

  it('should handle empty existing changelog', () => {
    const version = '1.0.1'
    const file = 'CHANGELOG.md'
    
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('')
    fs.writeFileSync.mockImplementation(() => {})
    
    updateChangelog(version, file)
    
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      file,
      expect.stringContaining(`## ${version} -`)
    )
  })

  it('should work with different file names', () => {
    const version = '1.0.1'
    const file = 'HISTORY.md'
    
    fs.existsSync.mockReturnValue(false)
    fs.writeFileSync.mockImplementation(() => {})
    
    updateChangelog(version, file)
    
    expect(fs.existsSync).toHaveBeenCalledWith(file)
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      file,
      expect.stringContaining(`## ${version} -`)
    )
  })

  it('should preserve existing content order', () => {
    const version = '1.0.1'
    const file = 'CHANGELOG.md'
    const existingContent = '# Changelog\n\n## 1.0.0 - 2023-01-01\n\n- Initial release\n'
    
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(existingContent)
    fs.writeFileSync.mockImplementation(() => {})
    
    updateChangelog(version, file)
    
    const writtenContent = fs.writeFileSync.mock.calls[0][1]
    const newEntryIndex = writtenContent.indexOf(`## ${version} -`)
    const existingContentIndex = writtenContent.indexOf(existingContent)
    
    expect(newEntryIndex).toBeLessThan(existingContentIndex)
  })

  it('should generate changelog from commits when enabled', () => {
    const version = '1.0.1'
    const file = 'CHANGELOG.md'
    
    fs.existsSync.mockReturnValue(false)
    fs.writeFileSync.mockImplementation(() => {})
    
    // Mock git commands to return sample commits
    execSync.mockImplementation((command) => {
      if (command.includes('git describe')) {
        return 'v1.0.0'
      }
      if (command.includes('git log')) {
        // Simulate: %H|%h|%an|%cI|%s
        return [
          '0123456789abcdef|0123456|alice|2025-10-16T06:33:58.000Z|feat: add new feature',
          '89abcdef01234567|89abcde|bob|2025-10-15T10:20:30.000Z|fix: resolve bug',
          'fedcba9876543210|fedcba9|carol|2025-10-14T12:00:00.000Z|chore: update dependencies'
        ].join('\n')
      }
      return ''
    })
    
    updateChangelog(version, file, { generateFromCommits: true })
    
    const writtenContent = fs.writeFileSync.mock.calls[0][1]
    expect(writtenContent).toContain('### ✨ Features')
    expect(writtenContent).toContain('### 🐛 Bug Fixes')
    expect(writtenContent).toContain('add new feature')
    expect(writtenContent).toContain('resolve bug')
  })

  it('should handle no commits gracefully', () => {
    const version = '1.0.1'
    const file = 'CHANGELOG.md'
    
    fs.existsSync.mockReturnValue(false)
    fs.writeFileSync.mockImplementation(() => {})
    
    // Mock git commands to return no commits
    execSync.mockImplementation((command) => {
      if (command.includes('git describe')) {
        return 'v1.0.0'
      }
      if (command.includes('git log')) {
        return ''
      }
      return ''
    })
    
    updateChangelog(version, file, { generateFromCommits: true })
    
    const writtenContent = fs.writeFileSync.mock.calls[0][1]
    expect(writtenContent).toContain('- Automatic version update.')
  })

  it('should categorize commits correctly', () => {
    const version = '1.0.1'
    const file = 'CHANGELOG.md'
    
    fs.existsSync.mockReturnValue(false)
    fs.writeFileSync.mockImplementation(() => {})
    
    // Mock git commands with different types of commits
    execSync.mockImplementation((command) => {
      if (command.includes('git describe')) {
        return 'v1.0.0'
      }
      if (command.includes('git log')) {
        return [
          'aaaaaaaaaaaaaaaa|aaaaaaa|dev|2025-10-12T00:00:00.000Z|feat: new feature',
          'bbbbbbbbbbbbbbbb|bbbbbbb|dev|2025-10-11T00:00:00.000Z|fix: bug fix',
          'cccccccccccccccc|ccccccc|dev|2025-10-10T00:00:00.000Z|BREAKING CHANGE: major change',
          'dddddddddddddddd|ddddddd|dev|2025-10-09T00:00:00.000Z|chore: maintenance'
        ].join('\n')
      }
      return ''
    })
    
    updateChangelog(version, file, { generateFromCommits: true })
    
    const writtenContent = fs.writeFileSync.mock.calls[0][1]
    expect(writtenContent).toContain('### ⚠️ Breaking Changes')
    expect(writtenContent).toContain('### ✨ Features')
    expect(writtenContent).toContain('### 🐛 Bug Fixes')
    expect(writtenContent).toContain('### 📝 Other Changes')
  })

  it('should fallback to recent commits when no tags exist', () => {
    const version = '1.0.1'
    const file = 'CHANGELOG.md'
    
    fs.existsSync.mockReturnValue(false)
    fs.writeFileSync.mockImplementation(() => {})
    
    // Mock git commands - first call fails (no tags), second succeeds
    execSync.mockImplementation((command) => {
      if (command.includes('git describe')) {
        throw new Error('No tags found')
      }
      if (command.includes('git log -10')) {
        return [
          'eeeeeeeeeeeeeeee|eeeeeee|dev|2025-09-01T00:00:00.000Z|feat: initial feature',
          'ffffffffffffffff|fffffff|dev|2025-09-02T00:00:00.000Z|fix: initial bug'
        ].join('\n')
      }
      return ''
    })
    
    updateChangelog(version, file, { generateFromCommits: true })
    
    const writtenContent = fs.writeFileSync.mock.calls[0][1]
    expect(writtenContent).toContain('### ✨ Features')
    expect(writtenContent).toContain('initial feature')
  })
})
