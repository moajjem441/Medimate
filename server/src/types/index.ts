import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export interface ExtractedMedicine {
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  timing?: string | null;
  instructions?: string | null;
  explanation?: string | null;
  confidence?: number | null;
}

export interface PrescriptionAnalysisResult {
  isLegible: boolean;
  confidence: 'high' | 'medium' | 'low' | 'unreadable';
  doctorName?: string | null;
  clinicName?: string | null;
  date?: string | null;
  rawText?: string;
  extractedMedicines: ExtractedMedicine[];
  warnings: string[];
  disclaimer: string;
  rawNotes?: string;
}
