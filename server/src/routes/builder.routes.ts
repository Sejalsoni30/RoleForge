import { Router } from 'express';
import {
  listVersions,
  saveVersion,
  checkATSReadability,
  exportResume,
} from '../controllers/builder.controller';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/versions/:resumeId', listVersions);
router.post('/versions', saveVersion);
router.post('/ats-check', checkATSReadability);
router.post('/export/:format', exportResume);

export default router;

