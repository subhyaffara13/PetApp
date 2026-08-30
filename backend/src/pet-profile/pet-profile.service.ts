import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PetProfile, PetProfileDocument } from '../schemas/pet-profile.schema';

const INITIAL_PETS: any[] = [
  {
    name: 'Rocky',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    dateOfBirth: '2023-05-15',
    weight: 31.5,
    gender: 'male',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop&q=80',
    knownConditions: ['Mild hip dysplasia'],
    allergies: ['Penicillin'],
    medications: ['Glucosamine supplement (daily)'],
    medicalHistory: [
      {
        id: 'hist-1',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'illness',
        title: 'Mild Chocolate Toxicity (Resolved)',
        description: 'Treated at Haifa ER with emesis and activated charcoal. Fully recovered.',
        vetName: 'Noam Ben-Ari',
      },
      {
        id: 'hist-2',
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'vaccination',
        title: 'Annual Rabies & DHPP Booster',
        description: 'Vaccines up to date. Next booster due in 11 months.',
        vetName: 'Sarah Cohen',
      }
    ],
  },
  {
    name: 'Garfield',
    species: 'cat',
    breed: 'British Shorthair',
    age: 2,
    dateOfBirth: '2024-06-10',
    weight: 4.8,
    gender: 'male',
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80',
    knownConditions: [],
    allergies: ['Dust mites'],
    medications: [],
    medicalHistory: [
      {
        id: 'hist-3',
        date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'checkup',
        title: 'Routine Health Checkup',
        description: 'Teeth and coat in excellent condition. Weight optimal.',
        vetName: 'Sarah Cohen',
      }
    ],
  },
];

@Injectable()
export class PetProfileService implements OnModuleInit {
  private readonly logger = new Logger(PetProfileService.name);
  private inMemoryStore: any[] = [...INITIAL_PETS];

  constructor(
    @InjectModel(PetProfile.name) private petProfileModel: Model<PetProfileDocument>,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.petProfileModel.countDocuments();
      if (count === 0) {
        this.logger.log('Seeding initial Pet Profiles & EMR Medical Records to MongoDB Atlas...');
        for (const p of INITIAL_PETS) {
          await this.petProfileModel.create(p);
        }
        this.logger.log('Pet Profiles seeded successfully.');
      }
    } catch (err: any) {
      this.logger.warn('Pet Profile seeding notice:', err?.message);
    }
  }

  async findAll(): Promise<any[]> {
    try {
      const pets = await this.petProfileModel.find().sort({ createdAt: -1 }).exec();
      if (pets && pets.length > 0) return pets;
    } catch (err) {
      this.logger.warn('MongoDB query failed, serving from in-memory pet store');
    }
    return this.inMemoryStore;
  }

  async findOne(id: string): Promise<any> {
    try {
      const pet = await this.petProfileModel.findById(id).exec();
      if (pet) return pet;
    } catch (err) {
      // Fallback
    }

    const localPet = this.inMemoryStore.find((p) => p._id === id);
    if (!localPet) throw new NotFoundException(`Pet profile ${id} not found`);
    return localPet;
  }

  async create(data: any): Promise<any> {
    const newPet = {
      _id: `pet-${Date.now()}`,
      name: data.name,
      species: data.species,
      breed: data.breed,
      age: data.age,
      weight: data.weight,
      gender: data.gender,
      photoUrl: data.photoUrl || undefined,
      knownConditions: data.knownConditions || [],
      allergies: data.allergies || [],
      medications: data.medications || [],
      medicalHistory: data.medicalHistory || [],
      createdAt: new Date().toISOString(),
    };

    try {
      const created = new this.petProfileModel(data);
      const saved = await created.save();
      this.inMemoryStore.unshift(saved.toObject());
      return saved;
    } catch (err) {
      this.logger.warn('MongoDB save failed, saving pet to in-memory store');
      this.inMemoryStore.unshift(newPet);
      return newPet;
    }
  }

  async update(id: string, data: any): Promise<any> {
    try {
      const updated = await this.petProfileModel
        .findByIdAndUpdate(id, data, { new: true })
        .exec();
      if (updated) return updated;
    } catch (err) {
      // Fallback
    }

    const idx = this.inMemoryStore.findIndex((p) => p._id === id);
    if (idx === -1) throw new NotFoundException(`Pet profile ${id} not found`);
    this.inMemoryStore[idx] = { ...this.inMemoryStore[idx], ...data };
    return this.inMemoryStore[idx];
  }

  async search(query: string): Promise<any[]> {
    const q = (query || '').toLowerCase().trim();
    if (!q) return this.findAll();

    try {
      const dbResults = await this.petProfileModel
        .find({
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { breed: { $regex: q, $options: 'i' } },
            { _id: q },
          ],
        })
        .exec();
      if (dbResults && dbResults.length > 0) return dbResults;
    } catch {
      // Fallback
    }

    return this.inMemoryStore.filter((pet) => {
      const matchName = pet.name?.toLowerCase().includes(q);
      const matchBreed = pet.breed?.toLowerCase().includes(q);
      const matchId = pet._id?.toLowerCase().includes(q);
      const matchHistory = pet.medicalHistory?.some((h: any) =>
        h.description?.toLowerCase().includes(q) || h.title?.toLowerCase().includes(q)
      );
      return matchName || matchBreed || matchId || matchHistory;
    });
  }

  async addMedicalEvent(petId: string, event: any): Promise<any> {
    const newEvent = {
      id: `hist-${Date.now()}`,
      date: event.date || new Date().toISOString(),
      type: event.type || 'checkup',
      title: event.title || 'Clinical Consultation & Invoice',
      description: event.description || '',
      vetName: event.vetName || 'Attending ER Vet',
    };

    try {
      const doc = await this.petProfileModel.findById(petId);
      if (doc) {
        doc.medicalHistory.unshift(newEvent as any);
        await doc.save();
        return doc;
      }
    } catch {
      // Fallback
    }

    const idx = this.inMemoryStore.findIndex((p) => p._id === petId);
    if (idx === -1) throw new NotFoundException(`Pet profile ${petId} not found`);
    
    if (!this.inMemoryStore[idx].medicalHistory) {
      this.inMemoryStore[idx].medicalHistory = [];
    }
    this.inMemoryStore[idx].medicalHistory.unshift(newEvent);
    return this.inMemoryStore[idx];
  }

  async parseMedicalDocument(fileData?: string, mimeType?: string, fileName?: string): Promise<any> {
    // Upload/acknowledge a digitized medical document without fabricating its contents.
    // True OCR extraction is a paid/service integration that has not been provisioned yet,
    // so we explicitly signal that manual review/entry is required rather than inventing
    // clinic names, diagnoses, charges or vaccines from nothing.
    const fileType = mimeType?.includes('pdf') || fileName?.endsWith('.pdf')
      ? 'pdf'
      : (mimeType?.includes('image') || fileName?.match(/\.(png|jpe?g|webp)$/i) ? 'image' : 'text');

    return {
      accepted: true,
      requiresManualEntry: true,
      note: 'Automatic OCR extraction is not yet configured. Please review the document and enter the medical details manually.',
      date: new Date().toISOString(),
      detectedPetNames: [],
      itemizedCharges: [],
      treatments: [],
      prescriptions: [],
      vaccinations: [],
      diagnosis: '',
      clinicName: '',
      vetName: '',
      billedTotal: '',
      fileType,
      fileData: fileData || undefined,
      fileName: fileName || 'Document',
    };
  }

  async remove(id: string): Promise<void> {
    try {
      await this.petProfileModel.findByIdAndDelete(id).exec();
    } catch (err) {
      // Fallback
    }
    this.inMemoryStore = this.inMemoryStore.filter((p) => p._id !== id);
  }
}
