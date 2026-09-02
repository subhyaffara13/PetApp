import {
  Controller,
  Get,
  Post,
  Put,
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

@Controller('pet-profile')
@UseGuards(OptionalJwtAuthGuard)
export class PetProfileController {
  constructor(private readonly petProfileService: PetProfileService) {}

  @Get('search')
  async search(@Query('query') query: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.petProfileService.search(query, userId);
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
  async getIncomingCoParentRequests(@Req() req: any) {
    const userId = req.user?.id || 'guest-anonymous';
    return this.petProfileService.getIncomingCoParentRequests(userId);
  }

  @Post('co-parent/requests/:requestId/respond')
  async respondToCoParentRequest(
    @Param('requestId') requestId: string,
    @Body() body: { action: 'accept' | 'decline' },
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'guest-anonymous';
    return this.petProfileService.respondToCoParentRequest(requestId, userId, body.action);
  }

  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user?.id;
    return this.petProfileService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.petProfileService.findOne(id, userId);
  }

  @Post('ocr-document')
  async parseDocument(@Body() dto: { fileData?: string; mimeType?: string; fileName?: string }) {
    return this.petProfileService.parseMedicalDocument(dto.fileData, dto.mimeType, dto.fileName);
  }

  @Post(':id/medical-event')
  async addMedicalEvent(@Param('id') id: string, @Body() event: any, @Req() req: any) {
    const userId = req.user?.id;
    return this.petProfileService.addMedicalEvent(id, event, userId);
  }

  @Post(':id/co-parent/invite')
  async sendCoParentInvite(
    @Param('id') petId: string,
    @Body() body: { toUserId: string; role?: string },
    @Req() req: any,
  ) {
    const fromUser = {
      id: req.user?.id || 'guest-anonymous',
      name: req.user?.name || 'Pet Parent',
      email: req.user?.email || 'parent@petsos.app',
    };
    return this.petProfileService.sendCoParentInvite(petId, fromUser, body.toUserId, body.role);
  }

  @Delete(':id/co-parent/:coParentUserId')
  async removeCoParent(
    @Param('id') petId: string,
    @Param('coParentUserId') coParentUserId: string,
    @Req() req: any,
  ) {
    const currentUserId = req.user?.id || 'guest-anonymous';
    return this.petProfileService.removeCoParent(petId, currentUserId, coParentUserId);
  }

  @Post()
  async create(@Body() createDto: CreatePetProfileDto, @Req() req: any) {
    const userId = req.user?.id || 'guest-anonymous';
    const userName = req.user?.name || 'Pet Parent';
    return this.petProfileService.create(createDto, userId, userName);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: CreatePetProfileDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.petProfileService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.petProfileService.remove(id, userId);
  }
}
