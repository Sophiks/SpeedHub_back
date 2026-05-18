import express from 'express';
import {
  getAllQuestions,
  getRandomTest,
  getQuestionsByUnit,
  updateQuestion,
  deleteQuestion,
  getQuestionsByIds,
  createQuestion, // 👈 ДОДАЛИ
} from '../controllers/questionsController.js';

import { uploadQuestionsPhotos } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

/**
 * CREATE QUESTION
 */
router.post(
    '/',
    protect,
    isAdmin,
    uploadQuestionsPhotos,
    createQuestion
);

/**
 * GET ALL
 */
router.get('/', getAllQuestions);

/**
 * BY IDS
 */
router.post('/get-by-ids', getQuestionsByIds);

/**
 * RANDOM TEST
 */
router.get('/test', getRandomTest);

/**
 * BY UNIT
 */
router.get('/search-by-unit', getQuestionsByUnit);

/**
 * UPDATE
 */
router.put(
    '/:id',
    protect,
    isAdmin,
    uploadQuestionsPhotos,
    updateQuestion
);

/**
 * DELETE
 */
router.delete('/:id', protect, isAdmin, deleteQuestion);

export default router;