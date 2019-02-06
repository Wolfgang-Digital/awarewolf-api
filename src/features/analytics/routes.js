import { Router } from 'express';
import * as controller from './controller';

const router = Router();

router.get('/summary/:id', controller.getClientSummary);

export default router;
