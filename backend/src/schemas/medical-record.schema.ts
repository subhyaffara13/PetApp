import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MedicalRecordDocument = MedicalRecord & Document;

export interface Prescription {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface VaccinationRecord {
  vaccineName: string;
  batchNumber?: string;
  administeredDate: string;
  nextDueDate: string;
}

@Schema({ timestamps: true })
export class MedicalRecord {
  @Prop({ required: true })
  petId: string;

  @Prop({ required: true })
  petName: string;

  @Prop({ required: true })
  clinicId: string;

  @Prop({ required: true })
  clinicName: string;

  @Prop({ required: true })
  veterinarianName: string;

  @Prop({ required: true, default: () => new Date().toISOString() })
  visitDate: string;

  @Prop({ required: true, enum: ['emergency', 'routine', 'vaccination', 'surgery', 'followup'], default: 'emergency' })
  visitType: string;

  @Prop({ required: true })
  chiefComplaint: string;

  @Prop({ required: true })
  diagnosis: string;

  @Prop({ default: '' })
  treatmentAdministered: string;

  @Prop({ type: Array, default: [] })
  prescriptions: Prescription[];

  @Prop({ type: Array, default: [] })
  vaccinations: VaccinationRecord[];

  @Prop({ default: '' })
  dischargeInstructions: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);
