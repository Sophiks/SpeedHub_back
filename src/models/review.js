import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    text: { type: String, required: true },
    photo: { type: String, default: null },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('Review', reviewSchema);
