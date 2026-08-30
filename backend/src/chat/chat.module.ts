import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PetProfileModule } from '../pet-profile/pet-profile.module';

@Module({
  imports: [PetProfileModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
