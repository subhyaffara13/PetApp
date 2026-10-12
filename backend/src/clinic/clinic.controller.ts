import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Headers,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

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

  // --- Medical Records Endpoints (Protected) ---
  @Get('records/all')
  @UseGuards(JwtAuthGuard)
  async getAllRecords(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const allowedRoles = ['clinic_admin', 'shelter_org', 'superadmin'];
    if (!allowedRoles.includes(req.user?.role)) {
      throw new ForbiddenException(
        'Access to full clinical medical records requires clinic staff or admin privileges.',
      );
    }
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.clinicService.getAllRecords(pageNum, limitNum);
  }

  @Get('records/pet/:petId')
  @UseGuards(JwtAuthGuard)
  async getRecordsForPet(@Param('petId') petId: string) {
    return this.clinicService.getRecordsForPet(petId);
  }

  @Post('records')
  @UseGuards(JwtAuthGuard)
  async createMedicalRecord(@Body() data: any, @Req() req: any) {
    const allowedRoles = ['clinic_admin', 'superadmin'];
    if (!allowedRoles.includes(req.user?.role)) {
      throw new ForbiddenException(
        'Only licensed veterinary clinics can author formal medical records.',
      );
    }
    return this.clinicService.createMedicalRecord(data);
  }

  // --- Emergency Dispatch (Pre-arrival SOS) ---
  @Post('dispatch')
  @UseGuards(OptionalJwtAuthGuard)
  async createEmergencyDispatch(@Body() data: any, @Req() req: any) {
    const callerId = req.user?.id || 'guest-sos';
    return this.clinicService.createDispatch({ ...data, callerId });
  }

  @Get(':id/dispatches')
  @UseGuards(JwtAuthGuard)
  async getDispatches(@Param('id') clinicId: string, @Req() req: any) {
    const allowedRoles = ['clinic_admin', 'superadmin'];
    if (!allowedRoles.includes(req.user?.role)) {
      throw new ForbiddenException(
        'Access to clinic emergency dispatch feed requires clinic authorization.',
      );
    }
    return this.clinicService.getDispatchesForClinic(clinicId);
  }

  @Patch('dispatch/:dispatchId/status')
  @UseGuards(JwtAuthGuard)
  async updateDispatchStatus(
    @Param('dispatchId') dispatchId: string,
    @Body() body: { status: string },
    @Req() req: any,
  ) {
    const allowedRoles = ['clinic_admin', 'superadmin'];
    if (!allowedRoles.includes(req.user?.role)) {
      throw new ForbiddenException(
        'Only veterinary staff can update triage dispatch status.',
      );
    }
    return this.clinicService.updateDispatchStatus(dispatchId, body.status);
  }
}

