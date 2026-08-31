import { Injectable } from '@nestjs/common';
import { DaaSProvider } from '../../delivery.types';
import { IDeliveryProvider } from './delivery-provider.interface';
import { WoltDriveAdapter } from './wolt-drive.adapter';

@Injectable()
export class DeliveryProviderFactory {
  public getProvider(provider: DaaSProvider): IDeliveryProvider {
    switch (provider) {
      case 'wolt_drive':
      default:
        return new WoltDriveAdapter();
    }
  }
}
