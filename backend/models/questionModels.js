import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['coding', 'behavioral'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  language: {
    type: String,
    default: 'javascript'
  },
  category: {
    type: String,
    default: 'general'
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  starterCode: {
    type: String,
    default: ''
  },
  testCases: [{
    input: String,
    output: String
  }],
  hints: [String],
  solution: String
}, {
  timestamps: true
});

export default mongoose.model('Question', questionSchema);