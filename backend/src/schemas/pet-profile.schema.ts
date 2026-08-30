import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PetProfileDocument = PetProfile & Document;

@Schema({ timestamps: true })
export class MedicalEvent {
  @Prop({ required: true })
  date: string;

  @Prop({ required: true, enum: ['vaccination', 'checkup', 'surgery', 'illness', 'medication', 'other'] })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop()
  vetName?: string;
}

export const MedicalEventSchema = SchemaFactory.createForClass(MedicalEvent);

@Schema({ timestamps: true })
export class PetProfile {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['dog', 'cat', 'bird', 'reptile', 'small_mammal', 'other'] })
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
