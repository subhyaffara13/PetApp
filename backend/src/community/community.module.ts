import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { Story, StorySchema, Post, PostSchema, DirectMessage, DirectMessageSchema, CommunityReport, CommunityReportSchema } from '../schemas/community.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema },
      { name: Post.name, schema: PostSchema },
      { name: DirectMessage.name, schema: DirectMessageSchema },
      { name: CommunityReport.name, schema: CommunityReportSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
