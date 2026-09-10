import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

import { IsOptional, IsString } from 'class-validator';

export class NearbyQueryDto {
  @IsOptional()
  @IsString()
  lat?: string;

  @IsOptional()
  @IsString()
  lon?: string;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  lang?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

@Controller('emergency')
@UseGuards(OptionalJwtAuthGuard)
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Get('nearby')
  async getNearbyClinics(
    @Query() query?: NearbyQueryDto,
    @Query('lat') latParam?: string,
    @Query('lon') lonParam?: string,
    @Query('query') customQueryParam?: string,
    @Query('lang') langParam?: string,
    @Query('country') countryParam?: string,
  ) {
    const lat = latParam ?? query?.lat;
    const lon = lonParam ?? query?.lon;
    const customQuery = customQueryParam ?? query?.query;
    const lang = langParam ?? query?.lang;
    const country = countryParam ?? query?.country;

    const parsedLat =
      lat !== undefined && !isNaN(Number(lat)) ? Number(lat) : 32.794;
    const parsedLon =
      lon !== undefined && !isNaN(Number(lon)) ? Number(lon) : 34.9896;

    return this.emergencyService.findNearby(
      parsedLat,
      parsedLon,
      customQuery,
      lang,
      country,
    );
  }

  @Get('geocode')
  async geocodeAddress(
    @Query('q') q: string,
    @Query('lang') lang?: string,
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ) {
    return this.emergencyService.geocodeAddress(
      q,
      lang,
      lat ? +lat : undefined,
      lon ? +lon : undefined,
    );
  }

  @Get('clinics')
  async getAllClinics() {
    return this.emergencyService.getAllClinics();
  }

  @Patch('clinic/:id')
  async updateClinic(@Param('id') id: string, @Body() updates: any) {
    return this.emergencyService.updateClinic(id, updates);
  }

  // --- LIVE MOBILE VET LOCATION BROADCASTING ---
  @Post('mobile-vet/location')
  async updateMobileVetLocation(
    @Req() req: any,
    @Body()
    body: {
      lat: number;
      lng: number;
      heading?: number;
      speed?: number;
      isActive: boolean;
      userId?: string;
    },
  ) {
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
  async getActiveLostPetAlerts(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ) {
    return this.emergencyService.getActiveLostPetAlerts(
      lat ? +lat : 32.794,
      lon ? +lon : 34.9896,
    );
  }

  @Patch('lost-pet/:id/resolve')
  async resolveLostPetAlert(@Param('id') id: string) {
    return this.emergencyService.resolveLostPetAlert(id);
  }
}
