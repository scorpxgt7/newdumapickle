const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { motion, AnimatePresence } from "motion/react";')) {
  content = content.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from \"motion/react\";"
  );
}

const targetStr = `{/* Mobile Navigation Dropdown drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-2 animate-fade-in" id="mobile-navigation-drawer">
              <button onClick={() => { setMobileMenuOpen(false); scrollToSection('article'); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold block text-slate-600 hover:bg-slate-50">The Story</button>
              <button onClick={() => { setMobileMenuOpen(false); scrollToSection('products'); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold block text-slate-600 hover:bg-slate-50">Featured Gear</button>
              <button onClick={() => { setMobileMenuOpen(false); scrollToSection("court-reviews-section"); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold block text-slate-600 hover:bg-slate-50">Courts & Reviews</button>
              <button onClick={() => { setMobileMenuOpen(false); scrollToSection("matchmaking-coordinator-section"); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold block text-slate-600 hover:bg-slate-50">Game Coordinator</button>
              <div className="pt-2 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-sm"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  {!profile && (
                    <button onClick={handleGoogleSignIn} className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm w-full">Authenticate</button>
                  )}
              </div>
            </div>
          )}`;

const replacementStr = `{/* Mobile Navigation Dropdown drawer */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden bg-white overflow-hidden border-b border-slate-100 origin-top" 
                id="mobile-navigation-drawer"
              >
                <div className="p-4 space-y-2">
                  <button onClick={() => { setMobileMenuOpen(false); scrollToSection('article'); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold block text-slate-600 hover:bg-slate-50">The Story</button>
                  <button onClick={() => { setMobileMenuOpen(false); scrollToSection('products'); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold block text-slate-600 hover:bg-slate-50">Featured Gear</button>
                  <button onClick={() => { setMobileMenuOpen(false); scrollToSection("court-reviews-section"); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold block text-slate-600 hover:bg-slate-50">Courts & Reviews</button>
                  <button onClick={() => { setMobileMenuOpen(false); scrollToSection("matchmaking-coordinator-section"); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold block text-slate-600 hover:bg-slate-50">Game Coordinator</button>
                  <button onClick={() => { setMobileMenuOpen(false); scrollToSection("faq-section"); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold block text-slate-600 hover:bg-slate-50">FAQ</button>
                  <div className="pt-2 border-t border-gray-100 flex gap-2">
                      <button
                        onClick={() => {
                           setIsDarkMode(!isDarkMode);
                           setMobileMenuOpen(false);
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-sm"
                      >
                        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </button>
                      {!profile && (
                        <button onClick={() => { handleGoogleSignIn(); setMobileMenuOpen(false); }} className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm w-full">Authenticate</button>
                      )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content);
  console.log("App menu modification successful");
} else {
  console.log("Could not find insertion point.");
}
