import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export type UserRole = 'customer' | 'clinic_admin' | 'store_merchant' | 'superadmin';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ enum: ['customer', 'clinic_admin', 'store_merchant', 'superadmin'], default: 'customer' })
  role: UserRole;

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
