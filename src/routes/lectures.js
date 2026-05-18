import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getAllLectures,
    createLecture,
    updateLecture,
    deleteLecture
} from '../controllers/lectureController.js';

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
 * summary: Отримати всі лекції
 * tags: [Lectures]
 * responses:
 * 200:
 * description: Список лекцій успішно отримано
 * post:
 * summary: Створити нову лекцію (Адмін)
 * tags: [Lectures]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [topic_id, title]
 * properties:
 * topic_id:
 * type: string
 * topic_prefix:
 * type: string
 * title:
 * type: string
 * content_html:
 * type: string
 * responses:
 * 201:
 * description: Лекцію успішно створено
 */
router.get('/', getAllLectures);
router.post('/', protect, createLecture);

/**
 * @openapi
 * /api/lectures/{id}:
 * put:
 * summary: Оновити існуючу лекцію за її ID (Адмін)
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
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * topic_id:
 * type: string
 * topic_prefix:
 * type: string
 * title:
 * type: string
 * content_html:
 * type: string
 * responses:
 * 200:
 * description: Лекцію успішно оновлено
 * 404:
 * description: Лекцію не знайдено
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
 */
router.put('/:id', protect, updateLecture);
router.delete('/:id', protect, deleteLecture);

export default router;