const fs = require('fs');
const path = require('path');

const directory = 'd:/Projects/AACP/frontend/src';

const replacements = [
  // Old primary blues to new primary
  { from: /#2D5BFF/g, to: '#0070BB' },
  { from: /#1E47E5/g, to: '#005A9E' },
  { from: /#EEF2FF/g, to: '#E6F3FB' },
  // Also catch any lingering useAdminStats color
  { from: /'#2D5BFF'/g, to: "'#0070BB'" },
];

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

  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
    console.log('Updated:', file);
  }
});

console.log(`\nDone! Refactored ${modifiedFiles} files.`);
