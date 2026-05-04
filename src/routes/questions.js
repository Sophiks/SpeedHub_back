import express from 'express';
import {
  getAllQuestions,
  getRandomTest,
  getQuestionsByUnit,
  updateQuestion,
  deleteQuestion,
  getQuestionsByIds,
} from '../controllers/questionsController.js';
import { uploadQuestionsPhotos } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * /api/questions/{id}:
 *   put:
 *     summary: Update a question (including uploading new images)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mongo _id of the question
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: Question text
 *               customId:
 *                 type: string
 *                 description: Section text ID (e.g., r1q5)
 *               correct_option_id:
 *                 type: integer
 *                 description: ID of the correct answer (1, 2, 3...)
 *               options:
 *                 type: string
 *                 description: JSON string of options array (e.g., '["Yes", "No"]')
 *               existingImages:
 *                 type: string
 *                 description: JSON string of existing image URLs to keep
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New image files to upload (max. 5)
 *     responses:
 *       200:
 *         description: Question successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Question not found
 */
router.put('/:id', protect, isAdmin, uploadQuestionsPhotos, updateQuestion);

/**
 * @openapi
 * /api/questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', getAllQuestions);

/**
 * @openapi
 * /api/questions/get-by-ids:
 *   post:
 *     summary: Get questions by their custom IDs
 *     description: Accepts an array of custom IDs (e.g., ['r1q1', 'r1q2']) and returns full question objects. Used for the "mistakes review" mode.
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 description: Array of question custom IDs (customId field in DB)
 *                 items:
 *                   type: string
 *           example:
 *             ids: ["r1q4", "r1q10", "r2q5"]
 *     responses:
 *       200:
 *         description: List of found questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       400:
 *         description: Invalid input format (ids array is required)
 *       500:
 *         description: Server error
 */
router.post('/get-by-ids', getQuestionsByIds);

/**
 * @openapi
 * /api/questions/test:
 *   get:
 *     summary: Get a random test
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/test', getRandomTest);

/**
 * @openapi
 * /api/questions/search-by-unit:
 *   get:
 *     summary: Get questions by unit
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/search-by-unit', getQuestionsByUnit);

/**
 * @openapi
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete a question (Admin only)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mongo _id of the question
 *     responses:
 *       200:
 *         description: Question successfully deleted
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Question not found
 */
router.delete('/:id', protect, isAdmin, deleteQuestion);

export default router;

