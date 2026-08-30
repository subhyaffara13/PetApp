import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

export class ChatMessageDto {
  message: string;
  history?: { role: string; content: string }[];
  petProfileId?: string;
  image?: {
    data: string; // base64 string
    mimeType: string;
  };
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async sendMessage(@Body() dto: ChatMessageDto) {
    return this.chatService.processMessage(
      dto.message,
      dto.history || [],
      dto.petProfileId,
      dto.image,
    );
  }
}
