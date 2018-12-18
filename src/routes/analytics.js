import { Router } from 'express';

import { analyticsController, clientController } from '../controllers';

const router = Router();

// Data routes
router.get('/sheet/:dept/:range', analyticsController.getDataFromSheet);
//router.get('/data', analyticsController.getGADataWithDates);

// Client routes
router.post('/clients', clientController.addClient);
router.patch('/clients/:clientId', clientController.updateClient);

export default router;