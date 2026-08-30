import { IAddress, IGeoPoint } from '../../delivery.types';

export interface DispatchRequest {
  masterOrderId: string;
  subOrderId: string;
  pickupStore: {
    name: string;
    phone: string;
    address: IAddress;
    location: IGeoPoint;
    daasStoreId?: string;
  };
  dropoffCustomer: {
    name: string;
    phone: string;
    address: IAddress;
    location: IGeoPoint;
  };
  items: Array<{ name: string; quantity: number; isEmergency: boolean }>;
  pickupWindowStartMinutes: number;
}

export interface DispatchResult {
  externalTaskId: string;
  trackingUrl: string;
  estimatedPickup: Date;
  estimatedDropoff: Date;
  fee: number;
}

export interface TrackingInfo {
  externalTaskId: string;
  status: string;
  courierName?: string;
  courierPhone?: string;
  courierLocation?: IGeoPoint;
  estimatedArrival?: Date;
}

export interface IDeliveryProvider {
  createDispatch(payload: DispatchRequest): Promise<DispatchResult>;
  cancelDispatch(externalTaskId: string): Promise<boolean>;
  getTrackingStatus(externalTaskId: string): Promise<TrackingInfo>;
}
