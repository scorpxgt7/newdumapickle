const fs = require('fs');

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
if (!content.includes('import FAQSection')) {
  content = content.replace(
    "import AdminDashboard from './components/AdminDashboard';",
    "import AdminDashboard from './components/AdminDashboard';\nimport FAQSection from './components/FAQSection';"
  );
}

// Inject component before DPA Compliance
const targetStr = `        {/* DPA Compliance: Data Subject Rights Settings Dashboard (Rendered when Profile exists) */}`;
const replacementStr = `        <FAQSection />\n\n        {/* DPA Compliance: Data Subject Rights Settings Dashboard (Rendered when Profile exists) */}`;

if (content.includes(targetStr) && !content.includes('<FAQSection />')) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content);
  console.log("FAQ injection successful");
} else {
  console.log("FAQ target string not found or already injected");
}
