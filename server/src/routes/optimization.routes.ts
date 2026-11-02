import { Router } from 'express';
import {
  getOptimizations,
  generateOptimizations,
  updateSuggestionStatus,
  applyAcceptedOptimizations,
} from '../controllers/optimization.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(requireAuth);

router.get('/by-pair/:resumeId/:jobId', getOptimizations);
router.post('/generate', aiLimiter, generateOptimizations);
router.put('/:id/suggestion/:suggestionId', updateSuggestionStatus);
router.post('/:id/apply', applyAcceptedOptimizations);

export default router;

