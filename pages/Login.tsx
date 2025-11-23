
import React, { useState, useEffect } from 'react';
import { Wind, ArrowRight, Mail, Lock, User as UserIcon, AlertCircle, Loader2, Database, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { User, DBUser } from '../types';
import { database } from '../services/database';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Debug / Database Inspector State
  const [showDebug, setShowDebug] = useState(false);
  const [dbUsers, setDbUsers] = useState<DBUser[]>([]);

  useEffect(() => {
    loadDbUsers();
  }, []);

  const loadDbUsers = () => {
    const stored = localStorage.getItem('mindEase_users_db');
    if (stored) {
      setDbUsers(JSON.parse(stored));
    } else {
      setDbUsers([]);
    }
  };

  const clearDatabase = () => {
    if (window.confirm('Are you sure you want to delete all users? This cannot be undone.')) {
      localStorage.removeItem('mindEase_users_db');
      loadDbUsers();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.email || !formData.password || (isSignUp && !formData.name)) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // --- REGISTER FLOW ---
        const existingUser = await database.findUserByEmail(formData.email);
        if (existingUser) {
          setError('An account with this email already exists.');
          setIsLoading(false);
          return;
        }

        const newUser = await database.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        loadDbUsers(); // Update debug view
        onLogin(newUser);

      } else {
        // --- LOGIN FLOW ---
        const user = await database.loginUser(formData.email, formData.password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300 gap-8 overflow-y-auto">
      
      {/* Main Login Card */}
      <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors flex-shrink-0">
        
        {/* Header */}
        <div className="bg-primary/5 dark:bg-primary/10 p-8 text-center border-b border-primary/10 dark:border-primary/20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-700 text-primary shadow-sm mb-4 transition-colors">
            <Wind size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {isSignUp ? 'Start your wellness journey today.' : 'Sign in to continue your journey.'}
          </p>
        </div>
        
        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-900/30 animate-fade-in">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {isSignUp && (
              <div className="relative group">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-400 disabled:opacity-50"
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                disabled={isLoading}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-400 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  {isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setFormData({ name: '', email: '', password: '' });
                    setShowPassword(false);
                }}
                disabled={isLoading}
                className="text-primary font-semibold hover:underline disabled:opacity-50"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 text-center border-t border-slate-100 dark:border-slate-700 transition-colors">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Secure Database Connection • Encrypted Storage
          </p>
        </div>
      </div>

      {/* Database Inspector (Debug View) */}
      <div className="w-full max-w-md">
        <button 
          onClick={() => { setShowDebug(!showDebug); loadDbUsers(); }}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors mb-2"
        >
          <Database size={12} />
          {showDebug ? 'Hide Database Inspector' : 'Show Database Inspector'}
        </button>

        {showDebug && (
          <div className="bg-slate-900 text-slate-300 rounded-xl border border-slate-700 overflow-hidden shadow-2xl animate-fade-in text-xs font-mono">
             <div className="flex items-center justify-between p-3 bg-slate-950 border-b border-slate-800">
               <div className="flex items-center gap-2 font-bold text-slate-100">
                 <Database size={14} className="text-primary" />
                 <span>Local Database (Simulation)</span>
               </div>
               <div className="flex gap-2">
                 <button onClick={loadDbUsers} className="p-1 hover:bg-slate-800 rounded text-blue-400 hover:text-blue-300" title="Refresh">
                   <RefreshCw size={14} />
                 </button>
                 <button onClick={clearDatabase} className="p-1 hover:bg-slate-800 rounded text-red-400 hover:text-red-300" title="Clear DB">
                   <Trash2 size={14} />
                 </button>
               </div>
             </div>
             
             <div className="p-0 overflow-x-auto">
               {dbUsers.length === 0 ? (
                 <div className="p-6 text-center text-slate-500 italic">
                   Database is empty. Sign up to add users.
                 </div>
               ) : (
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-800/50 text-slate-400">
                       <th className="p-3 font-medium border-b border-slate-800">Name</th>
                       <th className="p-3 font-medium border-b border-slate-800">Email</th>
                       <th className="p-3 font-medium border-b border-slate-800">Password</th>
                     </tr>
                   </thead>
                   <tbody>
                     {dbUsers.map((user) => (
                       <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                         <td className="p-3 truncate max-w-[100px]">{user.name}</td>
                         <td className="p-3 text-cyan-400">{user.email}</td>
                         <td className="p-3 text-emerald-400">{user.password}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
             </div>
             <div className="p-2 bg-slate-950/50 text-[10px] text-slate-500 text-center border-t border-slate-800">
               ⚠️ For demo purposes only. Passwords stored in plain text.
             </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Login;
