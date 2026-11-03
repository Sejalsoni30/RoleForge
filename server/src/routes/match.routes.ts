import { Router } from 'express';
import { compileMatch, getMatch, getMatchByPair, listMatches } from '../controllers/match.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(requireAuth);

router.get('/', listMatches);
router.post('/compile', aiLimiter, compileMatch);
router.get('/:id', getMatch);
router.get('/by-pair/:resumeId/:jobId', getMatchByPair);

export default router;

