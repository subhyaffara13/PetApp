jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    verify: jest.fn(),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyController } from './emergency.controller';
import { EmergencyService } from './emergency.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('EmergencyController', () => {
  let controller: EmergencyController;

  const mockEmergencyService = {
    findNearby: jest.fn().mockResolvedValue([
      { id: 'clinic-1', name: 'Haifa ER Center' },
    ]),
    getAllClinics: jest.fn().mockReturnValue([]),
    updateClinic: jest.fn().mockReturnValue({ id: 'clinic-1' }),
    broadcastLostPetAlert: jest.fn().mockResolvedValue({
      success: true,
      alert: { id: 'alert-1', petName: 'Luna' },
      message: 'Broadcasted',
    }),
    getActiveLostPetAlerts: jest.fn().mockResolvedValue([]),
    resolveLostPetAlert: jest.fn().mockResolvedValue({ id: 'alert-1', status: 'resolved' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmergencyController],
      providers: [
        { provide: EmergencyService, useValue: mockEmergencyService },
        { provide: JwtService, useClass: JwtService },
        OptionalJwtAuthGuard,
      ],
    })
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EmergencyController>(EmergencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return nearby emergency clinics', async () => {
    const res = await controller.getNearbyClinics({ lat: '32.794', lon: '34.9896' });
    expect(res).toEqual([{ id: 'clinic-1', name: 'Haifa ER Center' }]);
  });
});
