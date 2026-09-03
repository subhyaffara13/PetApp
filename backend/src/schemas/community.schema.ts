import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoryDocument = Story & Document;

@Schema({ timestamps: true })
export class Story {
  @Prop({ default: 'current-user' })
  authorId: string;

  @Prop({ default: 'Pet Parent' })
  authorName: string;

  @Prop({ default: '' })
  authorAvatar: string;

  @Prop({ default: 'none', enum: ['none', 'vet', 'merchant'] })
  authorBadge: string;

  @Prop({ default: 'customer' })
  authorRole: string;

  @Prop({ default: '' })
  petId: string;

  @Prop({ required: true })
  petName: string;

  @Prop({ required: true })
  petAvatar: string;

  @Prop({ required: true })
  mediaUrl: string;

  @Prop({ default: '' })
  caption: string;

  @Prop({
    required: true,
    enum: [
      'moment',
      'lost_pet_sos',
      'hazard_alert',
      'playdate',
      'vet_tip',
      'store_promo',
    ],
    default: 'moment',
  })
  type: string;

  @Prop()
  locationName?: string;

  @Prop()
  contactPhone?: string;

  @Prop({ default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) })
  expiresAt: Date;
}

export const StorySchema = SchemaFactory.createForClass(Story);
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  authorId: string;

  @Prop({ default: 'Pet Parent' })
  authorName: string;

  @Prop({ default: '' })
  authorAvatar: string;

  @Prop({ default: 'none', enum: ['none', 'vet', 'merchant'] })
  authorBadge: string;

  @Prop({ default: 'customer' })
  authorRole: string;

  @Prop({ default: '' })
  petId: string;

  @Prop({ required: true })
  petName: string;

  @Prop({ required: true })
  petBreed: string;

  @Prop({ required: true })
  petAvatar: string;

  @Prop({ required: true })
  mediaUrl: string;

  @Prop({ default: '' })
  caption: string;

  @Prop({ default: '' })
  locationTag: string;

  @Prop({
    required: true,
    enum: [
      'cute',
      'playdate',
      'lost_found',
      'health_tip',
      'adoption',
      'vet_update',
      'promo',
    ],
    default: 'cute',
  })
  category: string;

  @Prop({ default: '' })
  contactPhone?: string;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ type: [String], default: [] })
  likedBy: string[];

  @Prop({ type: [String], default: [] })
  likedUserIds: string[];

  @Prop({ type: Array, default: [] })
  comments: any[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ createdAt: -1 });
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ category: 1, createdAt: -1 });

// --- End-to-End Encrypted (E2EE) Direct Message ---
export type DirectMessageDocument = DirectMessage & Document;

@Schema({ timestamps: true })
export class DirectMessage {
  @Prop({ required: true, index: true })
  conversationId: string;

  @Prop({ required: true, index: true })
  senderId: string;

  @Prop({ required: true, index: true })
  recipientId: string;

  @Prop({ default: 'Pet Parent' })
  senderName: string;

  @Prop({ default: '' })
  senderAvatar: string;

  @Prop({ default: 'Pet Parent' })
  recipientName: string;

  @Prop({ default: '' })
  recipientAvatar: string;

  @Prop({ required: true })
  encryptedPayload: string;

  @Prop({ required: true })
  iv: string;

  @Prop({ default: '' })
  mediaUrl?: string;

  @Prop({ default: false })
  isRead: boolean;
}

export const DirectMessageSchema = SchemaFactory.createForClass(DirectMessage);
DirectMessageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
DirectMessageSchema.index({ conversationId: 1, createdAt: 1 });

// --- Community Safety & Harassment Reports ---
export type CommunityReportDocument = CommunityReport & Document;

@Schema({ timestamps: true })
export class CommunityReport {
  @Prop({ required: true, index: true })
  reporterId: string;

  @Prop({ default: '' })
  reporterName: string;

  @Prop({ required: true, index: true })
  reportedUserId: string;

  @Prop({ default: '' })
  reportedUserName: string;

  @Prop({
    required: true,
    enum: ['harassment', 'spam', 'scam', 'inappropriate_content', 'other'],
  })
  reason: string;

  @Prop({ default: '' })
  details: string;

  /** Decrypted chat logs attached by reporter at submission time */
  @Prop({ default: '' })
  chatTranscriptSnippet: string;

  @Prop({
    default: 'pending',
    enum: ['pending', 'reviewed', 'action_taken', 'dismissed'],
  })
  status: string;
}

export const CommunityReportSchema =
  SchemaFactory.createForClass(CommunityReport);
CommunityReportSchema.index({ status: 1, createdAt: -1 });
