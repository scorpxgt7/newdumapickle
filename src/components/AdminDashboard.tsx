import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError } from '../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, updateDoc, addDoc } from 'firebase/firestore';
import { Article, Court, Booking } from '../types';
import { 
  FileText, ImageIcon, Layout, CalendarDays, MapPin, 
  Settings, Check, X, Edit2, Trash2, Plus, Eye, Menu
} from 'lucide-react';

interface Slide { image: string; badge: string; title: string; subtitle: string; }
interface LayoutSettings { showHero: boolean; showStats: boolean; showCourts: boolean; showMatchmaker: boolean; showPaddles: boolean; showNews: boolean; }

const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
  'https://upload.wikimedia.org/wikipedia/commons/3/39/Outdoor_pickleball_courts.jpg'
];

export default function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'articles' | 'carousel' | 'layout' | 'courts' | 'bookings'>('articles');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State
  const [articles, setArticles] = useState<Article[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [layout, setLayout] = useState<LayoutSettings>({ showHero: true, showStats: true, showCourts: true, showMatchmaker: true, showPaddles: true, showNews: true });
  const [submittedCourts, setSubmittedCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);

  useEffect(() => {
    // Load Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.slides) setSlides(data.slides);
        if (data.layout) setLayout(data.layout);
      }
    });

    // Load Articles
    const unsubArticles = onSnapshot(collection(db, 'articles'), (snapshot) => {
      setArticles(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Article)));
    });

    // Load Courts
    const unsubCourts = onSnapshot(collection(db, 'submitted_courts'), (snapshot) => {
      setSubmittedCourts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Court)));
    });

    // Load Bookings
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking)).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });

    return () => { unsubSettings(); unsubArticles(); unsubCourts(); unsubBookings(); };
  }, []);

  const saveSettings = async (newSlides?: Slide[], newLayout?: LayoutSettings) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'main'), { slides: newSlides || slides, layout: newLayout || layout }, { merge: true });
    } catch (e) {
      handleFirestoreError(e as any, "update" as any, "settings/main");
    }
    setSaving(false);
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'bookings', id), { status });
  };

  const saveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingArticle?.id) {
        await updateDoc(doc(db, 'articles', editingArticle.id), editingArticle as any);
      } else {
        await addDoc(collection(db, 'articles'), { ...editingArticle, date: new Date().toISOString() });
      }
      setEditingArticle(null);
    } catch(e) { handleFirestoreError(e as any, "create" as any, "articles"); }
    setSaving(false);
  };

  const deleteArticle = async (id: string) => {
    if(confirm("Delete article?")) await deleteDoc(doc(db, 'articles', id));
  };

  const approveCourt = async (court: Court) => {
    const { id, ...data } = court;
    await setDoc(doc(db, 'courts', id!), { ...data, verified: true });
    await deleteDoc(doc(db, 'submitted_courts', id!));
  };

  const rejectCourt = async (id: string) => {
    if(confirm("Reject court?")) await deleteDoc(doc(db, 'submitted_courts', id));
  };

  const tabs = [
    { id: 'articles', label: 'Articles', icon: FileText, count: articles.length },
    { id: 'carousel', label: 'Hero Slides', icon: ImageIcon, count: slides.length },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays, count: bookings.length },
    { id: 'courts', label: 'Court Approvals', icon: MapPin, count: submittedCourts.length },
    { id: 'layout', label: 'Layout Config', icon: Layout }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-950 w-full max-w-6xl h-[90vh] sm:h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row border border-slate-200 dark:border-slate-800">
        
        {/* Mobile Header */}
        <div className="sm:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <h2 className="font-bold text-slate-800 dark:text-white">Admin Portal</h2>
          <div className="flex gap-2">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col w-full sm:w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 gap-2 shrink-0 overflow-y-auto`}>
          <div className="hidden sm:flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-slate-800 dark:text-white">Admin Portal</h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); setEditingArticle(null); }}
              className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              <span className="flex items-center gap-2"><tab.icon className="w-4 h-4" /> {tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-emerald-800/50 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 p-4 sm:p-8">
          
          {/* LAYOUT */}
          {activeTab === 'layout' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <h3 className="text-2xl font-bold dark:text-white">Frontend Configuration</h3>
              <p className="text-sm text-slate-500">Toggle homepage sections dynamically.</p>
              
              <div className="space-y-3">
                {Object.keys(layout).map(key => (
                  <label key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="font-semibold text-sm dark:text-slate-200 capitalize">{key.replace('show', 'Show ')} Section</span>
                    <input 
                      type="checkbox" 
                      checked={(layout as any)[key]} 
                      onChange={e => setLayout({...layout, [key]: e.target.checked})}
                      className="w-5 h-5 accent-emerald-600"
                    />
                  </label>
                ))}
              </div>
              
              <button onClick={() => saveSettings()} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all w-full sm:w-auto">
                {saving ? 'Saving...' : 'Publish Layout Changes'}
              </button>
            </div>
          )}

          {/* BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-2xl font-bold dark:text-white">Court Bookings</h3>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-xs font-bold">
                      <tr><th className="p-4">Date</th><th className="p-4">User</th><th className="p-4">Court</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id} className="border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                          <td className="p-4"><span className="block text-emerald-600 font-bold">{b.preferredDate}</span><span className="text-xs text-slate-500 uppercase">{b.preferredTime}</span></td>
                          <td className="p-4"><span className="block font-bold dark:text-white">{b.userName}</span><span className="text-xs text-slate-500">{b.userEmail}</span></td>
                          <td className="p-4 font-medium dark:text-slate-300">{b.courtName}</td>
                          <td className="p-4">
                            <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold ${
                              b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                              b.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>{b.status}</span>
                          </td>
                          <td className="p-4 flex gap-2">
                            {b.status !== 'confirmed' && <button onClick={() => handleUpdateBookingStatus(b.id!, 'confirmed')} className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700">Confirm</button>}
                            {b.status !== 'cancelled' && <button onClick={() => handleUpdateBookingStatus(b.id!, 'cancelled')} className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-200">Cancel</button>}
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">No bookings yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* COURTS */}
          {activeTab === 'courts' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-2xl font-bold dark:text-white">Pending Court Submissions</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {submittedCourts.map(court => (
                  <div key={court.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex gap-4">
                    <img src={court.image} alt={court.name} className="w-24 h-24 object-cover rounded-lg shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold dark:text-white">{court.name}</h4>
                      <p className="text-xs text-slate-500 mb-2">{court.address}</p>
                      <div className="flex gap-2">
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md">{court.type}</span>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md">{court.price}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => approveCourt(court)} className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-1"><Check className="w-3 h-3"/> Approve</button>
                        <button onClick={() => rejectCourt(court.id!)} className="flex-1 bg-rose-100 text-rose-700 text-xs font-bold py-2 rounded-lg hover:bg-rose-200 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3"/> Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
                {submittedCourts.length === 0 && (
                  <div className="col-span-full p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">No pending submissions.</div>
                )}
              </div>
            </div>
          )}

          {/* CAROUSEL */}
          {activeTab === 'carousel' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold dark:text-white">Hero Slides</h3>
                <button onClick={() => setSlides([...slides, { image: STOCK_IMAGES[0], badge: 'NEW', title: 'New Slide', subtitle: 'Desc' }])} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700"><Plus className="w-4 h-4"/> Add Slide</button>
              </div>
              
              <div className="space-y-4">
                {slides.map((slide, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-xs text-slate-500 uppercase">Slide {idx + 1}</span>
                      <button onClick={() => setSlides(slides.filter((_, i) => i !== idx))} className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Badge</label><input type="text" value={slide.badge} onChange={(e) => { const s = [...slides]; s[idx].badge = e.target.value; setSlides(s); }} className="w-full p-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg" /></div>
                      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Title</label><input type="text" value={slide.title} onChange={(e) => { const s = [...slides]; s[idx].title = e.target.value; setSlides(s); }} className="w-full p-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg" /></div>
                      <div className="sm:col-span-2"><label className="text-xs font-bold text-slate-500 mb-1 block">Subtitle</label><input type="text" value={slide.subtitle} onChange={(e) => { const s = [...slides]; s[idx].subtitle = e.target.value; setSlides(s); }} className="w-full p-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg" /></div>
                      <div className="sm:col-span-2"><label className="text-xs font-bold text-slate-500 mb-1 block">Image URL</label><input type="text" value={slide.image} onChange={(e) => { const s = [...slides]; s[idx].image = e.target.value; setSlides(s); }} className="w-full p-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg" /></div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => saveSettings()} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all">
                {saving ? 'Saving...' : 'Save Slides'}
              </button>
            </div>
          )}

          {/* ARTICLES */}
          {activeTab === 'articles' && (
            <div className="space-y-6 animate-fade-in">
              {!editingArticle ? (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold dark:text-white">Articles</h3>
                    <button onClick={() => setEditingArticle({ title: '', excerpt: '', content: '', image: STOCK_IMAGES[0], category: 'News', readTime: '5 min' })} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700"><Plus className="w-4 h-4"/> New Article</button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {articles.map(article => (
                      <div key={article.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col">
                        <img src={article.image} alt={article.title} className="w-full h-32 object-cover" />
                        <div className="p-4 flex-1 flex flex-col">
                          <h4 className="font-bold dark:text-white mb-1">{article.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{article.excerpt}</p>
                          <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded font-bold">{article.category}</span>
                            <div className="flex gap-1">
                              <button onClick={() => setEditingArticle(article)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                              <button onClick={() => deleteArticle(article.id!)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <form onSubmit={saveArticle} className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">{editingArticle.id ? 'Edit' : 'Create'} Article</h3>
                    <button type="button" onClick={() => setEditingArticle(null)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg text-sm font-bold">Cancel</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><label className="text-xs font-bold block mb-1">Title</label><input required value={editingArticle.title} onChange={e=>setEditingArticle({...editingArticle, title: e.target.value})} className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg" /></div>
                    <div className="md:col-span-2"><label className="text-xs font-bold block mb-1">Excerpt</label><input required value={editingArticle.excerpt} onChange={e=>setEditingArticle({...editingArticle, excerpt: e.target.value})} className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg" /></div>
                    <div><label className="text-xs font-bold block mb-1">Category</label><input required value={editingArticle.category} onChange={e=>setEditingArticle({...editingArticle, category: e.target.value})} className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg" /></div>
                    <div><label className="text-xs font-bold block mb-1">Read Time</label><input required value={editingArticle.readTime} onChange={e=>setEditingArticle({...editingArticle, readTime: e.target.value})} className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg" /></div>
                    <div className="md:col-span-2"><label className="text-xs font-bold block mb-1">Image URL</label><input required value={editingArticle.image} onChange={e=>setEditingArticle({...editingArticle, image: e.target.value})} className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg" /></div>
                    <div className="md:col-span-2"><label className="text-xs font-bold block mb-1">Content (Markdown/HTML supported)</label><textarea required rows={10} value={editingArticle.content} onChange={e=>setEditingArticle({...editingArticle, content: e.target.value})} className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono" /></div>
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md">{saving ? 'Saving...' : 'Publish Article'}</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
