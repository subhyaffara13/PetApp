import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PetProfileService } from './pet-profile.service';
import { CreatePetProfileDto } from './dto/create-pet-profile.dto';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pet-profile')
@UseGuards(OptionalJwtAuthGuard)
export class PetProfileController {
  constructor(private readonly petProfileService: PetProfileService) {}

  @Get('search')
  async search(@Query('query') query: string, @Req() req: any) {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    return this.petProfileService.search(query, userId, userEmail);
  }

  @Get('users/search')
  async searchUsers(@Query('q') q: string, @Req() req: any) {
    const currentUserId = req.user?.id || 'guest-anonymous';
    return this.petProfileService.searchUsers(q, currentUserId);
  }

  @Get('tag/:petPassportId')
  async findByTag(@Param('petPassportId') petPassportId: string) {
    return this.petProfileService.findByPetTag(petPassportId);
  }

  @Get('co-parent/requests/inbox')
  @UseGuards(JwtAuthGuard)
  async getIncomingCoParentRequests(@Req() req: any) {
    const userId = req.user.id;
    const userEmail = req.user.email;
    return this.petProfileService.getIncomingCoParentRequests(userId, userEmail);
  }

  @Post('co-parent/requests/:requestId/respond')
  @UseGuards(JwtAuthGuard)
  async respondToCoParentRequest(
    @Param('requestId') requestId: string,
    @Body() body: { action: 'accept' | 'decline' },
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const userEmail = req.user.email;
    return this.petProfileService.respondToCoParentRequest(
      requestId,
      userId,
      body.action,
      userEmail,
    );
  }

  @Get('archived')
  async getArchivedPets(@Req() req: any) {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    return this.petProfileService.getArchivedPets(userId, userEmail);
  }

  @Get()
  async findAll(@Req() req: any, @Query('includeArchived') includeArchived?: string) {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    return this.petProfileService.findAll(userId, includeArchived === 'true', userEmail);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard)
  async archivePet(
    @Param('id') id: string,
    @Body() body: { reason?: 'passed' | 'rehomed' | 'inactive' | 'other'; isArchived?: boolean },
    @Req() req: any,
  ) {
    const userId = req.user.id;
    if (body?.isArchived === false) {
      return this.petProfileService.unarchivePet(id, userId);
    }
    return this.petProfileService.archivePet(id, userId, body?.reason);
  }

  @Patch(':id/unarchive')
  @UseGuards(JwtAuthGuard)
  async unarchivePet(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.petProfileService.unarchivePet(id, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    return this.petProfileService.findOne(id, userId, userEmail);
  }

  @Post('ocr-document')
  async parseDocument(
    @Body() dto: { fileData?: string; mimeType?: string; fileName?: string },
  ) {
    return this.petProfileService.parseMedicalDocument(
      dto.fileData,
      dto.mimeType,
      dto.fileName,
    );
  }

  @Post(':id/medical-event')
  @UseGuards(JwtAuthGuard)
  async addMedicalEvent(
    @Param('id') id: string,
    @Body() event: any,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.petProfileService.addMedicalEvent(id, event, userId);
  }

  @Post(':id/co-parent/invite')
  @UseGuards(JwtAuthGuard)
  async sendCoParentInvite(
    @Param('id') petId: string,
    @Body() body: { toUserId: string; role?: string },
    @Req() req: any,
  ) {
    const fromUser = {
      id: req.user.id,
      name: req.user.name || 'Pet Parent',
      email: req.user.email || '',
    };
    return this.petProfileService.sendCoParentInvite(
      petId,
      fromUser,
      body.toUserId,
      body.role,
    );
  }

  @Delete(':id/co-parent/:coParentUserId')
  @UseGuards(JwtAuthGuard)
  async removeCoParent(
    @Param('id') petId: string,
    @Param('coParentUserId') coParentUserId: string,
    @Req() req: any,
  ) {
    const currentUserId = req.user.id;
    return this.petProfileService.removeCoParent(
      petId,
      currentUserId,
      coParentUserId,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDto: CreatePetProfileDto, @Req() req: any) {
    const userId = req.user.id;
    const userName = req.user.name || 'Pet Parent';
    return this.petProfileService.create(createDto, userId, userName);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: CreatePetProfileDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.petProfileService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.petProfileService.remove(id, userId);
  }
}
