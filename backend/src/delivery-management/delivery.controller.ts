import { Controller, Post, Get, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('api')
@UseGuards(OptionalJwtAuthGuard)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('orders')
  async createOrder(@Body() dto: any) {
    return this.deliveryService.createOrder(dto);
  }

  @Get('stores/claimable')
  async getClaimableStores() {
    return this.deliveryService.getClaimableStores();
  }

  @Post('stores/claim')
  async claimStore(@Body() body: { storeId: string; ownerEmail?: string }) {
    return this.deliveryService.claimStore(body.storeId, body.ownerEmail);
  }

  @Post('support/contact')
  async submitSupportContact(@Body() body: { name: string; email: string; category: string; message: string }) {
    return this.deliveryService.handleSupportContact(body);
  }

  @Get('stores/nearby')
  async getNearbyStores(
    @Query('lon') lon: string,
    @Query('lat') lat: string,
    @Query('maxDistance') maxDistance?: string,
  ) {
    return this.deliveryService.findNearbyStores(
      parseFloat(lon || '34.9895'),
      parseFloat(lat || '32.794'),
      maxDistance ? parseInt(maxDistance) : 15000,
    );
  }

  @Get('store-portal/orders/live')
  async getLiveStoreOrders(@Query('storeId') storeId: string) {
    return this.deliveryService.getLiveStoreOrders(storeId || 'all');
  }

  @Post('store-portal/orders/cancel-all')
  async cancelAllOrders() {
    return this.deliveryService.cancelAllOrders();
  }

  @Patch('store-portal/orders/:masterOrderId/sub-orders/:subOrderId/action')
  async executeStoreAction(
    @Param('masterOrderId') masterOrderId: string,
    @Param('subOrderId') subOrderId: string,
    @Body() body: { action: 'accept' | 'ready_for_pickup' | 'decline'; prepMinutes?: number },
  ) {
    return this.deliveryService.executeStoreAction(
      masterOrderId,
      subOrderId,
      body.action,
      body.prepMinutes,
    );
  }

  @Patch('store-portal/settings/busy-mode')
  async toggleBusyMode(@Body() body: { storeId: string; isBusyMode: boolean }) {
    return this.deliveryService.toggleBusyMode(body.storeId, body.isBusyMode);
  }

  @Get('store-portal/:storeId/products')
  async getStoreProducts(@Param('storeId') storeId: string) {
    return this.deliveryService.getStoreProducts(storeId);
  }

  @Post('store-portal/:storeId/products')
  async createStoreProduct(@Param('storeId') storeId: string, @Body() body: any) {
    return this.deliveryService.createStoreProduct(storeId, body);
  }

  @Patch('store-portal/:storeId/products/:productId')
  async updateStoreProduct(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Body() body: any,
  ) {
    return this.deliveryService.updateStoreProduct(storeId, productId, body);
  }

  @Get('store-portal/:storeId/reports')
  async getStoreFinancialReports(@Param('storeId') storeId: string) {
    return this.deliveryService.getStoreFinancialReports(storeId);
  }

  @Get('customer/:customerId/orders')
  async getCustomerOrders(@Param('customerId') customerId: string) {
    return this.deliveryService.getCustomerOrders(customerId);
  }

  @Post('webhooks/daas/:provider')
  async handleCourierWebhook(@Body() body: any) {
    return this.deliveryService.handleCourierWebhook(body);
  }
}
