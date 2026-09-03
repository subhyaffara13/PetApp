import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IStore, IMasterOrder } from './delivery.types';
import { OrderStateMachineService } from './services/order-state-machine.service';
import { DeliveryProviderFactory } from './services/delivery/delivery-provider.factory';
import { DeliveryGateway } from './delivery.gateway';
import { OrderTimeoutWorkerService } from './jobs/order-timeout.worker';
import {
  StoreProduct,
  StoreProductDocument,
} from './schemas/store-product.schema';
import { AdminClaim, AdminClaimDocument } from '../admin/admin.schema';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);
  constructor(
    @InjectModel('Store') private readonly storeModel: Model<IStore>,
    @InjectModel('MasterOrder')
    private readonly masterOrderModel: Model<IMasterOrder>,
    @InjectModel(StoreProduct.name)
    private readonly productModel: Model<StoreProductDocument>,
    @InjectModel(AdminClaim.name)
    private readonly adminClaimModel: Model<AdminClaimDocument>,
    private readonly stateMachine: OrderStateMachineService,
    private readonly providerFactory: DeliveryProviderFactory,
    private readonly deliveryGateway: DeliveryGateway,
    private readonly timeoutWorker: OrderTimeoutWorkerService,
  ) {}

  /**
   * Seed default stores if none exist
   */
  async onModuleInit() {
    try {
      const count = await this.storeModel.countDocuments();
      if (count === 0) {
        await this.storeModel.create([
          {
            _id: new Types.ObjectId('64f1a2b3c4d5e6f7a8b9c0d1'),
            name: 'Carmel Pet Supplies & Premium Nutrition (כרמל מזון וציוד לבע"ח)',
            location: { type: 'Point', coordinates: [34.9895, 32.794] },
            address: {
              street: 'Moriah Blvd 42',
              city: 'Haifa',
              country: 'Israel',
              postalCode: '3457102',
            },
            supportedDeliveryModes: ['daas_on_demand', 'merchant_fleet'],
            daasProvider: 'wolt_drive',
            daasStoreId: 'wolt_venue_haifa_food_1',
            avgPrepTimeMinutes: 15,
            isActive: true,
            isBusyMode: false,
            isClaimed: true,
            contactPhone: '+972-4-838-9999',
          },
          {
            _id: new Types.ObjectId('64f1a2b3c4d5e6f7a8b9c0d2'),
            name: 'Haifa Animal Appliances & Accessories Hub (מרכז אביזרים ומתקנים)',
            location: { type: 'Point', coordinates: [34.992, 32.796] },
            address: {
              street: 'HaNassi Ave 105',
              city: 'Haifa',
              country: 'Israel',
              postalCode: '3464201',
            },
            supportedDeliveryModes: ['daas_on_demand'],
            daasProvider: 'wolt_drive',
            daasStoreId: 'wolt_venue_haifa_appliances_2',
            avgPrepTimeMinutes: 10,
            isActive: true,
            isBusyMode: false,
            isClaimed: true,
            contactPhone: '+972-4-838-8888',
          },
        ]);
      }
    } catch {}

    try {
      const productCount = await this.productModel.countDocuments();
      if (productCount === 0) {
        await this.productModel.create([
          {
            storeId: new Types.ObjectId('64f1a2b3c4d5e6f7a8b9c0d1'),
            name: 'Royal Canin Adult Medium Dry Dog Food 15kg',
            price: 289,
            category: 'Food',
            tags: ['Food', 'Dogs'],
            inStock: true,
            imageUrl:
              'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
          },
          {
            storeId: new Types.ObjectId('64f1a2b3c4d5e6f7a8b9c0d1'),
            name: 'Pro Plan Cat Sterilised Salmon 3kg',
            price: 139,
            category: 'Food',
            tags: ['Food', 'Cats'],
            inStock: true,
            imageUrl:
              'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400',
          },
          {
            storeId: new Types.ObjectId('64f1a2b3c4d5e6f7a8b9c0d1'),
            name: 'Taste of the Wild High Prairie Canine 12.2kg',
            price: 315,
            category: 'Food',
            tags: ['Food', 'Grain-Free'],
            inStock: true,
            imageUrl:
              'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
          },
          {
            storeId: new Types.ObjectId('64f1a2b3c4d5e6f7a8b9c0d2'),
            name: 'Smart WiFi Automatic Pet Feeder & HD Camera',
            price: 320,
            category: 'Appliances',
            tags: ['Appliances', 'Smart'],
            inStock: true,
            imageUrl:
              'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400',
          },
          {
            storeId: new Types.ObjectId('64f1a2b3c4d5e6f7a8b9c0d2'),
            name: 'Stainless Steel Ultra-Quiet Cat Water Fountain 2.5L',
            price: 149,
            category: 'Appliances',
            tags: ['Appliances', 'Water'],
            inStock: true,
            imageUrl:
              'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
          },
          {
            storeId: new Types.ObjectId('64f1a2b3c4d5e6f7a8b9c0d2'),
            name: 'Orthopedic Memory Foam Pet Bed (Large)',
            price: 195,
            category: 'Appliances',
            tags: ['Bedding', 'Comfort'],
            inStock: true,
            imageUrl:
              'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400',
          },
        ]);
      }
    } catch {}
  }

  /**
   * Multi-vendor Checkout split
   */
  async createOrder(dto: {
    customerId: string;
    deliveryAddress: any;
    deliveryLocation: { type: 'Point'; coordinates: [number, number] };
    items: Array<{
      storeId: string;
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      isEmergencyItem?: boolean;
    }>;
  }): Promise<IMasterOrder> {
    const storeMap = new Map<string, any[]>();
    for (const item of dto.items) {
      if (!storeMap.has(item.storeId)) storeMap.set(item.storeId, []);
      storeMap.get(item.storeId)!.push(item);
    }

    const storeOrders: any[] = [];
    let grandTotal = 0;

    for (const [storeId, storeItems] of storeMap.entries()) {
      const store = await this.storeModel.findById(storeId);
      if (!store) {
        throw new NotFoundException(`Store not found: ${storeId}`);
      }

      const subtotal = storeItems.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity,
        0,
      );
      const deliveryFee = store?.isBusyMode ? 35 : 25;
      const platformFee = 5;

      storeOrders.push({
        _id: new Types.ObjectId(),
        storeId: new Types.ObjectId(
          storeId.length === 24 ? storeId : '64f1a2b3c4d5e6f7a8b9c0d1',
        ),
        status: 'awaiting_store_acceptance' as const,
        deliveryMode: store?.supportedDeliveryModes?.[0] || 'daas_on_demand',
        items: storeItems.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          isEmergencyItem: !!i.isEmergencyItem,
        })),
        subtotalAmount: subtotal,
        deliveryFee,
        platformFee,
      });

      grandTotal += subtotal + deliveryFee + platformFee;
    }

    const masterOrder = await this.masterOrderModel.create({
      customerId: dto.customerId,
      paymentIntentId: `pi_petsos_${Date.now()}`,
      paymentStatus: 'authorized',
      totalAmount: grandTotal,
      deliveryAddress: dto.deliveryAddress,
      deliveryLocation: dto.deliveryLocation || {
        type: 'Point',
        coordinates: [34.9895, 32.794],
      },
      storeOrders,
    });

    // Alert each merchant store in real-time & schedule SLA auto-escalation
    for (const sub of masterOrder.storeOrders) {
      this.deliveryGateway.notifyStoreNewOrder(sub.storeId.toString(), {
        masterOrderId: masterOrder._id,
        deliveryAddress: masterOrder.deliveryAddress,
        deliveryLocation: masterOrder.deliveryLocation,
        subOrder: sub,
      });

      this.timeoutWorker.scheduleOrderAcceptanceTimeout({
        masterOrderId: masterOrder._id.toString(),
        subOrderId: sub._id.toString(),
        storeId: sub.storeId.toString(),
        isEmergency: sub.items.some((i) => i.isEmergencyItem),
      });
    }

    return masterOrder;
  }

  /**
   * Find nearby claimed stores accepting orders (MongoDB 2dsphere $near)
   */
  async findNearbyStores(
    lon: number,
    lat: number,
    maxDistanceMeters: number = 15000,
  ): Promise<IStore[]> {
    return this.storeModel.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lon, lat] },
          $maxDistance: maxDistanceMeters,
        },
      },
      isActive: true,
      isClaimed: true,
    });
  }

  /**
   * List all stores for merchant portal claiming / switching
   */
  async getClaimableStores(): Promise<IStore[]> {
    return this.storeModel.find().sort({ name: 1 });
  }

  /**
   * Claim a store listing
   */
  async claimStore(
    storeId: string,
    ownerEmail?: string,
  ): Promise<IStore | null> {
    const store = await this.storeModel.findById(storeId).exec();
    if (!store) throw new NotFoundException(`Store ${storeId} not found`);

    // Submit a pending claim for admin review (populates the Admin claim queue)
    try {
      await this.adminClaimModel.create({
        entityType: 'store',
        entityName: (store as any).name || `Store ${storeId}`,
        entityAddress: (store as any).address
          ? `${(store as any).address.street || ''} ${(store as any).address.city || ''}`.trim() ||
            String((store as any).address)
          : '',
        contactName: '',
        contactPhone: ownerEmail || (store as any).contactPhone || '',
        businessLicense: (store as any).businessLicense || 'pending',
        status: 'pending',
      });
    } catch (err) {
      this.logger.warn('Failed to submit store claim for admin review', err);
    }

    return this.storeModel.findByIdAndUpdate(
      storeId,
      {
        isClaimed: true,
        isActive: true,
        ...(ownerEmail ? { contactPhone: ownerEmail } : {}),
      },
      { new: true },
    );
  }

  /**
   * Handle user contact / error / support form submission
   */
  async handleSupportContact(dto: {
    name: string;
    email: string;
    category: string;
    message: string;
  }): Promise<any> {
    return {
      ticketId: `TICKET-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'received',
      receivedAt: new Date(),
      ...dto,
    };
  }

  /**
   * Fetch all active orders for a merchant dashboard
   */
  async getLiveStoreOrders(storeId: string): Promise<any[]> {
    const orders = await this.masterOrderModel
      .find({
        $or: [
          { 'storeOrders.storeId': storeId },
          {
            'storeOrders.storeId': new Types.ObjectId(
              storeId.length === 24 ? storeId : '64f1a2b3c4d5e6f7a8b9c0d1',
            ),
          },
        ],
        'storeOrders.status': { $nin: ['cancelled', 'failed'] },
      })
      .sort({ createdAt: -1 });

    return orders.flatMap((m) =>
      m.storeOrders
        .filter((s) => s.storeId.toString() === storeId || storeId === 'all')
        .map((s) => ({
          masterOrderId: m._id,
          deliveryAddress: m.deliveryAddress,
          deliveryLocation: m.deliveryLocation,
          subOrder: s,
        })),
    );
  }

  /**
   * Cancel all orders (TEST UTILITY - safe-guarded to non-production environments)
   */
  async cancelAllOrders() {
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.ALLOW_ORDER_CLEAR !== 'true'
    ) {
      throw new BadRequestException(
        'Order clearing is disabled in this environment.',
      );
    }
    await this.masterOrderModel.updateMany(
      {},
      {
        $set: {
          'storeOrders.$[].status': 'cancelled',
          'storeOrders.$[].cancellationReason': 'USER_REQUESTED_CLEAR',
          'storeOrders.$[].updatedAt': new Date(),
        },
      },
    );
    return {
      success: true,
      message: 'All active test orders cancelled successfully',
    };
  }

  /**
   * Execute store portal merchant action (accept, ready_for_pickup, decline)
   */
  async executeStoreAction(
    masterOrderId: string,
    subOrderId: string,
    action:
      | 'accept'
      | 'ready_for_pickup'
      | 'simulate_pickup'
      | 'simulate_delivered'
      | 'decline'
      | string,
    prepMinutes?: number,
  ): Promise<IMasterOrder> {
    const masterOrder = await this.masterOrderModel.findById(masterOrderId);
    if (!masterOrder) throw new NotFoundException('Master order not found');

    const subOrder = masterOrder.storeOrders.find(
      (s) => s._id.toString() === subOrderId,
    );
    if (!subOrder) throw new NotFoundException('Sub-order not found');

    let targetStatus: any;
    if (action === 'accept') targetStatus = 'store_preparing';
    else if (action === 'ready_for_pickup') targetStatus = 'ready_for_pickup';
    else if (action === 'simulate_pickup') targetStatus = 'out_for_delivery';
    else if (action === 'simulate_delivered') targetStatus = 'delivered';
    else if (action === 'decline') targetStatus = 'cancelled';
    else throw new BadRequestException('Invalid action');

    if (!this.stateMachine.canTransition(subOrder.status, targetStatus)) {
      throw new ConflictException(
        `Cannot transition from ${subOrder.status} to ${targetStatus}`,
      );
    }

    this.timeoutWorker.cancelTimeout(subOrderId);

    const store = await this.storeModel.findById(subOrder.storeId);
    if (!store) {
      throw new NotFoundException(`Store not found: ${subOrder.storeId}`);
    }

    const updatePayload: any = {
      $set: {
        'storeOrders.$[elem].status': targetStatus,
        'storeOrders.$[elem].updatedAt': new Date(),
      },
    };

    if (action === 'accept') {
      updatePayload.$set['storeOrders.$[elem].targetPrepMinutes'] =
        prepMinutes || 15;
      updatePayload.$set['storeOrders.$[elem].prepStartedAt'] = new Date();
    }

    // Trigger DaaS Courier Dispatch when ready
    if (
      this.stateMachine.shouldTriggerDaaS(targetStatus, subOrder.deliveryMode)
    ) {
      const daas = this.providerFactory.getProvider(store.daasProvider);
      const dispatchResult = await daas.createDispatch({
        masterOrderId,
        subOrderId,
        pickupStore: {
          name: store.name,
          phone: store.contactPhone,
          address: store.address,
          location: store.location,
          daasStoreId: store.daasStoreId,
        },
        dropoffCustomer: {
          name: 'Customer',
          phone: '+972-54-000-0000',
          address: masterOrder.deliveryAddress,
          location: masterOrder.deliveryLocation,
        },
        items: subOrder.items.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          isEmergency: i.isEmergencyItem,
        })),
        pickupWindowStartMinutes: 0,
      });

      updatePayload.$set['storeOrders.$[elem].dispatchInfo'] = {
        provider: store.daasProvider,
        externalTaskId: dispatchResult.externalTaskId,
        trackingUrl: dispatchResult.trackingUrl,
        pickupWindowStart: dispatchResult.estimatedPickup,
        pickupWindowEnd: dispatchResult.estimatedDropoff,
        lastSyncAt: new Date(),
      };
    }

    const updated = await this.masterOrderModel.findOneAndUpdate(
      { _id: masterOrderId },
      updatePayload,
      {
        arrayFilters: [{ 'elem._id': new Types.ObjectId(subOrderId) }],
        new: true,
      },
    );

    // Broadcast status update
    this.deliveryGateway.emitSubOrderStatusUpdate(
      subOrder.storeId.toString(),
      masterOrderId,
      subOrderId,
      targetStatus,
    );

    return updated!;
  }

  /**
   * Toggle store rush / busy mode
   */
  async toggleBusyMode(
    storeId: string,
    isBusyMode: boolean,
  ): Promise<IStore | null> {
    return this.storeModel.findByIdAndUpdate(
      storeId,
      { isBusyMode },
      { new: true },
    );
  }

  /**
   * Process courier webhook
   */
  async handleCourierWebhook(body: any): Promise<any> {
    const { event, externalTaskId, courier, location } = body;

    const masterOrder = await this.masterOrderModel.findOne({
      'storeOrders.dispatchInfo.externalTaskId': externalTaskId,
    });

    if (!masterOrder) return { status: 'ignored_unmatched' };

    const subOrder = masterOrder.storeOrders.find(
      (s) => s.dispatchInfo?.externalTaskId === externalTaskId,
    );

    if (!subOrder) return { status: 'ignored_suborder' };

    let newStatus = subOrder.status;
    if (event === 'COURIER_ASSIGNED') newStatus = 'courier_assigned';
    if (event === 'PICKED_UP') newStatus = 'out_for_delivery';
    if (event === 'DELIVERED') newStatus = 'delivered';

    const updateDoc: any = {
      $set: {
        'storeOrders.$[elem].status': newStatus,
        'storeOrders.$[elem].dispatchInfo.lastSyncAt': new Date(),
      },
    };

    if (courier) {
      updateDoc.$set['storeOrders.$[elem].dispatchInfo.courierName'] =
        courier.name;
      updateDoc.$set['storeOrders.$[elem].dispatchInfo.courierPhone'] =
        courier.phone;
    }

    if (location) {
      updateDoc.$set['storeOrders.$[elem].dispatchInfo.liveLocation'] = {
        type: 'Point',
        coordinates: [location.lon, location.lat],
      };
      this.deliveryGateway.emitCourierLocationPing(
        masterOrder._id.toString(),
        subOrder._id.toString(),
        [location.lon, location.lat],
      );
    }

    await this.masterOrderModel.updateOne({ _id: masterOrder._id }, updateDoc, {
      arrayFilters: [{ 'elem.dispatchInfo.externalTaskId': externalTaskId }],
    });

    this.deliveryGateway.emitSubOrderStatusUpdate(
      subOrder.storeId.toString(),
      masterOrder._id.toString(),
      subOrder._id.toString(),
      newStatus,
    );

    return { success: true };
  }

  // -------------------------------------------------------------
  // Store Portal Product & Inventory CRUD (MongoDB-backed)
  // -------------------------------------------------------------

  async getStoreProducts(storeId: string): Promise<StoreProductDocument[]> {
    return this.productModel
      .find({
        storeId: new Types.ObjectId(
          storeId.length === 24 ? storeId : '64f1a2b3c4d5e6f7a8b9c0d1',
        ),
      })
      .sort({ name: 1 })
      .exec();
  }

  async createStoreProduct(
    storeId: string,
    product: any,
  ): Promise<StoreProductDocument> {
    return this.productModel.create({
      ...product,
      storeId: new Types.ObjectId(
        storeId.length === 24 ? storeId : '64f1a2b3c4d5e6f7a8b9c0d1',
      ),
    });
  }

  async updateStoreProduct(
    storeId: string,
    productId: string,
    updates: any,
  ): Promise<StoreProductDocument> {
    const product = await this.productModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(productId),
        storeId: new Types.ObjectId(
          storeId.length === 24 ? storeId : '64f1a2b3c4d5e6f7a8b9c0d1',
        ),
      },
      { ...updates },
      { new: true },
    );
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async deleteStoreProduct(
    storeId: string,
    productId: string,
  ): Promise<{ success: boolean }> {
    const result = await this.productModel.deleteOne({
      _id: new Types.ObjectId(productId),
      storeId: new Types.ObjectId(
        storeId.length === 24 ? storeId : '64f1a2b3c4d5e6f7a8b9c0d1',
      ),
    });
    return { success: result.deletedCount > 0 };
  }

  async getStoreFinancialReports(storeId: string) {
    const orders = await this.masterOrderModel
      .find({
        $or: [
          { 'storeOrders.storeId': storeId },
          {
            'storeOrders.storeId': new Types.ObjectId(
              storeId.length === 24 ? storeId : '64f1a2b3c4d5e6f7a8b9c0d1',
            ),
          },
        ],
      })
      .sort({ createdAt: -1 });

    return orders.flatMap((m) =>
      m.storeOrders
        .filter((s) => s.storeId.toString() === storeId || storeId === 'all')
        .map((s) => ({
          masterOrderId: m._id,
          createdAt: (m as any).createdAt || new Date(),
          deliveryAddress: m.deliveryAddress,
          subOrder: s,
        })),
    );
  }

  async getCustomerOrders(customerId?: string) {
    return this.masterOrderModel
      .find(customerId ? { customerId } : {})
      .sort({ createdAt: -1 })
      .limit(30);
  }
}
