import axios from 'axios';
import { Logger } from '@nestjs/common';
import { IDeliveryProvider, DispatchRequest, DispatchResult, TrackingInfo } from './delivery-provider.interface';

export class UberDirectAdapter implements IDeliveryProvider {
  private readonly logger = new Logger(UberDirectAdapter.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl = 'https://api.uber.com/v1/delivery';

  constructor() {
    this.clientId = process.env.UBER_DIRECT_CLIENT_ID || '';
    this.clientSecret = process.env.UBER_DIRECT_CLIENT_SECRET || '';
  }

  private get credentialsConfigured(): boolean {
    return !!this.clientId && !!this.clientSecret && !this.clientId.includes('mock');
  }

  private async getAccessToken(): Promise<string> {
    const response = await axios.post(
      'https://login.uber.com/oauth/v2/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'eats.delivery',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 7000 },
    );
    return response.data.access_token;
  }

  async createDispatch(payload: DispatchRequest): Promise<DispatchResult> {
    if (!this.credentialsConfigured) {
      throw new Error('Uber Direct credentials not configured. Set UBER_DIRECT_CLIENT_ID and UBER_DIRECT_CLIENT_SECRET.');
    }

    const token = await this.getAccessToken();
    const response = await axios.post(
      `${this.baseUrl}/orders`,
      {
        quote_id: undefined,
        pickup: {
          name: payload.pickupStore.name,
          phone_number: payload.pickupStore.phone,
          address: `${payload.pickupStore.address.street}, ${payload.pickupStore.address.city}`,
          location: {
            latitude: payload.pickupStore.location.coordinates[1],
            longitude: payload.pickupStore.location.coordinates[0],
          },
        },
        dropoff: {
          name: payload.dropoffCustomer.name,
          phone_number: payload.dropoffCustomer.phone,
          address: `${payload.dropoffCustomer.address.street}, ${payload.dropoffCustomer.address.city}`,
          location: {
            latitude: payload.dropoffCustomer.location.coordinates[1],
            longitude: payload.dropoffCustomer.location.coordinates[0],
          },
        },
        shopper_uuid: undefined,
        order_reference: `${payload.masterOrderId}_${payload.subOrderId}`,
        items: payload.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: { amount: 0, currency_code: 'ILS' },
          tags: i.isEmergency ? ['EMERGENCY_PET_MED'] : [],
        })),
      },
      {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        timeout: 10000,
      },
    );

    return {
      externalTaskId: response.data.id,
      trackingUrl: response.data.tracking_url || `https://direct.uber.com/track/${response.data.id}`,
      estimatedPickup: new Date(response.data.pickup.eta || Date.now() + 15 * 60000),
      estimatedDropoff: new Date(response.data.dropoff.eta || Date.now() + 35 * 60000),
      fee: response.data.fare?.amount || 0,
    };
  }

  async cancelDispatch(externalTaskId: string): Promise<boolean> {
    if (!this.credentialsConfigured) {
      throw new Error('Uber Direct credentials not configured.');
    }

    try {
      const token = await this.getAccessToken();
      await axios.patch(
        `${this.baseUrl}/orders/${externalTaskId}/status`,
        { status: 'canceled' },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 7000 },
      );
      return true;
    } catch {
      return false;
    }
  }

  async getTrackingStatus(externalTaskId: string): Promise<TrackingInfo> {
    if (!this.credentialsConfigured) {
      throw new Error('Uber Direct credentials not configured.');
    }

    const token = await this.getAccessToken();
    const response = await axios.get(`${this.baseUrl}/orders/${externalTaskId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 7000,
    });

    const data = response.data;
    return {
      externalTaskId,
      status: data.status || 'unknown',
      courierName: data.courier?.name,
      courierPhone: data.courier?.phone_number,
      courierLocation: data.courier?.location
        ? { type: 'Point', coordinates: [data.courier.location.longitude, data.courier.location.latitude] }
        : undefined,
      estimatedArrival: data.delivery?.eta ? new Date(data.delivery.eta) : undefined,
    };
  }
}
