import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  image: [String],
  question: { type: String, required: true },
  options: [
    {
      id: Number,
      text: String,
    },
  ],
  correct_option_id: Number,
  explanation: String,
});

export default mongoose.model('Question', questionSchema, 'questions');
