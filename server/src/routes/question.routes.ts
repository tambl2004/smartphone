import { Router } from 'express';
import {
  createQuestionController,
  getProductQuestionsController,
  listRootQuestionsController,
  getQuestionThreadController,
  deleteQuestionController,
} from '../controllers/question.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

// Public: Get Q&As for a specific product
router.get('/product/:productId', getProductQuestionsController);

// Authenticated: Post a question or a reply (parentId determines if it's a root or reply)
router.post('/', authenticate, createQuestionController);

// Admin: Get all root questions
router.get('/', authenticate, authorizeRoles('admin'), listRootQuestionsController);

// Admin / Authenticated: Get a full Q&A thread
router.get('/thread/:id', authenticate, getQuestionThreadController);

// Admin: Delete a Q&A thread
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteQuestionController);

export default router;
