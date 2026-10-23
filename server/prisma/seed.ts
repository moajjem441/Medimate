import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MediMate database...');

  // 1. Hash passwords
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const userPasswordHash = await bcrypt.hash('UserPassword123!', 10);

  // 2. Upsert Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medimate.com' },
    update: {},
    create: {
      email: 'admin@medimate.com',
      name: 'Dr. Sarah Mitchell (Admin)',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  // 3. Upsert Standard User
  const user = await prisma.user.upsert({
    where: { email: 'user@medimate.com' },
    update: {},
    create: {
      email: 'user@medimate.com',
      name: 'John Doe',
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });

  // 4. Sample Prescription
  const prescription = await prisma.prescription.create({
    data: {
      userId: user.id,
      imageUri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60',
      doctorName: 'Dr. Robert Carter, MD',
      clinicName: 'Metro General Health Clinic',
      status: 'COMPLETED',
      notes: 'Standard treatment course for seasonal bacterial bronchitis.',
      rawText: 'Rx: Amoxicillin 500mg TID 7 days. Paracetamol 500mg BID PRN pain.',
    },
  });

  // 5. Sample Medicines
  const med1 = await prisma.medicine.create({
    data: {
      userId: user.id,
      prescriptionId: prescription.id,
      name: 'Amoxicillin',
      dosage: '500 mg',
      frequency: '3 times daily',
      duration: '7 days',
      timing: 'After meal',
      instructions: 'Take capsules with water after meals. Complete full 7-day antibiotic course.',
      explanation: 'Broad-spectrum penicillin antibiotic used to treat bacterial respiratory infections.',
      isActive: true,
    },
  });

  const med2 = await prisma.medicine.create({
    data: {
      userId: user.id,
      prescriptionId: prescription.id,
      name: 'Paracetamol',
      dosage: '500 mg',
      frequency: '2 times daily',
      duration: '5 days',
      timing: 'After meal',
      instructions: 'Take 1 tablet every 8 hours as needed for fever or muscle ache.',
      explanation: 'Analgesic and antipyretic medicine that reduces moderate pain and lowers body temperature.',
      isActive: true,
    },
  });

  const med3 = await prisma.medicine.create({
    data: {
      userId: user.id,
      name: 'Omeprazole',
      dosage: '20 mg',
      frequency: 'Once daily',
      duration: '14 days',
      timing: 'Before meal',
      instructions: 'Take 1 capsule in the morning 30 minutes before breakfast.',
      explanation: 'Proton pump inhibitor that reduces stomach acid production to protect the stomach lining.',
      isActive: true,
    },
  });

  // 6. Sample Reminders
  await prisma.reminder.createMany({
    data: [
      {
        userId: user.id,
        medicineId: med1.id,
        time: '08:00 AM',
        days: 'DAILY',
        isEnabled: true,
      },
      {
        userId: user.id,
        medicineId: med1.id,
        time: '02:00 PM',
        days: 'DAILY',
        isEnabled: true,
      },
      {
        userId: user.id,
        medicineId: med1.id,
        time: '08:00 PM',
        days: 'DAILY',
        isEnabled: true,
      },
      {
        userId: user.id,
        medicineId: med2.id,
        time: '10:00 AM',
        days: 'DAILY',
        isEnabled: true,
      },
      {
        userId: user.id,
        medicineId: med3.id,
        time: '07:30 AM',
        days: 'DAILY',
        isEnabled: true,
      },
    ],
  });

  // 7. Verified Medicine Prices
  await prisma.medicinePrice.deleteMany({});
  await prisma.medicinePrice.createMany({
    data: [
      {
        medicineName: 'Amoxicillin',
        genericName: 'Amoxicillin Trihydrate',
        dosage: '500 mg (21 capsules)',
        brand: 'Amoxil',
        price: 12.50,
        currency: 'USD',
        pharmacy: 'CVS Pharmacy',
        inStock: true,
        url: 'https://www.cvs.com',
      },
      {
        medicineName: 'Amoxicillin',
        genericName: 'Amoxicillin Trihydrate',
        dosage: '500 mg (21 capsules)',
        brand: 'Generic',
        price: 9.20,
        currency: 'USD',
        pharmacy: 'Walgreens',
        inStock: true,
        url: 'https://www.walgreens.com',
      },
      {
        medicineName: 'Paracetamol',
        genericName: 'Acetaminophen',
        dosage: '500 mg (50 caplets)',
        brand: 'Tylenol',
        price: 7.99,
        currency: 'USD',
        pharmacy: 'Walmart Health',
        inStock: true,
        url: 'https://www.walmart.com',
      },
      {
        medicineName: 'Paracetamol',
        genericName: 'Acetaminophen',
        dosage: '500 mg (100 tablets)',
        brand: 'Equate Generic',
        price: 4.48,
        currency: 'USD',
        pharmacy: 'Walmart Pharmacy',
        inStock: true,
        url: 'https://www.walmart.com',
      },
      {
        medicineName: 'Omeprazole',
        genericName: 'Omeprazole Magnesium',
        dosage: '20 mg (14 delayed-release capsules)',
        brand: 'Prilosec OTC',
        price: 10.98,
        currency: 'USD',
        pharmacy: 'Target Pharmacy',
        inStock: true,
        url: 'https://www.target.com',
      },
      {
        medicineName: 'Omeprazole',
        genericName: 'Omeprazole Magnesium',
        dosage: '20 mg (28 capsules)',
        brand: 'Generic',
        price: 14.50,
        currency: 'USD',
        pharmacy: 'Costco Pharmacy',
        inStock: true,
        url: 'https://www.costco.com',
      },
      {
        medicineName: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium',
        dosage: '20 mg (30 tablets)',
        brand: 'Lipitor',
        price: 18.00,
        currency: 'USD',
        pharmacy: 'Kroger Pharmacy',
        inStock: true,
        url: 'https://www.kroger.com',
      },
      {
        medicineName: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        dosage: '500 mg (60 tablets)',
        brand: 'Glucophage',
        price: 8.50,
        currency: 'USD',
        pharmacy: 'GoodRx Partner Network',
        inStock: true,
        url: 'https://www.goodrx.com',
      },
    ],
  });

  console.log('✅ MediMate database seeded successfully:');
  console.log(' - Admin: admin@medimate.com (pwd: AdminPassword123!)');
  console.log(' - User:  user@medimate.com  (pwd: UserPassword123!)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
