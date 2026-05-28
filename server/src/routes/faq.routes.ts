import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const adminAuth = [authenticate, authorizeRoles('admin')];
import { listFAQs, addFAQ, editFAQ, removeFAQ } from '../controllers/faq.controller.js';

const router = Router();

router.get('/', listFAQs);
router.post('/', ...adminAuth, addFAQ);
router.put('/:id', ...adminAuth, editFAQ);
router.delete('/:id', ...adminAuth, removeFAQ);

export default router;
