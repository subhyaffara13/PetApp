// Interface that all PIMS adapters must implement
export interface PimsAdapter {
  readonly providerName: string;

  /**
   * Sync the clinic's current availability/capacity from the PIMS
   */
  syncAvailability(clinicId: string, apiKey: string): Promise<{
    capacityStatus: 'accepting' | 'limited' | 'at_capacity';
    waitTimeMinutes?: number;
  }>;

  /**
   * Send a distressed patient file to the clinic's PIMS
   */
  sendPatientFile(
    clinicId: string,
    apiKey: string,
    patientFile: PatientFile,
  ): Promise<{ success: boolean; externalId?: string }>;

  /**
   * Get available appointment slots (if applicable)
   */
  getAppointmentSlots(
    clinicId: string,
    apiKey: string,
  ): Promise<AppointmentSlot[]>;
}

export interface PatientFile {
  petName: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  knownConditions: string[];
  chiefComplaint: string;
  ownerPhone: string;
}

export interface AppointmentSlot {
  startTime: string;
  endTime: string;
  vetName?: string;
  available: boolean;
}
