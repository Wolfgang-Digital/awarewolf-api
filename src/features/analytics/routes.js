import { Router } from 'express';
import * as controller from './controller';
import * as validator from './validator';

const router = Router();

router.get('/reports', validator.getReports, controller.getReports);
router.get('/reports/:id', validator.getReportById, controller.getReportById);

export default router;
