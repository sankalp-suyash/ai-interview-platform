import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const generateQuestion = async (difficulty = "Medium", topic = "Arrays") => {
  try {
    const prompt = `
      You are an expert technical interviewer. Generate a unique coding interview question.
      
      Constraints:
      1. Difficulty: ${difficulty}
      2. Topic: ${topic}
      3. Language: JavaScript
      
      Return ONLY a raw JSON object (no markdown formatting, no backticks) with this exact schema:
      {
        "title": "Problem Title",
        "description": "Clear problem statement...",
        "type": "coding",
        "difficulty": "${difficulty}",
        "category": "${topic}",
        "examples": [
          { "input": "example input", "output": "example output", "explanation": "why this output" }
        ],
        "starterCode": "function name(args) { \\n // Write your code here \\n}",
        "testCases": [
          { "input": "arg1, arg2", "output": "expected_result" }
        ],
        "hints": ["hint 1", "hint 2"],
        "solution": "Full working solution code"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown if Gemini adds it (e.g. ```json ... ```)
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return null;
  }
};