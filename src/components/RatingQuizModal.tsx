import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2, Target, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';

interface RatingQuizModalProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
}

const QUESTIONS = [
  {
    id: 1,
    question: "How consistently can you sustain a dink rally (soft shots over the net) without making an unforced error?",
    options: [
      "I struggle to hit more than 2-3 dinks in a row.",
      "I can sustain short dink rallies but often pop the ball up.",
      "I can consistently dink and move my opponents around.",
      "I have full control, rarely pop it up, and can aggressively dink."
    ]
  },
  {
    id: 2,
    question: "How would you describe your third shot drop?",
    options: [
      "What is a third shot drop?",
      "I try it, but usually hit it too high or into the net.",
      "I can execute it reliably, getting to the kitchen line most of the time.",
      "It is a strong weapon; I can drop consistently from anywhere on the court."
    ]
  },
  {
    id: 3,
    question: "How well do you anticipate your opponent's shots and position yourself?",
    options: [
      "I usually react after they hit the ball.",
      "I sometimes guess right, but struggle with fast-paced shots.",
      "I read the game well and am usually in the right spot.",
      "I anticipate exceptionally well, rarely out of position, and dictate the pace."
    ]
  }
];

export default function RatingQuizModal({ profile, onClose, onUpdateProfile }: RatingQuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ rating: string, summary: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectOption = (option: string) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      analyzeResults(newAnswers);
    }
  };

  const analyzeResults = async (finalAnswers: string[]) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch('/api/ai-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze quiz results');
      }

      const data = await response.json();
      const text = data.result || "";
      
      const ratingMatch = text.match(/Rating:\s*(.+)/);
      const summaryMatch = text.match(/Summary:\s*(.+)/s);
      
      const rating = ratingMatch ? ratingMatch[1].trim() : "Unknown";
      const summary = summaryMatch ? summaryMatch[1].trim() : text;

      setResult({ rating, summary });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAndClose = async () => {
    if (!result || !profile) return;
    setIsSaving(true);
    try {
      const updated = { ...profile, skillLevel: result.rating };
      await setDoc(doc(db, 'users', profile.uid), updated);
      onUpdateProfile(updated);
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <h3 className="font-display font-bold text-lg flex items-center gap-2 relative z-10">
            <Sparkles className="w-5 h-5" />
            AI Skill Assessment
          </h3>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors relative z-10"
            disabled={isAnalyzing || isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error ? (
             <div className="text-center py-8 space-y-4">
               <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
                 <X className="w-6 h-6" />
               </div>
               <p className="text-rose-600 dark:text-rose-400 font-medium">{error}</p>
               <button 
                  onClick={() => {
                    setError(null);
                    setCurrentQuestion(0);
                    setAnswers([]);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold"
               >
                 Try Again
               </button>
             </div>
          ) : result ? (
            <div className="text-center py-4 space-y-6">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Estimated Level</p>
                <h4 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{result.rating}</h4>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic">"{result.summary}"</p>
              </div>

              <button 
                onClick={handleSaveAndClose}
                disabled={isSaving}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Save to Profile
              </button>
            </div>
          ) : isAnalyzing ? (
             <div className="text-center py-12 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
                <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">Our AI Coach is analyzing your responses...</p>
             </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Question {currentQuestion + 1} of {QUESTIONS.length}</span>
                <div className="flex gap-1">
                  {QUESTIONS.map((_, idx) => (
                    <div key={idx} className={`w-2 h-2 rounded-full ${idx <= currentQuestion ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  ))}
                </div>
              </div>
              
              <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {QUESTIONS[currentQuestion].question}
              </h4>
              
              <div className="space-y-3">
                {QUESTIONS[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(option)}
                    className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center group-hover:border-indigo-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-indigo-500 transition-colors" />
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
