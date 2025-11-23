export const APP_NAME = "MindEase";

export const SYSTEM_INSTRUCTION_CHAT = `You are MindEase, a compassionate, empathetic, and professional mental wellness AI companion. 
Your goal is to support the user through active listening, providing comforting words, and offering gentle, non-medical advice for stress management and emotional regulation.
Always validate the user's feelings. Use a calm and warm tone.
If the user expresses thoughts of self-harm or severe crisis, gently encourage them to seek professional help immediately and provide general emergency resources.
Keep responses concise but meaningful.`;

export const MOOD_emojis = [
  { score: 2, emoji: '😫', label: 'Awful' },
  { score: 4, emoji: '😔', label: 'Bad' },
  { score: 6, emoji: '😐', label: 'Okay' },
  { score: 8, emoji: '🙂', label: 'Good' },
  { score: 10, emoji: '🤩', label: 'Great' },
];

export const BREATHING_CYCLES = [
  { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, pause: 4 },
  { name: '4-7-8 Relax', inhale: 4, hold: 7, exhale: 8, pause: 0 },
];
