
import React, { useState, useRef, useEffect } from 'react';
import { createChatSession } from '../services/geminiService';
import { Message, LoadingState, User } from '../types';
import { Send, User as UserIcon, Bot, Loader2, Trash2 } from 'lucide-react';
import { GenerateContentResponse, Content } from '@google/genai';

interface ChatProps {
  user: User | null;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  const defaultMessage: Message = { 
    id: 'init', 
    role: 'model', 
    text: "Hello. I'm MindEase. I'm here to listen without judgment. How are you feeling today?", 
    timestamp: Date.now() 
  };

  // --- Load Chat History ---
  useEffect(() => {
    if (user && user.email) {
      const key = `mindEase_chat_${user.email}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([defaultMessage]);
      }
    } else {
      setMessages([defaultMessage]);
    }
  }, [user]);

  // --- Save Chat History ---
  useEffect(() => {
    if (user && user.email && messages.length > 0) {
      const key = `mindEase_chat_${user.email}`;
      localStorage.setItem(key, JSON.stringify(messages));
    }
  }, [messages, user]);

  // --- Initialize Gemini Session with History ---
  useEffect(() => {
    // We only initialize the session once the messages (history) have been loaded.
    // If messages is empty (initial render before effect), wait.
    if (!chatSessionRef.current && messages.length > 0) {
      
      // Convert stored messages to Gemini Content format
      // Note: 'init' messages or messages with empty text should be careful
      const history: Content[] = messages
        .filter(m => m.text.trim() !== '') // Gemini doesn't like empty messages
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      chatSessionRef.current = createChatSession(history);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear your chat history?")) {
      setMessages([defaultMessage]);
      if (user?.email) {
        localStorage.removeItem(`mindEase_chat_${user.email}`);
      }
      // Re-initialize session
      chatSessionRef.current = createChatSession();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || status === LoadingState.LOADING) return;

    // Ensure session is created if somehow it wasn't
    if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession();
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setStatus(LoadingState.LOADING);

    try {
      const result = await chatSessionRef.current.sendMessageStream({
        message: userMsg.text
      });

      let fullText = '';
      const botMsgId = (Date.now() + 1).toString();
      
      // Add placeholder bot message
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullText += text;
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { ...msg, text: fullText } : msg
        ));
      }
      setStatus(LoadingState.IDLE);

    } catch (error) {
      console.error("Chat error:", error);
      setStatus(LoadingState.ERROR);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">MindEase Companion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
            </p>
          </div>
        </div>
        <button 
          onClick={handleClearChat}
          className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Clear Chat History"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-primary text-white'
              }`}>
                {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-slate-800 dark:bg-slate-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-200 rounded-tl-none'
              }`}>
                {msg.text || <span className="flex gap-1 items-center h-5"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span></span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your feelings..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            disabled={status === LoadingState.LOADING}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || status === LoadingState.LOADING}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === LoadingState.LOADING ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
