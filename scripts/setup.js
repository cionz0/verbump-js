#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const suggestedScripts = {
  "bump:patch": "verbump-js patch --generate-changelog",
  "bump:minor": "verbump-js minor --generate-changelog",
  "bump:major": "verbump-js major --generate-changelog",
  "bump:patch:push": "verbump-js patch --generate-changelog --push",
  "bump:minor:push": "verbump-js minor --generate-changelog --push",
  "bump:major:push": "verbump-js major --generate-changelog --push",
  "changelog": "verbump-js changelog --generate-changelog"
};

function setupScripts() {
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

    let addedCount = 0;
    let existingCount = 0;

    for (const [scriptName, scriptCommand] of Object.entries(suggestedScripts)) {
      if (!packageJson.scripts[scriptName]) {
        packageJson.scripts[scriptName] = scriptCommand;
        addedCount++;
      } else {
        existingCount++;
      }
    }

    if (addedCount > 0) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`\n✅ Added ${addedCount} verbump-js scripts to your package.json!`);
      console.log(`📝 ${existingCount} scripts already existed and were skipped.`);
      console.log('\n🚀 You can now use:');
      console.log('   npm run bump:patch');
      console.log('   npm run bump:minor');
      console.log('   npm run bump:major');
      console.log('   npm run changelog');
    } else if (existingCount > 0) {
      console.log(`\n✅ All verbump-js scripts already exist in your package.json!`);
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
