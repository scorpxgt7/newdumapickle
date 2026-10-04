const ts = require('typescript');
const fs = require('fs');

const code = fs.readFileSync('src/App.tsx', 'utf8');

const sourceFile = ts.createSourceFile(
  'App.tsx',
  code,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);

let unclosed = null;

function visit(node) {
    ts.forEachChild(node, visit);
}
// wait, ts parses but throws errors gracefully.
// let's just get the syntactic diagnostics
const diagnostics = sourceFile.parseDiagnostics;
for (const diag of diagnostics) {
   const start = diag.start;
   const line = sourceFile.getLineAndCharacterOfPosition(start).line + 1;
   console.log(`Line ${line}:`, diag.messageText);
}
