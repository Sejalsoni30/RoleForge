import { Router } from 'express';
import {
  listResumes,
  uploadResume,
  createResumeFromText,
  getResume,
  updateResumeData,
  deleteResume,
} from '../controllers/resume.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { uploadResumeFile } from '../middleware/upload';

const router = Router();

router.use(requireAuth);

router.get('/', listResumes);
router.post('/upload', uploadResumeFile.single('file'), uploadResume);
router.post('/text', createResumeFromText);
router.get('/:id', getResume);
router.put('/:id', updateResumeData);
router.delete('/:id', deleteResume);

export default router;

