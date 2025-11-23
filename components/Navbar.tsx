
import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageCircleHeart, BookHeart, Wind, LogOut, Settings, X, Download, AlertTriangle, User as UserIcon, Save } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onUpdateProfile?: (name: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onUpdateProfile }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profile' | 'data' | 'help'>('profile');
  const [newName, setNewName] = useState(user?.name || '');
  
  const navItems = [
    { to: '/', icon: <Home size={24} />, label: 'Home' },
    { to: '/chat', icon: <MessageCircleHeart size={24} />, label: 'Chat' },
    { to: '/journal', icon: <BookHeart size={24} />, label: 'Journal' },
    { to: '/relax', icon: <Wind size={24} />, label: 'Relax' },
  ];

  const handleExportData = () => {
    if (!user) return;
    
    const data = {
      user: user,
      moods: JSON.parse(localStorage.getItem(`mindEase_moods_${user.email}`) || '[]'),
      journal: JSON.parse(localStorage.getItem(`mindEase_journal_${user.email}`) || '[]'),
      chat: JSON.parse(localStorage.getItem(`mindEase_chat_${user.email}`) || '[]'),
      breathingHistory: JSON.parse(localStorage.getItem(`mindEase_breathing_history_${user.email}`) || '[]'),
      visualizations: JSON.parse(localStorage.getItem(`mindEase_recent_visualizations_${user.email}`) || '[]'),
      prompts: JSON.parse(localStorage.getItem(`mindEase_prompt_history_${user.email}`) || '[]'),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindease-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile && newName.trim()) {
      onUpdateProfile(newName.trim());
      alert('Profile updated successfully.');
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen p-6 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Wind className="text-primary" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">MindEase</h1>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* User Profile & Logout */}
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4 px-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsSettingsOpen(true)}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-lg shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate" title={user?.email}>{user?.email}</p>
            </div>
            <Settings size={16} className="ml-auto text-slate-400" />
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2 z-50 pb-safe transition-colors duration-300">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'
                }`
              }
            >
              {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
          <button
             onClick={() => setIsSettingsOpen(true)}
             className="flex flex-col items-center gap-1 p-2 rounded-lg text-slate-400 dark:text-slate-500 active:text-primary"
          >
             <Settings size={24} />
             <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Settings size={20} className="text-primary" /> Settings
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                <X size={24} />
              </button>
            </div>

            <div className="flex border-b border-slate-100 dark:border-slate-700">
              <button 
                onClick={() => setActiveSettingsTab('profile')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeSettingsTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Profile
              </button>
              <button 
                onClick={() => setActiveSettingsTab('data')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeSettingsTab === 'data' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Data
              </button>
              <button 
                onClick={() => setActiveSettingsTab('help')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeSettingsTab === 'help' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-500 dark:text-slate-400 hover:text-red-500'}`}
              >
                Crisis Support
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {activeSettingsTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-2xl">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{user?.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                      <div className="relative">
                         <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                         <input 
                           type="text" 
                           value={newName} 
                           onChange={(e) => setNewName(e.target.value)}
                           className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-slate-100" 
                         />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                       <Save size={18} /> Update Profile
                    </button>
                  </form>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                     <button onClick={onLogout} className="w-full py-2.5 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                        Sign Out
                     </button>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'data' && (
                <div className="space-y-4 text-center">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-blue-700 dark:text-blue-300 text-sm mb-4">
                    Download a copy of your MindEase data, including all journals, mood logs, and visualization history.
                  </div>
                  
                  <button 
                    onClick={handleExportData}
                    className="w-full bg-slate-800 dark:bg-slate-700 text-white py-4 rounded-xl font-medium hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-3"
                  >
                    <Download size={24} /> Export My Data (JSON)
                  </button>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                    Data is stored locally in your browser. Clearing your browser data will remove your MindEase history unless exported.
                  </p>
                </div>
              )}

              {activeSettingsTab === 'help' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-900/50">
                    <AlertTriangle size={24} className="flex-shrink-0" />
                    <div>
                       <h4 className="font-bold text-sm">Emergency Support</h4>
                       <p className="text-xs mt-1">If you are in immediate danger, please call emergency services (911 in US) or go to the nearest emergency room.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Helplines</h4>
                    <a href="tel:988" className="block p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                       <div className="font-bold text-primary">988 (USA)</div>
                       <div className="text-xs text-slate-500 dark:text-slate-400">Suicide & Crisis Lifeline</div>
                    </a>
                    <a href="tel:116123" className="block p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                       <div className="font-bold text-primary">116 123 (UK)</div>
                       <div className="text-xs text-slate-500 dark:text-slate-400">Samaritans</div>
                    </a>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                       <div className="font-bold text-slate-700 dark:text-slate-200">Text "HOME" to 741741</div>
                       <div className="text-xs text-slate-500 dark:text-slate-400">Crisis Text Line</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
