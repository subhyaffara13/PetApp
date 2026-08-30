import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument, Post, PostDocument, DirectMessage, DirectMessageDocument, CommunityReport, CommunityReportDocument } from '../schemas/community.schema';
import { User, UserDocument } from '../schemas/user.schema';

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
}

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(DirectMessage.name) private dmModel: Model<DirectMessageDocument>,
    @InjectModel(CommunityReport.name) private reportModel: Model<CommunityReportDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

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

    return {
      id: user._id.toString(),
      name: user.name,
      handle: user.handle || `@${user.email.split('@')[0]}`,
      avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: user.bio || 'Proud pet parent 🐾',
      followersCount: followers.length,
      followingCount: following.length,
      postsCount,
      isFollowing,
      petBreeds: user.petBreeds || ['Golden Retriever'],
    };
  }

  async updateProfile(userId: string, dto: { name?: string; bio?: string; handle?: string; avatar?: string; petBreeds?: string[] }): Promise<UserProfileResponse> {
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
