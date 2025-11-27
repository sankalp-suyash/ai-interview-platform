import express from "express";
import Question from "../models/questionModels.js";

const router = express.Router();

// Get all questions
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching questions",
    });
  }
});

// Get coding questions only
router.get("/coding", async (req, res) => {
  try {
    const questions = await Question.find({ type: "coding" });
    res.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching coding questions",
    });
  }
});

// Get behavioral questions only
router.get("/behavioral", async (req, res) => {
  try {
    const questions = await Question.find({ type: "behavioral" });
    res.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching behavioral questions",
    });
  }
});

// Add enhanced sample questions to database
router.get("/populate", async (req, res) => {
  try {
    const sampleQuestions = [
      {
        title: "Two Sum",
        description:
          "Given an array of integers and a target number, return indices of the two numbers that add up to the target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        type: "coding",
        difficulty: "Easy",
        language: "javascript",
        category: "Arrays",
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
          },
          {
            input: "nums = [3,2,4], target = 6",
            output: "[1,2]",
            explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
          },
        ],
        starterCode: `function twoSum(nums, target) {
    // Your code here
    // Return indices of two numbers that add up to target
}`,
        hints: [
          "Use a hash map to store numbers and their indices",
          "Check if complement (target - current) exists in the map",
        ],
        solution: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
      },
      {
        title: "Reverse String",
        description:
          "Write a function that reverses a string without using built-in reverse methods. The input string is given as an array of characters. You must do this by modifying the input array in-place with O(1) extra memory.",
        type: "coding",
        difficulty: "Easy",
        language: "javascript",
        category: "Strings",
        examples: [
          {
            input: 's = ["h","e","l","l","o"]',
            output: '["o","l","l","e","h"]',
            explanation: 'The string "hello" reversed becomes "olleh".',
          },
          {
            input: 's = ["H","a","n","n","a","h"]',
            output: '["h","a","n","n","a","H"]',
            explanation: 'The string "Hannah" reversed becomes "hannaH".',
          },
        ],
        starterCode: `function reverseString(s) {
    // Your code here
    // Reverse the string in-place
}`,
        hints: [
          "Use two pointers approach",
          "Swap characters from start and end moving towards center",
        ],
        solution: `function reverseString(s) {
    let left = 0;
    let right = s.length - 1;
    while (left < right) {
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
    return s;
}`,
      },
      {
        title: "Tell me about yourself",
        description: "Walk me through your resume and background.",
        type: "behavioral",
        difficulty: "Easy",
        category: "Introduction",
      },
      {
        title: "Describe a challenging project",
        description:
          "Tell me about a technically challenging project you worked on and how you overcame the obstacles.",
        type: "behavioral",
        difficulty: "Medium",
        category: "Experience",
      },
    ];

    // Clear existing questions and add new ones
    await Question.deleteMany({});
    const questions = await Question.create(sampleQuestions);

    res.json({
      success: true,
      message: "Sample questions added to database",
      data: questions,
    });
  } catch (error) {
    console.error("Error populating questions:", error);
    res.status(500).json({
      success: false,
      message: "Error adding questions to database",
    });
  }
});

export default router;
