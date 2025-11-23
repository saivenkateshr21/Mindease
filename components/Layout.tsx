
import React from 'react';
import Navbar from './Navbar';
import { User } from '../types';
import { Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onUpdateProfile?: (name: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, theme, toggleTheme, onUpdateProfile }) => {
  return (
    <div className="min-h-screen bg-background dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      <Navbar user={user} onLogout={onLogout} onUpdateProfile={onUpdateProfile} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pb-20 md:pb-8 relative">
        <div className="max-w-4xl mx-auto w-full h-full relative">
           {/* Theme Toggle - Absolute Position Top Right of Main Content */}
           <button 
             onClick={toggleTheme}
             className="absolute top-0 right-0 z-50 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-md border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
             aria-label="Toggle Theme"
           >
             {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
           </button>
          
          <div className="pt-2"> {/* Add top padding to account for the absolute button on mobile if needed, though putting it in corner is usually fine */}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
