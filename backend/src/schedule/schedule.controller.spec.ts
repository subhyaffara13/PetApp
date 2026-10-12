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
      return { id: 'user-sched', sub: 'user-sched' };
    }
    sign() {
      return 'mock-token';
    }
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('ScheduleController (Security & User ID Reference - C-9)', () => {
  let controller: ScheduleController;

  const mockScheduleService = {
    bookAppointment: jest.fn().mockImplementation((dto) => Promise.resolve({ ...dto, _id: 'apt-1' })),
    getAppointmentsForPet: jest.fn().mockResolvedValue([]),
    getAppointmentsForUser: jest.fn().mockResolvedValue([{ _id: 'apt-1', title: 'Vet Visit' }]),
    cancelAppointment: jest.fn().mockResolvedValue({ status: 'cancelled' }),
    getRemindersForPet: jest.fn().mockResolvedValue([]),
    getRemindersForUser: jest.fn().mockResolvedValue([{ _id: 'rem-1', title: 'Heartworm Pill' }]),
    createReminder: jest.fn().mockImplementation((dto) => Promise.resolve({ ...dto, _id: 'rem-1' })),
    toggleReminder: jest.fn().mockResolvedValue({ isEnabled: false }),
    deleteReminder: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        { provide: ScheduleService, useValue: mockScheduleService },
        { provide: JwtService, useClass: JwtService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ScheduleController>(ScheduleController);
    jest.clearAllMocks();
  });

  describe('Appointment Booking (C-9)', () => {
    it('extracts ownerId strictly from req.user.id', async () => {
      const mockReq = { user: { id: 'authenticated-owner-123' } };
      const dto = { petId: 'pet-1', clinicId: 'clinic-1', date: '2026-11-01' };

      const res = await controller.bookAppointment(dto, mockReq);

      expect(mockScheduleService.bookAppointment).toHaveBeenCalledWith({
        ...dto,
        ownerId: 'authenticated-owner-123',
      });
      expect(res.ownerId).toBe('authenticated-owner-123');
    });

    it('returns empty array if user tries to view appointments of another user', async () => {
      const mockReq = { user: { id: 'user-alice', role: 'customer' } };
      const res = await controller.getUserAppointments('user-bob', mockReq);

      expect(res).toEqual([]);
      expect(mockScheduleService.getAppointmentsForUser).not.toHaveBeenCalled();
    });

    it('allows superadmin to view appointments of any user', async () => {
      const mockReq = { user: { id: 'admin-1', role: 'superadmin' } };
      const res = await controller.getUserAppointments('user-bob', mockReq);

      expect(mockScheduleService.getAppointmentsForUser).toHaveBeenCalledWith('user-bob');
      expect(res.length).toBe(1);
    });
  });

  describe('Reminders (C-9)', () => {
    it('creates reminder using authenticated req.user.id', async () => {
      const mockReq = { user: { id: 'authenticated-user-456' } };
      const dto = { petId: 'pet-2', title: 'Vaccine Reminder', time: '10:00' };

      const res = await controller.createReminder(dto, mockReq);

      expect(mockScheduleService.createReminder).toHaveBeenCalledWith({
        ...dto,
        userId: 'authenticated-user-456',
      });
      expect(res.userId).toBe('authenticated-user-456');
    });

    it('returns empty array if user tries to view reminders of another user', async () => {
      const mockReq = { user: { id: 'user-alice', role: 'customer' } };
      const res = await controller.getUserReminders('user-bob', mockReq);

      expect(res).toEqual([]);
      expect(mockScheduleService.getRemindersForUser).not.toHaveBeenCalled();
    });
  });
});
