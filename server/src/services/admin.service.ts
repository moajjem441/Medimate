import { prisma } from '../config/db';

export class AdminService {
  static async getSystemMetrics() {
    const [userCount, prescriptionCount, medicineCount, reminderCount, logCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.prescription.count(),
        prisma.medicine.count(),
        prisma.reminder.count(),
        prisma.medicineLog.count(),
      ]);

    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            medicines: true,
            prescriptions: true,
            reminders: true,
          },
        },
      },
    });

    const recentPrescriptions = await prisma.prescription.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        medicines: { select: { name: true, dosage: true } },
      },
    });

    return {
      stats: {
        totalUsers: userCount,
        totalPrescriptions: prescriptionCount,
        totalMedicines: medicineCount,
        totalReminders: reminderCount,
        totalDoseLogs: logCount,
      },
      recentUsers,
      recentPrescriptions,
    };
  }

  static async getAllUsers() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            medicines: true,
            prescriptions: true,
            reminders: true,
          },
        },
      },
    });
  }

  static async createMedicinePrice(data: {
    medicineName: string;
    genericName?: string;
    dosage?: string;
    brand?: string;
    price: number;
    currency?: string;
    pharmacy: string;
    inStock?: boolean;
    url?: string;
  }) {
    return await prisma.medicinePrice.create({
      data: {
        ...data,
        currency: data.currency || 'USD',
        inStock: data.inStock ?? true,
      },
    });
  }

  static async updateMedicinePrice(
    id: string,
    data: {
      price?: number;
      pharmacy?: string;
      inStock?: boolean;
      url?: string;
    }
  ) {
    return await prisma.medicinePrice.update({
      where: { id },
      data: {
        ...data,
        lastUpdated: new Date(),
      },
    });
  }

  static async deleteMedicinePrice(id: string) {
    await prisma.medicinePrice.delete({
      where: { id },
    });
    return { success: true, message: 'Price record deleted.' };
  }
}
