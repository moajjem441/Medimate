import { Router } from 'express';
import { PrescriptionController } from '../controllers/prescription.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadPrescriptionImage } from '../middleware/upload.middleware';
import path from 'path';

const router = Router();

// Upload image file endpoint
router.post(
  '/upload',
  requireAuth,
  uploadPrescriptionImage.single('image'),
  (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file uploaded.' });
      return;
    }
    const filename = path.basename(req.file.path);
    const imageUri = `/uploads/${filename}`;
    res.status(200).json({
      success: true,
      data: {
        filename,
        imageUri,
        path: req.file.path,
      },
    });
  }
);

router.post('/', requireAuth, PrescriptionController.create);
router.get('/', requireAuth, PrescriptionController.getAll);
router.get('/:id', requireAuth, PrescriptionController.getById);
router.delete('/:id', requireAuth, PrescriptionController.delete);

export default router;
