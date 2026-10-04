const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

let stack = [];
let lines = content.split('\n');
let lineNum = 1;
for (let i = 0; i < content.length; i++) {
  const c = content[i];
  if (c === '\n') lineNum++;
  if (c === '(') stack.push({c, lineNum});
  else if (c === '{') stack.push({c, lineNum});
  else if (c === '[') stack.push({c, lineNum});
  else if (c === ')') {
    const last = stack.pop();
  }
  else if (c === '}') {
    const last = stack.pop();
  }
  else if (c === ']') {
    const last = stack.pop();
  }
}
console.log("Unclosed brackets:");
stack.forEach(item => console.log(item.c, "at line", item.lineNum));
