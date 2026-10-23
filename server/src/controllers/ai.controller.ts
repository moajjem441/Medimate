import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { AIService } from '../services/ai.service';
import path from 'path';
import { ENV } from '../config/env';

export class AIController {
  static async analyzePrescription(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      let filePath: string | undefined;

      if (req.file) {
        filePath = req.file.path;
      } else if (req.body.imagePath) {
        filePath = path.resolve(ENV.UPLOAD_DIR, req.body.imagePath);
      }

      if (!filePath) {
        res.status(400).json({
          success: false,
          message: 'Please upload a prescription image file or supply imagePath.',
        });
        return;
      }

      const analysis = await AIService.analyzePrescriptionImage(filePath);

      // Construct publicly accessible image URL if applicable
      const filename = path.basename(filePath);
      const imageUrl = `/uploads/${filename}`;

      res.status(200).json({
        success: true,
        message: analysis.isLegible
          ? 'Prescription analyzed successfully.'
          : 'Prescription image quality insufficient for confident extraction.',
        data: {
          ...analysis,
          imageUrl,
          filename,
        },
      });
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Error occurred while analyzing prescription.',
      });
    }
  }
}
