import { GoogleGenAI } from "@google/genai";
import { Habit } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getHabitInsights = async (habits: Habit[]): Promise<string> => {
  const ai = getClient();
  if (!ai) return "يرجى تكوين مفتاح API للحصول على رؤى.";

  const habitsSummary = habits.map(h => {
    const total = h.completedDates.length;
    const lastCompleted = h.completedDates.sort().pop() || "Never";
    return `- ${h.name}: Completed ${total} times. Last active: ${lastCompleted}`;
  }).join("\n");

  const prompt = `
    You are a wise and encouraging habit coach. 
    Analyze the following user habits and provide a short, motivating insight (max 2 sentences) in English (or Arabic if the habit names seem Arabic).
    Focus on consistency and streaks.
    
    User Habits:
    ${habitsSummary}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Keep going! You are doing great.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate insights at this moment.";
  }
};