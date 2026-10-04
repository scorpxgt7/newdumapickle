const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const newAnimations = `
  .animate-fade-in-up {
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .animate-fade-in-up-delay-1 {
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
    opacity: 0;
  }
  .animate-fade-in-up-delay-2 {
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
    opacity: 0;
  }
  .animate-fade-in-up-delay-3 {
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.45s forwards;
    opacity: 0;
  }
  .animate-fade-in-up-delay-4 {
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
    opacity: 0;
  }
`;

const newKeyframes = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

if (!css.includes('animate-fade-in-up')) {
  css = css.replace('.animate-spin-slow {', newAnimations + '\n  .animate-spin-slow {');
  css = css.replace('/* Custom Leaflet Popup Styling */', newKeyframes + '\n/* Custom Leaflet Popup Styling */');
  fs.writeFileSync('src/index.css', css);
  console.log("Updated index.css");
} else {
  console.log("Already updated");
}
