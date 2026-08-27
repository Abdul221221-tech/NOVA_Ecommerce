const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.sql')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./');
let count = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('platform-admin')) {
    // ONLY replace in paths, don't break 'platform_admin' string which is the role
    const newContent = content.replace(/platform-admin/g, 'admin');
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated', file);
    count++;
  }
});
console.log('Total files updated:', count);
