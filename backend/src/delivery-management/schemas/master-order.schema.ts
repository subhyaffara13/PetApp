import { Schema, Types } from 'mongoose';
import {
  IMasterOrder,
  IStoreOrder,
  IDeliveryDispatch,
  IOrderItem,
} from '../delivery.types';

export const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    isEmergencyItem: { type: Boolean, default: false },
  },
  { _id: false },
);

export const DeliveryDispatchSchema = new Schema<IDeliveryDispatch>(
  {
    provider: { type: String, enum: ['wolt_drive', 'none'], default: 'none' },
    externalTaskId: { type: String },
    trackingUrl: { type: String },
    courierName: { type: String },
    courierPhone: { type: String },
    courierVehicle: { type: String },
    pickupWindowStart: { type: Date },
    pickupWindowEnd: { type: Date },
    liveLocation: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
    lastSyncAt: { type: Date },
  },
  { _id: false },
);

export const StoreOrderSchema = new Schema<IStoreOrder>(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    status: {
      type: String,
      enum: [
        'created',
        'awaiting_store_acceptance',
        'store_preparing',
        'ready_for_pickup',
        'courier_assigned',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'failed',
      ],
      default: 'created',
    },
    deliveryMode: {
      type: String,
      enum: ['daas_on_demand', 'merchant_fleet', 'standard_postal'],
      required: true,
    },
    items: [OrderItemSchema],
    subtotalAmount: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    targetPrepMinutes: { type: Number },
    prepStartedAt: { type: Date },
    estimatedDeliveryTime: { type: Date },
    dispatchInfo: { type: DeliveryDispatchSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export const MasterOrderSchema = new Schema<IMasterOrder>(
  {
    customerId: { type: String, required: true, index: true },
    paymentIntentId: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'authorized',
    },
    totalAmount: { type: Number, required: true },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
      notes: { type: String },
    },
    deliveryLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    storeOrders: [StoreOrderSchema],
  },
  { timestamps: true },
);

MasterOrderSchema.index({ deliveryLocation: '2dsphere' });
MasterOrderSchema.index({ 'storeOrders.storeId': 1, 'storeOrders.status': 1 });
