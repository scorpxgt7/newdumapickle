import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User, Phone, Mail, Clock, Send } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Court, UserProfile } from '../types';

interface BookCourtModalProps {
  court: Court;
  currentUser: UserProfile | null;
  onClose: () => void;
}

export default function BookCourtModal({ court, currentUser, onClose }: BookCourtModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    date: '',
    time: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to book a court.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "bookings"), {
        userId: currentUser.uid,
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        courtId: court.id,
        courtName: court.name,
        preferredDate: formData.date,
        preferredTime: formData.time,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "bookings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <h3 className="font-display font-bold text-lg flex items-center gap-2 relative z-10">
            <Calendar className="w-5 h-5" />
            Book a Court
          </h3>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Sent!</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your reservation inquiry for {court.name} has been received. We will contact you shortly to confirm your booking.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">{court.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{court.address}</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="Juan Dela Cruz" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="juan@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="0917 123 4567" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 text-sm text-slate-900 dark:text-white transition-all outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <select name="time" value={formData.time} onChange={handleChange} required className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 text-sm text-slate-900 dark:text-white transition-all outline-none">
                        <option value="">Select Time</option>
                        <option value="morning">Morning (6AM - 12PM)</option>
                        <option value="afternoon">Afternoon (12PM - 5PM)</option>
                        <option value="evening">Evening (5PM - 10PM)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                 disabled={isSubmitting}>
                  <Calendar className="w-5 h-5" />
                  Submit Request
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
