import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export type UserRole =
  | 'customer'
  | 'clinic_admin'
  | 'store_merchant'
  | 'shelter_org'
  | 'pet_sitter'
  | 'superadmin';
export type VerificationBadge =
  | 'none'
  | 'veterinarian'
  | 'pet_store'
  | 'animal_shelter'
  | 'pet_sitter'
  | 'platform_admin';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    enum: [
      'customer',
      'clinic_admin',
      'store_merchant',
      'shelter_org',
      'pet_sitter',
      'superadmin',
    ],
    default: 'customer',
  })
  role: UserRole;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({
    enum: [
      'none',
      'veterinarian',
      'pet_store',
      'animal_shelter',
      'pet_sitter',
      'platform_admin',
    ],
    default: 'none',
  })
  verificationBadge: VerificationBadge;

  @Prop({ default: '' })
  organizationName?: string;

  @Prop({ default: '' })
  licenseNumber?: string;

  @Prop({ enum: ['stationary_clinic', 'mobile_vet', 'none'], default: 'none' })
  practiceType?: 'stationary_clinic' | 'mobile_vet' | 'none';

  @Prop({
    type: {
      lat: Number,
      lng: Number,
      heading: Number,
      speed: Number,
      updatedAt: Date,
      isActive: Boolean,
    },
    default: null,
  })
  liveLocation?: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    updatedAt?: Date;
    isActive?: boolean;
  } | null;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  handle: string;

  @Prop({ type: [String], default: [] })
  followers: string[];

  @Prop({ type: [String], default: [] })
  following: string[];

  @Prop({ type: [String], default: [] })
  petBreeds: string[];

  @Prop({ type: [String], default: [] })
  likedCategories: string[];

  @Prop({ type: { lat: Number, lon: Number }, default: null })
  locationCoordinates?: { lat: number; lon: number } | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, default: null })
  refreshTokenHash: string | null;

  @Prop({ type: String, default: null })
  resetPasswordTokenHash: string | null;

  @Prop({ type: Date, default: null })
  resetPasswordExpires: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ handle: 1 }, { sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ name: 'text', handle: 'text', email: 'text' });
