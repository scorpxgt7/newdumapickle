const fs = require('fs');
const file = 'src/components/CourtDirectory.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `{/* Add Court Modal */}
      <AddCourtModal
        isOpen={showAddCourtModal}
        onClose={() => setShowAddCourtModal(false)}`;

const replacementStr = `{/* Book Court Modal */}
      {bookingCourt && (
        <BookCourtModal
          court={bookingCourt}
          onClose={() => setBookingCourt(null)}
        />
      )}

      {/* Add Court Modal */}
      <AddCourtModal
        isOpen={showAddCourtModal}
        onClose={() => setShowAddCourtModal(false)}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content);
  console.log("Fixed BookCourtModal");
} else {
  console.log("Could not find insertion point.");
}
