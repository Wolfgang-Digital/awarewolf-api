import { Router } from 'express';

import { watsonController } from '../controllers';

const router = Router();

router.post('/language', watsonController.analyseLanguage);
router.post('/tone', watsonController.analyseTone);

export default router;