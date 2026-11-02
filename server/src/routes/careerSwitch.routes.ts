import { Router } from 'express';
import {
  getCareerSwitchRoadmaps,
  generateCareerSwitchRoadmap,
} from '../controllers/careerSwitch.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(requireAuth);

router.get('/', getCareerSwitchRoadmaps);
router.post('/generate', aiLimiter, generateCareerSwitchRoadmap);

export default router;

