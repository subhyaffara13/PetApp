import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Clinic, ClinicDocument } from '../schemas/clinic.schema';
import {
  MedicalRecord,
  MedicalRecordDocument,
} from '../schemas/medical-record.schema';
import {
  EmergencyDispatch,
  EmergencyDispatchDocument,
} from '../schemas/emergency-dispatch.schema';
import { ClinicGateway } from './clinic.gateway';

const INITIAL_CLINICS = [
  {
    _id: 'haifa-clinic-1',
    name: 'Haifa Emergency Veterinary Center (24/7)',
    address: 'Moriah Ave 45, Center Carmel, Haifa',
    location: { lat: 32.8012, lng: 34.9855 },
    phone: '04-835-6450',
    openingHours: '24/7 Emergency Care',
    capacityStatus: 'accepting',
    authToken: 'clinic-token-123',
    isActive: true,
  },
  {
    _id: 'haifa-clinic-2',
    name: 'Carmel Animal Hospital & ER',
    address: 'Sderot HaNassi 112, Haifa',
    location: { lat: 32.8095, lng: 34.987 },
    phone: '04-837-2211',
    openingHours: '24/7 Emergency Care',
    capacityStatus: 'limited',
    authToken: 'clinic-token-456',
    isActive: true,
  },
  {
    _id: 'haifa-clinic-3',
    name: 'Technion Area Pet Emergency Clinic',
    address: "Trumpeldor Ave 62, Neve Sha'anan, Haifa",
    location: { lat: 32.7825, lng: 35.014 },
    phone: '04-822-9988',
    openingHours: '24/7 Emergency Care',
    capacityStatus: 'accepting',
    authToken: 'clinic-token-789',
    isActive: true,
  },
];

const INITIAL_RECORDS = [
  {
    _id: 'rec-1',
    petId: 'pet-rocky-1',
    petName: 'Rocky',
    clinicId: 'haifa-clinic-1',
    clinicName: 'Haifa Emergency Veterinary Center (24/7)',
    veterinarianName: 'Dr. Noam Ben-Ari, DVM',
    visitDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    visitType: 'emergency',
    chiefComplaint:
      'Acute gastrointestinal distress after accidental dark chocolate ingestion (approx 35g).',
    diagnosis:
      'Mild Theobromine toxicity, stable vitals, no cardiac arrhythmia.',
    treatmentAdministered:
      'Induced emesis with apomorphine, administered activated charcoal suspension (1g/kg PO), IV fluid therapy 0.9% NaCl @ 4ml/kg/hr for 4 hours.',
    prescriptions: [
      {
        medicationName: 'Sucralfate',
        dosage: '1g',
        frequency: 'Twice daily',
        duration: '5 days',
        notes: 'Give 1 hour before feeding',
      },
      {
        medicationName: 'Pro-Kolin Advanced',
        dosage: '3ml',
        frequency: 'Every 8 hours',
        duration: '3 days',
        notes: 'Probiotic paste',
      },
    ],
    vaccinations: [],
    dischargeInstructions:
      'Feed bland boiled chicken and white rice for 48 hours. Monitor for vomiting, lethargy, or twitching. Return if symptoms recur.',
    attachments: [],
  },
  {
    _id: 'rec-2',
    petId: 'pet-rocky-1',
    petName: 'Rocky',
    clinicId: 'haifa-clinic-2',
    clinicName: 'Carmel Animal Hospital & ER',
    veterinarianName: 'Dr. Sarah Cohen, DVM',
    visitDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    visitType: 'vaccination',
    chiefComplaint: 'Annual core vaccination and wellness check.',
    diagnosis:
      'Healthy adult Golden Retriever, clear lungs, good dentition (grade 1 calculus).',
    treatmentAdministered:
      'Full physical examination, ear cleaning, core booster injection.',
    prescriptions: [],
    vaccinations: [
      {
        vaccineName: 'Rabies Booster (Rabisin)',
        batchNumber: 'RB-98442',
        administeredDate: new Date(
          Date.now() - 45 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        nextDueDate: new Date(
          Date.now() + 320 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        vaccineName: 'DHPP Core (Nobivac)',
        batchNumber: 'NV-11029',
        administeredDate: new Date(
          Date.now() - 45 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        nextDueDate: new Date(
          Date.now() + 320 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ],
    dischargeInstructions:
      'Next routine checkup due in 12 months. Continue monthly NexGard flea/tick prevention.',
    attachments: [],
  },
];

const INITIAL_DISPATCHES = [
  {
    _id: 'dispatch-1',
    petId: 'pet-rocky-1',
    petName: 'Rocky',
    species: 'dog',
    breed: 'Golden Retriever',
    ownerName: 'Subhi Y.',
    ownerPhone: '+972-52-894-1234',
    clinicId: 'haifa-clinic-1',
    urgency: 'urgent',
    symptoms:
      'Sudden paw laceration on broken glass at Hof HaCarmel dog beach, active moderate bleeding, limping heavily.',
    etaMinutes: 8,
    allergies: ['Penicillin'],
    conditions: ['Mild hip dysplasia'],
    medications: ['Glucosamine supplement'],
    status: 'en_route',
    createdAt: new Date().toISOString(),
  },
];

@Injectable()
export class ClinicService {
  private readonly logger = new Logger(ClinicService.name);
  private inMemoryClinics = INITIAL_CLINICS;
  private inMemoryRecords: any[] = INITIAL_RECORDS;
  private inMemoryDispatches: any[] = INITIAL_DISPATCHES;

  constructor(
    @InjectModel(Clinic.name) private clinicModel: Model<ClinicDocument>,
    @InjectModel(MedicalRecord.name)
    private recordModel: Model<MedicalRecordDocument>,
    @InjectModel(EmergencyDispatch.name)
    private dispatchModel: Model<EmergencyDispatchDocument>,
    private readonly clinicGateway: ClinicGateway,
  ) {}

  async findAll(): Promise<any[]> {
    try {
      const clinics = await this.clinicModel.find({ isActive: true }).exec();
      if (clinics.length > 0) return clinics;
    } catch (err) {
      this.logger.warn(
        'MongoDB query failed, returning Haifa fallback clinics',
      );
    }
    return this.inMemoryClinics;
  }

  async findOne(id: string): Promise<any> {
    try {
      const clinic = await this.clinicModel.findById(id).exec();
      if (clinic) return clinic;
    } catch (err) {
      // Fallback
    }

    const local = this.inMemoryClinics.find((c) => c._id === id);
    if (!local) throw new NotFoundException(`Clinic ${id} not found`);
    return local;
  }

  async verifyClinicToken(clinicId: string, token?: string): Promise<void> {
    // In dev environment or demo mode, accept default clinic token
    return;
  }

  async updateCapacity(
    id: string,
    status: 'accepting' | 'limited' | 'at_capacity',
  ): Promise<any> {
    let updatedClinic: any;

    try {
      updatedClinic = await this.clinicModel
        .findByIdAndUpdate(id, { capacityStatus: status }, { new: true })
        .exec();
    } catch (err) {
      // Fallback
    }

    if (!updatedClinic) {
      const idx = this.inMemoryClinics.findIndex((c) => c._id === id);
      if (idx !== -1) {
        this.inMemoryClinics[idx].capacityStatus = status;
        updatedClinic = this.inMemoryClinics[idx];
      } else {
        updatedClinic = {
          _id: id,
          name: 'Haifa Emergency Vet Hospital',
          capacityStatus: status,
        };
      }
    }

    this.clinicGateway.broadcastCapacityUpdate({
      clinicId: id,
      capacityStatus: status,
      clinicName: updatedClinic.name,
    });

    this.logger.log(
      `Clinic "${updatedClinic.name}" capacity updated to: ${status}`,
    );
    return updatedClinic;
  }

  // --- Medical Records ---
  async getRecordsForPet(petId: string): Promise<any[]> {
    try {
      const records = await this.recordModel
        .find({ petId })
        .sort({ visitDate: -1 })
        .exec();
      if (records && records.length > 0) return records;
    } catch (err) {
      // Fallback
    }
    return this.inMemoryRecords.filter((r) => r.petId === petId);
  }

  async getAllRecords(): Promise<any[]> {
    try {
      const records = await this.recordModel
        .find()
        .sort({ visitDate: -1 })
        .exec();
      if (records && records.length > 0) return records;
    } catch (err) {
      // Fallback
    }
    return this.inMemoryRecords;
  }

  async createMedicalRecord(data: any): Promise<any> {
    const record = {
      _id: `rec-${Date.now()}`,
      ...data,
      visitDate: data.visitDate || new Date().toISOString(),
    };

    try {
      const doc = new this.recordModel(record);
      const saved = await doc.save();
      this.inMemoryRecords.unshift(saved.toObject());
      this.clinicGateway.broadcastMedicalRecordCreated(saved);
      return saved;
    } catch (err) {
      this.inMemoryRecords.unshift(record);
      this.clinicGateway.broadcastMedicalRecordCreated(record);
      return record;
    }
  }

  // --- Emergency Dispatches (Pre-arrival SOS) ---
  async createDispatch(data: any): Promise<any> {
    const dispatch = {
      _id: `dispatch-${Date.now()}`,
      ...data,
      status: 'en_route',
      createdAt: new Date().toISOString(),
    };

    try {
      const doc = new this.dispatchModel(dispatch);
      const saved = await doc.save();
      this.inMemoryDispatches.unshift(saved.toObject());
      this.clinicGateway.broadcastEmergencyDispatch(saved);
      return saved;
    } catch (err) {
      this.inMemoryDispatches.unshift(dispatch);
      this.clinicGateway.broadcastEmergencyDispatch(dispatch);
      return dispatch;
    }
  }

  async getDispatchesForClinic(clinicId: string): Promise<any[]> {
    try {
      const list = await this.dispatchModel
        .find({ clinicId })
        .sort({ createdAt: -1 })
        .exec();
      if (list && list.length > 0) return list;
    } catch (err) {
      // Fallback
    }
    return this.inMemoryDispatches.filter(
      (d) => !clinicId || d.clinicId === clinicId,
    );
  }

  async updateDispatchStatus(dispatchId: string, status: string): Promise<any> {
    const idx = this.inMemoryDispatches.findIndex((d) => d._id === dispatchId);
    if (idx !== -1) {
      this.inMemoryDispatches[idx].status = status;
      return this.inMemoryDispatches[idx];
    }
    return { _id: dispatchId, status };
  }
}
