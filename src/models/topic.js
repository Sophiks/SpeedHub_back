import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  number: { type: Number, required: true },
});

export default mongoose.model('Topic', TopicSchema);
