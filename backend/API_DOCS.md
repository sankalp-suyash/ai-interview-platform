# AI Interview Platform - API Documentation

**Base URL:** `http://localhost:5000`

---

## Authentication

All protected endpoints require a JWT token in the Authorization header.

```
Authorization: Bearer <token>
```

---

# 1. Authentication API (`/api/auth`)

## 1.1 Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "user_id_123",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 1.2 Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "user_id_123",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "plan": "free"
  }
}
```

---

## 1.3 Get Current User
**GET** `/api/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id_123",
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "free",
    "weeklyInterviews": 2
  }
}
```

---

# 2. Questions API (`/api/questions`)

## 2.1 Generate Question (AI)
**POST** `/api/questions/generate`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "difficulty": "Medium",
  "topic": "Arrays"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "question_id_123",
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target...",
    "difficulty": "Medium",
    "topic": "Arrays",
    "starterCode": "function solution(nums, target) { ... }",
    "testCases": [
      {
        "input": "[2,7,11,15], 9",
        "output": "[0,1]"
      },
      {
        "input": "[3,2,4], 6",
        "output": "[1,2]"
      }
    ],
    "examples": [
      {
        "input": "[2,7,11,15], 9",
        "output": "[0,1]",
        "explanation": "2 + 7 = 9"
      }
    ],
    "hints": [
      "Use a hash map to store seen values",
      "Two-pass approach works well"
    ]
  }
}
```

---

## 2.2 Get All Questions
**GET** `/api/questions?difficulty=Medium&topic=Arrays&page=1&limit=10`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "question_id_123",
      "title": "Two Sum",
      "difficulty": "Medium",
      "topic": "Arrays"
    },
    {
      "_id": "question_id_124",
      "title": "Maximum Subarray",
      "difficulty": "Medium",
      "topic": "Arrays"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

## 2.3 Get Question by ID
**GET** `/api/questions/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "question_id_123",
    "title": "Two Sum",
    "description": "...",
    "difficulty": "Medium",
    "topic": "Arrays",
    "starterCode": "...",
    "testCases": [ ... ],
    "examples": [ ... ],
    "hints": [ ... ]
  }
}
```

---

# 3. Interviews API (`/api/interviews`)

## 3.1 Track Interview Start
**POST** `/api/interviews/track`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "coding",
  "questionId": "question_id_123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "interview_id_456",
    "userId": "user_id_123",
    "questionId": "question_id_123",
    "type": "coding",
    "startedAt": "2024-01-15T10:30:00Z",
    "status": "in-progress"
  }
}
```

---

## 3.2 Complete Interview / Submit Solution
**PUT** `/api/interviews/:id/complete`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "score": 85,
  "feedback": {
    "correctness": "You passed 5 out of 5 test cases.",
    "efficiency": "O(n) time, O(n) space",
    "codeQuality": "Clean and well-structured code.",
    "suggestions": ["Consider edge cases"]
  },
  "duration": 1200,
  "codeSubmitted": "function solution(nums, target) { ... }"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Interview completed successfully",
  "data": {
    "_id": "interview_id_456",
    "score": 85,
    "status": "completed",
    "completedAt": "2024-01-15T10:50:00Z"
  }
}
```

---

## 3.3 Get User Interview History
**GET** `/api/interviews?status=completed&page=1&limit=10`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "interview_id_456",
      "questionId": "question_id_123",
      "questionTitle": "Two Sum",
      "score": 85,
      "status": "completed",
      "completedAt": "2024-01-15T10:50:00Z",
      "duration": 1200
    },
    {
      "_id": "interview_id_457",
      "questionId": "question_id_124",
      "questionTitle": "Maximum Subarray",
      "score": 92,
      "status": "completed",
      "completedAt": "2024-01-16T11:20:00Z",
      "duration": 900
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

---

## 3.4 Get Interview Details
**GET** `/api/interviews/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "interview_id_456",
    "userId": "user_id_123",
    "questionId": "question_id_123",
    "questionTitle": "Two Sum",
    "score": 85,
    "feedback": { ... },
    "codeSubmitted": "function solution(nums, target) { ... }",
    "duration": 1200,
    "startedAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:50:00Z",
    "status": "completed"
  }
}
```

---

# 4. User Profile API (`/api/users`)

## 4.1 Update User Profile
**PUT** `/api/users/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "Software Developer | DSA Enthusiast"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id_123",
    "name": "John Doe Updated",
    "email": "john@example.com",
    "bio": "Software Developer | DSA Enthusiast",
    "plan": "free"
  }
}
```

---

## 4.2 Get User Stats
**GET** `/api/users/:id/stats`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalInterviews": 15,
    "completedInterviews": 15,
    "averageScore": 82.5,
    "bestScore": 100,
    "worstScore": 65,
    "topicsAttempted": ["Arrays", "Strings", "LinkedLists", "Trees"],
    "difficultiesAttempted": ["Easy", "Medium", "Hard"],
    "weeklyInterviewsUsed": 2,
    "weeklyInterviewsLimit": 2
  }
}
```

---

# 5. Error Responses

## Common Error Codes

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid input or weekly interview limit reached"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized. Please login."
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 429 - Too Many Requests / Rate Limit
```json
{
  "success": false,
  "message": "Service rate limit reached. Please try again later."
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error. Please try again later."
}
```

---

# Environment Variables

Create a `.env` file in the backend directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-interview-platform
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

---

# Testing with cURL

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Generate a Question
```bash
curl -X POST http://localhost:5000/api/questions/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "difficulty": "Medium",
    "topic": "Arrays"
  }'
```

### Get Interview History
```bash
curl -X GET "http://localhost:5000/api/interviews?status=completed" \
  -H "Authorization: Bearer <token>"
```

---

**Last Updated:** January 2024
**Version:** 1.0
