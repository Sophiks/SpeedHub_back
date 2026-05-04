import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    subscriptionType: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    subscriptionExpires: { type: Date, default: null },
    statistics: {
      unitsPassed: [
        {
          unitId: { type: String, required: true },
          correctAnswers: { type: Number, default: 0 },
          incorrectAnswers: { type: Number, default: 0 },
          totalQuestions: { type: Number, required: true },
          timeSpent: { type: Number, default: 0 }, // в секундах
          isPassed: { type: Boolean, default: false },
          mistakes: [{ type: String }],
          date: { type: Date, default: Date.now },
        },
      ],
      randomTests: [
        {
          score: { type: Number, default: 0 },
          total: { type: Number, default: 20 },
          incorrectAnswers: { type: Number, default: 0 },
          timeSpent: { type: Number, default: 0 },
          mistakes: [{ type: String }],
          date: { type: Date, default: Date.now },
        },
      ],
    },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
