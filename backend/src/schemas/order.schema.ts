import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  priceAtPurchase: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'PetShop', required: true })
  shopId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true })
  serviceFee: number;

  @Prop({ required: true })
  total: number;

  @Prop()
  customerId?: string;

  @Prop({
    default: 'pending',
    enum: [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'delivered',
      'cancelled',
    ],
  })
  status: string;

  @Prop()
  stripePaymentIntentId?: string;

  @Prop({
    default: 'pending',
    enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
  })
  paymentStatus: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ shopId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
