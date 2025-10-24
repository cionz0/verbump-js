import { execSync } from "child_process";
import chalk from "chalk";

export function gitCommitAndTag(version, tag) {
  try {
    execSync("git add package.json", { stdio: "inherit" });
    execSync("git commit --amend --no-edit", { stdio: "inherit" });
    execSync(`git tag ${tag}`, { stdio: "inherit" });
    console.log(chalk.green(`🏷️  Created tag ${tag}`));
  } catch (e) {
    console.error(chalk.red("⚠️ Git Error:"), e.message);
  }
}

export function gitPush() {
  try {
    execSync("git push origin main --tags", { stdio: "inherit" });
    console.log(chalk.green("🚀 Push completed"));
  } catch (e) {
    console.error(chalk.red("⚠️ Push Error:"), e.message);
  }
}
