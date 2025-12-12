const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');
const regex = /\.from\(['"]([a-zA-Z0-9_]+)['"]\)/g;
let match;
const tables = new Set();

while ((match = regex.exec(content)) !== null) {
    tables.add(match[1]);
}

console.log('Tables found:', Array.from(tables));
