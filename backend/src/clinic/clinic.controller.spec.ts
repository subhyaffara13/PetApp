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
      return { id: 'vet-123', sub: 'vet-123' };
    }
    sign() {
      return 'mock-token';
    }
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ClinicController } from './clinic.controller';
import { ClinicService } from './clinic.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('ClinicController (Medical Records & RBAC - C-5, M-3)', () => {
  let controller: ClinicController;

  const mockClinicService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 'clinic-1', name: 'Haifa ER' }),
    verifyClinicToken: jest.fn().mockResolvedValue(true),
    updateCapacity: jest.fn().mockResolvedValue({ id: 'clinic-1', capacityStatus: 'limited' }),
    getAllRecords: jest.fn().mockResolvedValue([]),
    getRecordsForPet: jest.fn().mockResolvedValue([]),
    createMedicalRecord: jest.fn().mockImplementation((dto) => Promise.resolve({ ...dto, _id: 'rec-1' })),
    createDispatch: jest.fn().mockImplementation((dto) => Promise.resolve({ ...dto, _id: 'disp-1' })),
    getDispatchesForClinic: jest.fn().mockResolvedValue([]),
    updateDispatchStatus: jest.fn().mockResolvedValue({ status: 'en_route' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClinicController],
      providers: [
        { provide: ClinicService, useValue: mockClinicService },
        { provide: JwtService, useClass: JwtService },
      ],
    })
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ClinicController>(ClinicController);
    jest.clearAllMocks();
  });

  describe('Clinical Medical Records Access (C-5 & M-3)', () => {
    it('throws ForbiddenException when role is customer', async () => {
      const mockReq = { user: { id: 'cust-1', role: 'customer' } };
      await expect(controller.getAllRecords(mockReq)).rejects.toThrow(ForbiddenException);
    });

    it('allows clinic_admin to fetch records with pagination', async () => {
      const mockReq = { user: { id: 'vet-1', role: 'clinic_admin' } };
      await controller.getAllRecords(mockReq, '2', '15');

      expect(mockClinicService.getAllRecords).toHaveBeenCalledWith(2, 15);
    });

    it('allows superadmin to fetch records with default pagination', async () => {
      const mockReq = { user: { id: 'admin-1', role: 'superadmin' } };
      await controller.getAllRecords(mockReq);

      expect(mockClinicService.getAllRecords).toHaveBeenCalledWith(1, 20);
    });

    it('rejects medical record creation by regular customers', async () => {
      const mockReq = { user: { id: 'cust-1', role: 'customer' } };
      await expect(
        controller.createMedicalRecord({ petId: 'pet-1', diagnosis: 'Healthy' }, mockReq),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows clinic_admin to create medical records', async () => {
      const mockReq = { user: { id: 'vet-1', role: 'clinic_admin' } };
      const record = await controller.createMedicalRecord(
        { petId: 'pet-1', diagnosis: 'Checkup' },
        mockReq,
      );

      expect(record._id).toBe('rec-1');
      expect(mockClinicService.createMedicalRecord).toHaveBeenCalledWith({
        petId: 'pet-1',
        diagnosis: 'Checkup',
      });
    });
  });

  describe('Capacity and Dispatches (C-5)', () => {
    it('verifies clinic token when updating capacity', async () => {
      await controller.updateCapacity('clinic-1', { capacityStatus: 'limited' }, 'valid-token');
      expect(mockClinicService.verifyClinicToken).toHaveBeenCalledWith('clinic-1', 'valid-token');
      expect(mockClinicService.updateCapacity).toHaveBeenCalledWith('clinic-1', 'limited');
    });

    it('rejects dispatch inspection when user is not clinic staff or admin', async () => {
      const mockReq = { user: { id: 'cust-1', role: 'customer' } };
      await expect(controller.getDispatches('clinic-1', mockReq)).rejects.toThrow(ForbiddenException);
    });
  });
});
