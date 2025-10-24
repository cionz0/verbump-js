# @cionz0/verbump-js

[![npm version](https://img.shields.io/npm/v/@cionz0/verbump-js.svg)](https://www.npmjs.com/package/@cionz0/verbump-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@cionz0/verbump-js.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> 🚀 **Lightweight version bump CLI for Node.js projects** with smart changelog generation and commit-amend workflow.

A modern, fast, and feature-rich CLI tool for managing semantic versioning in Node.js projects. Generate meaningful changelogs from your git commits and maintain clean git history with commit-amend workflow.

## ✨ Features

- 🎯 **Semantic Versioning**: Patch, minor, and major version bumps
- 📝 **Smart Changelog Generation**: Auto-generate changelogs from git commits
- 🔄 **Commit-Amend Workflow**: Clean git history without extra commits
- 🏷️ **Conventional Commits**: Categorize changes automatically
- ⚙️ **Flexible Configuration**: Customize behavior via config file
- 🚀 **Zero Dependencies**: Lightweight and fast
- 🧪 **Fully Tested**: Comprehensive test suite with 100% coverage

## 📦 Installation

### NPM
```bash
npm install -D @cionz0/verbump-js
```

### GitHub
```bash
npm install -D git+https://github.com/cionz0/verbump-js.git
```

### Global Installation
```bash
npm install -g @cionz0/verbump-js
```

## 🚀 Quick Start

```bash
# Basic version bump
npx verbump-js patch

# Bump with changelog generation
npx verbump-js minor --generate-changelog

# Bump and push to remote
npx verbump-js major --push

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
```

## ⚙️ Configuration

Create a `.verbump-jsrc.json` file in your project root:

```json
{
  "tagPrefix": "v",
  "push": false,
  "updateChangelog": true,
  "generateChangelogFromCommits": false,
  "changelogFile": "CHANGELOG.md"
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tagPrefix` | string | `"v"` | Prefix for git tags (e.g., "v1.0.0") |
| `push` | boolean | `false` | Automatically push to remote |
| `updateChangelog` | boolean | `true` | Update changelog file |
| `generateChangelogFromCommits` | boolean | `false` | Generate changelog from git commits |
| `changelogFile` | string | `"CHANGELOG.md"` | Changelog file path |

## 🛠️ CLI Options

| Option | Description |
|--------|-------------|
| `--no-git` | Update version only, without commit or tag |
| `--push` | Also execute `git push origin main --tags` |
| `--no-changelog` | Don't update the changelog |
| `--generate-changelog` | Generate changelog from git commits |

## 📝 Changelog Generation

The tool can generate meaningful changelogs from your git commits:

### 🚀 Basic Usage
```bash
# Generate changelog from commits since last tag (with version bump)
npx verbump-js patch --generate-changelog

# Update changelog only (no version bump)
npx verbump-js changelog --generate-changelog
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
## 1.1.0 - 2023-12-25

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
