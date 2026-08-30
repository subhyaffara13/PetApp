import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PetProfileController } from './pet-profile.controller';
import { PetProfileService } from './pet-profile.service';
import { PetProfile, PetProfileSchema } from '../schemas/pet-profile.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PetProfile.name, schema: PetProfileSchema }]),
    AuthModule,
  ],
  controllers: [PetProfileController],
  providers: [PetProfileService],
  exports: [PetProfileService],
})
export class PetProfileModule {}
