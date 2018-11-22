import { Router } from 'express';

import { postController, commentController, surveyController } from '../controllers';

const router = Router();

router.get('/', (req, res) => res.status(200).send('Wolfgang Feedback App Beta'));

// Post routes.
router.get('/posts', postController.fetch);
router.get('/posts/:id', postController.findById);
router.post('/posts', postController.create);
router.post('/posts/:id/vote', postController.vote);
router.put('/posts/:id/resolve', postController.resolve);
router.put('/posts/:id/pin', postController.pin);

// Comment routes.
router.get('/comments/:id', commentController.findByPostId);
router.post('/comments', commentController.create);
router.post('/comments/:id/vote', commentController.vote);

// Survey routes.
router.get('/surveys', surveyController.fetch);
router.get('/surveys/:id', surveyController.findById);
router.post('/surveys', surveyController.create);
router.post('/surveys/:id/respond', surveyController.submitResponse);

export default router;
