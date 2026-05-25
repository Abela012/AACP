const fs = require('fs');
const path = require('path');

const directory = 'd:/Projects/AACP/frontend/src';

// Map purple UI classes to primary-blue equivalents
// We DO NOT replace gradient from-purple / to-purple / via-purple (Instagram brand)
const replacements = [
  // Text colors
  { from: /text-purple-600/g, to: 'text-primary-blue' },
  { from: /text-purple-500/g, to: 'text-primary-blue' },
  { from: /text-purple-400/g, to: 'text-primary-blue' },

  // Background colors
  { from: /bg-purple-50(?!\/)/g, to: 'bg-primary-blue-light' },
  { from: /bg-purple-100(?!\/)/g, to: 'bg-primary-blue-light' },
  { from: /bg-purple-500\/10/g, to: 'bg-primary-blue\/10' },
  { from: /bg-purple-900\/20/g, to: 'bg-primary-blue\/10' },
  { from: /bg-purple-500(?!\/)/g, to: 'bg-primary-blue' },

  // Color data props (in objects/strings)
  { from: /'text-purple-600'/g, to: "'text-primary-blue'" },
  { from: /'text-purple-500'/g, to: "'text-primary-blue'" },
  { from: /'bg-purple-50'/g, to: "'bg-primary-blue-light'" },
  { from: /"text-purple-600"/g, to: '"text-primary-blue"' },
  { from: /"bg-purple-50"/g, to: '"bg-primary-blue-light"' },
  { from: /colorClass="bg-purple-500\/10"/g, to: 'colorClass="bg-primary-blue/10"' },

  // h-full progress bar
  { from: /bg-purple-500 transition/g, to: 'bg-primary-blue transition' },
];

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

  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
    console.log('Fixed:', path.basename(file));
  }
});

console.log(`\nDone! Fixed UI purples in ${modifiedFiles} files.`);
console.log('NOTE: Instagram brand gradients (from-purple, to-purple) were preserved intentionally.');
