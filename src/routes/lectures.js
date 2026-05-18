import express from 'express';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const lectures = await mongoose.connection.db
            .collection('lectures')
            .find({})
            .toArray();

        res.status(200).json(lectures);
    } catch (err) {
        console.error("Помилка при завантаженні лекцій:", err);
        res.status(500).json({ error: "Помилка сервера при отриманні лекцій." });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await mongoose.connection.db
            .collection('lectures')
            .deleteOne({ _id: new mongoose.Types.ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Лекцію не знайдено." });
        }

        res.status(200).json({ message: "Лекцію успішно видалено." });
    } catch (err) {
        console.error("Помилка при видаленні лекції:", err);
        res.status(500).json({ error: "Не вдалося видалити лекцію." });
    }
});

export default router;