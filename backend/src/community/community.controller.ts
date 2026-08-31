import { Controller, Get, Post, Delete, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { CommunityService } from './community.service';
import { SheltersService } from '../shelters/shelters.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

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

  @Post('cleanup-test-users')
  async cleanupTestUsers() {
    return this.communityService.cleanNonSubhyUsers();
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
    const currentUserId = req?.user?.id;
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
  async createStory(@Body() data: any) {
    return this.communityService.createStory(data);
  }

  @Get('feed')
  async getFeed() {
    return this.communityService.getFeed();
  }

  @Post('feed')
  async createPost(@Body() data: any) {
    return this.communityService.createPost(data);
  }

  @Delete('feed/:id')
  async deletePost(@Param('id') id: string) {
    return this.communityService.deletePost(id);
  }

  @Post('feed/:id/like')
  async toggleLike(@Param('id') id: string, @Body() body: { userId?: string }, @Req() req: any) {
    const userId = body?.userId || req.user?.id || 'current-user';
    return this.communityService.toggleLike(id, userId);
  }

  @Post('feed/:id/comments')
  async addComment(@Param('id') id: string, @Body() body: { userName: string; userAvatar: string; text: string }) {
    return this.communityService.addComment(id, body);
  }

  // --- ENCRYPTED DIRECT MESSAGES ---
  @Get('messages/conversations')
  async getConversations(@Req() req: any) {
    const userId = req.user?.id || 'current-user';
    return this.communityService.getConversationsList(userId);
  }

  @Get('messages/:partnerId')
  async getMessages(@Param('partnerId') partnerId: string, @Req() req: any) {
    const userId = req.user?.id || 'current-user';
    return this.communityService.getEncryptedConversation(userId, partnerId);
  }

  @Post('messages')
  async sendMessage(@Body() body: any) {
    return this.communityService.sendEncryptedMessage(body);
  }

  // --- HARASSMENT & SAFETY REPORTING ---
  @Post('report')
  async submitReport(@Body() body: any, @Req() req: any) {
    const reporterId = req.user?.id || body.reporterId || 'current-user';
    return this.communityService.submitReport({ ...body, reporterId });
  }
}
