import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

export class NearbyQueryDto {
  lat: string;
  lon: string;
  query?: string;
  lang?: string;
  country?: string;
}

@Controller('emergency')
@UseGuards(OptionalJwtAuthGuard)
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Get('nearby')
  async getNearbyClinics(@Query() query: NearbyQueryDto) {
    const { lat, lon, query: customQuery, lang, country } = query;
    return this.emergencyService.findNearby(+lat || 32.794, +lon || 34.9896, customQuery, lang, country);
  }

  @Get('geocode')
  async geocodeAddress(@Query('q') q: string, @Query('lang') lang?: string) {
    return this.emergencyService.geocodeAddress(q, lang);
  }

  @Get('clinics')
  async getAllClinics() {
    return this.emergencyService.getAllClinics();
  }

  @Patch('clinic/:id')
  async updateClinic(
    @Param('id') id: string,
    @Body() updates: any,
  ) {
    return this.emergencyService.updateClinic(id, updates);
  }

  // --- LIVE MOBILE VET LOCATION BROADCASTING ---
  @Post('mobile-vet/location')
  async updateMobileVetLocation(@Req() req: any, @Body() body: { lat: number; lng: number; heading?: number; speed?: number; isActive: boolean; userId?: string }) {
    const userId = req.user?.id || body.userId;
    return this.emergencyService.updateMobileVetLocation(userId, body);
  }

  @Get('mobile-vets/live')
  async getLiveMobileVets() {
    return this.emergencyService.getLiveMobileVets();
  }

  // --- RATE-LIMITED LOST PET SOS BROADCASTS ---
  @Post('lost-pet')
  async broadcastLostPetAlert(@Body() body: any, @Req() req: any) {
    const ownerId = req.user?.id || body.ownerId || 'current-user';
    return this.emergencyService.broadcastLostPetAlert({ ...body, ownerId });
  }

  @Get('lost-pet')
  async getActiveLostPetAlerts(@Query('lat') lat?: string, @Query('lon') lon?: string) {
    return this.emergencyService.getActiveLostPetAlerts(lat ? +lat : 32.794, lon ? +lon : 34.9896);
  }

  @Patch('lost-pet/:id/resolve')
  async resolveLostPetAlert(@Param('id') id: string) {
    return this.emergencyService.resolveLostPetAlert(id);
  }
}