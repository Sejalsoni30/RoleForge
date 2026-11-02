import { Router } from 'express';
import {
  listJobs,
  createJob,
  getJob,
  updateJobRequirements,
  deleteJob,
} from '../controllers/job.controller';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', listJobs);
router.post('/', createJob);
router.get('/:id', getJob);
router.put('/:id', updateJobRequirements);
router.delete('/:id', deleteJob);

export default router;

