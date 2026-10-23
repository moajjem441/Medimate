import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { MedicineService } from '../services/medicine.service';
import { z } from 'zod';

const createMedicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().nullable().optional(),
  timing: z.string().min(1, 'Timing is required'),
  instructions: z.string().nullable().optional(),
  explanation: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  prescriptionId: z.string().nullable().optional(),
});

const updateMedicineSchema = z.object({
  name: z.string().min(1).optional(),
  dosage: z.string().min(1).optional(),
  frequency: z.string().min(1).optional(),
  duration: z.string().nullable().optional(),
  timing: z.string().min(1).optional(),
  instructions: z.string().nullable().optional(),
  explanation: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const logDoseSchema = z.object({
  status: z.enum(['TAKEN', 'SKIPPED', 'MISSED']).default('TAKEN'),
  reminderId: z.string().optional(),
  scheduledTime: z.string().optional(),
  notes: z.string().optional(),
});

export class MedicineController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const activeOnly = req.query.active === 'true';
      const medicines = await MedicineService.getMedicines(
        req.user.userId,
        activeOnly
      );

      res.status(200).json({
        success: true,
        data: medicines,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve medicines.',
      });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const medicine = await MedicineService.getMedicineById(
        req.params.id,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        data: medicine,
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        message: err.message || 'Medicine not found.',
      });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const parsed = createMedicineSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.errors[0].message,
        });
        return;
      }

      const medicine = await MedicineService.createMedicine(
        req.user.userId,
        parsed.data
      );

      res.status(201).json({
        success: true,
        message: 'Medicine added successfully.',
        data: medicine,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to add medicine.',
      });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const parsed = updateMedicineSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.errors[0].message,
        });
        return;
      }

      const medicine = await MedicineService.updateMedicine(
        req.params.id,
        req.user.userId,
        parsed.data
      );

      res.status(200).json({
        success: true,
        message: 'Medicine updated successfully.',
        data: medicine,
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        message: err.message || 'Medicine not found.',
      });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await MedicineService.deleteMedicine(
        req.params.id,
        req.user.userId
      );

      res.status(200).json(result);
    } catch (err: any) {
      res.status(404).json({
        success: false,
        message: err.message || 'Medicine not found.',
      });
    }
  }

  static async logDose(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const parsed = logDoseSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.errors[0].message,
        });
        return;
      }

      const log = await MedicineService.logDose(
        req.user.userId,
        req.params.id,
        parsed.data
      );

      res.status(201).json({
        success: true,
        message: `Dose marked as ${parsed.data.status.toLowerCase()}.`,
        data: log,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to record dose log.',
      });
    }
  }

  static async getLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const medicineId = req.query.medicineId as string | undefined;
      const logs = await MedicineService.getMedicineLogs(
        req.user.userId,
        medicineId
      );

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve logs.',
      });
    }
  }
}
