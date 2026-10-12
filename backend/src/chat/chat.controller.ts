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
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChatService } from './chat.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

export class ChatHistoryItemDto {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  content: string;
}

export class ChatImageDto {
  @IsString()
  @IsNotEmpty()
  data: string; // base64 string

  @IsString()
  @IsNotEmpty()
  mimeType: string;
}

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  history?: ChatHistoryItemDto[];

  @IsOptional()
  @IsString()
  petProfileId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  petContext?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatImageDto)
  image?: ChatImageDto;
}

export class UpdatePetMemoryDto {
  @IsOptional()
  @IsObject()
  petPreferences?: Record<string, any>;

  @IsOptional()
  @IsObject()
  medicalHistoryNotes?: Record<string, any>;

  [key: string]: any;
}

@Controller('chat')
@UseGuards(OptionalJwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(['message', ''])
  async sendMessage(@Body() dto: ChatMessageDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub || dto.userId;
    const result = await this.chatService.processMessage(
      dto.message,
      dto.history || [],
      dto.petProfileId,
      dto.image,
      userId,
      dto.sessionId,
      dto.petContext,
    );

    return {
      ...result,
      reply: result.message,
      isEmergency: result.emergency,
      memory: result.memorySnapshot,
    };
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
  async updatePetMemory(@Body() body: UpdatePetMemoryDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.chatService.updatePetMemory(userId, body);
  }
}
