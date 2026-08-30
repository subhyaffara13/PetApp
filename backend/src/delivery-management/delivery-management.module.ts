import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreSchema } from './schemas/store.schema';
import { MasterOrderSchema } from './schemas/master-order.schema';
import { StoreProduct, StoreProductSchema } from './schemas/store-product.schema';
import { AdminClaim, AdminClaimSchema } from '../admin/admin.schema';
import { OrderStateMachineService } from './services/order-state-machine.service';
import { DeliveryProviderFactory } from './services/delivery/delivery-provider.factory';
import { DeliveryGateway } from './delivery.gateway';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { verifyDaaSWebhookSignature } from './middleware/webhook-auth.middleware';

import { OrderTimeoutWorkerService } from './jobs/order-timeout.worker';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Store', schema: StoreSchema },
      { name: 'MasterOrder', schema: MasterOrderSchema },
      { name: StoreProduct.name, schema: StoreProductSchema },
      { name: AdminClaim.name, schema: AdminClaimSchema },
    ]),
    AuthModule,
  ],
  controllers: [DeliveryController],
  providers: [
    OrderStateMachineService,
    DeliveryProviderFactory,
    DeliveryGateway,
    DeliveryService,
    OrderTimeoutWorkerService,
  ],
  exports: [DeliveryService, DeliveryGateway, OrderTimeoutWorkerService],
})
export class DeliveryManagementModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: any, res: any, next: any) => {
        const provider = req.params?.provider || req.path.split('/').pop();
        return verifyDaaSWebhookSignature(provider as any)(req, res, next);
      })
      .forRoutes({ path: 'api/webhooks/daas/:provider', method: RequestMethod.POST });
  }
}
