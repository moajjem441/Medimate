import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { Role } from '@prisma/client';

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== Role.ADMIN) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Administrative privileges required.',
    });
    return;
  }

  next();
};
