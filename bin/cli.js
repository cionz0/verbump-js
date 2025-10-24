#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import { bumpVersion, updateChangelogOnly } from "../src/bump.js";
import { setupScripts } from "../scripts/setup.js";

program
  .name("verbump-js")
  .description("Lightweight version bump CLI for Node.js projects")
  .argument("[type]", "Type of bump (patch, minor, major), 'changelog' to update only changelog, or 'setup' to add scripts")
  .option("--no-git", "Update version only, without commit or tag")
  .option("--push", "Also execute git push origin main --tags")
  .option("--no-changelog", "Don't update the changelog")
  .option("--generate-changelog", "Generate changelog from git commits")
  .option("--no-version-update", "Don't update version references in other files")
  .option("--dry-run", "Show what would be updated without making changes")
  .action(async (type, options) => {
    try {
      if (type === 'changelog') {
        await updateChangelogOnly(options);
        console.log(chalk.green(`✅ Changelog updated`));
      } else if (type === 'setup') {
        setupScripts();
      } else if (type && ['patch', 'minor', 'major'].includes(type)) {
        const bumpOptions = {
          ...options,
          updateVersionReferences: !options.noVersionUpdate,
          dryRun: options.dryRun
        };
        const newVersion = await bumpVersion(type, bumpOptions);
        console.log(chalk.green(`✅ Version updated to ${newVersion}`));
      } else {
        console.error(chalk.red("❌ Error: Invalid type. Use 'patch', 'minor', 'major', 'changelog', or 'setup'"));
        process.exit(1);
      }
    } catch (err) {
      console.error(chalk.red("❌ Error:"), err.message);
      process.exit(1);
    }
  });

program.parse();
