import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { EmergencyService } from './emergency.service';
import { LostPetAlert } from '../schemas/emergency-dispatch.schema';
import { User } from '../schemas/user.schema';

describe('EmergencyService', () => {
  let service: EmergencyService;

  const mockUserModel: any = {
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    }),
    findByIdAndUpdate: jest.fn().mockResolvedValue({
      _id: 'user-123',
      liveLocation: { lat: 32.794, lng: 34.9896, isActive: true },
    }),
  };

  const mockHttpService = {
    get: jest.fn().mockReturnValue(of({ data: { results: [] } })),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'GOOGLE_PLACES_API_KEY') return 'test-key';
      return null;
    }),
  };

  const mockLostPetModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({ _id: 'alert-123', ...dto }),
  }));

  mockLostPetModel.findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  });

  mockLostPetModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { _id: 'alert-123', petName: 'Buddy', status: 'active' },
        ]),
      }),
    }),
  });

  mockLostPetModel.findByIdAndUpdate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ _id: 'alert-123', status: 'resolved' }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmergencyService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getModelToken(LostPetAlert.name), useValue: mockLostPetModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<EmergencyService>(EmergencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return clinics on findNearby', async () => {
    const clinics = await service.findNearby(32.794, 34.9896);
    expect(Array.isArray(clinics)).toBe(true);
  });

  it('should broadcast lost pet alert', async () => {
    const res = await service.broadcastLostPetAlert({
      ownerId: 'user-1',
      ownerName: 'Subhy',
      ownerPhone: '050-1234567',
      petId: 'pet-1',
      petName: 'Max',
      petBreed: 'Labrador',
      lastSeenLocation: 'Haifa Port',
      lastSeenCoordinates: { lat: 32.81, lon: 34.99 },
    });

    expect(res.success).toBe(true);
    expect(res.message).toContain('broadcasted');
  });
});
