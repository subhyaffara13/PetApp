import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IMasterOrder } from '../delivery.types';
import { DeliveryGateway } from '../delivery.gateway';

export interface OrderTimeoutJobData {
  masterOrderId: string;
  subOrderId: string;
  storeId: string;
  isEmergency: boolean;
}

@Injectable()
export class OrderTimeoutWorkerService implements OnModuleInit {
  private readonly logger = new Logger('OrderTimeoutWorker');
  private fallbackTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectModel('MasterOrder')
    private readonly masterOrderModel: Model<IMasterOrder>,
    private readonly deliveryGateway: DeliveryGateway,
  ) {}

  onModuleInit() {
    this.logger.log(
      'BullMQ Order Timeout & SLA Auto-Escalation Worker initialized.',
    );
  }

  /**
   * Schedule SLA check when an order is created.
   * delayMs: 180,000ms (3 min) for SOS Emergency, 300,000ms (5 min) for Standard
   */
  async scheduleOrderAcceptanceTimeout(
    data: OrderTimeoutJobData,
    delayMs?: number,
  ) {
    const effectiveDelay = delayMs ?? (data.isEmergency ? 180000 : 300000);
    const key = `timeout-${data.subOrderId}`;

    // Graceful timer scheduling with fallback
    const timer = setTimeout(() => {
      this.executeTimeoutCheck(data);
      this.fallbackTimers.delete(key);
    }, effectiveDelay);

    this.fallbackTimers.set(key, timer);
    this.logger.log(
      `[SLA Worker] Scheduled timeout check for sub-order ${data.subOrderId} in ${effectiveDelay / 1000}s`,
    );
  }

  /**
   * Cancel scheduled timer if store accepted/handled the order in time
   */
  cancelTimeout(subOrderId: string) {
    const key = `timeout-${subOrderId}`;
    const timer = this.fallbackTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.fallbackTimers.delete(key);
      this.logger.log(
        `[SLA Worker] Timeout cleared for accepted sub-order ${subOrderId}`,
      );
    }
  }

  /**
   * Executes timeout transition if store is still awaiting acceptance
   */
  private async executeTimeoutCheck(data: OrderTimeoutJobData) {
    const { masterOrderId, subOrderId, storeId, isEmergency } = data;

    const masterOrder = await this.masterOrderModel.findById(masterOrderId);
    if (!masterOrder) return;

    const subOrder = masterOrder.storeOrders.find(
      (so) => so._id.toString() === subOrderId,
    );
    if (!subOrder || subOrder.status !== 'awaiting_store_acceptance') {
      return;
    }

    // Atomic update to cancelled due to timeout
    await this.masterOrderModel.updateOne(
      { _id: masterOrderId },
      {
        $set: {
          'storeOrders.$[elem].status': 'cancelled',
          'storeOrders.$[elem].cancellationReason': 'STORE_ACCEPTANCE_TIMEOUT',
          'storeOrders.$[elem].updatedAt': new Date(),
        },
      },
      { arrayFilters: [{ 'elem._id': new Types.ObjectId(subOrderId) }] },
    );

    // Emit real-time WebSocket alerts
    this.deliveryGateway.server
      ?.to(`store:${storeId}`)
      .emit('ORDER_TIMED_OUT', { masterOrderId, subOrderId });
    this.deliveryGateway.server
      ?.to(`order:${masterOrderId}`)
      .emit('SUB_ORDER_STATUS_CHANGED', {
        subOrderId,
        status: 'cancelled',
        reason: isEmergency
          ? 'Store did not respond to emergency request in time. Rerouting options available.'
          : 'Store did not accept the order in time.',
      });

    this.logger.warn(
      `[SLA Worker] Sub-order ${subOrderId} auto-cancelled due to merchant SLA timeout.`,
    );
  }
}
