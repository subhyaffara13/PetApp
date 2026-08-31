import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminUserDocument = AdminUser & Document;

@Schema({ timestamps: true })
export class AdminUser {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, enum: ['customer', 'clinic_admin', 'store_merchant'] })
  role: string;

  @Prop({ required: true, default: 'active', enum: ['active', 'blocked', 'archived'] })
  status: string;

  @Prop()
  lastActive?: string;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);

export type AdminClaimDocument = AdminClaim & Document;

@Schema({ timestamps: true })
export class AdminClaim {
  @Prop({ required: true, enum: ['clinic', 'store', 'shelter', 'sitter'] })
  entityType: string;

  @Prop({ default: '' })
  userId?: string;

  @Prop({ enum: ['stationary_clinic', 'mobile_vet', 'none'], default: 'none' })
  practiceType?: 'stationary_clinic' | 'mobile_vet' | 'none';

  @Prop({ required: true })
  entityName: string;

  @Prop({ required: true })
  entityAddress: string;

  @Prop({ required: true })
  contactName: string;

  @Prop({ required: true })
  contactPhone: string;

  @Prop({ required: true })
  businessLicense: string;

  @Prop({ required: true, default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: string;
}

export const AdminClaimSchema = SchemaFactory.createForClass(AdminClaim);

export type AdminLogDocument = AdminLog & Document;

@Schema({ timestamps: true })
export class AdminLog {
  @Prop({ required: true, enum: ['info', 'warn', 'error'] })
  level: string;

  @Prop({ required: true })
  service: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  userReported?: boolean;
}

export const AdminLogSchema = SchemaFactory.createForClass(AdminLog);
