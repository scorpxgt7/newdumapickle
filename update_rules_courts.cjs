const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

const additionalRules = `
    // 7. Submitted Courts Collection
    match /submitted_courts/{courtId} {
      allow read: if true;
      allow write: if true;
    }
  }
}`;

rules = rules.replace(/  \}\n\}/, additionalRules);
fs.writeFileSync('firestore.rules', rules);
