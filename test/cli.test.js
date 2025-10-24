import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { execSync } from 'child_process'
import fs from 'fs'

// Mock dependencies
vi.mock('child_process')
vi.mock('fs')

describe('CLI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console methods to avoid output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock package.json content
    const mockPackageJson = {
      name: 'test-package',
      version: '1.0.0'
    }
    fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson))
    fs.writeFileSync.mockImplementation(() => {})
    fs.existsSync.mockReturnValue(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle patch version bump', async () => {
    execSync.mockImplementation(() => {})
    
    // Import and test the CLI programmatically
    const { program } = await import('commander')
    const { bumpVersion } = await import('../src/bump.js')
    
    const result = await bumpVersion('patch')
    
    expect(result).toBe('1.0.1')
  })

  it('should handle minor version bump', async () => {
    execSync.mockImplementation(() => {})
    
    const { bumpVersion } = await import('../src/bump.js')
    
    const result = await bumpVersion('minor')
    
    expect(result).toBe('1.1.0')
  })

  it('should handle major version bump', async () => {
    execSync.mockImplementation(() => {})
    
    const { bumpVersion } = await import('../src/bump.js')
    
    const result = await bumpVersion('major')
    
    expect(result).toBe('2.0.0')
  })

  it('should handle --no-git option', async () => {
    const { bumpVersion } = await import('../src/bump.js')
    
    const result = await bumpVersion('patch', { git: false })
    
    expect(result).toBe('1.0.1')
    expect(execSync).not.toHaveBeenCalled()
  })

  it('should handle --push option', async () => {
    execSync.mockImplementation(() => {})
    
    const { bumpVersion } = await import('../src/bump.js')
    
    const result = await bumpVersion('patch', { push: true })
    
    expect(result).toBe('1.0.1')
    expect(execSync).toHaveBeenCalledWith('git push origin main --tags', { stdio: 'inherit' })
  })

  it('should handle --no-changelog option', async () => {
    execSync.mockImplementation(() => {})
    
    const { bumpVersion } = await import('../src/bump.js')
    
    const result = await bumpVersion('patch', { changelog: false })
    
    expect(result).toBe('1.0.1')
  })

  it('should handle invalid version type', async () => {
    const { bumpVersion } = await import('../src/bump.js')
    
    await expect(bumpVersion('invalid')).rejects.toThrow('Invalid version increment')
  })

  it('should handle changelog-only command', async () => {
    const { updateChangelogOnly } = await import('../src/bump.js')
    
    const result = await updateChangelogOnly()
    
    expect(result).toBe('1.0.0')
  })

  it('should handle --no-version-update option', async () => {
    const { bumpVersion } = await import('../src/bump.js')
    
    const result = await bumpVersion('patch', { updateVersionReferences: false })
    
    expect(result).toBe('1.0.1')
  })

  it('should handle --dry-run option', async () => {
    const { bumpVersion } = await import('../src/bump.js')
    
    const result = await bumpVersion('patch', { dryRun: true })
    
    expect(result).toBe('1.0.1')
  })

  it('should work with configuration file', async () => {
    const config = {
      tagPrefix: 'v',
      push: false,
      updateChangelog: true
    }
    
    fs.existsSync.mockImplementation((path) => {
      if (path === '.verbump-jsrc.json') return true
      return false
    })
    
    fs.readFileSync.mockImplementation((path) => {
      if (path === './package.json') return JSON.stringify({ name: 'test', version: '1.0.0' })
      if (path === '.verbump-jsrc.json') return JSON.stringify(config)
      return ''
    })
    
    execSync.mockImplementation(() => {})
    
    const { bumpVersion } = await import('../src/bump.js')
    
    const result = await bumpVersion('patch')
    
    expect(result).toBe('1.0.1')
    expect(execSync).toHaveBeenCalledWith('git add package.json', { stdio: 'inherit' })
    expect(execSync).toHaveBeenCalledWith('git commit --amend --no-edit', { stdio: 'inherit' })
    expect(execSync).toHaveBeenCalledWith('git tag v1.0.1', { stdio: 'inherit' })
  })

  it('should handle git errors gracefully', async () => {
    const error = new Error('Git command failed')
    execSync.mockImplementation(() => {
      throw error
    })
    
    const { bumpVersion } = await import('../src/bump.js')
    
    // Should not throw, should handle error gracefully
    const result = await bumpVersion('patch')
    
    expect(result).toBe('1.0.1')
  })

  it('should handle file system errors', async () => {
    const error = new Error('Permission denied')
    fs.writeFileSync.mockImplementation(() => {
      throw error
    })
    
    const { bumpVersion } = await import('../src/bump.js')
    
    await expect(bumpVersion('patch')).rejects.toThrow('Permission denied')
  })

  it('should handle malformed package.json', async () => {
    fs.readFileSync.mockReturnValue('invalid json')
    
    const { bumpVersion } = await import('../src/bump.js')
    
    await expect(bumpVersion('patch')).rejects.toThrow()
  })

  it('should handle malformed config file', async () => {
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync
      .mockReturnValueOnce(JSON.stringify({ name: 'test', version: '1.0.0' }))
      .mockReturnValueOnce('invalid json')
    
    const { bumpVersion } = await import('../src/bump.js')
    
    await expect(bumpVersion('patch')).rejects.toThrow()
  })
})
