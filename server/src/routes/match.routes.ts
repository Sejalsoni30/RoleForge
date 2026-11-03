import { Router } from 'express';
import {
  compileMatch,
  getMatch,
  getMatchByPair,
  listMatches,
  getLatestMatch,
} from '../controllers/match.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(requireAuth);

router.get('/', listMatches);
router.get('/compile', getLatestMatch);
router.post('/compile', aiLimiter, compileMatch);
router.get('/by-pair/:resumeId/:jobId', getMatchByPair);
router.get('/:id', getMatch);

export default router;

