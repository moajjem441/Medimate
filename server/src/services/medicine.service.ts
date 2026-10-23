import { prisma } from '../config/db';

export class MedicineService {
  static async getMedicines(userId: string, activeOnly: boolean = false) {
    return await prisma.medicine.findMany({
      where: {
        userId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        reminders: true,
        prescription: {
          select: { id: true, doctorName: true, date: true },
        },
      },
    });
  }

  static async getMedicineById(id: string, userId: string) {
    const medicine = await prisma.medicine.findFirst({
      where: { id, userId },
      include: {
        reminders: true,
        prescription: true,
        logs: {
          orderBy: { takenAt: 'desc' },
          take: 30,
        },
      },
    });

    if (!medicine) {
      throw new Error('Medicine not found.');
    }

    return medicine;
  }

  static async createMedicine(
    userId: string,
    data: {
      name: string;
      dosage: string;
      frequency: string;
      duration?: string | null;
      timing: string;
      instructions?: string | null;
      explanation?: string | null;
      startDate?: string | null;
      endDate?: string | null;
      prescriptionId?: string | null;
    }
  ) {
    return await prisma.medicine.create({
      data: {
        userId,
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        duration: data.duration || null,
        timing: data.timing,
        instructions: data.instructions || null,
        explanation: data.explanation || null,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        prescriptionId: data.prescriptionId || null,
        isActive: true,
      },
      include: {
        reminders: true,
      },
    });
  }

  static async updateMedicine(
    id: string,
    userId: string,
    data: {
      name?: string;
      dosage?: string;
      frequency?: string;
      duration?: string | null;
      timing?: string;
      instructions?: string | null;
      explanation?: string | null;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.medicine.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Medicine not found.');
    }

    return await prisma.medicine.update({
      where: { id },
      data,
      include: {
        reminders: true,
      },
    });
  }

  static async deleteMedicine(id: string, userId: string) {
    const existing = await prisma.medicine.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Medicine not found.');
    }

    await prisma.medicine.delete({
      where: { id },
    });

    return { success: true, message: 'Medicine deleted successfully.' };
  }

  static async logDose(
    userId: string,
    medicineId: string,
    data: {
      status?: 'TAKEN' | 'SKIPPED' | 'MISSED';
      reminderId?: string;
      scheduledTime?: string;
      notes?: string;
    }
  ) {
    // Verify medicine belongs to user
    const med = await prisma.medicine.findFirst({
      where: { id: medicineId, userId },
    });

    if (!med) {
      throw new Error('Medicine not found.');
    }

    return await prisma.medicineLog.create({
      data: {
        userId,
        medicineId,
        reminderId: data.reminderId,
        scheduledTime: data.scheduledTime,
        status: data.status || 'TAKEN',
        notes: data.notes,
        takenAt: new Date(),
      },
    });
  }

  static async getMedicineLogs(userId: string, medicineId?: string) {
    return await prisma.medicineLog.findMany({
      where: {
        userId,
        ...(medicineId ? { medicineId } : {}),
      },
      orderBy: { takenAt: 'desc' },
      include: {
        medicine: {
          select: { id: true, name: true, dosage: true },
        },
      },
      take: 50,
    });
  }
}
