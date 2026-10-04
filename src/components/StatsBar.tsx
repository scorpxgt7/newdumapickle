import React, { useEffect, useState, useRef } from 'react';
import { Users, MapPin, Calendar, Sparkles, ShieldCheck, Trophy, Activity } from 'lucide-react';

interface StatProps {
  icon: React.ReactNode;
  label: string;
  targetValue: number;
  suffix?: string;
  subtext: string;
  colorTheme: 'emerald' | 'amber' | 'indigo';
}

function StatCounter({ icon, label, targetValue, suffix = '+', subtext, colorTheme }: StatProps) {
  const [count, setCount] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);
          let startTimestamp: number | null = null;
          const duration = 1800; // 1.8 seconds count animation

          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out cubic formula
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * targetValue);
            setCount(current);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(targetValue);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [targetValue, hasTriggered]);

  const colorStyles = {
    emerald: {
      bgIcon: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      highlight: 'from-emerald-500 to-teal-400',
    },
    amber: {
      bgIcon: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 border-amber-500/20',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      highlight: 'from-amber-500 to-orange-400',
    },
    indigo: {
      bgIcon: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 border-indigo-500/20',
      badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      highlight: 'from-indigo-500 to-blue-400',
    }
  }[colorTheme];

  return (
    <div 
      ref={containerRef}
      className="flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5"
    >
      <div className={`p-3.5 rounded-2xl border ${colorStyles.bgIcon} shrink-0 transition-transform group-hover:scale-105`}>
        {icon}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${colorStyles.highlight}`}>
            {count.toLocaleString()}
          </span>
          <span className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-200">
            {suffix}
          </span>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
          {label}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {subtext}
        </p>
      </div>
    </div>
  );
}

export default function StatsBar() {
  return (
    <div className="w-full bg-slate-900/95 dark:bg-slate-950/90 border-y border-slate-800 py-6 relative z-20 shadow-xl overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <StatCounter
            icon={<Users className="w-6 h-6" />}
            label="Verified Players"
            targetValue={1840}
            suffix="+"
            subtext="DUPR registered local players"
            colorTheme="emerald"
          />
          <StatCounter
            icon={<MapPin className="w-6 h-6" />}
            label="Active Courts"
            targetValue={48}
            suffix=" Courts"
            subtext="Indoor, outdoor & private venues"
            colorTheme="amber"
          />
          <StatCounter
            icon={<Calendar className="w-6 h-6" />}
            label="Games Scheduled"
            targetValue={312}
            suffix=" Matches"
            subtext="Open play & tournament matchups"
            colorTheme="indigo"
          />
        </div>
      </div>
    </div>
  );
}
