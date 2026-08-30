import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CommunityService } from './community.service';
import { Story, Post, DirectMessage, CommunityReport } from '../schemas/community.schema';
import { User } from '../schemas/user.schema';

describe('CommunityService', () => {
  let service: CommunityService;

  const mockStoryModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({ _id: 'story-1', ...dto }),
  }));

  mockStoryModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        { _id: 'story-1', petName: 'Luna', mediaUrl: 'https://img.com/luna.jpg' },
      ]),
    }),
  });

  const mockPostModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({ _id: 'post-1', ...dto }),
  }));

  mockPostModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        { _id: 'post-1', petName: 'Rocky', likesCount: 5, likedBy: [], comments: [] },
      ]),
    }),
  });

  mockPostModel.findById = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      _id: 'post-1',
      likesCount: 5,
      likedBy: [],
      comments: [],
      save: jest.fn().mockResolvedValue({ _id: 'post-1', likesCount: 6, likedBy: ['user-1'] }),
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
        exec: jest.fn().mockResolvedValue([
          { _id: 'dm-1', senderId: 'u1', recipientId: 'u2', encryptedPayload: 'enc...', iv: 'iv...' },
        ]),
      }),
      exec: jest.fn().mockResolvedValue([]),
    }),
  });

  const mockReportModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({ _id: 'rep-1', status: 'pending', ...dto }),
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
        { provide: getModelToken(Story.name), useValue: mockStoryModel },
        { provide: getModelToken(Post.name), useValue: mockPostModel },
        { provide: getModelToken(DirectMessage.name), useValue: mockDmModel },
        { provide: getModelToken(CommunityReport.name), useValue: mockReportModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
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
