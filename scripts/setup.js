#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';

const suggestedScripts = {
  "bump:patch": "verbump-js patch --generate-changelog",
  "bump:minor": "verbump-js minor --generate-changelog",
  "bump:major": "verbump-js major --generate-changelog",
  "bump:patch:push": "verbump-js patch --generate-changelog --push",
  "bump:minor:push": "verbump-js minor --generate-changelog --push",
  "bump:major:push": "verbump-js major --generate-changelog --push",
  "changelog": "verbump-js changelog --generate-changelog"
};

function askQuestion(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function setupScripts() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ No package.json found in current directory');
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Check which scripts would be added
    const scriptsToAdd = [];
    const existingScripts = [];

    for (const [scriptName, scriptCommand] of Object.entries(suggestedScripts)) {
      if (!packageJson.scripts[scriptName]) {
        scriptsToAdd.push({ name: scriptName, command: scriptCommand });
      } else {
        existingScripts.push(scriptName);
      }
    }

    if (scriptsToAdd.length === 0) {
      console.log('✅ All verbump-js scripts already exist in your package.json!');
      return;
    }

    // Show what will be added
    console.log('\n🚀 verbump-js Setup');
    console.log('==================');
    console.log('\nThe following scripts will be added to your package.json:');
    console.log('');
    
    scriptsToAdd.forEach(script => {
      console.log(`  📝 ${script.name}: ${script.command}`);
    });

    if (existingScripts.length > 0) {
      console.log(`\n📋 ${existingScripts.length} scripts already exist and will be skipped: ${existingScripts.join(', ')}`);
    }

    // Ask for confirmation
    const answer = await askQuestion('\n❓ Do you want to add these scripts? (y/N): ');
    
    if (answer === 'y' || answer === 'yes') {
      // Ask for changelog configuration
      console.log('\n📝 Changelog Configuration');
      console.log('==========================');
      console.log('\nWhere would you like the changelog file to be created?');
      console.log('  📄 CHANGELOG.md (default)');
      console.log('  📄 CHANGES.md');
      console.log('  📄 HISTORY.md');
      console.log('  📄 Custom path');
      
      const changelogChoice = await askQuestion('\n❓ Changelog file location (CHANGELOG.md): ');
      
      let changelogFile = 'CHANGELOG.md';
      if (changelogChoice.trim()) {
        if (changelogChoice.toLowerCase() === 'changes.md') {
          changelogFile = 'CHANGES.md';
        } else if (changelogChoice.toLowerCase() === 'history.md') {
          changelogFile = 'HISTORY.md';
        } else if (changelogChoice.toLowerCase() !== 'changelog.md') {
          changelogFile = changelogChoice.trim();
        }
      }
      
      // Ask about changelog generation from commits
      const generateFromCommits = await askQuestion('\n❓ Generate changelog from git commits automatically? (Y/n): ');
      const generateCommits = generateFromCommits !== 'n' && generateFromCommits !== 'no';
      
      // Create configuration file
      const config = {
        changelogFile: changelogFile,
        generateChangelogFromCommits: generateCommits,
        updateVersionReferences: true,
        versionUpdateFiles: [
          'README.md',
          'CHANGELOG.md',
          '*.md',
          'src/**/*.js',
          'bin/**/*.js'
        ]
      };
      
      const configPath = path.join(process.cwd(), '.verbump-jsrc.json');
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
      
      // Add the scripts
      scriptsToAdd.forEach(script => {
        packageJson.scripts[script.name] = script.command;
      });

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      
      console.log(`\n✅ Successfully added ${scriptsToAdd.length} verbump-js scripts to your package.json!`);
      console.log(`✅ Created configuration file: .verbump-jsrc.json`);
      console.log(`✅ Changelog will be created at: ${changelogFile}`);
      console.log(`✅ Generate from commits: ${generateCommits ? 'Yes' : 'No'}`);
      console.log('\n🚀 You can now use:');
      console.log('   npm run bump:patch');
      console.log('   npm run bump:minor');
      console.log('   npm run bump:major');
      console.log('   npm run changelog');
      console.log('\n📖 Run "npx verbump-js --help" for more options');
    } else {
      console.log('\n❌ Setup cancelled. No scripts were added.');
      console.log('💡 You can run "npx verbump-js setup" anytime to try again.');
    }

  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupScripts();
}

export { setupScripts, suggestedScripts };
