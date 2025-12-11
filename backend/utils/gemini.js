import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export const generateQuestion = async (difficulty = "Medium", topic = "Arrays") => {
  try {
    const prompt = `
      You are an expert technical interviewer. Generate a unique coding interview question.
      
      Constraints:
      1. Difficulty: ${difficulty}
      2. Topic: ${topic}
      3. Language: JavaScript
      
      Return ONLY a raw JSON object with this exact schema:
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

    // Cleaning Logic
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstOpen = cleanText.indexOf('{');
    const lastClose = cleanText.lastIndexOf('}');
    
    if (firstOpen !== -1 && lastClose !== -1) {
        cleanText = cleanText.substring(firstOpen, lastClose + 1);
    }

    if (!cleanText) throw new Error("Empty response");

    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Gemini Generation Error:", error.message);
    
    // FALLBACK QUESTION: If AI fails, return this instead of crashing!
    return {
      title: "Maximum Subarray (Backup)",
      description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
      type: "coding",
      difficulty: "Medium",
      category: "Arrays",
      examples: [
        { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." }
      ],
      starterCode: "function maxSubArray(nums) {\n  // Write your code here\n}",
      testCases: [
        { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: 6 },
        { input: "[1]", output: 1 },
        { input: "[5,4,-1,7,8]", output: 23 }
      ],
      hints: ["Kadane's Algorithm is useful here."],
      solution: "function maxSubArray(nums) {\n  let maxSoFar = nums[0];\n  let maxEndingHere = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);\n    maxSoFar = Math.max(maxSoFar, maxEndingHere);\n  }\n  return maxSoFar;\n}"
    };
  }
};