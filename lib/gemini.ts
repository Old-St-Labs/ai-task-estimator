/**
 * lib/gemini.ts
 *
 * Singleton Gemini client.
 * All AI calls in Route Handlers go through this module — never instantiate
 * GoogleGenerativeAI directly elsewhere.
 *
 * Usage:
 *   import { getJsonModel } from "@/lib/gemini";
 *   const model  = getJsonModel();
 *   const result = await model.generateContent(prompt);
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set. Add it to .env.local.");
}

export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Returns a model instance configured for structured JSON output.
 * Temperature 0.2 keeps output deterministic for structured data.
 * Swap modelName to "gemini-1.5-pro" for higher quality at higher cost.
 */
export function getJsonModel(modelName = "gemini-3-flash-preview") {
  return gemini.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  });
}
