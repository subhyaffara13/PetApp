import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PetShopDocument = PetShop & Document;

@Schema({ timestamps: true })
export class PetShop {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, type: { lat: Number, lng: Number } })
  location: { lat: number; lng: number };

  @Prop()
  phone?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  rating?: number;

  @Prop({ default: false })
  isRegistered: boolean;

  @Prop({ default: false })
  deliveryAvailable: boolean;

  @Prop({ default: false })
  pickupOnly: boolean;

  @Prop()
  imageUrl?: string;
}

export const PetShopSchema = SchemaFactory.createForClass(PetShop);
