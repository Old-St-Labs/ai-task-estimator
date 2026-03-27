/**
 * lib/gemini.ts
 *
 * Singleton Gemini client.
 * All AI calls in Route Handlers go through this module — never instantiate
 * GoogleGenerativeAI directly elsewhere.
 *
 * Usage:
 *   import { gemini } from "@/lib/gemini";
 *   const result = await gemini.generateContent(prompt);
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set. Add it to .env.local.");
}

const client = new GoogleGenerativeAI(apiKey);

/**
 * Pre-configured model instance.
 * gemini-2.0-flash is fast and inexpensive — swap to gemini-2.0-pro for
 * higher quality at higher cost.
 */
export const gemini = client.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    // Force JSON output so route handlers can reliably JSON.parse() the response.
    responseMimeType: "application/json",
    temperature: 0.3,
  },
});
