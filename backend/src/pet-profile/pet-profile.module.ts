import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PetProfileController } from './pet-profile.controller';
import { PetProfileService } from './pet-profile.service';
import { PetProfile, PetProfileSchema } from '../schemas/pet-profile.schema';
import {
  CoParentRequest,
  CoParentRequestSchema,
} from '../schemas/co-parent-request.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PetProfile.name, schema: PetProfileSchema },
      { name: CoParentRequest.name, schema: CoParentRequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    EmailModule,
  ],
  controllers: [PetProfileController],
  providers: [PetProfileService],
  exports: [PetProfileService],
})
export class PetProfileModule {}
