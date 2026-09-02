import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GroomingAppointmentDocument = GroomingAppointment & Document;
export type GroomingServiceItemDocument = GroomingServiceItem & Document;

@Schema({ timestamps: true })
export class GroomingServiceItem {
  @Prop({ required: true })
  groomerId: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    enum: ['bath_brush', 'full_groom', 'hygiene', 'specialty', 'teeth_ears'],
    default: 'full_groom',
  })
  category: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 45 })
  durationMinutes: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: true })
  isAvailable: boolean;
}

export const GroomingServiceItemSchema = SchemaFactory.createForClass(GroomingServiceItem);

@Schema({ timestamps: true })
export class GroomingAppointment {
  @Prop({ required: true, index: true })
  groomerId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ default: '' })
  customerPhone: string;

  @Prop({ required: true })
  petId: string;

  @Prop({ required: true })
  petName: string;

  @Prop({ required: true })
  petBreed: string;

  @Prop({ type: [Object], default: [] })
  services: Array<{ name: string; price: number; durationMinutes?: number }>;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({
    default: 'confirmed',
    enum: ['confirmed', 'in_tub', 'styling', 'ready', 'completed', 'cancelled'],
    index: true,
  })
  status: string;

  @Prop({ required: true })
  appointmentDate: string; // YYYY-MM-DD

  @Prop({ required: true })
  timeSlot: string; // e.g. "10:30 AM"

  @Prop({ default: '' })
  coatConditionNotes: string;

  @Prop()
  beforePhotoUrl?: string;

  @Prop()
  afterPhotoUrl?: string;

  @Prop()
  receiptId?: string;

  @Prop({ default: 'pending', enum: ['pending', 'paid', 'refunded'] })
  paymentStatus: string;
}

export const GroomingAppointmentSchema = SchemaFactory.createForClass(GroomingAppointment);
GroomingAppointmentSchema.index({ groomerId: 1, appointmentDate: 1 });
GroomingAppointmentSchema.index({ userId: 1, createdAt: -1 });
