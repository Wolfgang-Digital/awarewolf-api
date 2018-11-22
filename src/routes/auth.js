import { Router } from 'express';

import { userController } from '../controllers';

const router = Router();

router.post('/signup', userController.create);
router.post('/login', userController.login);
router.get('/confirm/:token', userController.confirmEmail);
router.get('/resend', userController.resendToken);

export default router;
