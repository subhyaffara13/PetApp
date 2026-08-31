import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { PetShop, PetShopDocument } from '../schemas/pet-shop.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Order, OrderDocument } from '../schemas/order.schema';

const SERVICE_FEE_RATE = 0.025; // 2.5%

const INITIAL_HAIFA_SHOPS = [
  {
    _id: 'shop-haifa-1',
    name: 'PetBuy Haifa — Grand Canyon',
    address: 'Simcha Golan Rd 54, Grand Canyon Mall, Haifa',
    location: { lat: 32.789, lng: 35.007 },
    phone: '04-812-3456',
    tags: ['Delivery', 'Food', 'Toys', 'Grooming'],
    rating: 4.8,
    isRegistered: true,
    isClaimed: true,
    isOpen: true,
    deliveryAvailable: true,
    pickupOnly: false,
    products: [
      {
        _id: 'prod-1',
        name: 'Royal Canin Adult Medium Dry Dog Food 15kg',
        description: 'Balanced nutrition for adult dogs weighing 11 to 25 kg.',
        price: 289.0,
        category: 'Food',
        inStock: true,
        shopId: 'shop-haifa-1',
      },
      {
        _id: 'prod-2',
        name: 'KONG Classic Dog Toy Large',
        description: 'Durable rubber chew toy for active dogs.',
        price: 65.0,
        category: 'Toys',
        inStock: true,
        shopId: 'shop-haifa-1',
      },
      {
        _id: 'prod-3',
        name: 'Pro Plan Cat Sterilised Salmon 3kg',
        description: 'Complete food for sterilised adult cats.',
        price: 139.0,
        category: 'Food',
        inStock: true,
        shopId: 'shop-haifa-1',
      },
      {
        _id: 'prod-4',
        name: 'Bravaucto Flea & Tick Treatment Dog 20-40kg',
        description: '12-week flea and tick protection chew.',
        price: 185.0,
        category: 'Health',
        inStock: true,
        shopId: 'shop-haifa-1',
      },
    ],
  },
  {
    _id: 'shop-haifa-2',
    name: 'Jungle Pet Shop Moriah',
    address: 'Moriah Ave 108, Carmel, Haifa',
    location: { lat: 32.802, lng: 34.985 },
    phone: '04-838-9900',
    tags: ['Delivery', 'Food', 'Toys', 'Health'],
    rating: 4.9,
    isRegistered: true,
    isClaimed: true,
    isOpen: true,
    deliveryAvailable: true,
    pickupOnly: false,
    products: [
      {
        _id: 'prod-5',
        name: 'Acana Grasslands Grain-Free Dog Food 11.4kg',
        description: 'Rich in free-run lamb, duck, and wild fish.',
        price: 349.0,
        category: 'Food',
        inStock: true,
        shopId: 'shop-haifa-2',
      },
      {
        _id: 'prod-6',
        name: 'Catit Flower Water Fountain 3L',
        description: 'Fresh filtered drinking water fountain for cats.',
        price: 129.0,
        category: 'Toys',
        inStock: true,
        shopId: 'shop-haifa-2',
      },
    ],
  },
  {
    _id: 'shop-haifa-3',
    name: 'Animal Center Neve Sha\'anan',
    address: 'Trumpeldor Ave 42, Neve Sha\'anan, Haifa',
    location: { lat: 32.783, lng: 35.012 },
    phone: '04-823-7744',
    tags: ['Delivery', 'Food', 'Health', 'Aquatics'],
    rating: 4.7,
    isRegistered: true,
    isClaimed: true,
    isOpen: false, // Claimed but currently closed
    deliveryAvailable: true,
    pickupOnly: false,
    products: [
      {
        _id: 'prod-7',
        name: 'Orijen Cat & Kitten Food 5.4kg',
        description: 'Biologically appropriate grain-free cat food.',
        price: 245.0,
        category: 'Food',
        inStock: true,
        shopId: 'shop-haifa-3',
      },
      {
        _id: 'prod-8',
        name: 'Furminator Undercoat Deshedding Tool Dog L',
        description: 'Reduces loose hair shedding up to 90%.',
        price: 119.0,
        category: 'Grooming',
        inStock: true,
        shopId: 'shop-haifa-3',
      },
    ],
  },
  {
    _id: 'shop-haifa-4',
    name: 'Haifa Bay Pet Kingdom',
    address: 'HaHistadrut Blvd 200, Haifa Bay',
    location: { lat: 32.815, lng: 35.042 },
    phone: '04-872-1100',
    tags: ['Delivery', 'Food', 'Toys', 'Reptiles', 'Birds'],
    rating: 4.8,
    isRegistered: true,
    isClaimed: true,
    isOpen: true,
    deliveryAvailable: true,
    pickupOnly: false,
    products: [
      {
        _id: 'prod-9',
        name: 'Taste of the Wild High Prairie Canine 12.2kg',
        description: 'Roasted bison and venison grain-free recipe.',
        price: 319.0,
        category: 'Food',
        inStock: true,
        shopId: 'shop-haifa-4',
      },
      {
        _id: 'prod-10',
        name: 'Trixie Cat Scratching Post & Tree 120cm',
        description: 'Multi-level scratching post with sisal rope.',
        price: 199.0,
        category: 'Toys',
        inStock: true,
        shopId: 'shop-haifa-4',
      },
    ],
  },
  {
    _id: 'shop-haifa-5',
    name: 'Zookesh Carmel',
    address: 'Horev St 14, Carmel Center, Haifa',
    location: { lat: 32.793, lng: 34.989 },
    phone: '04-824-1122',
    tags: ['Pickup Only', 'Grooming'],
    isRegistered: false,
    isClaimed: false,
    isOpen: true, // Unclaimed & Open for calls/walk-ins
    deliveryAvailable: false,
    pickupOnly: true,
    products: [],
  },
  {
    _id: 'shop-haifa-6',
    name: 'Krayot Dog & Cat Superstore',
    address: 'Sderot Goshen 35, Kiryat Motzkin',
    location: { lat: 32.838, lng: 35.075 },
    phone: '04-875-9988',
    tags: ['Pickup Only', 'Food'],
    isRegistered: false,
    isClaimed: false,
    isOpen: false, // Unclaimed & Closed
    deliveryAvailable: false,
    pickupOnly: true,
    products: [],
  },
  {
    _id: 'shop-haifa-7',
    name: 'Haifa Pet Boutique Horev',
    address: 'Netiv Hen St 2, Horev Center, Haifa',
    location: { lat: 32.791, lng: 34.988 },
    phone: '04-825-4433',
    tags: ['Pickup Only', 'Grooming'],
    isRegistered: false,
    isClaimed: false,
    isOpen: true, // Unclaimed & Open
    deliveryAvailable: false,
    pickupOnly: true,
    products: [],
  },
];

import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MarketplaceService implements OnModuleInit {
  private readonly logger = new Logger(MarketplaceService.name);
  private stripe: Stripe | null = null;
  private G_PLACES_API_KEY: string | undefined;
  private inMemoryShops = INITIAL_HAIFA_SHOPS;
  private inMemoryOrders: any[] = [];

  constructor(
    @InjectModel(PetShop.name) private shopModel: Model<PetShopDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey);
    }
    this.G_PLACES_API_KEY = this.configService.get<string>('GOOGLE_PLACES_API_KEY');
  }

  async onModuleInit() {
    try {
      const existingShops = await this.shopModel.countDocuments();
      if (existingShops === 0) {
        this.logger.log('Seeding initial verified Pet Shops & Products to MongoDB Atlas...');
        for (const s of INITIAL_HAIFA_SHOPS) {
          const shopDoc = await this.shopModel.create({
            name: s.name,
            address: s.address,
            location: s.location,
            phone: s.phone,
            tags: s.tags,
            rating: s.rating,
            isRegistered: s.isRegistered,
            deliveryAvailable: s.deliveryAvailable,
            pickupOnly: s.pickupOnly,
          });

          for (const p of s.products) {
            await this.productModel.create({
              name: p.name,
              description: p.description,
              price: p.price,
              category: p.category,
              inStock: p.inStock,
              shopId: shopDoc._id.toString(),
            });
          }
        }
        this.logger.log('Marketplace database seeding complete.');
      }
    } catch (err: any) {
      this.logger.warn('Marketplace seeding notice:', err?.message);
    }
  }

  async addProduct(shopId: string, dto: any): Promise<ProductDocument> {
    const product = new this.productModel({ ...dto, shopId });
    return product.save();
  }

  async updateProduct(productId: string, dto: any): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndUpdate(productId, { $set: dto }, { new: true }).exec();
  }

  async deleteProduct(productId: string): Promise<any> {
    return this.productModel.findByIdAndDelete(productId).exec();
  }

  async getShops(lat: number = 32.794, lon: number = 34.9896, query?: string, lang: string = 'en'): Promise<any[]> {
    const shopsMap = new Map<string, any>();

    // 1. Load claimed & verified database partner stores with their product catalog
    try {
      const dbShops = await this.shopModel.find().exec();
      for (const shop of dbShops) {
        const id = shop._id.toString();
        shopsMap.set(id, {
          ...shop.toObject(),
          _id: id,
          isClaimed: true,
          isOpen: shop.isOpen ?? true,
          deliveryAvailable: shop.deliveryAvailable ?? true,
        });
      }
    } catch (err: any) {
      this.logger.warn('MongoDB shop query error, falling back to local registry:', err?.message);
      for (const shop of this.inMemoryShops) {
        shopsMap.set(shop._id, shop);
      }
    }

    // 2. Query Live Google Places API for real-world pet stores nearby (30km radius)
    if (this.G_PLACES_API_KEY) {
      try {
        const placesQueries: any[] = [
          { type: 'pet_store', radius: 30000 },
          { keyword: 'חנות חיות OR pet shop OR pet store OR מזון לבעלי חיים', radius: 30000 },
        ];

        if (query && query.trim()) {
          placesQueries.push({ keyword: `${query} pet shop`, radius: 40000 });
        }

        for (const q of placesQueries) {
          const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
          const params = {
            location: `${lat},${lon}`,
            key: this.G_PLACES_API_KEY,
            language: lang.slice(0, 2),
            ...q,
          };

          const response = await firstValueFrom(this.httpService.get(url, { params }));
          if (response.data?.results?.length > 0) {
            for (const place of response.data.results) {
              const placeId = place.place_id;
              // Only add if not already in the map as a registered partner
              if (!shopsMap.has(placeId)) {
                shopsMap.set(placeId, {
                  _id: placeId,
                  name: place.name,
                  address: place.vicinity || place.formatted_address || 'Local Neighborhood Store',
                  location: place.geometry?.location || { lat, lng: lon },
                  phone: null,
                  tags: ['Pickup Only', 'Local Store'],
                  rating: place.rating || 4.5,
                  isRegistered: false,
                  isClaimed: false,
                  isOpen: place.opening_hours ? place.opening_hours.open_now : true,
                  deliveryAvailable: false,
                  pickupOnly: true,
                  products: [], // ZERO placeholder fake products for unclaimed shops
                });
              }
            }
          }
        }
      } catch (placesErr: any) {
        this.logger.warn('Google Places pet stores query warning:', placesErr?.message);
      }
    }

    // 3. Fallback: if map is completely empty, populate local Haifa shops
    if (shopsMap.size === 0) {
      for (const s of this.inMemoryShops) {
        shopsMap.set(s._id, s);
      }
    }

    let results = Array.from(shopsMap.values());

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      results = results.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.address?.toLowerCase().includes(q) ||
          s.tags?.some((t: string) => t.toLowerCase().includes(q)),
      );
    }

    return results;
  }

  async getShopWithProducts(id: string): Promise<any> {
    try {
      const shop = await this.shopModel.findById(id).exec();
      if (shop) {
        const products = await this.productModel.find({ shopId: id }).exec();
        return { ...shop.toObject(), products };
      }
    } catch (err) {
      // Fallback
    }

    const localShop = this.inMemoryShops.find((s) => s._id === id);
    if (!localShop) throw new NotFoundException(`Shop ${id} not found`);
    return localShop;
  }

  async createOrder(dto: {
    shopId: string;
    items: { productId: string; quantity: number }[];
    subtotal: number;
    customerId?: string;
    paymentIntentId?: string;
  }): Promise<any> {
    const shop = await this.getShopWithProducts(dto.shopId);
    if (!shop) throw new NotFoundException('Shop not found');
    if (!shop.isRegistered) {
      throw new Error('Cannot place orders with unregistered shops');
    }

    const orderItems: { productId: any; quantity: number; priceAtPurchase: number }[] = [];
    let actualSubtotal = 0;

    for (const item of dto.items) {
      const product = shop.products?.find((p: any) => p._id === item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      if (!product.inStock) throw new Error(`Product ${product.name} is out of stock`);

      actualSubtotal += product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    const serviceFee = Math.round(actualSubtotal * SERVICE_FEE_RATE * 100) / 100;
    const total = actualSubtotal + serviceFee;

    let stripePaymentIntentId: string | undefined;
    if (this.stripe) {
      try {
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(total * 100),
          currency: 'ils',
          metadata: { shopId: dto.shopId },
        });
        stripePaymentIntentId = paymentIntent.id;
      } catch (err) {
        this.logger.error('Stripe payment intent creation failed:', err);
      }
    }

    const newOrder = {
      _id: `order-${Date.now()}`,
      shopId: dto.shopId,
      items: orderItems,
      subtotal: actualSubtotal,
      serviceFee,
      total,
      status: 'confirmed',
      customerId: dto.customerId,
      paymentStatus: dto.paymentIntentId ? 'authorized' : 'pending',
      stripePaymentIntentId: dto.paymentIntentId || stripePaymentIntentId,
      createdAt: new Date().toISOString(),
    };

    try {
      const order = new this.orderModel(newOrder);
      const saved = await order.save();
      return saved;
    } catch (err) {
      this.logger.warn('MongoDB order save failed, saved to memory');
      this.inMemoryOrders.unshift(newOrder);
      return newOrder;
    }
  }

  async getOrders(customerId?: string): Promise<any[]> {
    try {
      const query = customerId ? { customerId } : {};
      const orders = await this.orderModel.find(query).sort({ createdAt: -1 }).limit(30).exec();
      if (orders && orders.length > 0) return orders;
    } catch (err) {
      // Fallback
    }
    const filtered = customerId
      ? this.inMemoryOrders.filter((o) => o.customerId === customerId)
      : this.inMemoryOrders;
    return filtered;
  }

  /** Marks an order as paid (called after a successful Stripe payment) */
  async confirmOrderPayment(id: string, paymentIntentId?: string): Promise<any> {
    let order: any;
    try {
      order = await this.orderModel.findById(id).exec();
      if (!order) order = this.inMemoryOrders.find((o) => o._id === id);
    } catch {
      order = this.inMemoryOrders.find((o) => o._id === id);
    }
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    const update = {
      paymentStatus: 'captured',
      status: 'confirmed',
      ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
    };

    try {
      return await this.orderModel.findByIdAndUpdate(id, update, { new: true }).exec();
    } catch (err) {
      this.logger.warn('MongoDB order update failed, updating memory copy');
      Object.assign(order, update);
      return order;
    }
  }

  async getOrder(id: string): Promise<any> {
    try {
      const order = await this.orderModel.findById(id).exec();
      if (order) return order;
    } catch (err) {
      // Fallback
    }

    const localOrder = this.inMemoryOrders.find((o) => o._id === id);
    if (!localOrder) throw new NotFoundException(`Order ${id} not found`);
    return localOrder;
  }

  /** Creates a Stripe PaymentIntent and returns { clientSecret } to the frontend */
  async createPaymentIntent(amount: number, currency: string = 'ils'): Promise<{ clientSecret: string }> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.');
    }
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: paymentIntent.client_secret! };
  }
}

