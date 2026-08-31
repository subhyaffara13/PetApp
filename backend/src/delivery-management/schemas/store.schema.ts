import { Schema, Document } from 'mongoose';
import { IStore } from '../delivery.types';

export const StoreSchema = new Schema<IStore>(
  {
    name: { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: (coords: number[]) =>
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90,
          message: 'Coordinates must be valid [lon, lat]',
        },
      },
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
      notes: { type: String },
    },
    supportedDeliveryModes: {
      type: [String],
      enum: ['daas_on_demand', 'merchant_fleet', 'standard_postal'],
      default: ['daas_on_demand'],
    },
    daasProvider: {
      type: String,
      enum: ['wolt_drive', 'none'],
      default: 'wolt_drive',
    },
    daasStoreId: { type: String },
    avgPrepTimeMinutes: { type: Number, default: 15 },
    isActive: { type: Boolean, default: true },
    isBusyMode: { type: Boolean, default: false },
    isClaimed: { type: Boolean, default: false },
    contactPhone: { type: String, required: true },
  },
  { timestamps: true }
);

StoreSchema.index({ location: '2dsphere' });
