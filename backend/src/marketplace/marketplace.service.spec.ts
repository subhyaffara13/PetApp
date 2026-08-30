import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { MarketplaceService } from './marketplace.service';
import { PetShop } from '../schemas/pet-shop.schema';
import { Product } from '../schemas/product.schema';
import { Order } from '../schemas/order.schema';

describe('MarketplaceService', () => {
  let service: MarketplaceService;

  const mockShopModel: any = {
    countDocuments: jest.fn().mockResolvedValue(1),
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          _id: 'shop-haifa-1',
          name: 'PetBuy Haifa',
          isRegistered: true,
          deliveryAvailable: true,
          products: [],
        },
      ]),
    }),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'shop-haifa-1',
        name: 'PetBuy Haifa',
        isRegistered: true,
        toObject: () => ({ _id: 'shop-haifa-1', name: 'PetBuy Haifa', isRegistered: true }),
      }),
    }),
    create: jest.fn(),
  };

  const mockProductModel: any = {
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          _id: 'prod-1',
          name: 'Royal Canin Dog Food',
          price: 289,
          inStock: true,
          shopId: 'shop-haifa-1',
        },
      ]),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'prod-1', name: 'Updated Product' }),
    }),
    findByIdAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'prod-1' }),
    }),
    create: jest.fn(),
  };

  const mockOrderModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({ _id: 'order-123', ...dto }),
  }));

  mockOrderModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { _id: 'order-123', total: 296.23, status: 'confirmed' },
        ]),
      }),
    }),
  });

  mockOrderModel.findById = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ _id: 'order-123', total: 296.23, status: 'confirmed' }),
  });

  mockOrderModel.findByIdAndUpdate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ _id: 'order-123', status: 'confirmed', paymentStatus: 'captured' }),
  });

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'STRIPE_SECRET_KEY') return 'sk_test_mock_stripe_key';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceService,
        { provide: getModelToken(PetShop.name), useValue: mockShopModel },
        { provide: getModelToken(Product.name), useValue: mockProductModel },
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MarketplaceService>(MarketplaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list pet shops', async () => {
    const shops = await service.getShops();
    expect(Array.isArray(shops)).toBe(true);
    expect(shops.length).toBeGreaterThan(0);
  });

  it('should fetch shop with its products', async () => {
    const shop = await service.getShopWithProducts('shop-haifa-1');
    expect(shop).toBeDefined();
    expect(shop._id).toBe('shop-haifa-1');
  });

  it('should calculate correct service fee (2.5%) when creating an order', async () => {
    const order = await service.createOrder({
      shopId: 'shop-haifa-1',
      items: [{ productId: 'prod-1', quantity: 1 }],
      subtotal: 289,
    });

    expect(order).toBeDefined();
    expect(order.subtotal).toBe(289);
    expect(order.serviceFee).toBe(7.23); // 289 * 0.025 rounded
    expect(order.total).toBe(296.23);
  });

  it('should confirm payment for an order', async () => {
    const confirmed = await service.confirmOrderPayment('order-123', 'pi_test_123');
    expect(confirmed.paymentStatus).toBe('captured');
    expect(confirmed.status).toBe('confirmed');
  });
});
