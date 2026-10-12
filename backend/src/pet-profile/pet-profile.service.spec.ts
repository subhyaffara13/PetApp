import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PetProfileService } from './pet-profile.service';
import { PetProfile } from '../schemas/pet-profile.schema';
import { CoParentRequest } from '../schemas/co-parent-request.schema';
import { User } from '../schemas/user.schema';
import { EmailService } from '../email/email.service';

describe('PetProfileService (Ownership & Authorization - C-6)', () => {
  let service: PetProfileService;
  const validPetId = '507f1f77bcf86cd799439011';

  const mockPetDoc = {
    _id: validPetId,
    petId: 'PET-1234-A1',
    name: 'Rex',
    ownerId: 'owner-user-1',
    coParents: [{ userId: 'coparent-user-2' }],
    save: jest.fn(),
  };

  const mockPetProfileModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
  };

  const mockCoParentRequestModel = {
    find: jest.fn(),
    create: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
  };

  const mockEmailService = {
    sendCoParentInvitation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetProfileService,
        { provide: getModelToken(PetProfile.name), useValue: mockPetProfileModel },
        { provide: getModelToken(CoParentRequest.name), useValue: mockCoParentRequestModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<PetProfileService>(PetProfileService);
    jest.clearAllMocks();
  });

  describe('update authorization', () => {
    it('throws UnauthorizedException when userId is missing', async () => {
      await expect(
        service.update(validPetId, { name: 'HackedRex' }, undefined),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException when non-owner attempts to modify pet', async () => {
      mockPetProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPetDoc),
      });

      await expect(
        service.update(validPetId, { name: 'HackedRex' }, 'stranger-user-999'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows owner to update their own pet', async () => {
      mockPetProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPetDoc),
      });
      mockPetProfileModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockPetDoc, name: 'Rex Updated' }),
      });

      const result = await service.update(validPetId, { name: 'Rex Updated' }, 'owner-user-1');
      expect(result.name).toBe('Rex Updated');
    });

    it('allows registered co-parent to update the pet', async () => {
      mockPetProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPetDoc),
      });
      mockPetProfileModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockPetDoc, name: 'Rex CoParent' }),
      });

      const result = await service.update(validPetId, { name: 'Rex CoParent' }, 'coparent-user-2');
      expect(result.name).toBe('Rex CoParent');
    });
  });

  describe('remove authorization', () => {
    it('throws UnauthorizedException when userId is missing', async () => {
      await expect(service.remove(validPetId, undefined)).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException when stranger attempts to delete pet', async () => {
      mockPetProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPetDoc),
      });

      await expect(service.remove(validPetId, 'stranger-user-999')).rejects.toThrow(ForbiddenException);
    });
  });
});
