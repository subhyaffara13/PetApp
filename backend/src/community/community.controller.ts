import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { SheltersService } from '../shelters/shelters.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateStoryDto,
  CreatePostDto,
  SendDirectMessageDto,
  CreateCommunityReportDto,
} from './dto/community.dto';

@Controller('community')
@UseGuards(OptionalJwtAuthGuard)
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly sheltersService: SheltersService,
  ) {}

  @Get('shelters/nearby')
  async getNearbyShelters(
    @Query('country') country?: string,
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ) {
    return this.sheltersService.find({
      country: country || 'israel',
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
    });
  }

  @Get('adoptable-pets')
  async getAdoptablePets(
    @Query('species') species?: string,
    @Query('status') status?: string,
    @Query('city') city?: string,
  ) {
    return this.sheltersService.getAdoptablePets({ species, status, city });
  }

  @Post('adoptable-pets')
  async createAdoptablePet(@Body() body: any) {
    return this.sheltersService.createAdoptablePet(body);
  }

  @Get('profile')
  async getCurrentUserProfile(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId || userId === 'guest-anonymous') {
      return null;
    }
    return this.communityService.getUserProfile(userId, userId);
  }

  @Get('check-handle')
  async checkHandle(@Query('handle') handle: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.communityService.checkHandleAvailability(handle, userId);
  }




  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId || userId === 'guest-anonymous' || userId === 'current-user') {
      return this.communityService.updateProfile('guest', body);
    }
    return this.communityService.updateProfile(userId, body);
  }

  @Get('users/search')
  async searchUsers(@Query('q') query: string, @Req() req: any) {
    const currentUserId = req.user?.id;
    return this.communityService.searchUsers(query || '', currentUserId);
  }

  @Get('users/:userId/profile')
  async getUserProfile(@Param('userId') userId: string, @Req() req: any) {
    const currentUserId = req.user?.id;
    return this.communityService.getUserProfile(userId, currentUserId);
  }

  @Get('users/:userId/posts')
  async getUserPosts(@Param('userId') userId: string) {
    return this.communityService.getPostsByUser(userId);
  }

  @Get('suggestions')
  async getSuggestions(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Req() req?: any,
  ) {
    const currentUserId = req?.user?.id || req?.query?.userId;
    return this.communityService.getSuggestedUsers(
      currentUserId,
      lat ? parseFloat(lat) : 32.8012,
      lon ? parseFloat(lon) : 34.9855,
    );
  }

  @Post('users/:userId/follow')
  async toggleFollow(@Param('userId') userId: string, @Req() req: any) {
    const currentUserId = req.user?.id || 'current-user';
    return this.communityService.toggleFollow(userId, currentUserId);
  }

  @Get('stories')
  async getStories() {
    return this.communityService.getStories();
  }

  @Post('stories')
  async createStory(@Body() data: CreateStoryDto) {
    return this.communityService.createStory(data);
  }

  @Get('feed')
  async getFeed(
    @Req() req: any,
    @Query('mode') mode?: 'for_you' | 'following' | 'saved',
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user?.id || req.user?.sub;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.communityService.getPersonalizedFeed(
      userId,
      mode || 'for_you',
      category,
      pageNum,
      limitNum,
    );
  }

  @Post('feed')
  async createPost(@Body() data: CreatePostDto) {
    return this.communityService.createPost(data);
  }

  @Delete('feed/:id')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.communityService.deletePost(id, userId, userRole);
  }

  @Post('feed/:id/like')
  async toggleLike(
    @Param('id') id: string,
    @Body() body: { userId?: string },
    @Req() req: any,
  ) {
    const userId = req.user?.id || body?.userId || 'current-user';
    return this.communityService.toggleLike(id, userId);
  }

  @Post('feed/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  async toggleBookmark(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.communityService.toggleBookmark(id, userId);
  }

  @Get('bookmarks')
  @UseGuards(JwtAuthGuard)
  async getBookmarks(@Req() req: any) {
    const userId = req.user.id;
    return this.communityService.getBookmarkedPosts(userId);
  }

  @Post('feed/:id/comments')
  async addComment(
    @Param('id') id: string,
    @Body() body: { userName: string; userAvatar: string; text: string },
  ) {
    return this.communityService.addComment(id, body);
  }

  // --- ENCRYPTED DIRECT MESSAGES (Protected with JwtAuthGuard against BOLA/IDOR) ---
  @Get('messages/conversations')
  @UseGuards(JwtAuthGuard)
  async getConversations(@Req() req: any) {
    const userId = req.user.id;
    return this.communityService.getConversationsList(userId);
  }

  @Get('messages/:partnerId')
  @UseGuards(JwtAuthGuard)
  async getMessages(@Param('partnerId') partnerId: string, @Req() req: any) {
    const userId = req.user.id;
    return this.communityService.getEncryptedConversation(userId, partnerId);
  }

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  async sendMessage(@Body() body: SendDirectMessageDto, @Req() req: any) {
    const senderId = req.user.id;
    return this.communityService.sendEncryptedMessage({ ...body, senderId });
  }

  @Post('messages/:partnerId/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @Param('partnerId') partnerId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.communityService.markConversationAsRead(userId, partnerId);
  }

  // --- HARASSMENT & SAFETY REPORTING ---
  @Post('report')
  async submitReport(@Body() body: CreateCommunityReportDto, @Req() req: any) {
    const reporterId = req.user?.id || body.reporterId || 'current-user';
    const reporterName = req.user?.name || body.reporterName || 'Anonymous Reporter';
    const reportedUserName = body.reportedUserName || 'Reported User';
    return this.communityService.submitReport({
      ...body,
      reporterId,
      reporterName,
      reportedUserId: body.reportedUserId,
      reportedUserName,
      reason: body.reason,
    });
  }
}
