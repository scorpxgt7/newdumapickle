const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

let stack = [];
for (let i = 0; i < content.length; i++) {
  const c = content[i];
  if (c === '(') stack.push({c, i});
  else if (c === '{') stack.push({c, i});
  else if (c === '[') stack.push({c, i});
  else if (c === ')') {
    const last = stack.pop();
    if (last.c !== '(') console.log("Mismatch at", i, "expected closing for", last.c, "but got )");
  }
  else if (c === '}') {
    const last = stack.pop();
    if (last.c !== '{') console.log("Mismatch at", i, "expected closing for", last.c, "but got }");
  }
  else if (c === ']') {
    const last = stack.pop();
    if (last.c !== '[') console.log("Mismatch at", i, "expected closing for", last.c, "but got ]");
  }
}
console.log("Remaining in stack:", stack.map(x => x.c).join(""));
