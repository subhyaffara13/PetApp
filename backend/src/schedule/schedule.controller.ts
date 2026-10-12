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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post('appointments/book')
  @UseGuards(JwtAuthGuard)
  async bookAppointment(@Body() dto: any, @Request() req: any) {
    const ownerId = req.user.id;
    return this.scheduleService.bookAppointment({ ...dto, ownerId });
  }

  @Get('appointments/pet/:petId')
  @UseGuards(JwtAuthGuard)
  async getPetAppointments(@Param('petId') petId: string) {
    return this.scheduleService.getAppointmentsForPet(petId);
  }

  @Get('appointments/user/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserAppointments(@Param('userId') userId: string, @Request() req: any) {
    // Enforce: authenticated user can only view their own appointments
    if (req.user.id !== userId && req.user.role !== 'superadmin') {
      return [];
    }
    return this.scheduleService.getAppointmentsForUser(userId);
  }

  @Patch('appointments/:id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelAppointment(@Param('id') id: string) {
    return this.scheduleService.cancelAppointment(id);
  }

  @Get('reminders/pet/:petId')
  @UseGuards(JwtAuthGuard)
  async getPetReminders(@Param('petId') petId: string) {
    return this.scheduleService.getRemindersForPet(petId);
  }

  @Get('reminders/user/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserReminders(@Param('userId') userId: string, @Request() req: any) {
    // Enforce: authenticated user can only view their own reminders
    if (req.user.id !== userId && req.user.role !== 'superadmin') {
      return [];
    }
    return this.scheduleService.getRemindersForUser(userId);
  }

  @Post('reminders')
  @UseGuards(JwtAuthGuard)
  async createReminder(@Body() dto: any, @Request() req: any) {
    const userId = req.user.id;
    return this.scheduleService.createReminder({ ...dto, userId });
  }

  @Patch('reminders/:id/toggle')
  @UseGuards(JwtAuthGuard)
  async toggleReminder(@Param('id') id: string) {
    return this.scheduleService.toggleReminder(id);
  }

  @Delete('reminders/:id')
  @UseGuards(JwtAuthGuard)
  async deleteReminder(@Param('id') id: string) {
    return this.scheduleService.deleteReminder(id);
  }
}
