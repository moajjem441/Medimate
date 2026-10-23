import { prisma } from '../config/db';
import { ExtractedMedicine } from '../types';

export class PrescriptionService {
  static async createPrescription(
    userId: string,
    imageUri: string,
    extractedData: {
      doctorName?: string | null;
      clinicName?: string | null;
      date?: string | null;
      rawNotes?: string | null;
      medicines: ExtractedMedicine[];
    },
    autoCreateMedicines: boolean = true
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create prescription record
      let prescriptionDate: Date = new Date();
      if (extractedData.date) {
        const parsed = new Date(extractedData.date);
        if (!isNaN(parsed.getTime())) {
          prescriptionDate = parsed;
        }
      }

      const prescription = await tx.prescription.create({
        data: {
          userId,
          imageUri,
          doctorName: extractedData.doctorName || null,
          clinicName: extractedData.clinicName || null,
          date: prescriptionDate,
          status: 'COMPLETED',
          notes: extractedData.rawNotes || null,
        },
      });

      // 2. Optionally create medicines directly from extraction
      if (autoCreateMedicines && extractedData.medicines && extractedData.medicines.length > 0) {
        for (const med of extractedData.medicines) {
          const dosage = med.dosage || 'As directed';
          const frequency = med.frequency || 'As directed';
          const timing = med.timing || 'As directed';
          const timingLower = timing.toLowerCase();

          const createdMed = await tx.medicine.create({
            data: {
              userId,
              prescriptionId: prescription.id,
              name: med.name,
              dosage,
              frequency,
              duration: med.duration || null,
              timing,
              instructions: med.instructions || null,
              explanation: med.explanation || null,
              isActive: true,
            },
          });

          // Create default daily reminder for each medicine
          await tx.reminder.create({
            data: {
              userId,
              medicineId: createdMed.id,
              time:
                timingLower.includes('bedtime') || timingLower.includes('night')
                  ? '09:00 PM'
                  : '09:00 AM',
              days: 'DAILY',
              isEnabled: (med.confidence ?? 1) >= 0.6, // Only enable by default if confident
            },
          });
        }
      }

      return await tx.prescription.findUnique({
        where: { id: prescription.id },
        include: {
          medicines: {
            include: {
              reminders: true,
            },
          },
        },
      });
    });
  }

  static async getUserPrescriptions(userId: string) {
    return await prisma.prescription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        medicines: true,
        _count: {
          select: { medicines: true },
        },
      },
    });
  }

  static async getPrescriptionById(id: string, userId: string) {
    const prescription = await prisma.prescription.findFirst({
      where: { id, userId },
      include: {
        medicines: {
          include: {
            reminders: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new Error('Prescription not found.');
    }

    return prescription;
  }

  static async deletePrescription(id: string, userId: string) {
    const existing = await prisma.prescription.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Prescription not found.');
    }

    await prisma.prescription.delete({
      where: { id },
    });

    return { success: true, message: 'Prescription deleted successfully.' };
  }
}
