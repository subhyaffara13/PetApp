import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmergencyDispatchDocument = EmergencyDispatch & Document;

@Schema({ timestamps: true })
export class EmergencyDispatch {
  @Prop({ required: true })
  petId: string;

  @Prop({ required: true })
  petName: string;

  @Prop({ required: true })
  species: string;

  @Prop({ required: true })
  breed: string;

  @Prop()
  photoUrl?: string;

  @Prop({ required: true })
  ownerName: string;

  @Prop({ required: true })
  ownerPhone: string;

  @Prop({ required: true })
  clinicId: string;

  @Prop({ required: true, enum: ['critical', 'urgent', 'standard'], default: 'urgent' })
  urgency: string;

  @Prop({ required: true })
  symptoms: string;

  @Prop({ default: 15 })
  etaMinutes: number;

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop({ type: [String], default: [] })
  conditions: string[];

  @Prop({ type: [String], default: [] })
  medications: string[];

  @Prop({ required: true, enum: ['en_route', 'arrived', 'triaged', 'completed', 'cancelled'], default: 'en_route' })
  status: string;
}

export const EmergencyDispatchSchema = SchemaFactory.createForClass(EmergencyDispatch);
EmergencyDispatchSchema.index({ clinicId: 1, status: 1, createdAt: -1 });
EmergencyDispatchSchema.index({ petId: 1, createdAt: -1 });

// --- Rate-Limited Lost Pet SOS Broadcasts ---
export type LostPetAlertDocument = LostPetAlert & Document;

@Schema({ timestamps: true })
export class LostPetAlert {
  @Prop({ required: true, index: true })
  ownerId: string;

  @Prop({ required: true })
  ownerName: string;

  @Prop({ required: true })
  ownerPhone: string;

  @Prop({ required: true, index: true })
  petId: string;

  @Prop({ required: true })
  petName: string;

  @Prop({ required: true })
  petBreed: string;

  @Prop({ default: '' })
  petAvatar: string;

  @Prop({ required: true })
  lastSeenLocation: string;

  @Prop({ type: { lat: Number, lon: Number }, required: true })
  lastSeenCoordinates: { lat: number; lon: number };

  @Prop({ default: '' })
  rewardText?: string;

  @Prop({ required: true, enum: ['active', 'resolved'], default: 'active' })
  status: string;

  @Prop()
  resolvedAt?: Date;
}

export const LostPetAlertSchema = SchemaFactory.createForClass(LostPetAlert);
LostPetAlertSchema.index({ status: 1, createdAt: -1 });
LostPetAlertSchema.index({ petId: 1, status: 1, createdAt: -1 });
