import User from '../models/user.js';
import Review from '../models/review.js';
import { v2 as cloudinary } from 'cloudinary';

export const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

export const updateUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Update error: ' + err.message });
  }
};

export const deleteReviewAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (review.photo) {
      try {
        const urlParts = review.photo.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = fileName.split('.')[0];
        await cloudinary.uploader.destroy(`speedhub_reviews/${publicId}`);
      } catch (cloudErr) {
        console.error('Cloudinary cleanup failed:', cloudErr);
      }
    }

    await Review.findByIdAndDelete(id);
    res.json({ message: 'Review deleted by admin' });
  } catch (err) {
    res.status(500).json({ error: 'Delete error: ' + err.message });
  }
};

export const deleteUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user && req.user._id.toString() === id) {
      return res.status(400).json({ error: 'Ви не можете видалити власний профіль адміністратора' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'Користувача успішно видалено' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка при видаленні користувача: ' + err.message });
  }
};
