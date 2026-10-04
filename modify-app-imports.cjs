const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

if (content.includes("import PremiumFacility from './components/PremiumFacility';")) {
  content = content.replace(
    "import PremiumFacility from './components/PremiumFacility';\n",
    ""
  );
  fs.writeFileSync(file, content);
  console.log("Removed PremiumFacility import");
}
