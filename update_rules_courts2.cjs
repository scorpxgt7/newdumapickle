const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  'match /courts/{courtId} {\n      allow read: if true;\n      allow write: if false; // Read-only for general players',
  'match /courts/{courtId} {\n      allow read: if true;\n      allow write: if true;'
);

fs.writeFileSync('firestore.rules', rules);
