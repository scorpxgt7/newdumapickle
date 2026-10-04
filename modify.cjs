const fs = require('fs');

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12">
              <div className="inline-block px-4 py-1.5 rounded-full bg-brand-600/90 text-white text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-sm border border-brand-500/50">
                  Philippine Pickleball Revolution
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 drop-shadow-lg">
                  How the Philippines Just Became the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-indigo-300">Global Capital of Pickleball</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 drop-shadow-md">
                  From street courts to mega-stadiums, discover the billion-peso ecosystem taking over the nation. Plus, shop the curated gear to elevate your own game.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">`;

const replacementStr = `          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12">
              <div className="inline-block px-4 py-1.5 rounded-full bg-brand-600/90 text-white text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-sm border border-brand-500/50 animate-fade-in-up">
                  Philippine Pickleball Revolution
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 drop-shadow-lg animate-fade-in-up-delay-1">
                  How the Philippines Just Became the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-indigo-300">Global Capital of Pickleball</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 drop-shadow-md animate-fade-in-up-delay-2">
                  From street courts to mega-stadiums, discover the billion-peso ecosystem taking over the nation. Plus, shop the curated gear to elevate your own game.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-3">`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content);
  console.log("Modification successful");
} else {
  console.log("Target string not found");
}
