import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import question from "./models/questionModels.js";
import authRoutes from "./routes/auth.js";
import interviewRoutes from "./routes/interviews.js";
import questionRoutes from "./routes/questions.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

// middleware
app.use(cors());

// database called
connectDB();

app.use(express.json());

// auth routes 
app.use("/api/auth",authRoutes);

// interwiew routes
app.use('/api/interviews', interviewRoutes);

// question routes
app.use('/api/questions', questionRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Hello, Api is running",
  });
});


app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
