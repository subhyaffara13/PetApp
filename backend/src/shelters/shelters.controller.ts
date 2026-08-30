import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { SheltersService, CountryEntry } from './shelters.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('shelters')
@UseGuards(OptionalJwtAuthGuard)
export class SheltersController {
  constructor(private readonly sheltersService: SheltersService) {}

  @Get()
  async find(
    @Query('country') country: string,
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('query') query: string,
  ) {
    return this.sheltersService.find({
      lat: lat ? +lat : undefined,
      lon: lon ? +lon : undefined,
      query,
      country,
    });
  }

  @Get('countries')
  async countries(): Promise<CountryEntry[]> {
    return this.sheltersService.listCountries();
  }

  // --- ADOPTABLE PETS DIRECTORY & MANAGER ---
  @Get('adoptions')
  async getAdoptablePets(
    @Query('species') species?: string,
    @Query('status') status?: string,
    @Query('city') city?: string,
  ) {
    return this.sheltersService.getAdoptablePets({ species, status, city });
  }

  @Post('adoptions')
  async createAdoptablePet(@Body() body: any) {
    return this.sheltersService.createAdoptablePet(body);
  }

  @Patch('adoptions/:id')
  async updateAdoptablePet(@Param('id') id: string, @Body() body: any) {
    return this.sheltersService.updateAdoptablePet(id, body);
  }
}
