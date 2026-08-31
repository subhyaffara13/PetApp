export interface ClinicConfig {
  id: string;
  name: string;
  token: string;
  address?: string;
  phone?: string;
  openingHours?: string;
  tier?: 'verified' | 'unverified';
  rating?: number;
}

export interface ClaimableClinic {
  id: string;
  name: string;
  address: string;
  isOpenNow: boolean;
  location: { lat: number; lng: number };
  phone: string | null;
  openingHours?: string;
  tier?: 'verified' | 'unverified';
  rating?: number;
  capacityStatus?: 'accepting' | 'limited' | 'at_capacity';
}

export interface PatientLookupResult {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age?: number;
  weight?: number;
  gender?: string;
  photoUrl?: string;
  ownerName?: string;
  ownerPhone?: string;
  knownConditions?: string[];
  allergies?: string[];
  medications?: string[];
  medicalHistory?: Array<{
    id: string;
    date: string;
    type: string;
    title: string;
    description: string;
    vetName: string;
  }>;
}

export type CapacityStatus = 'accepting' | 'limited' | 'at_capacity';

export interface StatusOption {
  value: CapacityStatus;
  label: string;
  emoji: string;
  color: string;
  glow: string;
  description: string;
}

export interface IncomingDispatch {
  _id: string;
  petId: string;
  petName: string;
  species: string;
  breed: string;
  ownerName: string;
  ownerPhone: string;
  urgency: 'critical' | 'urgent' | 'standard';
  symptoms: string;
  etaMinutes: number;
  allergies: string[];
  conditions: string[];
  medications: string[];
  status: string;
  createdAt: string;
}

export interface MedicalRecord {
  _id: string;
  petId: string;
  petName: string;
  clinicId: string;
  clinicName: string;
  veterinarianName: string;
  visitDate: string;
  visitType: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentAdministered: string;
  prescriptions: Array<{ medicationName: string; dosage: string; frequency: string; duration: string; notes?: string }>;
  vaccinations: Array<{ vaccineName: string; batchNumber?: string; administeredDate: string; nextDueDate: string }>;
  dischargeInstructions: string;
  receiptNumber?: string;
  billedTotal?: string;
}
