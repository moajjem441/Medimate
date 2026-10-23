import { Router } from 'express';
import { ReminderController } from '../controllers/reminder.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', ReminderController.getAll);
router.post('/', ReminderController.create);
router.patch('/:id', ReminderController.update);
router.patch('/:id/toggle', ReminderController.toggle);
router.delete('/:id', ReminderController.delete);

export default router;
