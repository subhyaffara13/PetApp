import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post('appointments/book')
  @UseGuards(OptionalJwtAuthGuard)
  async bookAppointment(@Body() dto: any, @Request() req: any) {
    const ownerId = req.user?.userId || dto.ownerId || 'guest';
    return this.scheduleService.bookAppointment({ ...dto, ownerId });
  }

  @Get('appointments/pet/:petId')
  async getPetAppointments(@Param('petId') petId: string) {
    return this.scheduleService.getAppointmentsForPet(petId);
  }

  @Get('appointments/user/:userId')
  async getUserAppointments(@Param('userId') userId: string) {
    return this.scheduleService.getAppointmentsForUser(userId);
  }

  @Patch('appointments/:id/cancel')
  async cancelAppointment(@Param('id') id: string) {
    return this.scheduleService.cancelAppointment(id);
  }

  @Get('reminders/pet/:petId')
  async getPetReminders(@Param('petId') petId: string) {
    return this.scheduleService.getRemindersForPet(petId);
  }

  @Get('reminders/user/:userId')
  async getUserReminders(@Param('userId') userId: string) {
    return this.scheduleService.getRemindersForUser(userId);
  }

  @Post('reminders')
  @UseGuards(OptionalJwtAuthGuard)
  async createReminder(@Body() dto: any, @Request() req: any) {
    const userId = req.user?.userId || dto.userId || 'guest';
    return this.scheduleService.createReminder({ ...dto, userId });
  }

  @Patch('reminders/:id/toggle')
  async toggleReminder(@Param('id') id: string) {
    return this.scheduleService.toggleReminder(id);
  }

  @Delete('reminders/:id')
  async deleteReminder(@Param('id') id: string) {
    return this.scheduleService.deleteReminder(id);
  }
}
