import { Router } from 'express';

import { analyticsController } from '../controllers';

const router = Router();

router.get('/:sheet', analyticsController.getSeoGAData);

export default router;