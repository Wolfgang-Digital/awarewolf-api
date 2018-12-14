import { Router } from 'express';

import { analyticsController } from '../controllers';

const router = Router();

router.get('/sheets/:name', analyticsController.getSeoGAData);
//router.get('/data', analyticsController.getGADataWithDates);

export default router;