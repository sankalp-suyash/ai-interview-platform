import express from "express";
import Interview from "../models/interviewModels.js";
import { protect } from "../middleware/auth.js"; // You'll need auth middleware

const router = express.Router();

// Get user's weekly interview usage
router.get("/usage", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get start of current week (Monday)
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

    // Count interviews this week
    const interviews = await Interview.find({
      userId,
      createdAt: { $gte: startOfWeek },
    });

    const codingCount = interviews.filter((i) => i.type === "coding").length;
    const behavioralCount = interviews.filter(
      (i) => i.type === "behavioral"
    ).length;

    res.json({
      success: true,
      data: {
        coding: { used: codingCount, total: 2 },
        behavioral: { used: behavioralCount, total: 2 },
        totalUsed: interviews.length,
        weekStart: startOfWeek,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching interview usage",
    });
  }
});


// Track when user starts an interview
router.post("/track", protect, async (req, res) => {
  try {
    console.log('req received', req.body);
    console.log('user ID ',req.user?.id);
    
    const { type, questionId } = req.body;
    const userId = req.user.id;

    // Check weekly limit
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

    const weeklyInterviews = await Interview.countDocuments({
      userId,
      type,
      createdAt: { $gte: startOfWeek },
    });

    if (weeklyInterviews >= 2) {
      return res.status(400).json({
        success: false,
        message: `Weekly ${type} interview limit reached (2 per week)`,
      });
    }

    // Create interview record
    const interview = await Interview.create({
      userId,
      type,
      questionId,
      status: "started",
    });

    res.status(201).json({
      success: true,
      message: "Interview started",
      data: interview,
    });
  } catch (error) {
    console.error('error' , error);
    res.status(500).json({
      success: false,
      message: "Error starting interview",
    });
  }
});

// Update interview completion
router.put("/:id/complete", protect, async (req, res) => {
  try {
    const { score, feedback, duration } = req.body;

    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        status: "completed",
        completedAt: new Date(),
        score,
        feedback,
        duration,
      },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.json({
      success: true,
      message: "Interview completed",
      data: interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error completing interview",
    });
  }
});



export default router;