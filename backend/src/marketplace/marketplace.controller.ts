import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateMarketplaceOrderDto,
  AddProductDto,
  UpdateProductDto,
} from './dto/marketplace.dto';

@Controller('marketplace')
@UseGuards(OptionalJwtAuthGuard)
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    return this.marketplaceService.handleStripeWebhook(signature, req.rawBody);
  }

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
    @Query('country') country?: string,
  ) {
    return this.marketplaceService.getShops(
      lat ? parseFloat(lat) : 32.794,
      lon ? parseFloat(lon) : 34.9896,
      query,
      lang || 'en',
      country,
    );
  }

  @Get('shops/:id')
  async getShop(@Param('id') id: string) {
    return this.marketplaceService.getShopWithProducts(id);
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  async createOrder(@Body() orderDto: CreateMarketplaceOrderDto, @Req() req: any) {
    const userId = req.user.id;
    return this.marketplaceService.createOrder({ ...orderDto, customerId: userId });
  }

  @Get('orders/my-purchases')
  @UseGuards(JwtAuthGuard)
  async getMyPurchases(@Req() req: any) {
    const userId = req.user.id;
    return this.marketplaceService.getMyPurchases(userId);
  }

  @Get('orders')
  async listOrders(
    @Query('customerId') customerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.marketplaceService.getOrders(customerId, pageNum, limitNum);
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string) {
    return this.marketplaceService.getOrder(id);
  }

  @Post('orders/:id/payment-confirm')
  async confirmOrderPayment(
    @Param('id') id: string,
    @Body() body: { paymentIntentId?: string },
  ) {
    return this.marketplaceService.confirmOrderPayment(
      id,
      body.paymentIntentId,
    );
  }

  /** Creates a Stripe PaymentIntent and returns the clientSecret for the frontend Elements form */
  @Post('payment-intent')
  async createPaymentIntent(
    @Body() body: { amount: number; currency?: string },
  ) {
    return this.marketplaceService.createPaymentIntent(
      body.amount,
      body.currency || 'ils',
    );
  }

  @Post('checkout/mock')
  async mockCheckout(@Body() body: any, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub || 'anonymous';
    return {
      success: true,
      transactionId: `mock_tx_${Date.now()}`,
      amount: body.amount,
      type: body.type || 'checkout',
      shelterId: body.shelterId,
      shelterName: body.shelterName,
      userId,
      timestamp: new Date().toISOString(),
      message: 'Mock payment processed successfully',
    };
  }

  @Post('shops/:shopId/products')
  @UseGuards(JwtAuthGuard)
  async addProduct(@Param('shopId') shopId: string, @Body() body: AddProductDto) {
    return this.marketplaceService.addProduct(shopId, body);
  }

  @Post('products/:productId')
  @UseGuards(JwtAuthGuard)
  async updateProduct(
    @Param('productId') productId: string,
    @Body() body: UpdateProductDto,
  ) {
    return this.marketplaceService.updateProduct(productId, body);
  }

  @Delete('products/:productId')
  @UseGuards(JwtAuthGuard)
  async deleteProductHttp(@Param('productId') productId: string) {
    return this.marketplaceService.deleteProduct(productId);
  }
}
