import { Router } from 'express';
import * as controller from './controller';
import * as validator from './validator';

const router = Router();

router.get('/clients', controller.getClients);
router.post('/clients', validator.createClient, controller.createClient);

export default router;