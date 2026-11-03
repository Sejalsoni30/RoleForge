import { Router } from 'express';
import {
  getSkillGap,
  getLatestSkillGap,
  listSkillGaps,
  updateRoadmapItemStatus,
} from '../controllers/skillGap.controller';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/latest', getLatestSkillGap);
router.get('/', listSkillGaps);
router.get('/:matchAnalysisId', getSkillGap);
router.put('/:matchAnalysisId/item/:itemId', updateRoadmapItemStatus);

export default router;

