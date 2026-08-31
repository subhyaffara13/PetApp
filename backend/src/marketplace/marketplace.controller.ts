import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('marketplace')
@UseGuards(OptionalJwtAuthGuard)
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('config')
  async getConfig() {
    return {
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    };
  }

  @Get('shops')
  async getShops(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('query') query?: string,
    @Query('lang') lang?: string,
  ) {
    return this.marketplaceService.getShops(
      lat ? parseFloat(lat) : 32.794,
      lon ? parseFloat(lon) : 34.9896,
      query,
      lang || 'en',
    );
  }

  @Get('shops/:id')
  async getShop(@Param('id') id: string) {
    return this.marketplaceService.getShopWithProducts(id);
  }

  @Post('orders')
  async createOrder(@Body() orderDto: any) {
    return this.marketplaceService.createOrder(orderDto);
  }

  @Get('orders')
  async listOrders(@Query('customerId') customerId?: string) {
    return this.marketplaceService.getOrders(customerId);
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string) {
    return this.marketplaceService.getOrder(id);
  }

  @Post('orders/:id/payment-confirm')
  async confirmOrderPayment(@Param('id') id: string, @Body() body: { paymentIntentId?: string }) {
    return this.marketplaceService.confirmOrderPayment(id, body.paymentIntentId);
  }

  /** Creates a Stripe PaymentIntent and returns the clientSecret for the frontend Elements form */
  @Post('payment-intent')
  async createPaymentIntent(@Body() body: { amount: number; currency?: string }) {
    return this.marketplaceService.createPaymentIntent(body.amount, body.currency || 'ils');
  }

  @Post('shops/:shopId/products')
  async addProduct(@Param('shopId') shopId: string, @Body() body: any) {
    return this.marketplaceService.addProduct(shopId, body);
  }

  @Post('products/:productId')
  async updateProduct(@Param('productId') productId: string, @Body() body: any) {
    return this.marketplaceService.updateProduct(productId, body);
  }

  @Get('products/:productId/delete')
  async deleteProduct(@Param('productId') productId: string) {
    return this.marketplaceService.deleteProduct(productId);
  }
}

