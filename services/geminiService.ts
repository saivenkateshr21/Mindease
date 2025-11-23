import { GoogleGenAI, Type, Schema, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION_CHAT } from "../constants";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text Generation ---

export const generateDailyQuote = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Generate a short, uplifting, and unique daily affirmation or mindfulness quote. Do not use quotes from famous people, generate a new one. Return only the quote text.',
    });
    return response.text || "Breathe in peace, breathe out tension.";
  } catch (error) {
    console.error("Error generating quote:", error);
    return "Every day is a fresh start.";
  }
};

export const generateJournalPrompt = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Generate a single, thoughtful journaling prompt to help someone reflect on their day, gratitude, or emotions. Keep it open-ended and gentle.',
    });
    return response.text || "What is one thing that made you smile today?";
  } catch (error) {
    console.error("Error generating prompt:", error);
    return "Write about how you are feeling right now.";
  }
};

// --- Structured Data Generation ---

export const analyzeJournalEntry = async (text: string) => {
  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        sentimentScore: { type: Type.NUMBER, description: "A number between 1 (very negative) and 10 (very positive)" },
        emotions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-5 primary emotions detected" },
        advice: { type: Type.STRING, description: "A short, 1-2 sentence supportive comment or advice based on the entry." }
      },
      required: ["sentimentScore", "emotions", "advice"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this journal entry: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error analyzing journal:", error);
    return null;
  }
};

// --- Chat ---

export const createChatSession = (history?: Content[]) => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_CHAT,
    }
  });
};

// --- Image Generation ---

export const generateCalmingImage = async (description: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Create a soft, pastel-colored, calming, and artistic image of: ${description}. Minimalist style, high quality, serene atmosphere.` }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};