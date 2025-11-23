
import React, { useState, useEffect } from 'react';
import { generateDailyQuote } from '../services/geminiService';
import { MoodEntry, User } from '../types';
import { MOOD_emojis } from '../constants';
import MoodChart from '../components/MoodChart';
import MoodCalendar from '../components/MoodCalendar';
import { Sparkles, ArrowRight, Wind, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomeProps {
  moodHistory: MoodEntry[];
  addMood: (score: number) => void;
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ moodHistory, addMood, user }) => {
  const [quote, setQuote] = useState<string>('');
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [todaysMoodLogged, setTodaysMoodLogged] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      setLoadingQuote(true);
      const q = await generateDailyQuote();
      setQuote(q);
      setLoadingQuote(false);
    };
    fetchQuote();
  }, []);

  const handleMoodSelect = (score: number) => {
    addMood(score);
    setTodaysMoodLogged(true);
  };

  const getMoodTrendSummary = () => {
    if (moodHistory.length < 3) return "Keep tracking daily to see your mood trends.";
    
    // Sort by date ascending
    const sorted = [...moodHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Analyze recent 7 days
    const recent = sorted.slice(-7);
    if (recent.length === 0) return "";
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.score, 0) / recent.length;

    // Calculate Variance for recent entries to detect volatility
    const variance = recent.reduce((sum, entry) => sum + Math.pow(entry.score - recentAvg, 2), 0) / recent.length;
    const isVolatile = variance > 4; // High fluctuation

    // Comparative Analysis (if we have at least 14 days of data)
    if (sorted.length >= 14) {
      // Previous 7 days (before the recent 7)
      const previous = sorted.slice(-14, -7);
      const previousAvg = previous.reduce((sum, entry) => sum + entry.score, 0) / previous.length;
      
      const change = recentAvg - previousAvg;

      // Significant positive shift
      if (change >= 1.5) {
        return "You've shown significant emotional improvement compared to last week!";
      }
      
      // Significant negative shift
      if (change <= -1.5) {
        return "This week has been tougher than the last. Be gentle with yourself.";
      }
    }

    // Pattern Analysis
    if (isVolatile) {
      return "Your mood has been quite fluctuating lately. Finding moments of balance might help.";
    }
    
    if (recentAvg >= 8) {
      return "You're on a fantastic streak! You've been consistently feeling great.";
    }
    
    if (recentAvg >= 6.5) {
      return "You've been maintaining a healthy, positive outlook this week.";
    }
    
    if (recentAvg >= 4.5) {
      return "You've had a balanced week with some natural ups and downs.";
    }
    
    if (recentAvg >= 3) {
      return "You've been facing some challenges. Remember that it's okay to ask for support.";
    }

    return "It's been a difficult week. Please prioritize self-care and rest.";
  };

  const calculateStreak = () => {
    if (!moodHistory.length) return 0;
    
    const sorted = [...moodHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const uniqueDates = Array.from(new Set(sorted.map(m => new Date(m.date).toDateString())));
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // Check if streak is active (logged today or yesterday)
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0; 
    }

    // Simple consecutive day check logic
    let checkDate = new Date();
    // If most recent is yesterday, start checking from yesterday
    if (uniqueDates[0] === yesterday) {
       checkDate.setDate(checkDate.getDate() - 1);
    }

    for (const dateStr of uniqueDates) {
      // Allow for multiple entries on same day (uniqueDates handles this mostly, but check needed)
      if (dateStr === checkDate.toDateString()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break; 
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Welcome Back, {user?.name.split(' ')[0]}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">How are you feeling today?</p>
        </div>
        <Link to="/chat" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:underline">
          Chat with MindEase <ArrowRight size={18} />
        </Link>
      </div>

      {/* Daily Quote Card */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-2xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 opacity-20" size={100} />
        <h3 className="text-sm font-medium uppercase tracking-wider opacity-80 mb-2">Daily Affirmation</h3>
        {loadingQuote ? (
           <div className="h-8 bg-white/20 animate-pulse rounded w-3/4"></div>
        ) : (
          <p className="text-xl md:text-2xl font-serif font-medium leading-relaxed italic relative z-10">
            "{quote}"
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Mood Tracker Input */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Log Your Mood</h3>
          {!todaysMoodLogged ? (
            <div className="flex justify-between items-center gap-2">
              {MOOD_emojis.map((item) => (
                <button
                  key={item.score}
                  onClick={() => handleMoodSelect(item.score)}
                  className="flex flex-col items-center gap-2 group transition-transform hover:-translate-y-1"
                >
                  <div className="w-12 h-12 flex items-center justify-center text-3xl bg-slate-50 dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 group-hover:border-primary group-hover:bg-primary/5 dark:group-hover:bg-primary/20 transition-colors">
                    {item.emoji}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-800 dark:text-green-300 border border-green-100 dark:border-green-800/50 flex flex-col items-center gap-2 animate-fade-in">
              <p className="font-bold text-lg">Mood logged!</p>
              <p className="text-sm opacity-90">Great job checking in with yourself.</p>
              <div className="mt-2 px-4 py-2 bg-white/60 dark:bg-black/20 rounded-lg text-sm font-medium max-w-xs">
                {getMoodTrendSummary()}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions & Stats */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center gap-3 transition-colors relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Quick Actions</h3>
            {streak > 0 && (
                <div className="flex items-center gap-1 text-orange-500 font-bold bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg text-xs border border-orange-100 dark:border-orange-900/30">
                    <Zap size={14} fill="currentColor" />
                    <span>{streak} Day Streak</span>
                </div>
            )}
          </div>

          <Link to="/relax" className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600 group">
             <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 p-2 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
               <Wind size={20} />
             </div>
             <div>
               <p className="font-semibold text-slate-800 dark:text-slate-100">Take a Breather</p>
               <p className="text-xs text-slate-500 dark:text-slate-400">2 min guided breathing</p>
             </div>
          </Link>
          <Link to="/journal" className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600 group">
             <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 p-2 rounded-lg group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
               <Sparkles size={20} />
             </div>
             <div>
               <p className="font-semibold text-slate-800 dark:text-slate-100">Journal Entry</p>
               <p className="text-xs text-slate-500 dark:text-slate-400">Reflect on your day</p>
             </div>
          </Link>
        </div>
      </div>

      {/* Mood History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mood Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Weekly Trends</h3>
          <MoodChart data={moodHistory} />
        </div>

        {/* Mood Calendar */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Mood Calendar</h3>
          <MoodCalendar moodHistory={moodHistory} />
        </div>

      </div>

    </div>
  );
};

export default Home;
