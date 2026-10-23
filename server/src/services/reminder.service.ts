import { prisma } from '../config/db';

export class ReminderService {
  static async getReminders(userId: string) {
    return await prisma.reminder.findMany({
      where: { userId },
      orderBy: { time: 'asc' },
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            dosage: true,
            timing: true,
            isActive: true,
          },
        },
      },
    });
  }

  static async createReminder(
    userId: string,
    data: {
      medicineId: string;
      time: string;
      days?: string;
      isEnabled?: boolean;
      soundEnabled?: boolean;
      notificationId?: string;
    }
  ) {
    // Verify medicine belongs to user
    const med = await prisma.medicine.findFirst({
      where: { id: data.medicineId, userId },
    });

    if (!med) {
      throw new Error('Medicine not found.');
    }

    return await prisma.reminder.create({
      data: {
        userId,
        medicineId: data.medicineId,
        time: data.time,
        days: data.days || 'DAILY',
        isEnabled: data.isEnabled ?? true,
        soundEnabled: data.soundEnabled ?? true,
        notificationId: data.notificationId,
      },
      include: {
        medicine: true,
      },
    });
  }

  static async updateReminder(
    id: string,
    userId: string,
    data: {
      time?: string;
      days?: string;
      isEnabled?: boolean;
      soundEnabled?: boolean;
      notificationId?: string;
    }
  ) {
    const existing = await prisma.reminder.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Reminder not found.');
    }

    return await prisma.reminder.update({
      where: { id },
      data,
      include: {
        medicine: true,
      },
    });
  }

  static async toggleReminder(id: string, userId: string, isEnabled: boolean) {
    const existing = await prisma.reminder.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Reminder not found.');
    }

    return await prisma.reminder.update({
      where: { id },
      data: { isEnabled },
      include: {
        medicine: true,
      },
    });
  }

  static async deleteReminder(id: string, userId: string) {
    const existing = await prisma.reminder.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Reminder not found.');
    }

    await prisma.reminder.delete({
      where: { id },
    });

    return { success: true, message: 'Reminder deleted successfully.' };
  }
}
