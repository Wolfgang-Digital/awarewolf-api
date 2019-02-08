import { Router } from 'express';
import * as controller from './controller';
import * as validator from './validator';

const router = Router();

router.get('/reports/:dateRange', validator.parseParams, controller.getReports);
router.get('/reports/:dateRange/:id', controller.getReportById);

export default router;
