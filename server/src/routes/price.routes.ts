import { Router } from 'express';
import { PriceController } from '../controllers/price.controller';

const router = Router();

router.get('/', PriceController.getAll);
router.get('/medicine/:name', PriceController.getForMedicine);

export default router;
