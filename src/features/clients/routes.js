import { Router } from 'express';
import * as controller from './controller';
import * as validator from './validator';

const router = Router();

router.get('/', controller.getClients);
router.get('/:id', controller.getClientById);
router.post('/', validator.createClient, controller.createClient);
router.patch('/:id', validator.updateClient, controller.updateClient);

export default router;
