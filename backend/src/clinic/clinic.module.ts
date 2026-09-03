import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClinicController } from './clinic.controller';
import { ClinicService } from './clinic.service';
import { ClinicGateway } from './clinic.gateway';
import { Clinic, ClinicSchema } from '../schemas/clinic.schema';
import {
  MedicalRecord,
  MedicalRecordSchema,
} from '../schemas/medical-record.schema';
import {
  EmergencyDispatch,
  EmergencyDispatchSchema,
} from '../schemas/emergency-dispatch.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Clinic.name, schema: ClinicSchema },
      { name: MedicalRecord.name, schema: MedicalRecordSchema },
      { name: EmergencyDispatch.name, schema: EmergencyDispatchSchema },
    ]),
  ],
  controllers: [ClinicController],
  providers: [ClinicService, ClinicGateway],
  exports: [ClinicService, ClinicGateway],
})
export class ClinicModule {}
