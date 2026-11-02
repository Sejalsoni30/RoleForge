import { Router } from 'express';
import {
  listCoverLetters,
  generateCoverLetter,
  getCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
} from '../controllers/coverLetter.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(requireAuth);

router.get('/', listCoverLetters);
router.post('/generate', aiLimiter, generateCoverLetter);
router.get('/:id', getCoverLetter);
router.put('/:id', updateCoverLetter);
router.delete('/:id', deleteCoverLetter);

export default router;

