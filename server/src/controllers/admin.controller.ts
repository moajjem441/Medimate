import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { AdminService } from '../services/admin.service';
import { z } from 'zod';

const priceSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  genericName: z.string().optional(),
  dosage: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().positive('Price must be greater than zero'),
  currency: z.string().default('USD'),
  pharmacy: z.string().min(1, 'Pharmacy name is required'),
  inStock: z.boolean().default(true),
  url: z.string().optional(),
});

export class AdminController {
  static async getMetrics(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const metrics = await AdminService.getSystemMetrics();
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve system metrics.',
      });
    }
  }

  static async getUsers(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const users = await AdminService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve users.',
      });
    }
  }

  static async createPrice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = priceSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.errors[0].message,
        });
        return;
      }

      const created = await AdminService.createMedicinePrice(parsed.data);
      res.status(201).json({
        success: true,
        message: 'Price record created.',
        data: created,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to create price record.',
      });
    }
  }

  static async updatePrice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const updated = await AdminService.updateMedicinePrice(
        req.params.id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Price record updated.',
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to update price record.',
      });
    }
  }

  static async deletePrice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await AdminService.deleteMedicinePrice(req.params.id);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to delete price record.',
      });
    }
  }
}
