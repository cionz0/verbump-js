# @cionz0/verbump-js

[![Version](https://img.shields.io/badge/version-1.2.3-blue.svg?style=flat-square)](https://github.com/cionz0/verbump-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg?style=flat-square)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow.svg?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CLI](https://img.shields.io/badge/CLI-Tool-blue.svg?style=flat-square)](https://en.wikipedia.org/wiki/Command-line_interface)

> 🚀 **Lightweight version bump CLI for Node.js projects** with smart changelog generation and commit-amend workflow.

A modern, fast, and feature-rich CLI tool for managing semantic versioning in Node.js projects. Generate meaningful changelogs from your git commits and maintain clean git history with commit-amend workflow.

## ✨ Features

- 🎯 **Semantic Versioning**: Patch, minor, and major version bumps
- 📝 **Smart Changelog Generation**: Auto-generate changelogs from git commits
- 🔄 **Commit-Amend Workflow**: Clean git history without extra commits
- 🏷️ **Conventional Commits**: Categorize changes automatically
- 🔧 **Automatic Version Updates**: Update version references across all files
- ⚙️ **Flexible Configuration**: Customize behavior via config file
- 🚀 **Zero Dependencies**: Lightweight and fast
- 🧪 **Fully Tested**: Comprehensive test suite with 100% coverage

## 📦 Installation

### NPM
```bash
npm install -D @cionz0/verbump-js
npx verbump-js setup  # Interactive setup with changelog configuration
```

### GitHub
```bash
npm install -D git+https://github.com/cionz0/verbump-js.git
npx verbump-js setup  # Interactive setup with changelog configuration
```

### Global Installation
```bash
npm install -g @cionz0/verbump-js
```

## 🚀 Quick Start

### 1. Setup (First Time)
```bash
# Run interactive setup to configure changelog preferences
npx verbump-js setup
```

The setup will ask you:
- ✅ **Add helpful scripts** to your `package.json`
- 📝 **Changelog file location** (CHANGELOG.md, CHANGES.md, HISTORY.md, or custom)
- 🔄 **Generate from commits** (automatic changelog generation from git commits)

### 2. Usage
```bash
# Basic version bump
npx verbump-js patch

# Bump with changelog generation
npx verbump-js minor --generate-changelog

# Bump and push to remote
npx verbump-js major --push

# Bump with automatic version updates across all files
npx verbump-js patch

# Dry run to see what would be updated
npx verbump-js minor --dry-run

# Update changelog only (no version bump)
npx verbump-js changelog --generate-changelog
```

## 📖 Usage

### Basic Commands

```bash
npx verbump-js <type> [options]
```

**Version Types:**
- `patch` - Bug fixes (1.0.0 → 1.0.1)
- `minor` - New features (1.0.0 → 1.1.0)  
- `major` - Breaking changes (1.0.0 → 2.0.0)
- `changelog` - Update changelog only
- `setup` - Add suggested scripts to package.json

### Examples

```bash
# Patch release with changelog
npx verbump-js patch --generate-changelog

# Minor release with push
npx verbump-js minor --push

# Major release with both
npx verbump-js major --generate-changelog --push

# Update changelog for current version
npx verbump-js changelog --generate-changelog

# Skip version updates in other files
npx verbump-js patch --no-version-update

# Dry run to preview changes
npx verbump-js minor --dry-run

# Add suggested scripts to package.json
npx verbump-js setup
```

## ⚙️ Configuration

The setup process automatically creates a `.verbump-jsrc.json` file with your preferences:

```json
{
  "changelogFile": "HISTORY.md",
  "generateChangelogFromCommits": true,
  "updateVersionReferences": true,
  "versionUpdateFiles": [
    "README.md",
    "CHANGELOG.md",
    "*.md",
    "src/**/*.js",
    "bin/**/*.js"
  ],
  "tagPrefix": "v",
  "push": false,
  "updateChangelog": true
}
```

### Manual Configuration

You can also create or modify `.verbump-jsrc.json` manually:

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `changelogFile` | string | `"CHANGELOG.md"` | Changelog file path (set during setup) |
| `generateChangelogFromCommits` | boolean | `false` | Generate changelog from git commits (set during setup) |
| `updateVersionReferences` | boolean | `true` | Update version references in other files |
| `versionUpdateFiles` | array | `["README.md", "CHANGELOG.md", "*.md", "src/**/*.js", "bin/**/*.js"]` | Files to scan for version updates |
| `versionUpdatePatterns` | array | `[see example]` | Custom regex patterns for version matching |
| `tagPrefix` | string | `"v"` | Prefix for git tags (e.g., "v1.0.0") |
| `push` | boolean | `false` | Automatically push to remote |
| `updateChangelog` | boolean | `true` | Update changelog file |

## 🛠️ CLI Options

| Option | Description |
|--------|-------------|
| `--no-git` | Update version only, without commit or tag |
| `--push` | Also execute `git push origin main --tags` |
| `--no-changelog` | Don't update the changelog |
| `--generate-changelog` | Generate changelog from git commits |
| `--no-version-update` | Don't update version references in other files |
| `--dry-run` | Show what would be updated without making changes |

## 📝 Changelog Generation

The tool can generate meaningful changelogs from your git commits with commit hash and author information:

### 🚀 Basic Usage
```bash
# Generate changelog from commits since last tag (with version bump)
npx verbump-js patch --generate-changelog

# Update changelog only (no version bump)
npx verbump-js changelog --generate-changelog
```

### 📋 Changelog Format
Each changelog entry includes:
- **Commit hash** (first 7 characters)
- **Author name**
- **Clean commit message** (without conventional commit prefixes)

### 📄 Example Output
```markdown
## 1.0.1 - 2025-10-25

### ✨ Features
- add hello world functionality (971de40 by cionzo)

### 🐛 Bug Fixes
- add error handling to prevent crashes (cd49b21 by cionzo)

### 📝 Other Changes
- update README with usage examples (3c35fbd by cionzo)
```

### ⚙️ Configuration
Enable automatic changelog generation in your `.verbump-jsrc.json`:
```json
{
  "generateChangelogFromCommits": true,
  "changelogFile": "CHANGELOG.md"
}
```

### 🏷️ Commit Categorization
The tool automatically categorizes commits:

| Type | Keywords | Emoji | Description |
|------|----------|-------|-------------|
| **Features** | `feat:`, `feature:` | ✨ | New functionality |
| **Bug Fixes** | `fix:`, `bug:` | 🐛 | Bug fixes and patches |
| **Breaking Changes** | `BREAKING CHANGE:`, `!:` | ⚠️ | Breaking changes |
| **Other Changes** | All others | 📝 | Documentation, chores, etc. |

### 📄 Example Output
```markdown
## 1.2.3 - 2023-12-25

### ✨ Features
- Add user authentication
- Implement dark mode

### 🐛 Bug Fixes
- Fix login validation
- Resolve memory leak

### 📝 Other Changes
- Update dependencies
- Improve documentation
```

### 🔄 Changelog-Only Updates

Sometimes you want to update the changelog without bumping the version:

```bash
# Update changelog with current version
npx verbump-js changelog

# Generate changelog from commits (no version bump)
npx verbump-js changelog --generate-changelog
```

**Use cases:**
- 📝 Update changelog for the current version
- 🚧 Document changes before a new release
- 🔄 Regenerate changelog with better formatting

## 🔧 Automatic Version Updates

The tool automatically updates version references across your project files:

### 🎯 What Gets Updated
- **README.md**: Version badges and references
- **CHANGELOG.md**: Version headers
- **package.json**: Version field (always updated)
- **Source files**: Version strings in comments and code
- **Documentation**: Version references in markdown files

### 📝 Supported Patterns
```javascript
// Badge patterns
[![Version](https://img.shields.io/badge/version-1.2.3-blue.svg)]

// JSON patterns
"version": "1.2.3"
'version': '1.2.3'

// Header patterns
## 1.2.3 - 2024-01-01

// Comment patterns
version: 1.2.3
```

### ⚙️ Custom Patterns
Configure custom patterns in `.verbump-jsrc.json`:

```json
{
  "versionUpdatePatterns": [
    {
      "pattern": "(version-)([0-9]+\\.[0-9]+\\.[0-9]+)",
      "replacement": "$1${newVersion}"
    },
    {
      "pattern": "(VERSION\\s*=\\s*['\"])([0-9]+\\.[0-9]+\\.[0-9]+)(['\"])",
      "replacement": "$1${newVersion}$3"
    }
  ]
}
```

### 🚀 Usage Examples
```bash
# Update version and all references
npx verbump-js patch

# Preview what would be updated
npx verbump-js minor --dry-run

# Skip version updates in other files
npx verbump-js patch --no-version-update
```

## 🎯 Workflow Examples

### Standard Release Process
```bash
# 1. Make your changes
git commit -m "feat: add new authentication system"
git commit -m "fix: resolve login validation bug"

# 2. Bump version with changelog
npx verbump-js minor --generate-changelog

# 3. Push to remote
npx verbump-js minor --generate-changelog --push
```

### Pre-Release Documentation
```bash
# Document changes before release
npx verbump-js changelog --generate-changelog

# Review the changelog, then bump when ready
npx verbump-js patch --generate-changelog --push
```

## 📋 Package.json Scripts

Add these scripts to your `package.json` for easy version management:

```json
{
  "scripts": {
    "bump:patch": "verbump-js patch --generate-changelog",
    "bump:minor": "verbump-js minor --generate-changelog", 
    "bump:major": "verbump-js major --generate-changelog",
    "bump:patch:push": "verbump-js patch --generate-changelog --push",
    "bump:minor:push": "verbump-js minor --generate-changelog --push",
    "bump:major:push": "verbump-js major --generate-changelog --push",
    "changelog": "verbump-js changelog --generate-changelog"
  }
}
```

Then use:
```bash
npm run bump:patch
npm run bump:minor:push
npm run changelog
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js) for CLI parsing
- Uses [Semver](https://github.com/npm/node-semver) for version management
- Inspired by conventional commit standards
