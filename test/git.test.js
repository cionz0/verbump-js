import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { execSync } from 'child_process'
import { gitCommitAndTag, gitPush } from '../src/git.js'

// Mock dependencies
vi.mock('child_process')

describe('gitCommitAndTag', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console.log to avoid output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should execute git commands in correct order', () => {
    const version = '1.0.1'
    const tag = 'v1.0.1'
    
    execSync.mockImplementation(() => {})
    
    gitCommitAndTag(version, tag)
    
    expect(execSync).toHaveBeenCalledWith('git add package.json', { stdio: 'inherit' })
    expect(execSync).toHaveBeenCalledWith('git commit --amend --no-edit', { stdio: 'inherit' })
    expect(execSync).toHaveBeenCalledWith(`git tag ${tag}`, { stdio: 'inherit' })
  })

  it('should log success message when tag is created', () => {
    const version = '1.0.1'
    const tag = 'v1.0.1'
    const consoleSpy = vi.spyOn(console, 'log')
    
    execSync.mockImplementation(() => {})
    
    gitCommitAndTag(version, tag)
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(`🏷️  Created tag ${tag}`)
    )
  })

  it('should handle git errors gracefully', () => {
    const version = '1.0.1'
    const tag = 'v1.0.1'
    const error = new Error('Git command failed')
    const consoleErrorSpy = vi.spyOn(console, 'error')
    
    execSync.mockImplementation(() => {
      throw error
    })
    
    // Should not throw
    expect(() => gitCommitAndTag(version, tag)).not.toThrow()
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('⚠️ Git Error:'),
      error.message
    )
  })

  it('should handle different tag formats', () => {
    const version = '1.0.1'
    const tag = 'release-1.0.1'
    
    execSync.mockImplementation(() => {})
    
    gitCommitAndTag(version, tag)
    
    expect(execSync).toHaveBeenCalledWith(`git tag ${tag}`, { stdio: 'inherit' })
  })

  it('should handle different commit messages', () => {
    const version = '1.0.1'
    const tag = 'v1.0.1'
    
    execSync.mockImplementation(() => {})
    
    gitCommitAndTag(version, tag)
    
    expect(execSync).toHaveBeenCalledWith('git commit --amend --no-edit', { stdio: 'inherit' })
  })
})

describe('gitPush', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console.log to avoid output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should execute git push command', () => {
    execSync.mockImplementation(() => {})
    
    gitPush()
    
    expect(execSync).toHaveBeenCalledWith(
      'git push origin main --tags',
      { stdio: 'inherit' }
    )
  })

  it('should log success message when push completes', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    
    execSync.mockImplementation(() => {})
    
    gitPush()
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('🚀 Push completed')
    )
  })

  it('should handle push errors gracefully', () => {
    const error = new Error('Push failed')
    const consoleErrorSpy = vi.spyOn(console, 'error')
    
    execSync.mockImplementation(() => {
      throw error
    })
    
    // Should not throw
    expect(() => gitPush()).not.toThrow()
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('⚠️ Push Error:'),
      error.message
    )
  })

  it('should handle network errors during push', () => {
    const error = new Error('fatal: unable to access \'https://github.com/user/repo.git/\': Could not resolve host: github.com')
    const consoleErrorSpy = vi.spyOn(console, 'error')
    
    execSync.mockImplementation(() => {
      throw error
    })
    
    expect(() => gitPush()).not.toThrow()
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('⚠️ Push Error:'),
      error.message
    )
  })

  it('should handle authentication errors during push', () => {
    const error = new Error('fatal: Authentication failed')
    const consoleErrorSpy = vi.spyOn(console, 'error')
    
    execSync.mockImplementation(() => {
      throw error
    })
    
    expect(() => gitPush()).not.toThrow()
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('⚠️ Push Error:'),
      error.message
    )
  })
})
