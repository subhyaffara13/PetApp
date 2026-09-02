import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CoParentRequestDocument = CoParentRequest & Document;

@Schema({ timestamps: true })
export class CoParentRequest {
  @Prop({ required: true, index: true })
  petId: string; // Mongo ObjectId or internal pet ID

  @Prop({ required: true })
  petPassportId: string; // Human-readable Unique Pet ID (e.g. "PET-8942-A1")

  @Prop({ required: true })
  petName: string;

  @Prop({ required: true, index: true })
  fromUserId: string;

  @Prop({ required: true })
  fromUserName: string;

  @Prop({ required: true })
  fromUserEmail: string;

  @Prop({ required: true, index: true })
  toUserId: string;

  @Prop({ required: true })
  toUserName: string;

  @Prop({ required: true })
  toUserEmail: string;

  @Prop({ default: 'co_parent', enum: ['co_parent', 'family_member', 'caretaker'] })
  role: string;

  @Prop({
    default: 'pending',
    enum: ['pending', 'accepted', 'declined', 'expired'],
    index: true,
  })
  status: string;

  @Prop({ required: true, index: true })
  expiresAt: Date; // 24 hours from creation
}

export const CoParentRequestSchema = SchemaFactory.createForClass(CoParentRequest);
CoParentRequestSchema.index({ toUserId: 1, status: 1, expiresAt: 1 });
CoParentRequestSchema.index({ fromUserId: 1, createdAt: -1 });
