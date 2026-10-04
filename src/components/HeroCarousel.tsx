import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560012057-4372e14c5085?q=80&w=2070&auto=format&fit=crop"
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="popLayout">
        <motion.img
          key={currentIndex}
          src={HERO_IMAGES[currentIndex]}
          alt="Pickleball Hero"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
          referrerPolicy="no-referrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
    </div>
  );
}
