import { Request, Response } from 'express';
import { PriceService } from '../services/price.service';

export class PriceController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const prices = await PriceService.getAllPrices(search);

      res.status(200).json({
        success: true,
        data: prices,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve price data.',
      });
    }
  }

  static async getForMedicine(req: Request, res: Response): Promise<void> {
    try {
      const name = req.params.name;
      const prices = await PriceService.getPriceForMedicine(name);

      res.status(200).json({
        success: true,
        data: prices,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve prices for medicine.',
      });
    }
  }
}
