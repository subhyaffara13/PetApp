import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { Appointment, AppointmentSchema } from '../schemas/appointment.schema';
import { Reminder, ReminderSchema } from '../schemas/reminder.schema';
import { PetProfile, PetProfileSchema } from '../schemas/pet-profile.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Reminder.name, schema: ReminderSchema },
      { name: PetProfile.name, schema: PetProfileSchema },
    ]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
