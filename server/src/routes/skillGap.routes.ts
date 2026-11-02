import { Router } from 'express';
import { getSkillGap, updateRoadmapItemStatus } from '../controllers/skillGap.controller';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/:matchAnalysisId', getSkillGap);
router.put('/:matchAnalysisId/item/:itemId', updateRoadmapItemStatus);

export default router;

