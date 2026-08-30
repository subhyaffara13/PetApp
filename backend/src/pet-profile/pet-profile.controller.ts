import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UsePipes } from '@nestjs/common';
import { PetProfileService } from './pet-profile.service';
import { CreatePetProfileDto } from './dto/create-pet-profile.dto';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('pet-profile')
@UseGuards(OptionalJwtAuthGuard)
export class PetProfileController {
  constructor(private readonly petProfileService: PetProfileService) {}

  @Get('search')
  async search(@Query('query') query: string) {
    return this.petProfileService.search(query);
  }

  @Get()
  async findAll() {
    return this.petProfileService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.petProfileService.findOne(id);
  }

  @Post('ocr-document')
  async parseDocument(@Body() dto: { fileData?: string; mimeType?: string; fileName?: string }) {
    return this.petProfileService.parseMedicalDocument(dto.fileData, dto.mimeType, dto.fileName);
  }

  @Post(':id/medical-event')
  async addMedicalEvent(@Param('id') id: string, @Body() event: any) {
    return this.petProfileService.addMedicalEvent(id, event);
  }

  @Post()
  async create(@Body() createDto: CreatePetProfileDto) {
    return this.petProfileService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: CreatePetProfileDto) {
    return this.petProfileService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.petProfileService.remove(id);
  }
}
