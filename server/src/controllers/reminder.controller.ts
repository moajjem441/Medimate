import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { ReminderService } from '../services/reminder.service';
import { z } from 'zod';

const createReminderSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  time: z.string().min(1, 'Time is required'),
  days: z.string().optional().default('DAILY'),
  isEnabled: z.boolean().optional().default(true),
  soundEnabled: z.boolean().optional().default(true),
  notificationId: z.string().optional(),
});

const updateReminderSchema = z.object({
  time: z.string().min(1).optional(),
  days: z.string().optional(),
  isEnabled: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  notificationId: z.string().optional(),
});

export class ReminderController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const reminders = await ReminderService.getReminders(req.user.userId);
      res.status(200).json({
        success: true,
        data: reminders,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve reminders.',
      });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const parsed = createReminderSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.errors[0].message,
        });
        return;
      }

      const reminder = await ReminderService.createReminder(
        req.user.userId,
        parsed.data
      );

      res.status(201).json({
        success: true,
        message: 'Reminder scheduled successfully.',
        data: reminder,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to create reminder.',
      });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const parsed = updateReminderSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.errors[0].message,
        });
        return;
      }

      const reminder = await ReminderService.updateReminder(
        req.params.id,
        req.user.userId,
        parsed.data
      );

      res.status(200).json({
        success: true,
        message: 'Reminder updated successfully.',
        data: reminder,
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        message: err.message || 'Reminder not found.',
      });
    }
  }

  static async toggle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { isEnabled } = req.body;
      if (typeof isEnabled !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'isEnabled must be a boolean.',
        });
        return;
      }

      const reminder = await ReminderService.toggleReminder(
        req.params.id,
        req.user.userId,
        isEnabled
      );

      res.status(200).json({
        success: true,
        message: `Reminder ${isEnabled ? 'enabled' : 'disabled'} successfully.`,
        data: reminder,
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        message: err.message || 'Reminder not found.',
      });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await ReminderService.deleteReminder(
        req.params.id,
        req.user.userId
      );

      res.status(200).json(result);
    } catch (err: any) {
      res.status(404).json({
        success: false,
        message: err.message || 'Reminder not found.',
      });
    }
  }
}
