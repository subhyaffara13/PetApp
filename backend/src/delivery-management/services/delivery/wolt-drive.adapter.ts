import axios from 'axios';
import { Logger } from '@nestjs/common';
import {
  IDeliveryProvider,
  DispatchRequest,
  DispatchResult,
  TrackingInfo,
} from './delivery-provider.interface';

export class WoltDriveAdapter implements IDeliveryProvider {
  private readonly logger = new Logger(WoltDriveAdapter.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.WOLT_DRIVE_API_KEY || '';
    this.baseUrl =
      process.env.WOLT_DRIVE_BASE_URL || 'https://api.wolt.com/v1/drive';
  }

  private get credentialsConfigured(): boolean {
    return !!this.apiKey && !this.apiKey.includes('mock');
  }

  async createDispatch(payload: DispatchRequest): Promise<DispatchResult> {
    if (!this.credentialsConfigured) {
      throw new Error(
        'Wolt Drive API key not configured. Set WOLT_DRIVE_API_KEY.',
      );
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/deliveries`,
        {
          merchant_order_reference_id: `${payload.masterOrderId}_${payload.subOrderId}`,
          pickup: {
            venue_id: payload.pickupStore.daasStoreId,
            location: {
              coordinates: {
                lon: payload.pickupStore.location.coordinates[0],
                lat: payload.pickupStore.location.coordinates[1],
              },
            },
            contact_details: {
              name: payload.pickupStore.name,
              phone_number: payload.pickupStore.phone,
            },
          },
          dropoff: {
            location: {
              coordinates: {
                lon: payload.dropoffCustomer.location.coordinates[0],
                lat: payload.dropoffCustomer.location.coordinates[1],
              },
            },
            contact_details: {
              name: payload.dropoffCustomer.name,
              phone_number: payload.dropoffCustomer.phone,
            },
          },
          contents: payload.items.map((i) => ({
            count: i.quantity,
            description: i.name,
            tags: i.isEmergency ? ['EMERGENCY_PET_MED'] : [],
          })),
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          timeout: 7000,
        },
      );

      return {
        externalTaskId: response.data.id,
        trackingUrl: response.data.tracking_url,
        estimatedPickup: new Date(response.data.pickup.eta),
        estimatedDropoff: new Date(response.data.dropoff.eta),
        fee: response.data.price?.amount || 0,
      };
    } catch (error) {
      this.logger.error('Wolt Drive dispatch failed', error);
      throw error;
    }
  }

  async cancelDispatch(externalTaskId: string): Promise<boolean> {
    if (!this.credentialsConfigured) {
      throw new Error('Wolt Drive API key not configured.');
    }

    try {
      await axios.delete(`${this.baseUrl}/deliveries/${externalTaskId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getTrackingStatus(externalTaskId: string): Promise<TrackingInfo> {
    if (!this.credentialsConfigured) {
      throw new Error('Wolt Drive API key not configured.');
    }

    const response = await axios.get(
      `${this.baseUrl}/deliveries/${externalTaskId}/tracking`,
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        timeout: 7000,
      },
    );

    const data = response.data;
    return {
      externalTaskId,
      status: data.status || 'unknown',
      courierName: data.courier?.name,
      courierPhone: data.courier?.phone_number,
      courierLocation: data.courier?.location
        ? {
            type: 'Point',
            coordinates: [data.courier.location.lon, data.courier.location.lat],
          }
        : undefined,
      estimatedArrival: data.estimated_arrival
        ? new Date(data.estimated_arrival)
        : undefined,
    };
  }
}
