import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs'
import { bumpVersion, updateChangelogOnly } from '../src/bump.js'

// Mock dependencies
vi.mock('fs')
vi.mock('../src/changelog.js', () => ({
  updateChangelog: vi.fn()
}))
vi.mock('../src/git.js', () => ({
  gitCommitAndTag: vi.fn(),
  gitPush: vi.fn()
}))

describe('bumpVersion', () => {
  const mockPackageJson = {
    name: 'test-package',
    version: '1.0.0'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    fs.existsSync.mockReturnValue(false)
    fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson))
    fs.writeFileSync.mockImplementation(() => {})
    // Reset mocks for each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should bump patch version correctly', async () => {
    const result = await bumpVersion('patch')
    
    expect(result).toBe('1.0.1')
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './package.json',
      expect.stringContaining('"version": "1.0.1"')
    )
  })

  it('should bump minor version correctly', async () => {
    const result = await bumpVersion('minor')
    
    expect(result).toBe('1.1.0')
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './package.json',
      expect.stringContaining('"version": "1.1.0"')
    )
  })

  it('should bump major version correctly', async () => {
    const result = await bumpVersion('major')
    
    expect(result).toBe('2.0.0')
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './package.json',
      expect.stringContaining('"version": "2.0.0"')
    )
  })

  it('should throw error for invalid version type', async () => {
    await expect(bumpVersion('invalid')).rejects.toThrow('Invalid version increment')
  })

  it('should read config file when it exists', async () => {
    const config = {
      tagPrefix: 'v',
      push: false,
      updateChangelog: true
    }
    
    // Mock config file exists
    fs.existsSync.mockImplementation((path) => {
      if (path === '.verbump-jsrc.json') return true
      return false
    })
    
    // Mock file reads
    fs.readFileSync.mockImplementation((path) => {
      if (path === './package.json') return JSON.stringify(mockPackageJson)
      if (path === '.verbump-jsrc.json') return JSON.stringify(config)
      return ''
    })

    await bumpVersion('patch')
    
    expect(fs.readFileSync).toHaveBeenCalledWith('.verbump-jsrc.json', 'utf8')
  })

  it('should use default config when config file does not exist', async () => {
    fs.existsSync.mockReturnValue(false)
    
    await bumpVersion('patch')
    
    expect(fs.readFileSync).not.toHaveBeenCalledWith('.verbump-jsrc.json', 'utf8')
  })

  it('should update changelog by default', async () => {
    const { updateChangelog } = await import('../src/changelog.js')
    
    await bumpVersion('patch')
    
    expect(updateChangelog).toHaveBeenCalledWith('1.0.1', 'CHANGELOG.md', { generateFromCommits: false })
  })

  it('should not update changelog when disabled in options', async () => {
    const { updateChangelog } = await import('../src/changelog.js')
    
    await bumpVersion('patch', { changelog: false })
    
    expect(updateChangelog).not.toHaveBeenCalled()
  })

  it('should not update changelog when disabled in config', async () => {
    const config = { updateChangelog: false }
    const { updateChangelog } = await import('../src/changelog.js')
    
    fs.existsSync.mockImplementation((path) => {
      if (path === '.verbump-jsrc.json') return true
      return false
    })
    
    fs.readFileSync.mockImplementation((path) => {
      if (path === './package.json') return JSON.stringify(mockPackageJson)
      if (path === '.verbump-jsrc.json') return JSON.stringify(config)
      return ''
    })

    await bumpVersion('patch')
    
    expect(updateChangelog).not.toHaveBeenCalled()
  })

  it('should use custom changelog file from config', async () => {
    const config = { changelogFile: 'HISTORY.md' }
    const { updateChangelog } = await import('../src/changelog.js')
    
    fs.existsSync.mockImplementation((path) => {
      if (path === '.verbump-jsrc.json') return true
      return false
    })
    
    fs.readFileSync.mockImplementation((path) => {
      if (path === './package.json') return JSON.stringify(mockPackageJson)
      if (path === '.verbump-jsrc.json') return JSON.stringify(config)
      return ''
    })

    await bumpVersion('patch')
    
    expect(updateChangelog).toHaveBeenCalledWith('1.0.1', 'HISTORY.md', { generateFromCommits: false })
  })

  it('should generate changelog from commits when enabled in options', async () => {
    const { updateChangelog } = await import('../src/changelog.js')
    
    await bumpVersion('patch', { generateChangelog: true })
    
    expect(updateChangelog).toHaveBeenCalledWith('1.0.1', 'CHANGELOG.md', { generateFromCommits: true })
  })

  it('should generate changelog from commits when enabled in config', async () => {
    const config = { generateChangelogFromCommits: true }
    const { updateChangelog } = await import('../src/changelog.js')
    
    fs.existsSync.mockImplementation((path) => {
      if (path === '.verbump-jsrc.json') return true
      return false
    })
    
    fs.readFileSync.mockImplementation((path) => {
      if (path === './package.json') return JSON.stringify(mockPackageJson)
      if (path === '.verbump-jsrc.json') return JSON.stringify(config)
      return ''
    })

    await bumpVersion('patch')
    
    expect(updateChangelog).toHaveBeenCalledWith('1.0.1', 'CHANGELOG.md', { generateFromCommits: true })
  })

  it('should perform git operations by default', async () => {
    const { gitCommitAndTag } = await import('../src/git.js')
    
    await bumpVersion('patch')
    
    expect(gitCommitAndTag).toHaveBeenCalledWith(
      '1.0.1',
      'v1.0.1'
    )
  })

  it('should not perform git operations when disabled', async () => {
    const { gitCommitAndTag } = await import('../src/git.js')
    
    await bumpVersion('patch', { git: false })
    
    expect(gitCommitAndTag).not.toHaveBeenCalled()
  })

  it('should use custom commit message from config', async () => {
    const config = { tagPrefix: 'v' }
    const { gitCommitAndTag } = await import('../src/git.js')
    
    fs.existsSync.mockImplementation((path) => {
      if (path === '.verbump-jsrc.json') return true
      return false
    })
    
    fs.readFileSync.mockImplementation((path) => {
      if (path === './package.json') return JSON.stringify(mockPackageJson)
      if (path === '.verbump-jsrc.json') return JSON.stringify(config)
      return ''
    })

    await bumpVersion('patch')
    
    expect(gitCommitAndTag).toHaveBeenCalledWith(
      '1.0.1',
      'v1.0.1'
    )
  })

  it('should use custom tag prefix from config', async () => {
    const config = { tagPrefix: 'release-' }
    const { gitCommitAndTag } = await import('../src/git.js')
    
    fs.existsSync.mockImplementation((path) => {
      if (path === '.verbump-jsrc.json') return true
      return false
    })
    
    fs.readFileSync.mockImplementation((path) => {
      if (path === './package.json') return JSON.stringify(mockPackageJson)
      if (path === '.verbump-jsrc.json') return JSON.stringify(config)
      return ''
    })

    await bumpVersion('patch')
    
    expect(gitCommitAndTag).toHaveBeenCalledWith(
      '1.0.1',
      'release-1.0.1'
    )
  })

  it('should push when enabled in config', async () => {
    const config = { push: true }
    const { gitPush } = await import('../src/git.js')
    
    fs.existsSync.mockImplementation((path) => {
      if (path === '.verbump-jsrc.json') return true
      return false
    })
    
    fs.readFileSync.mockImplementation((path) => {
      if (path === './package.json') return JSON.stringify(mockPackageJson)
      if (path === '.verbump-jsrc.json') return JSON.stringify(config)
      return ''
    })

    await bumpVersion('patch')
    
    expect(gitPush).toHaveBeenCalled()
  })

  it('should push when enabled in options', async () => {
    const { gitPush } = await import('../src/git.js')
    
    await bumpVersion('patch', { push: true })
    
    expect(gitPush).toHaveBeenCalled()
  })

  it('should not push when disabled in config', async () => {
    const config = { push: false }
    const { gitPush } = await import('../src/git.js')
    
    fs.existsSync.mockImplementation((path) => {
      if (path === '.verbump-jsrc.json') return true
      return false
    })
    
    fs.readFileSync.mockImplementation((path) => {
      if (path === './package.json') return JSON.stringify(mockPackageJson)
      if (path === '.verbump-jsrc.json') return JSON.stringify(config)
      return ''
    })

    await bumpVersion('patch')
    
    expect(gitPush).not.toHaveBeenCalled()
  })

  it('should update changelog only without version bump', async () => {
    const { updateChangelog } = await import('../src/changelog.js')
    
    const result = await updateChangelogOnly()
    
    expect(result).toBe('1.0.0')
    expect(updateChangelog).toHaveBeenCalledWith('1.0.0', 'CHANGELOG.md', { generateFromCommits: false })
  })

  it('should update changelog only with generation enabled', async () => {
    const { updateChangelog } = await import('../src/changelog.js')
    
    const result = await updateChangelogOnly({ generateChangelog: true })
    
    expect(result).toBe('1.0.0')
    expect(updateChangelog).toHaveBeenCalledWith('1.0.0', 'CHANGELOG.md', { generateFromCommits: true })
  })

  it('should update changelog only with config file', async () => {
    const config = { 
      generateChangelogFromCommits: true,
      changelogFile: 'HISTORY.md'
    }
    const { updateChangelog } = await import('../src/changelog.js')
    
    fs.existsSync.mockImplementation((path) => {
      if (path === '.verbump-jsrc.json') return true
      return false
    })
    
    fs.readFileSync.mockImplementation((path) => {
      if (path === './package.json') return JSON.stringify(mockPackageJson)
      if (path === '.verbump-jsrc.json') return JSON.stringify(config)
      return ''
    })

    const result = await updateChangelogOnly()
    
    expect(result).toBe('1.0.0')
    expect(updateChangelog).toHaveBeenCalledWith('1.0.0', 'HISTORY.md', { generateFromCommits: true })
  })
})
