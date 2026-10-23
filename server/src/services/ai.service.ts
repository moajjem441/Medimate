import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env';
import { PrescriptionAnalysisResult, ExtractedMedicine } from '../types';

export const MANDATORY_HEALTHCARE_DISCLAIMER =
  "Please verify the extracted medicines against your original prescription before taking any medicine. AI-generated information is for assistance only. Always consult a qualified healthcare professional.";

export class AIService {
  /**
   * Main entry point for prescription image analysis.
   * Uses a strict two-stage vision and extraction pipeline.
   */
  static async analyzePrescriptionImage(
    filePath: string
  ): Promise<PrescriptionAnalysisResult> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Image file not found on server at: ${filePath}`);
    }

    const fileStats = fs.statSync(filePath);
    const sizeKB = (fileStats.size / 1024).toFixed(1);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType =
      ext === '.png'
        ? 'image/png'
        : ext === '.webp'
        ? 'image/webp'
        : 'image/jpeg';

    console.log(
      `[PRESCRIPTION VISION] Image received: "${path.basename(
        filePath
      )}", size: ${sizeKB} KB, MIME: ${mimeType}`
    );

    // Enforce API key configuration
    if (!ENV.GEMINI_API_KEY || ENV.GEMINI_API_KEY.trim() === '') {
      console.error(
        '[PRESCRIPTION VISION ERROR] GEMINI_API_KEY is not configured in server/.env'
      );
      throw new Error(
        'GEMINI_API_KEY is not configured. Please configure your Google Gemini API key in server/.env to enable live prescription AI vision analysis.'
      );
    }

    // Execute Two-Stage Vision Pipeline
    return await this.executeTwoStagePipeline(filePath, mimeType, fileStats.size);
  }

  /**
   * Two-Stage Vision & Extraction Pipeline:
   * Stage 1: Vision OCR / Text Extraction (Direct from Image)
   * Stage 2: Structured Parsing & Dosing Extraction (Strictly from Stage 1 text)
   * Stage 3: Independent Plain-Language Explanation (Isolated from name extraction)
   */
  private static async executeTwoStagePipeline(
    filePath: string,
    mimeType: string,
    fileSizeBytes: number
  ): Promise<PrescriptionAnalysisResult> {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');

    console.log(
      `[PRESCRIPTION VISION] Stage 1: Sending image (${fileSizeBytes} bytes base64-encoded) to Vision model...`
    );
    const startTime = Date.now();

    // STAGE 1 & 2 PROMPT: Strict Vision Extraction
    const extractionPrompt = `
You are a specialized medical prescription text extraction system.
Analyze ONLY the provided prescription image.

Your task is to extract medicine names and instructions that are VISIBLY written in the image.

CRITICAL RULES:
1. Analyze ONLY the provided prescription image. The image is the ONLY source of truth.
2. Do NOT use medical knowledge to guess missing information.
3. Do NOT replace a brand name with a generic medicine name.
   - For example: "Axim-CV 250" must remain "Axim-CV 250" (do NOT convert to Amoxicillin, Cefuroxime, etc.).
   - "Roxyzin 10" must remain "Roxyzin 10" (do NOT convert to Cetirizine, Hydroxyzine, etc.).
   - "Scabo 6mg" must remain "Scabo 6mg" (do NOT convert to Ivermectin).
   - Preserve exact brand names as visibly written.
4. Do NOT invent medicine names.
5. Do NOT use common medicines (e.g., Amoxicillin, Paracetamol, Cetirizine) as fallback values.
6. If a medicine name or word is unclear, return the visible text as closely as possible and mark confidence as low (< 0.6).
7. If information for a field is not visibly written on the prescription image, return null. Do NOT guess or provide default values.
8. Handle handwritten dosage instructions carefully, including regional numerals (e.g., Bengali ১ = 1, ২ = 2, ইত্যাদি) or local dosing instructions (e.g., খালি পেটে খাবেন = on empty stomach, ভরা পেটে = after meal, D 1 = Day 1, D 7 = Day 7).

Respond ONLY with valid JSON matching this schema:
{
  "isLegible": boolean,
  "confidence": "high" | "medium" | "low" | "unreadable",
  "doctorName": string or null,
  "clinicName": string or null,
  "date": string or null,
  "rawText": "Complete visible transcription of handwritten and printed text from the image",
  "medicines": [
    {
      "name": "Exact visible brand or medicine name",
      "dosage": "Exact visible dosage strength (e.g., '250', '10', '6mg') or null",
      "frequency": "Exact visible frequency (e.g., 'Twice daily', '1+0+1') or null",
      "timing": "Exact visible timing (e.g., 'Empty stomach', 'After meal') or null",
      "duration": "Exact visible duration (e.g., '10 days', '15 days') or null",
      "instructions": "Exact visible instructions (e.g., '2 tablets on Day 1 and 2 tablets on Day 7') or null",
      "confidence": number between 0.0 and 1.0
    }
  ],
  "warnings": [string]
}
`;

    const rawResult = await this.callGeminiVision(base64Image, mimeType, extractionPrompt);
    const latencyMs = Date.now() - startTime;
    console.log(
      `[PRESCRIPTION VISION] Vision extraction completed in ${latencyMs}ms. Status: ${
        rawResult.isLegible ? 'Legible' : 'Unclear'
      }`
    );

    if (!rawResult.isLegible || !rawResult.medicines || rawResult.medicines.length === 0) {
      return {
        isLegible: false,
        confidence: rawResult.confidence || 'unreadable',
        doctorName: rawResult.doctorName || null,
        clinicName: rawResult.clinicName || null,
        date: rawResult.date || null,
        rawText: rawResult.rawText || '',
        extractedMedicines: [],
        warnings: rawResult.warnings || [
          'The prescription image could not be read clearly.',
          'Please ensure the photo is well-lit, sharp, and clearly shows medicine names.',
        ],
        disclaimer: MANDATORY_HEALTHCARE_DISCLAIMER,
        rawNotes: rawResult.rawText || 'No legible text extracted from image.',
      };
    }

    // STAGE 2: Structured Normalization
    const structuredMedicines: ExtractedMedicine[] = rawResult.medicines.map(
      (m: any) => ({
        name: (m.name || '').trim(),
        dosage: m.dosage ? String(m.dosage).trim() : null,
        frequency: m.frequency ? String(m.frequency).trim() : null,
        timing: m.timing ? String(m.timing).trim() : null,
        duration: m.duration ? String(m.duration).trim() : null,
        instructions: m.instructions ? String(m.instructions).trim() : null,
        confidence: typeof m.confidence === 'number' ? m.confidence : 0.85,
        explanation: null, // Generated separately in Stage 3
      })
    );

    console.log(
      `[PRESCRIPTION VISION] Stage 2: Parsed ${structuredMedicines.length} medicines:`,
      structuredMedicines.map((m) => `${m.name} (conf: ${m.confidence})`)
    );

    // STAGE 3: Isolated Simple Explanation Generation
    // Explanations are strictly generated AFTER extraction and CANNOT influence medicine names.
    try {
      await this.generateSimpleExplanations(structuredMedicines);
    } catch (expErr: any) {
      console.warn(
        '[PRESCRIPTION VISION] Stage 3 explanation generator skipped:',
        expErr?.message
      );
    }

    return {
      isLegible: true,
      confidence: rawResult.confidence || 'high',
      doctorName: rawResult.doctorName || null,
      clinicName: rawResult.clinicName || null,
      date: rawResult.date || null,
      rawText: rawResult.rawText || '',
      extractedMedicines: structuredMedicines,
      warnings: rawResult.warnings || [],
      disclaimer: MANDATORY_HEALTHCARE_DISCLAIMER,
      rawNotes: rawResult.rawText || '',
    };
  }

  /**
   * Stage 3: Generate simple explanations in an isolated step.
   * This ensures explanations never alter or influence the extracted medicine names.
   */
  private static async generateSimpleExplanations(
    medicines: ExtractedMedicine[]
  ): Promise<void> {
    const confidentMeds = medicines.filter((m) => (m.confidence ?? 1) >= 0.5);
    if (confidentMeds.length === 0) return;

    const medNames = confidentMeds.map((m) => m.name).join(', ');
    const explanationPrompt = `
You are a healthcare educator.
Provide a concise, 1-sentence patient-friendly explanation of the general clinical purpose for each of the following medicine names:
${medNames}

CRITICAL RULES:
1. Do NOT suggest changing the medicine name.
2. Return a JSON object mapping each exact medicine name to its 1-sentence purpose explanation.
Example:
{
  "Axim-CV 250": "Antibiotic used to treat bacterial infections.",
  "Roxyzin 10": "Antihistamine used to relieve intense itching and allergic skin symptoms.",
  "Scabo 6mg": "Antiparasitic medication used to eradicate scabies mites."
}
`;

    const model = ENV.GEMINI_MODEL || 'gemini-3.6-flash';
    console.log(`[Gemini] Using model: ${model}`);
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${ENV.GEMINI_API_KEY}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: explanationPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (response.ok) {
      const data: any = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const explanations = JSON.parse(text);
        for (const med of medicines) {
          if (explanations[med.name]) {
            med.explanation = explanations[med.name];
          }
        }
      }
    }
  }

  /**
   * Helper to call Gemini Multimodal Vision API.
   * Uses gemini-3.6-flash and falls back to gemini-2.5-flash if needed.
   */
  private static async callGeminiVision(
    base64Image: string,
    mimeType: string,
    prompt: string
  ): Promise<any> {
    const primaryModel = ENV.GEMINI_MODEL || 'gemini-3.6-flash';
    const fallbackModel = 'gemini-2.5-flash';
    const models = primaryModel === fallbackModel ? [primaryModel] : [primaryModel, fallbackModel];
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        console.log(`[Gemini] Using model: ${model}`);
        console.log(`[PRESCRIPTION VISION] Querying Gemini model: ${model}...`);
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${ENV.GEMINI_API_KEY}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType,
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Gemini ${model} returned HTTP ${response.status}: ${errBody}`);
        }

        const data: any = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) {
          throw new Error(`Gemini ${model} returned empty candidate parts.`);
        }

        return JSON.parse(candidateText);
      } catch (err: any) {
        console.warn(`[PRESCRIPTION VISION] Model ${model} attempt failed:`, err?.message);
        lastError = err;
      }
    }

    throw lastError || new Error('All Gemini vision models failed to process the image.');
  }
}
