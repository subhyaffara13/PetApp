import { Injectable } from '@nestjs/common';
import { StoreOrderStatus, DeliveryMode } from '../delivery.types';

@Injectable()
export class OrderStateMachineService {
  private static readonly VALID_TRANSITIONS: Record<
    StoreOrderStatus,
    StoreOrderStatus[]
  > = {
    created: ['awaiting_store_acceptance', 'cancelled'],
    awaiting_store_acceptance: ['store_preparing', 'cancelled', 'failed'],
    store_preparing: ['ready_for_pickup', 'cancelled', 'failed'],
    ready_for_pickup: [
      'courier_assigned',
      'out_for_delivery',
      'cancelled',
      'failed',
    ],
    courier_assigned: ['out_for_delivery', 'cancelled', 'failed'],
    out_for_delivery: ['delivered', 'failed'],
    delivered: [],
    cancelled: [],
    failed: [],
  };

  /**
   * Validates if state transition is strictly allowed
   */
  public canTransition(
    current: StoreOrderStatus,
    target: StoreOrderStatus,
  ): boolean {
    const allowed = OrderStateMachineService.VALID_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  /**
   * Checks if this transition should trigger automated DaaS courier dispatch
   */
  public shouldTriggerDaaS(
    status: StoreOrderStatus,
    deliveryMode: DeliveryMode,
  ): boolean {
    return deliveryMode === 'daas_on_demand' && status === 'ready_for_pickup';
  }
}
