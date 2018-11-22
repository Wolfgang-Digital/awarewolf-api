import { Router } from 'express';
import { userController } from '../controllers';
import { upload, fileErrorHandler } from '../utils';

const router = Router();

router.post('/upload', (req, res, next) => {
  upload.single('avatar')(req, res, err => {
    if (err) {
      return fileErrorHandler(res, err);
    }
    next();
  })
}, userController.upload);

router.get('/', userController.getUsers);
router.put('/remove-avatar', userController.removeAvatar);

export default router;