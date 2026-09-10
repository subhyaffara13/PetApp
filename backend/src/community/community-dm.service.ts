import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DirectMessage,
  DirectMessageDocument,
  ConversationThread,
  ConversationThreadDocument,
} from '../schemas/community.schema';
import { toSafeString } from '../utils/sanitize';

@Injectable()
export class CommunityDmService {
  private readonly logger = new Logger(CommunityDmService.name);

  constructor(
    @InjectModel(DirectMessage.name)
    private dmModel: Model<DirectMessageDocument>,
    @InjectModel(ConversationThread.name)
    private threadModel: Model<ConversationThreadDocument>,
  ) {}

  /** Generates a deterministic conversation ID for two users */
  getConversationId(u1: string, u2: string): string {
    return [u1, u2].sort().join('_');
  }

  async getEncryptedConversation(
    userId1: string,
    userId2: string,
  ): Promise<any[]> {
    const conversationId = this.getConversationId(userId1, userId2);

    // Primary efficient query by conversationId
    let messages = await this.dmModel
      .find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean()
      .exec();

    // Fallback for legacy messages that didn't have conversationId populated
    if (messages.length === 0) {
      messages = await this.dmModel
        .find({
          $or: [
            { senderId: userId1, recipientId: userId2 },
            { senderId: userId2, recipientId: userId1 },
          ],
        })
        .sort({ createdAt: 1 })
        .limit(100)
        .lean()
        .exec();
    }

    // Auto-mark incoming unread messages as read asynchronously
    this.markConversationAsRead(userId1, userId2).catch(() => {});

    return messages;
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
    const conversationId = this.getConversationId(dto.senderId, dto.recipientId);

    // 1. Save lean message document
    const msg = new this.dmModel({
      ...dto,
      conversationId,
      isRead: false,
    });
    const savedMsg = await msg.save();

    // 2. Upsert ConversationThread summary (prevents scanning messages on list load)
    try {
      const now = new Date();
      const update: any = {
        $set: {
          lastMessage: {
            senderId: dto.senderId,
            encryptedPayload: dto.encryptedPayload,
            iv: dto.iv,
            mediaUrl: dto.mediaUrl || '',
            sentAt: now,
            isRead: false,
          },
          [`participantMeta.${dto.senderId}`]: {
            name: dto.senderName || 'Pet Parent',
            avatar: dto.senderAvatar || '',
          },
          [`participantMeta.${dto.recipientId}`]: {
            name: dto.recipientName || 'Pet Parent',
            avatar: dto.recipientAvatar || '',
          },
          updatedAt: now,
        },
        $addToSet: { participants: { $each: [dto.senderId, dto.recipientId] } },
        $inc: {
          messageCount: 1,
          [`unreadCounts.${dto.recipientId}`]: 1,
        },
      };

      await this.threadModel.findOneAndUpdate({ conversationId }, update, {
        upsert: true,
        new: true,
      });

      // 3. Database Anti-Bloat Safety: Cap conversation at 500 messages to prevent unbounded Atlas storage growth
      const count = await this.dmModel.countDocuments({ conversationId });
      if (count > 500) {
        const excess = count - 500;
        const oldest = await this.dmModel
          .find({ conversationId })
          .sort({ createdAt: 1 })
          .limit(excess)
          .select('_id')
          .lean()
          .exec();
        if (oldest.length > 0) {
          const idsToDelete = oldest.map((m) => m._id);
          await this.dmModel.deleteMany({ _id: { $in: idsToDelete } });
        }
      }
    } catch (err) {
      this.logger.warn('Conversation thread upsert note:', err);
    }

    return savedMsg;
  }

  async getConversationsList(userId: string): Promise<any[]> {
    const safeUserId = toSafeString(userId);
    if (!safeUserId) return [];
    // 1. Fast O(1) fetch from ConversationThread summaries
    try {
      const threads = await this.threadModel
        .find({ participants: safeUserId })
        .sort({ updatedAt: -1 })
        .limit(40)
        .lean()
        .exec();

      if (threads && threads.length > 0) {
        return threads.map((t) => {
          const partnerId = t.participants.find((p) => p !== safeUserId) || safeUserId;
          const partnerMeta = t.participantMeta?.[partnerId] || {
            name: 'Pet Parent',
            avatar: '',
          };
          const unreadCount = t.unreadCounts?.[safeUserId] || 0;

          return {
            conversationId: t.conversationId,
            partnerId,
            partnerName: partnerMeta.name || 'Pet Parent',
            partnerAvatar: partnerMeta.avatar || '',
            lastMessageAt: t.lastMessage?.sentAt || t.updatedAt,
            lastEncryptedPayload: t.lastMessage?.encryptedPayload || '',
            iv: t.lastMessage?.iv || '',
            isRead: unreadCount === 0,
            unreadCount,
            messageCount: t.messageCount || 0,
          };
        });
      }
    } catch (err) {
      this.logger.warn('ThreadModel query fallback:', err);
    }

    // 2. Fallback to legacy dmModel scanning for historical chats without threads
    const messages = await this.dmModel
      .find({
        $or: [{ senderId: userId }, { recipientId: userId }],
      })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()
      .exec();

    const partners = new Map<string, any>();
    for (const m of messages) {
      const partnerId = m.senderId === userId ? m.recipientId : m.senderId;
      if (!partners.has(partnerId)) {
        partners.set(partnerId, {
          conversationId:
            (m as any).conversationId || this.getConversationId(userId, partnerId),
          partnerId,
          partnerName: m.senderId === userId ? m.recipientName : m.senderName,
          partnerAvatar:
            m.senderId === userId ? m.recipientAvatar : m.senderAvatar,
          lastMessageAt: (m as any).createdAt || new Date(),
          lastEncryptedPayload: m.encryptedPayload,
          iv: m.iv,
          isRead: m.isRead,
          unreadCount: m.recipientId === userId && !m.isRead ? 1 : 0,
        });
      }
    }
    return Array.from(partners.values());
  }

  async markConversationAsRead(
    userId: string,
    partnerId: string,
  ): Promise<{ success: boolean }> {
    const safeUserId = toSafeString(userId);
    const safePartnerId = toSafeString(partnerId);
    if (!safeUserId || !safePartnerId) return { success: false };
    const conversationId = this.getConversationId(safeUserId, safePartnerId);
    try {
      await Promise.all([
        this.dmModel.updateMany(
          { conversationId, recipientId: safeUserId, isRead: false },
          { $set: { isRead: true } },
        ),
        this.threadModel.updateOne(
          { conversationId },
          { $set: { [`unreadCounts.${safeUserId}`]: 0 } },
        ),
      ]);
    } catch (err) {
      this.logger.warn('Mark as read note:', err);
    }
    return { success: true };
  }
}
