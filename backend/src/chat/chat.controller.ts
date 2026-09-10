import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

export class ChatMessageDto {
  message: string;
  history?: { role: string; content: string }[];
  petProfileId?: string;
  sessionId?: string;
  image?: {
    data: string; // base64 string
    mimeType: string;
  };
}

@Controller('chat')
@UseGuards(OptionalJwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async sendMessage(@Body() dto: ChatMessageDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.chatService.processMessage(
      dto.message,
      dto.history || [],
      dto.petProfileId,
      dto.image,
      userId,
      dto.sessionId,
    );
  }

  @Get('sessions')
  async getSessions(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.chatService.getUserSessions(userId);
  }

  @Get('sessions/:sessionId')
  async getSession(
    @Param('sessionId') sessionId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.chatService.getSessionMessages(userId, sessionId);
  }

  @Delete('sessions/:sessionId')
  async deleteSession(
    @Param('sessionId') sessionId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.chatService.deleteSession(userId, sessionId);
  }

  @Get('memory')
  async getPetMemory(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.chatService.getPetMemory(userId);
  }

  @Patch('memory')
  async updatePetMemory(@Body() body: any, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.chatService.updatePetMemory(userId, body);
  }
}
