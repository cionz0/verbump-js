import fs from "fs";
import semver from "semver";
import chalk from "chalk";
import { updateChangelog } from "./changelog.js";
import { gitCommitAndTag, gitPush } from "./git.js";
import { updateVersionInFiles, updatePackageJsonVersion } from "./version-updater.js";

export async function bumpVersion(type, options = {}) {
  const configPath = ".verbump-jsrc.json";
  const config = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, "utf8"))
    : {};

  const pkgPath = "./package.json";
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const oldVersion = pkg.version;
  const newVersion = semver.inc(oldVersion, type);

  if (!newVersion) throw new Error("Invalid version increment");

  // Update package.json version
  updatePackageJsonVersion(newVersion, pkgPath);

  console.log(chalk.cyan(`📦 ${oldVersion} → ${newVersion}`));

  // Update version references across all files
  if (config.updateVersionReferences !== false && options.updateVersionReferences !== false) {
    console.log(chalk.blue(`\n🔄 Updating version references across files...`));
    
    const versionUpdateOptions = {
      files: config.versionUpdateFiles || [
        'README.md',
        'CHANGELOG.md',
        '*.md',
        'src/**/*.js',
        'bin/**/*.js'
      ],
      patterns: config.versionUpdatePatterns,
      dryRun: options.dryRun || false
    };

    const updateResults = updateVersionInFiles(oldVersion, newVersion, versionUpdateOptions);
    
    if (updateResults.totalChanges > 0) {
      console.log(chalk.green(`✅ Updated ${updateResults.totalChanges} version reference(s) across ${updateResults.updated.length} file(s)`));
      
      if (updateResults.errors.length > 0) {
        console.log(chalk.yellow(`⚠️  ${updateResults.errors.length} file(s) had errors during version update`));
      }
    } else {
      console.log(`ℹ️  No version references found to update`);
    }
  }

  if (config.updateChangelog !== false && options.changelog !== false) {
    const changelogOptions = {
      generateFromCommits: config.generateChangelogFromCommits || options.generateChangelog || false
    };
    updateChangelog(newVersion, config.changelogFile || "CHANGELOG.md", changelogOptions);
  }

  if (options.git !== false) {
    const tag = `${config.tagPrefix || "v"}${newVersion}`;

    gitCommitAndTag(newVersion, tag);

    if (config.push || options.push) {
      gitPush();
    }
  }

  return newVersion;
}

export async function updateChangelogOnly(options = {}) {
  const configPath = ".verbump-jsrc.json";
  const config = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, "utf8"))
    : {};

  const pkgPath = "./package.json";
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const currentVersion = pkg.version;

  const changelogOptions = {
    generateFromCommits: config.generateChangelogFromCommits || options.generateChangelog || false
  };
  
  updateChangelog(currentVersion, config.changelogFile || "CHANGELOG.md", changelogOptions);
  
  return currentVersion;
}
