import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdoptablePetDocument = AdoptablePet & Document;

@Schema({ timestamps: true })
export class AdoptablePet {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['dog', 'cat', 'other'], default: 'dog' })
  species: string;

  @Prop({ required: true })
  breed: string;

  @Prop({ required: true })
  age: string;

  @Prop({ required: true, enum: ['male', 'female'] })
  gender: string;

  @Prop({ required: true })
  avatar: string;

  @Prop({ required: true })
  shelterId: string;

  @Prop({ required: true })
  shelterName: string;

  @Prop({ required: true })
  shelterPhone: string;

  @Prop({ default: '' })
  locationCity: string;

  @Prop({ default: '' })
  story: string;

  @Prop({ default: true })
  isVaccinated: boolean;

  @Prop({ default: true })
  isNeutered: boolean;

  @Prop({ default: true })
  goodWithKids: boolean;

  @Prop({
    required: true,
    enum: ['available', 'pending', 'adopted'],
    default: 'available',
  })
  status: string;
}

export const AdoptablePetSchema = SchemaFactory.createForClass(AdoptablePet);
