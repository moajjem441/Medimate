import { Router } from 'express';
import { MedicineController } from '../controllers/medicine.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/logs', MedicineController.getLogs);
router.post('/', MedicineController.create);
router.get('/', MedicineController.getAll);
router.get('/:id', MedicineController.getById);
router.patch('/:id', MedicineController.update);
router.delete('/:id', MedicineController.delete);
router.post('/:id/log', MedicineController.logDose);

export default router;
