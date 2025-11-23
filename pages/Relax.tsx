
import React, { useState, useEffect } from 'react';
import { generateCalmingImage } from '../services/geminiService';
import { BREATHING_CYCLES } from '../constants';
import { Wind, Image as ImageIcon, Loader2, Play, Pause, Sparkles, History, Trash2, Maximize2, Clock, RefreshCw, Edit2, Check, X, RotateCcw } from 'lucide-react';
import { User } from '../types';

interface StoredImage {
  id: string;
  url: string;
  prompt: string;
  description?: string; // Custom user description
  timestamp: number;
}

interface PromptHistoryItem {
  id: string;
  prompt: string;
  timestamp: number;
}

interface BreathingSession {
  id: string;
  timestamp: number;
  cycleName: string;
  durationSec: number;
  cycles: number;
}

interface RelaxProps {
  user: User | null;
}

const Relax: React.FC<RelaxProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'breathe' | 'visualize'>('breathe');

  // Breathing State
  const [breathingActive, setBreathingActive] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'pause'>('idle');
  const [instruction, setInstruction] = useState('Ready?');
  const [circleScale, setCircleScale] = useState(1);
  const [transitionDuration, setTransitionDuration] = useState(0.5);
  const [progressDuration, setProgressDuration] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<BreathingSession[]>([]);
  
  // Visualization State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [recentImages, setRecentImages] = useState<StoredImage[]>([]);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  
  // Gallery Editing State
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const SUGGESTED_PROMPTS = [
    "A cozy cabin in snowy mountains",
    "Sunset over a calm ocean",
    "A blooming cherry blossom garden",
    "A hammock between two palm trees",
    "Rain falling on a window pane",
    "A quiet library with old books"
  ];

  // --- DATA LOADING ---
  useEffect(() => {
    if (user && user.email) {
      // Load Breathing History
      try {
        const savedHistory = localStorage.getItem(`mindEase_breathing_history_${user.email}`);
        setSessionHistory(savedHistory ? JSON.parse(savedHistory) : []);
      } catch (e) {
        setSessionHistory([]);
      }

      // Load Images
      try {
        const savedImages = localStorage.getItem(`mindEase_recent_visualizations_${user.email}`);
        setRecentImages(savedImages ? JSON.parse(savedImages) : []);
      } catch (e) {
        setRecentImages([]);
      }

      // Load Prompt History
      try {
        const savedPrompts = localStorage.getItem(`mindEase_prompt_history_${user.email}`);
        setPromptHistory(savedPrompts ? JSON.parse(savedPrompts) : []);
      } catch (e) {
        setPromptHistory([]);
      }
    } else {
        setSessionHistory([]);
        setRecentImages([]);
        setPromptHistory([]);
    }
  }, [user]);

  // --- DATA SAVING (Breathing) ---
  useEffect(() => {
    if (user && user.email) {
       localStorage.setItem(`mindEase_breathing_history_${user.email}`, JSON.stringify(sessionHistory));
    }
  }, [sessionHistory, user]);

  // --- DATA SAVING (Images) ---
  useEffect(() => {
    if (user && user.email) {
      const saveToStorage = (images: StoredImage[]) => {
        try {
          localStorage.setItem(`mindEase_recent_visualizations_${user.email}`, JSON.stringify(images));
        } catch (e: any) {
          // Handle QuotaExceededError
          if (e.name === 'QuotaExceededError' || e.code === 22) {
            console.warn("Storage quota exceeded. Removing oldest image.");
            if (images.length > 1) {
               // Recursively try saving with one less image
               saveToStorage(images.slice(0, -1));
            } else {
               localStorage.removeItem(`mindEase_recent_visualizations_${user.email}`);
            }
          }
        }
      };
      saveToStorage(recentImages);
    }
  }, [recentImages, user]);

  // --- DATA SAVING (Prompts) ---
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`mindEase_prompt_history_${user.email}`, JSON.stringify(promptHistory));
    }
  }, [promptHistory, user]);

  // Breathing Logic
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let currentPhase = 'inhale'; // Local tracking for immediate logic flow

    if (breathingActive) {
      const cycle = BREATHING_CYCLES[cycleIndex];

      const runPhase = () => {
        setPhase(currentPhase as any);

        if (currentPhase === 'inhale') {
            setInstruction('Breathe In');
            setCircleScale(1.5);
            setTransitionDuration(cycle.inhale);
            setProgressDuration(cycle.inhale);
            
            timeoutId = setTimeout(() => {
                currentPhase = 'hold';
                runPhase();
            }, cycle.inhale * 1000);

        } else if (currentPhase === 'hold') {
            setInstruction('Hold');
            setCircleScale(1.5); // Stay expanded
            // Increase transition time for smoother color shift
            setTransitionDuration(1.5); 
            setProgressDuration(cycle.hold);
            
            timeoutId = setTimeout(() => {
                currentPhase = 'exhale';
                runPhase();
            }, cycle.hold * 1000);

        } else if (currentPhase === 'exhale') {
            setInstruction('Breathe Out');
            setCircleScale(1);
            setTransitionDuration(cycle.exhale);
            setProgressDuration(cycle.exhale);
            
            timeoutId = setTimeout(() => {
                if (cycle.pause > 0) {
                    currentPhase = 'pause';
                } else {
                    currentPhase = 'inhale';
                    setCompletedCycles(c => c + 1);
                }
                runPhase();
            }, cycle.exhale * 1000);

        } else if (currentPhase === 'pause') {
            setInstruction('Rest');
            setCircleScale(1);
            // Increase transition time for smoother color shift
            setTransitionDuration(1.5);
            setProgressDuration(cycle.pause);
            
            timeoutId = setTimeout(() => {
                currentPhase = 'inhale';
                setCompletedCycles(c => c + 1);
                runPhase();
            }, cycle.pause * 1000);
        }
      }

      runPhase();

    } else {
      setPhase('idle');
      setInstruction('Ready?');
      setCircleScale(1);
      setTransitionDuration(1.0);
      setProgressDuration(0);
      setCompletedCycles(0); // Reset counter on stop
      if (timeoutId!) clearTimeout(timeoutId);
    }

    return () => {
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [breathingActive, cycleIndex]);

  const handleToggleBreathing = () => {
    if (breathingActive) {
        // User is stopping/pausing
        if (completedCycles > 0) {
            const currentCycle = BREATHING_CYCLES[cycleIndex];
            const cycleDuration = currentCycle.inhale + currentCycle.hold + currentCycle.exhale + currentCycle.pause;
            const totalDuration = completedCycles * cycleDuration;

            const newSession: BreathingSession = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                cycleName: currentCycle.name,
                durationSec: totalDuration,
                cycles: completedCycles
            };
            setSessionHistory(prev => [newSession, ...prev]);
        }
        setBreathingActive(false);
    } else {
        setBreathingActive(true);
    }
  };

  const clearHistory = () => {
    if (confirm('Clear breathing session history?')) {
        setSessionHistory([]);
    }
  };

  const clearPromptHistory = () => {
    if (confirm('Clear prompt history?')) {
        setPromptHistory([]);
    }
  };

  const getCircleStyles = () => {
    // Base styles
    let baseStyles = "w-64 h-64 rounded-full flex items-center justify-center transition-all ease-in-out shadow-2xl relative z-10 overflow-hidden ";
    
    // Using solid colors allows for smoother CSS transitions than gradients
    if (phase === 'inhale') {
      return baseStyles + "bg-teal-400 shadow-teal-400/50 scale-110";
    }
    if (phase === 'hold') {
      return baseStyles + "bg-teal-500 shadow-teal-500/50";
    }
    if (phase === 'exhale') {
      return baseStyles + "bg-teal-700 shadow-teal-700/50";
    }
    if (phase === 'pause') {
      return baseStyles + "bg-slate-400 shadow-slate-400/50";
    }
    
    // Idle
    return baseStyles + "bg-teal-200 dark:bg-teal-800 shadow-teal-200/50 dark:shadow-teal-900/30"; 
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    
    setImageLoading(true);
    
    // Add to prompt history immediately
    const newPromptEntry: PromptHistoryItem = {
      id: Date.now().toString(),
      prompt: imagePrompt,
      timestamp: Date.now()
    };
    // Avoid duplicate concurrent entries or just push it
    setPromptHistory(prev => [newPromptEntry, ...prev]);

    const result = await generateCalmingImage(imagePrompt);
    
    if (result) {
      setImageUrl(result);
      // Save to recent images
      const newImage: StoredImage = {
        id: Date.now().toString(),
        url: result,
        prompt: imagePrompt,
        description: imagePrompt, // Default description is prompt
        timestamp: Date.now()
      };
      setRecentImages(prev => [newImage, ...prev]);
    }
    setImageLoading(false);
  };

  const deleteImage = (id: string) => {
    setRecentImages(prev => prev.filter(img => img.id !== id));
  };

  const startEditing = (img: StoredImage) => {
    setEditingImageId(img.id);
    setEditValue(img.description || img.prompt);
  };

  const saveDescription = (id: string) => {
    setRecentImages(prev => prev.map(img => 
      img.id === id ? { ...img, description: editValue } : img
    ));
    setEditingImageId(null);
  };

  const cancelEditing = () => {
    setEditingImageId(null);
    setEditValue('');
  };

  // Helper to render progress bar segments
  const renderProgressSegments = () => {
    const cycle = BREATHING_CYCLES[cycleIndex];
    const totalDuration = cycle.inhale + cycle.hold + cycle.exhale + cycle.pause;
    
    const segments = [
      { name: 'Inhale', duration: cycle.inhale, color: 'bg-teal-300', key: 'inhale' },
      { name: 'Hold', duration: cycle.hold, color: 'bg-teal-500', key: 'hold' },
      { name: 'Exhale', duration: cycle.exhale, color: 'bg-teal-700', key: 'exhale' },
      { name: 'Pause', duration: cycle.pause, color: 'bg-slate-400', key: 'pause' }
    ].filter(s => s.duration > 0);

    return (
      <div className="flex w-64 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-8 overflow-hidden shadow-inner">
        {segments.map((segment) => {
           const phases = ['inhale', 'hold', 'exhale', 'pause'];
           const currentIdx = phases.indexOf(phase);
           const segmentIdx = phases.indexOf(segment.key);
           
           let isPast = false;
           if (phase !== 'idle' && currentIdx > segmentIdx) {
               isPast = true;
           }
           
           const isActive = phase === segment.key;

           return (
            <div 
              key={segment.key}
              className={`h-full relative border-r border-slate-100/10 last:border-0`}
              style={{ width: `${(segment.duration / totalDuration) * 100}%` }}
            >
               {/* Animated filler */}
               <div
                 key={`${segment.key}-${completedCycles}`} // Force re-render on new cycle to restart animation
                 className={`absolute top-0 left-0 h-full ${segment.color} ${isActive ? 'animate-fill-bar' : ''} ${isPast ? 'w-full' : 'w-0'} shadow-sm`}
                 style={{
                   animationDuration: isActive ? `${segment.duration}s` : '0s',
                   animationTimingFunction: 'linear'
                 }}
               />
            </div>
          );
        })}
      </div>
    );
  };


  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      
      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 w-fit mx-auto transition-colors overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('breathe')}
          className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'breathe' 
              ? 'bg-primary text-white shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Wind size={18} />
          Breathe
        </button>
        <button
          onClick={() => setActiveTab('visualize')}
          className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'visualize' 
              ? 'bg-primary text-white shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ImageIcon size={18} />
          Visualize
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden transition-colors">
        
        {activeTab === 'breathe' && (
          <>
            <div className="absolute top-4 left-4 flex justify-between items-start z-20 gap-4">
              <select 
                value={cycleIndex}
                onChange={(e) => {
                  setCycleIndex(Number(e.target.value));
                  setBreathingActive(false);
                }}
                disabled={breathingActive}
                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                {BREATHING_CYCLES.map((cycle, i) => (
                  <option key={cycle.name} value={i}>{cycle.name}</option>
                ))}
              </select>

               {/* Cycle Counter */}
               <div className="bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                  <Wind size={14} className="text-primary" />
                  <span className="font-bold">{completedCycles}</span> cycles
               </div>
            </div>

            <div className="relative flex flex-col items-center z-10">
              <div 
                className={getCircleStyles()}
                style={{
                  transform: `scale(${circleScale})`,
                  transitionDuration: `${transitionDuration}s`
                }}
              >
                {/* Static Glossy Overlay for depth without breaking color interpolation */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

                {/* Visual Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none transform" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="46"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-white/30" 
                  />
                  <circle
                    key={`${phase}-${completedCycles}`} // Key to restart animation
                    cx="50" cy="50" r="46"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-white drop-shadow-md"
                    style={{
                      strokeDasharray: 289,
                      strokeDashoffset: 289,
                      animation: breathingActive && phase !== 'idle' 
                        ? `drawCircle ${progressDuration}s linear forwards` 
                        : 'none'
                    }}
                  />
                </svg>

                <div className="text-center text-slate-800 relative z-20">
                   <p className={`text-2xl font-bold ${phase === 'exhale' || phase === 'hold' || phase === 'inhale' ? 'text-white' : 'text-slate-800'}`}>
                     {instruction}
                   </p>
                </div>
              </div>

              {/* Linear Progress Bar */}
              {renderProgressSegments()}
            </div>

            <button
              onClick={handleToggleBreathing}
              className={`mt-12 px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg ${
                breathingActive 
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600' 
                  : 'bg-primary text-white hover:bg-primary/90 hover:scale-105'
              }`}
            >
              {breathingActive ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start</>}
            </button>
            
            {/* Session History Summary */}
            {sessionHistory.length > 0 && !breathingActive && (
                <div className="mt-8 w-full max-w-md bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 animate-fade-in border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
                            <History size={16} /> Recent Sessions
                        </h4>
                        <button onClick={clearHistory} className="text-slate-400 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {sessionHistory.slice(0, 3).map(session => (
                            <div key={session.id} className="text-xs flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <div>
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{session.cycleName}</span>
                                    <span className="text-slate-400 mx-2">•</span>
                                    <span className="text-slate-500 dark:text-slate-400">{new Date(session.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400"><Clock size={10} /> {session.durationSec}s</span>
                                    <span className="flex items-center gap-1 text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded"><Wind size={10} /> {session.cycles}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </>
        )}

        {activeTab === 'visualize' && (
          <div className="w-full max-w-2xl flex flex-col gap-6 h-full overflow-hidden animate-fade-in">
            {/* Visualization Tab */}
            <div className="flex-none pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe your peaceful place (e.g., 'A quiet forest with a small stream')"
                    className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                  />
                  <button
                    onClick={handleGenerateImage}
                    disabled={imageLoading || !imagePrompt.trim()}
                    className="bg-primary text-white px-6 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {imageLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    Generate
                  </button>
                </div>
                
                {/* Suggestions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setImagePrompt(prompt)}
                      className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1">
                 {/* Main Image Area */}
                <div className="flex-none bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 relative overflow-hidden group min-h-[300px] mb-6">
                  {imageUrl ? (
                    <>
                      <img 
                         src={imageUrl} 
                         alt="Generated visualization" 
                         className={`w-full h-full object-cover animate-fade-in ${imageLoading ? 'opacity-50 blur-sm' : ''}`} 
                      />
                      
                      {imageLoading && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                            <p className="text-white font-medium drop-shadow-md">Refreshing sanctuary...</p>
                         </div>
                      )}

                      {!imageLoading && (
                        <>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button
                               onClick={handleGenerateImage}
                               className="bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 p-2 rounded-lg shadow-lg backdrop-blur-sm hover:text-primary transition-colors"
                               title="Regenerate"
                             >
                               <RefreshCw size={20} />
                             </button>
                             <a 
                               href={imageUrl} 
                               download={`mindease-visualization-${Date.now()}.png`}
                               className="bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 p-2 rounded-lg shadow-lg backdrop-blur-sm hover:text-primary transition-colors"
                               title="Download"
                             >
                               <Maximize2 size={20} />
                             </a>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-slate-400 dark:text-slate-500 p-8">
                      {imageLoading ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="animate-pulse">Creating your sanctuary...</p>
                        </div>
                      ) : (
                        <>
                          <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                          <p>Describe a scene to visualize it here.</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Recent Gallery */}
                {recentImages.length > 0 && (
                    <div className="mb-6 flex-none">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                             <History size={16} /> Recent Visualizations
                        </h4>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                            {recentImages.map((img) => (
                                <div 
                                    key={img.id} 
                                    className="flex-none w-32 flex flex-col gap-2 snap-start cursor-pointer group"
                                    onClick={() => {
                                        setImageUrl(img.url);
                                        setImagePrompt(img.prompt);
                                    }}
                                >
                                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                        <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                                        
                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); startEditing(img); }}
                                                className="text-white hover:text-blue-400 p-1 bg-black/30 rounded-full"
                                                title="Edit Description"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }}
                                                className="text-white hover:text-red-400 p-1 bg-black/30 rounded-full"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Description/Label Area - Below Image */}
                                    <div className="min-h-[20px] px-0.5">
                                        {editingImageId === img.id ? (
                                            <div className="flex w-full items-center gap-1" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded px-1 py-0.5 focus:outline-none border border-primary/50"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveDescription(img.id);
                                                        if (e.key === 'Escape') cancelEditing();
                                                    }}
                                                />
                                                <button onClick={() => saveDescription(img.id)} className="text-green-600 dark:text-green-400"><Check size={12} /></button>
                                                <button onClick={cancelEditing} className="text-red-600 dark:text-red-400"><X size={12} /></button>
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate w-full font-medium" title={img.description || img.prompt}>
                                                {img.description || img.prompt}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Prompt History (Text Only Log) */}
                {promptHistory.length > 0 && (
                  <div className="flex-none pb-4">
                     <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
                            <Clock size={16} /> Prompt History
                        </h4>
                        <button onClick={clearPromptHistory} className="text-slate-400 hover:text-red-400 transition-colors p-1" title="Clear History">
                            <Trash2 size={14} />
                        </button>
                     </div>
                     <div className="space-y-2">
                        {promptHistory.map((item) => (
                           <button 
                             key={item.id}
                             onClick={() => setImagePrompt(item.prompt)}
                             className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700/50 transition-colors text-left group"
                           >
                              <div className="flex flex-col gap-0.5 overflow-hidden">
                                <span className="text-sm text-slate-700 dark:text-slate-200 truncate font-medium">{item.prompt}</span>
                                <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleString()}</span>
                              </div>
                              <div className="text-slate-400 group-hover:text-primary transition-colors">
                                <RotateCcw size={16} />
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Relax;
