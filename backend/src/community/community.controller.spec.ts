jest.mock('@nestjs/passport', () => ({
  AuthGuard: () =>
    class MockAuthGuard {
      canActivate() {
        return true;
      }
    },
}));

jest.mock('@nestjs/jwt', () => ({
  JwtService: class MockJwtService {
    verify() {
      return { id: 'user-123', sub: 'user-123' };
    }
    sign() {
      return 'mock-token';
    }
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { SheltersService } from '../shelters/shelters.service';
import { JwtService } from '@nestjs/jwt';

describe('CommunityController (Security & Authorization)', () => {
  let controller: CommunityController;

  const mockCommunityService = {
    getConversationsList: jest.fn().mockResolvedValue([]),
    getEncryptedConversation: jest.fn().mockResolvedValue([]),
    sendEncryptedMessage: jest.fn().mockImplementation((dto) => Promise.resolve({ ...dto, _id: 'msg-1' })),
    deletePost: jest.fn().mockResolvedValue({ success: true }),
    submitReport: jest.fn().mockResolvedValue({ _id: 'rep-1' }),
  };

  const mockSheltersService = {
    find: jest.fn().mockResolvedValue([]),
    getAdoptablePets: jest.fn().mockResolvedValue([]),
    createAdoptablePet: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [
        { provide: CommunityService, useValue: mockCommunityService },
        { provide: SheltersService, useValue: mockSheltersService },
        { provide: JwtService, useClass: JwtService },
      ],
    }).compile();

    controller = module.get<CommunityController>(CommunityController);
    jest.clearAllMocks();
  });

  describe('Direct Messages Security (C-2)', () => {
    it('getConversations extracts userId strictly from authenticated req.user.id', async () => {
      const mockReq = { user: { id: 'legit-user-123' }, query: { userId: 'victim-456' } };
      await controller.getConversations(mockReq);

      expect(mockCommunityService.getConversationsList).toHaveBeenCalledWith('legit-user-123');
      expect(mockCommunityService.getConversationsList).not.toHaveBeenCalledWith('victim-456');
    });

    it('getMessages extracts userId strictly from req.user.id', async () => {
      const mockReq = { user: { id: 'legit-user-123' }, query: { userId: 'victim-456' } };
      await controller.getMessages('partner-789', mockReq);

      expect(mockCommunityService.getEncryptedConversation).toHaveBeenCalledWith(
        'legit-user-123',
        'partner-789',
      );
    });

    it('sendMessage overwrites senderId with authenticated req.user.id to prevent spoofing', async () => {
      const mockReq = { user: { id: 'authenticated-user' } };
      const spoofPayload = {
        recipientId: 'target-recipient',
        senderId: 'spoofed-attacker-identity',
        encryptedPayload: 'secret',
        iv: 'iv-value',
      };

      await controller.sendMessage(spoofPayload as any, mockReq);

      expect(mockCommunityService.sendEncryptedMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 'target-recipient',
          senderId: 'authenticated-user',
        }),
      );
    });
  });

  describe('Post Deletion Authorization (C-3)', () => {
    it('passes authenticated req.user.id and role to service.deletePost', async () => {
      const mockReq = { user: { id: 'author-user-1', role: 'customer' } };
      await controller.deletePost('post-100', mockReq);

      expect(mockCommunityService.deletePost).toHaveBeenCalledWith('post-100', 'author-user-1', 'customer');
    });
  });
});
