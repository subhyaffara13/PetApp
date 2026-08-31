import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClinicDocument = Clinic & Document;

@Schema({ timestamps: true })
export class Clinic {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, type: { lat: Number, lng: Number } })
  location: { lat: number; lng: number };

  @Prop()
  phone?: string;

  @Prop()
  openingHours?: string;

  @Prop({ default: 'accepting', enum: ['accepting', 'limited', 'at_capacity'] })
  capacityStatus: string;

  @Prop({ default: '' })
  authToken: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ClinicSchema = SchemaFactory.createForClass(Clinic);
