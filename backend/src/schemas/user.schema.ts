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

  @Prop({ type: [String], default: [] })
  bookmarkedPostIds: string[];

  @Prop({ type: [String], default: [] })
  likedPostIds: string[];

  @Prop({ type: [String], default: [] })
  interestedCategories: string[];

  @Prop({ type: [String], default: [] })
  blockedUserIds: string[];

  @Prop({ default: '' })
  neighborhood?: string;

  @Prop({ type: [String], default: [] })
  activePetIds: string[];

  // --- Archived Pets & Memorial Records ---
  @Prop({
    type: [
      {
        petId: { type: String, required: true },
        name: { type: String, required: true },
        species: { type: String, required: true },
        breed: { type: String, required: true },
        photoUrl: { type: String, default: '' },
        reason: {
          type: String,
          enum: ['passed', 'rehomed', 'inactive', 'other'],
          default: 'inactive',
        },
        archivedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  archivedPets: {
    petId: string;
    name: string;
    species: string;
    breed: string;
    photoUrl?: string;
    reason: 'passed' | 'rehomed' | 'inactive' | 'other';
    archivedAt: Date;
  }[];

  // --- Past Purchases & Order Snapshots ---
  @Prop({
    type: [
      {
        orderId: { type: String, required: true },
        orderNumber: { type: String, required: true },
        shopId: { type: String, required: true },
        shopName: { type: String, default: 'Local Pet Partner' },
        totalAmount: { type: Number, required: true },
        itemsCount: { type: Number, default: 1 },
        status: { type: String, default: 'completed' },
        purchasedAt: { type: Date, default: Date.now },
        receiptUrl: { type: String, default: '' },
      },
    ],
    default: [],
  })
  pastPurchases: {
    orderId: string;
    orderNumber: string;
    shopId: string;
    shopName: string;
    totalAmount: number;
    itemsCount: number;
    status: string;
    purchasedAt: Date;
    receiptUrl?: string;
  }[];

  // --- Personal Pet AI Memory & Learned Context ---
  @Prop({
    type: {
      preferences: { type: [String], default: [] },
      dietaryRestrictions: { type: [String], default: [] },
      behavioralNotes: { type: [String], default: [] },
      healthSummary: { type: String, default: '' },
      interactionFacts: { type: Object, default: {} },
    },
    default: () => ({
      preferences: [],
      dietaryRestrictions: [],
      behavioralNotes: [],
      healthSummary: '',
      interactionFacts: {},
    }),
  })
  aiMemory: {
    preferences: string[];
    dietaryRestrictions: string[];
    behavioralNotes: string[];
    healthSummary: string;
    interactionFacts: Record<string, any>;
  };

  // --- Past AI Conversations & Multi-turn History ---
  @Prop({
    type: [
      {
        sessionId: { type: String, required: true },
        title: { type: String, default: 'Pet Care Consultation' },
        petId: { type: String, default: '' },
        messages: [
          {
            role: { type: String, required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            urgencyLevel: { type: String, default: 'routine' },
          },
        ],
        summary: { type: String, default: '' },
        lastActiveAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  aiChatSessions: {
    sessionId: string;
    title: string;
    petId?: string;
    messages: {
      role: string;
      content: string;
      timestamp: Date;
      urgencyLevel?: string;
    }[];
    summary?: string;
    lastActiveAt: Date;
  }[];

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
UserSchema.index({ 'aiChatSessions.sessionId': 1 });
UserSchema.index({ 'pastPurchases.orderId': 1 });
