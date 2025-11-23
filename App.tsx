
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Journal from './pages/Journal';
import Relax from './pages/Relax';
import Login from './pages/Login';
import { MoodEntry, User } from './types';

const App: React.FC = () => {
  // Authentication State
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('mindEase_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Global state for mood tracking
  // Initialize as empty, populate via useEffect when user is confirmed
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('mindEase_theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });

  // --- DATA LOADING EFFECT ---
  // When user changes (logs in), load their specific data
  useEffect(() => {
    if (user && user.email) {
      const userKey = `mindEase_moods_${user.email}`;
      const savedMoods = localStorage.getItem(userKey);
      if (savedMoods) {
        setMoodHistory(JSON.parse(savedMoods));
      } else {
        setMoodHistory([]); // New user or empty data
      }
    } else {
      setMoodHistory([]); // Clear data on logout
    }
  }, [user]);

  // --- DATA SAVING EFFECT ---
  // When moodHistory changes, save to the specific user's key
  useEffect(() => {
    if (user && user.email) {
      const userKey = `mindEase_moods_${user.email}`;
      localStorage.setItem(userKey, JSON.stringify(moodHistory));
    }
  }, [moodHistory, user]);

  useEffect(() => {
    localStorage.setItem('mindEase_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addMood = (score: number, note?: string) => {
    if (!user) return;
    
    const newEntry: MoodEntry = {
      date: new Date().toISOString(),
      score,
      note
    };
    setMoodHistory(prev => [...prev, newEntry]);
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('mindEase_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    setMoodHistory([]); // Clear sensitive data from state immediately
    localStorage.removeItem('mindEase_user');
  };

  const handleUpdateProfile = (updatedName: string) => {
    if (user) {
      const updatedUser = { ...user, name: updatedName };
      setUser(updatedUser);
      localStorage.setItem('mindEase_user', JSON.stringify(updatedUser));
      // In a real app, you would also update the DB record here
      
      // Update local DB for consistency
      const storedDb = localStorage.getItem('mindEase_users_db');
      if (storedDb) {
        const users = JSON.parse(storedDb);
        const newUsers = users.map((u: any) => 
          u.email === user.email ? { ...u, name: updatedName } : u
        );
        localStorage.setItem('mindEase_users_db', JSON.stringify(newUsers));
      }
    }
  };

  return (
    <HashRouter>
      <Routes>
        {/* Public Route: Login */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} 
        />

        {/* Protected Routes */}
        <Route element={user ? <Layout user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} onUpdateProfile={handleUpdateProfile}><div /></Layout> : <Navigate to="/login" replace />}>
        </Route>

        <Route
          path="*"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} onUpdateProfile={handleUpdateProfile}>
                <Routes>
                  <Route path="/" element={<Home moodHistory={moodHistory} addMood={addMood} user={user} />} />
                  <Route path="/chat" element={<Chat user={user} />} />
                  <Route path="/journal" element={<Journal addMood={addMood} user={user} />} />
                  <Route path="/relax" element={<Relax user={user} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
