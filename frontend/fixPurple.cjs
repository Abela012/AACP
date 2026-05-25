const fs = require('fs');
const path = require('path');

const directory = 'd:/Projects/AACP/frontend/src';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(directory);
let modifiedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace all secondary-purple usages with primary-blue
  content = content.replace(/secondary-purple/g, 'primary-blue');

  // Replace any lingering purple hex values that came from secondary-purple
  content = content.replace(/#7C3AED/g, '#0070BB');
  content = content.replace(/#6D28D9/g, '#005A9E');
  content = content.replace(/#F5F3FF/g, '#E6F3FB');
  content = content.replace(/rgba\(124,\s*58,\s*237,\s*0\.18\)/g, 'rgba(0, 112, 187, 0.18)');
  content = content.replace(/rgba\(124,\s*58,\s*237,\s*0\.28\)/g, 'rgba(0, 112, 187, 0.28)');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
    console.log('Fixed:', path.basename(file));
  }
});

console.log(`\nDone! Fixed ${modifiedFiles} files. All dashboards now use #0070BB.`);
