import fs from "fs";
import chalk from "chalk";
import { execSync } from "child_process";

export function updateChangelog(version, file, options = {}) {
  const now = new Date();
  const humanDate = formatHumanDate(now);
  
  let entry = `\n# ${version}\n[${humanDate}]\n\n`;
  
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

export function regenerateChangelog(file, options = {}) {
  if (!options.generateFromCommits) {
    console.log(chalk.yellow(`ℹ️  No commits to process. Use --generate-changelog to generate from git commits.`));
    return;
  }

  // Generate complete changelog from git history
  const completeChangelog = generateCompleteChangelog();
  fs.writeFileSync(file, completeChangelog);
  console.log(chalk.blue(`📝 Changelog regenerated from git history: ${file}`));
}

function generateCompleteChangelog() {
  try {
    // Get all tags sorted by version
    const tags = execSync("git tag --sort=-version:refname", { encoding: "utf8" })
      .trim()
      .split('\n')
      .filter(tag => tag.trim());

    let changelog = "# Changelog\n\n";
    changelog += "All notable changes to this project will be documented in this file.\n\n";

    // Process each tag
    for (let i = 0; i < tags.length; i++) {
      const currentTag = tags[i];
      const nextTag = tags[i + 1];
      
      // Get version from tag (remove 'v' prefix if present)
      const version = currentTag.replace(/^v/, '');
      
      // Get commits between this tag and the next one
      const commits = getCommitsBetweenTags(nextTag, currentTag);
      
      if (commits.length > 0) {
        // Get tag date in human readable form
        const tagIso = execSync(`git log -1 --format=%cI ${currentTag}`, { encoding: "utf8" })
          .trim();
        const humanDate = formatHumanDate(new Date(tagIso));
        
        changelog += `# ${version}\n[${humanDate}]\n\n`;
        changelog += generateChangelogFromCommits(commits);
        changelog += '\n';
      }
    }

    // Add commits before any tags (if any)
    const commitsBeforeTags = getCommitsBeforeFirstTag();
    if (commitsBeforeTags.length > 0) {
      const firstIso = execSync("git log --reverse --format=%cI | head -1", { encoding: "utf8" })
        .trim();
      const humanDate = formatHumanDate(new Date(firstIso));
      
      changelog += `# Unreleased\n[${humanDate}]\n\n`;
      changelog += generateChangelogFromCommits(commitsBeforeTags);
      changelog += '\n';
    }

    return changelog;
  } catch (error) {
    console.error("Error generating changelog:", error.message);
    return "# Changelog\n\nError generating changelog from git history.\n";
  }
}

function getCommitsBetweenTags(fromTag, toTag) {
  try {
    const range = fromTag ? `${fromTag}..${toTag}` : toTag;
    const commits = execSync(`git log ${range} --pretty=format:"%H|%h|%an|%cI|%s"`, { encoding: "utf8" })
      .trim()
      .split('\n')
      .filter(commit => commit.trim() && !commit.includes('bump version') && !commit.includes('version bump'))
      .map(commit => {
        const [fullHash, shortHash, author, dateIso, message] = commit.split('|');
        return { hash: shortHash, fullHash, author, dateIso, message };
      });
    
    return commits;
  } catch (error) {
    return [];
  }
}

function getCommitsBeforeFirstTag() {
  try {
    const commits = execSync("git log --pretty=format:\"%H|%h|%an|%cI|%s\"", { encoding: "utf8" })
      .trim()
      .split('\n')
      .filter(commit => commit.trim() && !commit.includes('bump version') && !commit.includes('version bump'))
      .map(commit => {
        const [fullHash, shortHash, author, dateIso, message] = commit.split('|');
        return { hash: shortHash, fullHash, author, dateIso, message };
      });
    
    return commits;
  } catch (error) {
    return [];
  }
}


function getCommitsSinceLastTag() {
  try {
    // Get the last tag
    const lastTag = execSync("git describe --tags --abbrev=0", { encoding: "utf8" }).trim();
    
    // Get commits since last tag with hash and author
    const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:\"%H|%h|%an|%cI|%s\"`, { encoding: "utf8" })
      .trim()
      .split('\n')
      .filter(commit => commit.trim() && !commit.includes('bump version'))
      .map(commit => {
        const [fullHash, shortHash, author, dateIso, message] = commit.split('|');
        return { hash: shortHash, fullHash, author, dateIso, message };
      });
    
    return commits;
  } catch (error) {
    // If no tags exist, get last 10 commits
    try {
      const commits = execSync("git log -10 --pretty=format:\"%H|%h|%an|%cI|%s\"", { encoding: "utf8" })
        .trim()
        .split('\n')
        .filter(commit => commit.trim() && !commit.includes('bump version'))
        .map(commit => {
          const [fullHash, shortHash, author, dateIso, message] = commit.split('|');
          return { hash: shortHash, fullHash, author, dateIso, message };
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
      changelog += `* ${change}\n`;
    });
    changelog += "\n";
  }

  if (categorized.features.length > 0) {
    changelog += "### ✨ Features\n";
    categorized.features.forEach(change => {
      changelog += `* ${change}\n`;
    });
    changelog += "\n";
  }

  if (categorized.fixes.length > 0) {
    changelog += "### 🐛 Bug Fixes\n";
    categorized.fixes.forEach(change => {
      changelog += `* ${change}\n`;
    });
    changelog += "\n";
  }

  if (categorized.other.length > 0) {
    changelog += "### 📝 Other Changes\n";
    categorized.other.forEach(change => {
      changelog += `* ${change}\n`;
    });
    changelog += "\n";
  }

  return changelog || "- Automatic version update.\n";
}

function formatCommit(commit) {
  const timestamp = commit.dateIso || '';
  const author = commit.author || '';
  const message = commit.message || '';
  const link = buildCommitLink(commit);
  return `${timestamp} [${author}] - ${message} (${link})`;
}

function buildCommitLink(commit) {
  const short = commit.hash;
  const full = commit.fullHash || short;
  try {
    const remote = execSync("git config --get remote.origin.url", { encoding: "utf8" }).trim();
    if (!remote) return `\`${short}\``;
    const parsed = normalizeRemoteUrl(remote);
    if (!parsed) return `\`${short}\``;
    const { host, owner, repo } = parsed;
    let url;
    if (host.includes('bitbucket')) {
      url = `https://${host}/${owner}/${repo}/commits/${full}`;
    } else if (host.includes('github')) {
      url = `https://${host}/${owner}/${repo}/commit/${full}`;
    } else if (host.includes('gitlab')) {
      url = `https://${host}/${owner}/${repo}/-/commit/${full}`;
    } else {
      return `\`${short}\``;
    }
    return `[\`${short}\`](${url})`;
  } catch (e) {
    return `\`${short}\``;
  }
}

function normalizeRemoteUrl(remote) {
  // Handle SSH: git@host:owner/repo.git
  const sshMatch = remote.match(/^git@([^:]+):([^/]+)\/(.+?)(\.git)?$/);
  if (sshMatch) {
    return { host: sshMatch[1], owner: sshMatch[2], repo: sshMatch[3].replace(/\.git$/, '') };
  }
  // Handle HTTPS: https://host/owner/repo.git
  try {
    const url = new URL(remote.replace(/\.git$/, ''));
    const parts = url.pathname.replace(/^\//, '').split('/');
    if (parts.length >= 2) {
      return { host: url.host, owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
    }
  } catch (e) {
    // Not a URL
  }
  return null;
}

function formatHumanDate(d) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const day = d.getUTCDate();
  const month = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}
