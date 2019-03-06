import { Router } from 'express';
import { userController } from '../controllers';
import { upload, fileErrorHandler } from '../utils';

const router = Router();

router.post(
  '/upload',
  (req, res, next) => {
    upload.single('avatar')(req, res, err => {
      if (err) {
        return fileErrorHandler(res, err);
      }
      next();
    });
  },
  userController.upload
);

router.get('/', userController.getUsers);
router.put('/remove-avatar', userController.removeAvatar);
router.get('/preferences/:userId', userController.getUserPreferences);
router.patch('/preferences/:userId', userController.updateUserPreferences);

export default router;
