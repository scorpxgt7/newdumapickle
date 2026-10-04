const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Import
if (!content.includes('import RatingQuizModal')) {
  content = content.replace(
    "import AIChatWidget from './components/AIChatWidget';",
    "import AIChatWidget from './components/AIChatWidget';\nimport RatingQuizModal from './components/RatingQuizModal';"
  );
}

// State
if (!content.includes('const [showRatingQuiz, setShowRatingQuiz] = useState(false);')) {
  content = content.replace(
    "const [showConsentModal, setShowConsentModal] = useState(false);",
    "const [showConsentModal, setShowConsentModal] = useState(false);\n  const [showRatingQuiz, setShowRatingQuiz] = useState(false);"
  );
}

// Modal component
if (!content.includes('<RatingQuizModal')) {
  content = content.replace(
    "{/* DPA Consent popup Modal container */}",
    `{showRatingQuiz && profile && (
        <RatingQuizModal
          profile={profile}
          onClose={() => setShowRatingQuiz(false)}
          onUpdateProfile={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}

      {/* DPA Consent popup Modal container */}`
  );
}

// Inject Button into Profile Section
const targetStr = `<p className="text-[10px] text-emerald-400 font-mono">UID: {profile.uid.substring(0, 16)}...</p>
              </div>`;

const replacementStr = `<p className="text-[10px] text-emerald-400 font-mono">UID: {profile.uid.substring(0, 16)}...</p>
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Current Rating</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{profile.skillLevel || 'Not Rated'}</span>
                    <button 
                      onClick={() => setShowRatingQuiz(true)}
                      className="px-2 py-1 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 hover:text-indigo-300 rounded text-xs font-bold transition-all"
                    >
                      Take AI Quiz
                    </button>
                  </div>
                </div>
              </div>`;

if (content.includes(targetStr) && !content.includes('Take AI Quiz')) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content);
  console.log("App modification successful");
} else {
  console.log("Could not find insertion point or already injected.");
  fs.writeFileSync(file, content); // Save other modifications
}
