import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoreProductDocument = StoreProduct & Document;

@Schema({ timestamps: true })
export class StoreProduct {
  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 'general' })
  category: string;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ default: true })
  inStock: boolean;

  @Prop()
  imageUrl?: string;
}

export const StoreProductSchema = SchemaFactory.createForClass(StoreProduct);
