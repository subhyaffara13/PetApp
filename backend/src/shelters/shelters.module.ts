import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { SheltersController } from './shelters.controller';
import { SheltersService } from './shelters.service';
import {
  AdoptablePet,
  AdoptablePetSchema,
} from '../schemas/adoptable-pet.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: AdoptablePet.name, schema: AdoptablePetSchema },
    ]),
  ],
  controllers: [SheltersController],
  providers: [SheltersService],
  exports: [SheltersService],
})
export class SheltersModule {}
