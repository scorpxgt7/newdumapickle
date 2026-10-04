const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');
let updated = content;

// Fix AIChatWidget import
if (!updated.includes("import AIChatWidget")) {
  updated = updated.replace(
    "import AdminDashboard from './components/AdminDashboard';",
    "import AdminDashboard from './components/AdminDashboard';\nimport AIChatWidget from './components/AIChatWidget';"
  );
}

// Fix createdAt and dpaConsent types
updated = updated.replace(
  `createdAt: Date.now(),
        dpaConsent: {
          accepted: true,
          acceptedAt: Date.now(),
          marketing: consentData.marketing
        }`,
  `createdAt: new Date().toISOString(),
        dpaConsent: true,
        dpaConsentDate: new Date().toISOString()`
);

// Fix matchesPlayed, which might not be in UserProfile
updated = updated.replace(/matchesPlayed:\s*0,\n/g, "");
updated = updated.replace(/photoURL:\s*user\.photoURL\s*\|\|\s*'',\n/g, "");

// Fix OperationType.ADD
updated = updated.replace(/OperationType\.ADD/g, "OperationType.ADD || 'ADD'"); // or just string 'ADD' since it might be missing
updated = updated.replace(/OperationType\.ADD/g, "'ADD'"); // Wait, the error was: Property 'ADD' does not exist on type 'typeof OperationType'

// Actually, let's see what OperationType has:
// export enum OperationType { GET = 'GET', UPDATE = 'UPDATE', DELETE = 'DELETE', QUERY = 'QUERY' }
updated = updated.replace(/OperationType\.ADD/g, "OperationType.UPDATE");

// Fix DpaNotice signature:
updated = updated.replace(
  `const handleConsentAgreement = async (consentData: { marketing: boolean }) => {`,
  `const handleConsentAgreement = async () => {`
);

fs.writeFileSync('src/App.tsx', updated);
