import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument, Post, PostDocument, DirectMessage, DirectMessageDocument, CommunityReport, CommunityReportDocument } from '../schemas/community.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { PetProfile, PetProfileDocument } from '../schemas/pet-profile.schema';

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
    @InjectModel(DirectMessage.name) private dmModel: Model<DirectMessageDocument>,
    @InjectModel(CommunityReport.name) private reportModel: Model<CommunityReportDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(PetProfile.name) private petProfileModel: Model<PetProfileDocument>,
  ) {}

  async onModuleInit() {
    await this.cleanNonSubhyUsers();
  }

  /** Removes any legacy dummy users not named Subhy Affara so fresh user accounts can be tested */
  async cleanNonSubhyUsers(): Promise<{ deletedCount: number }> {
    try {
      const res = await this.userModel.deleteMany({
        name: { $not: /subhy\s*affara|subhi/i },
        email: { $not: /subhyaffara|subhi/i },
      }).exec();
      if (res.deletedCount > 0) {
        this.logger.log(`Cleaned up ${res.deletedCount} legacy test accounts; retained Subhy Affara.`);
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
      return await this.storyModel.find({ expiresAt: { $gt: now } }).sort({ createdAt: -1 }).exec();
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

  // --- POSTS ---
  async getFeed(): Promise<PostDocument[]> {
    try {
      return await this.postModel.find().sort({ createdAt: -1 }).exec();
    } catch {
      return [];
    }
  }

  async getPostsByUser(userId: string): Promise<PostDocument[]> {
    try {
      return await this.postModel.find({ authorId: userId }).sort({ createdAt: -1 }).exec();
    } catch {
      return [];
    }
  }

  async createPost(dto: any): Promise<PostDocument> {
    const post = new this.postModel(dto);
    const saved = await post.save();

    // Increment user's liked category preferences if available
    if (dto.authorId && dto.category) {
      await this.userModel.findByIdAndUpdate(dto.authorId, {
        $addToSet: { likedCategories: dto.category },
      }).exec();
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
    return post.save();
  }

  async addComment(postId: string, comment: { userName: string; userAvatar: string; text: string }): Promise<any> {
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Post not found');

    post.comments.push({ ...comment, createdAt: new Date() });
    return post.save();
  }

  // --- LIVE USER PROFILES (100% Database Powered) ---
  async getUserProfile(targetUserId: string, currentUserId?: string): Promise<UserProfileResponse> {
    let user: UserDocument | null = null;
    try {
      user = await this.userModel.findById(targetUserId).exec();
    } catch {
      user = await this.userModel.findOne({ email: targetUserId }).exec();
    }

    if (!user) {
      // Return a default profile structure if querying before login
      return {
        id: targetUserId,
        name: 'Pet Parent',
        handle: '@petparent',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: 'Animal lover in Haifa 🐾',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isFollowing: false,
      };
    }

    const postsCount = await this.postModel.countDocuments({ authorId: user._id.toString() }).exec();
    const followers = user.followers || [];
    const following = user.following || [];
    const isFollowing = currentUserId ? followers.includes(currentUserId) : false;

    // Query public pets safely (NO medical records, allergies, microchip IDs, or sensitive notes)
    let pets: PublicPetSummary[] = [];
    try {
      const rawPets = await this.petProfileModel.find({
        $or: [
          { ownerId: user._id.toString() },
          { ownerId: user.email },
          { 'coParents.userId': user._id.toString() },
        ],
        isArchived: { $ne: true },
      }).select('name species breed age dateOfBirth gender photoUrl').exec();

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
      avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: user.bio || 'Proud pet parent 🐾',
      role: user.role,
      isVerified: user.isVerified || false,
      verificationBadge: user.verificationBadge || (user.role === 'clinic_admin' ? 'veterinarian' : user.role === 'store_merchant' ? 'pet_store' : user.role === 'shelter_org' ? 'animal_shelter' : user.role === 'superadmin' ? 'platform_admin' : 'none'),
      organizationName: user.organizationName || '',
      followersCount: followers.length,
      followingCount: following.length,
      postsCount,
      isFollowing,
      petBreeds: pets.length > 0 ? pets.map((p) => p.breed) : (user.petBreeds || ['Golden Retriever']),
      pets,
      posts,
    };
  }

  async checkHandleAvailability(rawHandle: string, currentUserId?: string): Promise<{ available: boolean; handle: string; message: string }> {
    if (!rawHandle || !rawHandle.trim()) {
      return { available: false, handle: '', message: 'Handle cannot be empty.' };
    }
    let handle = rawHandle.trim().toLowerCase();
    if (!handle.startsWith('@')) handle = `@${handle}`;

    const isValid = /^@[a-z0-9_]{3,24}$/.test(handle);
    if (!isValid) {
      return { available: false, handle, message: 'Handle must be 3-24 characters (letters, numbers, underscores only).' };
    }

    const query: any = { handle };
    if (currentUserId && currentUserId !== 'current-user' && currentUserId !== 'guest-anonymous' && currentUserId !== 'guest') {
      try {
        query._id = { $ne: currentUserId };
      } catch {}
    }

    const existing = await this.userModel.findOne(query).exec();
    if (existing) {
      return { available: false, handle, message: `The handle ${handle} is already taken.` };
    }
    return { available: true, handle, message: `${handle} is available!` };
  }

  async updateProfile(userId: string, dto: { name?: string; bio?: string; handle?: string; avatar?: string; petBreeds?: string[] }): Promise<UserProfileResponse> {
    if (!userId || userId === 'guest' || userId === 'guest-anonymous' || userId === 'current-user') {
      // Return updated transient profile
      return {
        id: 'guest',
        name: dto.name || 'Pet Parent',
        handle: dto.handle || '@petparent',
        avatar: dto.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
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

    const updated = await this.userModel.findByIdAndUpdate(userId, { $set: dto }, { new: true }).exec();
    if (!updated) throw new NotFoundException('User not found');
    return this.getUserProfile(userId);
  }

  // --- SEARCH USERS ---
  async searchUsers(query: string, currentUserId?: string): Promise<UserProfileResponse[]> {
    if (!query.trim()) return [];
    const regex = new RegExp(query.trim(), 'i');

    const users = await this.userModel.find({
      $or: [{ name: regex }, { handle: regex }, { email: regex }],
    }).limit(15).exec();

    return Promise.all(users.map((u) => this.getUserProfile(u._id.toString(), currentUserId)));
  }

  // --- SMART RECOMMENDATION ALGORITHM ---
  async getSuggestedUsers(currentUserId?: string, lat: number = 32.8012, lon: number = 34.9855): Promise<UserProfileResponse[]> {
    let currentUser: UserDocument | null = null;
    if (currentUserId && currentUserId !== 'current-user') {
      try { currentUser = await this.userModel.findById(currentUserId).exec(); } catch {}
    }

    const allUsers = await this.userModel.find({
      _id: { $ne: currentUser?._id },
      email: { $nin: ['clinic@petsos.app', 'store@petsos.app', 'demo@petsos.app', 'admin@petsos.app'] },
      isActive: true,
    }).limit(30).exec();

    const scoredUsers = await Promise.all(
      allUsers.map(async (user) => {
        const profile = await this.getUserProfile(user._id.toString(), currentUserId);
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
        const distKm = Math.round(
          Math.sqrt(Math.pow((lat - uLat) * 111, 2) + Math.pow((lon - uLon) * 111 * Math.cos(lat * (Math.PI / 180)), 2)) * 10
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
      })
    );

    // Sort by algorithmic score descending
    scoredUsers.sort((a, b) => b.score - a.score);
    return scoredUsers.slice(0, 10).map((s) => s.profile);
  }

  // --- TOGGLE FOLLOW WITH LIVE DB COUNTERS ---
  async toggleFollow(targetUserId: string, currentUserId: string): Promise<{ isFollowing: boolean; targetUser: UserProfileResponse; currentUser: UserProfileResponse }> {
    const target = await this.userModel.findById(targetUserId).exec();
    const curr = await this.userModel.findById(currentUserId).exec();

    if (!target || !curr) throw new NotFoundException('User not found');

    const alreadyFollowing = (target.followers || []).includes(currentUserId);

    if (alreadyFollowing) {
      await this.userModel.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } }).exec();
      await this.userModel.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } }).exec();
    } else {
      await this.userModel.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } }).exec();
      await this.userModel.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } }).exec();
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

  // --- END-TO-END ENCRYPTED DIRECT MESSAGES ---
  async getEncryptedConversation(userId1: string, userId2: string): Promise<DirectMessageDocument[]> {
    return this.dmModel.find({
      $or: [
        { senderId: userId1, recipientId: userId2 },
        { senderId: userId2, recipientId: userId1 },
      ],
    }).sort({ createdAt: 1 }).limit(100).exec();
  }

  async sendEncryptedMessage(dto: {
    senderId: string;
    recipientId: string;
    senderName: string;
    senderAvatar: string;
    recipientName: string;
    recipientAvatar: string;
    encryptedPayload: string;
    iv: string;
    mediaUrl?: string;
  }): Promise<DirectMessageDocument> {
    const msg = new this.dmModel(dto);
    return msg.save();
  }

  async getConversationsList(userId: string): Promise<any[]> {
    const messages = await this.dmModel.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
    }).sort({ createdAt: -1 }).exec();

    const partners = new Map<string, any>();
    for (const m of messages) {
      const partnerId = m.senderId === userId ? m.recipientId : m.senderId;
      if (!partners.has(partnerId)) {
        partners.set(partnerId, {
          partnerId,
          partnerName: m.senderId === userId ? m.recipientName : m.senderName,
          partnerAvatar: m.senderId === userId ? m.recipientAvatar : m.senderAvatar,
          lastMessageAt: (m as any).createdAt || new Date(),
          lastEncryptedPayload: m.encryptedPayload,
          iv: m.iv,
          isRead: m.isRead,
        });
      }
    }
    return Array.from(partners.values());
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
    this.logger.warn(`Safety Report submitted by ${dto.reporterName} against ${dto.reportedUserName}: ${dto.reason}`);
    return saved;
  }
}
