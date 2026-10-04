const fs = require('fs');

const file = 'src/components/CourtDirectory.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
if (!content.includes('import BookCourtModal')) {
  content = content.replace(
    "import AddCourtModal from './AddCourtModal';",
    "import AddCourtModal from './AddCourtModal';\nimport BookCourtModal from './BookCourtModal';"
  );
}

// Add state
if (!content.includes('const [bookingCourt, setBookingCourt]')) {
  content = content.replace(
    "const [showAddCourtModal, setShowAddCourtModal] = useState(false);",
    "const [showAddCourtModal, setShowAddCourtModal] = useState(false);\n  const [bookingCourt, setBookingCourt] = useState<Court | null>(null);"
  );
}

// Add Button
const targetBtnStr = `{/* Social Share Button */}
                            <button
                              onClick={(e) => handleOpenShare(court, e)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all flex items-center gap-1"
                              title="Share Court to Social Media"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              Share
                            </button>
                          </div>`;
const replacementBtnStr = `{/* Social Share Button */}
                            <button
                              onClick={(e) => handleOpenShare(court, e)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all flex items-center gap-1"
                              title="Share Court to Social Media"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              Share
                            </button>
                            {/* Book Court Button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); setBookingCourt(court); }}
                              className="px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm ml-auto"
                              title="Book this Court"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              Book Court
                            </button>
                          </div>`;

if (content.includes(targetBtnStr)) {
  content = content.replace(targetBtnStr, replacementBtnStr);
} else {
  console.log("Could not find button insertion point.");
}

// Render Modal
const targetModalStr = `{showAddCourtModal && (
        <AddCourtModal
          onClose={() => setShowAddCourtModal(false)}
          onAddCourt={(newCourt) => setCourts([newCourt, ...courts])}
          currentUser={currentUser}
        />
      )}`;

const replacementModalStr = `{showAddCourtModal && (
        <AddCourtModal
          onClose={() => setShowAddCourtModal(false)}
          onAddCourt={(newCourt) => setCourts([newCourt, ...courts])}
          currentUser={currentUser}
        />
      )}
      
      {/* Book Court Modal */}
      {bookingCourt && (
        <BookCourtModal
          court={bookingCourt}
          onClose={() => setBookingCourt(null)}
        />
      )}`;

if (content.includes(targetModalStr) && !content.includes('<BookCourtModal')) {
  content = content.replace(targetModalStr, replacementModalStr);
}

fs.writeFileSync(file, content);
console.log("Directory modified");
