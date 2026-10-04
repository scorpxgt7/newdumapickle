/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { auth, googleProvider, signInWithPopup, fbSignOut, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { UserProfile } from './types';

// Icons
import { 
  ShieldCheck, LogOut, Compass, Trophy, Sparkles, User as UserIcon, 
  Download, Trash2, Lock, Activity, FileText, ChevronRight, Menu,
  ChevronLeft, Users, Award, HelpCircle, Moon, Sun, Search
} from 'lucide-react';

// Modules
import CourtDirectory from './components/CourtDirectory';
import EquipmentHub from './components/EquipmentHub';
import Matchmaking from './components/Matchmaking';
import DpaNotice from './components/DpaNotice';
import PrivacyDpaDocs from './components/PrivacyDpaDocs';
import VerifiedReviewerBadge from './components/VerifiedReviewerBadge';
import LatestNews from './components/LatestNews';
import HeroCarousel from './components/HeroCarousel';
import StatsBar from './components/StatsBar';
import AdminDashboard from './components/AdminDashboard';
import FAQSection from './components/FAQSection';
import AIChatWidget from './components/AIChatWidget';
import RatingQuizModal from './components/RatingQuizModal';
import { onSnapshot } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  // Admin Dashboard State
  const [showAdmin, setShowAdmin] = useState(false);
  const [layoutSettings, setLayoutSettings] = useState({
    showHero: true,
    showStats: true,
    showCourts: true,
    showMatchmaker: true,
    showPaddles: true,
    showNews: true
  });
  const [carouselSlides, setCarouselSlides] = useState([
    {
      image: "https://upload.wikimedia.org/wikipedia/commons/3/39/Outdoor_pickleball_courts.jpg",
      badge: "Negros Oriental • Philippines",
      title: "DUMA PICKLE: Connecting the Racket Revolution",
      subtitle: "The ultimate court directory, player review hub, and matchmaking scheduler in Dumaguete.",
      accent: "Unofficial Pickleball Capital"
    },
    {
      image: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Pickleball_balls_and_paddles.jpg",
      badge: "Player Verified Ratings",
      title: "Multidimensional Court Quality Reviews",
      subtitle: "Inspect court lighting, surface conditions, parking safety, and crowding levels compiled directly by active local players.",
      accent: "Real-time Sub-collection Store"
    },
    {
      image: "https://upload.wikimedia.org/wikipedia/commons/7/71/Pickleball_court_in_La_Crosse%2C_Wisconsin_01.jpg",
      badge: "Community Coordinator",
      title: "Active Game Schedules & Lineups",
      subtitle: "Organize weekend recreational rosters, invite tournament partners, or find local matches of your matching skill level.",
      accent: "Interactive Game Roster Engine"
    }
  ]);

  // Active view tab switcher
  const [activeTab, setActiveTab] = useState<"directory" | "paddles" | "matchmaking" | "monetization">("directory");
  
  // Data Privacy Act modal visibility
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showRatingQuiz, setShowRatingQuiz] = useState(false);
  const [showDpaDocsModal, setShowDpaDocsModal] = useState<"privacy" | "tos" | null>(null);

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero search query state
  const [heroSearchText, setHeroSearchText] = useState("");
  const [heroSearchQuery, setHeroSearchQuery] = useState("");

  // Carousel Slider & Persona States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rolePerspective, setRolePerspective] = useState<"player" | "enthusiast" | "curious">("player");

  // Load layout and carousel settings from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.slides && data.slides.length > 0) setCarouselSlides(data.slides);
        if (data.layout) setLayoutSettings(data.layout);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/main');
    });

    return () => unsub();
  }, []);

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
            setShowConsentModal(false);
          } else {
            setProfile(null);
            setShowConsentModal(true);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users');
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign-in error", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (error) {
      console.error("Sign-out error", error);
    }
  };

  const handleConsentAgreement = async () => {
    if (!user) return;
    try {
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Pickleball Player',
        email: user.email || '',
                skillLevel: 'Recreational (3.0)',
        homeCourtId: '',
                createdAt: new Date().toISOString(),
        dpaConsent: true,
        dpaConsentDate: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
      setShowConsentModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleDeclineConsent = async () => {
    setShowConsentModal(false);
    await handleSignOut();
  };

  const handleSetHomeCourt = async (courtId: string) => {
    if (!profile) return;
    try {
      const updated = { ...profile, homeCourtId: courtId };
      await setDoc(doc(db, 'users', profile.uid), updated);
      setProfile(updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleExportDataLog = () => {
    if (!profile) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `dumapickle_dpa_export_${profile.uid}.json`);
    dlAnchorElem.click();
  };

  const handleEraseDataProfile = async () => {
    if (!profile || !user) return;
    if (window.confirm("Are you absolutely sure you want to permanently erase your profile? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'users', profile.uid));
        setProfile(null);
        await handleSignOut();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'users');
      }
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-emerald-500 rounded-full mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 font-bold">Loading Court Directory...</p>
        </div>
      </div>
    );
  }

  // Final return
  return (
    <div className="bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 font-sans antialiased min-h-screen flex flex-col" id="app-root-container">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-slate-800" id="global-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                      {/* Minimalist Logo Icon (SVG) */}
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xl">
                          D
                      </div>
                      <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">DumaPickle</span>
                  </div>
                  <nav className="hidden md:flex space-x-6 items-center">
                      <button onClick={() => scrollToSection('article')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">The Story</button>
                      <button onClick={() => scrollToSection('products')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Featured Gear</button>
                      <button onClick={() => scrollToSection('court-reviews-section')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Courts & Reviews</button>
                      <button onClick={() => scrollToSection('matchmaking-coordinator-section')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Game Coordinator</button>
                      <button onClick={() => scrollToSection('faq-section')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">FAQ</button>
                      <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">About</button>
                      
                      {/* Auth State Panel / Switcher Trigger */}
                      <div className="flex items-center gap-3 ml-4 border-l border-gray-200 dark:border-slate-700 pl-4">
                        <button
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                          title="Toggle Dark Mode"
                        >
                          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {profile ? (
                          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1.5 rounded-2xl pl-3">
                            <div className="hidden md:flex flex-col items-end">
                              <div className="flex items-center gap-1.5">
                                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">{profile.displayName}</h5>
                                <VerifiedReviewerBadge profile={profile} size="xs" showText={false} />
                              </div>
                              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">{profile.skillLevel}</p>
                            </div>
                            
                            {/* User avatar icon */}
                            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs relative">
                              <UserIcon className="w-4 h-4" />
                            </div>

                            <button
                              id="signout-header-btn"
                              onClick={handleSignOut}
                              className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
                              title="Sign Out Session"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            id="signin-header-btn"
                            onClick={handleGoogleSignIn}
                            className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
                          >
                            Authenticate Google
                          </button>
                        )}
                      </div>
                  </nav>
                  
                  {/* Mobile Hamburger icon */}
                  <button
                    id="toggle-mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 bg-slate-100 rounded-xl md:hidden text-slate-700 hover:bg-slate-200 transition-all"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
              </div>
          </div>
          
          {/* Mobile Navigation Dropdown drawer */}
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
                  <button onClick={() => { setMobileMenuOpen(false); scrollToSection("about"); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold block text-slate-600 hover:bg-slate-50">About</button>
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
          </AnimatePresence>
      </header>

      {/* Hero Section */}
      {layoutSettings.showHero !== false && (<section className="relative bg-gray-900 h-[70vh] min-h-[550px] flex items-center justify-center overflow-hidden">
          {/* Large Background Hero Image */}
          <HeroCarousel />
          
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12">
              <div className="inline-block px-4 py-1.5 rounded-full bg-brand-600/90 text-white text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-sm border border-brand-500/50 animate-fade-in-up">
                  Philippine Pickleball Revolution
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 drop-shadow-lg animate-fade-in-up-delay-1">
                  How the Philippines Just Became the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-indigo-300">Global Capital of Pickleball</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 drop-shadow-md animate-fade-in-up-delay-2">
                  From street courts to mega-stadiums, discover the billion-peso ecosystem taking over the nation. Plus, shop the curated gear to elevate your own game.
              </p>
              <div className="max-w-2xl mx-auto flex justify-center animate-fade-in-up-delay-3 w-full">
                  <div className="relative w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                          type="text" 
                          value={heroSearchQuery}
                          onChange={(e) => {
                              setHeroSearchQuery(e.target.value);
                              // Auto scroll if typing and hasn't scrolled down yet
                              if (e.target.value && window.scrollY < 300) {
                                  scrollToSection("court-reviews-section");
                              }
                          }}
                          onFocus={() => {
                              if (window.scrollY < 300) {
                                  scrollToSection("court-reviews-section");
                              }
                          }}
                          placeholder="Search courts by name, location, or features..."
                          className="w-full pl-12 pr-32 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white/20 transition-all shadow-lg text-base md:text-lg"
                      />
                      <button 
                          onClick={() => scrollToSection("court-reviews-section")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 md:px-6 rounded-full transition-all text-sm md:text-base"
                      >
                          Find Courts
                      </button>
                  </div>
              </div>
              <div className="mt-8 flex items-center justify-center gap-4 animate-fade-in-up-delay-4">
                  <span className="text-sm text-gray-300 font-medium">Share:</span>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out this Philippine Pickleball Revolution!")}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/></svg>
                  </a>
              </div>
          </div>
      </section>)}

      {/* Dynamic Statistics Bar */}
      {layoutSettings.showStats !== false && <StatsBar />}

      {/* Article Section */}
      {layoutSettings.showStats !== false && (<article id="article" className="bg-white dark:bg-slate-900 py-16 lg:py-24 scroll-mt-16 border-b border-gray-100 dark:border-slate-800 relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-50 dark:bg-brand-900/20 opacity-50 blur-3xl"></div>
              <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-indigo-50 dark:bg-indigo-900/20 opacity-50 blur-3xl"></div>
          </div>

          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-none text-gray-600 dark:text-slate-300">
                  
                  <p className="text-xl md:text-2xl leading-relaxed text-gray-800 dark:text-slate-100 mb-10 font-medium tracking-tight">
                      In 2018, the percussive sound of "Street Pickleball" first echoed through the grit of temporary courts in the narrow lanes of Ortigas. Today, that same echo reverberates against the glass of the ultra-luxury Haraya Residences and the Westin Manila nearby, signaling a profound cultural recalibration. This transition from narrow urban alleys to sophisticated skyline dominance represents a shift that is as much about economic strategy as it is about sport. How did a nation historically obsessed with the basketball hoop suddenly pivot its sporting soul toward a billion-peso ecosystem built around a composite paddle?
                  </p>

                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-14 mb-5 tracking-tight">The World's First Official "Pickleball Nation"</h2>
                  <p className="mb-6 leading-relaxed">
                      On April 14, 2024, the Philippine Pickleball Federation (PPF) achieved a feat of institutional legitimacy that remains a global benchmark. By being formally welcomed as the 78th member of the Philippine Olympic Committee (POC), the PPF became the world's first government-recognized National Governing Body (NGB) for the sport. This "first-mover" status acts as a powerful signal to the international community that the Philippines views pickleball as a serious sovereign priority rather than a recreational fad. It effectively moves the discipline out of the informal shadows and into the sunlight of professional, state-backed athleticism.
                  </p>

                  <blockquote className="border-l-4 border-brand-500 bg-brand-50 dark:bg-brand-900/20 p-6 md:p-8 rounded-r-2xl my-10 italic text-lg md:text-xl text-gray-800 dark:text-slate-200 font-medium shadow-sm">
                      "With its broad appeal and universal participation, pickleball may soon challenge basketball as the country's most popular sport." 
                      <footer className="mt-4 text-sm text-brand-700 dark:text-brand-400 font-bold not-italic tracking-wide uppercase">— Michael Johnson, PPF Chairman</footer>
                  </blockquote>

                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-14 mb-5 tracking-tight">The "Helios" Mega-Project: Asia's First 8-Story Vertical Stadium</h2>
                  <p className="mb-6 leading-relaxed">
                      The physical manifestation of this revolution is the Helios Pickleball Center, a P1 billion investment currently rising within the Bridgetowne Destination Estate. Developed by Robinsons Land under their new Robinsons Sports, Entertainment, and Recreation (SER) division, this 17,500-square-meter marvel is a radical response to urban density. The facility features 25 professional-grade courts and a 2,000-seat stadium court distributed across six floors of dedicated sports and recreation space. This project aligns with the "Vision 5-25-50" strategic roadmap, positioning world-class sports infrastructure as the heartbeat of a modern "live-work-play" ecosystem.
                  </p>

                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-14 mb-5 tracking-tight">Standardizing the Surge with the PPP Registry</h2>
                  <p className="mb-6 leading-relaxed">
                      Growth without structure is merely a trend, but growth backed by data is a sustainable industry. On January 1, 2026, the federation implemented the Philippine Pickleball Participant (PPP) Registry, establishing the country's first Official National Ranking System. This unified database tracks participation and performance via a 12-month rolling dashboard, providing a credible, meritocratic pathway for players to transition into professional careers. By ensuring that points are earned exclusively through sanctioned tournaments, the PPF has moved the sport from casual weekend play into a quantifiable trajectory of excellence.
                  </p>

                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-14 mb-5 tracking-tight">The Rally Scoring Revolution</h2>
                  <p className="mb-6 leading-relaxed">
                      Innovation is occurring on the court through a fundamental recalibration of the game's rhythm: the adoption of Rally Scoring for major events like the 2026 Nationals. This format is specifically engineered to enhance the "watchability" and commercial viability of the sport for modern broadcasters and digital audiences. It creates a predictable match duration and high-intensity pace that traditional side-out scoring often lacks. For team events, this is further augmented by the high-stakes Dreambreaker™ singles tiebreaker, ensuring that every match maintains maximum dramatic tension until the final rally.
                  </p>
                  
                  <ul className="list-none pl-0 mb-10 space-y-4 text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
                      <li className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span>A point is awarded on every rally, regardless of which team is serving.</span>
                      </li>
                      <li className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span>In doubles play, teams must switch sides whenever they win a point.</span>
                      </li>
                      <li className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span>Games are typically played to 21 (capped at 25) or 15 (capped at 21).</span>
                      </li>
                      <li className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span>There is no "win-by-serve" requirement, allowing for faster, more decisive match conclusions.</span>
                      </li>
                  </ul>

                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-14 mb-5 tracking-tight">Professionalizing the "Dink" Through International Certification</h2>
                  <p className="mb-6 leading-relaxed">
                      While vertical stadiums provide the hardware, the Racket Professional Organization (RPO) APAC Level 1 Coach Certification Tour provides the essential human capital. Led by global technical director Collin Johns, this tour travels through Manila, Cebu, and Davao to certify over 100 Filipino coaches with internationally recognized credentials. This initiative focuses on the "invisible infrastructure" of the sport—the standardization of instructional excellence necessary to sustain growth beyond a temporary craze. Professionalizing the coaching tier ensures that the next generation of Filipino athletes is developed using elite-level methodologies from day one.
                  </p>

                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-14 mb-5 tracking-tight">The Road to 2027 and Beyond</h2>
                  <p className="mb-6 leading-relaxed">
                      The Philippines recently served as the primary blueprint for growth at the Global Pickleball Congress, cementing its status as the future regional hub for the PPA Tour Asia by 2027. Ahead of that milestone, the nation's focus turns to Da Nang, Vietnam, for the 2026 World Cup from August 30 to September 5, where a selective Filipino contingent will represent the flag. The rapid institutionalization of this sport suggests we are witnessing the birth of a new national pastime that thrives in the intersections of urban density and corporate investment. Are you ready to trade your basketball for a paddle as the Philippines leads this global sporting revolution?
                  </p>
                  
                  <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-800 text-center">
                      <p className="text-gray-500 dark:text-slate-400 mb-6">Inspired to hit the courts? Make sure you're equipped with the best.</p>
                      <button onClick={() => scrollToSection("products")} className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-0.5">
                          <span>Shop Curated Gear Below</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                      </button>
                  </div>
              </div>
          </div>
      </article>)}

      {/* Main App Workspace (Contains React Components + Products Grid) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-16">
        
        {/* React Component Sections */}
        <div className="space-y-16" id="homepage-sections-stack">
          {/* SECTION 1: Articles and Latest in Pickleball */}
          {layoutSettings.showNews && (
            <section id="latest-news-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/70 dark:border-slate-800 space-y-6 transition-all animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50 px-2.5 py-0.5 rounded-md inline-block mb-2">
                  Articles & Guides
                </span>
                <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 leading-none">
                  Community Insights & Advice
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
                  Stay updated with Visayas tournament results, coaching mechanics, and technical advice from local players.
                </p>
              </div>
              <LatestNews />
            </section>
          )}

          {/* SECTION A: Courts Directory and Multi-dimensional Reviews */}
          {layoutSettings.showCourts && (
            <motion.section 
              id="court-reviews-section" 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/70 dark:border-slate-800 space-y-6 transition-all"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50 px-2.5 py-0.5 rounded-md inline-block mb-2">
                  Courts
                </span>
                <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 leading-none">
                  Top Rated Pickleball Courts
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
                  Explore verified pickleball court coordinates across Negros Oriental, review detailed scores for quality, lights, parking, and crowding, and register home courts.
                </p>
              </div>
              <CourtDirectory 
                currentUser={profile} 
                onSetHomeCourt={handleSetHomeCourt} 
                onShowConsentModal={() => setShowConsentModal(true)} 
                externalSearchQuery={heroSearchQuery}
              />
            </motion.section>
          )}

          {/* SECTION B: Recreational Matchmaking Coordinator */}
          {layoutSettings.showMatchmaker && (
            <motion.section 
              id="matchmaking-coordinator-section" 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/70 dark:border-slate-800 space-y-6 transition-all"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50 px-2.5 py-0.5 rounded-md inline-block mb-2">
                  Community
                </span>
                <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 leading-none">
                  Local Game Coordinator
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
                  Schedule games, configure maximum players, filter matching skill-level brackets, and coordinate live roster sheets securely.
                </p>
              </div>
              <Matchmaking 
                currentUser={profile} 
                onShowConsentModal={() => setShowConsentModal(true)} 
              />
            </motion.section>
          )}

          {/* SECTION C: Intelligent Paddle Matchmaker */}
          {layoutSettings.showPaddles && (
            <motion.section 
              id="paddle-matchmaker-section" 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/70 dark:border-slate-800 space-y-6 transition-all"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50 px-2.5 py-0.5 rounded-md inline-block mb-2">
                  Paddles
                </span>
                <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 leading-none">
                  Intelligent Paddle Reviews
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
                  Enter your physical playstyle, level, and equipment budgets to obtain customized recommended paddles from pro ratings.
                </p>
              </div>
              <EquipmentHub />
            </motion.section>
          )}
        </div>
        
        {/* Main Product Section (Curated Gear) */}
        <div id="products" className="scroll-mt-16 pt-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h2 id="featured" className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Featured Gear</h2>
                    <p className="mt-2 text-gray-500 dark:text-slate-400">Top-rated equipment and accessories for every player level.</p>
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Prices subject to change on Lazada
                </div>
            </div>

            {/* Product Grid (Static for now, as productsData is defined in HTML) */}
            <div id="product-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {/* Product Data mapped here directly for React context */}
                {[
                    {
                        name: "Laser Pickleball Paddle Edge Protection Tape (Curved Fit)",
                        originalPrice: 193.73,
                        price: 113.96,
                        discount: "-41%",
                        image: "https://sg-test-11.slatic.net/p/19d59be682c1f6c4243bb07979032ffb.jpg",
                        link: "https://s.lazada.com.ph/s.Z67RyD?c=d&t=p-iGxgo8a-s2LX7hDl&sub_aff_id=DumapickleReview&linkFormat=1"
                    },
                    {
                        name: "Waterproof Universal Neoprene Protective Sleeve Cover",
                        originalPrice: 215.93,
                        price: 127.02,
                        discount: "-41%",
                        image: "https://sg-test-11.slatic.net/p/d364d198cfb164e1d3a08710dc2e7c64.jpg",
                        link: "https://s.lazada.com.ph/s.Z67Ryx?c=c&t=p-iGyJrRN-s2La892a&sub_aff_id=DumapickleReview&linkFormat=1"
                    },
                    {
                        name: "Beesoul Thermal Press Carbon Fiber T800 Match Paddle",
                        originalPrice: 20384.76,
                        price: 20384.76,
                        discount: "",
                        image: "https://filebroker-cdn.lazada.com.ph/kf/Scadd971aeab2486f939b5d734c17111dF.jpg",
                        link: "https://s.lazada.com.ph/s.Z67RBZ?c=c&t=p-i5rsdvK-sZ8cdhc&sub_aff_id=DumapickleReview&linkFormat=1"
                    },
                    {
                        name: "Dirt Remover Pickleball Paddle Eraser & Cleaner",
                        originalPrice: 233.00,
                        price: 125.96,
                        discount: "-46%",
                        image: "https://sg-test-11.slatic.net/p/c4d70065d2ce8d71f4c29efdf16fc49b.jpg",
                        link: "https://s.lazada.com.ph/s.Z67RAY?c=c&t=p-iGxYyXK-s2LWf3fS&sub_aff_id=DumapickleReview&linkFormat=1"
                    },
                    {
                        name: "Silicone Pickleball Paddle Handle Protective Grip Cover",
                        originalPrice: 356.00,
                        price: 118.00,
                        discount: "-67%",
                        image: "https://sg-test-11.slatic.net/p/db5161b1abad6fbff42efec80667d5c3.jpg",
                        link: "https://s.lazada.com.ph/s.Z67RAe?c=c&t=p-i5eC7Aw-sXUO3pS&sub_aff_id=DumapickleReview&linkFormat=1"
                    },
                    {
                        name: "Joola Professional Carbon Fiber USAPA Approved Paddle",
                        originalPrice: 8183.00,
                        price: 8183.00,
                        discount: "",
                        image: "https://filebroker-cdn.lazada.com.ph/kf/S6dc7cad1c26d4a72b7c2c444cc6082863.jpg",
                        link: "https://s.lazada.com.ph/s.Z67RBD?c=d&t=p-iGwbCsJ-s2LRfjt7&sub_aff_id=DumapickleReview&linkFormat=1"
                    },
                    {
                        name: "10Pcs Self Adhesive Weighted Lead Tape for Custom Balance",
                        originalPrice: 224.24,
                        price: 124.58,
                        discount: "-44%",
                        image: "https://sg-test-11.slatic.net/p/a35c03d4772affe78442906788b85098.jpg",
                        link: "https://s.lazada.com.ph/s.Z67RyB?c=d&t=p-iGxsQG5-s2LXEvwz&sub_aff_id=DumapickleReview&linkFormat=1"
                    },
                    {
                        name: "Flameer Silicone Suction Cup Ball Retriever Accessory",
                        originalPrice: 219.00,
                        price: 121.83,
                        discount: "-44%",
                        image: "https://sg-test-11.slatic.net/p/6edefc70d28ae1ce44cb87ff8955fcbe.jpg",
                        link: "https://s.lazada.com.ph/s.Z678ZK?c=d&t=p-i5MThVF-sVFk3tZ&sub_aff_id=DumapickleReview&linkFormat=1"
                    },
                    {
                        name: "Wall Mounted Racket & Ball Holder Storage Rack",
                        originalPrice: 212.33,
                        price: 124.90,
                        discount: "-41%",
                        image: "https://sg-test-11.slatic.net/p/6085d39d6e0d92c3a9da91ee3a67e36e.jpg",
                        link: "https://s.lazada.com.ph/s.Z6781R?c=c&t=p-iGyaFwV-s2LaM0vb&sub_aff_id=DumapickleReview&linkFormat=1"
                    },
                    {
                        name: "Joola Professional Carbon Fiber Paddle 5th Generation",
                        originalPrice: 26176.00,
                        price: 26176.00,
                        discount: "",
                        image: "https://filebroker-cdn.lazada.com.ph/kf/S7ef469f49fb04aa7aad4170c69bc7ad76.jpg",
                        link: "https://s.lazada.com.ph/s.Z678aE?c=c&t=p-iGukGZY-s2LM9Epy&sub_aff_id=DumapickleReview&linkFormat=1"
                    },
                    {
                        name: "JOOLA Scorpeus Pro V Anna Bright Edition Paddle",
                        originalPrice: 18575.00,
                        price: 18575.00,
                        discount: "",
                        image: "https://sg-test-11.slatic.net/p/84f1f6170e91af65a28db63b030fedc4.png",
                        link: "https://s.lazada.com.ph/s.Z678ZA?c=c&t=p-iGrNykK-s2L7pcHj&sub_aff_id=DumapickleReview&linkFormat=1"
                    },
                    {
                        name: "Dopamine Fitness Series Detachable Paddle Keychain Charm",
                        originalPrice: 185.00,
                        price: 109.00,
                        discount: "-41%",
                        image: "https://sg-test-11.slatic.net/p/b7fc7e40477a44290b0eed3105713391.jpg",
                        link: "https://s.lazada.com.ph/s.Z678Zl?c=d&t=p-iGySgox-s2LasGbn&sub_aff_id=DumapickleReview&linkFormat=1"
                    }
                ].map((product, idx) => {
                  const hasDiscount = product.discount && product.discount !== "0%" && product.price < product.originalPrice;
                  return (
                    <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col group overflow-hidden">
                        <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-slate-800 overflow-hidden cursor-pointer" onClick={() => window.open(product.link, '_blank')}>
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" loading="lazy" referrerPolicy="no-referrer" />
                            {hasDiscount && <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">{product.discount}</div>}
                        </div>
                        
                        <div className="p-5 flex flex-col flex-grow">
                            <a href={product.link} target="_blank" rel="noreferrer" className="block mb-2 group-hover:text-brand-600 transition-colors">
                                <h3 className="font-semibold text-gray-900 dark:text-slate-100 leading-snug line-clamp-2" title={product.name}>{product.name}</h3>
                            </a>
                            
                            <div className="mt-auto pt-4 flex flex-col gap-4">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-xl font-bold text-lazada">
                                      {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(product.price)}
                                    </span>
                                    {hasDiscount && (
                                      <span className="text-sm text-gray-400 line-through">
                                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(product.originalPrice)}
                                      </span>
                                    )}
                                </div>
                                
                                <a href={product.link} target="_blank" rel="noopener noreferrer" className="w-full bg-white dark:bg-slate-800 border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 text-center flex items-center justify-center gap-2">
                                    <span>Shop on Lazada</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                  );
                })}
            </div>
        </div>

        <FAQSection />

        {/* DPA Compliance: Data Subject Rights Settings Dashboard (Rendered when Profile exists) */}
        {profile && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-6" id="dpa-subject-rights-settings">
            <div className="flex items-start justify-between gap-4 flex-wrap border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h4 className="text-lg font-display font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5.5 h-5.5 text-emerald-400" /> Your Data Privacy Act (DPA) Portal
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In absolute compliance with the **Philippine Data Privacy Act of 2012 (R.A. 10173)**, you have full authority to command your personal data records:
                </p>
              </div>

              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-3 py-1 rounded-xl">
                DPA Consent Authorized
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Profile Details summary card */}
              <div className="bg-slate-950 p-4 rounded-2xl space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Current Profile Record</span>
                  <VerifiedReviewerBadge profile={profile} size="xs" showProgress={true} />
                </div>
                <p className="text-xs font-bold text-white">{profile.displayName}</p>
                <p className="text-[10px] text-slate-400">{profile.email}</p>
                <p className="text-[10px] text-emerald-400 font-mono">UID: {profile.uid.substring(0, 16)}...</p>
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
              </div>

              {/* Data Portability (Access Right) */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs">1. Right to Access & Portability</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Download a complete structured JSON copy of all personal profile logs stored in our databases.
                </p>
                <button
                  id="export-dpa-btn"
                  onClick={handleExportDataLog}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
                >
                  <Download className="w-4 h-4 text-emerald-400" /> Export Data Log (.json)
                </button>
              </div>

              {/* Erasure (Erasure Right) */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs text-rose-400">2. Right to Erasure & Blocking</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Permanently wipe your profile and database entries. This removes all your reviews in compliance with NPC rules.
                </p>
                <button
                  id="erase-dpa-btn"
                  onClick={handleEraseDataProfile}
                  className="py-2 px-4 rounded-xl bg-rose-950/40 border border-rose-900/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" /> Erase My Data Profile
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {showRatingQuiz && profile && (
        <RatingQuizModal
          profile={profile}
          onClose={() => setShowRatingQuiz(false)}
          onUpdateProfile={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}

      {/* DPA Consent popup Modal container */}
      {showConsentModal && (
        <DpaNotice 
          onConsent={handleConsentAgreement} 
          onDecline={handleDeclineConsent} 
        />
      )}

      {/* Footer */}
      <footer id="about" className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                  <div>
                      <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                          <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
                              D
                          </div>
                          <span className="font-bold text-lg text-gray-900 dark:text-slate-100">DumaPickle Finds</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto md:mx-0">
                          Curating the best pickleball gear available online. We help you find quality equipment to elevate your game.
                      </p>
                  </div>
                  <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wider mb-4">Disclosure</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto md:mx-0">
                          As a Lazada Affiliate, we may earn a small commission from qualifying purchases made through links on this page at no extra cost to you.
                      </p>
                  </div>
                  <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wider mb-4">Quick Links</h3>
                      <ul className="space-y-2 text-sm text-gray-500 dark:text-slate-400">
                          <li><button onClick={() => window.scrollTo(0,0)} className="hover:text-brand-600 transition-colors">Home</button></li>
                          <li><button onClick={() => scrollToSection('products')} className="hover:text-brand-600 transition-colors">Shop</button></li>
                          <li>
                            <button onClick={() => setShowAdmin(true)} className="text-amber-500 hover:text-amber-400 hover:underline transition-all flex items-center justify-center md:justify-start gap-1 w-full">
                              <Lock className="w-3 h-3" /> Admin Portal
                            </button>
                          </li>
                          <li><button onClick={() => setShowDpaDocsModal("privacy")} className="hover:text-brand-600 transition-colors">Data Privacy Policy</button></li>
                          <li><button onClick={() => setShowDpaDocsModal("tos")} className="hover:text-brand-600 transition-colors">Terms of Service</button></li>
                      </ul>
                  </div>
              </div>
              <div className="border-t border-gray-100 dark:border-slate-800 mt-12 pt-8 text-center">
                  <p className="text-xs text-gray-400">&copy; 2026 DumaPickle Reviews. All rights reserved.</p>
              </div>
          </div>
      </footer>

      {/* Interactive PDF-Style legal document viewer */}
      {showDpaDocsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="dpa-docs-viewer-modal">
          <div className="max-w-2xl w-full">
            <PrivacyDpaDocs 
              showToS={showDpaDocsModal === 'tos'} 
              onClose={() => setShowDpaDocsModal(null)} 
            />
          </div>
        </div>
      )}

      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
      <AIChatWidget />
    </div>
  );
}
