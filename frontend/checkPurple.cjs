const fs = require('fs');
const path = require('path');

const directory = 'd:/Projects/AACP/frontend/src';
const purplePatterns = [
  /bg-purple-/,
  /text-purple-/,
  /border-purple-/,
  /ring-purple-/,
  /from-purple-/,
  /to-purple-/,
  /#7C3AED/,
  /#6D28D9/,
  /#F5F3FF/,
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
let found = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const hasPurple = purplePatterns.some(p => p.test(line));
    if (hasPurple) {
      console.log(`${path.basename(file)}:${idx + 1} => ${line.trim()}`);
      found++;
    }
  });
});

console.log(`\nTotal purple instances found: ${found}`);
