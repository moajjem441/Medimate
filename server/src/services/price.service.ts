import { prisma } from '../config/db';

export class PriceService {
  static async getAllPrices(search?: string) {
    return await prisma.medicinePrice.findMany({
      where: search
        ? {
            OR: [
              { medicineName: { contains: search, mode: 'insensitive' } },
              { genericName: { contains: search, mode: 'insensitive' } },
              { brand: { contains: search, mode: 'insensitive' } },
              { pharmacy: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: [{ medicineName: 'asc' }, { price: 'asc' }],
    });
  }

  static async getPriceForMedicine(medicineName: string) {
    return await prisma.medicinePrice.findMany({
      where: {
        OR: [
          { medicineName: { contains: medicineName, mode: 'insensitive' } },
          { genericName: { contains: medicineName, mode: 'insensitive' } },
        ],
      },
      orderBy: { price: 'asc' },
    });
  }
}
