import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  imageUrl?: string;

  @Prop({ default: 'general' })
  category: string;

  @Prop({ default: true })
  inStock: boolean;

  @Prop({ type: Types.ObjectId, ref: 'PetShop', required: true })
  shopId: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ shopId: 1, inStock: 1 });
ProductSchema.index({ category: 1, inStock: 1 });
