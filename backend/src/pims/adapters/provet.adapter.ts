import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PimsAdapter, PatientFile, AppointmentSlot } from '../pims.interface';

/**
 * Provet Cloud PIMS Adapter
 * Global cloud-based veterinary practice management system.
 * Docs: https://developer.provet.cloud/
 */
@Injectable()
export class ProvetAdapter implements PimsAdapter {
  readonly providerName = 'provet';
  private readonly logger = new Logger(ProvetAdapter.name);
  private readonly baseUrl = 'https://api.provet.cloud/v1';

  async syncAvailability(clinicId: string, apiKey: string) {
    this.logger.log(`Syncing availability for Provet clinic: ${clinicId}`);
    const response = await axios.get(`${this.baseUrl}/organizations/${clinicId}/availability`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 7000,
    });
    return {
      capacityStatus: response.data.capacityStatus as 'accepting' | 'limited' | 'at_capacity',
      waitTimeMinutes: response.data.waitTimeMinutes as number | undefined,
    };
  }

  async sendPatientFile(clinicId: string, apiKey: string, patientFile: PatientFile) {
    this.logger.log(`Sending patient file to Provet clinic: ${clinicId}`, patientFile.petName);
    const response = await axios.post(
      `${this.baseUrl}/organizations/${clinicId}/patients`,
      {
        pet_name: patientFile.petName,
        species: patientFile.species,
        breed: patientFile.breed,
        age: patientFile.age,
        weight: patientFile.weight,
        known_conditions: patientFile.knownConditions,
        chief_complaint: patientFile.chiefComplaint,
        owner_phone: patientFile.ownerPhone,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 10000,
      },
    );
    return { success: true, externalId: response.data.id as string };
  }

  async getAppointmentSlots(clinicId: string, apiKey: string): Promise<AppointmentSlot[]> {
    this.logger.log(`Getting appointment slots from Provet clinic: ${clinicId}`);
    const response = await axios.get(`${this.baseUrl}/organizations/${clinicId}/slots`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 7000,
    });
    return (response.data.slots || response.data).map((slot: any) => ({
      startTime: slot.startTime || slot.start_time,
      endTime: slot.endTime || slot.end_time,
      vetName: slot.vetName || slot.vet_name,
      available: slot.available ?? true,
    }));
  }
}
