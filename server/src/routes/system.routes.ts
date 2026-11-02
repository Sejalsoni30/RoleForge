import { Router } from 'express';
import { getSystemStatus } from '../controllers/system.controller';

const router = Router();

router.get('/status', getSystemStatus);

export default router;

