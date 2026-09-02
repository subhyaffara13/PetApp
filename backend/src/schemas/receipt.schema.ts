import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReceiptDocument = Receipt & Document;

@Schema({ _id: false })
export class ReceiptItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true })
  lineTotal: number;

  @Prop()
  description?: string;
}

export const ReceiptItemSchema = SchemaFactory.createForClass(ReceiptItem);

@Schema({ _id: false })
export class PaymentMethodInfo {
  @Prop({ default: 'stripe', enum: ['stripe', 'wolt_pay', 'apple_pay', 'google_pay', 'cash'] })
  type: string;

  @Prop()
  cardBrand?: string;

  @Prop()
  last4?: string;

  @Prop()
  transactionId?: string;
}

export const PaymentMethodInfoSchema = SchemaFactory.createForClass(PaymentMethodInfo);

@Schema({ timestamps: true })
export class Receipt {
  @Prop({ required: true, unique: true, index: true })
  receiptNumber: string; // e.g. "REC-2026-89412"

  @Prop({ required: true, index: true })
  userId: string; // Customer User ID

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true, index: true })
  customerEmail: string;

  @Prop()
  orderId?: string;

  @Prop({
    required: true,
    enum: ['marketplace', 'grooming', 'telehealth', 'service', 'emergency_deposit'],
    default: 'marketplace',
  })
  type: string;

  @Prop({ required: true })
  providerName: string; // Store / Salon / Clinic name

  @Prop()
  providerAddress?: string;

  @Prop({ type: [ReceiptItemSchema], required: true })
  items: ReceiptItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0.17 })
  taxRate: number; // 17% VAT

  @Prop({ required: true, default: 0 })
  taxAmount: number;

  @Prop({ default: 0 })
  deliveryFee: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ required: true })
  total: number;

  @Prop({ default: 'ILS' })
  currency: string;

  @Prop({ type: PaymentMethodInfoSchema, default: () => ({ type: 'stripe' }) })
  paymentMethod: PaymentMethodInfo;

  @Prop({ default: 'paid', enum: ['paid', 'refunded'] })
  paymentStatus: string;

  @Prop({ default: Date.now })
  paidAt: Date;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
ReceiptSchema.index({ userId: 1, createdAt: -1 });
ReceiptSchema.index({ customerEmail: 1, createdAt: -1 });
