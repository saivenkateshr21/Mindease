
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';
import { MoodEntry } from '../types';
import { MOOD_emojis } from '../constants';

interface MoodCalendarProps {
  moodHistory: MoodEntry[];
}

const MoodCalendar: React.FC<MoodCalendarProps> = ({ moodHistory }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const getMoodForDate = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Find the last entry for this specific date
    return moodHistory
      .filter(entry => new Date(entry.date).toDateString() === checkDate.toDateString())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const getMoodColor = (score: number) => {
    if (score >= 8) return 'bg-teal-500 text-white hover:bg-teal-600';
    if (score >= 6) return 'bg-emerald-400 text-white hover:bg-emerald-500';
    if (score >= 4) return 'bg-yellow-400 text-slate-800 hover:bg-yellow-500';
    return 'bg-rose-400 text-white hover:bg-rose-500';
  };

  const selectedMood = selectedDate ? getMoodForDate(selectedDate.getDate()) : null;
  const selectedEmoji = selectedMood ? MOOD_emojis.find(e => e.score === selectedMood.score) : null;

  const renderDays = () => {
    const days = [];
    
    // Empty cells for days before start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-full" />);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const mood = getMoodForDate(day);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
          className={`
            h-10 w-10 md:w-full md:h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all relative
            ${mood ? getMoodColor(mood.score) : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
            ${isToday ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-800' : ''}
            ${isSelected ? 'transform scale-110 shadow-lg ring-2 ring-slate-400 z-10' : ''}
          `}
        >
          {day}
          {mood && (
            <span className="absolute bottom-0.5 right-1 w-1.5 h-1.5 rounded-full bg-white/70" />
          )}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Calendar Grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-700 dark:text-slate-200 text-lg">
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </h4>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 py-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {renderDays()}
        </div>
      </div>

      {/* Selected Day Details Panel */}
      <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700 flex flex-col">
        {selectedDate ? (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {selectedDate.toLocaleDateString('default', { weekday: 'long' })}
                </p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <button 
                onClick={() => setSelectedDate(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {selectedMood ? (
              <div className="flex-1 flex flex-col animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl bg-white dark:bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center shadow-sm">
                    {selectedEmoji?.emoji || '😐'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-lg">{selectedEmoji?.label || 'Logged'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Score: {selectedMood.score}/10</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600 flex-1">
                  <p className="text-xs text-slate-400 mb-1">Notes</p>
                  <p className="text-slate-700 dark:text-slate-300 text-sm italic">
                    {selectedMood.note || "No notes added for this day."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                  <CalendarIcon size={20} className="opacity-50" />
                </div>
                <p className="text-sm">No mood logged for this day.</p>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 gap-2">
             <CalendarIcon size={32} className="opacity-20" />
             <p className="text-sm">Select a date to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodCalendar;
