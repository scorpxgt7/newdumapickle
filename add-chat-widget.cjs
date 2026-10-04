const fs = require('fs');
let content = fs.readFileSync('./src/App.tsx', 'utf8');

// Add import
content = content.replace(
  "import { ShieldCheck, Sun, Moon, User as UserIcon, LogOut, Menu, Lock, Download, Trash2 } from 'lucide-react';",
  "import { ShieldCheck, Sun, Moon, User as UserIcon, LogOut, Menu, Lock, Download, Trash2 } from 'lucide-react';\nimport AIChatWidget from './components/AIChatWidget';"
);

// Add component before ending div
const beforeEndDiv = "      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}\n    </div>";
const withChat = "      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}\n      <AIChatWidget />\n    </div>";

content = content.replace(beforeEndDiv, withChat);

fs.writeFileSync('./src/App.tsx', content);
