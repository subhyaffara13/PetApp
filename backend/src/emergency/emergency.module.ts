import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { EmergencyController } from './emergency.controller';
import { EmergencyService } from './emergency.service';
import { LostPetAlert, LostPetAlertSchema } from '../schemas/emergency-dispatch.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: LostPetAlert.name, schema: LostPetAlertSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [EmergencyController],
  providers: [EmergencyService],
  exports: [EmergencyService],
})
export class EmergencyModule {}