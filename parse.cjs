const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');

const content = fs.readFileSync('src/App.tsx', 'utf8');

// We can just use acorn with jsx
const Parser = acorn.Parser.extend(jsx());

try {
  Parser.parse(content, { sourceType: 'module', ecmaVersion: 2020 });
  console.log("Acorn success!");
} catch (e) {
  console.error("Acorn error at position:", e.pos, "line:", e.loc.line, e.message);
  
  // print a bit of code around the error
  const start = Math.max(0, e.pos - 100);
  const end = Math.min(content.length, e.pos + 100);
  console.log("Context:\n", content.slice(start, end));
}
