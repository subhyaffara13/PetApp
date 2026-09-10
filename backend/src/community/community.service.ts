import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Story,
  StoryDocument,
  Post,
  PostDocument,
  DirectMessageDocument,
  CommunityReport,
  CommunityReportDocument,
} from '../schemas/community.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { PetProfile, PetProfileDocument } from '../schemas/pet-profile.schema';
import { escapeRegex, toSafeString, isSafeObjectId } from '../utils/sanitize';
import { CommunityDmService } from './community-dm.service';

export interface PublicPetSummary {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age?: number;
  photoUrl?: string;
  gender?: string;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  petBreeds?: string[];
  distanceKm?: number;
  suggestionReason?: string;
  role?: string;
  isVerified?: boolean;
  verificationBadge?: string;
  organizationName?: string;
  pets?: PublicPetSummary[];
  posts?: any[];
}

@Injectable()
export class CommunityService implements OnModuleInit {
  private readonly logger = new Logger(CommunityService.name);

  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(CommunityReport.name)
    private reportModel: Model<CommunityReportDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(PetProfile.name)
    private petProfileModel: Model<PetProfileDocument>,
    private readonly dmService: CommunityDmService,
  ) {}

  async onModuleInit() {
    await this.cleanNonSubhyUsers();
  }

  /** Removes any legacy dummy users not named Subhy Affara so fresh user accounts can be tested */
  async cleanNonSubhyUsers(): Promise<{ deletedCount: number }> {
    try {
      const res = await this.userModel
        .deleteMany({
          name: { $not: /subhy\s*affara|subhi/i },
          email: { $not: /subhyaffara|subhi/i },
        })
        .exec();
      if (res.deletedCount > 0) {
        this.logger.log(
          `Cleaned up ${res.deletedCount} legacy test accounts; retained Subhy Affara.`,
        );
      }
      return { deletedCount: res.deletedCount || 0 };
    } catch (err: any) {
      this.logger.warn('User cleanup note:', err?.message);
      return { deletedCount: 0 };
    }
  }

  // --- STORIES ---
  async getStories(): Promise<StoryDocument[]> {
    try {
      const now = new Date();
      return await this.storyModel
        .find({ expiresAt: { $gt: now } })
        .sort({ createdAt: -1 })
        .exec();
    } catch {
      return [];
    }
  }

  async createStory(dto: any): Promise<StoryDocument> {
    const story = new this.storyModel({
      ...dto,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return story.save();
  }

  // --- POSTS & PERSONALIZED FEED ALGORITHM ---
  /**
   * Multi-tiered social personalization feed (Instagram/Facebook model):
   * 1. Emergency Lost Pet SOS alerts in city (Rank +100)
   * 2. Direct follow social graph (Rank +50)
   * 3. Pet breed match relevance (Rank +35)
   * 4. User interest & past liked categories (Rank +25)
   * 5. Verified creator/vet authority (Rank +20)
   * 6. Engagement velocity (likes*2 + comments*3)
   * 7. Smooth 7-day recency decay
   */
  async getPersonalizedFeed(
    userId?: string,
    mode: 'for_you' | 'following' | 'saved' = 'for_you',
    categoryFilter?: string,
  ): Promise<any[]> {
    try {
      let userDoc: UserDocument | null = null;
      const safeUserId = toSafeString(userId);
      if (safeUserId && safeUserId !== 'guest-anonymous' && safeUserId !== 'current-user' && isSafeObjectId(safeUserId)) {
        userDoc = await this.userModel.findById(safeUserId).exec();
      }

      // If user requested "saved" / bookmarks
      if (mode === 'saved') {
        if (!userDoc || !userDoc.bookmarkedPostIds || userDoc.bookmarkedPostIds.length === 0) {
          return [];
        }
        return await this.postModel
          .find({ _id: { $in: userDoc.bookmarkedPostIds } })
          .sort({ createdAt: -1 })
          .exec();
      }

      // If user requested "following" only
      if (mode === 'following') {
        if (!userDoc || !userDoc.following || userDoc.following.length === 0) {
          return [];
        }
        const query: any = { authorId: { $in: userDoc.following } };
        if (categoryFilter && categoryFilter !== 'all') {
          query.category = categoryFilter;
        }
        return await this.postModel.find(query).sort({ createdAt: -1 }).exec();
      }

      // --- "FOR YOU" ALGORITHMIC FEED ---
      const baseQuery: any = {};
      if (categoryFilter && categoryFilter !== 'all') {
        baseQuery.category = categoryFilter;
      }
      if (userDoc?.blockedUserIds?.length) {
        baseQuery.authorId = { $nin: userDoc.blockedUserIds };
      }

      const allPosts = await this.postModel
        .find(baseQuery)
        .sort({ createdAt: -1 })
        .limit(100)
        .exec();

      if (!userDoc) {
        // Fallback for guests: Lost & Found SOS first, then highest engagement, then recency
        return allPosts.sort((a, b) => {
          if (a.category === 'lost_found' && b.category !== 'lost_found') return -1;
          if (b.category === 'lost_found' && a.category !== 'lost_found') return 1;
          const scoreA = (a.likesCount || 0) * 2 + (a.comments?.length || 0) * 3;
          const scoreB = (b.likesCount || 0) * 2 + (b.comments?.length || 0) * 3;
          return scoreB - scoreA;
        });
      }

      const followingSet = new Set(userDoc.following || []);
      const breedSet = new Set((userDoc.petBreeds || []).map((b) => b.toLowerCase()));
      const categorySet = new Set(
        [...(userDoc.interestedCategories || []), ...(userDoc.likedCategories || [])].map((c) =>
          c.toLowerCase(),
        ),
      );

      const now = Date.now();

      const scored = allPosts.map((post) => {
        let score = 0;
        const postBreed = (post.petBreed || '').toLowerCase();
        const postCat = (post.category || '').toLowerCase();

        // 1. Critical SOS boost (Lost Pet alerts)
        if (postCat === 'lost_found') score += 100;

        // 2. Following boost (Personal social graph)
        if (followingSet.has(post.authorId)) score += 50;

        // 3. Pet Breed Affinity (Content relevance)
        if (postBreed && breedSet.has(postBreed)) score += 35;

        // 4. Topic / Category Affinity
        if (categorySet.has(postCat)) score += 25;

        // 5. Authority boost (Veterinarians and Shelters)
        if (post.authorBadge === 'veterinarian' || post.authorBadge === 'vet') score += 20;

        // 6. Social Engagement velocity
        score += (post.likesCount || 0) * 2 + (post.comments?.length || 0) * 3;

        // 7. Recency decay (7-day window)
        const ageHours = (now - new Date((post as any).createdAt).getTime()) / (1000 * 60 * 60);
        const recencyMultiplier = Math.max(0.15, 1 - ageHours / 168);
        score *= recencyMultiplier;

        return { post, score };
      });

      scored.sort((a, b) => b.score - a.score);
      return scored.map((s) => s.post);
    } catch (err) {
      this.logger.warn('Personalized feed algorithm error:', err);
      return await this.postModel.find().sort({ createdAt: -1 }).limit(30).exec();
    }
  }

  /** Backward-compatible getFeed helper */
  async getFeed(): Promise<PostDocument[]> {
    return this.getPersonalizedFeed();
  }

  async getPostsByUser(userId: string): Promise<PostDocument[]> {
    try {
      return await this.postModel
        .find({ authorId: userId })
        .sort({ createdAt: -1 })
        .exec();
    } catch {
      return [];
    }
  }

  async createPost(dto: any): Promise<PostDocument> {
    const post = new this.postModel(dto);
    const saved = await post.save();

    // Increment user's liked category preferences if available
    if (dto.authorId && dto.category) {
      await this.userModel
        .findByIdAndUpdate(dto.authorId, {
          $addToSet: { likedCategories: dto.category },
        })
        .exec();
    }
    return saved;
  }

  async deletePost(id: string): Promise<any> {
    return this.postModel.findByIdAndDelete(id).exec();
  }

  async toggleLike(postId: string, userId: string): Promise<any> {
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Post not found');

    const alreadyLiked = post.likedBy?.includes(userId);
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((id) => id !== userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likedBy = [...(post.likedBy || []), userId];
      post.likesCount = (post.likesCount || 0) + 1;
    }

    // Sync likedPostIds and likedCategories to user profile in Atlas
    if (userId && userId !== 'guest-anonymous' && userId !== 'current-user') {
      try {
        const userUpdate: any = alreadyLiked
          ? { $pull: { likedPostIds: postId } }
          : {
              $addToSet: {
                likedPostIds: postId,
                likedCategories: post.category,
              },
            };
        await this.userModel.findByIdAndUpdate(userId, userUpdate).exec();
      } catch (err) {
        this.logger.warn('User like sync note:', err);
      }
    }

    return post.save();
  }

  async toggleBookmark(
    postId: string,
    userId: string,
  ): Promise<{ bookmarked: boolean; bookmarkedPostIds: string[] }> {
    if (!userId || userId === 'guest-anonymous') {
      return { bookmarked: false, bookmarkedPostIds: [] };
    }
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    if (!user.bookmarkedPostIds) user.bookmarkedPostIds = [];
    const isBookmarked = user.bookmarkedPostIds.includes(postId);

    if (isBookmarked) {
      user.bookmarkedPostIds = user.bookmarkedPostIds.filter((id) => id !== postId);
    } else {
      user.bookmarkedPostIds.unshift(postId);
    }

    await user.save();
    return {
      bookmarked: !isBookmarked,
      bookmarkedPostIds: user.bookmarkedPostIds,
    };
  }

  async getBookmarkedPosts(userId: string): Promise<any[]> {
    if (!userId || userId === 'guest-anonymous') return [];
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.bookmarkedPostIds || user.bookmarkedPostIds.length === 0) {
      return [];
    }
    return await this.postModel
      .find({ _id: { $in: user.bookmarkedPostIds } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async addComment(
    postId: string,
    comment: { userName: string; userAvatar: string; text: string },
  ): Promise<any> {
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Post not found');

    post.comments.push({ ...comment, createdAt: new Date() });
    return post.save();
  }

  // --- LIVE USER PROFILES (100% Database Powered) ---
  async getUserProfile(
    rawTargetUserId: string,
    currentUserId?: string,
  ): Promise<UserProfileResponse> {
    const targetUserId = toSafeString(rawTargetUserId);
    let user: UserDocument | null = null;
    if (targetUserId) {
      try {
        user = await this.userModel.findById(targetUserId).exec();
      } catch {}
    }
    if (!user && targetUserId) {
      try {
        user = await this.userModel.findOne({ email: targetUserId }).exec();
      } catch {}
    }

    if (!user) {
      // Return a default profile structure if querying before login
      return {
        id: targetUserId,
        name: 'Pet Parent',
        handle: '@petparent',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: 'Animal lover in Haifa 🐾',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isFollowing: false,
      };
    }

    const postsCount = await this.postModel
      .countDocuments({ authorId: user._id.toString() })
      .exec();
    const followers = user.followers || [];
    const following = user.following || [];
    const isFollowing = currentUserId
      ? followers.includes(currentUserId)
      : false;

    // Query public pets safely (NO medical records, allergies, microchip IDs, or sensitive notes)
    let pets: PublicPetSummary[] = [];
    try {
      const rawPets = await this.petProfileModel
        .find({
          $or: [
            { ownerId: user._id.toString() },
            { ownerId: user.email },
            { 'coParents.userId': user._id.toString() },
          ],
          isArchived: { $ne: true },
        })
        .select('name species breed age dateOfBirth gender photoUrl')
        .exec();

      pets = rawPets.map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        species: p.species,
        breed: p.breed,
        age: p.age,
        gender: p.gender,
        photoUrl: p.photoUrl,
      }));
    } catch {}

    // Query user's recent posts
    let posts: any[] = [];
    try {
      posts = await this.postModel
        .find({ authorId: user._id.toString() })
        .sort({ createdAt: -1 })
        .limit(18)
        .exec();
    } catch {}

    return {
      id: user._id.toString(),
      name: user.name,
      handle: user.handle || `@${user.email.split('@')[0]}`,
      avatar:
        user.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: user.bio || 'Proud pet parent 🐾',
      role: user.role,
      isVerified: user.isVerified || false,
      verificationBadge:
        user.verificationBadge ||
        (user.role === 'clinic_admin'
          ? 'veterinarian'
          : user.role === 'store_merchant'
            ? 'pet_store'
            : user.role === 'shelter_org'
              ? 'animal_shelter'
              : user.role === 'superadmin'
                ? 'platform_admin'
                : 'none'),
      organizationName: user.organizationName || '',
      followersCount: followers.length,
      followingCount: following.length,
      postsCount,
      isFollowing,
      petBreeds:
        pets.length > 0
          ? pets.map((p) => p.breed)
          : user.petBreeds || ['Golden Retriever'],
      pets,
      posts,
    };
  }

  async checkHandleAvailability(
    rawHandle: string,
    currentUserId?: string,
  ): Promise<{ available: boolean; handle: string; message: string }> {
    if (!rawHandle || !rawHandle.trim()) {
      return {
        available: false,
        handle: '',
        message: 'Handle cannot be empty.',
      };
    }
    let handle = rawHandle.trim().toLowerCase();
    if (!handle.startsWith('@')) handle = `@${handle}`;

    const isValid = /^@[a-z0-9_]{3,24}$/.test(handle);
    if (!isValid) {
      return {
        available: false,
        handle,
        message:
          'Handle must be 3-24 characters (letters, numbers, underscores only).',
      };
    }

    const query: any = { handle };
    if (
      currentUserId &&
      currentUserId !== 'current-user' &&
      currentUserId !== 'guest-anonymous' &&
      currentUserId !== 'guest'
    ) {
      try {
        query._id = { $ne: currentUserId };
      } catch {}
    }

    const existing = await this.userModel.findOne(query).exec();
    if (existing) {
      return {
        available: false,
        handle,
        message: `The handle ${handle} is already taken.`,
      };
    }
    return { available: true, handle, message: `${handle} is available!` };
  }

  async updateProfile(
    userId: string,
    dto: {
      name?: string;
      bio?: string;
      handle?: string;
      avatar?: string;
      petBreeds?: string[];
    },
  ): Promise<UserProfileResponse> {
    if (
      !userId ||
      userId === 'guest' ||
      userId === 'guest-anonymous' ||
      userId === 'current-user'
    ) {
      // Return updated transient profile
      return {
        id: 'guest',
        name: dto.name || 'Pet Parent',
        handle: dto.handle || '@petparent',
        avatar:
          dto.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: dto.bio || 'Proud pet parent 🐾',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isFollowing: false,
        petBreeds: dto.petBreeds || ['Golden Retriever'],
      };
    }

    if (dto.handle) {
      const avail = await this.checkHandleAvailability(dto.handle, userId);
      if (!avail.available) {
        throw new NotFoundException(avail.message);
      }
      dto.handle = avail.handle;
    }

    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $set: dto }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return this.getUserProfile(userId);
  }

  // --- SEARCH USERS ---
  async searchUsers(
    query: string,
    currentUserId?: string,
  ): Promise<UserProfileResponse[]> {
    const cleanQuery = toSafeString(query).trim();
    if (!cleanQuery) return [];
    const escaped = escapeRegex(cleanQuery);
    const regex = new RegExp(escaped, 'i');

    const users = await this.userModel
      .find({
        $or: [{ name: regex }, { handle: regex }, { email: regex }],
      })
      .limit(15)
      .exec();

    return Promise.all(
      users.map((u) => this.getUserProfile(u._id.toString(), currentUserId)),
    );
  }

  // --- SMART RECOMMENDATION ALGORITHM ---
  async getSuggestedUsers(
    currentUserId?: string,
    lat: number = 32.8012,
    lon: number = 34.9855,
  ): Promise<UserProfileResponse[]> {
    let currentUser: UserDocument | null = null;
    if (currentUserId && currentUserId !== 'current-user') {
      try {
        currentUser = await this.userModel.findById(currentUserId).exec();
      } catch {}
    }

    const allUsers = await this.userModel
      .find({
        _id: { $ne: currentUser?._id },
        email: {
          $nin: [
            'clinic@petsos.app',
            'store@petsos.app',
            'demo@petsos.app',
            'admin@petsos.app',
          ],
        },
        isActive: true,
      })
      .limit(30)
      .exec();

    const scoredUsers = await Promise.all(
      allUsers.map(async (user) => {
        const profile = await this.getUserProfile(
          user._id.toString(),
          currentUserId,
        );
        let score = 0;
        let reason = 'Active in neighborhood';

        // 1. Breed / Animal Match (+35 points)
        const myBreeds = currentUser?.petBreeds || ['Golden Retriever'];
        const targetBreeds = user.petBreeds || ['Golden Retriever'];
        const commonBreed = myBreeds.find((b) => targetBreeds.includes(b));
        if (commonBreed) {
          score += 35;
          reason = `Also loves ${commonBreed}s`;
        }

        // 2. Proximity Score (+30 points)
        const uLat = user.locationCoordinates?.lat || 32.805;
        const uLon = user.locationCoordinates?.lon || 34.988;
        const distKm =
          Math.round(
            Math.sqrt(
              Math.pow((lat - uLat) * 111, 2) +
                Math.pow(
                  (lon - uLon) * 111 * Math.cos(lat * (Math.PI / 180)),
                  2,
                ),
            ) * 10,
          ) / 10;

        if (distKm <= 3.0) {
          score += 30;
          reason += ` · ${distKm}km away`;
        } else if (distKm <= 10.0) {
          score += 15;
          reason += ` · ${distKm}km away`;
        }

        // 3. Shared Category Likes (+25 points)
        const myCats = currentUser?.likedCategories || ['cute', 'playdate'];
        const targetCats = user.likedCategories || ['cute'];
        const commonCat = myCats.filter((c) => targetCats.includes(c)).length;
        if (commonCat > 0) score += commonCat * 10;

        profile.distanceKm = distKm;
        profile.suggestionReason = reason;
        return { profile, score };
      }),
    );

    // Sort by algorithmic score descending
    scoredUsers.sort((a, b) => b.score - a.score);
    return scoredUsers.slice(0, 10).map((s) => s.profile);
  }

  // --- TOGGLE FOLLOW WITH LIVE DB COUNTERS ---
  async toggleFollow(
    targetUserId: string,
    currentUserId: string,
  ): Promise<{
    isFollowing: boolean;
    targetUser: UserProfileResponse;
    currentUser: UserProfileResponse;
  }> {
    const target = await this.userModel.findById(targetUserId).exec();
    const curr = await this.userModel.findById(currentUserId).exec();

    if (!target || !curr) throw new NotFoundException('User not found');

    const alreadyFollowing = (target.followers || []).includes(currentUserId);

    if (alreadyFollowing) {
      await this.userModel
        .findByIdAndUpdate(targetUserId, {
          $pull: { followers: currentUserId },
        })
        .exec();
      await this.userModel
        .findByIdAndUpdate(currentUserId, {
          $pull: { following: targetUserId },
        })
        .exec();
    } else {
      await this.userModel
        .findByIdAndUpdate(targetUserId, {
          $addToSet: { followers: currentUserId },
        })
        .exec();
      await this.userModel
        .findByIdAndUpdate(currentUserId, {
          $addToSet: { following: targetUserId },
        })
        .exec();
    }

    const [updatedTarget, updatedCurr] = await Promise.all([
      this.getUserProfile(targetUserId, currentUserId),
      this.getUserProfile(currentUserId, currentUserId),
    ]);

    return {
      isFollowing: !alreadyFollowing,
      targetUser: updatedTarget,
      currentUser: updatedCurr,
    };
  }

  // --- END-TO-END ENCRYPTED DIRECT MESSAGES (DELEGATED TO CommunityDmService) ---

  /** Generates a deterministic conversation ID for two users */
  getConversationId(u1: string, u2: string): string {
    return this.dmService.getConversationId(u1, u2);
  }

  async getEncryptedConversation(
    userId1: string,
    userId2: string,
  ): Promise<any[]> {
    return this.dmService.getEncryptedConversation(userId1, userId2);
  }

  async sendEncryptedMessage(dto: {
    senderId: string;
    recipientId: string;
    senderName?: string;
    senderAvatar?: string;
    recipientName?: string;
    recipientAvatar?: string;
    encryptedPayload: string;
    iv: string;
    mediaUrl?: string;
  }): Promise<DirectMessageDocument> {
    return this.dmService.sendEncryptedMessage(dto);
  }

  async getConversationsList(userId: string): Promise<any[]> {
    return this.dmService.getConversationsList(userId);
  }

  async markConversationAsRead(
    userId: string,
    partnerId: string,
  ): Promise<{ success: boolean }> {
    return this.dmService.markConversationAsRead(userId, partnerId);
  }

  // --- HARASSMENT & SAFETY REPORTING ---
  async submitReport(dto: {
    reporterId: string;
    reporterName: string;
    reportedUserId: string;
    reportedUserName: string;
    reason: string;
    details?: string;
    chatTranscriptSnippet?: string;
  }): Promise<CommunityReportDocument> {
    const report = new this.reportModel(dto);
    const saved = await report.save();
    this.logger.warn(
      `Safety Report submitted by ${dto.reporterName} against ${dto.reportedUserName}: ${dto.reason}`,
    );
    return saved;
  }
}
