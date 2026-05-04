import Review from '../models/review.js';
import User from '../models/user.js';
import { uploadToCloudinary } from '../middleware/uploadMiddleware.js';
import { v2 as cloudinary } from 'cloudinary';

export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    let photoUrl = null;

    if (req.file) {
      try {
        photoUrl = await uploadToCloudinary(req.file.buffer);
      } catch (err) {
        return res
          .status(500)
          .json({ error: 'Cloudinary error: ' + err.message });
      }
    }

    const newReview = await Review.create({
      user: userId,
      name: user.name,
      surname: user.surname,
      text: text,
      photo: photoUrl,
    });

    res.status(201).json({ message: 'Review created', review: newReview });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Перевірка: чи цей відгук належить користувачу, який хоче його видалити
    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ error: 'Access denied. You can only delete your own reviews' });
    }

    if (review.photo) {
      try {
        const urlParts = review.photo.split('/');
        const fileNameWithExtension = urlParts[urlParts.length - 1];
        const publicId = fileNameWithExtension.split('.')[0];

        await cloudinary.uploader.destroy(`speedhub_reviews/${publicId}`);
      } catch (cloudErr) {
        console.error('Cloudinary delete error:', cloudErr);
      }
    }

    await Review.findByIdAndDelete(id);

    res.json({ message: 'Review and associated photo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};
