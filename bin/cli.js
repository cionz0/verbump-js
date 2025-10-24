#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import { bumpVersion, updateChangelogOnly } from "../src/bump.js";

program
  .name("verbump-js")
  .description("Lightweight version bump CLI for Node.js projects")
  .argument("[type]", "Type of bump (patch, minor, major) or 'changelog' to update only changelog")
  .option("--no-git", "Update version only, without commit or tag")
  .option("--push", "Also execute git push origin main --tags")
  .option("--no-changelog", "Don't update the changelog")
  .option("--generate-changelog", "Generate changelog from git commits")
  .action(async (type, options) => {
    try {
      if (type === 'changelog') {
        await updateChangelogOnly(options);
        console.log(chalk.green(`✅ Changelog updated`));
      } else if (type && ['patch', 'minor', 'major'].includes(type)) {
        const newVersion = await bumpVersion(type, options);
        console.log(chalk.green(`✅ Version updated to ${newVersion}`));
      } else {
        console.error(chalk.red("❌ Error: Invalid type. Use 'patch', 'minor', 'major', or 'changelog'"));
        process.exit(1);
      }
    } catch (err) {
      console.error(chalk.red("❌ Error:"), err.message);
      process.exit(1);
    }
  });

program.parse();
