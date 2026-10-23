import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting MediMate End-to-End Verification Pipeline...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData: any = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'healthy', 'API Health Check');

    // 2. Patient Registration
    const testEmail = `patient_${Date.now()}@medimate.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Smith',
        email: testEmail,
        password: 'Password123!',
      }),
    });
    const regData: any = await regRes.json();
    assert(regRes.status === 201 && regData.data.token, 'Patient Registration & Token Creation');
    const userToken = regData.data.token;

    // 3. Authenticated Profile
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const meData: any = await meRes.json();
    assert(meRes.status === 200 && meData.data.email === testEmail, 'GET /api/auth/me Profile Verification');

    // 4. Create sample test prescription image file
    const sampleImagePath = path.resolve(__dirname, '../../uploads/test-rx.jpg');
    if (!fs.existsSync(sampleImagePath)) {
      fs.writeFileSync(sampleImagePath, 'Simulated Prescription Image Buffer Content');
    }

    // 5. AI Prescription Analysis
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(sampleImagePath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    formData.append('prescriptionImage', blob, 'test-rx.jpg');

    const aiRes = await fetch(`${BASE_URL}/ai/analyze-prescription`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: formData,
    });
    const aiData: any = await aiRes.json();
    assert(
      aiRes.status === 200 &&
      aiData.data.isLegible === true &&
      aiData.data.extractedMedicines.length > 0 &&
      aiData.data.disclaimer.includes("AI-generated information is for assistance only"),
      'AI Prescription Analysis with Medical Disclaimer'
    );

    // 6. Save Prescription & Auto-Schedule Medicines + Reminders
    const saveRxRes = await fetch(`${BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        imageUri: aiData.data.imageUrl,
        doctorName: aiData.data.doctorName,
        clinicName: aiData.data.clinicName,
        date: aiData.data.date,
        medicines: aiData.data.extractedMedicines,
        autoCreateMedicines: true,
      }),
    });
    const saveRxData: any = await saveRxRes.json();
    assert(
      saveRxRes.status === 201 && saveRxData.data.medicines.length === aiData.data.extractedMedicines.length,
      'Save Prescription & Auto-Schedule Medicines'
    );

    // 7. Verify Medicines List
    const medsRes = await fetch(`${BASE_URL}/medicines`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const medsData: any = await medsRes.json();
    assert(medsRes.status === 200 && medsData.data.length > 0, 'GET /api/medicines Retrieval');
    const firstMed = medsData.data[0];

    // 8. Log Dose Taken
    const logRes = await fetch(`${BASE_URL}/medicines/${firstMed.id}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        status: 'TAKEN',
        notes: 'Morning dose taken after breakfast',
      }),
    });
    const logData: any = await logRes.json();
    assert(logRes.status === 201 && logData.data.status === 'TAKEN', 'Log Dose Taken (Medicine History)');

    // 9. Verify Medicine Details & Dose Logs
    const medDetailsRes = await fetch(`${BASE_URL}/medicines/${firstMed.id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const medDetailsData: any = await medDetailsRes.json();
    assert(
      medDetailsRes.status === 200 && medDetailsData.data.logs.length > 0,
      'GET /api/medicines/:id with Dose History'
    );

    // 10. Verify Reminders & Toggle
    const remRes = await fetch(`${BASE_URL}/reminders`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const remData: any = await remRes.json();
    assert(remRes.status === 200 && remData.data.length > 0, 'GET /api/reminders Retrieval');
    const firstRem = remData.data[0];

    const toggleRes = await fetch(`${BASE_URL}/reminders/${firstRem.id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ isEnabled: false }),
    });
    const toggleData: any = await toggleRes.json();
    assert(toggleRes.status === 200 && toggleData.data.isEnabled === false, 'Toggle Reminder Active State');

    // 11. Pharmacy Price Lookups
    const priceRes = await fetch(`${BASE_URL}/prices?search=Paracetamol`);
    const priceData: any = await priceRes.json();
    assert(priceRes.status === 200 && priceData.data.length > 0, 'Verified Medicine Price Search');

    // 12. Security / RBAC: Normal User Accessing Admin Endpoints -> MUST BE 403
    const forbiddenRes = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(forbiddenRes.status === 403, 'RBAC Guard: Non-admin User Blocked (403 Forbidden)');

    // 13. Security / RBAC: Admin User Accessing Admin Endpoints -> MUST BE 200
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@medimate.com',
        password: 'AdminPassword123!',
      }),
    });
    const adminLoginData: any = await adminLoginRes.json();
    const adminToken = adminLoginData.data.token;

    const adminMetricsRes = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminMetricsData: any = await adminMetricsRes.json();
    assert(
      adminMetricsRes.status === 200 && adminMetricsData.data.stats.totalUsers >= 2,
      'RBAC Success: Admin Access Authorized & Metrics Returned'
    );

    console.log(`\n📊 Verification Summary: ${passed} Passed, ${failed} Failed\n`);
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
