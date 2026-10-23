import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Protect all admin endpoints with both authentication and admin role verification
router.use(requireAuth, requireAdmin);

router.get('/metrics', AdminController.getMetrics);
router.get('/users', AdminController.getUsers);
router.post('/prices', AdminController.createPrice);
router.patch('/prices/:id', AdminController.updatePrice);
router.delete('/prices/:id', AdminController.deletePrice);

export default router;
