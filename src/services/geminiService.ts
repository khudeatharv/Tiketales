import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getMovieRecommendation = async (genre: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 3 popular movies in the ${genre} genre. Provide a brief 1-sentence description for each.`,
  });
  return response.text;
};
