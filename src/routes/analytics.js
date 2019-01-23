import { Router } from 'express';

import { clientController } from '../controllers';

const router = Router();

// Client routes
router.get('/clients', clientController.getClients);
router.post('/clients', clientController.addClient);
router.patch('/clients/:clientId', clientController.updateClient);

export default router;