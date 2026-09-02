import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ required: true, index: true })
  petId: string;

  @Prop()
  petPassportId: string;

  @Prop({ required: true })
  petName: string;

  @Prop({ default: 'dog' })
  petSpecies: string;

  @Prop({ default: '#f97316' })
  petColor: string;

  @Prop({ required: true, index: true })
  ownerId: string;

  @Prop({ type: [String], default: [] })
  coParentIds: string[];

  @Prop({
    required: true,
    enum: ['veterinarian', 'groomer', 'dog_walker', 'pet_sitter', 'clinic'],
    default: 'veterinarian',
  })
  providerType: string;

  @Prop({ required: true })
  providerId: string;

  @Prop({ required: true })
  providerName: string;

  @Prop()
  providerAvatar?: string;

  @Prop()
  providerPhone?: string;

  @Prop({ required: true })
  serviceName: string;

  @Prop()
  serviceCategory?: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ required: true, index: true })
  appointmentDate: string; // YYYY-MM-DD

  @Prop({ required: true })
  timeSlot: string; // e.g. "10:30 AM"

  @Prop()
  ownerName?: string;

  @Prop()
  ownerPhone?: string;

  @Prop()
  notes?: string;

  @Prop({
    enum: ['confirmed', 'pending', 'completed', 'cancelled'],
    default: 'confirmed',
  })
  status: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
