import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { GroomingService } from './grooming.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('grooming')
@UseGuards(OptionalJwtAuthGuard)
export class GroomingController {
  constructor(private readonly groomingService: GroomingService) {}

  @Get('services')
  async getServices(@Query('groomerId') groomerId?: string) {
    return this.groomingService.getServices(groomerId);
  }

  @Post('services')
  async createService(@Req() req: any, @Body() body: any) {
    const groomerId = req.user?.id || 'default-groomer';
    return this.groomingService.createService(groomerId, body);
  }

  @Get('appointments')
  async getAppointments(@Req() req: any, @Query('date') date?: string) {
    const groomerId = req.user?.id || 'default-groomer';
    return this.groomingService.getAppointments(groomerId, date);
  }

  @Get('my-appointments')
  async getMyAppointments(@Req() req: any) {
    const userId = req.user?.id || 'guest-anonymous';
    return this.groomingService.getUserAppointments(userId);
  }

  @Post('appointments')
  async createAppointment(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id || body.userId || 'guest-anonymous';
    const customerName = req.user?.name || body.customerName || 'Pet Parent';
    const customerEmail = req.user?.email || body.customerEmail || 'customer@petsos.app';
    return this.groomingService.createAppointment({
      ...body,
      userId,
      customerName,
      customerEmail,
    });
  }

  @Patch('appointments/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; coatConditionNotes?: string; afterPhotoUrl?: string },
  ) {
    return this.groomingService.updateStatus(id, body.status, body.coatConditionNotes, body.afterPhotoUrl);
  }

  @Post('appointments/:id/invoice')
  async issueInvoice(@Param('id') id: string) {
    return this.groomingService.issueAppointmentInvoice(id);
  }
}
