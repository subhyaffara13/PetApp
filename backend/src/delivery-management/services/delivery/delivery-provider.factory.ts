import { Injectable } from '@nestjs/common';
import { DaaSProvider } from '../../delivery.types';
import { IDeliveryProvider } from './delivery-provider.interface';
import { WoltDriveAdapter } from './wolt-drive.adapter';
import { UberDirectAdapter } from './uber-direct.adapter';

@Injectable()
export class DeliveryProviderFactory {
  public getProvider(provider: DaaSProvider): IDeliveryProvider {
    switch (provider) {
      case 'wolt_drive':
        return new WoltDriveAdapter();
      case 'uber_direct':
        return new UberDirectAdapter();
      default:
        return new WoltDriveAdapter();
    }
  }
}
