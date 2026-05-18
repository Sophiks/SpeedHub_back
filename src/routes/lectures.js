import express from 'express';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 * - name: Lectures
 * description: API для управління лекціями ПДР
 */

/**
 * @openapi
 * /api/lectures:
 * get:
 * summary: Отримати всі лекції з бази даних
 * tags: [Lectures]
 * responses:
 * 200:
 * description: Список лекцій успішно отримано
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * _id:
 * type: string
 * topic_id:
 * type: string
 * topic_prefix:
 * type: string
 * title:
 * type: string
 * content_html:
 * type: string
 */
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

/**
 * @openapi
 * /api/lectures/{id}:
 * delete:
 * summary: Видалити лекцію за її ID (Адмін)
 * tags: [Lectures]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: ObjectId лекції в базі даних
 * responses:
 * 200:
 * description: Лекцію успішно видалено
 * 404:
 * description: Лекцію не знайдено
 * 500:
 * description: Помилка сервера при видаленні
 */
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