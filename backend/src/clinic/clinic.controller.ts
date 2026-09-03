import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Headers,
  Query,
} from '@nestjs/common';
import { ClinicService } from './clinic.service';

class UpdateCapacityDto {
  capacityStatus: 'accepting' | 'limited' | 'at_capacity';
}

@Controller('clinic')
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Get()
  async findAll() {
    return this.clinicService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clinicService.findOne(id);
  }

  @Patch(':id/status')
  async updateCapacity(
    @Param('id') id: string,
    @Body() dto: UpdateCapacityDto,
    @Headers('x-clinic-token') token?: string,
  ) {
    await this.clinicService.verifyClinicToken(id, token);
    return this.clinicService.updateCapacity(id, dto.capacityStatus);
  }

  // --- Medical Records Endpoints ---
  @Get('records/all')
  async getAllRecords() {
    return this.clinicService.getAllRecords();
  }

  @Get('records/pet/:petId')
  async getRecordsForPet(@Param('petId') petId: string) {
    return this.clinicService.getRecordsForPet(petId);
  }

  @Post('records')
  async createMedicalRecord(@Body() data: any) {
    return this.clinicService.createMedicalRecord(data);
  }

  // --- Emergency Dispatch (Pre-arrival SOS) ---
  @Post('dispatch')
  async createEmergencyDispatch(@Body() data: any) {
    return this.clinicService.createDispatch(data);
  }

  @Get(':id/dispatches')
  async getDispatches(@Param('id') clinicId: string) {
    return this.clinicService.getDispatchesForClinic(clinicId);
  }

  @Patch('dispatch/:dispatchId/status')
  async updateDispatchStatus(
    @Param('dispatchId') dispatchId: string,
    @Body() body: { status: string },
  ) {
    return this.clinicService.updateDispatchStatus(dispatchId, body.status);
  }
}
