import { Router } from 'express';
import {
  listInterviewSessions,
  generateInterviewSession,
  getInterviewSession,
  submitAnswer,
} from '../controllers/interview.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(requireAuth);

router.get('/', listInterviewSessions);
router.post('/generate', aiLimiter, generateInterviewSession);
router.get('/:id', getInterviewSession);
router.post('/:id/answer', aiLimiter, submitAnswer);

export default router;

