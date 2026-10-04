const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetDesktopNav = `<nav className="hidden md:flex space-x-6 items-center">
                      <button onClick={() => scrollToSection('article')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">The Story</button>
                      <button onClick={() => scrollToSection('products')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Featured Gear</button>
                      <button onClick={() => scrollToSection('court-reviews-section')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Courts & Reviews</button>
                      <button onClick={() => scrollToSection('matchmaking-coordinator-section')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Game Coordinator</button>
                      <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">About</button>`;

const replacementDesktopNav = `<nav className="hidden md:flex space-x-6 items-center">
                      <button onClick={() => scrollToSection('article')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">The Story</button>
                      <button onClick={() => scrollToSection('products')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Featured Gear</button>
                      <button onClick={() => scrollToSection('court-reviews-section')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Courts & Reviews</button>
                      <button onClick={() => scrollToSection('matchmaking-coordinator-section')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Game Coordinator</button>
                      <button onClick={() => scrollToSection('faq-section')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">FAQ</button>
                      <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">About</button>`;

const targetMobileNav = `                  <button onClick={() => { setMobileMenuOpen(false); scrollToSection("faq-section"); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold block text-slate-600 hover:bg-slate-50">FAQ</button>
                  <div className="pt-2 border-t border-gray-100 flex gap-2">`;

const replacementMobileNav = `                  <button onClick={() => { setMobileMenuOpen(false); scrollToSection("faq-section"); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold block text-slate-600 hover:bg-slate-50">FAQ</button>
                  <button onClick={() => { setMobileMenuOpen(false); scrollToSection("about"); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold block text-slate-600 hover:bg-slate-50">About</button>
                  <div className="pt-2 border-t border-gray-100 flex gap-2">`;

if (content.includes(targetDesktopNav)) {
  content = content.replace(targetDesktopNav, replacementDesktopNav);
  console.log("Desktop nav updated.");
}

if (content.includes(targetMobileNav)) {
  content = content.replace(targetMobileNav, replacementMobileNav);
  console.log("Mobile nav updated.");
}

fs.writeFileSync(file, content);
