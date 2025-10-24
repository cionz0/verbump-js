import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

/**
 * Updates version numbers across multiple files and patterns
 * @param {string} oldVersion - Current version
 * @param {string} newVersion - New version to set
 * @param {Object} options - Configuration options
 * @param {Array} options.files - Array of file patterns to update
 * @param {Array} options.patterns - Array of regex patterns to match and replace
 * @param {boolean} options.dryRun - If true, only show what would be changed
 * @returns {Object} Summary of changes made
 */
export function updateVersionInFiles(oldVersion, newVersion, options = {}) {
  const {
    files = [
      'README.md',
      'package.json',
      'CHANGELOG.md',
      '*.md',
      'src/**/*.js',
      'bin/**/*.js'
    ],
    patterns = [
      // Badge patterns
      { 
        pattern: new RegExp(`(version-)([0-9]+\\.[0-9]+\\.[0-9]+)`, 'g'),
        replacement: `$1${newVersion}`
      },
      // Version in quotes
      { 
        pattern: new RegExp(`("version"\\s*:\\s*")([0-9]+\\.[0-9]+\\.[0-9]+)(")`, 'g'),
        replacement: `$1${newVersion}$3`
      },
      // Version in single quotes
      { 
        pattern: new RegExp(`('version'\\s*:\\s*')([0-9]+\\.[0-9]+\\.[0-9]+)(')`, 'g'),
        replacement: `$1${newVersion}$3`
      },
      // Version in comments
      { 
        pattern: new RegExp(`(version\\s*:\\s*)([0-9]+\\.[0-9]+\\.[0-9]+)`, 'g'),
        replacement: `$1${newVersion}`
      },
      // Version in headers
      { 
        pattern: new RegExp(`(##\\s+)([0-9]+\\.[0-9]+\\.[0-9]+)(\\s)`, 'g'),
        replacement: `$1${newVersion}$3`
      }
    ],
    dryRun = false
  } = options;

  const results = {
    updated: [],
    skipped: [],
    errors: [],
    totalChanges: 0
  };

  // Get all files to process
  const filesToProcess = getFilesToProcess(files);
  
  console.log(chalk.blue(`\n🔍 Scanning ${filesToProcess.length} files for version references...`));

  for (const filePath of filesToProcess) {
    try {
      const result = updateFileVersion(filePath, oldVersion, newVersion, patterns, dryRun);
      
      if (result.changes > 0) {
        results.updated.push({
          file: filePath,
          changes: result.changes,
          lines: result.lines
        });
        results.totalChanges += result.changes;
        
        if (!dryRun) {
          console.log(chalk.green(`✅ Updated ${result.changes} occurrence(s) in ${filePath}`));
        } else {
          console.log(chalk.yellow(`🔍 Would update ${result.changes} occurrence(s) in ${filePath}`));
        }
      } else {
        results.skipped.push(filePath);
      }
    } catch (error) {
      results.errors.push({
        file: filePath,
        error: error.message
      });
      console.log(chalk.red(`❌ Error processing ${filePath}: ${error.message}`));
    }
  }

  return results;
}

/**
 * Get list of files to process based on glob patterns
 * @param {Array} patterns - File patterns to match
 * @returns {Array} Array of file paths
 */
function getFilesToProcess(patterns) {
  const files = new Set();
  
  for (const pattern of patterns) {
    if (pattern.includes('*') || pattern.includes('**')) {
      // Simple glob pattern matching
      const matches = findFilesByPattern(pattern);
      matches.forEach(file => files.add(file));
    } else {
      // Direct file path
      if (fs.existsSync(pattern)) {
        files.add(pattern);
      }
    }
  }
  
  return Array.from(files);
}

/**
 * Simple glob pattern matching
 * @param {string} pattern - Glob pattern
 * @returns {Array} Matching file paths
 */
function findFilesByPattern(pattern) {
  const files = [];
  const cwd = process.cwd();
  
  function walkDir(dir, relativePath = '') {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and other common directories
          if (!['node_modules', '.git', 'coverage', 'dist', 'build'].includes(item)) {
            walkDir(fullPath, relativeItemPath);
          }
        } else if (stat.isFile()) {
          // Convert glob pattern to regex
          const regexPattern = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\./g, '\\.');
          
          const regex = new RegExp(`^${regexPattern}$`);
          if (regex.test(relativeItemPath)) {
            files.push(relativeItemPath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  walkDir(cwd);
  return files;
}

/**
 * Update version in a single file
 * @param {string} filePath - Path to file
 * @param {string} oldVersion - Current version
 * @param {string} newVersion - New version
 * @param {Array} patterns - Patterns to match and replace
 * @param {boolean} dryRun - If true, don't write changes
 * @returns {Object} Result of the update
 */
function updateFileVersion(filePath, oldVersion, newVersion, patterns, dryRun) {
  if (!fs.existsSync(filePath)) {
    throw new Error('File does not exist');
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let changes = 0;
  const changedLines = [];
  
  // Apply each pattern
  for (const { pattern, replacement } of patterns) {
    const matches = newContent.match(pattern);
    if (matches) {
      const beforeReplace = newContent;
      newContent = newContent.replace(pattern, replacement);
      
      if (beforeReplace !== newContent) {
        changes += matches.length;
        
        // Find which lines were changed
        const lines = beforeReplace.split('\n');
        const newLines = newContent.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i] !== newLines[i]) {
            changedLines.push(i + 1);
          }
        }
      }
    }
  }
  
  // Write changes if not dry run
  if (!dryRun && changes > 0) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
  
  return {
    changes,
    lines: changedLines
  };
}

/**
 * Update version in package.json specifically
 * @param {string} newVersion - New version to set
 * @param {string} packagePath - Path to package.json
 * @returns {boolean} Whether the version was updated
 */
export function updatePackageJsonVersion(newVersion, packagePath = './package.json') {
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const oldVersion = pkg.version;
    
    if (oldVersion !== newVersion) {
      pkg.version = newVersion;
      fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(`Failed to update package.json: ${error.message}`);
  }
}

/**
 * Get current version from package.json
 * @param {string} packagePath - Path to package.json
 * @returns {string} Current version
 */
export function getCurrentVersion(packagePath = './package.json') {
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return pkg.version;
  } catch (error) {
    throw new Error(`Failed to read package.json: ${error.message}`);
  }
}
