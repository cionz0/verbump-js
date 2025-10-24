import fs from "fs";
import semver from "semver";
import chalk from "chalk";
import { updateChangelog } from "./changelog.js";
import { gitCommitAndTag, gitPush } from "./git.js";

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

  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  console.log(chalk.cyan(`📦 ${oldVersion} → ${newVersion}`));

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
