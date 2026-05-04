import express from 'express';
import {
  createReview,
  getAllReviews,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadPhoto } from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Reviews
 *     description: API for user reviews and feedback
 */

/**
 * @openapi
 * /api/reviews:
 *   get:
 *     summary: Get last 20 reviews
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: List of reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   surname:
 *                     type: string
 *                   text:
 *                     type: string
 *                   photo:
 *                     type: string
 *                     nullable: true
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *
 *   post:
 *     summary: Create a new review with photo upload (Auth required)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 description: The content of the review
 *                 example: "This app helped me pass my driving test! Highly recommend."
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file (jpg, png)
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Bad request (missing text or invalid file)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.get('/', getAllReviews);
router.post('/', protect, uploadPhoto, createReview);

/**
 * @openapi
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review (Author only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the review to delete
 *     responses:
 *       200:
 *         description: Review and photo deleted successfully
 *       403:
 *         description: Forbidden (you can only delete your own reviews)
 *       404:
 *         description: Review not found
 */
router.delete('/:id', protect, deleteReview);

export default router;
