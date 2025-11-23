
import React, { useState, useEffect } from 'react';
import { generateJournalPrompt, analyzeJournalEntry } from '../services/geminiService';
import { JournalEntry, JournalAnalysis, LoadingState, User } from '../types';
import { Sparkles, Save, BookOpen, Loader2 } from 'lucide-react';

interface JournalProps {
  addMood: (score: number, note?: string) => void;
  user: User | null;
}

const Journal: React.FC<JournalProps> = ({ addMood, user }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Load User Specific Data
  useEffect(() => {
    if (user && user.email) {
      const userKey = `mindEase_journal_${user.email}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        setEntries(JSON.parse(saved));
      } else {
        setEntries([]);
      }
    } else {
      setEntries([]);
    }
  }, [user]);

  // Save User Specific Data
  useEffect(() => {
    if (user && user.email) {
      const userKey = `mindEase_journal_${user.email}`;
      localStorage.setItem(userKey, JSON.stringify(entries));
    }
  }, [entries, user]);

  const handleGeneratePrompt = async () => {
    setLoadingPrompt(true);
    const p = await generateJournalPrompt();
    setPrompt(p);
    setLoadingPrompt(false);
  };

  const handleSave = async () => {
    if (!currentText.trim()) return;

    setAnalyzing(true);
    const analysis: JournalAnalysis = await analyzeJournalEntry(currentText);
    setAnalyzing(false);

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: currentText,
      analysis
    };

    setEntries(prev => [newEntry, ...prev]);
    setCurrentText('');
    setPrompt('');
    
    // Automatically log mood if analysis is successful
    if (analysis && analysis.sentimentScore) {
      addMood(analysis.sentimentScore, "Journal Analysis");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      
      {/* Editor Section */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 flex flex-col transition-colors">
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Journal</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Write freely or use a prompt.</p>
            </div>
            <button 
              onClick={handleGeneratePrompt}
              disabled={loadingPrompt}
              className="flex items-center gap-2 text-sm text-primary font-medium bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 px-3 py-1.5 rounded-full transition-colors"
            >
              {loadingPrompt ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {prompt ? 'New Prompt' : 'Get Prompt'}
            </button>
          </div>

          {prompt && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-amber-900 dark:text-amber-200 text-sm italic relative animate-fade-in">
              "{prompt}"
            </div>
          )}

          <textarea
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder="Start writing here..."
            className="flex-1 w-full resize-none focus:outline-none bg-transparent text-slate-700 dark:text-slate-200 leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-600"
          />

          <div className="flex justify-end mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={handleSave}
              disabled={!currentText.trim() || analyzing}
              className="flex items-center gap-2 bg-slate-800 dark:bg-slate-700 text-white px-6 py-2.5 rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {analyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Entry</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col transition-colors">
        <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-100 font-bold">
          <BookOpen size={20} />
          <h3>Previous Entries</h3>
        </div>
        
        <div className="overflow-y-auto space-y-4 pr-2">
          {entries.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
              <p>No entries yet.</p>
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/40 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  {entry.analysis && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      entry.analysis.sentimentScore >= 7 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      entry.analysis.sentimentScore <= 4 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      Mood: {entry.analysis.sentimentScore}/10
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-2 font-serif">{entry.content}</p>
                {entry.analysis && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-600/50">
                     <p className="text-xs text-primary italic">"{entry.analysis.advice}"</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Journal;
