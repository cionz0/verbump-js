import fs from "fs";
import chalk from "chalk";
import { execSync } from "child_process";

export function updateChangelog(version, file, options = {}) {
  const now = new Date().toISOString().split("T")[0];
  
  let entry = `\n## ${version} - ${now}\n\n`;
  
  if (options.generateFromCommits) {
    const commits = getCommitsSinceLastTag();
    if (commits.length > 0) {
      entry += generateChangelogFromCommits(commits);
    } else {
      entry += "- Automatic version update.\n";
    }
  } else {
    entry += "- Automatic version update.\n";
  }

  let content = "";
  if (fs.existsSync(file)) {
    content = fs.readFileSync(file, "utf8");
  }

  const newContent = entry + content;
  fs.writeFileSync(file, newContent);
  console.log(chalk.blue(`📝 Changelog updated: ${file}`));
}

function getCommitsSinceLastTag() {
  try {
    // Get the last tag
    const lastTag = execSync("git describe --tags --abbrev=0", { encoding: "utf8" }).trim();
    
    // Get commits since last tag with hash and author
    const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%H|%an|%s"`, { encoding: "utf8" })
      .trim()
      .split('\n')
      .filter(commit => commit.trim() && !commit.includes('bump version'))
      .map(commit => {
        const [hash, author, message] = commit.split('|');
        return { hash: hash.substring(0, 7), author, message };
      });
    
    return commits;
  } catch (error) {
    // If no tags exist, get last 10 commits
    try {
      const commits = execSync("git log -10 --pretty=format:\"%H|%an|%s\"", { encoding: "utf8" })
        .trim()
        .split('\n')
        .filter(commit => commit.trim() && !commit.includes('bump version'))
        .map(commit => {
          const [hash, author, message] = commit.split('|');
          return { hash: hash.substring(0, 7), author, message };
        });
      
      return commits;
    } catch (fallbackError) {
      return [];
    }
  }
}

function generateChangelogFromCommits(commits) {
  const categorized = {
    features: [],
    fixes: [],
    breaking: [],
    other: []
  };

  commits.forEach(commit => {
    const lowerCommit = commit.message.toLowerCase();
    
    if (lowerCommit.includes('feat') || lowerCommit.includes('feature')) {
      categorized.features.push(formatCommit(commit));
    } else if (lowerCommit.includes('fix') || lowerCommit.includes('bug')) {
      categorized.fixes.push(formatCommit(commit));
    } else if (lowerCommit.includes('breaking') || lowerCommit.includes('!:')) {
      categorized.breaking.push(formatCommit(commit));
    } else {
      categorized.other.push(formatCommit(commit));
    }
  });

  let changelog = "";

  if (categorized.breaking.length > 0) {
    changelog += "### ⚠️ Breaking Changes\n";
    categorized.breaking.forEach(change => {
      changelog += `- ${change}\n`;
    });
    changelog += "\n";
  }

  if (categorized.features.length > 0) {
    changelog += "### ✨ Features\n";
    categorized.features.forEach(change => {
      changelog += `- ${change}\n`;
    });
    changelog += "\n";
  }

  if (categorized.fixes.length > 0) {
    changelog += "### 🐛 Bug Fixes\n";
    categorized.fixes.forEach(change => {
      changelog += `- ${change}\n`;
    });
    changelog += "\n";
  }

  if (categorized.other.length > 0) {
    changelog += "### 📝 Other Changes\n";
    categorized.other.forEach(change => {
      changelog += `- ${change}\n`;
    });
    changelog += "\n";
  }

  return changelog || "- Automatic version update.\n";
}

function formatCommit(commit) {
  // Remove conventional commit prefixes
  const cleanMessage = commit.message
    .replace(/^(feat|feature|fix|bug|chore|docs|style|refactor|perf|test|ci|build|revert)(\(.+\))?:?\s*/i, '')
    .trim();
  
  // Format: message (hash by author)
  return `${cleanMessage} (${commit.hash} by ${commit.author})`;
}
