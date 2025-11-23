
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MoodEntry {
  date: string;
  score: number; // 1-10
  note?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  analysis?: JournalAnalysis;
}

export interface JournalAnalysis {
  sentimentScore: number;
  emotions: string[];
  advice: string;
}

export interface User {
  name: string;
  email: string;
}

// Internal type for Database storage (includes password)
export interface DBUser extends User {
  id: string;
  password: string; // In a real app, this would be hashed
  createdAt: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
