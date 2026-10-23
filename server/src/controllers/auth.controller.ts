import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.errors[0].message,
        });
        return;
      }

      const result = await AuthService.register(
        parsed.data.name,
        parsed.data.email,
        parsed.data.password
      );

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Registration failed.',
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.errors[0].message,
        });
        return;
      }

      const result = await AuthService.login(
        parsed.data.email,
        parsed.data.password
      );

      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: result,
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: err.message || 'Login failed.',
      });
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await AuthService.getMe(req.user.userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        message: err.message || 'User not found.',
      });
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const email = req.body.email;
      if (!email) {
        res.status(400).json({ success: false, message: 'Email is required' });
        return;
      }

      const result = await AuthService.forgotPassword(email);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
