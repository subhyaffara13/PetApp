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
      return { id: 'user-merchant', sub: 'user-merchant' };
    }
    sign() {
      return 'mock-token';
    }
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('DeliveryController (Security & Store Portal Authorization - C-4, H-5)', () => {
  let controller: DeliveryController;

  const mockDeliveryService = {
    createOrder: jest.fn().mockImplementation((dto) => Promise.resolve({ ...dto, _id: 'master-order-1' })),
    getClaimableStores: jest.fn().mockResolvedValue([]),
    claimStore: jest.fn().mockResolvedValue({ success: true }),
    handleSupportContact: jest.fn().mockResolvedValue({ success: true }),
    findNearbyStores: jest.fn().mockResolvedValue([]),
    getLiveStoreOrders: jest.fn().mockResolvedValue([]),
    cancelAllOrders: jest.fn().mockResolvedValue({ cancelledCount: 5 }),
    executeStoreAction: jest.fn().mockResolvedValue({ status: 'accepted' }),
    toggleBusyMode: jest.fn().mockResolvedValue({ isBusyMode: true }),
    getStoreProducts: jest.fn().mockResolvedValue([]),
    createStoreProduct: jest.fn().mockImplementation((storeId, p) => Promise.resolve({ ...p, storeId, _id: 'prod-1' })),
    updateStoreProduct: jest.fn().mockImplementation((storeId, prodId, p) => Promise.resolve({ ...p, storeId, _id: prodId })),
    getStoreFinancialReports: jest.fn().mockResolvedValue({ totalRevenue: 1000 }),
    getCustomerOrders: jest.fn().mockResolvedValue([]),
    handleCourierWebhook: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        { provide: DeliveryService, useValue: mockDeliveryService },
        { provide: JwtService, useClass: JwtService },
      ],
    })
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DeliveryController>(DeliveryController);
    jest.clearAllMocks();
  });

  describe('Order Creation & Validation (H-5)', () => {
    it('calls deliveryService.createOrder with order DTO', async () => {
      const orderDto: any = {
        customerId: 'cust-1',
        deliveryAddress: { street: 'Herzl 12', city: 'Tel Aviv' },
        deliveryLocation: { type: 'Point', coordinates: [34.78, 32.08] },
        items: [
          {
            storeId: 'store-1',
            productId: 'p-1',
            productName: 'Kibble',
            quantity: 2,
            unitPrice: 50,
          },
        ],
      };

      const result = await controller.createOrder(orderDto);
      expect(mockDeliveryService.createOrder).toHaveBeenCalledWith(orderDto);
      expect(result._id).toBe('master-order-1');
    });
  });

  describe('Store Portal Bulk Cancellations (C-4)', () => {
    it('throws ForbiddenException if a customer attempts cancelAllOrders', async () => {
      const mockReq = { user: { id: 'cust-1', role: 'customer' } };
      await expect(controller.cancelAllOrders(mockReq)).rejects.toThrow(ForbiddenException);
    });

    it('allows store_merchant to perform cancelAllOrders', async () => {
      const mockReq = { user: { id: 'merch-1', role: 'store_merchant' } };
      const res = await controller.cancelAllOrders(mockReq);

      expect(res.cancelledCount).toBe(5);
      expect(mockDeliveryService.cancelAllOrders).toHaveBeenCalled();
    });

    it('allows superadmin to perform cancelAllOrders', async () => {
      const mockReq = { user: { id: 'admin-1', role: 'superadmin' } };
      const res = await controller.cancelAllOrders(mockReq);

      expect(res.cancelledCount).toBe(5);
    });
  });

  describe('Customer Orders IDOR Protection (C-4)', () => {
    it('throws ForbiddenException when requesting another customer orders', async () => {
      const mockReq = { user: { id: 'user-alice', role: 'customer' } };
      await expect(
        controller.getCustomerOrders('user-bob', mockReq),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows user to retrieve their own customer orders', async () => {
      const mockReq = { user: { id: 'user-alice', role: 'customer' } };
      await controller.getCustomerOrders('user-alice', mockReq);

      expect(mockDeliveryService.getCustomerOrders).toHaveBeenCalledWith('user-alice');
    });

    it('allows superadmin to view any customer orders', async () => {
      const mockReq = { user: { id: 'superadmin-1', role: 'superadmin' } };
      await controller.getCustomerOrders('user-victim', mockReq);

      expect(mockDeliveryService.getCustomerOrders).toHaveBeenCalledWith('user-victim');
    });
  });
});
