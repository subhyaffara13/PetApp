import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './admin-auth.guard';

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('health')
  getHealth() {
    return this.adminService.getServicesHealth();
  }

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getDashboardAnalytics();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Post('users')
  createUser(@Body() body: any) {
    return this.adminService.createUser(body);
  }

  @Post('users/:id/action')
  updateUserStatus(@Param('id') id: string, @Body() body: { action: 'block' | 'unblock' | 'archive' }) {
    return this.adminService.updateUserStatus(id, body.action);
  }

  @Get('claims')
  getClaims() {
    return this.adminService.getClaims();
  }

  @Post('claims/:id/verify')
  verifyClaim(@Param('id') id: string, @Body() body: { status: 'approved' | 'rejected' }) {
    return this.adminService.verifyClaim(id, body.status);
  }

  @Get('reports')
  getReports() {
    return this.adminService.getReports();
  }

  @Post('reports/:id/action')
  handleReportAction(@Param('id') id: string, @Body() body: { action: 'dismiss' | 'action_taken' | 'block_user' }) {
    return this.adminService.handleReportAction(id, body.action);
  }

  @Get('logs')
  getLogs() {
    return this.adminService.getLogs();
  }

  @Post('logs/report')
  reportLog(@Body() body: { service: string; message: string }) {
    return this.adminService.reportUserError(body.service, body.message);
  }
}
