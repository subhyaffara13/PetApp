import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PetProfileModule } from '../pet-profile/pet-profile.module';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    PetProfileModule,
    AuthModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
