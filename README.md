# @cionz0/verbump-js

Lightweight version bump CLI for Node.js projects.

## Installation

```bash
npm install -D @cionz0/verbump-js
```

Or from GitHub:
```bash
npm install -D git+https://github.com/cionz0/verbump-js.git
```

## Usage

```bash
npx verbump-js <type> [options]
```

Examples:

```bash
npx verbump-js patch
npx verbump-js minor --push
npx verbump-js major --no-git
npx verbump-js changelog --generate-changelog
```

## Configuration

Create a `.verbump-jsrc.json` file in the project root:

```json
{
  "tagPrefix": "v",
  "push": false,
  "updateChangelog": true,
  "generateChangelogFromCommits": false,
  "changelogFile": "CHANGELOG.md"
}
```

## Options

- `--no-git`: Update version only, without commit or tag
- `--push`: Also execute `git push origin main --tags`
- `--no-changelog`: Don't update the changelog
- `--generate-changelog`: Generate changelog from git commits

## Changelog Generation

The tool can generate meaningful changelogs from your git commits:

### Basic Usage
```bash
# Generate changelog from commits since last tag (with version bump)
npx verbump-js patch --generate-changelog

# Update changelog only (no version bump)
npx verbump-js changelog --generate-changelog
```

### Configuration
Enable automatic changelog generation in your `.verbump-jsrc.json`:
```json
{
  "generateChangelogFromCommits": true,
  "changelogFile": "CHANGELOG.md"
}
```

### Commit Categorization
The tool automatically categorizes commits:
- **✨ Features**: `feat:` or `feature:` commits
- **🐛 Bug Fixes**: `fix:` or `bug:` commits  
- **⚠️ Breaking Changes**: `BREAKING CHANGE:` or `!:` commits
- **📝 Other Changes**: All other commits

### Example Output
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

### Changelog-Only Updates

Sometimes you want to update the changelog without bumping the version:

```bash
# Update changelog with current version
npx verbump-js changelog

# Generate changelog from commits (no version bump)
npx verbump-js changelog --generate-changelog
```

This is useful when:
- You want to update the changelog for the current version
- You've made commits but aren't ready for a new release
- You want to regenerate the changelog with better formatting

## Features

- ✅ Semantic version bumping (patch, minor, major)
- ✅ Automatic changelog generation
- ✅ Smart changelog generation from git commits
- ✅ Conventional commit categorization (feat, fix, breaking)
- ✅ Git commit and tag creation
- ✅ Configurable tag prefixes
- ✅ Optional git push functionality
- ✅ Lightweight with minimal dependencies

## Recommended Scripts

```json
"scripts": {
  "bump:patch": "verbump-js patch",
  "bump:minor": "verbump-js minor",
  "bump:major": "verbump-js major"
}
```
