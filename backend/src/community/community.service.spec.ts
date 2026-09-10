import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CommunityService } from './community.service';
import { CommunityDmService } from './community-dm.service';
import {
  Story,
  Post,
  DirectMessage,
  ConversationThread,
  CommunityReport,
} from '../schemas/community.schema';
import { User } from '../schemas/user.schema';
import { PetProfile } from '../schemas/pet-profile.schema';

describe('CommunityService', () => {
  let service: CommunityService;

  const mockThreadModel: any = {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([
              {
                conversationId: 'u1_u2',
                participants: ['u1', 'u2'],
                participantMeta: {
                  u1: { name: 'User One', avatar: '' },
                  u2: { name: 'User Two', avatar: '' },
                },
                lastMessage: {
                  senderId: 'u1',
                  encryptedPayload: 'enc...',
                  iv: 'iv...',
                  sentAt: new Date(),
                },
                unreadCounts: { u2: 1, u1: 0 },
                messageCount: 5,
                updatedAt: new Date(),
              },
            ]),
          }),
        }),
      }),
    }),
    findOneAndUpdate: jest.fn().mockResolvedValue({}),
    updateOne: jest.fn().mockResolvedValue({}),
  };

  const mockPetProfileModel: any = {
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            _id: 'pet-1',
            name: 'Buddy',
            species: 'dog',
            breed: 'Golden Retriever',
            age: 3,
            photoUrl: 'https://example.com/buddy.jpg',
          },
        ]),
      }),
    }),
  };

  const mockStoryModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({ _id: 'story-1', ...dto }),
  }));

  mockStoryModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          _id: 'story-1',
          petName: 'Luna',
          mediaUrl: 'https://img.com/luna.jpg',
        },
      ]),
    }),
  });

  const mockPostModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({ _id: 'post-1', ...dto }),
  }));

  const mockPostsList = [
    {
      _id: 'post-1',
      petName: 'Rocky',
      likesCount: 5,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
    },
  ];

  mockPostModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPostsList),
      }),
      exec: jest.fn().mockResolvedValue(mockPostsList),
    }),
  });

  mockPostModel.findById = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      _id: 'post-1',
      likesCount: 5,
      likedBy: [],
      comments: [],
      save: jest.fn().mockResolvedValue({
        _id: 'post-1',
        likesCount: 6,
        likedBy: ['user-1'],
      }),
    }),
  });

  mockPostModel.countDocuments = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(3),
  });

  const mockDmModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({ _id: 'dm-1', ...dto }),
  }));

  mockDmModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            {
              _id: 'dm-1',
              senderId: 'u1',
              recipientId: 'u2',
              encryptedPayload: 'enc...',
              iv: 'iv...',
            },
          ]),
        }),
        exec: jest.fn().mockResolvedValue([
          {
            _id: 'dm-1',
            senderId: 'u1',
            recipientId: 'u2',
            encryptedPayload: 'enc...',
            iv: 'iv...',
          },
        ]),
      }),
      exec: jest.fn().mockResolvedValue([]),
    }),
  });
  mockDmModel.countDocuments = jest.fn().mockResolvedValue(10);
  mockDmModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 });

  const mockReportModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest
      .fn()
      .mockResolvedValue({ _id: 'rep-1', status: 'pending', ...dto }),
  }));

  const mockUserModel: any = {
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'user-1',
        name: 'Subhy',
        email: 'subhy@example.com',
        followers: [],
        following: [],
        petBreeds: ['Golden Retriever'],
        likedCategories: ['cute'],
      }),
    }),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    find: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'user-1' }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        CommunityDmService,
        { provide: getModelToken(Story.name), useValue: mockStoryModel },
        { provide: getModelToken(Post.name), useValue: mockPostModel },
        { provide: getModelToken(DirectMessage.name), useValue: mockDmModel },
        {
          provide: getModelToken(ConversationThread.name),
          useValue: mockThreadModel,
        },
        {
          provide: getModelToken(CommunityReport.name),
          useValue: mockReportModel,
        },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(PetProfile.name), useValue: mockPetProfileModel },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get active stories', async () => {
    const stories = await service.getStories();
    expect(Array.isArray(stories)).toBe(true);
    expect(stories.length).toBe(1);
  });

  it('should get community feed', async () => {
    const feed = await service.getFeed();
    expect(Array.isArray(feed)).toBe(true);
    expect(feed.length).toBe(1);
  });

  it('should toggle like on a post', async () => {
    const res = await service.toggleLike('post-1', 'user-1');
    expect(res).toBeDefined();
    expect(res.likesCount).toBe(6);
  });

  it('should fetch user social profile with counts', async () => {
    const profile = await service.getUserProfile('user-1');
    expect(profile.name).toBe('Subhy');
    expect(profile.postsCount).toBe(3);
    expect(profile.followersCount).toBe(0);
  });

  it('should get conversations list using optimized thread summaries', async () => {
    const convos = await service.getConversationsList('u1');
    expect(Array.isArray(convos)).toBe(true);
    expect(convos.length).toBe(1);
    expect(convos[0].conversationId).toBe('u1_u2');
    expect(convos[0].unreadCount).toBe(0);
  });

  it('should send an encrypted direct message and upsert thread', async () => {
    const msg = await service.sendEncryptedMessage({
      senderId: 'u1',
      recipientId: 'u2',
      senderName: 'User One',
      recipientName: 'User Two',
      encryptedPayload: 'secret_ciphertext',
      iv: 'nonce_iv',
    });
    expect(msg).toBeDefined();
    expect(mockThreadModel.findOneAndUpdate).toHaveBeenCalled();
  });

  it('should mark conversation as read', async () => {
    const res = await service.markConversationAsRead('u2', 'u1');
    expect(res.success).toBe(true);
    expect(mockDmModel.updateMany).toHaveBeenCalled();
    expect(mockThreadModel.updateOne).toHaveBeenCalled();
  });

  it('should submit a safety/harassment report', async () => {
    const report = await service.submitReport({
      reporterId: 'user-1',
      reporterName: 'Subhy',
      reportedUserId: 'user-spammer',
      reportedUserName: 'Spam Bot',
      reason: 'spam',
      details: 'Unwanted promotional DMs',
    });
    expect(report).toBeDefined();
    expect(report.reason).toBe('spam');
    expect(report.status).toBe('pending');
  });
});
