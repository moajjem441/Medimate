import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadPrescriptionImage } from '../middleware/upload.middleware';

const router = Router();

router.post(
  '/analyze-prescription',
  requireAuth,
  uploadPrescriptionImage.single('prescriptionImage'),
  AIController.analyzePrescription
);

export default router;
