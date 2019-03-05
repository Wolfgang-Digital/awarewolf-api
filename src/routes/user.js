import { Router } from 'express';
import { userController } from '../controllers';

const router = Router();

router.get('/', userController.getUsers);
router.put('/remove-avatar', userController.removeAvatar);
router.get('/preferences/:userId', userController.getUserPreferences);
router.patch('/preferences/:userId', userController.updateUserPreferences);

export default router;
