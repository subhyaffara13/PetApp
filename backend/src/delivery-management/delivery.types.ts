import { Document, Types } from 'mongoose';

export type DeliveryMode =
  | 'daas_on_demand'
  | 'merchant_fleet'
  | 'standard_postal';
export type DaaSProvider = 'wolt_drive' | 'none';

export type StoreOrderStatus =
  | 'created'
  | 'awaiting_store_acceptance'
  | 'store_preparing'
  | 'ready_for_pickup'
  | 'courier_assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded';

export interface IGeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IAddress {
  street: string;
  city: string;
  country: string;
  postalCode: string;
  notes?: string;
}

export interface IDeliveryDispatch {
  provider: DaaSProvider;
  externalTaskId?: string;
  trackingUrl?: string;
  courierName?: string;
  courierPhone?: string;
  courierVehicle?: string;
  pickupWindowStart?: Date;
  pickupWindowEnd?: Date;
  liveLocation?: IGeoPoint;
  lastSyncAt?: Date;
}

export interface IOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  isEmergencyItem: boolean;
}

export interface IStoreOrder {
  _id: Types.ObjectId;
  storeId: Types.ObjectId;
  status: StoreOrderStatus;
  deliveryMode: DeliveryMode;
  items: IOrderItem[];
  subtotalAmount: number;
  deliveryFee: number;
  platformFee: number;
  targetPrepMinutes?: number;
  prepStartedAt?: Date;
  estimatedDeliveryTime?: Date;
  dispatchInfo?: IDeliveryDispatch;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStore extends Document {
  name: string;
  location: IGeoPoint;
  address: IAddress;
  supportedDeliveryModes: DeliveryMode[];
  daasProvider: DaaSProvider;
  daasStoreId?: string;
  avgPrepTimeMinutes: number;
  isActive: boolean;
  isBusyMode: boolean;
  isClaimed: boolean;
  contactPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMasterOrder extends Document {
  customerId: string;
  paymentIntentId: string;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  deliveryAddress: IAddress;
  deliveryLocation: IGeoPoint;
  storeOrders: IStoreOrder[];
  createdAt: Date;
  updatedAt: Date;
}
