const fs = require('fs');
const path = require('path');

const directory = 'd:/Projects/AACP/frontend/src';

const neutralMap = {
  'aacp-gold': 'neutral-border',
  'aacp-cream': 'neutral-light',
  'aacp-parchment': 'neutral-light',
  'aacp-ink': 'neutral-dark',
  'aacp-charcoal': 'neutral-dark',
  'aacp-smoke': 'neutral-medium',
  'aacp-mist': 'neutral-medium'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
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

  // Determine if this is a creator/advertiser file
  const isCreatorFile = file.includes('Advertiser') || file.includes('advertiser') || file.includes('creator') || file.includes('Creator');

  // Replace primary color
  if (isCreatorFile) {
    content = content.replace(/aacp-olive/g, 'secondary-purple');
  } else {
    content = content.replace(/aacp-olive/g, 'primary-blue');
  }

  // Replace neutrals
  for (const [legacy, modern] of Object.entries(neutralMap)) {
    const regex = new RegExp(legacy, 'g');
    content = content.replace(regex, modern);
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
  }
});

console.log(`Successfully refactored colors in ${modifiedFiles} files.`);
