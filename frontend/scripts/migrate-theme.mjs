import fs from 'fs';
import path from 'path';

const srcRoot = path.join(process.cwd(), 'src');
const skip = path.sep + 'pages' + path.sep + 'landing' + path.sep;

const replacements = [
  ['emerald-700', 'aacp-olive'],
  ['emerald-600', 'aacp-olive'],
  ['emerald-500', 'aacp-olive'],
  ['emerald-400', 'aacp-gold'],
  ['emerald-50', 'aacp-gold/15'],
  ['emerald-100', 'aacp-gold/25'],
  ['emerald-200', 'aacp-gold/30'],
  ['[#14a800]', 'aacp-olive'],
  ['[#108a00]', 'aacp-olive'],
  ['[#001e00]', 'aacp-ink'],
  ['[#5e6d55]', 'aacp-smoke'],
  ['[#F1FFF0]', 'aacp-gold/20'],
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (/\.(tsx?|css)$/.test(name)) files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(srcRoot)) {
  if (file.includes(skip)) continue;
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;
  for (const [from, to] of replacements) content = content.split(from).join(to);
  if (content !== orig) {
    fs.writeFileSync(file, content);
    changed++;
  }
}
console.log(`Updated ${changed} files`);
