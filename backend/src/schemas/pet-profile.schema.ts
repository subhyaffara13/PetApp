import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PetProfileDocument = PetProfile & Document;

@Schema({ timestamps: true })
export class MedicalEvent {
  @Prop({ required: true })
  date: string;

  @Prop({
    required: true,
    enum: [
      'vaccination',
      'checkup',
      'surgery',
      'illness',
      'medication',
      'other',
    ],
  })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop()
  vetName?: string;
}

export const MedicalEventSchema = SchemaFactory.createForClass(MedicalEvent);

@Schema({ _id: false })
export class CoParentMember {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  email?: string;

  @Prop({
    default: 'co_parent',
    enum: ['co_parent', 'family_member', 'caretaker'],
  })
  role: string;

  @Prop({ default: Date.now })
  addedAt: Date;
}

export const CoParentMemberSchema =
  SchemaFactory.createForClass(CoParentMember);

@Schema({ timestamps: true })
export class PetProfile {
  @Prop({ required: true, index: true })
  petId: string; // Unique Pet Passport ID (e.g. "PET-8942-A1")

  @Prop({ required: true, index: true })
  ownerId: string; // Primary Owner User ID

  @Prop()
  ownerName?: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    enum: ['dog', 'cat', 'bird', 'reptile', 'small_mammal', 'other'],
  })
  species: string;

  @Prop({ required: true })
  breed: string;

  @Prop({ required: true })
  age: number;

  @Prop()
  dateOfBirth?: string;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true, enum: ['male', 'female'] })
  gender: string;

  @Prop()
  photoUrl?: string;

  @Prop()
  microchipNumber?: string;

  @Prop()
  nfcTagId?: string;

  @Prop({ type: [CoParentMemberSchema], default: [] })
  coParents: CoParentMember[];

  @Prop({ type: [String], default: [] })
  knownConditions: string[];

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop({ type: [String], default: [] })
  medications: string[];

  @Prop({ type: [MedicalEventSchema], default: [] })
  medicalHistory: MedicalEvent[];

  @Prop({ default: false })
  isArchived: boolean;
}

export const PetProfileSchema = SchemaFactory.createForClass(PetProfile);
PetProfileSchema.index({ ownerId: 1, createdAt: -1 });
PetProfileSchema.index({ petId: 1 }, { unique: true, sparse: true });
PetProfileSchema.index({ 'coParents.userId': 1 });
