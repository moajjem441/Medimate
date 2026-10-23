import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { PrescriptionService } from '../services/prescription.service';
import { z } from 'zod';

const createPrescriptionSchema = z.object({
  imageUri: z.string().min(1, 'Image URI is required'),
  doctorName: z.string().nullable().optional(),
  clinicName: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  rawNotes: z.string().nullable().optional(),
  autoCreateMedicines: z.boolean().default(true),
  medicines: z.array(
    z.object({
      name: z.string().min(1, 'Medicine name is required'),
      dosage: z.string().nullable().optional(),
      frequency: z.string().nullable().optional(),
      duration: z.string().nullable().optional(),
      timing: z.string().nullable().optional(),
      instructions: z.string().nullable().optional(),
      explanation: z.string().nullable().optional(),
      confidence: z.number().nullable().optional(),
    })
  ).default([]),
});

export class PrescriptionController {
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const parsed = createPrescriptionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.errors[0].message,
        });
        return;
      }

      const prescription = await PrescriptionService.createPrescription(
        req.user.userId,
        parsed.data.imageUri,
        {
          doctorName: parsed.data.doctorName,
          clinicName: parsed.data.clinicName,
          date: parsed.data.date,
          rawNotes: parsed.data.rawNotes,
          medicines: parsed.data.medicines,
        },
        parsed.data.autoCreateMedicines
      );

      res.status(201).json({
        success: true,
        message: 'Prescription saved successfully.',
        data: prescription,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to save prescription.',
      });
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const prescriptions = await PrescriptionService.getUserPrescriptions(
        req.user.userId
      );
      res.status(200).json({
        success: true,
        data: prescriptions,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve prescriptions.',
      });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const prescription = await PrescriptionService.getPrescriptionById(
        req.params.id,
        req.user.userId
      );
      res.status(200).json({
        success: true,
        data: prescription,
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        message: err.message || 'Prescription not found.',
      });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await PrescriptionService.deletePrescription(
        req.params.id,
        req.user.userId
      );
      res.status(200).json(result);
    } catch (err: any) {
      res.status(404).json({
        success: false,
        message: err.message || 'Prescription not found.',
      });
    }
  }
}
