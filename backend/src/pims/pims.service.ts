import { Injectable, Logger } from '@nestjs/common';
import { PimsAdapter, PatientFile, AppointmentSlot } from './pims.interface';
import { RapidOneAdapter } from './adapters/rapidone.adapter';
import { PrizaAdapter } from './adapters/priza.adapter';
import { ProvetAdapter } from './adapters/provet.adapter';
import { DigitailAdapter } from './adapters/digitail.adapter';

@Injectable()
export class PimsService {
  private readonly logger = new Logger(PimsService.name);
  private readonly adapters: Map<string, PimsAdapter>;

  constructor(
    private readonly rapidOneAdapter: RapidOneAdapter,
    private readonly prizaAdapter: PrizaAdapter,
    private readonly provetAdapter: ProvetAdapter,
    private readonly digitailAdapter: DigitailAdapter,
  ) {
    this.adapters = new Map<string, PimsAdapter>([
      ['rapidone', this.rapidOneAdapter],
      ['priza', this.prizaAdapter],
      ['provet', this.provetAdapter],
      ['digitail', this.digitailAdapter],
    ]);
  }

  getAdapter(providerName: string): PimsAdapter | null {
    const adapter = this.adapters.get(providerName.toLowerCase());
    if (!adapter) {
      this.logger.warn(`No PIMS adapter found for provider: ${providerName}`);
      return null;
    }
    return adapter;
  }

  async syncClinicAvailability(
    providerName: string,
    clinicId: string,
    apiKey: string,
  ) {
    const adapter = this.getAdapter(providerName);
    if (!adapter) return null;

    try {
      return await adapter.syncAvailability(clinicId, apiKey);
    } catch (error) {
      this.logger.error(
        `Failed to sync availability via ${providerName}:`,
        error,
      );
      return null;
    }
  }

  async sendPatientFile(
    providerName: string,
    clinicId: string,
    apiKey: string,
    patientFile: PatientFile,
  ) {
    const adapter = this.getAdapter(providerName);
    if (!adapter) return { success: false };

    try {
      return await adapter.sendPatientFile(clinicId, apiKey, patientFile);
    } catch (error) {
      this.logger.error(
        `Failed to send patient file via ${providerName}:`,
        error,
      );
      return { success: false };
    }
  }

  async getAppointmentSlots(
    providerName: string,
    clinicId: string,
    apiKey: string,
  ): Promise<AppointmentSlot[]> {
    const adapter = this.getAdapter(providerName);
    if (!adapter) return [];

    try {
      return await adapter.getAppointmentSlots(clinicId, apiKey);
    } catch (error) {
      this.logger.error(
        `Failed to get slots via ${providerName}:`,
        error,
      );
      return [];
    }
  }

  getSupportedProviders(): string[] {
    return Array.from(this.adapters.keys());
  }
}
