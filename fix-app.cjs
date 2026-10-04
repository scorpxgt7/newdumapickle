const fs = require('fs');
let content = fs.readFileSync('./src/App.tsx', 'utf8');

// The end of the file looks like:
//       {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
//       <AIChatWidget />
//     </div>
//   );
// }

// Let's replace the last bit to ensure it is perfectly closed.

const endRegex = /\{showAdmin && <AdminDashboard onClose=\{\(\) => setShowAdmin\(false\)\} \/>\}[\s\S]*$/;
content = content.replace(endRegex, 
`{showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
      <AIChatWidget />
    </div>
  );
}
`);
fs.writeFileSync('./src/App.tsx', content);
