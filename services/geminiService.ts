import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize only if key exists (handled in UI via warning if missing)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const askGeminiTutor = async (
  context: string,
  question: string
): Promise<string> => {
  if (!ai) {
    return "API Key not configured. Please check your environment settings.";
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are an expert financial tutor specializing in Basis Trading (Cash-and-Carry Arbitrage).
      The user is currently viewing the following context on the website "TenorArb":
      "${context}"

      The user asks: "${question}"

      Please provide a concise, encouraging, and accurate answer in Chinese (Simplified).
      Use Markdown formatting for clarity.
      If the user is confused about math, provide a simple calculation example.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "抱歉，我现在无法回答这个问题，请稍后再试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 响应暂时不可用。";
  }
};

export const analyzeSimulation = async (
  history: any[]
): Promise<string> => {
  if (!ai) return "API Key missing.";

  try {
    const model = "gemini-2.5-flash";
    const historyStr = JSON.stringify(history.slice(-5)); // Last 5 data points
    const prompt = `
      Analyze this arbitrage simulation history (Price convergence data):
      ${historyStr}

      Explain simply in Chinese why the profit is changing (or not) based on the convergence of Spot and Futures prices.
      Keep it short (under 100 words).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "无法分析当前数据。";
  } catch (error) {
    return "分析服务暂时不可用。";
  }
};
