import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroomingService } from './grooming.service';
import { GroomingController } from './grooming.controller';
import {
  GroomingAppointment,
  GroomingAppointmentSchema,
  GroomingServiceItem,
  GroomingServiceItemSchema,
} from '../schemas/grooming.schema';
import { ReceiptsModule } from '../receipts/receipts.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GroomingAppointment.name, schema: GroomingAppointmentSchema },
      { name: GroomingServiceItem.name, schema: GroomingServiceItemSchema },
    ]),
    ReceiptsModule,
    AuthModule,
  ],
  controllers: [GroomingController],
  providers: [GroomingService],
  exports: [GroomingService],
})
export class GroomingModule {}
