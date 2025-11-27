import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModels.js";

const router = express.Router();

// register
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists.",
        success: false,
      });
    }
    // create user
    const user = await User.create({ name, email, password });
    // generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({
      success: true,
      message: "User created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot register user.",
    });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // check if  user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    // comaparing passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }
    // generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      success: true,
      message: " Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Cannot login user.",
    });
  }
});



export default router;
