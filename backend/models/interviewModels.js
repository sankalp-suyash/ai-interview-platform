import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['coding', 'behavioral'],
    required: true
  },
  status: {
    type: String,
    enum: ['started', 'completed', 'evaluated'],
    default: 'started'
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required : true
  },
  score: Number,
  feedback: Object,
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  duration: Number // in seconds
}, {
  timestamps: true
});

// Index for efficient weekly queries
interviewSchema.index({ userId: 1, type: 1, createdAt: 1 });

export default mongoose.model('Interview', interviewSchema);